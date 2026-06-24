FROM python:3.14.6-slim@sha256:f54c5f39326ef06c7cb7f5fc57025aa5b7a1d3367cea42d8b5d3c8e082338ec5 AS base

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
