# OpsPilot Documentation

This directory contains architecture, product, and decision documentation for the OpsPilot project. Docs are written as markdown and version-controlled alongside the codebase.

---

## Contents

### Architecture

| Document | Description |
|----------|-------------|
| [overview.md](./architecture/overview.md) | System architecture, stack, layer diagram, request flows |
| [data-model.md](./architecture/data-model.md) | Entity definitions, field descriptions, modelling decisions |
| [developer-setup.md](./architecture/developer-setup.md) | How to run OpsPilot locally |

### Product

| Document | Description |
|----------|-------------|
| [mvp-scope.md](./product/mvp-scope.md) | What is and isn't in the MVP; definition of done |

### Architecture Decision Records (ADRs)

ADRs capture significant decisions: what was decided, why, and what was considered and rejected. They are written at the time of the decision and not retroactively revised.

| ADR | Decision |
|-----|---------|
| [ADR-001](./adr/adr-001-nextjs-monolith.md) | Next.js monolith over separated API |
| [ADR-002](./adr/adr-002-feature-based-architecture.md) | Feature-based architecture |
| [ADR-003](./adr/adr-003-ai-provider-abstraction.md) | AI provider abstraction (Ollama-first) |
| [ADR-004](./adr/adr-004-biome-over-eslint.md) | Biome over ESLint + Prettier |
| [ADR-005](./adr/adr-005-docker-strategy.md) | Docker for infrastructure only |

### Diagrams

`diagrams/` is reserved for sequence diagrams and flow diagrams. These are added iteratively as features are implemented — not speculated upfront.

---

## Documentation Philosophy

- Docs live in the repo, versioned with the code
- Architecture docs explain *why*, not just *what*
- ADRs are written at decision time, not retroactively
- Feature docs are written when features stabilise, not before
- The goal is signal, not volume — a short accurate doc beats a long speculative one
