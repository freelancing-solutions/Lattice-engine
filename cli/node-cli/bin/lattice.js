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
      return { apiUrl, token };
    }
  } catch (_) {}

  // Fallback to shared config
  const sharedPath = path.join(__dirname, '../../shared/config.json');
  try {
    if (fs.existsSync(sharedPath)) {
      const cfg = JSON.parse(fs.readFileSync(sharedPath, 'utf8'));
      const apiUrl = cfg?.api?.endpoint || 'https://api.project-lattice.site';
      return { apiUrl, token: null };
    }
  } catch (_) {}

  return { apiUrl: 'https://api.project-lattice.site', token: null };
}

function printHelp() {
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

Examples:
  lattice auth login --username alice --password ******
  lattice project init --repo org/app
  lattice spec sync --direction pull
  lattice deploy --mutation-id mut_123 --env production
`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const group = args[0] || '';
  const action = args[1] && !args[1].startsWith('--') ? args[1] : '';
  const subaction = args[2] && !args[2].startsWith('--') ? args[2] : '';
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
  const { group, action, subaction, flags } = parseArgs(process.argv);
  if (!group || flags.help || group === '') {
    printHelp();
    return;
  }

  switch (group) {
    case 'auth': {
      if (action === 'login') {
      const { username, password } = flags;
      if (!requireFlag(flags, ['username', 'password'], 'lattice auth login --username alice --password ******')) return;
      const result = await request('POST', '/api/auth/login', { username, password }, flags['api-url'], false);
      if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
      console.log(JSON.stringify(result.data, null, 2));
      const token = result?.data?.token || result?.data?.access_token;
      if (token) saveToken(token);
        break;
      }
      if (action === 'logout') {
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
      console.error('Unknown auth action');
      break;
    }

    case 'project': {
      if (action === 'init') {
      const { repo } = flags;
      if (!requireFlag(flags, ['repo'], 'lattice project init --repo org/app')) return;
      const result = await request('POST', '/api/projects/init', { repo }, flags['api-url']);
      if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
      console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      console.error('Unknown project action');
      break;
    }

    case 'spec': {
      if (action === 'generate') {
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
        const { direction, filter } = flags;
        if (!direction || !['push', 'pull'].includes(direction)) {
          printFriendlyError(
            'Please tell us whether to push or pull specs.',
            [
              'Use --direction push to send local specs to the server.',
              'Use --direction pull to fetch specs from the server.',
              'Example: lattice spec sync --direction pull',
            ]
          );
          return;
        }
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
          const result = await request('POST', '/api/specs/sync/push', { specs }, flags['api-url']);
          if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
          console.log(JSON.stringify(result.data, null, 2));
        } else {
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
        const { name, source = 'local' } = flags;
        if (!requireFlag(flags, ['name'], 'lattice spec show --name payments-api')) return;
        if (source === 'local') {
          const file = path.join(process.cwd(), '.lattice', 'specs', `${name}.json`);
          if (!fs.existsSync(file)) {
            printFriendlyError(
              `We could not find a local spec named "${name}".`,
              [
                'Run: lattice spec list to see available local spec files.',
                'Check the name is correct and that the file exists in .lattice/specs/.',
              ]
            );
            return;
          }
          console.log(fs.readFileSync(file, 'utf8'));
        } else {
          const result = await request('POST', '/api/specs/sync/pull', { filter: name }, flags['api-url']);
          if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
          console.log(JSON.stringify(result.data, null, 2));
        }
        break;
      }
      console.error('Unknown spec action');
      break;
    }

    case 'mutation': {
      if (action === 'propose') {
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
        const result = await request('POST', '/api/mutations/propose', { spec, change: change, metadata: metadata || null, autoApply: !!autoApply }, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'status') {
        const { id } = flags; if (!requireFlag(flags, ['id'], 'lattice mutation status --id mut_123')) return;
        const result = await request('GET', `/api/mutations/${id}`, undefined, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'approve' || action === 'reject') {
        const { id, note, reason } = flags; if (!requireFlag(flags, ['id'], `lattice mutation ${action} --id mut_123`)) return;
        const body = { id, action: action === 'approve' ? 'approve' : 'reject' };
        if (note) body.note = note; if (reason) body.note = reason;
        const result = await request('POST', `/api/approvals/${id}/respond`, body, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'list') {
        const result = await request('GET', '/api/mutations', undefined, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'show') {
        const { id } = flags; if (!requireFlag(flags, ['id'], 'lattice mutation show --id mut_123')) return;
        const result = await request('GET', `/api/mutations/${id}`, undefined, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      console.error('Unknown mutation action');
      break;
    }

    case 'deploy': {
      const { 'mutation-id': mutationId, env, strategy, wait } = flags;
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
      const result = await request('POST', '/api/deployments/trigger', { mutationId, env, strategy, wait: !!wait }, flags['api-url']);
      if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
      console.log(JSON.stringify(result.data, null, 2));
      break;
    }

    case 'risk': {
      if (action === 'assess') {
        const { id, policy } = flags; if (!requireFlag(flags, ['id'], 'lattice risk assess --id mut_123')) return;
        const result = await request('POST', `/api/mutations/${id}/risk-assessment`, { id, policy }, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      console.error('Unknown risk action');
      break;
    }

    case 'mcp': {
      if (action === 'status') {
        const result = await request('GET', '/api/mcp/status', undefined, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'sync') {
        const { direction, profile } = flags; if (!direction || !['push', 'pull'].includes(direction)) {
          printFriendlyError(
            'Please specify how you want to sync MCP metadata.',
            [
              'Use --direction push to send local MCP data to the server.',
              'Use --direction pull to fetch MCP data from the server.',
              'Example: lattice mcp sync --direction pull',
            ]
          );
          return;
        }
        const result = await request('POST', '/api/mcp/sync', { direction, profile }, flags['api-url']);
        if (!result.ok) return explainHttpFailure(result, { apiUrl: flags['api-url'] });
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      console.error('Unknown mcp action');
      break;
    }

    default:
      console.error(`Unknown group: ${group}`);
      printHelp();
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