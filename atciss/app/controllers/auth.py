"""Application controllers - metar."""
from dataclasses import dataclass
from datetime import datetime, timedelta
import logging
from typing import Annotated, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import JWTError, jwt
from pydantic import TypeAdapter

from ..utils.aiohttp_client import AiohttpClient
from ...config import settings

logger = logging.getLogger(__name__)

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
class UserData:
    cid: str
    oauth: OAuthData
    # personal":{
    #   "name_first":"Web",
    #   "name_last":"Team",
    #   "name_full":"Web Team",
    #   "email":"web@vatsim.net",
    #   "country":{
    #      "id":"AU",
    #      "name":"Australia"
    # vatsim:
    #   "division":{
    #      "id":"PAC",
    #      "name":"Australia (VATPAC)"
    #   },
    #   "region":{
    #      "id":"APAC",
    #      "name":"Asia Pacific"
    #   },
    #   "subdivision":{
    #      "id":null,
    #      "name":null
    #   }


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
    to_encode: Dict[str, str | Optional[str] | datetime] = {
        "sub": cid,
        "refresh_token": refresh_token,
    }
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


oauth2_scheme = OAuth2AuthorizationCodeBearer(
    f"{settings.VATSIM_AUTH_URL}/oauth/authorize",
    f"{settings.VATSIM_AUTH_URL}/oauth/token",
    scheme_name="VATSIM",
)


async def get_cid(token: Annotated[str, Depends(oauth2_scheme)]) -> str:
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
    except JWTError as exc:
        raise credentials_exception from exc
    return cid


@router.get(
    "/auth",
    tags=["user"],
)
async def auth_config() -> AuthInfoModel:
    return AuthInfoModel(
        client_id=settings.VATSIM_CLIENT_ID,
        auth_url=settings.VATSIM_AUTH_URL,
    )


@router.post(
    "/auth",
    tags=["user"],
)
async def auth(req: AuthRequest) -> AuthModel:
    """Get METAR for airport."""
    aioclient = AiohttpClient.get()

    res = await aioclient.post(
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
        raise HTTPException(401, "Not Authorised by VATSIM")

    auth_response = TypeAdapter(AuthResponse).validate_python(await res.json())

    res = await aioclient.get(
        f"{settings.VATSIM_AUTH_URL}/api/user",
        headers={"Authorization": f"Bearer {auth_response.access_token}"},
    )
    user_response = TypeAdapter(UserResponse).validate_python(await res.json())

    if not user_response.data.oauth.token_valid:
        logger.warn(f"Not authorized: {await res.text()}")
        raise HTTPException(401, "Not Authorised by VATSIM")

    return AuthModel(
        jwt=create_jwt(user_response.data.cid, auth_response.refresh_token)
    )
