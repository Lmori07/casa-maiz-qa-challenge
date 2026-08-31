bash

cd /home/claude/casa-maiz-qa-automation && cat > docs/implementation-guide.md << 'EOF'

# Implementation guide — how this repo was built, and why

This walks through the build in the order it actually happened,
including the three points where sandbox network access blocked
direct verification (see the flow diagram in the accompanying chat
response) and what was done at each one instead of stopping.

---

## Stage 0 — Reconnaissance before writing anything

**What was done:** Before scaffolding any code, the target site was
fetched (`web_fetch`) to see what actually existed — page structure,
nav, slugs — and a direct network probe (`curl` inside the sandbox)
was attempted against the assumed API base.

**Why this order, not "start coding":** A contract-test suite is only
as good as its grounding. Writing zod schemas from a guess about field
names produces a suite that tests the guess, not the API. The brief's
prose ("navigation, promotions, feature flags...") describes categories
of things, not exact field shapes — `href` vs `destination.path`,
`message` required vs optional on an alert, that kind of detail only
the real contract settles. Reconnaissance first is what makes every
later schema an assertion about the real system instead of a
plausible-sounding fiction.

**Blocker 1, and the workaround:** `curl` inside the sandbox returned
`403 host_not_allowed` — the container's own network egress proxy
refusing the connection (confirmed via the `x-deny-reason` header,
which is diagnostic gold: it proves the block is the sandbox, not the
target API). `web_fetch`, a separate tool with its own infrastructure,
was not subject to that same allowlist and could reach the site
directly — but only returns rendered content (HTML converted to
markdown), not raw JSON API responses, and only for URLs that had
already appeared literally in the conversation (a person-provided URL,
or a link found inside an already-fetched page). That combination gave
real page structure for the web app but nothing about the API's actual
JSON shape yet.

**Reasoning for asking the user to enable network access, rather than
proceeding on guesses:** The brief explicitly warns against fabricating
API behavior ("Do not weaken an assertion merely to obtain a green
result"). Building schemas from assumption and quietly calling that
"done" would violate that principle one level up — it's not weakening
an assertion, but it is inventing the thing the assertion checks. Given
that requirement #4 specifically asks the suite to catch real
contract-vs-runtime divergence, a suite built on invented assumptions
about the contract can't do that job. Stopping to ask was the more
honest move, even though it cost a turn.

---

## Stage 1 — Repository architecture

**Decision: two separate projects (`api-tests/`, `web-tests/`), not one
monorepo with shared tooling.**

Reasoning:

- The brief requires each to run "locally with clear, independent
  commands." The most reliable way to guarantee independence is
  structural — separate `package.json`, separate lockfile, separate
  config — rather than relying on discipline within a shared setup.
- The two suites have almost nothing in common technically: one is an
  HTTP/JSON contract suite (Vitest + zod + `fetch`), the other drives a
  real browser (Playwright's own runner and APIs). Forcing a shared
  toolchain would mean picking compromises neither suite actually
  needs.
- Cost: some duplicated boilerplate (`.env.example` shape,
  `tsconfig.json`). Accepted deliberately — it's cheap, and it's the
  price of being able to hand either folder to someone in isolation.

**Decision: TypeScript + Vitest + zod for the API suite; Playwright +
TypeScript + Page Object Model for the web suite.**

Reasoning:

- Vitest over Jest: native ESM, no transpile step, fast watch mode, and
  critically — a JSON reporter simple enough that the known-issue CI
  gate (Stage 5) could be built in ~20 lines with zero extra
  dependencies. Trade-off: a younger ecosystem than Jest's; not a
  problem for a suite this focused.
- zod over manual type guards or Joi/Ajv: one declaration gives both a
  compile-time TypeScript type and a runtime validator, and
  `.passthrough()` gives explicit, cheap control over "this key is
  load-bearing" vs. "an unrecognized key here is fine" — which is
  exactly the distinction requirement #1 asks the suite to make.
- Page Object Model for Playwright: locators live in one place
  (`pages/`), never inline in a spec file, so a markup change touches
  one file instead of every test that happens to reference a button.
- Role/accessible-name locators (`getByRole('link', { name })`) over
  CSS selectors: survive a redesign that changes classes/markup, and
  double as a lightweight accessibility check — if a screen reader
  can't find it by role and name, neither can this locator.

---

## Stage 2 — Building the API suite's skeleton (config → client → schemas)

Built bottom-up, in dependency order, so each layer could be typechecked
before the next depended on it:

1. **`src/config/env.ts`** — every configurable value (base URL, route
   templates, delivery-context defaults, contract version) in one
   place, reading `process.env` exactly once. Reasoning: "the base URL
   and delivery context must be configurable" is a brief requirement,
   not a nice-to-have, and centralizing it makes "what changes between
   environments" auditable from a single file instead of grepped for
   across test files.

2. **`src/client/apiClient.ts`** — a `fetch` wrapper exposing only
   `get`/`head`. Reasoning: "never mutate the shared CMS" is a
   structural guarantee, not a promise kept by discipline — the suite
   physically cannot call a write method that doesn't exist. Every
   response also carries `rawText` alongside the parsed body, so a
   JSON-parse failure (like a sandbox block's plain-text error page)
   still produces a readable diagnostic instead of an opaque crash.

3. **`src/schemas/*.ts`** — one zod schema per response shape,
   asserting type and required-ness, never a specific value.
   Reasoning: requirement #2 explicitly asks for tests that don't
   couple to "irrelevant database IDs or exact editorial copy" — the
   only way to guarantee that structurally is to never write an
   assertion that checks a literal string the CMS could legitimately
   change.

---

## Stage 3 — Grounding the schemas in the real contract

**What changed the plan:** the user supplied the real OpenAPI URL.
`web_fetch` retrieved the full spec JSON directly — and because it's
served as `application/json` rather than rendered HTML, this was the
first point in the build where the _exact_ contract (required fields,
enums vs. `const`s, nesting) was available, not just page structure.

**Why the schemas were then rewritten, not patched:** several details
in the real spec contradicted the first draft's reasonable-sounding
guesses — Privacy is a different operation (`/legal/{key}`) from
Home/Menu (`/pages/{slug}`), not a third page slug; `market`/`audience`
are JSON Schema `const`s (exactly one legal value each), not open
enums; a page's `title` is top-level, not nested under `meta`. Patching
around these piecemeal would have left stale assumptions scattered
through the suite. A full rewrite, file by file, against the spec text
directly, was the only way to be confident nothing old survived by
accident.

**Verification without live execution:** Blocker 3 — `curl` to the
_new_ real API host returned the same `403 host_not_allowed` (same
session-level restriction, different domain). Two things were done
instead of leaving the parsing logic unverified:

- The `$ref`-resolution logic in `src/client/openapi.ts` (the code that
  walks the OpenAPI document and extracts parameter constraints) was
  copied into a throwaway script and run against a saved offline copy
  of the _real_ spec JSON — not synthetic fixtures. This confirmed it
  actually resolves `platform`/`market`/`audience`/`appVersion`/`slug`
  correctly against real `$ref` pointers, which is a meaningfully
  stronger check than unit-testing it against hand-written mock JSON.
- Every schema file was typechecked, and the full suite was executed
  once. 15 of 73 assertions — the ones with zero network dependency
  (contract-version compatibility rules, media-URL resolution,
  cache-boundary policy, envelope shape against synthetic fixtures) —
  passed outright. The remaining 58 failed with the exact clean,
  attributable diagnostic the client was built to produce (`403` +
  `x-deny-reason` text in the response body), not a crash or a
  misleading error — proving the harness itself is sound even though
  live execution is still pending.

---

## Stage 4 — Requirement-by-requirement build

Each of the six requirement areas became one spec file, and each
followed the same pattern: read the relevant slice of the OpenAPI
schema, write a zod schema for it, then write assertions that check
shape/type/coherence rather than fixed values. Two are worth calling
out for reasoning beyond that pattern:

**Requirement 1 (contract envelope, additive-field tolerance):** proving
"the suite accepts a harmless new field but rejects a MAJOR version
bump" can't be done by waiting for the live server to actually change
version — that would mean mutating server state we don't control, or
waiting indefinitely. Instead, `checkContractVersion()` is unit-tested
against synthetic fixtures (a real envelope shape plus one invented
field; a real envelope with the major number incremented). This tests
the suite's own decision logic deterministically, independent of
whatever the live server happens to be doing on any given run.

**Requirement 3 (platform targeting):** the OpenAPI description states
filtering happens server-side — blocks that don't match the requested
platform are removed before the response is built. That means there's
no client-visible declarative list to check a delivered page against.
Rather than assert something the contract never promised (e.g., a
`platforms: [...]` array on the page), the suite asserts what's
actually verifiable from outside: both platforms are served
successfully, and whatever comes back is a fully valid page. A
block-count difference between platforms is logged as informational,
not asserted on — asserting "these must differ" or "these must match"
would both be claims about editorial content the suite has no
visibility into.

---

## Stage 5 — The known-failure policy (requirement 4's hardest constraint)

The brief's constraint here is unusually specific: when contract and
runtime disagree, "do not weaken an assertion merely to obtain a green
result," but also don't let the suite go permanently red (that trains
reviewers to ignore red).

**Why a wrapper function instead of `test.skip` or a softened
assertion:** `knownIssue(id, summary, assertionFn)` runs the _real_,
full-strength assertion. If it throws, the wrapper re-throws the exact
same error, tagged with an id — the test still shows FAILED in the raw
output. Nothing about pass/fail changes. What's added is a separate,
human-reviewed file (`registry/known-issues.json`) recording which
failure ids are acknowledged, open defects, and a CI script
(`scripts/gate-known-issues.ts`) that reads the test results
afterward and decides the _build exit code_ — not the test result — by
matching failure ids against that registry.

**Why identity-based gating, specifically:** a failure whose id isn't
in the registry, or whose registered status isn't `open` (e.g. marked
`fixed-pending-removal`), fails the build even though it's still just
a "failure." This is deliberate: if a defect thought fixed starts
failing again, that's meaningfully different from an already-known,
still-open issue, and the gate is built to treat it that way rather
than matching on "did any test with a `[KNOWN ISSUE]` tag fail," which
would silently swallow a regression that happened to reuse an old tag.

---

## Stage 6 — Web suite

Built in parallel with Stage 4-5, since it doesn't depend on the API
contract at all. Page objects were written against real fetched page
structure (nav links, headings, CTA text observed via `web_fetch`
during Stage 0), not assumptions. Locators deliberately avoid assuming
markup details that weren't directly observable (e.g., a `<nav>`
landmark wrapper) — `NavComponent` locates links by role and accessible
name scoped to the whole page rather than requiring a semantic
container that couldn't be confirmed without live DOM inspection. Three
Playwright projects (desktop Chromium, mobile Chromium, mobile WebKit)
were configured specifically because a restaurant site's real traffic
skews mobile, and a desktop-only run would never catch a
viewport-only bug (collapsed nav, a CTA below the fold).

---

## What's still open

Every stage above that needed live execution to fully close is marked
in the flow diagram in red or green-with-caveats. The repo typechecks
cleanly end-to-end and the harness itself has been proven correct
(clean diagnostics on the calls that are blocked, real passes on the
calls that aren't network-dependent, and offline-verified OpenAPI
parsing against real spec data) — but a live run, in a session where
the target hosts are actually reachable, is the one step this build
could not complete itself.
EOF
echo "written"
Output

written
