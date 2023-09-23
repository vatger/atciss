FROM python:3.11-slim as requirements-stage
WORKDIR /tmp
RUN pip install poetry
COPY ./pyproject.toml ./poetry.lock* /tmp/
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

FROM python:3.11-slim as dev
WORKDIR /code
COPY --from=requirements-stage /tmp/requirements.txt /code/requirements.txt
RUN apt-get update && apt-get install git -y
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
USER 1000
ENTRYPOINT ["python3", "-c", "from atciss.cli import cli; cli()"]

FROM dev as production
COPY . /code
