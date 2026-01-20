# Project - Agent Instructions

> **MANDATORY ENFORCEMENT**: This file is automatically loaded for ALL AI interactions in this workspace.

## ⚠️ CRITICAL: Issue-Only Workflow

**ALL WORK MUST COME FROM GITHUB ISSUES. NO EXCEPTIONS.**

### Enforcement

When asked to make code changes WITHOUT an issue reference:
1. **STOP** - Do not proceed with any code changes
2. **INFORM** - Tell the user: "Mayor West Mode requires all work to originate from GitHub issues"
3. **REDIRECT** - Provide link: `[Create Issue](../../issues/new/choose)` with Mayor Task template
4. **WAIT** - Only proceed after issue is created and assigned

### Why This Matters

- **Traceability**: Every change is linked to a tracked issue
- **Automation**: Issues trigger auto-assignment to Copilot
- **PR Linking**: `Fixes #<number>` auto-closes issues on merge
- **Audit Trail**: Clear history of what was requested and delivered

## Project Identity

This project uses **Mayor West Mode** - autonomous GitHub Copilot development workflows.

## Agent Hierarchy

| Pattern | Agent | Location |
|---------|-------|----------|
| `**` | Mayor West Mode | `.github/agents/mayor-west-mode.md` |

## Mandatory Rules

1. **Issue Required**: All work must originate from a GitHub issue
2. **Never auto-approve destructive commands**: `rm`, `kill`, `reset --hard`
3. **Always run tests before committing**
4. **Use commit format**: `[MAYOR] <description>\n\nFixes #<issue-number>`
5. **Include `Fixes #<issue>` in PR body**

## Development Commands

```bash
npm install           # Install dependencies
npm test              # Run tests
npm run lint          # Lint code
```

## Creating Tasks

All work flows through issues:
1. Go to **Issues → New Issue**
2. Select **Mayor Task** template
3. Fill in acceptance criteria
4. Copilot is auto-assigned
5. PR is auto-merged when tests pass
