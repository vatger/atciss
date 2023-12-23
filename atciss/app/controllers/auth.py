"""Application controllers - metar."""
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Annotated, Dict, List, Optional

from loguru import logger
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import JWTError, jwt
from pydantic import TypeAdapter
from sqlmodel import select
from fastapi_async_sqlalchemy import db

from ..utils.aiohttp_client import AiohttpClient
from ...config import settings
from ..models import User

router = APIRouter()

ALGORITHM = "HS256"


@dataclass
class AuthResponse:
    scopes: List[str]
    token_type: str
    expires_in: int
    access_token: str
    refresh_token: Optional[str]


@dataclass
class OAuthData:
    token_valid: bool


@dataclass
class UserIdNameData:
    id: Optional[str]
    name: Optional[str]


@dataclass
class UserRatingData:
    id: int
    short: str
    long: str


@dataclass
class UserPersonalData:
    name_first: str
    name_last: str
    name_full: str
    email: str
    country: UserIdNameData


@dataclass
class UserVatsimData:
    region: UserIdNameData
    division: UserIdNameData
    subdivision: UserIdNameData
    rating: UserRatingData
    pilotrating: UserRatingData


@dataclass
class UserData:
    cid: str
    personal: UserPersonalData
    vatsim: UserVatsimData
    oauth: OAuthData


@dataclass
class UserResponse:
    data: UserData


@dataclass
class AuthInfoModel:
    client_id: str
    auth_url: str


@dataclass
class AuthModel:
    jwt: str


@dataclass
class AuthRequest:
    code: str


def create_jwt(cid: str, refresh_token: Optional[str]) -> str:
    to_encode: Dict[str, str | Optional[str] | datetime | bool] = {
        "sub": cid,
        "refresh_token": refresh_token,
        "admin": cid in settings.ADMINS,
    }
    expire = datetime.now(UTC) + timedelta(days=7.5)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


oauth2_scheme = OAuth2AuthorizationCodeBearer(
    f"{settings.VATSIM_AUTH_URL}/oauth/authorize",
    f"{settings.VATSIM_AUTH_URL}/oauth/token",
    scheme_name="VATSIM",
)


async def get_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        cid: Optional[str] = payload.get("sub")
        if cid is None:
            raise credentials_exception

        user: Optional[User] = None
        async with db():
            stmt = select(User).where(User.cid == int(cid))
            user = await db.session.scalar(stmt)

        if user is None:
            raise HTTPException(500, "User not not found in database")

    except JWTError as exc:
        raise credentials_exception from exc

    return user


async def get_controller(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    user = await get_user(token)

    if user.rating not in ["S2", "S3", "C1", "C3", "I1", "I3", "SUP", "ADM"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, f"not allowed with rating {user.rating}")

    return user


async def get_admin(token: Annotated[str, Depends(oauth2_scheme)]) -> User:
    user = await get_user(token)
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])

    if not user or not payload.get("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    return user


@router.get(
    "/auth",
)
async def auth_config() -> AuthInfoModel:
    return AuthInfoModel(
        client_id=settings.VATSIM_CLIENT_ID,
        auth_url=settings.VATSIM_AUTH_URL,
    )


@router.post(
    "/auth",
)
async def auth(req: AuthRequest) -> AuthModel:
    """Authenticate with VATSIM."""
    async with AiohttpClient.get() as aiohttp_client:
        res = await aiohttp_client.post(
            f"{settings.VATSIM_AUTH_URL}/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": settings.VATSIM_CLIENT_ID,
                "client_secret": settings.VATSIM_CLIENT_SECRET,
                "redirect_uri": settings.VATSIM_REDIRECT_URL,
                "code": req.code,
            },
        )

        if res.status >= 400:
            logger.warning(f"Not authorized: {await res.text()}")
            raise HTTPException(401, "Not authorised by VATSIM")

        auth_response = TypeAdapter(AuthResponse).validate_python(await res.json())

        res = await aiohttp_client.get(
            f"{settings.VATSIM_AUTH_URL}/api/user",
            headers={"Authorization": f"Bearer {auth_response.access_token}"},
        )
        user_response_json = await res.json()
        user_response = TypeAdapter(UserResponse).validate_python(user_response_json)

        if not user_response.data.oauth.token_valid:
            logger.warning(f"No valid token: {await res.text()}")
            raise HTTPException(401, "No valid token from VATSIM")

    if user_response.data.vatsim.rating.short in ("INAC", "SUS"):
        raise HTTPException(401, "Account inactive or suspended")

    async with db():
        cid = int(user_response.data.cid)
        user = await db.session.get(User, cid)

        user_data = {
            "name": user_response.data.personal.name_full,
            "rating": user_response.data.vatsim.rating.short,
        }

        if user is None:
            user = User(cid=cid, **user_data)
        else:
            for k, v in user_data.items():
                setattr(user, k, v)

        db.session.add(user)

        await db.session.commit()

    return AuthModel(jwt=create_jwt(user_response.data.cid, auth_response.refresh_token))
