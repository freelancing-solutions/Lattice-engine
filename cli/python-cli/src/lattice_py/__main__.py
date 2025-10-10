import argparse
import json
import os
import sys
import difflib
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


def print_banner() -> None:
    no_color_flag = ("--no-color" in sys.argv) or ("-N" in sys.argv)
    env_no_color = os.getenv("NO_COLOR") or os.getenv("FORCE_NO_COLOR")
    use_color = not (no_color_flag or env_no_color)
    cyan = "\u001b[36m" if use_color else ""
    magenta = "\u001b[35m" if use_color else ""
    yellow = "\u001b[33m" if use_color else ""
    reset = "\u001b[0m" if use_color else ""
    art = (
        f"\n"
        f"{cyan}  ____            _           _        {reset}\n"
        f"{cyan} |  _ \\ __ _  ___| | ____ ___| |__     {reset}\n"
        f"{magenta} | |_) / _` |/ __| |/ / _ / __| '_ \\    {reset}\n"
        f"{magenta} |  __/ (_| | (__|   <  __/ (__| | | |   {reset}\n"
        f"{yellow} |_|   \\__,_|\\___|_|\\_\\___|\\___|_| |_|   {reset}\n"
        f"{yellow}            Project Lattice CLI              {reset}"
    )
    print(art)


def suggest_unknown(kind: str, value: str, options: list[str]) -> None:
    suggestions = difflib.get_close_matches(value or "", options, n=3, cutoff=0.0)
    print_friendly_error(
        f"Unknown {kind}: {value or '(missing)'}",
        [
            (f"Did you mean: {', '.join(suggestions)}?") if suggestions else "Run lattice-py --help to see available commands.",
            "Use tab-completion if available to reduce typos.",
        ],
    )


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


def print_preview(preview: dict, flags: dict, table_summary: str) -> None:
    """Centralized preview printer for dry-run outputs"""
    output = flags.get("output", "json")
    if output == "table":
        print(table_summary)
    else:
        print(json.dumps(preview, indent=2))

def print_output(data: Any, flags: dict, table_summary: str = "") -> None:
    """Centralized output printer supporting multiple formats"""
    output_format = flags.get("output", "json")
    if output_format == "table" and table_summary:
        print(table_summary)
    else:
        print(json.dumps(data, indent=2))

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
    parser.add_argument("--api-url", "-u", dest="api_url", help="Override backend base URL")
    parser.add_argument("--dry-run", "--dry", "--dr", action="store_true", help="Preview the request without sending")
    parser.add_argument("--output", "-o", choices=["json", "table"], default="json", help="Output format")
    parser.add_argument("--non-interactive", "-y", action="store_true", help="Disable interactive prompts")
    parser.add_argument("--no-color", "-N", action="store_true", help="Disable ANSI colors")
    parser.add_argument("--version", "-v", action="version", version="%(prog)s 1.0.0")
    subparsers = parser.add_subparsers(dest="group")

    # auth login
    auth = subparsers.add_parser("auth", help="Authentication commands")
    auth_sub = auth.add_subparsers(dest="action")
    login = auth_sub.add_parser("login", help="Login to Lattice backend")
    login.add_argument("--username", "-u", required=True)
    login.add_argument("--password", "-p", required=True)
    auth_sub.add_parser("logout", help="Logout and clear local token")
    auth_sub.add_parser("status", help="Check authentication status")

    # project init
    project = subparsers.add_parser("project", help="Project commands")
    proj_sub = project.add_subparsers(dest="action")
    init = proj_sub.add_parser("init", help="Initialize project in Lattice")
    init.add_argument("--repo", "-r", required=True, help="owner/name")

    # spec generate
    spec = subparsers.add_parser("spec", help="Spec commands")
    spec_sub = spec.add_subparsers(dest="action")
    gen = spec_sub.add_parser("generate", help="Generate spec from description")
    gen.add_argument("--description", "-d", required=True)
    gen.add_argument("--save", "-s", action="store_true")
    create = spec_sub.add_parser("create", help="Create a local spec file")
    create.add_argument("--name", "-n", required=True)
    create.add_argument("--template", "-t")
    create.add_argument("--description", "-d")
    validate = spec_sub.add_parser("validate", help="Validate a local spec JSON")
    validate.add_argument("--path", "-p", required=True)
    validate.add_argument("--strict", "-s", action="store_true")
    sync = spec_sub.add_parser("sync", help="Sync specs with backend")
    sync.add_argument("--direction", "-d", required=True, choices=["push", "pull"])
    sync.add_argument("--filter", "-f")
    lst = spec_sub.add_parser("list", help="List specs")
    lst.add_argument("--source", "-s", choices=["local", "remote", "all"], default="all")
    lst.add_argument("--filter", "-f")
    show = spec_sub.add_parser("show", help="Show a spec")
    show.add_argument("--name", "-n", required=True)
    show.add_argument("--source", "-s", choices=["local", "remote"], default="local")

    # mutation propose
    mut = subparsers.add_parser("mutation", help="Mutation commands")
    mut_sub = mut.add_subparsers(dest="action")
    prop = mut_sub.add_parser("propose", help="Propose mutation against a spec")
    prop.add_argument("--spec", "-s", required=True)
    prop.add_argument("--change", "-c", required=True)
    prop.add_argument("--metadata", "-m")
    prop.add_argument("--auto-apply", "-a", action="store_true")
    status = mut_sub.add_parser("status", help="Check mutation status")
    status.add_argument("--id", "-i", required=True)
    approve = mut_sub.add_parser("approve", help="Approve a mutation")
    approve.add_argument("--id", "-i", required=True)
    approve.add_argument("--note", "-n")
    reject = mut_sub.add_parser("reject", help="Reject a mutation")
    reject.add_argument("--id", "-i", required=True)
    reject.add_argument("--reason", "-r")
    mut_sub.add_parser("list", help="List mutations")
    showm = mut_sub.add_parser("show", help="Show mutation details")
    showm.add_argument("--id", "-i", required=True)

    # deploy
    deploy = subparsers.add_parser("deploy", help="Deploy mutation")
    deploy.add_argument("--mutation-id", "-m", required=True)
    deploy.add_argument("--environment", "-e", required=True)
    deploy.add_argument("--strategy", "-s", choices=["rolling", "blue-green", "canary"], default="rolling")
    deploy.add_argument("--wait", "-w", action="store_true")

    # risk
    risk = subparsers.add_parser("risk", help="Risk assessment commands")
    risk_sub = risk.add_subparsers(dest="action")
    assess = risk_sub.add_parser("assess", help="Assess mutation risk")
    assess.add_argument("--mutation-id", "-m", required=True)
    assess.add_argument("--policy", "-p")

    # mcp
    mcp = subparsers.add_parser("mcp", help="MCP server commands")
    mcp_sub = mcp.add_subparsers(dest="action")
    mcp_sub.add_parser("status", help="Show MCP status")
    syncm = mcp_sub.add_parser("sync", help="Sync MCP metadata")
    syncm.add_argument("--direction", "-d", required=True, choices=["push", "pull"])
    syncm.add_argument("--profile", "-p")

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
    raw = sys.argv[1:]

    # Show banner with help or no args
    if (not raw) or ("--help" in raw):
        print_banner()
        # Quality-of-life flags (global pre-parse)
        print()
        print("Quality-of-life:")
        print("  --auto-fix       Auto-apply close matches for typos (group/action/choices)")
        print("  --no-color       Disable ANSI colors in banner and messages")
        print("  --non-interactive  Disable interactive prompts (also set env NO_PROMPT=1)")
        print("  --version        Show CLI version")
        parser.print_help()
        return

    # Global version
    if ("--version" in raw) or ("-v" in raw):
        try:
            # Read version from pyproject.toml
            from pathlib import Path as _P
            py = _P(__file__).resolve().parents[4] / "python-cli" / "pyproject.toml"
            ver = None
            if py.exists():
                txt = py.read_text(encoding="utf-8")
                import re as _re
                m = _re.search(r"version\s*=\s*\"([^\"]+)\"", txt)
                if m:
                    ver = m.group(1)
            print(f"Lattice Python CLI v{ver or '0.0.0'}")
        except Exception:
            print("Lattice Python CLI")
        return

    # Fuzzy suggestion for group/action typos before strict parsing
    groups = ["auth", "project", "spec", "mutation", "deploy", "risk", "mcp"]
    actions_map = {
        "auth": ["login", "logout", "status"],
        "project": ["init"],
        "spec": ["generate", "create", "validate", "sync", "list", "show"],
        "mutation": ["propose", "status", "approve", "reject", "list", "show"],
        "deploy": ["(root)"],
        "risk": ["assess"],
        "mcp": ["status", "sync"],
    }
    # Non-interactive guard
    _no_prompt_env = (os.getenv("NO_PROMPT") or "").strip().lower()
    _non_interactive_flag = ("--non-interactive" in raw) or ("-y" in raw)
    _non_interactive = _non_interactive_flag or _no_prompt_env in ("1", "true", "yes")

    def interactive_pick(label: str, suggestions: list[str]) -> str | None:
        if not suggestions:
            return None
        if _non_interactive:
            return None
        if not sys.stdin.isatty():
            return None
        try:
            print(label)
            for i, s in enumerate(suggestions, start=1):
                print(f"  [{i}] {s}")
            choice = input("Choose a number to auto-correct (Enter to cancel): ").strip()
            if not choice:
                return None
            idx = int(choice)
            if 1 <= idx <= len(suggestions):
                return suggestions[idx - 1]
        except Exception:
            return None
        return None

    auto_fix = "--auto-fix" in raw
    if raw and raw[0] not in groups:
        g_suggestions = difflib.get_close_matches(raw[0] or "", groups, n=3, cutoff=0.0)
        if auto_fix and g_suggestions:
            raw[0] = g_suggestions[0]
        elif len(g_suggestions) == 1:
            raw[0] = g_suggestions[0]
        else:
            picked = interactive_pick(f"Unknown group: {raw[0]}\nDid you mean:", g_suggestions)
            if picked:
                raw[0] = picked
            else:
                return suggest_unknown("group", raw[0], groups)
    if len(raw) > 1 and raw[0] in groups and not raw[1].startswith("-"):
        valid_actions = actions_map.get(raw[0], [])
        if raw[1] not in valid_actions:
            a_suggestions = difflib.get_close_matches(raw[1] or "", valid_actions, n=3, cutoff=0.0)
            if auto_fix and a_suggestions:
                raw[1] = a_suggestions[0]
            elif len(a_suggestions) == 1:
                raw[1] = a_suggestions[0]
            else:
                picked = interactive_pick(f"Unknown action: {raw[1]}\nDid you mean:", a_suggestions)
                if picked:
                    raw[1] = picked
                else:
                    return suggest_unknown("action", raw[1], valid_actions)

    # Suggest close matches for common choice flags before strict parsing
    def resolve_choice(name: str, value: str | None, choices: list[str], example: str | None = None) -> str | None:
        if value and value in choices:
            return value
        suggestions = difflib.get_close_matches(value or "", choices, n=3, cutoff=0.0) or choices
        if auto_fix and suggestions:
            return suggestions[0]
        if len(suggestions) == 1:
            return suggestions[0]
        picked = interactive_pick(f"Invalid value for --{name}: {value or '(missing)'}\nValid options: {', '.join(choices)}", suggestions)
        if picked:
            return picked
        print_friendly_error(
            f"Invalid value for --{name}: {value or '(missing)'}",
            [
                f"Valid options: {', '.join(choices)}",
                (f"Did you mean: {', '.join(suggestions)}?") if suggestions else None,
                (f"Example: {example}") if example else None,
            ],
        )
        return value

    # Lightweight flag scan for choices
    def get_flag(raw_args: list[str], flag: str) -> str | None:
        try:
            i = raw_args.index(flag)
            return raw_args[i + 1] if i + 1 < len(raw_args) and not raw_args[i + 1].startswith("-") else None
        except ValueError:
            return None

    def set_flag(raw_args: list[str], flag: str, new_val: str) -> None:
        try:
            i = raw_args.index(flag)
            if i + 1 < len(raw_args) and not raw_args[i + 1].startswith("-"):
                raw_args[i + 1] = new_val
        except ValueError:
            pass

    if raw and raw[0] == "spec" and (len(raw) > 1 and raw[1] == "sync"):
        dir_val = get_flag(raw, "--direction")
        picked = resolve_choice("direction", dir_val, ["push", "pull"], "lattice-py spec sync --direction pull")
        if picked and picked in ["push", "pull"]:
            set_flag(raw, "--direction", picked)
    if raw and raw[0] == "mcp" and (len(raw) > 1 and raw[1] == "sync"):
        dir_val = get_flag(raw, "--direction")
        picked = resolve_choice("direction", dir_val, ["push", "pull"], "lattice-py mcp sync --direction pull")
        if picked and picked in ["push", "pull"]:
            set_flag(raw, "--direction", picked)
    if raw and raw[0] == "deploy":
        strat_val = get_flag(raw, "--strategy")
        if strat_val is not None:
            picked = resolve_choice("strategy", strat_val, ["rolling", "blue-green", "canary"], "lattice-py deploy --strategy rolling")
            if picked and picked in ["rolling", "blue-green", "canary"]:
                set_flag(raw, "--strategy", picked)

    # Flag name auto-correction based on known flags for each action
    def correct_flag_names(raw_args: list[str], known: list[str]) -> list[str]:
        out = list(raw_args)
        i = 0
        while i < len(out):
            tok = out[i]
            if tok.startswith("--") and tok not in known:
                cand = difflib.get_close_matches(tok, known, n=3, cutoff=0.0)
                if cand:
                    if auto_fix or len(cand) == 1:
                        out[i] = cand[0]
                    else:
                        picked = interactive_pick(f"Unknown option {tok}\nDid you mean:", cand)
                        if picked:
                            out[i] = picked
                        else:
                            print_friendly_error(
                                f"Unknown option: {tok}",
                                [
                                    f"Valid options: {', '.join(known)}",
                                    (f"Did you mean: {', '.join(cand)}?") if cand else None,
                                ],
                            )
            i += 1
        return out

    GLOBAL_FLAGS = ["--api-url", "--auto-fix", "--no-color", "--version", "--non-interactive", "--help"]
    def apply_flag_corrections():
        nonlocal raw
        if not raw:
            return
        group = raw[0]
        action = raw[1] if len(raw) > 1 and not raw[1].startswith("-") else None
        def with_globals(keys: list[str]) -> list[str]:
            return keys + GLOBAL_FLAGS
        if group == "auth" and action == "login":
            raw = correct_flag_names(raw, with_globals(["--username", "--password"]))
        elif group == "auth" and action == "status":
            raw = correct_flag_names(raw, with_globals([]))
        elif group == "project" and action == "init":
            raw = correct_flag_names(raw, with_globals(["--repo"]))
        elif group == "spec" and action == "generate":
            raw = correct_flag_names(raw, with_globals(["--description", "--save"]))
        elif group == "spec" and action == "create":
            raw = correct_flag_names(raw, with_globals(["--name", "--template", "--description"]))
        elif group == "spec" and action == "validate":
            raw = correct_flag_names(raw, with_globals(["--path", "--strict"]))
        elif group == "spec" and action == "sync":
            raw = correct_flag_names(raw, with_globals(["--direction", "--filter"]))
        elif group == "spec" and action == "list":
            raw = correct_flag_names(raw, with_globals(["--source", "--filter"]))
        elif group == "spec" and action == "show":
            raw = correct_flag_names(raw, with_globals(["--name", "--source"]))
        elif group == "mutation" and action == "propose":
            raw = correct_flag_names(raw, with_globals(["--spec", "--change", "--metadata", "--auto-apply"]))
        elif group == "mutation" and action == "status":
            raw = correct_flag_names(raw, with_globals(["--id"]))
        elif group == "mutation" and action == "approve":
            raw = correct_flag_names(raw, with_globals(["--id", "--note"]))
        elif group == "mutation" and action == "reject":
            raw = correct_flag_names(raw, with_globals(["--id", "--reason"]))
        elif group == "mutation" and action == "show":
            raw = correct_flag_names(raw, with_globals(["--id"]))
        elif group == "deploy":
            raw = correct_flag_names(raw, with_globals(["--mutation-id", "--env", "--strategy", "--wait"]))
        elif group == "risk" and action == "assess":
            raw = correct_flag_names(raw, with_globals(["--id", "--policy"]))
        elif group == "mcp" and action == "sync":
            raw = correct_flag_names(raw, with_globals(["--direction", "--profile"]))

    apply_flag_corrections()

    # Proceed with strict parsing
    args = parser.parse_args(raw)

    if not args.group:
        print_banner()
        parser.print_help()
        return

    if args.group == "auth" and args.action == "login":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/auth/login",
                "body": {"username": args.username, "password": "******"},
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN auth login")
            return
        status, data = http_request("POST", "/api/auth/login", {"username": args.username, "password": args.password}, args.api_url, use_auth=False)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        print(json.dumps(data, indent=2))
        token = (data or {}).get("token") or (data or {}).get("access_token")
        if token:
            save_token(token)
        return
    if args.group == "auth" and args.action == "logout":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/auth/logout",
                "body": {},
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN auth logout")
            return
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
            print_friendly_error(
                "We could not remove your saved login.",
                [
                    "Ensure this folder is writable: .lattice/ at your project root.",
                    "If on Windows, try running your terminal as Administrator.",
                ],
                str(e),
            )
        return
    if args.group == "auth" and args.action == "status":
        has_token = bool(load_config()["token"])
        status_data = {
            "status": "authenticated" if has_token else "unauthenticated",
            "message": "Logged in" if has_token else "Not logged in"
        }
        flags = vars(args)
        table_summary = f"Status: {'Authenticated' if has_token else 'Unauthenticated'}"
        print_output(status_data, flags, table_summary)
        return

    if args.group == "project" and args.action == "init":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/projects/init",
                "body": {"repo": args.repo},
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN project init: repo={args.repo}")
            return
        status, data = http_request("POST", "/api/projects/init", {"repo": args.repo}, args.api_url)
        table_summary = f"Project initialized: {args.repo}"
        print_output(data, flags, table_summary)
        return

    if args.group == "spec" and args.action == "generate":
        flags = vars(args)
        status, data = http_request("POST", "/api/specs/generate", {"description": args.description, "save": bool(args.save)}, args.api_url)
        table_summary = f"Spec generated for: {args.description}"
        print_output(data, flags, table_summary)
        return
    if args.group == "spec" and args.action == "create":
        try:
            name = args.name
            specs_dir = Path.cwd() / ".lattice" / "specs"
            specs_dir.mkdir(parents=True, exist_ok=True)
            content = {"name": name, "version": "1.0.0", "description": args.description or "Spec created by Lattice CLI", "template": args.template or None}
            (specs_dir / f"{name}.json").write_text(json.dumps(content, indent=2), encoding="utf-8")
            print(f"Created spec at {specs_dir / f'{name}.json'}")
        except Exception as e:
            print_friendly_error(
                "We could not create the spec file.",
                [
                    "Check you have permission to write to this folder.",
                    "Try a different folder or run the terminal with elevated permissions.",
                ],
                str(e),
            )
        return
    if args.group == "spec" and args.action == "validate":
        try:
            text = Path(args.path).read_text(encoding="utf-8")
            json.loads(text)
            flags = vars(args)
            validation_data = {"path": args.path, "valid": True}
            table_summary = f"✓ Valid JSON: {args.path}"
            print_output(validation_data, flags, table_summary)
        except Exception as e:
            print_friendly_error(
                "This file does not look like valid JSON.",
                [
                    "Open the file and look for missing commas or quotes.",
                    "If you have a spec generator, re-run it to produce a clean file.",
                    "You can validate again after fixing the format.",
                ],
                str(e),
            )
        return
    if args.group == "spec" and args.action == "sync":
        flags = vars(args)
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
            if flags.get("dry_run"):
                preview = {
                    "dryRun": True,
                    "method": "POST",
                    "url": f"{args.api_url or load_config()['apiUrl']}/api/specs/sync/push",
                    "body": {"specs": specs},
                    "headers": {"Accept": "application/json", "Content-Type": "application/json"}
                }
                print_preview(preview, flags, f"DRY-RUN spec sync push: specs={len(specs)}")
                return
            status, data = http_request("POST", "/api/specs/sync/push", {"specs": specs}, args.api_url)
            if not (200 <= status < 300):
                explain_http_failure(status, data, {"apiUrl": args.api_url})
            table_summary = f"✓ Pushed {len(specs)} specs to backend"
            print_output(data, flags, table_summary)
        else:
            if flags.get("dry_run"):
                preview = {
                    "dryRun": True,
                    "method": "POST",
                    "url": f"{args.api_url or load_config()['apiUrl']}/api/specs/sync/pull",
                    "body": {"filter": args.filter} if args.filter else {},
                    "headers": {"Accept": "application/json", "Content-Type": "application/json"}
                }
                print_preview(preview, flags, f"DRY-RUN spec sync pull: filter={args.filter or ''}")
                return
            status, data = http_request("POST", "/api/specs/sync/pull", {"filter": args.filter} if args.filter else {}, args.api_url)
            if not (200 <= status < 300):
                explain_http_failure(status, data, {"apiUrl": args.api_url})
            specs = (data or {}).get("specs") or []
            specs_dir = Path.cwd() / ".lattice" / "specs"
            specs_dir.mkdir(parents=True, exist_ok=True)
            for s in specs:
                try:
                    name = s.get("name") or f"spec-{int(Path.cwd().stat().st_ctime)}"
                    (specs_dir / f"{name}.json").write_text(json.dumps(s.get("content") or s, indent=2), encoding="utf-8")
                except Exception as e:
                    print_friendly_error(
                        "We fetched specs but could not save them locally.",
                        [
                            "Ensure .lattice/specs/ is writable.",
                            "Try running your terminal as Administrator on Windows.",
                        ],
                        str(e),
                    )
            table_summary = f"✓ Pulled {len(specs)} specs from backend"
            print_output(data, flags, table_summary)
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
            if not (200 <= status < 300):
                explain_http_failure(status, data, {"apiUrl": args.api_url})
            remote = [{"name": (s or {}).get("name", "unknown"), "source": "remote"} for s in ((data or {}).get("specs") or [])]
        rows = local if source == "local" else remote if source == "remote" else local + remote
        flags = vars(args)
        table_summary = f"Found {len(rows)} specs ({len(local)} local, {len(remote)} remote)"
        print_output(rows, flags, table_summary)
        return
    if args.group == "spec" and args.action == "show":
        flags = vars(args)
        name = args.name
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/specs/sync/pull",
                "body": {"filter": name},
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN spec show (remote pull): name={name}")
            return
        status, data = http_request("POST", "/api/specs/sync/pull", {"filter": name}, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        table_summary = f"Spec: {name}"
        print_output(data, flags, table_summary)
        return

    if args.group == "mutation" and args.action == "propose":
        flags = vars(args)
        body = {
            "spec": args.spec,
            "change": args.change,
            "metadata": args.metadata or None,
            "autoApply": bool(args.auto_apply),
        }
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/mutations/propose",
                "body": body,
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN mutation propose: spec={args.spec} change={args.change} autoApply={bool(args.auto_apply)}")
            return
        status, data = http_request(
            "POST",
            "/api/mutations/propose",
            body,
            args.api_url,
        )
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        print(json.dumps(data, indent=2))
        return
    if args.group == "mutation" and args.action == "status":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "GET",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/mutations/{args.id}",
                "body": None,
                "headers": {"Accept": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN mutation status: id={args.id}")
            return
        status, data = http_request("GET", f"/api/mutations/{args.id}", None, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        print(json.dumps(data, indent=2))
        return
    if args.group == "mutation" and args.action in ("approve", "reject"):
        flags = vars(args)
        body = {"id": args.id, "action": "approve" if args.action == "approve" else "reject"}
        if getattr(args, "note", None):
            body["note"] = args.note
        if getattr(args, "reason", None):
            body["note"] = args.reason
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/approvals/{args.id}/respond",
                "body": body,
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN mutation {args.action}: id={args.id} note={body.get('note', '')}")
            return
        status, data = http_request("POST", f"/api/approvals/{args.id}/respond", body, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        print(json.dumps(data, indent=2))
        return
    if args.group == "mutation" and args.action == "list":
        flags = vars(args)
        status, data = http_request("GET", "/api/mutations", None, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        mutations = data or []
        if args.spec:
            mutations = [m for m in mutations if (m or {}).get("specName") == args.spec]
        if args.status:
            mutations = [m for m in mutations if (m or {}).get("status") == args.status]
        table_summary = f"Found {len(mutations)} mutations"
        print_output(mutations, flags, table_summary)
        return
    if args.group == "mutation" and args.action == "show":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "GET",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/mutations/{args.id}",
                "body": None,
                "headers": {"Accept": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN mutation show: id={args.id}")
            return
        status, data = http_request("GET", f"/api/mutations/{args.id}", None, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        table_summary = f"Mutation: {args.id}"
        print_output(data, flags, table_summary)
        return

    if args.group == "deploy":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/deployments",
                "body": {"mutationId": args.mutation_id, "environment": args.environment, "strategy": args.strategy},
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN deploy: mutation={args.mutation_id}, env={args.environment}, strategy={args.strategy}")
            return
        status, data = http_request("POST", "/api/deployments", {"mutationId": args.mutation_id, "environment": args.environment, "strategy": args.strategy}, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        table_summary = f"Deployment initiated for mutation {args.mutation_id} to {args.environment}"
        print_output(data, flags, table_summary)
        return

    if args.group == "risk" and args.action == "assess":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/mutations/{args.mutation_id}/risk-assessment",
                "body": {"id": args.mutation_id, "policy": args.policy},
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN risk assess: mutation={args.mutation_id}, policy={args.policy}")
            return
        status, data = http_request("POST", f"/api/mutations/{args.mutation_id}/risk-assessment", {"id": args.mutation_id, "policy": args.policy}, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        table_summary = f"Risk assessment for mutation {args.mutation_id}"
        print_output(data, flags, table_summary)
        return

    if args.group == "mcp" and args.action == "status":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "GET",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/mcp/status",
                "body": None,
                "headers": {"Accept": "application/json"}
            }
            print_preview(preview, flags, "DRY-RUN mcp status")
            return
        status, data = http_request("GET", "/api/mcp/status", None, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        table_summary = "MCP Status"
        print_output(data, flags, table_summary)
        return
    if args.group == "mcp" and args.action == "sync":
        flags = vars(args)
        if flags.get("dry_run"):
            preview = {
                "dryRun": True,
                "method": "POST",
                "url": f"{args.api_url or load_config()['apiUrl']}/api/mcp/sync",
                "body": {"direction": args.direction, "profile": args.profile},
                "headers": {"Accept": "application/json", "Content-Type": "application/json"}
            }
            print_preview(preview, flags, f"DRY-RUN mcp sync: direction={args.direction}, profile={args.profile}")
            return
        status, data = http_request("POST", "/api/mcp/sync", {"direction": args.direction, "profile": args.profile}, args.api_url)
        if not (200 <= status < 300):
            explain_http_failure(status, data, {"apiUrl": args.api_url})
        table_summary = f"MCP Sync {args.direction} completed"
        print_output(data, flags, table_summary)
        return

    parser.print_help()


if __name__ == "__main__":
    try:
        main()
    except SystemExit:
        # Friendly exit already handled
        pass
    except Exception as e:
        print_friendly_error(
            "The CLI encountered an unexpected problem.",
            [
                "Re-run the command; if it happens again, please contact support.",
                "Share the technical details below to help us resolve it.",
            ],
            str(e),
        )