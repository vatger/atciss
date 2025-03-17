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
            python = final.python312;
            overrides = final.poetry2nix.overrides.withDefaults (
              pyfinal: pyprev: {
                asgi-correlation-id = pyprev.asgi-correlation-id.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                  postPatch = ''
                    substituteInPlace pyproject.toml \
                      --replace-fail 'poetry.masonry.api' 'poetry.core.masonry.api'
                  '';
                });
                click = pyprev.click.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.flit-core ];
                });
                eaup = pyprev.eaup.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                fastapi-async-sqlalchemy = pyprev.fastapi-async-sqlalchemy.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                frozenlist = pyprev.frozenlist.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.expandvars ];
                });
                gitignore-parser = pyprev.gitignore-parser.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                isort = pyprev.isort.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.hatch-vcs ];
                });
                izulu = pyprev.izulu.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                loa = pyprev.loa.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.hatch-vcs ];
                });
                loguru = pyprev.loguru.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.flit-core ];
                });
                pycron = pyprev.pycron.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                pydantic-xml = pyprev.pydantic-xml.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                pynotam = pyprev.pynotam.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.poetry-core ];
                });
                pyrasite = pyprev.pyrasite.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                pyright = pyprev.pyright.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                sqlmodel = pyprev.sqlmodel.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.pdm-backend ];
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
                types-xmltodict = pyprev.types-xmltodict.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.setuptools ];
                });
                urllib3 = pyprev.urllib3.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.hatch-vcs ];
                });
                vatsim = pyprev.vatsim.overridePythonAttrs (old: {
                  nativeBuildInputs = (old.nativeBuildInputs or [ ]) ++ [ pyfinal.hatch-vcs ];
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
              nodejs = final.nodejs_22;
              npmCommands = [
                "npm install --include=dev --nodedir=${final.nodejs_22}/include/node --loglevel verbose --ignore-scripts"
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
        nodejs = pkgs.nodejs_22;
      in
      {
        packages = {
          nix-fast-build = inputs.nix-fast-build.packages.${system}.default;

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

        devShells =
          let
            commonPackages = [
              (pkgs.poetry.override { python3 = pkgs.python312; })
              pkgs.ruff
              pkgs.pyright
              pkgs.curl
              nodejs
              pkgs.atciss-dev
            ];
          in
          {
            ci = pkgs.mkShell {
              packages = commonPackages ++ [
                nix-fast-build.packages.${system}.nix-fast-build
                pkgs.git
                pkgs.cachix
              ];
            };

            default = pkgs.mkShell {
              packages = commonPackages;
              shellHook =
                ''
                  export POETRY_VIRTUALENVS_IN_PROJECT=true
                  export PYTHONPATH=${pkgs.atciss-dev}/${pkgs.atciss-dev.sitePackages}
                  unset SOURCE_DATE_EPOCH
                ''
                + (pre-commit-hooks.lib.${system}.run {
                  src = ./.;
                  hooks = {
                    nixfmt-rfc-style.enable = true;
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
                      entry = lib.mkForce "${lib.getExe pkgs.ruff} check --fix";
                    };
                  };
                }).shellHook;
            };
          };

        apps =
          let
            mkCIApp = name: script: {
              type = "app";
              program = toString (pkgs.writers.writeBash name script);
            };
          in
          {
            pylint = mkCIApp "pylint" ''
              nix develop .#ci -c pylint -f colorized -r y atciss
            '';
            ruff = mkCIApp "ruff" ''
              nix develop .#ci -c ruff check --output-format github atciss
            '';
            format = mkCIApp "ruff" ''
              nix develop .#ci -c ruff format --check --diff
            '';
            eslint = mkCIApp "eslint" ''
              nix develop .#ci -c ${lib.getExe pkgs.bash} -c '(cd atciss-frontend && npm install && npm run lint)'
            '';
          };

        formatter = pkgs.nixfmt-rfc-style;

        checks = lib.optionalAttrs pkgs.stdenv.isLinux {
          nixosTest = import ./nixos/test.nix { inherit inputs pkgs; };
        };
      }
    ));
}
