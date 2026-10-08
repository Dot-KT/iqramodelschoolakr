import { spawnSync } from 'node:child_process';

const mode = process.argv[2] ?? 'check';
const credential = spawnSync('git', ['credential', 'fill'], {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8',
  env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'Never' },
  timeout: 15000,
});
const fields = Object.fromEntries((credential.stdout ?? '').trim().split('\n').map(line => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1).trim()];
}));
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || fields.password;
if (!token) {
  console.log(JSON.stringify({ available: false, reason: 'No locally authenticated GitHub account. Connected GitHub app access is separate.' }));
  process.exit(2);
}
async function api(path, method = 'GET', body) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(25000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${data.message ?? ''}`);
  return data;
}
try {
  const user = await api('/user');
  if (mode === 'check') {
    console.log(JSON.stringify({ available: true, login: user.login }));
  } else if (mode === 'create') {
    const name = 'iqramodelschoolakr';
    let repository;
    try { repository = await api(`/repos/${user.login}/${name}`); }
    catch (error) {
      if (!error.message.includes(': 404 ')) throw error;
      repository = await api('/user/repos', 'POST', { name, description: 'IQRA Model School, Akure — official nursery and primary school website.', private: false, auto_init: false });
    }
    console.log(JSON.stringify({ login: user.login, repository: repository.full_name, url: repository.html_url, clone_url: repository.clone_url, empty: repository.size === 0 }));
  } else if (mode === 'pages') {
    const repository = `${user.login}/iqramodelschoolakr`;
    let pages;
    try { pages = await api(`/repos/${repository}/pages`); }
    catch (error) {
      if (!error.message.includes(': 404 ')) throw error;
      pages = await api(`/repos/${repository}/pages`, 'POST', { build_type: 'workflow' });
    }
    console.log(JSON.stringify({ repository, url: pages.html_url, status: pages.status, build_type: pages.build_type }));
  } else if (mode === 'domain') {
    const pages = await api(`/repos/${user.login}/iqramodelschoolakr/pages`, 'PUT', { cname: 'iqramodelschoolakr.com.ng' });
    console.log(JSON.stringify({ domain: pages.cname, url: pages.html_url, status: pages.status }));
  } else if (mode === 'status') {
    const repository = `${user.login}/iqramodelschoolakr`;
    const pages = await api(`/repos/${repository}/pages`);
    const runs = await api(`/repos/${repository}/actions/runs?per_page=3`);
    console.log(JSON.stringify({ url: pages.html_url, status: pages.status, domain: pages.cname, https_enforced: pages.https_enforced, runs: runs.workflow_runs.map(run => ({ id: run.id, status: run.status, conclusion: run.conclusion, url: run.html_url })) }));
  } else throw new Error('Unknown mode');
} catch (error) {
  console.error(error.message.replaceAll(token, '[redacted]'));
  process.exit(1);
}
