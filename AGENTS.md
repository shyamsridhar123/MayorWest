# Mayor West Mode - Agent Instructions

> **MANDATORY ENFORCEMENT**: This file is automatically loaded for ALL AI interactions in this workspace.

## Project Identity

This is **Mayor West Mode** - a Node.js CLI tool for autonomous GitHub Copilot workflows.

## Critical Architecture Rule

**Source code lives in `Docs/*.md` files, NOT standalone `.js` files.**

- `Docs/mayor-west-cli.md` → Contains `cli.js` source
- `Docs/package-json.md` → Contains `package.json` source
- `Docs/mayor_west_mode_trd.md` → Technical Requirements Document (source of truth)

## Agent Hierarchy

When working on this project, delegate to specialist agents:

| Pattern | Agent | Location |
|---------|-------|----------|
| `**` | @mayor-west-dev | `.github/agents/mayor-west-dev.md` |
| `Docs/mayor-west-cli.md` | @template-author | `.github/agents/template-author.md` |
| `**/*workflow*` | @workflow-agent | `.github/agents/workflow-agent.md` |
| `Docs/**` | @docs-agent | `.github/agents/docs-agent.md` |
| `**/*.test.js` | @testing-agent | `.github/agents/testing-agent.md` |

## Mandatory Rules

1. **Never auto-approve destructive commands**: `rm`, `kill`, `reset --hard`
2. **Update TRD before implementing features**
3. **Use commit format**: `[MAYOR] <description>`
4. **Double-escape regex in JSON**: `\\s+` not `\s+`
5. **Escape `$` in GitHub Actions**: `\${{ }}` not `${{ }}`

## Development Commands

```bash
npm install           # Install dependencies
npm run setup        # Run CLI setup
npm run verify       # Verify configuration
npm test             # Run tests
```
