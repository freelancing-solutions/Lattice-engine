# Lattice CLI (Monorepo)

This `cli/` folder contains two CLI implementations (Node.js and Python) with a shared environment.

Structure:
- `shared/`: Common configuration and docs
- `node-cli/`: NPM-based CLI tool (`lattice`)
- `python-cli/`: Python-based CLI tool (`lattice`)

Both tools read `.lattice/config.json` at the repository root for defaults, including `api.endpoint`.

Packaging:
- Node: Uses `package.json` `bin` field to expose `lattice` executable
- Python: Uses `pyproject.toml` console scripts to expose `lattice`