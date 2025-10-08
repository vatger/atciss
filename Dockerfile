FROM python:3.14.0-slim@sha256:9dc4ef3e628432af2237d1418908f5c6d4528e9f776aaa6e7c95c18854c86e48 AS base

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
