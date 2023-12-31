FROM python:3.11-slim@sha256:23f52205321f806c2cc742cefbf837e0d25101388c043e860c7817985230565c as base

FROM base as requirements-stage
WORKDIR /tmp
RUN pip install poetry
COPY ./pyproject.toml ./poetry.lock* /tmp/
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

FROM base as dev
WORKDIR /code
COPY --from=requirements-stage /tmp/requirements.txt /code/requirements.txt
RUN apt-get update && apt-get install git -y
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
ENTRYPOINT ["python3", "-c", "from atciss.cli import cli; cli()"]

FROM dev as production
COPY . /code
