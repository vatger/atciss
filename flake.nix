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
      url = "github:nix-community/poetry2nix/pull/1290/head";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        flake-utils.follows = "flake-utils";
      };
    };

    napalm = {
      url = "github:nix-community/napalm/pull/58/head";
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
  }:
    {
      overlays.default = nixpkgs.lib.composeManyExtensions [
        poetry2nix.overlay
        napalm.overlays.default
        (final: prev: let
          python = final.python311;
          overrides = final.poetry2nix.overrides.withDefaults (pyfinal: pyprev: {
            pynotam = pyprev.pynotam.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.poetry];
            });
            pydantic-settings = pyprev.pydantic-settings.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.hatchling];
            });
            gunicorn = pyprev.gunicorn.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.packaging];
            });
            pyaixm = pyprev.pyaixm.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.setuptools];
              propagatedBuildInputs = (old.propagatedBuildInputs or []) ++ [pyfinal.pyyaml pyfinal.lxml];
            });
            astral = pyprev.astral.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.poetry];
            });
            types-pyasn1 = pyprev.types-pyasn1.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.setuptools];
            });
            types-python-jose = pyprev.types-python-jose.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.setuptools];
            });
            sqlalchemy-stubs = pyprev.sqlalchemy-stubs.overridePythonAttrs (old: {
              nativeBuildInputs = (old.nativeBuildInputs or []) ++ [pyfinal.setuptools];
            });
            ruff = null;
          });
        in {
          atciss = final.poetry2nix.mkPoetryApplication {
            inherit python overrides;
            projectDir = final.poetry2nix.cleanPythonSources {src = ./.;};
            pythonImportCheck = ["atciss"];
          };

          atciss-dev = final.poetry2nix.mkPoetryEnv {
            inherit python overrides;
            pyproject = ./pyproject.toml;
            poetrylock = ./poetry.lock;
            editablePackageSources = {
              app = "./atciss";
            };
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
        })
      ];

      nixosModules.default = {
        lib,
        config,
        pkgs,
        ...
      }: let
        cfg = config.services.atciss;
      in {
        options = {
          services.atciss = {
            enable = lib.mkEnableOption "ATCISS";
            host = lib.mkOption {
              type = lib.types.str;
            };
            tls = lib.mkOption {
              type = lib.types.bool;
              default = true;
            };
            environmentFile = lib.mkOption {
              type = lib.types.path;
            };
          };
        };

        config = lib.mkIf cfg.enable {
          services.nginx = {
            enable = true;
            virtualHosts."${cfg.host}" = {
              forceSSL = cfg.tls;
              enableACME = cfg.tls;
              locations."/" = {
                root = pkgs.atciss-frontend;
                extraConfig = ''
                  try_files $uri /index.html;
                '';
              };
              locations."/openapi.json" = {
                proxyPass = "http://localhost:8000";
              };
              locations."/api" = {
                proxyPass = "http://localhost:8000";
              };
            };
          };

          systemd.services.atciss = {
            wantedBy = ["multi-user.target"];

            serviceConfig = {
              ExecStart = "${pkgs.atciss}/bin/atciss serve";
              DynamicUser = true;
              Restart = "always";
              RestartSec = "1s";
              EnvironmentFile = cfg.environmentFile;
            };
          };
        };
      };
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
          frontend = pkgs.atciss-frontend;

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
              pathsToLink = ["/bin"];
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
              Entrypoint = ["/bin/atciss"];
            };
          };
        };

        devShells.default = pkgs.atciss-dev.env.overrideAttrs (oldAttrs: {
          nativeBuildInputs =
            oldAttrs.nativeBuildInputs
            ++ (with pkgs; [
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
              unset SOURCE_DATE_EPOCH
            ''
            + self.checks.${system}.pre-commit-check.shellHook;
        });

        apps = {
          pylint = {
            type = "app";
            program = toString (pkgs.writeScript "lint" ''
              export PATH="${pkgs.lib.makeBinPath [
                pkgs.atciss-dev
              ]}"
              echo "[nix][lint] Run atciss pylint checks."
              pylint -f colorized -r y atciss
            '');
          };
          ruff = {
            type = "app";
            program = toString (pkgs.writeScript "lint" ''
              export PATH="${pkgs.lib.makeBinPath [
                pkgs.atciss-dev
                pkgs.ruff
              ]}"
              echo "[nix][lint] Run atciss ruff checks."
              ruff
            '');
          };
          black = {
            type = "app";
            program = toString (pkgs.writeScript "lint" ''
              export PATH="${pkgs.lib.makeBinPath [
                pkgs.atciss-dev
              ]}"
              echo "[nix][lint] Run atciss black checks."
              black --check atciss
            '');
          };
          backend-dev = {
            type = "app";
            program = toString (pkgs.writeScript "backend-dev" ''
              export PATH="${pkgs.lib.makeBinPath [pkgs.atciss-dev]}"
              echo "[nix][backend-dev] Run atciss backend in dev mode."
              uvicorn --factory atciss.app.asgi:get_application --reload
            '');
          };
        };

        formatter = pkgs.alejandra;

        checks = {
          pre-commit-check = pre-commit-hooks.lib.${system}.run {
            src = ./.;
            hooks = {
              alejandra.enable = true;
              statix.enable = true;
              nil.enable = true;
              black.enable = true;
            };
          };
          nixosTest = let
            testing = import "${nixpkgs}/nixos/lib/testing-python.nix" {inherit system pkgs;};
          in
            testing.makeTest {
              name = "atciss";

              nodes = {
                machine = {pkgs, ...}: {
                  imports = [self.nixosModules.default];
                  nixpkgs.overlays = [self.overlays.default];

                  services.redis.servers."".enable = true;

                  services.atciss = {
                    enable = true;
                    host = "localhost";
                    environmentFile = "/dev/null";
                    tls = false;
                  };
                };
              };

              testScript = ''
                machine.start()
                machine.wait_for_unit("nginx.service")
                machine.wait_for_open_port(80)
                machine.wait_for_unit("atciss.service")
                machine.wait_for_open_port(8000)
                machine.succeed("curl http://localhost/api/ready | ${pkgs.jq}/bin/jq -e '.status == \"ok\"'")
              '';
            };
        };
      }
    ));
}
