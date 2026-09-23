import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

// CLI surface check only: no database discovery, writes, init, or mocked backend.
const version = spawnSync('bd', ['--version'], { encoding: 'utf8' });
const unavailable = version.error?.code === 'ENOENT';
const commands = [
  [[], ['--directory', '--readonly', '--actor']],
  [['context'], ['--json']],
  [['info'], ['--json']],
  [['create'], ['--dry-run', '--type', '--title', '--parent', '--body-file',
    '--design-file', '--acceptance', '--metadata']],
  [['update'], ['--claim', '--append-notes', '--set-metadata', '--design-file',
    '--status']],
  [['ready'], ['--parent', '--unassigned', '--limit', '--json']],
  [['show'], ['--children', '--json']],
  [['dep', 'add'], ['--blocked-by']],
  [['dep', 'list'], ['--json']],
];

test('installed Beads supports documented command surface (not integration)', {
  skip: unavailable ? 'bd is not installed; help compatibility not checked' : false,
}, async (t) => {
  assert.equal(version.status, 0, version.stderr || String(version.error));
  t.diagnostic(version.stdout.trim());
  for (const [command, flags] of commands) {
    await t.test(`bd ${[...command, '--help'].join(' ')}`, () => {
      const result = spawnSync('bd', [...command, '--help'], {
        encoding: 'utf8',
        timeout: 10_000,
      });
      assert.equal(result.status, 0, result.stderr || String(result.error));
      for (const flag of flags) {
        assert.ok(result.stdout.includes(flag), `help missing ${flag}`);
      }
    });
  }
});
