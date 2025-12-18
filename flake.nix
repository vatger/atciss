{
  description = "VATSIM Germany ATCISS";

  nixConfig = {
    extra-substituters = [ "https://atciss.cachix.org" ];
    extra-trusted-public-keys = [ "atciss.cachix.org-1:5YxebJMhVUPoSmO/f+KYNp2fDa6f8navGGWzCSKCI0A=" ];
  };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-parts.url = "github:hercules-ci/flake-parts";
    systems.url = "github:nix-systems/default";

    pre-commit-hooks = {
      url = "github:cachix/pre-commit-hooks.nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
      };
    };

    pyproject-nix = {
      url = "github:nix-community/pyproject.nix";
      inputs = {
        nixpkgs.follows = "nixpkgs";
      };
    };

    uv2nix = {
      url = "github:adisbladis/uv2nix";
      inputs.pyproject-nix.follows = "pyproject-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    pyproject-build-systems = {
      url = "github:pyproject-nix/build-system-pkgs";
      inputs = {
        pyproject-nix.follows = "pyproject-nix";
        uv2nix.follows = "uv2nix";
        nixpkgs.follows = "nixpkgs";
      };
    };

    napalm = {
      url = "github:nix-community/napalm";
      inputs = {
        nixpkgs.follows = "nixpkgs";
      };
    };

    nix-fast-build = {
      url = "github:Mic92/nix-fast-build";
    };
  };

  outputs =
    inputs:
    inputs.flake-parts.lib.mkFlake { inherit inputs; } {
      systems = import inputs.systems;
      imports = [ inputs.flake-parts.flakeModules.easyOverlay ];

      flake.nixosModules.default = import ./nixos/module.nix;

      perSystem =
        {
          config,
          pkgs,
          lib,
          system,
          ...
        }:
        let
          workspace = inputs.uv2nix.lib.workspace.loadWorkspace { workspaceRoot = ./.; };
          overlay = workspace.mkPyprojectOverlay {
            sourcePreference = "wheel";
          };

          nodejs = pkgs.nodejs_24;
          python = pkgs.python314;

          pythonSet =
            (pkgs.callPackage inputs.pyproject-nix.build.packages {
              inherit python;
            }).overrideScope
              (
                lib.composeManyExtensions [
                  inputs.pyproject-build-systems.overlays.default
                  overlay
                  (final: prev: {
                    eaup = prev.eaup.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { poetry-core = [ ]; })
                      ];
                    });
                    gitignore-parser = prev.gitignore-parser.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { setuptools = [ ]; })
                      ];
                    });
                    loa = prev.loa.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { hatchling = [ ]; })
                      ];
                    });
                    vatsim = prev.vatsim.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { hatchling = [ ]; })
                      ];
                    });
                    metar = prev.metar.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { setuptools = [ ]; })
                      ];
                    });
                    pynotam = prev.pynotam.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { poetry-core = [ ]; })
                      ];
                    });
                    pyrasite = prev.pyrasite.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { setuptools = [ ]; })
                      ];
                    });
                    stringcase = prev.stringcase.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { setuptools = [ ]; })
                      ];
                    });
                    watchdog = prev.watchdog.overrideAttrs (old: {
                      nativeBuildInputs = old.nativeBuildInputs ++ [
                        (final.resolveBuildSystem { setuptools = [ ]; })
                      ];
                    });
                  })
                ]
              );
        in
        {
          formatter = pkgs.nixfmt-rfc-style;
          checks = lib.optionalAttrs pkgs.stdenv.isLinux {
            nixosTest = import ./nixos/test.nix { inherit inputs pkgs; };
          };
          overlayAttrs = {
            inherit (config.packages) atciss atciss-frontend atciss-contrib;
          };

          packages = {
            nix-fast-build = inputs.nix-fast-build.packages.${system}.default;
            atciss = (pythonSet.mkVirtualEnv "atciss-env" workspace.deps.default).overrideAttrs (old: {
              venvIgnoreCollisions = [ "bin/fastapi" ];
              postInstall = (old.preInstall or "") + ''
                mkdir -p $out/share/atciss
                cp -R ${./alembic} $out/share/atciss/alembic
                cp -R ${./alembic.ini} $out/share/atciss/alembic.ini
              '';
            });
            atciss-frontend = inputs.napalm.legacyPackages.${system}.buildPackage ./atciss-frontend {
              NODE_ENV = "production";
              inherit nodejs;
              npmCommands = [
                "npm install --include=dev --nodedir=${pkgs.nodejs_22}/include/node --loglevel verbose --ignore-scripts"
                "npm run build"
              ];
              installPhase = ''
                mv build $out
              '';
            };

            atciss-contrib = pkgs.runCommand "atciss-contrib" { } ''
              cp -r ${inputs.self}/contrib $out
            '';
            backend-image = pkgs.dockerTools.buildLayeredImage {
              name = "ghcr.io/vatger/atciss/atciss-backend";
              tag = "latest";

              contents = with pkgs; [
                cacert
                tzdata
                config.packages.atciss
              ];

              config = {
                Env = [
                  "SSL_CERT_FILE=${pkgs.cacert}/etc/ssl/certs/ca-bundle.crt"
                  "PYTHONDONTWRITEBYTECODE=1"
                  "PYTHONUNBUFFERED=1"
                  "ATCISS_CONTRIB_PATH=${config.packages.atciss-contrib}"
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
                        root ${config.packages.atciss-frontend}/;
                        include ${pkgs.mailcap}/etc/nginx/mime.types;

                        set $backend_target "http://backend:8000";
                        set $worker_metrics_target "http://worker:9000/metrics/";

                        location / {
                          try_files $uri /index.html;
                        }

                        location /api/ {
                          proxy_pass $backend_target;
                        }

                        location /static/ {
                          alias /srv/atciss-static/;
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
              editableOverlay = workspace.mkEditablePyprojectOverlay {
                root = "$REPO_ROOT";
              };
              editablePythonSet = pythonSet.overrideScope (
                lib.composeManyExtensions [
                  editableOverlay
                  (final: prev: {
                    atciss = prev.atciss.overrideAttrs (old: {
                      # Hatchling (our build system) has a dependency on the `editables` package when building editables.
                      #
                      # In normal Python flows this dependency is dynamically handled, and doesn't need to be explicitly declared.
                      # This behaviour is documented in PEP-660.
                      #
                      # With Nix the dependency needs to be explicitly declared.
                      nativeBuildInputs =
                        old.nativeBuildInputs
                        ++ final.resolveBuildSystem {
                          editables = [ ];
                        };
                    });
                  })
                ]
              );
              virtualenv =
                (editablePythonSet.mkVirtualEnv "atciss-dev-env" workspace.deps.all).overrideAttrs
                  (_old: {
                    venvIgnoreCollisions = [ "bin/fastapi" ];
                  });
              commonPackages = [
                pkgs.curl
                nodejs
                virtualenv
                pkgs.uv
              ];
            in
            {
              ci = pkgs.mkShell {
                packages = commonPackages ++ [
                  inputs.nix-fast-build.packages.${system}.nix-fast-build
                  pkgs.git
                  pkgs.cachix
                ];
              };
              impure = pkgs.mkShell {
                packages = [
                  python
                  pkgs.uv
                ];
                shellHook = ''
                  unset PYTHONPATH
                '';
              };

              default = pkgs.mkShell {
                packages = commonPackages;
                env = {
                  # Don't create venv using uv
                  UV_NO_SYNC = "1";

                  # Force uv to use Python interpreter from venv
                  UV_PYTHON = "${virtualenv}/bin/python";

                  # Prevent uv from downloading managed Python's
                  UV_PYTHON_DOWNLOADS = "never";

                  PYTHONPATH = ".:${virtualenv}/${python.sitePackages}";
                };

                shellHook = ''
                  export REPO_ROOT=$(git rev-parse --show-toplevel)
                ''
                + (inputs.pre-commit-hooks.lib.${system}.run {
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
                    pylint.settings.binPath = "${virtualenv}/bin/pylint";
                    # pyright.enable = true;
                    ruff = {
                      enable = true;
                      entry = lib.mkForce "${virtualenv}/bin/ruff check --fix";
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
        };
    };
}
