{
  description = "VATSIM Germany ATCISS";

  nixConfig = {
    extra-substituters = [ "https://atciss.cachix.org" ];
    extra-trusted-public-keys = [ "atciss.cachix.org-1:5YxebJMhVUPoSmO/f+KYNp2fDa6f8navGGWzCSKCI0A=" ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
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
      url = "github:fpletz/poetry2nix";
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

    nix-fast-build = {
      url = "github:Mic92/nix-fast-build";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
      poetry2nix,
      napalm,
      pre-commit-hooks,
      nix-fast-build,
      ...
    }@inputs:
    {
      overlays.default = nixpkgs.lib.composeManyExtensions [
        poetry2nix.overlays.default
        napalm.overlays.default
        (
          final: _prev:
          let
            python = final.python311;
            overrides = final.poetry2nix.overrides.withDefaults (
              pyfinal: pyprev: {
                vatsim = pyprev.vatsim.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                pynotam = pyprev.pynotam.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                pydantic-xml = pyprev.pydantic-xml.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                types-xmltodict = pyprev.types-xmltodict.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                fastapi-async-sqlalchemy = pyprev.fastapi-async-sqlalchemy.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                frozenlist = pyprev.frozenlist.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.expandvars ];
                });
                pyrasite = pyprev.pyrasite.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                asgi-correlation-id = pyprev.asgi-correlation-id.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                  postPatch = ''
                    substituteInPlace pyproject.toml \
                      --replace 'poetry.masonry.api' 'poetry.core.masonry.api'
                  '';
                });
                taskiq = pyprev.taskiq.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                taskiq-dependencies = pyprev.taskiq-dependencies.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                taskiq-fastapi = pyprev.taskiq-fastapi.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                taskiq-redis = pyprev.taskiq-redis.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                gitignore-parser = pyprev.gitignore-parser.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
              }
            );
          in
          {
            atciss =
              (final.poetry2nix.mkPoetryApplication {
                inherit python overrides;
                projectDir = final.poetry2nix.cleanPythonSources { src = ./.; };
                pythonImportCheck = [ "atciss" ];
                groups = [ ];
                checkgroups = [ ];
              }).overrideAttrs
                (_: {
                  postInstall = ''
                    install -Dt $out/share/atciss alembic.ini
                    cp -r alembic $out/share/atciss
                  '';
                });

            atciss-dev = final.poetry2nix.mkPoetryEnv {
              inherit python overrides;
              pyproject = ./pyproject.toml;
              poetrylock = ./poetry.lock;
              extraPackages = ps: [ ps.ipython ];
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

            atciss-contrib = final.runCommand "atciss-contrib" { } ''
              cp -r ${self}/contrib $out
            '';
          }
        )
      ];

      nixosModules.default = import ./nixos/module.nix;
    }
    // (flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ self.overlays.default ];
        };
        inherit (pkgs) lib;
        nodejs = pkgs.nodejs_20;
      in
      {
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
              Entrypoint = [ "atciss" ];
            };
          };

          frontend-image = pkgs.dockerTools.buildLayeredImage {
            name = "ghcr.io/vatger/atciss/atciss-frontend";
            tag = "latest";
            contents = with pkgs; [
              nginx
              fakeNss
            ];
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
                      set $worker_metrics_target "http://worker:9000/metrics/";

                      location / {
                        try_files $uri /index.html;
                      }

                      location /api/ {
                        proxy_pass $backend_target;
                      }

                      location /metrics {
                        proxy_pass $backend_target;
                      }

                      location /worker/metrics {
                        proxy_pass $worker_metrics_target;
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
            ++ [ nodejs ]
            ++ (with pkgs; [
              nil
              pyright
              poetry
              ruff
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
            + (pre-commit-hooks.lib.${system}.run {
              src = ./.;
              hooks = {
                nixfmt = {
                  enable = true;
                  package = pkgs.nixfmt-rfc-style;
                };
                statix.enable = true;
                nil.enable = true;
                eslint = {
                  enable = true;
                  settings = {
                    binPath = pkgs.writeShellScript "eslint" ''./atciss-frontend/node_modules/.bin/eslint "$@"'';
                    extensions = "\\.(j|t)sx?";
                  };
                };
                # pylint.enable = true;
                pylint.settings.binPath = "${pkgs.atciss-dev}/bin/pylint";
                # pyright.enable = true;
                ruff = {
                  enable = true;
                  entry = lib.mkForce "${pkgs.atciss-dev}/bin/ruff check --fix";
                };
              };
            }).shellHook;
        });

        apps =
          let
            mkCIApp = name: packages: script: {
              type = "app";
              program = lib.getExe (
                pkgs.writeScriptBin name ''
                  #!${pkgs.stdenv.shell}
                  export PATH="${lib.makeBinPath ([ pkgs.atciss-dev ] ++ packages)}"
                  ${script}
                ''
              );
            };
          in
          {
            pylint = mkCIApp "pylint" [ ] ''
              pylint -f colorized -r y atciss
            '';
            ruff = mkCIApp "ruff" [ ] ''
              ruff check --output-format github atciss
            '';
            format = mkCIApp "ruff" [ ] ''
              ruff format --check --diff
            '';
            eslint =
              mkCIApp "eslint"
                [
                  nodejs
                  pkgs.bash
                ]
                ''
                  (cd atciss-frontend && npm install && npm run lint)
                '';
            build =
              mkCIApp "nix-fast-build"
                [
                  nix-fast-build.packages.${system}.nix-fast-build
                  pkgs.git
                ]
                ''
                  nix-fast-build --no-nom --skip-cached
                '';
          };

        formatter = pkgs.nixfmt-rfc-style;

        checks = lib.optionalAttrs pkgs.stdenv.isLinux {
          nixosTest = import ./nixos/test.nix { inherit inputs pkgs; };
        };
      }
    ));
}
