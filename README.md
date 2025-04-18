# ATCISS [atʼkiss]

ATCISS is an acronym for the Air Traffic Control Information Support System that
is used by the Deutsche Flugsicherung (DFS) in German airspace. This is an
implementation that aims to replicate the real ATCISS with information and data
from the [VATSIM](https://vatsim.net/) network for use by the controllers of
[VATSIM Germany](https://vatsim-germany.org/).

## Screenshots

![map](./screenshots/map.png)

![atis-afw](./screenshots/atis-afw.png)

![ac-data](./screenshots/ac-data.png)

![notam](./screenshots/notam.png)

![loa](./screenshots/loa.png)

## Development
The backend is packaged with [poetry](https://python-poetry.org/).
A package build, docker image build and development shell is available
using [Nix Flakes](https://nixos.wiki/wiki/Flakes) and
[direnv](https://direnv.net/). A full development environment using
[docker-compose](https://docs.docker.com/compose/) is also availabe.

### Run the API

```
atciss serve
```

### Run the worker & task scheduler

```
atciss worker
```

```
atciss scheduler
```

### Run the frontend

```
npm start
```

### Build docker images

```
nix build .#frontend-image
nix build .#backend-image
```

### Migrations

```
alembic revision --autogenerate -m comment
alembic upgrade head
```
