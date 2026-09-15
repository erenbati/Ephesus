# The record catches up, and the protocol that should have kept it current

Two changes filed together because the second exists to prevent the first:
`docs/PROGRESS.md` gains the M8b and M8c milestones it never recorded, and
`.claude/skills/ephesus-engineer/SKILL.md` makes the operating protocol —
consultation, invariants, evidence tiers, honest reporting — an explicit,
loadable standard rather than something each session rediscovers.

## 1. Problem / motivation

A project-status pass on 2026-09-15 read `origin/main` @ `fe8d4a2` and found the
authoritative record materially wrong about the project's own state.

**PROGRESS.md's last entry was dated 2026-09-06 and contained zero mentions of M8b
or M8c.** In the nine days between, sixteen work packages landed on `main`, each with
an implementation doc and a merge commit: five M8b packages (2026-09-09) and eleven
M8c packages (2026-09-09/10, being M8c.1–M8c.10 plus the M8c.3b follow-up merged as
PR #57).

This is not cosmetic. PROGRESS.md's own header states the contract:

> The next session resumes at the first unchecked box.

With M8b and M8c absent, the first unchecked box was **M6.9** — a package marked
*DEFERRED INDEFINITELY* — followed by the M7b block. A session honouring the stated
contract would have restarted two milestones behind the code, and would have had no
way to discover that from the file it was told to trust.

The second problem is the first one's cause. Ephesus has six task skills (`/goal`,
`/build-package`, `/milestone-review`, `/doc-sync`, `/improve`, `/research`) and a
large documentation suite, but **no single statement of how an engineer is expected
to behave inside them** — when the Architect must be consulted rather than second-
guessed, what evidence is strong enough to call something done, and which verification
mistakes this build has already paid for. Those rules existed only as scar tissue
distributed across implementation docs and close-out audits. The ONFLY project solves
the same problem with a single `onfly-engineer` protocol skill; this change gives
Ephesus its equivalent.

## 2. What changed

| File | Change |
|---|---|
| `docs/PROGRESS.md` | New `## M8b` section (5 ticked packages + an unticked exit box) and `## M8c` section (11 ticked packages + an unticked exit box), spliced between the end of M8 and `## M7b`. Closes with a dated record note stating when and from what the sections were written. +240 lines. |
| `.claude/skills/ephesus-engineer/SKILL.md` | New. The senior-engineer operating protocol: the contract and its precedence order, the questions workflow, the invariants, evidence-tiered verification reporting, goal mechanics and the GOAL REPORT format, and safety. |
| `README.md` | The `<!-- landed: -->` marker gains `M8b M8c`, and the "Landed so far" narrative gains three paragraphs covering both milestones and closing on the fact that the unattended hour has still never completed. Required, not optional — see §3. |
| `docs/AUTOMATION.md` | One row added to the Skills table for `/ephesus-engineer`. |
| `CLAUDE.md` | The project-skills paragraph now leads with `/ephesus-engineer` and marks it as the standard the others are executed to. |
| `docs/status/2026-09-15-status.md` | New. The dated status snapshot the audit produced, so the next status run reports movement rather than an absolute. |

No source file under `src/` was touched.

## 3. Implementation approach

### The PROGRESS sections

Each entry was written **from the package's own implementation doc**, never from the
commit subject and never from recollection. For every package the doc's §1 supplied the
defect and the finding number it closes, and its verification section supplied the
figures quoted in the evidence note — suite totals in the project's own
`Test Files N passed · Tests N passed, M skipped` form, and mutation results in the
`killed: N of N real · control survived · ROUND OK` form the rounds actually report.

Three deliberate constraints:

1. **No box was ticked that its implementation doc did not already evidence.** The
   sixteen package boxes rest on tier C — a merge commit plus a record. Nothing was
   re-run to produce the entry, and the record note says so in the file itself.
2. **Both exit boxes stay unticked, and say why at length.** M8b's exit (a non-author
   clean-clone re-run of `docs/EXIT-M8.md`) and M8c's exit (an unattended run inside a
   stated ceiling, plus three further clauses) are *the same run*, and it has never been
   carried to completion. The M8c exit box says this, names the four packages that make
   the run possible for the first time, and states that M7b sits behind it.
3. **A remembered attempt is recorded as owed, not as evidence.** An M8c rehearsal is
   remembered as aborted seconds into the hour when the machine moved. The repository
   holds no artifact of it. The box records the recollection and labels it a
   recollection; the only durable trace of *any* attempt is M8c.3b, whose own record
   says it was found "five minutes in, before any agent had been hired".

Packages are listed in number order for readability, with the actual build order
(10, 1, 8, 2, 3, 4, 5, 6, 7, 9, 3b) stated in the section preamble — it is recoverable
from the monotonically rising suite totals in the evidence notes, so listing it avoids
a reader mistaking those numbers for inconsistency.

### The README, and the gate that demanded it

Updating PROGRESS.md turned `scripts/check-readme-current.cjs` red, which is the gate
doing exactly its job: it compares the register's ticked packages against the README's
`<!-- landed: -->` marker and reported sixteen packages ticked in the register and
absent from the front door. Because the script keys on the numeric milestone, M8, M8b
and M8c are one group, so the marker needed the two tokens `M8b` and `M8c`.

Adding two tokens would have made the check pass. The script's own comment says why
that is not enough:

> It cannot catch someone editing this line without writing the sentence, and is not
> meant to.

So the narrative was written too — three paragraphs in the section's established voice:
what M8b fixed (the crew could act on nothing), what M8c fixed (the hour was unbounded
and the harness described itself in a vocabulary its reader did not share), and a
closing paragraph stating plainly that the unattended hour has still never been run to
completion and that M8b's exit, M8c's exit and M7b all wait on it. A front door that
listed sixteen packages while implying the milestone was finished would reintroduce the
exact misreading the status audit found.

### The skill

Structured section-for-section on `onfly-engineer`, because the shape has already been
validated in use: contract → questions → standards → verification → goal mechanics →
safety. The content is entirely Ephesus's.

The part with no ONFLY counterpart is §3's **"the eight rules this project paid for"**.
Each is a defect this build actually shipped, stated as an operational rule with the
incident attached so it reads as evidence rather than as advice — a green suite is not
a wired feature (M6's 1406 unreachable lines); a mutation round needs a control (three
M8b rounds reported scores they had not earned); refute a new gate before closing it
(M8.0's 40 green tests and 9 killed mutants hid three bypasses); a number without its
condition is not evidence; and so on. The blocking sentinel is `EPHESUS-BLOCKED:`,
mirroring ONFLY's.

## 4. Mathematical / statistical details

None. This is a documentation and process change; no formula, statistical test or
numeric algorithm is introduced. The figures quoted in the PROGRESS entries are
transcriptions of measurements recorded elsewhere, not new computations — and the
skill's own §3 rule 8 ("a number without its condition is not evidence") is the reason
each is quoted with the package that produced it rather than aggregated into a total.

## 5. Design decisions

**Where the skill lives.** `.claude/skills/ephesus-engineer/SKILL.md`, alongside the
six existing project skills, all of which are tracked in git. A global skill under
`~/.claude/skills/` was rejected: the protocol cites this repository's invariants, ADR
numbers and branch policy, so it belongs under the same review as the rules it restates.

**An umbrella protocol rather than a seventh task skill.** `/ephesus-engineer` performs
no task. It was tempting to fold it into `/goal`, but `/goal` is invoked for milestone
runs and the protocol governs *any* work in the repository — including a one-line doc
fix, where the consultation rule matters just as much. The skill says explicitly that
it does not replace the task skills and points at each of them.

**Restating the invariants instead of linking to them.** Duplication is a documented
risk in this repo — CLAUDE.md's own rule is that a requirement lives in one place and
is linked from everywhere else. The thirteen invariants are restated anyway, condensed,
because BUILD-PROMPT §3's own framing is that they are "violated by habit", and a
protocol that requires a second file to be opened before a diff is checked will not be
consulted. The full list is named as authoritative in the same sentence.

**Writing the exit boxes long.** The alternative was two terse unticked lines. They are
written at length because the status audit showed the failure mode is a reader inferring
completion from the absence of a marker; an exit box that states what is missing, what
is remembered versus recorded, and what sits behind it cannot be misread that way.

**Leaving M6.9 and the Gymnasium ledger alone.** The same audit found M6.9 marked
*DEFERRED INDEFINITELY* while a complete 22-file implementation sits unmerged on
`feature/m6-9-severity-1-announcements`, and four Gymnasium success metrics (GYM-002
through GYM-005) that came due 2026-09-11 with no recorded outcome. Both are real record
gaps. Neither was touched here: the scope approved was M8b and M8c, and changing a
milestone's deferral status or closing a Gymnasium metric are Architect decisions, not
bookkeeping. They are recorded in the status snapshot and owed.

## 6. Verification

What was run this session:

```bash
python ~/.claude/skills/project-status/scripts/collect_state.py --json
```

Established the authoritative ref (`origin/main` @ `fe8d4a2`), a clean working copy at
zero drift, four unmerged branches and no open PRs.

```bash
grep -cE '^- \[x\]' docs/PROGRESS.md   # 93 before -> 109 after
grep -cE '^- \[ \]' docs/PROGRESS.md   # 11 before -> 13 after
```

Exactly +16 ticked (the sixteen landed packages) and +2 unticked (the two exit boxes).
No pre-existing box changed state.

```bash
sed -n '6617,6856p' docs/PROGRESS.md | grep -oE "\]\(([a-z0-9/._-]+)\)" | ...
```

All 19 relative links in the new sections resolve to files that exist — the sixteen
implementation docs, both demo records, and the status snapshot.

Section boundaries were inspected directly: the M8 section ends intact at the DD-7
paragraph, `## M8b` follows, `## M8c` follows that, and `## M7b` resumes unmodified.

All four checks of the CI **Docs integrity** job were run locally, on this tree, this
session — tier A:

```
links: 0          # the job's relative-link loop over docs/, .claude/ and the root
attribution: 0    # attribution ok (524 commits reachable from HEAD; 237 on main's first-parent chain)
readme: 0         # README landed list is current for M8 (32 package(s))
```

`check-readme-current.cjs` exited **1** before the README was updated and **0** after,
so the gate was observed failing and passing rather than only passing — the run that
proves a check can report a defect. No accepted ADR was touched, so the append-only
check has nothing to find.

```
npm run typecheck   # exit 0 — node, preload, web and web-test projects
```

**What was NOT verified, and should be before this is relied on:**

- `npm run lint` and `npm test` were **not run**. No file under `src/` or `test/`
  changed and typecheck is green across all four projects, so neither is expected to
  move — but that is an argument, not a measurement.
- The sixteen package entries are **tier C throughout**: merge commits and
  implementation docs. Nothing was re-executed to confirm the quoted suite totals or
  mutation scores. If a figure in an implementation doc was wrong when written, it is
  wrong here too.
- The skill has not yet been exercised on a real work package. Whether the protocol
  changes behaviour is unmeasured; the honest claim today is only that it is written
  down and loadable.

## 7. Related docs

- [PROGRESS](../PROGRESS.md) — the M8b and M8c sections added here
- [IMPLEMENTATION](../IMPLEMENTATION.md) — the M8b and M8c plans these sections close
- [EXIT-M8](../EXIT-M8.md) — the run both exit boxes wait on
- [The M8 exit run](../demo/m8-onehour-aftershock.md) — the findings M8b and M8c close
- [The M8b rehearsal](../demo/m8b-rehearsal-m8b-rehearsal.md) — findings A–D
- [Status snapshot 2026-09-15](../status/2026-09-15-status.md) — the audit that found the gap
- [README](../../README.md) — the landed list and marker this change had to keep current
- [AUTOMATION](../AUTOMATION.md) — the skill table
- [ENGINEERING-STANDARDS](../ENGINEERING-STANDARDS.md) — the rules the skill restates
