# Mayor West Mode

> Experimental autonomous workflows for GitHub Copilot — attempting to go from issue to merge with minimal intervention.

<p align="center">
  <img src="../Assets/mayor-west-adam-west.gif" alt="Mayor West Mode Demo" width="600">
</p>

<p align="center">
  <em>"I don't ask for permission. I execute with confidence."</em> — Mayor Adam West
</p>

> [!CAUTION]
> This tool enables **autonomous code execution**. Copilot will make commits, push code, and merge PRs without asking. Review the safety guardrails section before enabling on production repositories. Use with caution.

> [!NOTE]
> Mayor West Mode is an experiment in autonomous development. It attempts to pick up tasks from GitHub Issues and implement them with minimal human intervention. Results vary—start with simple tasks.

---

## What is Mayor West Mode?

Mayor West Mode sets up GitHub Copilot to work more autonomously on development tasks.

This CLI creates the configuration files needed: VS Code settings for YOLO auto-approval, GitHub Actions workflows for orchestration, and templates for task definition.

**Key capabilities:**

- 🤖 **Autonomous execution** — Tasks complete without human intervention
- ⚡ **YOLO mode** — Safe commands auto-approve (tests, commits, pushes)
- 🔄 **Queue orchestration** — FIFO task processing from GitHub Issues
- 🔀 **Auto-merge** — PRs merge automatically when checks pass
- 🛡️ **Safety guardrails** — Iteration limits, blocked destructive commands, branch protection

---

## Quick Start — Zero to Working in 90 Seconds

> [!IMPORTANT]
> Requires Node.js 18+ and a GitHub repository with Copilot enabled.

### Step 1: Install (30 seconds)

```bash
npx mayor-west-mode setup
```

No installation required. Works immediately.

### Step 2: Follow the Wizard (30 seconds)

```bash
? Which setup mode would you like?
❯ Full Setup (all files + configuration)

? Enable auto-merge on PRs? Yes
? How should PRs be merged? Squash
? Max iterations: 15
```

### Step 3: Configure GitHub (30 seconds)

```
GitHub.com → Settings → Pull Requests → ✅ Allow auto-merge
GitHub.com → Settings → Branches → Add protection rule for main
```

### Step 4: Create Your First Task

```bash
# Go to GitHub Issues → New → Mayor Task template
# Fill in acceptance criteria
# Run the orchestrator: Actions → Mayor West Orchestrator → Run workflow
```

**That's it!** Watch Copilot implement your task autonomously.

---

## What Can Mayor West Mode Do?

- **Execute development tasks** — From bug fixes to feature implementations
- **Run tests autonomously** — YOLO mode auto-approves test commands
- **Create and merge PRs** — Full lifecycle without human intervention
- **Process task queues** — FIFO ordering, one task at a time
- **Recover from failures** — Automatic retry with iteration limits

**Key features:**

- ✅ **Modular** — VS Code settings, agent instructions, workflows as independent components
- ✅ **Safe** — Destructive commands blocked, iteration limits enforced
- ✅ **Observable** — All operations logged in GitHub Actions
- ✅ **Extensible** — Customize agent instructions for your project

---

## Installation Methods

| Method | Command | Best For |
|--------|---------|----------|
| **NPX** (recommended) | `npx mayor-west-mode setup` | One-time setup, always latest |
| **Global** | `npm i -g mayor-west-mode` | Multiple repos, fast execution |
| **Local** | `npm i -D mayor-west-mode` | Version-locked, team consistency |
| **Docker** | `docker run node:18 npx mayor-west-mode setup` | CI/CD, no local Node.js |

---

## CLI Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `setup` | Interactive guided setup | `npx mayor-west-mode setup` |
| `verify` | Check all files are in place | `npx mayor-west-mode verify` |
| `status` | Show current setup state | `npx mayor-west-mode status` |
| `examples` | Show usage examples | `npx mayor-west-mode examples` |
| `help` | Show help and usage | `npx mayor-west-mode help` |

---

## What Gets Created

The CLI generates **5 configuration files** that work together:

```
your-repo/
├── .vscode/
│   └── settings.json              ← YOLO auto-approve configuration
├── .github/
│   ├── agents/
│   │   └── mayor-west-mode.md     ← Copilot behavioral instructions
│   ├── workflows/
│   │   ├── mayor-west-auto-merge.yml    ← Auto-approve & merge PRs
│   │   └── mayor-west-orchestrator.yml  ← Task queue processing
│   └── ISSUE_TEMPLATE/
│       └── mayor-task.md          ← Standardized task template
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. CREATE TASK                                                          │
│     GitHub Issue with [MAYOR] prefix + acceptance criteria               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. ORCHESTRATOR ASSIGNS                                                 │
│     Workflow finds unassigned tasks → assigns to @copilot               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. COPILOT EXECUTES (YOLO Mode)                                        │
│     Reads issue → Implements → Runs tests → Commits → Pushes            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. AUTO-MERGE                                                           │
│     PR approved → Status checks pass → Auto-merged to main               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                            [LOOP TO NEXT TASK]
```

---

## YOLO Configuration

YOLO mode auto-approves **safe commands** so Copilot can work autonomously:

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

| Auto-Approved ✅ | Blocked ❌ |
|------------------|------------|
| `git commit`, `git push` | `rm`, `rm -rf` |
| `npm test`, `npm run lint` | `kill`, `pkill` |
| `npm run build` | `git reset --hard` |
| `pytest`, `cargo test` | `chmod`, `chown` |

---

## Basic Usage

### Interactive Setup

```bash
# Start the setup wizard
npx mayor-west-mode setup

# Verify your configuration
npx mayor-west-mode verify
```

### Creating Tasks

```markdown
# Go to GitHub → Issues → New → Mayor Task template

[MAYOR] Add user authentication endpoint

## Context
Users need to authenticate via OAuth2 before accessing protected resources.

## Acceptance Criteria
- [ ] Create POST /api/auth/login endpoint
- [ ] Validate OAuth2 tokens
- [ ] Return JWT on success
- [ ] All tests pass

## Testing
npm test
```

### Triggering Execution

```bash
# Option 1: Manual trigger
GitHub → Actions → Mayor West Orchestrator → Run workflow

# Option 2: Automatic (after PR merge)
# Orchestrator runs automatically when PRs merge

# Option 3: Scheduled (every 15 minutes)
# Built-in cron trigger picks up new tasks
```

---

## Current State

This is an experimental tool under active development:

**What works:**

- ✅ Core autonomous task execution
- ✅ YOLO auto-approval for safe commands
- ✅ Auto-merge workflow pipeline
- ✅ Task queue orchestration
- ✅ Safety guardrails (iteration limits, blocked commands)

**What's rough around the edges:**

- ⚠️ Complex multi-file refactors may need task splitting
- ⚠️ Some edge cases in merge conflict resolution
- ⚠️ Cross-repository dependencies not supported
- ⚠️ Limited to one task at a time (by design)

---

## Safety Guardrails

| Protection | How It Works |
|------------|--------------|
| **YOLO Whitelist** | Only explicitly approved commands run automatically |
| **Destructive Commands Blocked** | `rm`, `kill`, `git push --force` require manual approval |
| **Iteration Limit** | Agent stops after 15 iterations (configurable) |
| **Branch Protection** | GitHub enforces status checks and reviews |
| **Audit Trail** | All operations logged in GitHub Actions history |
| **Test-First** | Copilot won't commit if tests fail |

---

## Ideas for the Future

Some directions we're exploring:

- Multiple interfaces — CLI, GitHub Actions, IDE integrations
- Multi-step workflows with dependency chains
- Team-wide configuration management

These are ideas, not promises. The current focus is making the basics work reliably.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Not a git repository" | Run `git init` and add a GitHub remote |
| "No git remote found" | Run `git remote add origin git@github.com:user/repo.git` |
| "Copilot doesn't activate" | Check VS Code logs; ensure YOLO settings are committed |
| "PR doesn't merge" | Verify "Allow auto-merge" is enabled in GitHub settings |
| "Tests keep failing" | Review task acceptance criteria; simplify if needed |

**Having issues?** Run `npx mayor-west-mode verify` to check your setup status.

---

## Contributing

> [!NOTE]
> This project welcomes contributions! Fork, experiment, and share feedback.

Most contributions require you to agree to a Contributor License Agreement (CLA). When you submit a pull request, a CLA bot will guide you through the process.

---

## Requirements

- **Node.js**: 18.0.0 or higher
- **Git**: Any recent version  
- **GitHub**: Repository with Copilot access
- **Time**: 2-5 minutes for complete setup

---

## The Mayor West Mindset

> **"I don't ask for permission. I execute with confidence. I iterate when I fail. I deliver results through unconventional means."**

Your autonomous agent embodies these principles:

- **Eccentric Autonomy** — Makes decisions without waiting
- **Unwavering Confidence** — Proceeds despite chaos
- **Iterative Resilience** — Tries again when it fails  
- **Unconventional Effectiveness** — Delivers results via unexpected means

---

## Ready to Activate Mayor West Mode?

```bash
npx mayor-west-mode setup
```

---

*Mayor West Mode v1.0.0*  
*Inspired by Family Guy's Mayor Adam West*
