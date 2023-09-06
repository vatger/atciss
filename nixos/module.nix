{
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
}
