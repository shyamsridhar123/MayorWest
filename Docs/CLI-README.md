# 🤖 Mayor West Mode - Node CLI Setup

**Status**: Production-Ready (January 2026)  
**Version**: 1.0.0  
**Author**: Engineering Team

> *"I don't ask for permission. I execute with confidence."* — Mayor Adam West

---

## What's Included

This complete Node.js CLI installer package for Mayor West Mode includes:

### 📦 Package Contents

1. **CLI Application** (`cli.js`)
   - Full-featured Node.js CLI tool
   - Interactive setup wizard
   - Configuration verification
   - Status monitoring
   - Help and examples
   - ~500 lines of production-ready code

2. **File Templates** (5 critical files)
   - VS Code YOLO Settings
   - Copilot Agent Instructions
   - Auto-Merge Workflow
   - Orchestrator Workflow
   - Task Template

3. **Documentation**
   - Complete CLI user guide
   - Installation instructions (4 methods)
   - Usage examples with explanations
   - Troubleshooting guide
   - Advanced configuration options

4. **Package Configuration** (`package.json`)
   - All dependencies specified
   - npm scripts for common tasks
   - Node.js version requirements
   - Metadata and repository info

---

## Quick Start

### The Fastest Way (< 2 minutes)

```bash
# 1. Navigate to your GitHub repository
cd /path/to/your/repo

# 2. Run the installer (one line!)
npx mayor-west-mode setup

# 3. Follow the interactive prompts
# 4. Commit and push the generated files
# 5. Done! ✅

# Optional: Verify everything is in place
npx mayor-west-mode verify
```

That's it. No complex setup needed.

---

## Installation Methods

### 🚀 Method 1: NPX (Recommended)

**Best for**: One-time setup, always latest version

```bash
npx mayor-west-mode setup
```

No installation required. Works immediately.

### 📦 Method 2: Global NPM

**Best for**: Multiple repositories, team adoption

```bash
npm install -g mayor-west-mode
mayor-west-mode setup
```

Available globally. Fast execution.

### 🗂️ Method 3: Local Project

**Best for**: Version-locked setup, reproducible builds

```bash
npm install mayor-west-mode --save-dev
npm run setup
```

Versioned in package.json. Team consistency.

### 🐳 Method 4: Docker

**Best for**: Containerized CI/CD, no local Node.js

```bash
docker run -v $(pwd):/app node:18 \
  npx mayor-west-mode setup
```

Works anywhere. No system dependencies.

---

## CLI Commands Cheat Sheet

| Command | Purpose | Usage |
|---------|---------|-------|
| `setup` | Interactive guided setup | `npx mayor-west-mode setup` |
| `verify` | Check all files are in place | `npx mayor-west-mode verify` |
| `help` | Show help and usage | `npx mayor-west-mode help` |
| `examples` | Show usage examples | `npx mayor-west-mode examples` |
| `status` | Show current setup status | `npx mayor-west-mode status` |

---

## What the CLI Does

### 1️⃣ Setup Wizard (`npx mayor-west-mode setup`)

**Interactive walkthrough**:
- ✅ Verifies git repository
- ✅ Extracts GitHub repository info
- ✅ Prompts for setup preferences (Full/Minimal/Custom)
- ✅ Asks about auto-merge, merge strategy, iteration limits
- ✅ Creates all necessary files
- ✅ Provides actionable next steps

**Setup options**:
```
? Which setup mode would you like?
❯ Full Setup (all files + configuration)
  Minimal Setup (core files only)
  Custom Setup (choose files individually)
```

### 2️⃣ Verification (`npx mayor-west-mode verify`)

**Comprehensive checks**:
- ✓ Git repository exists
- ✓ VS Code YOLO Settings
- ✓ Copilot Agent Instructions
- ✓ Auto-Merge Workflow
- ✓ Orchestrator Workflow
- ✓ Task Template
- ✓ GitHub remote configured

**Output**: Pass/fail status for each component

### 3️⃣ Examples (`npx mayor-west-mode examples`)

**3 example tasks** with increasing complexity:
1. Simple bug fix (5-15 min)
2. Feature implementation (15-30 min)
3. Complex feature (30-60 min)

**Best practices** included:
- Writing clear acceptance criteria
- Setting technical constraints
- Defining testing requirements
- Task complexity estimation

### 4️⃣ Status (`npx mayor-west-mode status`)

**Current setup state**:
- Git and GitHub information
- Which configuration files exist
- What's working and what's missing

---

## Example: Full Setup Walkthrough

### Before Running CLI
```bash
$ cd my-awesome-project
$ ls -la
.git/
src/
package.json
README.md
```

### Running the CLI
```bash
$ npx mayor-west-mode setup

━━━ 🤖 Mayor West Mode Setup ━━━

Welcome to the Mayor West Mode installer!
This will set up autonomous GitHub Copilot development workflows.

✓ Git repository detected
✓ GitHub repository: yourname/awesome-project

? Which setup mode would you like?
❯ Full Setup (all files + configuration)
  Minimal Setup (core files only)
  Custom Setup (choose files individually)

? Enable auto-merge on PRs? (Y/n) Y

? How should PRs be merged?
❯ Squash (recommended)
  Merge (preserve commits)
  Rebase (linear history)

? Max Copilot iterations before stopping: (15) 15

Creating Configuration Files

✓ VS Code YOLO Settings
✓ Copilot Agent Instructions
✓ Auto-Merge Workflow
✓ Orchestrator Workflow
✓ Task Template

Created 5 configuration files

🎉 Setup Complete!

Next Steps:

1. Review generated files in .vscode and .github

2. Configure GitHub settings:
   - Enable auto-merge: GitHub → Settings → Pull Requests
   - Branch protection: GitHub → Settings → Branches

3. Commit and push:
   git add .vscode .github
   git commit -m "Mayor West Mode: Add autonomous workflows"
   git push origin main

4. Test: GitHub Actions → Mayor West Orchestrator → Run workflow

5. Create task: GitHub Issues → New → Mayor Task template
```

### After Running CLI
```bash
$ ls -la
.git/
.vscode/
  settings.json (NEW)
src/
.github/
  agents/ (NEW)
    mayor-west-mode.md
  workflows/ (NEW)
    mayor-west-auto-merge.yml
    mayor-west-orchestrator.yml
  ISSUE_TEMPLATE/ (NEW)
    mayor-task.md
package.json
README.md
```

### Verification
```bash
$ npx mayor-west-mode verify

━━━ 🔍 Verifying Setup ━━━

✓ Git Repository
✓ VS Code YOLO Settings
✓ Copilot Agent Instructions
✓ Auto-Merge Workflow
✓ Orchestrator Workflow
✓ Task Template
✓ GitHub Remote

Result: 7/7 checks passed

✓ All systems go! 🚀

Your Mayor West Mode setup is complete and ready to use.
```

---

## Configuration Files Created

### 1. `.vscode/settings.json` (VS Code YOLO Settings)

Configures Copilot to auto-approve safe commands:

```json
{
  "chat.tools.autoApprove": true,
  "chat.tools.terminal.autoApprove": {
    "/^git\\s+(commit|push)\\b/": true,
    "/^(npm|pnpm|yarn)\\s+(test|lint|build)\\b/": true,
    "rm": false,
    "kill": false
  },
  "chat.agent.iterationLimit": 15,
  "chat.agent.maxTokensPerIteration": 4000
}
```

**Auto-approved**: `git commit`, `git push`, `npm test`, `npm lint`  
**Blocked**: `rm`, `kill`, destructive operations

### 2. `.github/agents/mayor-west-mode.md` (Agent Instructions)

Instructions for Copilot on task execution protocol. Includes:
- Task reading and parsing
- Acceptance criteria implementation
- Testing before commit
- Clear commit messages
- Failure recovery strategies
- Safety constraints

### 3. `.github/workflows/mayor-west-auto-merge.yml` (Auto-Merge)

Workflow that:
- Detects PRs from @copilot
- Automatically approves them
- Enables auto-merge with SQUASH strategy
- Merges when status checks pass

### 4. `.github/workflows/mayor-west-orchestrator.yml` (Orchestrator)

Workflow that:
- Finds unassigned `mayor-task` issues
- Assigns to @copilot
- Waits for completion
- Loops to next task

**Triggers**: Manual run, PR closes, or every 15 minutes

### 5. `.github/ISSUE_TEMPLATE/mayor-task.md` (Task Template)

GitHub issue template with:
- Task title format
- Context section
- Acceptance criteria checklist
- Technical constraints
- Testing requirements
- Files likely to change
- Definition of done

---

## Using After Setup

### Create a Task

```bash
# Go to GitHub
# Issues → New Issue → Choose "Mayor Task" template

[MAYOR] Add user profile endpoint

Context: Users need to view their profile

Acceptance Criteria:
- [ ] Create GET /api/users/:id
- [ ] Return user JSON
- [ ] Require authentication
- [ ] Tests pass

Testing: npm test
```

### Trigger Orchestrator

```bash
# GitHub → Actions → Mayor West Orchestrator
# Click "Run workflow"

# Copilot automatically:
# 1. Finds your task
# 2. Implements it
# 3. Runs tests
# 4. Creates PR
# 5. Auto-merges
```

### Watch Progress

```bash
# GitHub → Pull Requests
# See PR from @copilot with your implementation
# PR auto-merges when tests pass
```

---

## Project Structure

The CLI creates this file structure:

```
your-repo/
├── .vscode/
│   └── settings.json                          # YOLO configuration
├── .github/
│   ├── agents/
│   │   └── mayor-west-mode.md                 # Agent instructions
│   ├── workflows/
│   │   ├── mayor-west-auto-merge.yml          # Auto-merge logic
│   │   └── mayor-west-orchestrator.yml        # Task orchestration
│   └── ISSUE_TEMPLATE/
│       └── mayor-task.md                      # Task template
├── package.json                                # (existing)
├── README.md                                   # (existing)
└── [other project files]
```

---

## Troubleshooting

### "Not a git repository"

```bash
git init
git remote add origin git@github.com:yourusername/your-repo.git
npx mayor-west-mode setup
```

### "No git remote found"

```bash
git remote add origin git@github.com:yourusername/your-repo.git
npx mayor-west-mode setup
```

### "Could not parse GitHub URL"

Ensure your git remote is GitHub:
```bash
git remote -v
# Should show: origin git@github.com:yourusername/your-repo.git
```

### Files already exist

```bash
npx mayor-west-mode setup
# Choose "Yes" when asked to overwrite
```

### Node.js too old

```bash
node --version  # Should be v18+
nvm install 18
nvm use 18
npx mayor-west-mode setup
```

### Verify shows missing files

```bash
npx mayor-west-mode verify   # Shows which are missing
npx mayor-west-mode setup    # Choose "Custom" mode, select missing files
```

---

## Advanced Usage

### Team Rollout

Setup multiple repos at once:

```bash
#!/bin/bash
for repo in repo-a repo-b repo-c; do
  cd ~/projects/$repo
  npx mayor-west-mode setup --type full
  git add .vscode .github
  git commit -m "Mayor West Mode: Add autonomous workflows"
  git push origin main
done
```

### CI/CD Integration

Verify setup in your CI pipeline:

```yaml
name: Verify Mayor West

on: [push]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npx mayor-west-mode verify
```

### Custom Configuration

Different settings per repository:

```bash
# Simple projects
npx mayor-west-mode setup  # Minimal, 10 iterations

# Complex projects
npx mayor-west-mode setup  # Full, 25 iterations
```

---

## System Requirements

- **Node.js**: 18.0.0 or higher
- **Git**: Any recent version
- **GitHub**: Public or private repository
- **Disk Space**: ~50KB for all files
- **Time**: 2-5 minutes for complete setup

---

## What You Get

✅ **Autonomous task execution** - Tasks complete in 5-30 min vs 2-8 hours  
✅ **Zero human blocking** - No PR review delays  
✅ **Safety guardrails** - YOLO whitelist, iteration limits, branch protection  
✅ **Audit trail** - All operations logged in GitHub Actions  
✅ **Production-ready** - Validated against official GitHub/VS Code docs  
✅ **Easy setup** - One command, guided wizard, clear next steps  
✅ **Beginner-friendly** - No complex configuration needed  
✅ **Team-scalable** - Distribute across org with Docker/npm  

---

## Next Steps

### 1. Install
```bash
npx mayor-west-mode setup
```

### 2. Follow the prompts
- Choose Full Setup (recommended)
- Accept defaults for safety
- Let it create all files

### 3. Configure GitHub
- Enable auto-merge in repo settings
- Add branch protection rule

### 4. Commit and push
```bash
git add .vscode .github
git commit -m "Mayor West Mode: Add autonomous workflows"
git push origin main
```

### 5. Create a test task
- Go to GitHub Issues
- New Issue → Mayor Task template
- Fill in simple task

### 6. Trigger orchestrator
- GitHub Actions → Mayor West Orchestrator
- Click "Run workflow"

### 7. Watch Copilot execute!

---

## Support

**Getting Help**:
- `npx mayor-west-mode help` - Show all commands
- `npx mayor-west-mode examples` - Show usage examples
- `npx mayor-west-mode status` - Check current setup

**Documentation**:
- CLI User Guide (cli-guide.md)
- Technical Requirements Doc (mayor_west_mode_trd.md)
- This README

**Issues**:
- GitHub Issues for bug reports
- Contributions welcome!

---

## License

MIT - Use freely in your projects and teams

---

## The Mayor West Mindset

> **"I don't ask for permission. I execute with confidence. I iterate when I fail. I deliver results through unconventional means."**

Your autonomous agent embodies these principles:
- **Eccentric Autonomy** - Makes decisions without waiting
- **Unwavering Confidence** - Proceeds despite chaos
- **Iterative Resilience** - Tries again when it fails
- **Unconventional Effectiveness** - Delivers results via unexpected means

---

**Ready to activate Mayor West Mode?**

```bash
npx mayor-west-mode setup
```

**Let's build something awesome.** 🚀

---

*Mayor West Mode CLI v1.0.0*  
*Production-Ready • January 14, 2026*  
*Inspired by Family Guy • Built for autonomy*
