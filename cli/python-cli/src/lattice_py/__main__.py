import argparse
import json
import os
from pathlib import Path


DEFAULT_API_URL = "https://api.project-lattice.site"


def load_config() -> dict:
    env_url = os.getenv("LATTICE_API_URL")
    if env_url:
        return {"apiUrl": env_url, "token": None}

    # .lattice/config.json at repo root
    repo_cfg = Path.cwd() / ".lattice" / "config.json"
    if repo_cfg.exists():
        try:
            data = json.loads(repo_cfg.read_text(encoding="utf-8"))
            api_url = data.get("api", {}).get("endpoint", DEFAULT_API_URL)
            token = data.get("api", {}).get("token")
            return {"apiUrl": api_url, "token": token}
        except Exception:
            pass

    # Fallback to cli/shared/config.json
    # Fallback to cli/shared/config.json
    shared_cfg = Path(__file__).resolve().parents[4] / "shared" / "config.json"
    if shared_cfg.exists():
        try:
            data = json.loads(shared_cfg.read_text(encoding="utf-8"))
            api_url = data.get("api", {}).get("endpoint", DEFAULT_API_URL)
            return {"apiUrl": api_url, "token": None}
        except Exception:
            pass

    return {"apiUrl": DEFAULT_API_URL, "token": None}


def http_request(method: str, path_seg: str, body: dict | None = None, api_url_override: str | None = None, use_auth: bool = True) -> tuple[int, dict | str]:
    import requests
    cfg = load_config()
    api_url = api_url_override or cfg["apiUrl"]
    url = f"{api_url}{path_seg}"
    headers = {"Accept": "application/json", "Content-Type": "application/json"}
    if use_auth and cfg.get("token"):
        headers["Authorization"] = f"Bearer {cfg['token']}"
    resp = requests.request(method, url, headers=headers, json=body)
    try:
        data = resp.json()
    except Exception:
        data = resp.text
    return resp.status_code, data


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="lattice-py", description="Lattice CLI (Python)")
    parser.add_argument("--api-url", dest="api_url", help="Override backend base URL")
    subparsers = parser.add_subparsers(dest="group")

    # auth login
    auth = subparsers.add_parser("auth", help="Authentication commands")
    auth_sub = auth.add_subparsers(dest="action")
    login = auth_sub.add_parser("login", help="Login to Lattice backend")
    login.add_argument("--username", required=True)
    login.add_argument("--password", required=True)

    # project init
    project = subparsers.add_parser("project", help="Project commands")
    proj_sub = project.add_subparsers(dest="action")
    init = proj_sub.add_parser("init", help="Initialize project in Lattice")
    init.add_argument("--repo", required=True, help="owner/name")

    # spec generate
    spec = subparsers.add_parser("spec", help="Spec commands")
    spec_sub = spec.add_subparsers(dest="action")
    gen = spec_sub.add_parser("generate", help="Generate spec from description")
    gen.add_argument("--description", required=True)
    gen.add_argument("--save", action="store_true")

    # mutation propose
    mut = subparsers.add_parser("mutation", help="Mutation commands")
    mut_sub = mut.add_subparsers(dest="action")
    prop = mut_sub.add_parser("propose", help="Propose mutation against a spec")
    prop.add_argument("--spec", required=True)
    prop.add_argument("--change", required=True)
    prop.add_argument("--metadata")
    prop.add_argument("--auto-apply", action="store_true")

    return parser


def save_token(token: str) -> None:
    try:
        repo_cfg = Path.cwd() / ".lattice" / "config.json"
        cfg = {}
        if repo_cfg.exists():
            cfg = json.loads(repo_cfg.read_text(encoding="utf-8"))
        cfg.setdefault("api", {})
        cfg["api"]["token"] = token
        (Path.cwd() / ".lattice").mkdir(parents=True, exist_ok=True)
        repo_cfg.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
        print("Saved auth token to .lattice/config.json")
    except Exception as e:
        print(f"Failed to save token: {e}")


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if not args.group:
        parser.print_help()
        return

    if args.group == "auth" and args.action == "login":
        status, data = http_request("POST", "/api/auth/login", {"username": args.username, "password": args.password}, args.api_url, use_auth=False)
        print(json.dumps(data, indent=2))
        token = (data or {}).get("token") or (data or {}).get("access_token")
        if token:
            save_token(token)
        return

    if args.group == "project" and args.action == "init":
        status, data = http_request("POST", "/api/projects/init", {"repo": args.repo}, args.api_url)
        print(json.dumps(data, indent=2))
        return

    if args.group == "spec" and args.action == "generate":
        status, data = http_request("POST", "/api/specs/generate", {"description": args.description, "save": bool(args.save)}, args.api_url)
        print(json.dumps(data, indent=2))
        return

    if args.group == "mutation" and args.action == "propose":
        status, data = http_request(
            "POST",
            "/api/mutations/propose",
            {
                "spec": args.spec,
                "change": args.change,
                "metadata": args.metadata or None,
                "autoApply": bool(args.auto_apply),
            },
            args.api_url,
        )
        print(json.dumps(data, indent=2))
        return

    parser.print_help()


if __name__ == "__main__":
    main()