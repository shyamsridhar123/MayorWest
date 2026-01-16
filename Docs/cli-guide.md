# Mayor West Mode — CLI User Guide

> **Complete guide to installing, configuring, and using Mayor West Mode**

---

## Table of Contents

- [Quick Start](#quick-start)
- [Installation Methods](#installation-methods)
- [CLI Commands](#cli-commands)
- [Setup Wizard](#setup-wizard)
- [Configuration Options](#configuration-options)
- [Post-Setup Steps](#post-setup-steps)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

---

## Quick Start

**One command to get started** (requires Node.js 18+):

```bash
npx mayor-west-mode setup
```

Follow the interactive prompts, then verify:

```bash
npx mayor-west-mode verify
```

---

## Installation Methods

### NPX (Recommended)

Run directly without installing—always gets the latest version:

```bash
npx mayor-west-mode setup
```

### Global Installation

Install once, use everywhere:

```bash
npm install -g mayor-west-mode
mayor-west-mode setup
```

### Local Project Installation

Version-lock for team consistency:

```bash
npm install mayor-west-mode --save-dev
npx mayor-west-mode setup
```

### Docker

For CI/CD or environments without Node.js:

```bash
docker run -v $(pwd):/app -w /app node:18 npx mayor-west-mode setup
```

---

## CLI Commands

### `setup` — Interactive Setup Wizard

```bash
npx mayor-west-mode setup
```

Walks you through:
1. Git repository verification
2. Setup mode selection (Full/Minimal/Custom)
3. Auto-merge preferences
4. Iteration limit configuration
5. File creation

### `plan` — Task Planning

```bash
npx mayor-west-mode plan
```

Break down a complex goal into multiple GitHub issues:
1. Enter your high-level goal
2. Break it into specific tasks
3. Add context and acceptance criteria (optional)
4. Preview and confirm
5. Issues are created with `mayor-task` label

Copilot is assigned automatically by the orchestrator workflow.

### `verify` — Configuration Check

```bash
npx mayor-west-mode verify
```

Checks for:
- ✓ Git repository
- ✓ VS Code YOLO settings
- ✓ Agent instructions
- ✓ Auto-merge workflow
- ✓ Orchestrator workflow
- ✓ Task template
- ✓ GitHub remote

### `uninstall` — Remove Mayor West Mode

```bash
npx mayor-west-mode uninstall
```

Completely removes all Mayor West files:
1. Lists all existing Mayor West files
2. Asks for confirmation (type "uninstall")
3. Removes all files and empty directories
4. Offers to commit and push the removal

Also reminds you to clean up:
- `GH_AW_AGENT_TOKEN` secret
- PAT token on GitHub
- Auto-merge settings

### `status` — Current State

```bash
npx mayor-west-mode status
```

Shows:
- Repository information
- Which files exist
- What's missing

### `examples` — Usage Examples

```bash
npx mayor-west-mode examples
```

Displays:
- Sample task definitions
- Complexity guidelines
- Best practices

### `help` — Help & Usage

```bash
npx mayor-west-mode help
```

---

## Setup Wizard

### Step 1: Repository Check

The CLI verifies you're in a git repository with a GitHub remote.

**If this fails:**

```bash
git init
git remote add origin git@github.com:user/repo.git
```

### Step 2: Setup Mode

```
? Which setup mode would you like?
❯ Full Setup (all files + configuration)
  Minimal Setup (core files only)
  Custom Setup (choose files individually)
```

| Mode | Files Created | Best For |
|------|---------------|----------|
| **Full** | All 5 files | Most users |
| **Minimal** | 4 core files | Custom templates |
| **Custom** | Your choice | Incremental adoption |

### Step 3: Configuration

```
? Enable auto-merge on PRs? (Y/n)
? How should PRs be merged? (Squash/Merge/Rebase)
? Max iterations before stopping: (15)
```

### Step 4: File Creation

The CLI creates:
- `.vscode/settings.json`
- `.github/agents/mayor-west-mode.md`
- `.github/workflows/mayor-west-auto-merge.yml`
- `.github/workflows/mayor-west-orchestrator.yml`
- `.github/ISSUE_TEMPLATE/mayor-task.md`

---

## Configuration Options

### YOLO Settings

Located in `.vscode/settings.json`:

```json
{
  "chat.tools.autoApprove": true,
  "chat.tools.terminal.autoApprove": {
    "/^git\\s+(commit|push)\\b/": true,
    "/^(npm|pnpm|yarn)\\s+(test|lint|build)\\b/": true,
    "rm": false,
    "kill": false
  },
  "chat.agent.iterationLimit": 15
}
```

**Customizing approved commands:**

```json
{
  "chat.tools.terminal.autoApprove": {
    "/^pytest\\b/": true,           // Add pytest
    "/^cargo\\s+(test|build)\\b/": true,  // Add cargo
    "/^docker\\s+push/": false      // Block docker push
  }
}
```

### Agent Instructions

Modify `.github/agents/mayor-west-mode.md` to add project-specific rules:

```markdown
## Project-Specific Rules

- Use TypeScript strict mode
- Follow BEM naming for CSS
- Write JSDoc for public APIs
```

---

## Post-Setup Steps

### 1. Configure GitHub Settings

**Enable auto-merge:**
```
GitHub.com → Repository → Settings → Pull Requests → ✅ Allow auto-merge
```

**Add branch protection:**
```
GitHub.com → Settings → Branches → Add Rule
├─ Branch: main
├─ ✅ Require status checks
└─ ✅ Require pull request reviews (1)
```

### 2. Commit and Push

```bash
git add .vscode .github
git commit -m "[MAYOR] Add autonomous workflow configuration"
git push origin main
```

### 3. Test the Setup

1. Create a simple test issue using the Mayor Task template
2. Go to Actions → Mayor West Orchestrator → Run workflow
3. Watch Copilot implement the task

---

## Troubleshooting

### "Not a git repository"

```bash
git init
git remote add origin git@github.com:user/repo.git
npx mayor-west-mode setup
```

### "No git remote found"

```bash
git remote add origin git@github.com:user/repo.git
npx mayor-west-mode setup
```

### "Could not parse GitHub URL"

Verify your remote points to GitHub:

```bash
git remote -v
# Should show: origin git@github.com:user/repo.git
```

### Node.js version too old

```bash
node --version  # Need 18+
nvm install 18 && nvm use 18
```

### Files already exist

The CLI will ask if you want to overwrite. Choose "Yes" to update with latest templates.

### Verify shows missing files

Run setup in Custom mode and select only the missing files:

```bash
npx mayor-west-mode setup
# Choose: Custom Setup
# Select: [missing files only]
```

---

## Advanced Usage

### Team Rollout Script

Setup multiple repositories at once:

```bash
#!/bin/bash
for repo in repo-a repo-b repo-c; do
  cd ~/projects/$repo
  npx mayor-west-mode setup
  git add .vscode .github
  git commit -m "[MAYOR] Add autonomous workflow configuration"
  git push origin main
done
```

### CI/CD Verification

Add to your CI pipeline:

```yaml
- name: Verify Mayor West Setup
  run: npx mayor-west-mode verify
```

### Different Settings Per Repo

Simple projects:
```bash
# During setup, choose: 10 iterations
```

Complex projects:
```bash
# During setup, choose: 25 iterations
```

---

## Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | 18.0.0+ |
| Git | Any recent |
| GitHub | Repository access |
| Copilot | Pro or Business license |

---

## Getting Help

```bash
npx mayor-west-mode help      # CLI help
npx mayor-west-mode examples  # Usage examples
npx mayor-west-mode status    # Current state
```

**Documentation:**
- [CLI-README.md](CLI-README.md) — Main README
- [mayor_west_mode_trd.md](mayor_west_mode_trd.md) — Technical details
- [mayor_west_quick_ref.md](mayor_west_quick_ref.md) — Quick reference

---

*Mayor West Mode v1.0.0*
