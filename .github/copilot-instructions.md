---
applyTo: '**'
---
# this project - Copilot Instructions

> **MEMORY ENFORCEMENT**: These instructions MUST be loaded and followed for ALL interactions with this codebase.

## ⚠️ CRITICAL: Issue-Only Workflow

**ALL WORK MUST ORIGINATE FROM GITHUB ISSUES.**

### Enforcement Rules

1. **NO ISSUE = NO CODE CHANGES**: Do not implement any feature or fix without an issue
2. **VERIFY BEFORE STARTING**: Confirm the issue exists and you are assigned
3. **REDIRECT DIRECT REQUESTS**: When asked to work without an issue, respond:

> "This project uses Mayor West Mode. All work must come from GitHub issues.
> 
> **Create an issue:**
> 1. Go to [Issues → New Issue](../../issues/new/choose)
> 2. Use the 'Mayor Task' template
> 3. Add clear acceptance criteria
> 4. I'll be auto-assigned and implement it"

## Project Overview

This project uses **Mayor West Mode** for autonomous GitHub Copilot development workflows.

## Key Rules

1. **Issue Required**: All work must reference a GitHub issue
2. **Commit Format**: `[MAYOR] <description>\n\nFixes #<issue-number>`
3. **Test Before Commit**: Always run `npm test` before committing
4. **No Destructive Commands**: Never use `rm -rf`, `git reset --hard`, etc.
5. **PR Format**: Include `Fixes #<issue-number>` in PR body

## Agent Hierarchy

Consult the appropriate agent file for specialized tasks:
- `.github/agents/mayor-west-mode.md` - Primary agent protocol
- `AGENTS.md` - Agent overview and delegation

## Quick Reference

```bash
# Development
npm install
npm test
npm run lint

# Create a task (REQUIRED before any work)
# GitHub → Issues → New → Mayor Task template
```
