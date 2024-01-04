{
  description = "VATSIM Germany ATCISS";

  nixConfig = {
    extra-substituters = [
      "https://atciss.cachix.org"
    ];
    extra-trusted-public-keys = [
      "atciss.cachix.org-1:5YxebJMhVUPoSmO/f+KYNp2fDa6f8navGGWzCSKCI0A="
    ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.11";
    flake-utils.url = "github:numtide/flake-utils";

    pre-commit-hooks = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        nixpkgs-stable.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };

    poetry2nix = {
      url = "github:nix-community/poetry2nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };

    napalm = {
      url = "github:nix-community/napalm";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
    poetry2nix,
    napalm,
    pre-commit-hooks,
    ...
  } @ inputs:
    {
      overlays.default = nixpkgs.lib.composeManyExtensions [
        poetry2nix.overlays.default
        napalm.overlays.default
        (final: prev: let
          python = final.python311;
          overrides = final.poetry2nix.overrides.withDefaults (pyfinal: pyprev: {
            pynotam = pyprev.pynotam.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.poetry];
            });
            pydantic-xml = pyprev.pydantic-xml.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.poetry];
            });
            types-xmltodict = pyprev.types-xmltodict.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.setuptools];
            });
            fastapi-async-sqlalchemy = pyprev.fastapi-async-sqlalchemy.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.setuptools];
            });
            frozenlist = pyprev.frozenlist.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.expandvars];
            });
            pyrasite = pyprev.pyrasite.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.setuptools];
            });
            alembic = pyprev.alembic.overridePythonAttrs (old: {
              meta = old.meta // {priority = -1;};
            });
            celery = pyprev.celery.overridePythonAttrs (old: {
              meta = old.meta // {priority = -1;};
            });
            asgi-correlation-id = pyprev.asgi-correlation-id.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.poetry-core];
              postPatch = ''
                substituteInPlace pyproject.toml \
                  --replace 'poetry.masonry.api' 'poetry.core.masonry.api'
              '';
            });
          });
        in {
          atciss =
            (final.poetry2nix.mkPoetryApplication {
              inherit python overrides;
              projectDir = final.poetry2nix.cleanPythonSources {src = ./.;};
              pythonImportCheck = ["atciss"];
              groups = [];
              checkgroups = [];
            })
            .overrideAttrs (attrs: {
              postInstall = ''
                install -Dt $out/share/atciss alembic.ini
                cp -r alembic $out/share/atciss
              '';
            });

          atciss-dev = final.poetry2nix.mkPoetryEnv {
            inherit python overrides;
            pyproject = ./pyproject.toml;
            poetrylock = ./poetry.lock;
            extraPackages = ps: [ps.ipython];
          };

          atciss-frontend = final.napalm.buildPackage ./atciss-frontend {
            NODE_ENV = "production";
            nodejs = final.nodejs_20;
            npmCommands = [
              "npm install --include=dev --nodedir=${final.nodejs_20}/include/node --loglevel verbose --ignore-scripts"
              "npm run build"
            ];
            installPhase = ''
              mv build $out
            '';
          };

          atciss-contrib = final.runCommand "atciss-contrib" {} ''
            cp -r ${self}/contrib $out
          '';
        })
      ];

      nixosModules.default = import ./nixos/module.nix;
    }
    // (flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [self.overlays.default];
        };
      in {
        legacyPackages = pkgs;

        packages = {
          default = pkgs.atciss;
          backend = pkgs.atciss;
          contrib = pkgs.atciss-contrib;
          frontend = pkgs.atciss-frontend;

          backend-image = pkgs.dockerTools.buildLayeredImage {
            name = "ghcr.io/vatger/atciss/atciss-backend";
            tag = "latest";

            contents = with pkgs; [
              cacert
              tzdata
              atciss
            ];

            config = {
              Env = [
                "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
                "PYTHONDONTWRITEBYTECODE=1"
                "PYTHONUNBUFFERED=1"
                "ATCISS_CONTRIB_PATH=${pkgs.atciss-contrib}"
              ];
              WorkingDir = "/share/atciss";
            };
          };

          frontend-image = pkgs.dockerTools.buildLayeredImage {
            name = "ghcr.io/vatger/atciss/atciss-frontend";
            tag = "latest";
            contents = with pkgs; [nginx fakeNss];
            extraCommands = "mkdir -p var/log/nginx tmp/nginx/client_body";
            config = {
              Entrypoint = [
                "nginx"
                "-c"
                (pkgs.writeText "nginx.conf" ''
                  user nobody nobody;
                  daemon off;
                  error_log /dev/stdout info;
                  pid /dev/null;
                  events {}
                  http {
                    access_log /dev/stdout;
                    server {
                      resolver 127.0.0.11;

                      listen 80;
                      root ${pkgs.atciss-frontend}/;
                      include ${pkgs.mailcap}/etc/nginx/mime.types;

                      set $backend_target "http://backend:8000";
                      set $flower_target "http://flower:5555";

                      location / {
                        try_files $uri /index.html;
                      }

                      location /api/ {
                        proxy_pass $backend_target;
                      }

                      location /admin/flower {
                        proxy_pass $flower_target;
                      }

                      location /metrics {
                        proxy_pass $backend_target;
                      }
                    }
                  }
                '')
              ];
            };
          };
        };

        devShells.default = pkgs.atciss-dev.env.overrideAttrs (oldAttrs: {
          nativeBuildInputs =
            oldAttrs.nativeBuildInputs
            ++ (with pkgs; [
              nil
              poetry
              ruff
              nodejs_20
              curl
              docker-compose
            ]);
          shellHook =
            ''
              export POETRY_HOME=${pkgs.poetry}
              export POETRY_BINARY=${pkgs.poetry}/bin/poetry
              export POETRY_VIRTUALENVS_IN_PROJECT=true
              export PYTHONPATH=${pkgs.atciss-dev}/${pkgs.atciss-dev.sitePackages}
              unset SOURCE_DATE_EPOCH
            ''
            + self.checks.${system}.pre-commit-check.shellHook;
        });

        apps = let
          mkCIApp = name: packages: script: {
            type = "app";
            program = toString (pkgs.writeScript name ''
              export PATH="${pkgs.lib.makeBinPath (
                [pkgs.atciss-dev] ++ packages
              )}"
              ${script}
            '');
          };
        in {
          pylint = mkCIApp "pylint" [] ''
            echo "[nix][lint] Run atciss pylint checks."
            pylint -f colorized -r y atciss
          '';
          ruff = mkCIApp "ruff" [pkgs.ruff] ''
            echo "[nix][lint] Run atciss ruff checks."
            ruff check atciss
          '';
          format = mkCIApp "ruff" [pkgs.ruff] ''
            echo "[nix][lint] Run atciss black checks."
            ruff format --check --diff atciss
          '';
        };

        formatter = pkgs.alejandra;

        checks = {
          pre-commit-check = pre-commit-hooks.lib.${system}.run {
            src = ./.;
            settings.pylint.binPath = "${pkgs.atciss-dev}/bin/pylint";
            hooks = {
              alejandra.enable = true;
              # statix.enable = true;
              nil.enable = true;
              eslint.enable = true;
              # pylint.enable = true;
              # pyright.enable = true;
              ruff.enable = true;
            };
          };
        };

        failingChecks = {
          # FIXME: needs kvm on builder
          nixosTest = import ./nixos/test.nix {inherit inputs pkgs;};
        };
      }
    ));
}
