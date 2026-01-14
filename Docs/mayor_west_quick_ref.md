# Mayor West Mode — Quick Reference

> Experimental autonomous workflows for GitHub Copilot.

---

## 🚀 Quick Start

```bash
npx mayor-west-mode setup    # Interactive setup wizard
npx mayor-west-mode verify   # Check configuration
```

---

## 📦 What Gets Installed

| File | Purpose |
|------|---------|
| `.vscode/settings.json` | YOLO auto-approve configuration |
| `.github/agents/mayor-west-mode.md` | Copilot behavioral instructions |
| `.github/workflows/mayor-west-auto-merge.yml` | Auto-approve & merge PRs |
| `.github/workflows/mayor-west-orchestrator.yml` | Task queue processing |
| `.github/ISSUE_TEMPLATE/mayor-task.md` | Standardized task template |

---

## ⚙️ How It Works

```
Issue Created → Orchestrator Assigns → Copilot Executes → PR Auto-Merges → Loop
```

1. **Create**: GitHub Issue with `[MAYOR]` prefix + acceptance criteria
2. **Assign**: Orchestrator workflow assigns to `@copilot`
3. **Execute**: Copilot implements with YOLO auto-approval
4. **Merge**: PR approved automatically when checks pass
5. **Repeat**: Next unassigned task gets picked up

---

## 🛡️ Safety Features

| Feature | Protection |
|---------|------------|
| **YOLO Whitelist** | Only safe commands auto-approved |
| **Blocked Commands** | `rm`, `kill`, `git push --force` blocked |
| **Iteration Limit** | Stops after 15 iterations (default) |
| **Branch Protection** | GitHub enforces status checks |
| **Test-First** | Won't commit if tests fail |

---

## 📋 CLI Commands

```bash
npx mayor-west-mode setup     # Guided setup wizard
npx mayor-west-mode verify    # Check all files present
npx mayor-west-mode status    # Show current state
npx mayor-west-mode examples  # Show task examples
npx mayor-west-mode help      # Show help
```

---

## ✅ Post-Setup Checklist

- [ ] Enable auto-merge: `GitHub → Settings → Pull Requests`
- [ ] Add branch protection: `GitHub → Settings → Branches → main`
- [ ] Commit files: `git add .vscode .github && git commit && git push`
- [ ] Test run: `GitHub → Actions → Mayor West Orchestrator → Run`

---

## 🎭 The Mayor West Mindset

> *"I don't ask for permission. I execute with confidence."*

- **Eccentric Autonomy** — Decides without waiting
- **Unwavering Confidence** — Proceeds despite chaos
- **Iterative Resilience** — Retries on failure
- **Unconventional Effectiveness** — Gets results

---

**Ready?** `npx mayor-west-mode setup`
