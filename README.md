# ATCISS

The backend is packaged with [poetry](https://python-poetry.org/).
A package build, docker image build and development shell is available
using [Nix Flakes](https://nixos.wiki/wiki/Flakes) and
[direnv](https://direnv.net/).

## Run the API

```
atciss serve
```

## Run the worker

```
celery -A atciss worker
```

Automatic scheduling of tasks:
```
celery -A atciss beat
```

## Run the frontend

```
npm start
```

## Build docker images

```
nix build .#frontend-image
nix build .#backend-image
```

## Migrations

```
alembic revision --autogenerate -m comment
alembic upgrade head
```
