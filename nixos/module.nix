{ lib
, config
, pkgs
, ...
}:
let
  cfg = config.services.atciss;
  ATCISS_DEBUG =
    if cfg.debug
    then "1"
    else "0";
in
{
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
      debug = lib.mkOption {
        type = lib.types.bool;
        default = true;
      };
    };
  };

  config = lib.mkIf cfg.enable {
    services.nginx = {
      enable = true;
      virtualHosts."${cfg.host}" = {
        forceSSL = cfg.tls;
        enableACME = cfg.tls;
        locations = {
          "/" = {
            root = pkgs.atciss-frontend;
            extraConfig = ''
              try_files $uri /index.html;
            '';
          };
          "/openapi.json" = {
            proxyPass = "http://localhost:8000";
          };
          "/api" = {
            proxyPass = "http://localhost:8000";
          };
        };
      };
    };

    services.postgresql = {
      enable = true;
      ensureDatabases = [ "atciss" ];
      extraPlugins = with config.services.postgresql.package.pkgs; [ postgis ];
      ensureUsers = [
        {
          name = "atciss";
          ensureDBOwnership = true;
        }
      ];
    };

    systemd.services = {
      postgresql-create-postgis = {
        requiredBy = [ "atciss.service" ];
        before = [ "atciss.service" ];
        after = [ "postgresql.service" ];
        serviceConfig = {
          Type = "oneshot";
          User = "postgres";
        };
        environment.PSQL = "psql --port=${toString config.services.postgresql.port}";
        path = [ config.services.postgresql.package ];
        script = ''
          $PSQL atciss -c 'CREATE EXTENSION IF NOT EXISTS postgis'
        '';
      };

      atciss = {
        wantedBy = [ "multi-user.target" ];
        requires = [ "postgresql.service" "redis.service" ];
        after = [ "postgresql-create-postgis.service" ];
        environment = {
          inherit ATCISS_DEBUG;
          ATCISS_BASE_URL = "https://${cfg.host} ";
          ATCISS_DATABASE_DSN = "postgresql+asyncpg://localhost/atciss?host=/run/postgresql";
          ATCISS_CONTRIB_PATH = pkgs.atciss-contrib;
        };
        serviceConfig = {
          ExecStart = "${pkgs.atciss}/bin/atciss serve";
          DynamicUser = true;
          User = "atciss";
          Restart = "always";
          RestartSec = "1s";
          EnvironmentFile = cfg.environmentFile;
          WorkingDirectory = "${pkgs.atciss}/share/atciss";
        };
      };

      atciss-worker = {
        wantedBy = [ "multi-user.target" ];
        requires = [ "postgresql.service" "redis.service" ];
        environment = {
          inherit ATCISS_DEBUG;
          ATCISS_DATABASE_DSN = "postgresql+asyncpg://localhost/atciss?host=/run/postgresql";
          ATCISS_CONTRIB_PATH = pkgs.atciss-contrib;
        };
        serviceConfig = {
          ExecStart = "${pkgs.atciss}/bin/atciss worker";
          DynamicUser = true;
          User = "atciss";
          Restart = "always";
          RestartSec = "1s";
          StateDirectory = "atciss-worker";
          WorkingDirectory = "/var/lib/atciss-worker";
        };
      };

      atciss-scheduler = {
        wantedBy = [ "multi-user.target" ];
        requires = [ "redis.service" ];
        serviceConfig = {
          ExecStart = "${pkgs.atciss}/bin/atciss scheduler";
          DynamicUser = true;
          Restart = "always";
          RestartSec = "1s";
        };
      };
    };
  };
}
