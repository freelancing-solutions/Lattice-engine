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
    const res = await fetch(url, {
      method,
      headers,
      body: payload,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch (_) { data = text; }
    return { status: res.status, ok: res.ok, data };
  }

  // https fallback
  const urlObj = new URL(url);
  const options = {
    method,
    headers,
  };
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
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
  return response;
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
      if (!username || !password) {
        console.error('Missing --username or --password');
        process.exitCode = 1;
        return;
      }
      const result = await request('POST', '/api/auth/login', { username, password }, flags['api-url'], false);
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
          console.error('Failed to logout:', err?.message || err);
          process.exitCode = 1;
        }
        break;
      }
      console.error('Unknown auth action');
      break;
    }

    case 'project': {
      if (action === 'init') {
      const { repo } = flags;
      if (!repo) {
        console.error('Missing --repo');
        process.exitCode = 1;
        return;
      }
      const result = await request('POST', '/api/projects/init', { repo }, flags['api-url']);
      console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      console.error('Unknown project action');
      break;
    }

    case 'spec': {
      if (action === 'generate') {
        const { description, save } = flags;
        if (!description) {
          console.error('Missing --description');
          process.exitCode = 1;
          return;
        }
        const result = await request('POST', '/api/specs/generate', { description, save: !!save }, flags['api-url']);
        console.log(JSON.stringify(result.data, null, 2));
        if (flags.save && result?.data?.name && result?.data?.content) {
          try {
            const dir = path.join(process.cwd(), '.lattice', 'specs');
            fs.mkdirSync(dir, { recursive: true });
            const file = path.join(dir, `${result.data.name}.json`);
            fs.writeFileSync(file, JSON.stringify(result.data.content, null, 2));
            console.log(`Saved spec to ${file}`);
          } catch (err) {
            console.warn('Failed to save spec:', err?.message || err);
          }
        }
        break;
      }
      if (action === 'create') {
        const { name, template, description } = flags;
        if (!name) { console.error('Missing --name'); process.exitCode = 1; return; }
        const dir = path.join(process.cwd(), '.lattice', 'specs');
        fs.mkdirSync(dir, { recursive: true });
        const file = path.join(dir, `${name}.json`);
        const content = { name, version: '1.0.0', description: description || 'Spec created by Lattice CLI', template: template || null };
        fs.writeFileSync(file, JSON.stringify(content, null, 2));
        console.log(`Created spec at ${file}`);
        break;
      }
      if (action === 'validate') {
        const { path: specPath } = flags;
        if (!specPath) { console.error('Missing --path'); process.exitCode = 1; return; }
        try {
          const text = fs.readFileSync(specPath, 'utf8');
          JSON.parse(text);
          console.log(JSON.stringify({ path: specPath, valid: true }, null, 2));
        } catch (err) {
          console.error(JSON.stringify({ path: specPath, valid: false, error: err?.message || String(err) }, null, 2));
          process.exitCode = 1;
        }
        break;
      }
      if (action === 'sync') {
        const { direction, filter } = flags;
        if (!direction || !['push', 'pull'].includes(direction)) { console.error('Missing or invalid --direction (push|pull)'); process.exitCode = 1; return; }
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
          console.log(JSON.stringify(result.data, null, 2));
        } else {
          const result = await request('POST', '/api/specs/sync/pull', { filter }, flags['api-url']);
          console.log(JSON.stringify(result.data, null, 2));
          const specs = result?.data?.specs || [];
          const dir = path.join(process.cwd(), '.lattice', 'specs');
          fs.mkdirSync(dir, { recursive: true });
          for (const s of specs) {
            const name = s.name || `spec-${Date.now()}`;
            const file = path.join(dir, `${name}.json`);
            fs.writeFileSync(file, JSON.stringify(s.content || s, null, 2));
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
          remote = (result?.data?.specs || []).map((s) => ({ name: s.name || 'unknown', source: 'remote' }));
        }
        const rows = source === 'local' ? local : source === 'remote' ? remote : local.concat(remote);
        console.log(JSON.stringify(rows, null, 2));
        break;
      }
      if (action === 'show') {
        const { name, source = 'local' } = flags;
        if (!name) { console.error('Missing --name'); process.exitCode = 1; return; }
        if (source === 'local') {
          const file = path.join(process.cwd(), '.lattice', 'specs', `${name}.json`);
          if (!fs.existsSync(file)) { console.error(`Spec not found: ${file}`); process.exitCode = 1; return; }
          console.log(fs.readFileSync(file, 'utf8'));
        } else {
          const result = await request('POST', '/api/specs/sync/pull', { filter: name }, flags['api-url']);
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
        if (!spec || !change) { console.error('Missing --spec or --change'); process.exitCode = 1; return; }
        const result = await request('POST', '/api/mutations/propose', { spec, change: change, metadata: metadata || null, autoApply: !!autoApply }, flags['api-url']);
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'status') {
        const { id } = flags; if (!id) { console.error('Missing --id'); process.exitCode = 1; return; }
        const result = await request('GET', `/api/mutations/${id}`, undefined, flags['api-url']);
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'approve' || action === 'reject') {
        const { id, note, reason } = flags; if (!id) { console.error('Missing --id'); process.exitCode = 1; return; }
        const body = { id, action: action === 'approve' ? 'approve' : 'reject' };
        if (note) body.note = note; if (reason) body.note = reason;
        const result = await request('POST', `/api/approvals/${id}/respond`, body, flags['api-url']);
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'list') {
        const result = await request('GET', '/api/mutations', undefined, flags['api-url']);
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'show') {
        const { id } = flags; if (!id) { console.error('Missing --id'); process.exitCode = 1; return; }
        const result = await request('GET', `/api/mutations/${id}`, undefined, flags['api-url']);
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      console.error('Unknown mutation action');
      break;
    }

    case 'deploy': {
      const { 'mutation-id': mutationId, env, strategy, wait } = flags;
      if (!mutationId || !env) { console.error('Missing --mutation-id or --env'); process.exitCode = 1; return; }
      const result = await request('POST', '/api/deployments/trigger', { mutationId, env, strategy, wait: !!wait }, flags['api-url']);
      console.log(JSON.stringify(result.data, null, 2));
      break;
    }

    case 'risk': {
      if (action === 'assess') {
        const { id, policy } = flags; if (!id) { console.error('Missing --id'); process.exitCode = 1; return; }
        const result = await request('POST', `/api/mutations/${id}/risk-assessment`, { id, policy }, flags['api-url']);
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      console.error('Unknown risk action');
      break;
    }

    case 'mcp': {
      if (action === 'status') {
        const result = await request('GET', '/api/mcp/status', undefined, flags['api-url']);
        console.log(JSON.stringify(result.data, null, 2));
        break;
      }
      if (action === 'sync') {
        const { direction, profile } = flags; if (!direction || !['push', 'pull'].includes(direction)) { console.error('Missing or invalid --direction'); process.exitCode = 1; return; }
        const result = await request('POST', '/api/mcp/sync', { direction, profile }, flags['api-url']);
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
  console.error('CLI error:', err?.message || err);
  process.exitCode = 1;
});