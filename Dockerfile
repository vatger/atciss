FROM python:3.11-slim@sha256:53d6284a40eae6b625f22870f5faba6c54f2a28db9027408f4dee111f1e885a2 as base

FROM base as requirements-stage
WORKDIR /tmp
RUN pip install poetry
COPY ./pyproject.toml ./poetry.lock* /tmp/

FROM requirements-stage as requirements-dev
RUN poetry export --with=dev -f requirements.txt --output requirements.txt --without-hashes

FROM requirements-stage as requirements-prod
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

FROM base as dev
WORKDIR /code
COPY --from=requirements-dev /tmp/requirements.txt /code/requirements.txt
RUN apt-get update && apt-get install git -y
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
ENTRYPOINT ["python3", "-m", "atciss.cli"]

FROM dev as production
WORKDIR /code
COPY --from=requirements-prod /tmp/requirements.txt /code/requirements.txt
RUN apt-get update && apt-get install git -y
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY . /code
ENTRYPOINT ["python3", "-m", "atciss.cli"]
