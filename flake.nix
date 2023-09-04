{
  description = "VATSIM Germany ATCISS";

  nixConfig = {
    substituters = [
      "https://cache.nixos.org"
      "https://atciss.cachix.org"
    ];
    trusted-public-keys = [
      "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
      "atciss.cachix.org-1:5YxebJMhVUPoSmO/f+KYNp2fDa6f8navGGWzCSKCI0A="
    ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.05";
    flake-utils.url = "github:numtide/flake-utils";
    poetry2nix = {
      url = "github:nix-community/poetry2nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };
  };

  outputs = { self, nixpkgs, flake-utils, poetry2nix, ... }: {
    overlays.default = nixpkgs.lib.composeManyExtensions [
      poetry2nix.overlay
      (final: prev: let
        python = final.python311;
        overrides = prev.poetry2nix.overrides.withDefaults (final: prev: {
          pynotam = prev.pynotam.overridePythonAttrs (old: {
            nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ prev.poetry ];
          });
          pydantic-settings = prev.pydantic-settings.overridePythonAttrs (old: {
            nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ final.hatchling ];
          });
          hatchling = prev.hatchling.overridePythonAttrs (old: rec {
            version = "1.18.0";
            src = prev.fetchPypi {
              inherit (old) pname;
              inherit version;
              hash = "sha256-UOmcMRDOCvw/e9ut/xxxwXdY5HZzHCdgeUDPpmhkico=";
            };

            propagatedBuildInputs = old.propagatedBuildInputs ++ [ final.trove-classifiers ];
          });
          trove-classifiers = prev.trove-classifiers.overridePythonAttrs (old: rec {
            version = "2023.8.7";
            src = prev.fetchPypi {
              inherit (old) pname;
              inherit version;
              hash = "sha256-yfKgqF1UXlNi6Wfk8Gn1b939kSFeIv+kjGb7KDUhMZo=";
            };
          });
          gunicorn = prev.gunicorn.overridePythonAttrs (old: {
            nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ final.packaging ];
          });
          pyaixm = prev.pyaixm.overridePythonAttrs (old: {
            nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ final.setuptools ];
            propagatedBuildInputs = (old.propagatedBuildInputs or []) ++ [ final.pyyaml final.lxml ];
          });
          astral = prev.astral.overridePythonAttrs (old: {
            nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ final.poetry ];
          });
          types-pyasn1 = prev.types-pyasn1.overridePythonAttrs (old: {
            nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ final.setuptools ];
          });
          types-python-jose = prev.types-python-jose.overridePythonAttrs (old: {
            nativeBuildInputs = (old.nativeBuildInputs or []) ++ [ final.setuptools ];
          });
        });
      in {
        atciss = prev.poetry2nix.mkPoetryApplication {
          inherit python overrides;
          projectDir = prev.poetry2nix.cleanPythonSources { src = ./.; };
          pythonImportCheck = [ "atciss" ];
        };
        atciss-dev = prev.poetry2nix.mkPoetryEnv {
          inherit python overrides;
          projectDir = ./.;
          editablePackageSources = {
            app = ./.;
          };
          extraPackages = ps: [ ps.ipython ];
        };
      })
    ];
  } // (flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs {
        inherit system;
        overlays = [ self.overlays.default ];
      };
    in
    {
      packages = {
        default = pkgs.atciss;

        image = pkgs.dockerTools.buildImage {
          name = "atciss";
          tag = "latest";

          copyToRoot = pkgs.buildEnv {
            name = "image-root";
            paths = [
              pkgs.cacert
              pkgs.tzdata
              pkgs.atciss
            ];
            pathsToLink = [ "/bin" ];
          };

          uid = 1000;
          gid = 1000;

          config = {
            Env = [
              "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
              "PYTHONDONTWRITEBYTECODE=1"
              "PYTHONUNBUFFERED=1"
            ];
            WorkingDir = "/workspace";
            Entrypoint = [ "/bin/atciss" ];
          };
        };
      };

      devShells.default = pkgs.atciss-dev.env.overrideAttrs (oldAttrs: {
        nativeBuildInputs = oldAttrs.nativeBuildInputs ++ (with pkgs; [
          poetry
          nodejs
          curl
        ]);
        shellHook = ''
          export POETRY_HOME=${pkgs.poetry}
          export POETRY_BINARY=${pkgs.poetry}/bin/poetry
          export POETRY_VIRTUALENVS_IN_PROJECT=true
          unset SOURCE_DATE_EPOCH
        '';
      });

      apps = {
        lint = {
          type = "app";
          program = toString (pkgs.writeScript "lint" ''
            export PATH="${pkgs.lib.makeBinPath [
                pkgs.atciss-dev
                pkgs.git
            ]}"
            echo "[nix][lint] Run atciss pylint checks."
            pylint -f colorized -r y atciss
            echo "[nix][lint] Run atciss black checks."
            black --check atciss
          '');
        };
        mypy = {
          type = "app";
          program = toString (pkgs.writeScript "mypy" ''
            export PATH="${pkgs.lib.makeBinPath [
                pkgs.atciss-dev
                pkgs.git
            ]}"
            echo "[nix][mypy] Run atciss mypy checks."
            mypy atciss
          '');
        };
        backend-dev = {
          type = "app";
          program = toString (pkgs.writeScript "backend-dev" ''
            export PATH="${pkgs.lib.makeBinPath [ pkgs.atciss-dev ]}"
            echo "[nix][backend-dev] Run atciss backend in dev mode."
            uvicorn --factory atciss.app.asgi:get_application --reload
          '');
        };
      };
    }
  ));
}
