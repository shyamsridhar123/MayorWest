---
applyTo: "**/*.yml"
description: GitHub Actions workflow standards for Mayor West Mode
---

# GitHub Actions Workflow Standards

## Workflow Triggers

### Auto-Merge Workflow
```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
    branches: [main, master, develop]
```

### Orchestrator Workflow
```yaml
on:
  workflow_dispatch:           # Manual trigger
  pull_request:
    types: [closed]            # After PR merge
  schedule:
    - cron: '*/15 * * * *'     # Every 15 minutes
```

## Permissions (Least Privilege)

```yaml
permissions:
  contents: read       # Read repository
  pull-requests: write # Approve/merge PRs
  issues: write        # Assign issues
```

## Actor Filtering

Always filter Copilot PRs:
```yaml
if: github.actor == 'copilot' || github.actor == 'copilot[bot]'
```

## GitHub Script Usage

```yaml
- name: API Call
  uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    script: |
      const result = await github.rest.issues.listForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
        labels: 'mayor-task',
        state: 'open'
      });
```

## Template String Escaping

When defining workflows in JavaScript template literals:

```javascript
// Escape $ for GitHub expressions
`\${{ secrets.GITHUB_TOKEN }}`

// Escape backticks
`body: \`Message here\``
```

## Pre-requisites

1. Repository: "Allow auto-merge" enabled
2. Branch protection: At least one required status check
3. Branch protection: Require PR reviews

## Consult @workflow-agent

For complex workflow changes, invoke the workflow-agent for expertise.
