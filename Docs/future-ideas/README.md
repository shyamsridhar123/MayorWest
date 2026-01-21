# Future Ideas

This directory contains design documents, proof-of-concepts, and reference implementations for features that are planned but not yet implemented in Mayor West Mode.

## Purpose

These documents serve as:
- **Design specifications** for future features
- **Technical reference** for implementation work
- **Discussion material** for community feedback
- **Roadmap artifacts** showing the project's direction

## Status

All items in this directory are:
- ✅ Conceptually complete
- ⏳ Not yet implemented
- 🚧 Not production-ready
- 📋 May change based on feedback

## Current Future Ideas

### Policy System (`policy-system/`)

A comprehensive custom policy system that would allow repository owners to define fine-grained rules controlling what GitHub Copilot can and cannot do during autonomous task execution.

**Key Features**:
- File modification policies (allow/block patterns)
- Command execution policies
- Code quality gates (coverage, complexity)
- Dependency management rules
- Commit and PR format requirements
- Override mechanisms via labels

**Status**: Design complete, awaiting implementation

**Documents**:
- `custom-policy-design.md` - Complete technical design specification
- `policy-guide.md` - User guide with examples
- `policy-quick-reference.md` - Quick reference cheat sheet
- `policy-implementation-summary.md` - Implementation roadmap
- `policy-system.js` - Reference implementation starter code

## Contributing

If you'd like to help implement any of these future ideas:

1. Review the design documents in the relevant subdirectory
2. Open a GitHub issue to discuss your implementation plan
3. Reference the design docs when submitting PRs
4. Update or remove the future idea when it's fully implemented

## Lifecycle

When a future idea is implemented:
1. The implementation is merged into the main codebase
2. The design docs are either:
   - Moved to `Docs/` as authoritative documentation, or
   - Archived/removed if superseded by implementation
3. User-facing documentation is updated accordingly

## Questions?

For questions about future ideas, open a GitHub Discussion or reach out to the maintainers.
