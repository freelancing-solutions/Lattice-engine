import argparse
import json
import os
from pathlib import Path


DEFAULT_API_URL = "https://api.project-lattice.site"

# Friendly error helpers
def print_friendly_error(title: str, suggestions: list[str] | None = None, debug: str | None = None) -> None:
    print()
    print(title)
    if suggestions:
        print()
        print("What you can try:")
        for s in suggestions:
            print(f"- {s}")
    if debug:
        print()
        print("Technical details (for support):")
        print(debug)
    raise SystemExit(1)

def explain_http_failure(status: int, data: dict | str, context: dict | None = None) -> None:
    import json as _json
    context = context or {}
    base = context.get("apiUrl") or load_config().get("apiUrl")
    debug = data if isinstance(data, str) else _json.dumps(data, indent=2)
    if status == 0:
        return print_friendly_error(
            "We could not reach the Lattice server.",
            [
                "Check your internet connection.",
                f"Verify the server address: try visiting {base} in your browser.",
                "If the address is wrong, pass --api-url or set LATTICE_API_URL.",
                "Firewalls or VPNs can block requests; try disabling temporarily.",
            ],
            debug,
        )
    if status in (401, 403):
        return print_friendly_error(
            "You are not logged in or do not have access.",
            [
                "Run: lattice-py auth login --username <your email> --password <your password>.",
                "If using CI, set an auth token in .lattice/config.json or environment.",
                "Ensure your account has permission for the requested project or resource.",
            ],
            debug,
        )
    if status == 404:
        return print_friendly_error(
            "We could not find what you asked for.",
            [
                "Check for typos in names or IDs (e.g., mutation ID, spec name).",
                "List items first: lattice-py spec list or lattice-py mutation list.",
                "If pulling specs, ensure the filter matches what exists on the server.",
            ],
            debug,
        )
    if status in (400, 422):
        return print_friendly_error(
            "Something about the inputs looks off.",
            [
                "Re-run the command with required options (see lattice-py --help).",
                "Validate local JSON first: lattice-py spec validate --path <file>.",
                "If using filters, try simpler values to narrow down the issue.",
            ],
            debug,
        )
    if status >= 500:
        return print_friendly_error(
            "The server had a problem completing your request.",
            [
                "Try again in a few minutes.",
                "If it persists, open a support ticket with the details shown below.",
            ],
            debug,
        )
    return print_friendly_error("The request failed.", ["Retry the command or contact support."], debug)


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
    try:
        resp = requests.request(method, url, headers=headers, json=body, timeout=30)
        try:
            data = resp.json()
        except Exception:
            data = resp.text
        return resp.status_code, data
    except requests.exceptions.RequestException as e:
        return 0, {"error": str(e), "code": getattr(e, "errno", None)}


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
    auth_sub.add_parser("logout", help="Logout and clear local token")

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
    create = spec_sub.add_parser("create", help="Create a local spec file")
    create.add_argument("--name", required=True)
    create.add_argument("--template")
    create.add_argument("--description")
    validate = spec_sub.add_parser("validate", help="Validate a local spec JSON")
    validate.add_argument("--path", required=True)
    validate.add_argument("--strict", action="store_true")
    sync = spec_sub.add_parser("sync", help="Sync specs with backend")
    sync.add_argument("--direction", required=True, choices=["push", "pull"])
    sync.add_argument("--filter")
    lst = spec_sub.add_parser("list", help="List specs")
    lst.add_argument("--source", choices=["local", "remote", "all"], default="all")
    lst.add_argument("--filter")
    show = spec_sub.add_parser("show", help="Show a spec")
    show.add_argument("--name", required=True)
    show.add_argument("--source", choices=["local", "remote"], default="local")

    # mutation propose
    mut = subparsers.add_parser("mutation", help="Mutation commands")
    mut_sub = mut.add_subparsers(dest="action")
    prop = mut_sub.add_parser("propose", help="Propose mutation against a spec")
    prop.add_argument("--spec", required=True)
    prop.add_argument("--change", required=True)
    prop.add_argument("--metadata")
    prop.add_argument("--auto-apply", action="store_true")
    status = mut_sub.add_parser("status", help="Check mutation status")
    status.add_argument("--id", required=True)
    approve = mut_sub.add_parser("approve", help="Approve a mutation")
    approve.add_argument("--id", required=True)
    approve.add_argument("--note")
    reject = mut_sub.add_parser("reject", help="Reject a mutation")
    reject.add_argument("--id", required=True)
    reject.add_argument("--reason")
    mut_sub.add_parser("list", help="List mutations")
    showm = mut_sub.add_parser("show", help="Show mutation details")
    showm.add_argument("--id", required=True)

    # deploy
    deploy = subparsers.add_parser("deploy", help="Deployment commands")
    deploy.add_argument("--mutation-id", required=True)
    deploy.add_argument("--env", required=True)
    deploy.add_argument("--strategy", choices=["rolling", "blue-green", "canary"])
    deploy.add_argument("--wait", action="store_true")

    # risk
    risk = subparsers.add_parser("risk", help="Risk assessment")
    risk_sub = risk.add_subparsers(dest="action")
    assess = risk_sub.add_parser("assess", help="Assess mutation risk")
    assess.add_argument("--id", required=True)
    assess.add_argument("--policy")

    # mcp
    mcp = subparsers.add_parser("mcp", help="MCP server commands")
    mcp_sub = mcp.add_subparsers(dest="action")
    mcp_sub.add_parser("status", help="Show MCP status")
    syncm = mcp_sub.add_parser("sync", help="Sync MCP metadata")
    syncm.add_argument("--direction", required=True, choices=["push", "pull"])
    syncm.add_argument("--profile")

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
        print_friendly_error(
            "We could not save your login token.",
            [
                "Ensure this folder is writable: .lattice/ at your project root.",
                "On Windows, try running your terminal as Administrator.",
            ],
            str(e),
        )


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
    if args.group == "auth" and args.action == "logout":
        try:
            repo_cfg = Path.cwd() / ".lattice" / "config.json"
            cfg = {}
            if repo_cfg.exists():
                cfg = json.loads(repo_cfg.read_text(encoding="utf-8"))
            if cfg.get("api") and cfg["api"].get("token"):
                del cfg["api"]["token"]
            (Path.cwd() / ".lattice").mkdir(parents=True, exist_ok=True)
            repo_cfg.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
            print("Logged out. Token removed from .lattice/config.json")
        except Exception as e:
            print(f"Failed to logout: {e}")
        return

    if args.group == "project" and args.action == "init":
        status, data = http_request("POST", "/api/projects/init", {"repo": args.repo}, args.api_url)
        print(json.dumps(data, indent=2))
        return

    if args.group == "spec" and args.action == "generate":
        status, data = http_request("POST", "/api/specs/generate", {"description": args.description, "save": bool(args.save)}, args.api_url)
        print(json.dumps(data, indent=2))
        return
    if args.group == "spec" and args.action == "create":
        name = args.name
        specs_dir = Path.cwd() / ".lattice" / "specs"
        specs_dir.mkdir(parents=True, exist_ok=True)
        content = {"name": name, "version": "1.0.0", "description": args.description or "Spec created by Lattice CLI", "template": args.template or None}
        (specs_dir / f"{name}.json").write_text(json.dumps(content, indent=2), encoding="utf-8")
        print(f"Created spec at {specs_dir / f'{name}.json'}")
        return
    if args.group == "spec" and args.action == "validate":
        try:
            text = Path(args.path).read_text(encoding="utf-8")
            json.loads(text)
            print(json.dumps({"path": args.path, "valid": True}, indent=2))
        except Exception as e:
            print(json.dumps({"path": args.path, "valid": False, "error": str(e)}, indent=2))
            raise SystemExit(1)
        return
    if args.group == "spec" and args.action == "sync":
        if args.direction == "push":
            specs_dir = Path.cwd() / ".lattice" / "specs"
            specs = []
            if specs_dir.exists():
                for f in specs_dir.glob("*.json"):
                    try:
                        obj = json.loads(f.read_text(encoding="utf-8"))
                        specs.append({"name": f.stem, "content": obj})
                    except Exception:
                        pass
            status, data = http_request("POST", "/api/specs/sync/push", {"specs": specs}, args.api_url)
            print(json.dumps(data, indent=2))
        else:
            status, data = http_request("POST", "/api/specs/sync/pull", {"filter": args.filter} if args.filter else {}, args.api_url)
            print(json.dumps(data, indent=2))
            specs = (data or {}).get("specs") or []
            specs_dir = Path.cwd() / ".lattice" / "specs"
            specs_dir.mkdir(parents=True, exist_ok=True)
            for s in specs:
                name = s.get("name") or f"spec-{int(Path.cwd().stat().st_ctime)}"
                (specs_dir / f"{name}.json").write_text(json.dumps(s.get("content") or s, indent=2), encoding="utf-8")
        return
    if args.group == "spec" and args.action == "list":
        source = args.source
        filter_str = args.filter
        specs_dir = Path.cwd() / ".lattice" / "specs"
        local = []
        if specs_dir.exists():
            for f in specs_dir.glob("*.json"):
                name = f.stem
                if not filter_str or filter_str in name:
                    local.append({"name": name, "source": "local"})
        remote = []
        if source in ("remote", "all"):
            status, data = http_request("POST", "/api/specs/sync/pull", {"filter": filter_str} if filter_str else {}, args.api_url)
            remote = [{"name": (s or {}).get("name", "unknown"), "source": "remote"} for s in ((data or {}).get("specs") or [])]
        rows = local if source == "local" else remote if source == "remote" else local + remote
        print(json.dumps(rows, indent=2))
        return
    if args.group == "spec" and args.action == "show":
        name = args.name
        source = args.source
        if source == "local":
            file = Path.cwd() / ".lattice" / "specs" / f"{name}.json"
            if not file.exists():
                print(f"Spec not found: {file}")
                raise SystemExit(1)
            print(file.read_text(encoding="utf-8"))
        else:
            status, data = http_request("POST", "/api/specs/sync/pull", {"filter": name}, args.api_url)
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
    if args.group == "mutation" and args.action == "status":
        status, data = http_request("GET", f"/api/mutations/{args.id}", None, args.api_url)
        print(json.dumps(data, indent=2))
        return
    if args.group == "mutation" and args.action in ("approve", "reject"):
        body = {"id": args.id, "action": "approve" if args.action == "approve" else "reject"}
        if getattr(args, "note", None):
            body["note"] = args.note
        if getattr(args, "reason", None):
            body["note"] = args.reason
        status, data = http_request("POST", f"/api/approvals/{args.id}/respond", body, args.api_url)
        print(json.dumps(data, indent=2))
        return
    if args.group == "mutation" and args.action == "list":
        status, data = http_request("GET", "/api/mutations", None, args.api_url)
        print(json.dumps(data, indent=2))
        return
    if args.group == "mutation" and args.action == "show":
        status, data = http_request("GET", f"/api/mutations/{args.id}", None, args.api_url)
        print(json.dumps(data, indent=2))
        return

    if args.group == "deploy":
        body = {"mutationId": args.mutation_id, "env": args.env, "strategy": args.strategy, "wait": bool(args.wait)}
        status, data = http_request("POST", "/api/deployments/trigger", body, args.api_url)
        print(json.dumps(data, indent=2))
        return

    if args.group == "risk" and getattr(args, "action", None) == "assess":
        body = {"id": args.id, "policy": args.policy}
        status, data = http_request("POST", f"/api/mutations/{args.id}/risk-assessment", body, args.api_url)
        print(json.dumps(data, indent=2))
        return

    if args.group == "mcp" and getattr(args, "action", None) == "status":
        status, data = http_request("GET", "/api/mcp/status", None, args.api_url)
        print(json.dumps(data, indent=2))
        return
    if args.group == "mcp" and getattr(args, "action", None) == "sync":
        body = {"direction": args.direction, "profile": args.profile}
        status, data = http_request("POST", "/api/mcp/sync", body, args.api_url)
        print(json.dumps(data, indent=2))
        return

    parser.print_help()


if __name__ == "__main__":
    main()