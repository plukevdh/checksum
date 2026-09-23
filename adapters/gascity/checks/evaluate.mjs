// Read-only installed-CLI evaluation. Creates only an isolated scratch fixture.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const revision = '3b3b89f2011e06d84459aa7bea1552382f13930a';
const source = resolve(process.argv[2] || '');
assert.ok(process.argv[2] && existsSync(join(source, 'pack.toml')),
  'usage: node adapters/gascity/checks/evaluate.mjs /local/pinned/gascity');
assert.equal(execFileSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), revision,
  'upstream checkout must match the declared pin');
const root = fileURLToPath(new URL('../../../', import.meta.url));
const scratch = mkdtempSync(join(process.env.DELTA_SCRATCH_DIR || tmpdir(), 'checksum-gc-'));
const repo = join(scratch, 'relocated-checksum');
const city = join(scratch, 'city');
mkdirSync(join(repo, 'adapters'), { recursive: true });
mkdirSync(join(city, '.gc'), { recursive: true });
cpSync(join(root, 'pack.toml'), join(repo, 'pack.toml'));
cpSync(join(root, 'skills'), join(repo, 'skills'), { recursive: true });
cpSync(join(root, 'adapters/gascity'), join(repo, 'adapters/gascity'), { recursive: true });
const pack = join(repo, 'adapters/gascity/pack.toml');
writeFileSync(pack, readFileSync(pack, 'utf8').replace(
  /source = "https:[^\n]+\nversion = "sha:[^\n]+/,
  `source = ${JSON.stringify(source)}`,
));
writeFileSync(join(city, 'city.toml'), `
[workspace]
name = "checksum-evaluation"
provider = "author"
[providers.author]
base = "builtin:claude"
[providers.review]
base = "builtin:codex"
[[rigs]]
name = "fixture"
[rigs.imports.checksum-host]
source = ${JSON.stringify(dirname(pack))}
[[rigs.patches]]
agent = "operator"
provider = "author"
[[rigs.patches]]
agent = "implementer"
provider = "author"
[[rigs.patches]]
agent = "reviewer"
provider = "review"
[[rigs.patches]]
agent = "finisher"
provider = "author"
`);
writeFileSync(join(city, '.gc/site.toml'), `
workspace_name = "checksum-evaluation"
[[rig]]
name = "fixture"
path = ${JSON.stringify(repo)}
`);
// Do not inherit a live agent's store/session or remote-city context.
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
  !/^(?:GC_|BEADS_|BD_|DOLT_)/.test(key)));
const run = (...args) => execFileSync('gc', ['--city', city, ...args], {
  cwd: city, env, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'],
});
const json = (...args) => {
  const output = JSON.parse(run(...args));
  assert.equal(output.ok, true, JSON.stringify(output));
  return output;
};
assert.equal(run('version').trim(), '1.4.1', 're-evaluate contracts before accepting another gc version');
assert.equal(json('lint', dirname(pack), '--json').passed, true);
run('config', 'show', '--validate');
const config = json('config', 'show', '--json');
const reviewer = config.config.Agents.find((agent) => agent.Name === 'reviewer');
const implementer = config.config.Agents.find((agent) => agent.Name === 'implementer');
assert.equal(reviewer.Provider, 'review');
assert.equal(implementer.Provider, 'author');
const skills = json('--rig', 'fixture', 'skill', 'list', '--agent', 'operator', '--json').entries;
for (const name of ['checksum', 'checksum-design', 'checksum-plan', 'checksum-execute', 'checksum-debug', 'checksum-finish']) {
  const entry = skills.find((entry) => entry.name === `checksum.${name}`);
  assert.ok(entry, `missing imported skill ${name}`);
  assert.equal(readFileSync(entry.path, 'utf8'), readFileSync(join(repo, 'skills', name, 'SKILL.md'), 'utf8'));
  assert.ok(entry.path.startsWith(repo), 'shared skill must resolve in relocated distribution');
}
assert.ok(skills.some((entry) => entry.name === 'checksum-host.binding'));
const contracts = {
  build: 'build-base', planning: 'planning-base', decomposition: 'decomposition-base',
  implementation: 'implement', work: 'do-work', 'work-item': 'do-work-item',
  review: 'code-review-base',
};
// Steps whose bodies the adapter deliberately replaces (host provisioning,
// checksum decomposition, finish-owned delivery); every other inherited body
// must compile identically to the upstream contract.
const replacedBodies = [/\.publish$/, /\.prepare-worktree$/, /^checksum-build\.(?:prepare|decompose)(?:\.|$)/, /^checksum-implementation\.prepare$/];
// Checksum inserts one host-owned `integrate` step between the drain and the
// summary in both publishing entrypoints. The graph must equal upstream's once
// that node is spliced out (edges into it re-pointed at its predecessors).
const integratePredecessors = {
  'checksum-build': { separate: ['implement'], 'same-session': ['implement-same-session'] },
  'checksum-implementation': { separate: ['wait-for-drain'], 'same-session': ['wait-for-drain'] },
};
const spliceIntegrate = (formula, policy, deps) => {
  const node = `${formula}.integrate`;
  const predecessors = deps.filter((dep) => dep.step_id === node).map((dep) => dep.depends_on_id);
  assert.deepEqual(predecessors.sort(), integratePredecessors[formula][policy].map((id) => `${formula}.${id}`),
    `${formula}/${policy}: integrate must follow exactly the drain that ran`);
  return deps.filter((dep) => dep.step_id !== node).flatMap((dep) => dep.depends_on_id === node
    ? predecessors.map((pred) => ({ ...dep, depends_on_id: pred })) : [dep]);
};
// build-base's review step is a single ralph task; checksum-build expands it
// into a review loop, so its dependency graph is compared to build-basic's
// expansion (the upstream mechanism) instead of the flat base.
const expandedSteps = (formula, steps) => steps.filter((step) => step.id.startsWith(`${formula}.review`));
json('--rig', 'fixture', 'formula', 'list', '--json');
for (const [suffix, base] of Object.entries(contracts)) {
  const name = `checksum-${suffix}`;
  for (const policy of ['separate', 'same-session']) {
    const args = ['--json', '--var', `drain_policy=${policy}`,
      '--var', 'interaction_mode=autonomous', '--var', 'implementation_target=checksum-host.implementer',
      '--var', 'implementation_formula=checksum-implementation', '--var', 'code_review_formula=checksum-review'];
    const upstream = json('--rig', 'fixture', 'formula', 'show', base, ...args);
    const adapter = json('--rig', 'fixture', 'formula', 'show', name, ...args);
    writeFileSync(join(scratch, `${name}-${policy}.json`), JSON.stringify(adapter, null, 2));
    const normalize = (value) => JSON.parse(JSON.stringify(value).replaceAll(name, base));
    const isReview = (id) => /\.review\b/.test(id);
    // Emission order is not a contract (the inserted node perturbs it); the set of
    // producer/check step ids and the dependency edges are.
    const ids = (steps, from = name) => steps.map((step) => step.id.replace(from, base)).sort();
    const integrates = ['build', 'implementation'].includes(suffix);
    const adapterDeps = integrates ? spliceIntegrate(name, policy, adapter.deps) : adapter.deps;
    const adapterSteps = adapter.steps.filter((step) => !(integrates && step.id === `${name}.integrate`));
    if (integrates) {
      const integrate = adapter.steps.find((step) => step.id === `${name}.integrate`);
      assert.ok(integrate, `${name}/${policy}: integrate must compile under both drain policies (no condition)`);
      assert.equal(integrate.metadata['gc.run_target'], 'checksum-host.operator');
      // Large bodies compile to an external prompt reference; read the resolved file.
      const resolved = integrate.description.match(/Resolved prompt file: `([^`]+)`/)?.[1];
      const prompt = resolved ? readFileSync(resolved, 'utf8') : integrate.description;
      assert.match(prompt, /rebase[\s\S]*--ff-only[\s\S]*Never push/, `${name}: integrate must rebase, fast-forward and never push`);
      assert.doesNotMatch(prompt, /\bgit push\b|--force/);
      const sorted = [...new Set(adapterDeps.map((dep) => JSON.stringify(dep)))].sort();
      assert.equal(sorted.length, adapterDeps.length, `${name}/${policy}: splice produced duplicate edges`);
    }
    if (suffix === 'build') {
      // Outside the review expansion the graph must match build-base exactly.
      const outside = (deps) => deps.filter((dep) => !isReview(dep.step_id) && !isReview(dep.depends_on_id));
      assert.deepEqual(outside(normalize(adapterDeps)), outside(upstream.deps), `${name}/${policy}: dependency or sink drift`);
      assert.deepEqual(ids(adapterSteps.filter((step) => !isReview(step.id))),
        ids(upstream.steps.filter((step) => !isReview(step.id)), base), `${name}/${policy}: missing producer/check steps`);
      // The review loop reuses GasCity's expansion + check-loop mechanism: same
      // control shape as build-basic-review, with checksum's two lanes.
      const reference = json('--rig', 'fixture', 'formula', 'show', 'build-basic', ...args);
      const shape = (formula, loopStep, steps) => expandedSteps(formula, steps).map((step) => [
        step.id.replace(formula, 'X').replaceAll(loopStep, 'LOOP'), step.metadata?.['gc.kind'] || '',
        step.metadata?.['gc.check_path'] || '',
        // Attempt bounds are checksum policy (three fix rounds + confirming review).
        step.metadata?.['gc.check_path'] === '.gc/scripts/checks/implementation-review-approved.sh' ? 'bounded' : step.metadata?.['gc.max_attempts'] || '',
      ]);
      const loop = shape(name, 'review-loop', adapter.steps);
      const starter = shape('build-basic', 'build-basic-review-loop', reference.steps);
      assert.equal(adapter.steps.find((step) => step.id.endsWith('.review.review-loop')).metadata['gc.max_attempts'], '4');
      const control = (rows) => rows.filter(([id]) => !/\.review\.(?:[a-z-]+-review|synthesize-review|apply-[a-z-]+)(?:-scope-check)?$/.test(id) && !/setup-/.test(id));
      assert.deepEqual(control(loop), control(starter), `${name}/${policy}: review loop control shape drift`);
      const lanes = loop.filter(([id]) => /iteration\.1\.review\.[a-z-]+$/.test(id) && !id.endsWith('-scope-check')).map(([id]) => id.split('.').pop());
      assert.deepEqual(lanes, ['independent-review', 'apply-findings']);
      const roles = expandedSteps(name, adapter.steps).map((step) => step.metadata?.['gc.run_target']).filter(Boolean);
      assert.ok(roles.length >= 5 && roles.every((role) => role.startsWith('checksum-host.')), `${name}/${policy}: review lanes ${roles}`);
      const reviewer = adapter.steps.find((step) => step.id.endsWith('.independent-review'));
      assert.equal(reviewer.metadata['gc.run_target'], 'checksum-host.reviewer');
      assert.equal(adapter.steps.find((step) => step.id.endsWith('.apply-findings')).metadata['gc.run_target'], 'checksum-host.implementer');
      const final = adapter.steps.find((step) => step.id === `${name}.review`);
      assert.equal(final.metadata['gc.build.artifact_schema'], 'gc.build.review.v1', 'review sink must keep the artifact contract');
      assert.equal(final.metadata['gc.check_path'], '.gc/scripts/checks/build-artifact-valid.sh');
      assert.equal(adapter.vars.find((variable) => variable.name === 'review_fix_formula').default, 'fix-loop-base',
        'the selector stays upstream-compatible; the expansion is the repair route');
    } else {
      assert.deepEqual(normalize(adapterDeps), upstream.deps, `${name}/${policy}: dependency or sink drift`);
      assert.deepEqual(ids(adapterSteps), ids(upstream.steps, base), `${name}/${policy}: missing producer/check steps`);
    }
    for (const before of upstream.steps) {
      const after = adapter.steps.find((step) => step.id === before.id.replace(base, name));
      if (!after && suffix === 'build' && isReview(before.id)) continue;
      for (const [key, value] of Object.entries(before.metadata || {})) {
        if (['gc.run_target', 'gc.drain_formula', 'gc.formula_name'].includes(key)) continue;
        assert.equal(after.metadata?.[key]?.replaceAll(name, base), value, `${after.id}: lost ${key}`);
      }
      const route = after.metadata?.['gc.run_target'];
      if (route) assert.ok(route.startsWith('checksum-host.') || route === '{{implementation_target}}',
        `${after.id}: unbound role ${route}`);
      if (after.metadata?.['gc.drain_formula']) assert.match(after.metadata['gc.drain_formula'], /^checksum-work(?:-item)?$/);
      if (!before.is_root && !replacedBodies.some((pattern) => pattern.test(after.id)) && !(suffix === 'build' && isReview(after.id))) {
        // Large inherited bodies compile to references plus formula-specific
        // variable hints; compare the referenced contract, not selector defaults.
        const body = (text) => {
          if (text?.startsWith('{"id":')) return body(JSON.parse(text).description);
          return text?.split('## Formula Variables')[0]
            .replaceAll('checksum-host.implementer', 'gc.implementation-worker');
        };
        assert.equal(body(after.description), body(before.description), `${after.id}: inherited body drift`);
      }
    }
    if (['build', 'implementation'].includes(suffix)) {
      for (const flag of ['push', 'open_pr']) {
        assert.equal(adapter.vars.find((variable) => variable.name === flag).default, 'false');
      }
      assert.match(adapter.steps.find((step) => step.id.endsWith('.publish')).description, /checksum\.checksum-finish/);
    }
  }
}
const source_files = ['checksum-build/prepare.md', 'checksum-build/decompose.md', 'checksum-integrate/integrate.md',
  'checksum-implementation/prepare.md', 'checksum-work/prepare-worktree.md'];
for (const file of source_files) {
  const text = readFileSync(join(root, 'adapters/gascity/assets/workflows', file), 'utf8');
  assert.doesNotMatch(text, /worktree add[^\n`]*--detach/, `${file}: host workspaces must be on named branches`);
  assert.match(text, /Authority/, `${file}: provisioning is bounded by recorded authority`);
}
console.log(`PASS: gc 1.4.1 lint, config, 14 contract compilations, review-loop expansion, integrate splice, graph/check invariants, provider patches, relocated skills. Evidence: ${scratch}`);
console.log('Not exercised: controller, Beads writes, provider sessions/materialization, model identity, review behavior, push or PR delivery.');
