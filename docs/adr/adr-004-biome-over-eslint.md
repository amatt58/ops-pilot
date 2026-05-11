# ADR-004: Biome over ESLint + Prettier

**Date:** 2026-05

---

## Context

TypeScript projects require a linter (to catch code quality issues) and a formatter (to enforce consistent style). The traditional setup is ESLint + Prettier, which requires two tools, two config files, two plugin ecosystems, and careful configuration to prevent them conflicting with each other.

---

## Decision

Use **Biome** as a unified linter and formatter, replacing both ESLint and Prettier.

---

## Rationale

### Single tool, single config

Biome replaces two tools with one. One `biome.json`, one dev dependency, one mental model. No ESLint/Prettier conflict resolution.

### Significantly faster

Biome is written in Rust and is benchmarked at 10–100x faster than ESLint + Prettier on large codebases. On a solo project this is a minor concern, but faster CI and pre-commit hooks improve developer experience.

### Modern TypeScript support

Biome has first-class TypeScript support and is actively maintained with a focus on modern JS/TS tooling. It does not require `@typescript-eslint` plugin configuration.

### Simpler onboarding

Anyone cloning the repo needs to understand one tool, not two with their interaction quirks.

---

## Consequences

- `biome.json` is the single source of truth for linting and formatting rules
- Pre-commit hooks (via Husky + lint-staged) run `biome check --apply` before commits
- Some ESLint rules that Biome does not yet implement may be missed; this is an acceptable tradeoff for the MVP
- If a future team has strong ESLint preferences (e.g. specific plugins for accessibility, security), migration back is straightforward

---

## Setup

```bash
npm install --save-dev @biomejs/biome
npx @biomejs/biome init
```

```json
// biome.json (minimal starting config)
{
  "$schema": "https://biomejs.dev/schemas/1.x.x/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

```json
// package.json scripts
{
  "scripts": {
    "lint": "biome check .",
    "lint:fix": "biome check --apply .",
    "format": "biome format --write ."
  }
}
```

---

## Alternatives Considered

| Option                     | Reason Rejected                                                         |
| -------------------------- | ----------------------------------------------------------------------- |
| ESLint + Prettier          | Two tools, complex config, conflict-prone; solved problem with worse DX |
| ESLint only (no formatter) | Inconsistent formatting across contributors                             |
| Oxlint                     | Less mature; fewer rules; not yet a full Prettier replacement           |
