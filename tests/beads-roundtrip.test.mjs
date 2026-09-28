import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

// Explicit opt-in: this creates a new disposable embedded store, never an existing
// project or the user's shared server. Ordinary structural tests need no Beads.
test('Beads records round-trip, dependencies gate readiness, and claims reject another owner', {
  skip: process.env.CHECKSUM_TEST_BEADS !== '1' && 'set CHECKSUM_TEST_BEADS=1 for the disposable-store integration test',
  timeout: 120_000,
}, () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'checksum-beads-test-'));
  const repo = join(sandbox, 'repo');
  const home = join(sandbox, 'home');
  mkdirSync(repo);
  mkdirSync(home);
  const env = {
    PATH: process.env.PATH,
    HOME: home,
    XDG_CONFIG_HOME: join(home, '.config'),
    USER: 'checksum-test',
    LOGNAME: 'checksum-test',
    CI: 'true',
    BD_NON_INTERACTIVE: '1',
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
  };
  function run(command, args, expected = 0) {
    const result = spawnSync(command, args, {
      cwd: repo, env, encoding: 'utf8', timeout: 30_000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, expected,
      `${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
    return result.stdout;
  }
  const bd = (...args) => run('bd', ['-C', repo, '--sandbox', ...args]);
  const json = (...args) => JSON.parse(bd(...args, '--json'));
  const item = (value) => Array.isArray(value) ? value[0] : value;
  try {
    run('git', ['init', '--quiet']);
    run('git', ['config', 'user.name', 'Checksum test']);
    run('git', ['config', 'user.email', 'checksum-test@example.invalid']);
    // No --server/--shared-server/remote; bd 1.2.2 defaults to embedded Dolt.
    // -C requires an existing Beads project, so initialize in the explicit cwd.
    run('bd', ['--sandbox', 'init', '--prefix', 'cst', '--skip-agents', '--skip-hooks', '--non-interactive']);
    const root = item(json('create', '--type', 'epic', '--title', 'Portable workflow',
      '--description', '## Scope\nDisposable round-trip fixture\n## Plan\nTwo dependent tasks',
      '--design', 'Design revision one',
      '--metadata', '{"checksum.contract":"checksum.workflow/v1","checksum.work_backend":"beads"}')).id;
    assert.ok(root);
    const first = item(json('create', '--type', 'task', '--parent', root,
      '--title', 'First task', '--acceptance', 'Run: true\nExpect: exit 0')).id;
    const second = item(json('create', '--type', 'task', '--parent', root,
      '--title', 'Second task')).id;
    bd('dep', 'add', second, first);
    const ready = () => json('--readonly', 'ready', '--parent', root, '--unassigned', '--limit', '0')
      .map((task) => task.id);
    assert.ok(ready().includes(first));
    assert.ok(!ready().includes(second), 'blocked successor must not be ready');
    bd('--actor', 'worker-one', 'update', first, '--claim');
    const claimed = item(json('--readonly', 'show', first));
    assert.equal(claimed.assignee, 'worker-one');
    assert.equal(claimed.status, 'in_progress');
    const conflict = spawnSync('bd', [
      '-C', repo, '--sandbox', '--actor', 'worker-two', 'update', first, '--claim',
    ], { cwd: repo, env, encoding: 'utf8', timeout: 30_000 });
    assert.ifError(conflict.error);
    assert.notEqual(conflict.status, 0, 'a different actor must not steal a claim');
    assert.equal(item(json('--readonly', 'show', first)).assignee, 'worker-one');
    bd('update', first, '--append-notes', '## Verification\nrevision fixture-v1; true exited 0',
      '--set-metadata', 'checksum.session=test-session-one');
    bd('update', first, '--status', 'closed');
    assert.ok(ready().includes(second), 'closing prerequisite must release successor');
    bd('update', root, '--set-metadata', 'checksum.plan_state=Validated',
      '--set-metadata', 'checksum.delivery_status=pr-ready',
      '--set-metadata', 'checksum.merge_state=unmerged');
    const restored = item(json('--readonly', 'show', root));
    assert.equal(restored.design, 'Design revision one');
    assert.equal(restored.metadata['checksum.contract'], 'checksum.workflow/v1');
    assert.equal(restored.metadata['checksum.plan_state'], 'Validated');
    assert.equal(restored.metadata['checksum.delivery_status'], 'pr-ready');
    assert.equal(restored.metadata['checksum.merge_state'], 'unmerged');
    const restoredTask = item(json('--readonly', 'show', first));
    assert.equal(restoredTask.acceptance_criteria, 'Run: true\nExpect: exit 0');
    assert.match(restoredTask.notes, /revision fixture-v1/);
    assert.equal(restoredTask.metadata['checksum.session'], 'test-session-one');
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
