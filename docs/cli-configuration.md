CLI Configuration and Environment Variables

Overview
This guide explains how the Node CLI reads configuration, which environment variables it respects, and provides a sample .lattice/config.json.

Configuration Sources and Precedence
- Environment overrides: `LATTICE_API_URL` (highest precedence)
- Repo config: `.lattice/config.json` in your project root
- Shared defaults: `cli/shared/config.json`

Environment Variables
- `LATTICE_API_URL`: Override backend base URL (e.g., `https://api.project-lattice.site`)
- `NO_PROMPT`: Set to `1` to disable interactive prompts; same as `--non-interactive`
- `HTTP_PROXY` / `HTTPS_PROXY`: Standard Node.js proxy variables for outbound HTTP(S). Example: `http://proxy.company:8080`.

Sample .lattice/config.json
Place this at the root of your repository under `.lattice/config.json`.

{
  "api": {
    "endpoint": "https://api.project-lattice.site",
    "token": "your-token-here"
  },
  "deploy": {
    "wait": true
  }
}

Notes
- `api.token` is optional; if omitted, requests are made without Authorization headers.
- `deploy.wait` sets the default for `lattice deploy --wait` if the flag is not provided.
- The CLI reads additional flags via command options; see `cli/README.md` for usage.

Related Docs
- See `cli/README.md` for command examples, dry-run mode, and global flags.