# ATCISS

The backend is packaged with [poetry](https://python-poetry.org/).
A package build, docker image build and development shell is available
using [Nix Flakes](https://nixos.wiki/wiki/Flakes) and
[direnv](https://direnv.net/).

## Run the API

```
poetry run atciss
```

## Build docker image

```
nix build .#image
```
