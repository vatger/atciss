{
  inputs,
  pkgs,
}:
let
  testing = import "${inputs.nixpkgs}/nixos/lib/testing-python.nix" {
    inherit pkgs;
    inherit (pkgs) system;
  };
in
testing.makeTest {
  name = "atciss";

  nodes = {
    machine =
      { pkgs, ... }:
      {
        imports = [ inputs.self.nixosModules.default ];
        nixpkgs.overlays = [ inputs.self.overlays.default ];

        environment.systemPackages = with pkgs; [ jq ];

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
    machine.succeed("curl http://localhost/api/ready | jq -e '.status == \"ok\"'")
  '';
}
