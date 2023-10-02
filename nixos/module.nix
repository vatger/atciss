{
  lib,
  config,
  pkgs,
  ...
}: let
  cfg = config.services.atciss;
  ATCISS_DEBUG = toString cfg.debug;
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
      debug = lib.mkOption {
        type = lib.types.bool;
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

    services.postgresql = {
      enable = true;
      ensureDatabases = ["atciss"];
      ensureUsers = [
        {
          name = "atciss";
          ensurePermissions = {
            "DATABASE atciss" = "ALL PRIVILEGES";
          };
        }
      ];
    };

    systemd.services.atciss = {
      wantedBy = ["multi-user.target"];

      environment = {
        inherit ATCISS_DEBUG;
        ATCISS_BASE_URL = "https://${cfg.host}";
        ATCISS_DATABASE_DSN = "postgresql+asyncpg://localhost/atciss?host=/run/postgresql";
      };

      serviceConfig = {
        ExecStartPre = "${pkgs.atciss}/bin/alembic upgrade head";
        ExecStart = "${pkgs.atciss}/bin/atciss serve";
        DynamicUser = true;
        User = "atciss";
        Restart = "always";
        RestartSec = "1s";
        EnvironmentFile = cfg.environmentFile;
        WorkingDirectory = "${pkgs.atciss}/share/atciss";
      };
    };

    systemd.services.atciss-worker = {
      wantedBy = ["multi-user.target"];

      environment = {
        inherit ATCISS_DEBUG;
        ACTISS_DEBUG = cfg.debug;
        ATCISS_DATABASE_DSN = "postgresql+asyncpg://localhost/atciss?host=/run/postgresql";
      };

      serviceConfig = {
        ExecStart = "${pkgs.atciss}/bin/celery -A atciss worker --loglevel=INFO";
        DynamicUser = true;
        User = "atciss";
        Restart = "always";
        RestartSec = "1s";
        StateDirectory = "atciss-worker";
        WorkingDirectory = "/var/lib/atciss-worker";
      };
    };

    systemd.services.atciss-beat = {
      wantedBy = ["multi-user.target"];

      serviceConfig = {
        ExecStart = "${pkgs.atciss}/bin/celery -A atciss beat --loglevel=INFO";
        DynamicUser = true;
        Restart = "always";
        RestartSec = "1s";
        StateDirectory = "atciss-beat";
        WorkingDirectory = "/var/lib/atciss-beat";
      };
    };
  };
}
