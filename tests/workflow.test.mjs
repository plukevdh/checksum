import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');
const skillNames = [
  'checksum', 'checksum-debug', 'checksum-design',
  'checksum-plan', 'checksum-execute', 'checksum-finish',
];

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

test('all six standalone skills keep discoverable frontmatter', () => {
  assert.deepEqual(readdirSync(join(root, 'skills')).sort(), [...skillNames].sort());
  for (const name of skillNames) {
    const body = read(`skills/${name}/SKILL.md`);
    assert.match(body, new RegExp(`^---\\nname: ${name}\\ndescription: .+\\n---\\n`));
  }
});

test('plugin manifests agree on identity and version', () => {
  const claude = JSON.parse(read('.claude-plugin/plugin.json'));
  const codex = JSON.parse(read('.codex-plugin/plugin.json'));
  const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'));
  const agents = JSON.parse(read('.agents/plugins/marketplace.json'));
  assert.equal(claude.name, 'checksum');
  assert.equal(codex.name, claude.name);
  assert.equal(codex.version, claude.version);
  assert.equal(marketplace.plugins[0].version, claude.version);
  assert.equal(agents.plugins[0].name, claude.name);
});

test('local Markdown links resolve in distributed skills and adapter docs', () => {
  const paths = [
    join(root, 'README.md'),
    join(root, 'docs/influences.md'),
    join(root, 'tests/scenarios.md'),
    ...filesUnder(join(root, 'skills')),
    ...(existsSync(join(root, 'adapters')) ? filesUnder(join(root, 'adapters')) : []),
  ].filter((path) => path.endsWith('.md'));
  for (const path of paths) {
    const body = readFileSync(path, 'utf8').replace(/```[\s\S]*?```/g, '');
    for (const [, target] of body.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
      if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(target)) continue;
      // Templates contain links relative to the eventual artifact, not this source.
      if (path.endsWith('-template.md') && (target === './design.md' || target.includes('<'))) continue;
      const destination = decodeURIComponent(target.split('#')[0]);
      assert.ok(existsSync(resolve(dirname(path), destination)),
        `${relative(root, path)} links to missing ${target}`);
    }
  }
});

test('portable contract and both backend mappings ship inside the router skill', () => {
  const base = 'skills/checksum/references';
  for (const name of ['workflow-contract.md', 'authorization.md', 'backends/files.md', 'backends/beads.md']) {
    assert.ok(existsSync(join(root, base, name)), `missing ${base}/${name}`);
  }
  assert.match(read(`${base}/workflow-contract.md`), /checksum\.workflow\/v1/);
  const preferences = read(`${base}/preferences.md`);
  for (const key of ['work-backend', 'execution-host', 'approval-policy']) {
    assert.ok(preferences.includes(key), `missing selectable ${key}`);
  }
});

test('unanswered design questions block planning and return to the user', () => {
  const design = read('skills/checksum-design/SKILL.md');
  const plan = read('skills/checksum-plan/SKILL.md');
  const template = read('skills/checksum-design/references/design-template.md');
  const contract = read('skills/checksum/references/workflow-contract.md');
  assert.match(design, /ask(?:s)? the user[\s\S]*do not defer it to[\s\S]*open questions/i);
  assert.match(design, /unanswered question remains Draft[\s\S]*ineligible for plan/i);
  assert.match(plan, /Before writing any plan or\s+task[\s\S]*no unanswered questions/i);
  assert.match(plan, /Do not copy a question into the plan[\s\S]*let an implementer choose/i);
  assert.match(template, /## Resolved Questions & Assumptions/);
  assert.doesNotMatch(template, /^## Open Questions/m);
  assert.match(contract, /Approved\/Validated means no unanswered\s+material questions/);
});

test('documented Beads metadata keys are valid for targeted updates', () => {
  const mapping = read('skills/checksum/references/backends/beads.md');
  const keys = [...mapping.matchAll(/^\| `(checksum\.[^`]+)` \|/gm)].map((match) => match[1]);
  assert.ok(keys.length > 0, 'backend must document its metadata keys');
  for (const key of keys) {
    assert.match(key, /^[a-zA-Z_][a-zA-Z0-9_.]*$/,
      `bd update --set-metadata rejects ${key}`);
  }
  assert.ok(keys.includes('checksum.delivery_status'));
  assert.ok(keys.includes('checksum.merge_state'), 'merge cannot be inferred from delivery');
});

test('Codex symlink and copy installs include the same self-contained skill references', () => {
  const sandbox = mkdtempSync(join(tmpdir(), 'checksum-install-test-'));
  try {
    for (const mode of ['symlink', 'copy']) {
      const home = join(sandbox, mode);
      const args = ['scripts/install-local.sh', '--codex'];
      if (mode === 'copy') args.push('--copy');
      execFileSync('sh', args, {
        cwd: root,
        env: { ...process.env, CODEX_HOME: home },
        stdio: 'pipe',
      });
      for (const name of skillNames) {
        assert.equal(readFileSync(join(home, 'skills', name, 'SKILL.md'), 'utf8'),
          read(`skills/${name}/SKILL.md`));
      }
      const contract = join(home, 'skills/checksum/references/workflow-contract.md');
      assert.ok(existsSync(contract), `${mode} install missing shared contract`);
      assert.equal(realpathSync(contract).startsWith(realpathSync(home)), mode === 'copy');
      for (const backend of ['files', 'beads']) {
        assert.ok(existsSync(join(home, `skills/checksum/references/backends/${backend}.md`)));
      }
    }
  } finally {
    rmSync(sandbox, { recursive: true, force: true });
  }
});
