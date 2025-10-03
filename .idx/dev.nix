{ pkgs, ... }: {
  # Specifies the Nixpkgs channel for packages.
  channel = "stable-23.11";

  # Add any required system tools or packages for your app (e.g., Node.js).
  packages = [
    pkgs.nodejs_20
    pkgs.python3
  ];

  # This section is crucial for web previews.
  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [
          "python3"
          "-m"
          "http.server"
          # "npm"
          # "install"
          # "run"
          # "start"
          # "--"
          # "--port"
          "$PORT"
          "--bind"
          # "--host"
          "0.0.0.0"
        ];
        manager = "web";
        # Optionally specify a directory if your app isn't at the root
         cwd = "mgh website";
      };
    };
  };
}
