# Lattice CLI (Python)

A Python implementation of the Lattice CLI.

Install locally for development:

```
cd cli/python-cli
pip install -e .
```

Usage:
- `lattice-py auth login --username <u> --password <p>`
- `lattice-py project init --repo <owner/name>`
- `lattice-py spec generate --description "text" --save`
- `lattice-py mutation propose --spec <name> --change <path|text> --auto-apply`

Configuration sources:
- `.lattice/config.json` at repository root
- `LATTICE_API_URL` environment variable (override)
- `cli/shared/config.json` fallback

Default API endpoint: `https://api.project-lattice.site`

Environment variables:
- `LATTICE_API_URL` - Override API base URL
- `NO_PROMPT=1` - Disable interactive prompts
- `HTTP_PROXY` / `HTTPS_PROXY` - Use a proxy for outbound HTTP(S) requests