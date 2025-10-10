#!/usr/bin/env node
/*
  Lattice CLI (Node.js)
  Minimal skeleton implementing core commands and reading config from .lattice/config.json
*/
const fs = require('fs');
const path = require('path');
const https = require('https');

function loadConfig() {
  const envUrl = process.env.LATTICE_API_URL;
  if (envUrl) return { apiUrl: envUrl };

  const repoConfigPath = path.join(process.cwd(), '.lattice', 'config.json');
  try {
    if (fs.existsSync(repoConfigPath)) {
      const cfg = JSON.parse(fs.readFileSync(repoConfigPath, 'utf8'));
      const apiUrl = cfg?.api?.endpoint || 'https://api.project-lattice.site';
      const token = cfg?.api?.token || null;
      const deployWaitDefault = (cfg?.deploy && typeof cfg.deploy.wait === 'boolean') ? cfg.deploy.wait : null;
      return { apiUrl, token, deployWaitDefault };
    }
  } catch (_) {}

  // Fallback to shared config
  const sharedPath = path.join(__dirname, '../../shared/config.json');
  try {
    if (fs.existsSync(sharedPath)) {
      const cfg = JSON.parse(fs.readFileSync(sharedPath, 'utf8'));
      const apiUrl = cfg?.api?.endpoint || 'https://api.project-lattice.site';
      return { apiUrl, token: null, deployWaitDefault: null };
    }
  } catch (_) {}

  return { apiUrl: 'https://api.project-lattice.site', token: null, deployWaitDefault: null };
}

function printHelp() {
  printBanner();
  console.log(`
Lattice CLI (Node.js)

Usage:
  lattice <group> <action> [subaction] [options]

Groups & Commands:
  auth login|logout
  project init
  spec create|validate|generate|sync|list|show
  mutation propose|status|approve|reject|list|show
  deploy (trigger deployment)
  risk assess
  mcp status|sync

Environment:
  LATTICE_API_URL  Override backend base URL

  Quality-of-life:
  --auto-fix       Auto-apply close matches for typos (group/action/choices)
  --no-color       Disable ANSI colors in banner and messages
  --non-interactive  Disable interactive prompts (also set env NO_PROMPT=1)
  --version        Show CLI version
  --dry-run        Preview the request without sending (supported on auth login/logout/project init/deploy/spec sync/spec show/mutation propose/status/approve/reject/list/show/risk assess/mcp status/mcp sync)

Examples:
  lattice auth login --username alice --password ******
  lattice project init --repo org/app
  lattice spec sync --direction pull
  lattice deploy --mutation-id mut_123 --env production

Short aliases:
  --e -> --env, --mid -> --mutation-id, --r -> --repo, --i -> --id, --dir -> --direction, --prof -> --profile, --dry/--dr -> --dry-run
`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const group = args[0] || '';
  const action = args[1] && !args[1].startsWith('--') ? args[1] : '';
  // Only consider subaction if an action token is present
  const subaction = action && args[2] && !args[2].startsWith('--') ? args[2] : '';
  const startIndex = subaction ? 3 : action ? 2 : 1;
  const flags = {};
  for (let i = startIndex; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return { group, action, subaction, flags };
}

// Friendly error helpers
function printFriendlyError(title, suggestions = [], debug) {
  console.error(`\n${title}`);
  if (suggestions.length) {
    console.error('\nWhat you can try:');
    for (const s of suggestions) console.error(`- ${s}`);
  }
  if (debug) {
    console.error('\nTechnical details (for support):');
    console.error(debug);
  }
  process.exitCode = 1;
}

function explainHttpFailure(result, context = {}) {
  const status = result?.status || 0;
  const data = result?.data;
  const debug = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const base = context.apiUrl || loadConfig().apiUrl;
  if (status === 0) {
    return printFriendlyError(
      'We could not reach the Lattice server.',
      [
        `Check your internet connection.`,
        `Verify the server address: try visiting ${base} in your browser.`,
        `If the address is wrong, pass --api-url or set LATTICE_API_URL.`,
        `Firewalls or VPNs can block requests; try disabling temporarily.`,
      ],
      debug
    );
  }
  if (status === 401 || status === 403) {
    return printFriendlyError(
      'You are not logged in or do not have access.',
      [
        'Run: lattice auth login --username <your email> --password <your password>.',
        'If using CI, set an auth token in .lattice/config.json or environment.',
        'Ensure your account has permission for the requested project or resource.',
      ],
      debug
    );
  }
  if (status === 404) {
    return printFriendlyError(
      'We could not find what you asked for.',
      [
        'Check for typos in names or IDs (e.g., mutation ID, spec name).',
        'List items first: lattice spec list or lattice mutation list.',
        'If pulling specs, ensure the filter matches what exists on the server.',
      ],
      debug
    );
  }
  if (status === 400 || status === 422) {
    return printFriendlyError(
      'Something about the inputs looks off.',
      [
        'Re-run the command with required options (see lattice --help).',
        'Validate local JSON first: lattice spec validate --path <file>.',
        'If using filters, try simpler values to narrow down the issue.',
      ],
      debug
    );
  }
  if (status >= 500) {
    return printFriendlyError(
      'The server had a problem completing your request.',
      [
        'Try again in a few minutes.',
        'If it persists, open a support ticket with the details shown below.',
      ],
      debug
    );
  }
  return printFriendlyError('The request failed.', ['Retry the command or contact support.'], debug);
}

function requireFlag(flagsObj, names = [], example) {
  for (const n of names) {
    if (!flagsObj[n]) {
      printFriendlyError(
        `Missing required option: --${n}`,
        [
          example ? `Example: ${example}` : 'Run with --help to see usage.',
          'Ensure you pass values after each option, e.g., --name my-spec.',
        ]
      );
      return false;
    }
  }
  return true;
}

// Suggestion & banner helpers
function colorsEnabled() {
  const noColorFlag = process.argv.includes('--no-color') || process.argv.includes('-N');
  const envNoColor = process.env.NO_COLOR || process.env.FORCE_NO_COLOR;
  return !(noColorFlag || envNoColor);
}

function nonInteractive() {
  const flag = process.argv.includes('--non-interactive') || process.argv.includes('-y');
  const env = String(process.env.NO_PROMPT || '').toLowerCase();
  return flag || env === '1' || env === 'true' || env === 'yes';
}

function printBanner() {
  const useColor = colorsEnabled();
  const cyan = useColor ? '\u001b[36m' : '';
  const magenta = useColor ? '\u001b[35m' : '';
  const yellow = useColor ? '\u001b[33m' : '';
  const reset = useColor ? '\u001b[0m' : '';
  const art = `
${cyan}  ____            _           _        ${reset}
${cyan} |  _ \\ __ _  ___| | ____ ___| |__     ${reset}
${magenta} | |_) / _\` |/ __| |/ / _ / __| '_ \\    ${reset}
${magenta} |  __/ (_| | (__|   <  __/ (__| | | |   ${reset}
${yellow} |_|   \\__,_|\\___|_|\\_\\___|\\___|_| |_|   ${reset}
${yellow}            Project Lattice CLI              ${reset}`;
  console.log(art);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const alen = a.length, blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  const v0 = new Array(blen + 1);
  const v1 = new Array(blen + 1);
  for (let i = 0; i <= blen; i++) v0[i] = i;
  for (let i = 0; i < alen; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < blen; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= blen; j++) v0[j] = v1[j];
  }
  return v1[blen];
}

function getCloseMatches(input, options, maxDist = 3) {
  const scored = options.map((opt) => ({ opt, dist: levenshtein(String(input).toLowerCase(), String(opt).toLowerCase()) }));
  scored.sort((a, b) => a.dist - b.dist);
  const best = scored.filter((s) => s.dist <= maxDist).map((s) => s.opt);
  return best.length ? best : scored.slice(0, 3).map((s) => s.opt);
}

function suggestUnknown(kind, value, options) {
  const suggestions = getCloseMatches(value, options);
  printFriendlyError(
    `Unknown ${kind}: ${value}`,
    [
      suggestions.length ? `Did you mean: ${suggestions.join(', ')}?` : 'Run lattice --help to see available commands.',
      'Use tab-completion if available to reduce typos.',
    ]
  );
}

function requireChoice(name, value, choices, example) {
  if (!value || !choices.includes(value)) {
    const suggestions = value ? getCloseMatches(value, choices) : choices;
    printFriendlyError(
      `Invalid value for --${name}: ${value ?? '(missing)'}`,
      [
        `Valid options: ${choices.join(', ')}`,
        suggestions.length ? `Did you mean: ${suggestions.join(', ')}?` : undefined,
        example ? `Example: ${example}` : undefined,
      ].filter(Boolean)
    );
    return false;
  }
  return true;
}

function interactivePick(label, suggestions) {
  if (!suggestions || !suggestions.length) return null;
  if (nonInteractive()) return null;
  if (!(process.stdin && process.stdin.isTTY)) return null;
  try {
    console.error(label);
    console.error(suggestions.map((s, i) => `  [${i + 1}] ${s}`).join('\n'));
    process.stderr.write('Choose a number to auto-correct (Enter to cancel): ');
    const input = require('fs').readFileSync(0, 'utf8').trim();
    const idx = parseInt(input, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= suggestions.length) return suggestions[idx - 1];
  } catch (_) {}
  return null;
}

function resolveChoice(name, value, choices, flags, example) {
  if (value && choices.includes(value)) return value;
  const suggestions = value ? getCloseMatches(value, choices) : choices;
  const auto = !!flags['auto-fix'];
  if (auto && suggestions.length) return suggestions[0];
  if (suggestions.length === 1) return suggestions[0];
  const picked = interactivePick(`Invalid value for --${name}: ${value ?? '(missing)'}\nValid options: ${choices.join(', ')}`, suggestions);
  if (picked) return picked;
  requireChoice(name, value, choices, example);
  return value;
}

// Centralized preview printer for dry-run outputs
function printPreview(preview, flags, tableSummary) {
  const output = flags.output || 'json';
  if (output === 'table') {
    console.log(tableSummary);
  } else {
    console.log(JSON.stringify(preview, null, 2));
  }
}

// Centralized short alias and typo map
const ALIAS_MAP = {
  // Environment
  'environment': 'env',
  'enviroment': 'env',
  'envrionment': 'env',
  'e': 'env',
  // Mutation ID
  'mutaton-id': 'mutation-id',
  'mutationid': 'mutation-id',
  'mutaion-id': 'mutation-id',
  'mut-id': 'mutation-id',
  'mid': 'mutation-id',
  // Deploy dry-run
  'dry': 'dry-run',
  'dr': 'dry-run',
  // Global shorthands/misspellings
  'noninteractive': 'non-interactive',
  'nocolor': 'no-color',
  'apiurl': 'api-url',
  // Spec and general flags
  'desc': 'description',
  'tmpl': 'template',
  'pth': 'path',
  'file': 'path',
  'dir': 'direction',
  'direciton': 'direction',
  'filtr': 'filter',
  'src': 'source',
  'out': 'output',
  'fmt': 'output',
  'nm': 'name',
  // Auth / Project / Mutation
  'u': 'username',
  'pw': 'password',
  'r': 'repo',
  'i': 'id',
  'prof': 'profile',
  // Deploy strategy/wait
  'strat': 'strategy',
  'w': 'wait'
};

function correctFlagKeys(flags, knownKeys) {
  const corrected = { ...flags };
  const globalKeys = ['api-url', 'auto-fix', 'no-color', 'version', 'non-interactive', 'help', 'dry-run', 'output'];
  const allow = new Set([...(knownKeys || []), ...globalKeys]);
  for (const key of Object.keys(flags)) {
    if (allow.has(key)) continue;
    // First, handle hard-coded aliases for very common misspellings/synonyms
    const aliasTarget = ALIAS_MAP[key];
    if (aliasTarget && allow.has(aliasTarget)) {
      if (corrected[aliasTarget] === undefined) corrected[aliasTarget] = corrected[key];
      delete corrected[key];
      continue;
    }
    const suggestions = getCloseMatches(key, Array.from(allow));
    if (!suggestions.length) continue;
    const target = suggestions[0];
    const auto = !!flags['auto-fix'];
    if (auto || suggestions.length === 1) {
      if (corrected[target] === undefined) corrected[target] = corrected[key];
      delete corrected[key];
    } else {
      const picked = interactivePick(`Unknown option --${key}\nDid you mean:`, suggestions);
      if (picked) {
        if (corrected[picked] === undefined) corrected[picked] = corrected[key];
        delete corrected[key];
      } else {
        printFriendlyError(
          `Unknown option: --${key}`,
          [
            `Valid options: ${Array.from(allow).join(', ')}`,
            suggestions.length ? `Did you mean: ${suggestions.join(', ')}?` : undefined,
          ].filter(Boolean)
        );
      }
    }
  }
  return corrected;
}

async function request(method, pathSeg, body, apiUrlOverride, useAuth = true) {
  const { apiUrl: cfgUrl, token } = loadConfig();
  const apiUrl = apiUrlOverride || cfgUrl;
  const url = `${apiUrl}${pathSeg}`;

  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (useAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const payload = body ? JSON.stringify(body) : undefined;

  // Prefer global fetch if available, fallback to https
  if (typeof fetch === 'function') {
    try {
      const res = await fetch(url, { method, headers, body: payload });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (_) { data = text; }
      return { status: res.status, ok: res.ok, data };
    } catch (err) {
      return { status: 0, ok: false, data: { error: err?.message || String(err), code: err?.code } };
    }
  }

  // https fallback
  const urlObj = new URL(url);
  const options = {
    method,
    headers,
  };
  try {
    const response = await new Promise((resolve, reject) => {
      const req = https.request(urlObj, options, (res) => {
        let chunks = '';
        res.on('data', (d) => (chunks += d));
        res.on('end', () => {
          let data;
          try { data = JSON.parse(chunks); } catch (_) { data = chunks; }
          resolve({ status: res.statusCode, ok: res.statusCode >= 200 && res.statusCode < 300, data });
        });
      });
      req.on('error', (e) => reject(e));
      if (payload) req.write(payload);
      req.end();
    });
    return response;
  } catch (err) {
    return { status: 0, ok: false, data: { error: err?.message || String(err), code: err?.code } };
  }
}

function saveToken(token) {
  try {
    const repoConfigPath = path.join(process.cwd(), '.lattice', 'config.json');
    let cfg = {};
    if (fs.existsSync(repoConfigPath)) {
      cfg = JSON.parse(fs.readFileSync(repoConfigPath, 'utf8'));
    }
    cfg.api = cfg.api || {};
    cfg.api.token = token;
    fs.mkdirSync(path.join(process.cwd(), '.lattice'), { recursive: true });
    fs.writeFileSync(repoConfigPath, JSON.stringify(cfg, null, 2));
    console.log('Saved auth token to .lattice/config.json');
  } catch (err) {
    console.warn('Failed to save token:', err?.message || err);
  }
}

async function main() {
  // Global help handling (support --help anywhere)
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    printHelp();
    return;
  }
  // Global version flag
  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    try {
      const pkg = require('../package.json');
      console.log(`Lattice Node CLI v${pkg.version || '0.0.0'}`);
    } catch (_) {
      console.log('Lattice Node CLI');
    }
    return;
  }
  let { group, action, subaction, flags } = parseArgs(process.argv);
  if (!group || flags.help || group === '') {
    printHelp();
    return;
  }

  const knownGroups = ['auth', 'project', 'spec', 'mutation', 'deploy', 'risk', 'mcp'];
  if (!knownGroups.includes(group)) {
    const gSuggestions = getCloseMatches(group, knownGroups);
    if (flags['auto-fix'] && gSuggestions.length) {
      group = gSuggestions[0];
    } else if (gSuggestions.length === 1) {
      group = gSuggestions[0];
    } else {
      const picked = interactivePick(`Unknown group: ${group}\nDid you mean:`, gSuggestions);
      if (picked) group = picked; else return suggestUnknown('group', group, knownGroups);
    }
  }

  switch (group) {
    case 'auth': {
      const actions = ['login', 'logout'];
      if (action && !actions.includes(action)) {
        const aSuggestions = getCloseMatches(action, actions);
        if (flags['auto-fix'] && aSuggestions.length) action = aSuggestions[0];
        else if (aSuggestions.length === 1) action = aSuggestions[0];
        else {
          const picked = interactivePick(`Unknown action: ${action}\nDid you mean:`, aSuggestions);
          if (picked) action = picked; else return suggestUnknown('action', action || '(missing)', actions);
        }
      }
      if (action === 'login') {
        flags = correctFlagKeys(flags, ['username', 'password', 'dry-run', 'output']);
        const { username, password } = flags;
        if (!requireFlag(flags, ['username', 'password'], 'lattice auth login --username alice --password ******')) return;
        if (flags['dry-run']) {
          const { apiUrl: baseUrl } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/auth/login`;
          const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
          const preview = { dryRun: true, method: 'POST', url, body: { username, password: '******' }, headers };
          printPreview(preview, flags, 'DRY-RUN auth login');
          break;
        }
        const result = await request('POST', '/api/auth/login', { username, password }, flags['api-url'], false);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        const token = result?.data?.token || result?.data?.access_token;
        if (token) saveToken(token);
        break;
      }
      if (action === 'logout') {
        flags = correctFlagKeys(flags, ['dry-run', 'output']);
        if (flags['dry-run']) {
          const { apiUrl: baseUrl } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/auth/logout`;
          const headers = { 'Accept': 'application/json' };
          const preview = { dryRun: true, method: 'POST', url, headers };
          printPreview(preview, flags, 'DRY-RUN auth logout');
          break;
        }
        try {
          const repoConfigPath = path.join(process.cwd(), '.lattice', 'config.json');
          let cfg = {};
          if (fs.existsSync(repoConfigPath)) {
            cfg = JSON.parse(fs.readFileSync(repoConfigPath, 'utf8'));
          }
          if (cfg.api) delete cfg.api.token;
          fs.mkdirSync(path.join(process.cwd(), '.lattice'), { recursive: true });
          fs.writeFileSync(repoConfigPath, JSON.stringify(cfg, null, 2));
          console.log('Logged out. Token removed from .lattice/config.json');
        } catch (err) {
          printFriendlyError(
            'We could not remove your saved login.',
            [
              'Ensure this folder is writable: .lattice/ at your project root.',
              'If on Windows, try running your terminal as Administrator.',
            ],
            err?.message || String(err)
          );
        }
        break;
      }
      return suggestUnknown('action', action || '(missing)', ['login', 'logout']);
      break;
    }

    case 'project': {
      const actions = ['init'];
      if (action && !actions.includes(action)) {
        const aSuggestions = getCloseMatches(action, actions);
        if (flags['auto-fix'] && aSuggestions.length) action = aSuggestions[0];
        else if (aSuggestions.length === 1) action = aSuggestions[0];
        else {
          const picked = interactivePick(`Unknown action: ${action}\nDid you mean:`, aSuggestions);
          if (picked) action = picked; else return suggestUnknown('action', action || '(missing)', actions);
        }
      }
      if (action === 'init') {
        flags = correctFlagKeys(flags, ['repo', 'dry-run', 'output']);
        const { repo } = flags;
        if (!requireFlag(flags, ['repo'], 'lattice project init --repo org/app')) return;
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/projects/init`;
          const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'POST', url, body: { repo }, headers };
          printPreview(preview, flags, `DRY-RUN project init: repo=${repo}`);
          break;
        }
        const result = await request('POST', '/api/projects/init', { repo }, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      return suggestUnknown('action', action || '(missing)', ['init']);
      break;
    }

    case 'spec': {
      const actions = ['generate', 'create', 'validate', 'sync', 'list', 'show'];
      if (action && !actions.includes(action)) {
        const aSuggestions = getCloseMatches(action, actions);
        if (flags['auto-fix'] && aSuggestions.length) action = aSuggestions[0];
        else if (aSuggestions.length === 1) action = aSuggestions[0];
        else {
          const picked = interactivePick(`Unknown action: ${action}\nDid you mean:`, aSuggestions);
          if (picked) action = picked; else return suggestUnknown('action', action || '(missing)', actions);
        }
      }
      if (action === 'generate') {
        flags = correctFlagKeys(flags, ['description', 'save']);
        const { description, save } = flags;
        if (!requireFlag(flags, ['description'], 'lattice spec generate --description "My service endpoints" --save')) return;
        const result = await request('POST', '/api/specs/generate', { description, save: !!save }, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        if (flags.save && result?.data?.name && result?.data?.content) {
          try {
            const dir = path.join(process.cwd(), '.lattice', 'specs');
            fs.mkdirSync(dir, { recursive: true });
            const file = path.join(dir, `${result.data.name}.json`);
            fs.writeFileSync(file, JSON.stringify(result.data.content, null, 2));
            console.log(`Saved spec to ${file}`);
          } catch (err) {
            printFriendlyError(
              'We could not save the generated spec file.',
              [
                'Ensure your project folder allows writing to .lattice/specs/.',
                'On Windows, try running your terminal as Administrator.',
                'Alternatively, rerun without --save and save manually to a writable folder.',
              ],
              err?.message || String(err)
            );
          }
        }
        break;
      }
      if (action === 'create') {
        flags = correctFlagKeys(flags, ['name', 'template', 'description']);
        const { name, template, description } = flags;
        if (!requireFlag(flags, ['name'], 'lattice spec create --name payments-api')) return;
        const dir = path.join(process.cwd(), '.lattice', 'specs');
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `${name}.json`);
        const content = { name, version: '1.0.0', description: description || 'Spec created by Lattice CLI', template: template || null };
        try {
          fs.writeFileSync(file, JSON.stringify(content, null, 2));
          console.log(`Created spec at ${file}`);
        } catch (err) {
          printFriendlyError(
            'We could not create the spec file.',
            [
              'Check you have permission to write to this folder.',
              'Try a different folder or run the terminal with elevated permissions.',
            ],
            err?.message || String(err)
          );
        }
        break;
      }
      if (action === 'validate') {
        flags = correctFlagKeys(flags, ['path']);
        const { path: specPath } = flags;
        if (!requireFlag(flags, ['path'], 'lattice spec validate --path .lattice/specs/payments-api.json')) return;
        try {
          const text = fs.readFileSync(specPath, 'utf8');
          JSON.parse(text);
          console.log(JSON.stringify({ path: specPath, valid: true }, null, 2));
        } catch (err) {
          printFriendlyError(
            'This file does not look like valid JSON.',
            [
              'Open the file and look for missing commas or quotes.',
              'If you have a spec generator, re-run it to produce a clean file.',
              'You can validate again after fixing the format.',
            ],
            err?.message || String(err)
          );
        }
        break;
      }
      if (action === 'sync') {
        flags = correctFlagKeys(flags, ['direction', 'filter', 'dry-run', 'output']);
        const { direction: rawDirection, filter } = flags;
        const direction = resolveChoice('direction', rawDirection, ['push', 'pull'], flags, 'lattice spec sync --direction pull');
        if (!['push', 'pull'].includes(direction)) return;
        if (direction === 'push') {
          const dir = path.join(process.cwd(), '.lattice', 'specs');
          const specs = [];
          if (fs.existsSync(dir)) {
            for (const f of fs.readdirSync(dir)) {
              if (f.endsWith('.json')) {
                try {
                  const obj = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                  specs.push({ name: path.basename(f, '.json'), content: obj });
                } catch (_) {}
              }
            }
          }
          if (flags['dry-run']) {
            const { apiUrl: baseUrl, token } = loadConfig();
            const apiBase = flags['api-url'] || baseUrl;
            const url = `${apiBase}/api/specs/sync/push`;
            const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const preview = { dryRun: true, method: 'POST', url, body: { specs }, headers };
            printPreview(preview, flags, `DRY-RUN spec sync push: specs=${specs.length}`);
            break;
          }
          const result = await request('POST', '/api/specs/sync/push', { specs }, flags['api-url']);
          if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          if (flags['dry-run']) {
            const { apiUrl: baseUrl, token } = loadConfig();
            const apiBase = flags['api-url'] || baseUrl;
            const url = `${apiBase}/api/specs/sync/pull`;
            const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const preview = { dryRun: true, method: 'POST', url, body: { filter }, headers };
            printPreview(preview, flags, `DRY-RUN spec sync pull: filter=${filter || ''}`);
            break;
          }
          const result = await request('POST', '/api/specs/sync/pull', { filter }, flags['api-url']);
          if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
          console.log(JSON.stringify(result.data, null, 2));
          const specs = result?.data?.specs || [];
          const dir = path.join(process.cwd(), '.lattice', 'specs');
          fs.mkdirSync(dir, { recursive: true });
          for (const s of specs) {
            const name = s.name || `spec-${Date.now()}`;
            const file = path.join(dir, `${name}.json`);
            try {
              fs.writeFileSync(file, JSON.stringify(s.content || s, null, 2));
            } catch (err) {
              printFriendlyError(
                'We fetched specs but could not save them locally.',
                [
                  'Ensure .lattice/specs/ is writable.',
                  'Try running your terminal as Administrator on Windows.',
                ],
                err?.message || String(err)
              );
            }
          }
        }
        break;
      }
      if (action === 'list') {
        flags = correctFlagKeys(flags, ['source', 'filter', 'output']);
        const { source = 'all', filter, output = 'table' } = flags;
        const dir = path.join(process.cwd(), '.lattice', 'specs');
        const local = [];
        if (fs.existsSync(dir)) {
          for (const f of fs.readdirSync(dir)) {
            if (f.endsWith('.json')) {
              const name = path.basename(f, '.json');
              if (!filter || name.includes(filter)) local.push({ name, source: 'local' });
            }
          }
        }
        let remote = [];
        if (source === 'remote' || source === 'all') {
          const result = await request('POST', '/api/specs/sync/pull', { filter }, flags['api-url']);
          if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
          remote = (result?.data?.specs || []).map((s) => ({ name: s.name || 'unknown', source: 'remote' }));
        }
        const rows = source === 'local' ? local : source === 'remote' ? remote : local.concat(remote);
        console.log(JSON.stringify(rows, null, 2));
        break;
      }
      if (action === 'show') {
        flags = correctFlagKeys(flags, ['name', 'source', 'dry-run', 'output']);
        const { name, source = 'local' } = flags;
        if (!requireFlag(flags, ['name'], 'lattice spec show --name payments-api')) return;
        if (source === 'local') {
          const file = path.join(process.cwd(), '.lattice', 'specs', `${name}.json`);
          if (!fs.existsSync(file)) {
            // Compute close matches from local spec names
            const dir = path.join(process.cwd(), '.lattice', 'specs');
            let locals = [];
            if (fs.existsSync(dir)) {
              for (const f of fs.readdirSync(dir)) {
                if (f.endsWith('.json')) locals.push(path.basename(f, '.json'));
              }
            }
            const suggestions = getCloseMatches(name, locals);
            printFriendlyError(
              `We could not find a local spec named "${name}".`,
              [
                suggestions.length ? `Did you mean: ${suggestions.join(', ')}?` : undefined,
                'Run: lattice spec list to see available local spec files.',
                'Check the name is correct and that the file exists in .lattice/specs/.',
              ].filter(Boolean)
            );
            return;
          }
          console.log(fs.readFileSync(file, 'utf8'));
        } else {
          if (flags['dry-run']) {
            const { apiUrl: baseUrl, token } = loadConfig();
            const apiBase = flags['api-url'] || baseUrl;
            const url = `${apiBase}/api/specs/sync/pull`;
            const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const preview = { dryRun: true, method: 'POST', url, body: { filter: name }, headers };
            printPreview(preview, flags, `DRY-RUN spec show (remote pull): name=${name}`);
            break;
          }
          const result = await request('POST', '/api/specs/sync/pull', { filter: name }, flags['api-url']);
          if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
          console.log(JSON.stringify(result.data, null, 2));
        }
        break;
      }
      return suggestUnknown('action', action || '(missing)', ['generate', 'create', 'validate', 'sync', 'list', 'show']);
      break;
    }

    case 'mutation': {
      const actions = ['propose', 'status', 'approve', 'reject', 'list', 'show'];
      if (action && !actions.includes(action)) {
        const aSuggestions = getCloseMatches(action, actions);
        if (flags['auto-fix'] && aSuggestions.length) action = aSuggestions[0];
        else if (aSuggestions.length === 1) action = aSuggestions[0];
        else {
          const picked = interactivePick(`Unknown action: ${action}\nDid you mean:`, aSuggestions);
          if (picked) action = picked; else return suggestUnknown('action', action || '(missing)', actions);
        }
      }
      if (action === 'propose') {
        flags = correctFlagKeys(flags, ['spec', 'change', 'metadata', 'auto-apply', 'dry-run', 'output']);
        const { spec, change, metadata, 'auto-apply': autoApply } = flags;
        if (!spec || !change) {
          printFriendlyError(
            'Please provide both the spec name and the change.',
            [
              'Example: lattice mutation propose --spec payments-api --change "Increase rate limit"',
              'If the spec does not exist locally, try pulling: lattice spec sync --direction pull',
            ]
          );
          return;
        }
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/mutations/propose`;
          const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'POST', url, body: { spec, change, metadata: metadata || null, autoApply: !!autoApply }, headers };
          printPreview(preview, flags, `DRY-RUN mutation propose: spec=${spec} change="${change}" autoApply=${!!autoApply}`);
          break;
        }
        const result = await request('POST', '/api/mutations/propose', { spec, change: change, metadata: metadata || null, autoApply: !!autoApply }, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(`mutation propose: spec=${spec} ok=true`);
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'status') {
        flags = correctFlagKeys(flags, ['id']);
        const { id } = flags; if (!requireFlag(flags, ['id'], 'lattice mutation status --id mut_123')) return;
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/mutations/${id}`;
          const headers = { 'Accept': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'GET', url, headers };
          printPreview(preview, flags, `DRY-RUN mutation status: id=${id}`);
          break;
        }
        const result = await request('GET', `/api/mutations/${id}`, undefined, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'approve' || action === 'reject') {
        flags = correctFlagKeys(flags, ['id', 'note', 'reason']);
        const { id, note, reason } = flags; if (!requireFlag(flags, ['id'], `lattice mutation ${action} --id mut_123`)) return;
        const body = { id, action: action === 'approve' ? 'approve' : 'reject' };
        if (note) body.note = note; if (reason) body.note = reason;
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/approvals/${id}/respond`;
          const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'POST', url, body, headers };
          printPreview(preview, flags, `DRY-RUN mutation ${action}: id=${id}`);
          break;
        }
        const result = await request('POST', `/api/approvals/${id}/respond`, body, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'list') {
        flags = correctFlagKeys(flags, ['output', 'dry-run']);
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/mutations`;
          const headers = { 'Accept': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'GET', url, headers };
          printPreview(preview, flags, 'DRY-RUN mutation list');
          break;
        }
        const result = await request('GET', '/api/mutations', undefined, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'show') {
        flags = correctFlagKeys(flags, ['id', 'dry-run', 'output']);
        const { id } = flags; if (!requireFlag(flags, ['id'], 'lattice mutation show --id mut_123')) return;
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/mutations/${id}`;
          const headers = { 'Accept': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'GET', url, headers };
          printPreview(preview, flags, `DRY-RUN mutation show: id=${id}`);
          break;
        }
        const result = await request('GET', `/api/mutations/${id}`, undefined, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      return suggestUnknown('action', action || '(missing)', ['propose', 'status', 'approve', 'reject', 'list', 'show']);
      break;
    }

    case 'deploy': {
      flags = correctFlagKeys(flags, ['mutation-id', 'env', 'strategy', 'wait', 'dry-run', 'output']);
      const { 'mutation-id': mutationId, env, strategy } = flags;
      if (!mutationId || !env) {
        printFriendlyError(
          'We need a mutation ID and an environment to deploy.',
          [
            'Example: lattice deploy --mutation-id mut_123 --env production',
            'List mutations first if you are unsure: lattice mutation list',
          ]
        );
        return;
      }
      if (strategy && !['rolling', 'blue-green', 'canary'].includes(strategy)) {
        flags.strategy = resolveChoice('strategy', strategy, ['rolling', 'blue-green', 'canary'], flags, 'lattice deploy --strategy rolling');
        if (!['rolling', 'blue-green', 'canary'].includes(flags.strategy)) return;
      }
      const { deployWaitDefault } = loadConfig();
      const waitFlag = flags.wait !== undefined ? !!flags.wait : !!deployWaitDefault;
      // Dry-run: show the request that would be sent, without making a network call
      if (flags['dry-run']) {
        const { apiUrl: baseUrl, token } = loadConfig();
        const apiBase = flags['api-url'] || baseUrl;
        const url = `${apiBase}/api/deployments/trigger`;
        const headers = {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const preview = { dryRun: true, method: 'POST', url, body: { mutationId, env, strategy, wait: waitFlag }, headers };
        printPreview(preview, flags, `DRY-RUN deploy: mutationId=${mutationId} env=${env} strategy=${strategy || 'rolling'} wait=${waitFlag}`);
        break;
      }
      const result = await request('POST', '/api/deployments/trigger', { mutationId, env, strategy, wait: waitFlag }, flags['api-url']);
      if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
      // Compact summary for scripting convenience
      if (result.ok) {
        const status = result?.status || 0;
        console.log(`deploy: mutationId=${mutationId} env=${env} status=${status}`);
      }
      console.log(JSON.stringify(result.data, null, 2));
      break;
    }

    case 'risk': {
      if (action === 'assess') {
        flags = correctFlagKeys(flags, ['id', 'policy']);
        const { id, policy } = flags; if (!requireFlag(flags, ['id'], 'lattice risk assess --id mut_123')) return;
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/mutations/${id}/risk-assessment`;
          const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'POST', url, body: { id, policy }, headers };
          printPreview(preview, flags, `DRY-RUN risk assess: id=${id} policy=${policy || ''}`);
          break;
        }
        const result = await request('POST', `/api/mutations/${id}/risk-assessment`, { id, policy }, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      return suggestUnknown('action', action || '(missing)', ['assess']);
      break;
    }

    case 'mcp': {
      const actions = ['status', 'sync'];
      if (action && !actions.includes(action)) {
        const aSuggestions = getCloseMatches(action, actions);
        if (flags['auto-fix'] && aSuggestions.length) action = aSuggestions[0];
        else if (aSuggestions.length === 1) action = aSuggestions[0];
        else {
          const picked = interactivePick(`Unknown action: ${action}\nDid you mean:`, aSuggestions);
          if (picked) action = picked; else return suggestUnknown('action', action || '(missing)', actions);
        }
      }
      if (action === 'status') {
        // allow global flags via correctFlagKeys (dry-run/output)
        flags = correctFlagKeys(flags, []);
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/mcp/status`;
          const headers = { 'Accept': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'GET', url, headers };
          printPreview(preview, flags, 'DRY-RUN mcp status');
          break;
        }
        const result = await request('GET', '/api/mcp/status', undefined, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'sync') {
        flags = correctFlagKeys(flags, ['direction', 'profile', 'dry-run', 'output']);
        const { direction: rawDirection, profile } = flags;
        const direction = resolveChoice('direction', rawDirection, ['push', 'pull'], flags, 'lattice mcp sync --direction pull');
        if (!['push', 'pull'].includes(direction)) return;
        if (flags['dry-run']) {
          const { apiUrl: baseUrl, token } = loadConfig();
          const apiBase = flags['api-url'] || baseUrl;
          const url = `${apiBase}/api/mcp/sync`;
          const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
          if (token) headers['Authorization'] = `Bearer ${token}`;
          const preview = { dryRun: true, method: 'POST', url, body: { direction, profile }, headers };
          printPreview(preview, flags, `DRY-RUN mcp sync: direction=${direction} profile=${profile || ''}`);
          break;
        }
        const result = await request('POST', '/api/mcp/sync', { direction, profile }, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      return suggestUnknown('action', action || '(missing)', ['status', 'sync']);
      break;
    }

    default:
      return suggestUnknown('group', group, ['auth', 'project', 'spec', 'mutation', 'deploy', 'risk', 'mcp']);
  }
}

main().catch((err) => {
  printFriendlyError(
    'The CLI encountered an unexpected problem.',
    [
      'Re-run the command; if it happens again, please contact support.',
      'Share the technical details below to help us resolve it.',
    ],
    err?.message || String(err)
  );
});