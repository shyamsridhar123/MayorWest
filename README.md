# Mayor West Mode

> Experimental autonomous workflows for GitHub Copilot — attempting to go from issue to merge with minimal intervention.

<p align="center">
  <img src="Assets/mayor-west-adam-west.gif" alt="Mayor West Mode" width="400">
</p>

<p align="center">
  <em>"I don't ask for permission. I execute with confidence."</em> — Mayor Adam West
</p>

> [!CAUTION]
> This tool enables **autonomous code execution**. Copilot will make commits, push code, and merge PRs without asking. Review the safety guardrails before enabling on production repositories.

---

## 🛡️ Security-First Autonomous Coding

> **The key differentiator**: Full autonomy doesn't mean zero safety. Mayor West Mode is the **first AI coding tool with security by architecture**, not by interruption.

### Why This Matters

Most AI coding tools today (Cline, Aider, Roo Code, Cursor) use a **human-in-the-loop** model—you approve every file change and terminal command. That's safe, but it's not autonomous.

Mayor West Mode takes a different approach: **configure once, trust the guardrails**.

```
┌─────────────────────────────────────────────────────────────────┐
│         Mayor West Mode: 4-Layer Security Architecture          │
├─────────────────────────────────────────────────────────────────┤
│  Layer 1: Actor Allowlist (CODEOWNERS)                          │
│  ├── ✅ @copilot → Authorized for auto-merge                    │
│  ├── ✅ @your-username → Authorized for auto-merge              │
│  └── ❌ Unknown actors → Requires manual review                 │
├─────────────────────────────────────────────────────────────────┤
│  Layer 2: Protected Paths (mayor-west.yml)                      │
│  ├── 🔒 .github/workflows/** → Human review required            │
│  ├── 🔒 package.json, *.lock → Human review required            │
│  └── ✅ src/**/*.ts → Auto-merge allowed                        │
├─────────────────────────────────────────────────────────────────┤
│  Layer 3: Kill Switch                                           │
│  ├── enabled: false → Disable all auto-merge instantly          │
│  └── enabled: true  → Resume autonomous operations              │
├─────────────────────────────────────────────────────────────────┤
│  Layer 4: Audit Trail                                           │
│  ├── PR comments documenting security check results             │
│  └── Full GitHub Actions logs for every decision                │
└─────────────────────────────────────────────────────────────────┘
```

**Plus client-side protection**: VS Code YOLO settings auto-approve safe commands (`git commit`, `npm test`) while blocking destructive ones (`rm -rf`, `git reset --hard`).

### How We Compare

| Capability | Cline/Aider/Roo | Mayor West |
|------------|-----------------|------------|
| **Autonomy Level** | Human approves every action | Full autonomous execution |
| **Actor Allowlist** | ❌ Not available | ✅ CODEOWNERS-based authorization |
| **Protected Paths** | ❌ Not available | ✅ Glob patterns for critical files |
| **Auto-merge PRs** | ❌ Manual merge only | ✅ Safe PRs auto-merge |
| **Kill Switch** | ❌ Close the app | ✅ Config flag pause/resume |
| **Audit Trail** | ❌ No built-in audit | ✅ Every merge documented |
| **CI/CD Integration** | ❌ Local only | ✅ GitHub Actions orchestration |

📖 [See full security architecture](#safety-guardrails-summary)

---

## What is Mayor West Mode?

Mayor West Mode is an experiment in autonomous development workflows. It configures GitHub Copilot to pick up tasks from GitHub Issues and attempt to implement, test, and merge them with minimal human intervention.

**How it works:**

```
Issue Created → Orchestrator Assigns → Copilot Executes → PR Auto-Merges → Loop
```

**Key features:**

- 🤖 **Autonomous execution** — Tasks complete without human intervention
- ⚡ **YOLO mode** — Safe commands auto-approve (tests, commits, pushes)
- 🔄 **Queue orchestration** — FIFO task processing from GitHub Issues
- 🔀 **Auto-merge** — PRs merge automatically when checks pass
- 🛡️ **Safety guardrails** — Iteration limits, blocked destructive commands

---

## Quick Start — 90 Seconds

> [!IMPORTANT]
> Requires Node.js 18+ and a GitHub repository with Copilot enabled.

```bash
# Step 1: Run the setup wizard
npx mayor-west-mode setup

# Step 2: Follow the prompts, then configure GitHub
# GitHub → Settings → Pull Requests → ✅ Allow auto-merge
# GitHub → Settings → Branches → Add protection for main

# Step 3: Commit and push
git add .vscode .github
git commit -m "[MAYOR] Add autonomous workflow configuration"
git push origin main

# Step 4: Create a task and run the orchestrator
# GitHub → Issues → New → Mayor Task template
# GitHub → Actions → Mayor West Orchestrator → Run workflow
```

**That's it!** Watch Copilot implement your task.

---

## CLI Commands

| Command | Purpose |
|---------|---------|
| `npx mayor-west-mode setup` | Interactive setup wizard |
| `npx mayor-west-mode plan` | Break down a goal into multiple GitHub issues |
| `npx mayor-west-mode verify` | Check configuration |
| `npx mayor-west-mode uninstall` | Remove all Mayor West files from repo |
| `npx mayor-west-mode status` | Show current state |
| `npx mayor-west-mode examples` | Show task examples |
| `npx mayor-west-mode help` | Show help |

---

## Task Planning

Use the `plan` command to break down a complex goal into multiple issues:

```bash
npx mayor-west-mode plan
```

**Example session:**

```
? What do you want to build? Build a Pong game

📝 Now break this down into specific tasks:
? Task 1: Create HTML canvas and game loop
? Task 2: Add paddle controls with keyboard  
? Task 3: Implement ball physics and collision
? Task 4: Add scoring system
? Task 5: done

📋 Issue Preview:
1. [MAYOR] Create HTML canvas and game loop
2. [MAYOR] Add paddle controls with keyboard
3. [MAYOR] Implement ball physics and collision
4. [MAYOR] Add scoring system

? Create 4 issues in owner/repo? Yes

✅ Created 4/4 issues!
🤖 Copilot will be assigned automatically by the orchestrator workflow.
```

Each issue is created with the `mayor-task` label, proper formatting, and acceptance criteria. The orchestrator assigns Copilot automatically.

---

## What Gets Created

```
your-repo/
├── .vscode/settings.json              ← YOLO auto-approve config
├── .github/
│   ├── CODEOWNERS                     ← Actor allowlist for auto-merge
│   ├── mayor-west.yml                 ← Security config (protected paths, kill switch)
│   ├── agents/mayor-west-mode.md      ← Copilot instructions
│   ├── workflows/
│   │   ├── mayor-west-auto-merge.yml  ← 4-layer security + auto-merge
│   │   └── mayor-west-orchestrator.yml ← Task queue processing
│   └── ISSUE_TEMPLATE/mayor-task.md   ← Task template
```

---

## Safety Guardrails Summary

| Protection | How It Works |
|------------|--------------|
| **Actor Allowlist** | Only actors in CODEOWNERS can trigger auto-merge |
| **Protected Paths** | Critical files (workflows, package.json) require human review |
| **Kill Switch** | Set `enabled: false` in mayor-west.yml to pause everything |
| **Audit Trail** | Every auto-merge documented with PR comment |
| **Command Whitelist** | VS Code YOLO settings auto-approve safe commands only |
| **Blocked Commands** | `rm`, `kill`, `git reset --hard` blocked in VS Code |
| **Iteration Limit** | Stops after 15 iterations (configurable) |
| **Branch Protection** | GitHub enforces status checks before merge |

---

## Documentation

| Document | Description |
|----------|-------------|
| [philosophy.md](Docs/philosophy.md) | **The Philosophy of Mayor West Mode** — Deep exploration of our autonomous coding philosophy |
| [CLI-README.md](Docs/CLI-README.md) | Complete README with all features |
| [cli-guide.md](Docs/cli-guide.md) | Detailed CLI user guide |
| [mayor_west_mode_trd.md](Docs/mayor_west_mode_trd.md) | Technical Requirements Document |
| [mayor_west_quick_ref.md](Docs/mayor_west_quick_ref.md) | Quick reference card |
| [testing-guide.md](Docs/testing-guide.md) | Comprehensive testing guide |
| [test-execution-report.md](Docs/test-execution-report.md) | Test execution report |

---

## Testing

The CLI has been comprehensively tested with 45 automated tests covering all core functionality.

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

**Test Coverage:**
- ✅ GitHub URL parsing (HTTPS & SSH)
- ✅ File template validation (all 5 files)
- ✅ Configuration validation
- ✅ Security constraints (YOLO mode)
- ✅ Error handling & edge cases
- ✅ All CLI commands (setup, plan, verify, uninstall, status, help, examples)

See [testing-guide.md](Docs/testing-guide.md) for detailed testing information.

---

## Current State

**What works today:**
- ✅ Core autonomous task execution
- ✅ YOLO auto-approval for safe commands
- ✅ Auto-merge workflow pipeline (waits for Copilot to finish)
- ✅ Task queue orchestration with GraphQL Copilot assignment
- ✅ Auto-approve pending workflow runs from Copilot
- ✅ Task planning with `plan` command
- ✅ Clean uninstall with `uninstall` command
- ✅ Comprehensive test suite (45 tests)

**Safety features:**
- ✅ Skips WIP PRs (title contains `[WIP]`)
- ✅ Skips draft PRs (Copilot still working)
- ✅ Checks for active Copilot sessions before merge
- ✅ Protected paths require human review

**What's in progress:**
- ⚠️ Complex multi-file refactors may need task splitting
- ⚠️ Cross-repository dependencies not supported

---

## The Mayor West Mindset

<p align="center">
  <em>"I don't need your approval. I'm the mayor."</em>
</p>

Mayor Adam West doesn't ask for permission. He doesn't second-guess himself. He acts with complete conviction—even when what he's doing makes no sense to anyone else. And somehow, against all odds, things get done.

**This is the philosophy behind Mayor West Mode:**

### The Problem with "Human-in-the-Loop"

Most AI coding tools treat you like a suspicious manager:
- *"Can I edit this file?"*
- *"Can I run this command?"*
- *"Can I commit this change?"*

Click. Click. Click. A hundred tiny interruptions, each one pulling you out of flow. You're not collaborating with the AI—you're babysitting it.

### The Alternative: Policy, Not Approval

A mayor doesn't approve every traffic light change. They set policy, hire competent people, and review outcomes. That's what Mayor West Mode does:

| Instead of... | Mayor West Mode... |
|---------------|-------------------|
| Approving every file edit | Define which paths are protected |
| Approving every command | Define which commands are blocked |
| Watching every commit | Review the PR when it's ready |
| Intervening constantly | Intervene only when needed |

**Configure the guardrails once. Trust the system. Review results.**

### Why This Works

The secret isn't less safety—it's *better* safety:

1. **Humans are bad at repetitive approval tasks.** After the 50th "approve command?" dialog, you're clicking yes without reading. Real security requires designed constraints, not vigilance.

2. **Interruptions destroy deep work.** Cal Newport's research shows it takes 23 minutes to recover focus after an interruption. AI tools that interrupt every 30 seconds make productive work impossible.

3. **Outcomes matter more than process.** You don't need to watch every keystroke. You need tests to pass, code to work, and PRs to be reviewable.

### The Four Principles

| Principle | What It Means |
|-----------|---------------|
| 🎭 **Autonomous Execution** | Act without waiting for permission |
| 🔒 **Structured Boundaries** | Define what's protected, then trust the system |
| 🔄 **Iterative Resilience** | Fail, learn, retry—automatically |
| 🎯 **Outcome Focus** | Judge by results, not by process |

📖 **Read more**: [The Philosophy of Mayor West Mode](Docs/philosophy.md)

---

## Contributing

Contributions welcome! Fork, experiment, and share feedback.

---

## License

MIT — Use freely in your projects and teams.

---

**Ready to try it?**

```bash
npx mayor-west-mode setup
```

*Mayor West Mode v1.0.1*
