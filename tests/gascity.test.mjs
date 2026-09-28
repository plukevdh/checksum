import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) => readFileSync(join(root, path), 'utf8');
const adapter = 'adapters/gascity';
const contracts = {
  build: 'build-base',
  planning: 'planning-base',
  decomposition: 'decomposition-base',
  implementation: 'implement',
  work: 'do-work',
  'work-item': 'do-work-item',
  review: 'code-review-base',
};

test('GasCity imports the single shared methodology and pins its host contracts', () => {
  assert.ok(existsSync(join(root, 'pack.toml')), 'missing root skill pack');
  assert.match(read('pack.toml'), /name = "checksum"[\s\S]*schema = 2/);
  const pack = read(`${adapter}/pack.toml`);
  assert.match(pack, /\[imports.checksum\]\nsource = "\.\.\/\.\."/);
  assert.match(pack, /version = "sha:3b3b89f2011e06d84459aa7bea1552382f13930a"/);
  assert.deepEqual(readdirSync(join(root, adapter, 'skills')), ['binding']);
});

test('methodology formulas extend installed contracts rather than copying graphs', () => {
  for (const [name, base] of Object.entries(contracts)) {
    const source = read(`${adapter}/formulas/checksum-${name}.formula.toml`);
    assert.match(source, new RegExp(`extends = \\["${base}"\\]`));
    assert.match(source, /contract = "graph.v2"/);
    assert.doesNotMatch(source, /\[vars\.(?:issue|bead_id|convoy_id)\]/);
    // GasCity replaces whole step blocks, not individual fields. The installed
    // evaluator below checks preserved dependencies, metadata and bounded gates.
    assert.doesNotMatch(source, /\[\[template\]\]/);
  }
});

test('review repair uses the GasCity expansion and check loop, not the fix selector', () => {
  const loop = read(`${adapter}/formulas/checksum-review-loop.formula.toml`);
  assert.match(loop, /type = "expansion"/);
  assert.match(loop, /path = "\.gc\/scripts\/checks\/implementation-review-approved\.sh"/);
  assert.match(loop, /id = "\{target\}\.independent-review"[\s\S]*"gc\.run_target" = "checksum-host\.reviewer"/);
  assert.match(loop, /id = "\{target\}\.apply-findings"[\s\S]*"gc\.run_target" = "\{implementation_target\}"/);
  const build = read(`${adapter}/formulas/checksum-build.formula.toml`);
  assert.match(build, /id = "review"[\s\S]*?expand = "checksum-review-loop"/);
  assert.match(build, /\[vars\.review_fix_formula\]\ndefault = "fix-loop-base"/);
  assert.ok(!existsSync(join(root, adapter, 'formulas/checksum-fix-loop.formula.toml')));
  for (const lane of ['independent-review', 'apply-findings']) {
    const body = read(`${adapter}/assets/workflows/checksum-review-loop/{target}.${lane}.md`);
    assert.match(body, /Do not invoke provider-native subagents/);
  }
  assert.match(read(`${adapter}/assets/workflows/checksum-review-loop/{target}.apply-findings.md`), /HEAD moved[\s\S]*iterate/);
});

test('the host provisions named-branch workspaces under recorded authority', () => {
  const prepare = read(`${adapter}/assets/workflows/checksum-build/prepare.md`);
  const task = read(`${adapter}/assets/workflows/checksum-work/prepare-worktree.md`);
  const decompose = read(`${adapter}/assets/workflows/checksum-build/decompose.md`);
  for (const body of [prepare, task]) {
    assert.match(body, /Authority/);
    assert.match(body, /\.beads\/redirect/);
    assert.doesNotMatch(body, /worktree add[^\n`]*--detach/);
  }
  assert.match(prepare, /checksum\.work_dir/);
  assert.match(task, /--set-metadata work_dir=[\s\S]*branch=/);
  assert.match(decompose, /same-session[\s\S]*work_dir/);
  assert.match(read(`${adapter}/formulas/checksum-work.formula.toml`), /checksum-work\/prepare-worktree\.md/);
});

test('the host integrates task branches before summary and review, never pushing', () => {
  const integrate = read(`${adapter}/assets/workflows/checksum-integrate/integrate.md`);
  assert.match(integrate, /topologically over the `blocks` edges/);
  assert.match(integrate, /merge-base --is-ancestor/, 'resume must skip already-landed members');
  assert.match(integrate, /git -C "\$MEMBER_WT" rebase "\$WORK_BRANCH"/, 'rebase runs in the task worktree');
  assert.match(integrate, /git -C "\$MEMBER_WT" rebase --abort[\s\S]*checksum_integration_conflict/);
  assert.match(integrate, /git -C "\$WORK_DIR" merge --ff-only/);
  assert.match(integrate, /## Integrated verification \(both policies\)[\s\S]*checksum_integration_verification/);
  assert.match(integrate, /## Resume after a block/);
  assert.match(integrate, /checksum\.integrated=<TASK_BRANCH>@<PRE>\.\.<POST>/);
  assert.match(integrate, /checksum\.integrated_revision/);
  assert.match(integrate, /Never push/);
  assert.doesNotMatch(integrate, /--force|\bgit push\b/);
  // Dependent tasks must see prerequisite code before integration lands it.
  assert.match(read(`${adapter}/assets/workflows/checksum-work/prepare-worktree.md`), /\*\*Start point\.\*\*[\s\S]*blocks`-depends/);
  // Every lane commits so review and integration operate on SHAs.
  assert.match(read(`${adapter}/assets/workflows/checksum-review-loop/{target}.apply-findings.md`), /Commit the fixes[\s\S]*gc\.build\.code_review_subject_revision/);
  assert.match(read(`${adapter}/assets/workflows/checksum-review-loop/{target}.setup-review.md`), /checksum\.integrated_revision/);
  assert.match(read(`${adapter}/assets/workflows/checksum-build/publish.md`), /descend from `checksum\.integrated_revision`/);
  for (const [name, drain, next] of [['build', 'implement", "implement-same-session', 'summarize-implementation'], ['implementation', 'wait-for-drain', 'summarize']]) {
    const source = read(`${adapter}/formulas/checksum-${name}.formula.toml`);
    assert.match(source, new RegExp(`id = "integrate"\\n[^\\n]*\\nneeds = \\["${drain}"\\]`), `${name}: integrate follows the drain`);
    assert.match(source, new RegExp(`id = "${next}"\\n[^\\n]*\\nneeds = \\["integrate"\\]`), `${name}: summary follows integrate`);
  }
});

test('both publishing entrypoints replace inherited delivery with checksum-finish', () => {
  for (const name of ['build', 'implementation']) {
    const source = read(`${adapter}/formulas/checksum-${name}.formula.toml`);
    assert.match(source, /id = "publish"[\s\S]*description_file = "\.\.\/assets\/workflows\/checksum-build\/publish\.md"/);
  }
  const publish = read(`${adapter}/assets/workflows/checksum-build/publish.md`);
  assert.match(publish, /checksum\.checksum-finish/);
  assert.match(publish, /push=false/);
  assert.match(publish, /gc\.build\.publish_status/);
  assert.match(publish, /NEVER merge/);
});

test('every adapter role loads the shared boundary after the host claim protocol', () => {
  for (const role of ['operator', 'implementer', 'reviewer', 'finisher']) {
    const prompt = read(`${adapter}/agents/${role}/prompt.template.md`);
    assert.match(prompt, /template "gc-role-worker"/);
    assert.match(prompt, /template "checksum-binding"/);
  }
  const binding = read(`${adapter}/skills/binding/SKILL.md`);
  for (const required of [
    'work-backend=beads', 'execution-host=gascity', 'approval-policy=pr-gated',
    'checksum.workflow/v1', 'Validated(policy)', 'Approved(human)',
    'checksum.checksum-design', 'checksum.checksum-plan', 'checksum.checksum-execute',
    'checksum.checksum-debug', 'checksum.checksum-finish',
    'revision', 'model', 'completion set', 'bd --readonly',
  ]) assert.ok(binding.includes(required), `missing boundary: ${required}`);
});

test('installed GasCity preserves graph invariants and relocated shared skills', {
  skip: !process.env.CHECKSUM_GASCITY_SOURCE && 'set CHECKSUM_GASCITY_SOURCE to the pinned local gascity directory',
}, () => {
  execFileSync(process.execPath, [
    join(root, adapter, 'checks/evaluate.mjs'), process.env.CHECKSUM_GASCITY_SOURCE,
  ], { cwd: root, env: process.env, stdio: 'inherit', timeout: 120_000 });
});
