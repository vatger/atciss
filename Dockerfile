FROM python:3.15.0b1-slim@sha256:89a7e6cfaeb87cc9884cf07c481a760b11e501b3dca0b31fa25d9360ab1e12f9 AS base

FROM base AS requirements-stage
WORKDIR /tmp
RUN pip install poetry
COPY ./pyproject.toml ./poetry.lock* /tmp/

FROM requirements-stage AS requirements-dev
RUN poetry export --with=dev -f requirements.txt --output requirements.txt --without-hashes

FROM requirements-stage AS requirements-prod
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

FROM base AS dev
WORKDIR /code
COPY --from=requirements-dev /tmp/requirements.txt /code/requirements.txt
RUN apt-get update && apt-get install git -y
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
ENTRYPOINT ["python3", "-m", "atciss.cli"]

FROM base AS production
WORKDIR /code
COPY --from=requirements-prod /tmp/requirements.txt /code/requirements.txt
RUN apt-get update && apt-get install git -y
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY . /code
ENTRYPOINT ["python3", "-m", "atciss.cli"]
