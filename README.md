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
npx github:shyamsridhar123/MayorWest setup

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
| `npx mayor-west-mode verify` | Check configuration |
| `npx mayor-west-mode status` | Show current state |
| `npx mayor-west-mode examples` | Show task examples |
| `npx mayor-west-mode help` | Show help |

---

## What Gets Created

```
your-repo/
├── .vscode/settings.json              ← YOLO auto-approve config
├── .github/
│   ├── agents/mayor-west-mode.md      ← Copilot instructions
│   ├── workflows/
│   │   ├── mayor-west-auto-merge.yml  ← Auto-approve & merge
│   │   └── mayor-west-orchestrator.yml ← Task queue processing
│   └── ISSUE_TEMPLATE/mayor-task.md   ← Task template
```

---

## Safety Guardrails

| Protection | How It Works |
|------------|--------------|
| **YOLO Whitelist** | Only safe commands auto-approved |
| **Blocked Commands** | `rm`, `kill`, `git push --force` require approval |
| **Iteration Limit** | Stops after 15 iterations (configurable) |
| **Branch Protection** | GitHub enforces status checks |
| **Test-First** | Won't commit if tests fail |

---

## Documentation

| Document | Description |
|----------|-------------|
| [CLI-README.md](Docs/CLI-README.md) | Complete README with all features |
| [cli-guide.md](Docs/cli-guide.md) | Detailed CLI user guide |
| [mayor_west_mode_trd.md](Docs/mayor_west_mode_trd.md) | Technical Requirements Document |
| [mayor_west_quick_ref.md](Docs/mayor_west_quick_ref.md) | Quick reference card |
| [testing-guide.md](Docs/testing-guide.md) | Comprehensive testing guide |
| [test-execution-report.md](Docs/test-execution-report.md) | Test execution report |

---

## Testing

The CLI has been comprehensively tested with 30 automated tests covering all core functionality.

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
- ✅ All CLI commands (setup, verify, status, help, examples)

See [testing-guide.md](Docs/testing-guide.md) for detailed testing information.

---

## Current State

**What works today:**
- ✅ Core autonomous task execution
- ✅ YOLO auto-approval for safe commands
- ✅ Auto-merge workflow pipeline
- ✅ Task queue orchestration
- ✅ Comprehensive test suite (30 tests)

**What's in progress:**
- ⚠️ Complex multi-file refactors may need task splitting
- ⚠️ Cross-repository dependencies not supported
- ⚠️ PR auto-approval not supported (GitHub limitation)

---

## The Mayor West Mindset

> *"I don't ask for permission. I execute with confidence. I iterate when I fail. I deliver results through unconventional means."*

- **Eccentric Autonomy** — Decides without waiting
- **Unwavering Confidence** — Proceeds despite chaos
- **Iterative Resilience** — Retries on failure
- **Unconventional Effectiveness** — Gets results

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

*Mayor West Mode v1.0.0*
