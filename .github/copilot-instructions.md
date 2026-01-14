---
applyTo: '**'
---
# Mayor West Mode - Copilot Instructions

> **MEMORY ENFORCEMENT**: These instructions MUST be loaded and followed for ALL interactions with this codebase. Agents defined in `.github/agents/` provide specialized expertise.

This is a Node.js CLI tool for setting up autonomous GitHub Copilot development workflows. The CLI creates configuration files that enable Copilot to execute tasks with YOLO (auto-approval) mode.

## Agent Ecosystem

**ALWAYS consult the appropriate specialist agent for domain-specific tasks:**

| Agent | File | Expertise | Invoke For |
|-------|------|-----------|------------|
| **Mayor West Dev** | `agents/mayor-west-dev.md` | Primary coordinator | CLI commands, project-wide changes |
| **Template Author** | `agents/template-author.md` | File templates | Editing `fileTemplates` in cli.js |
| **Workflow Agent** | `agents/workflow-agent.md` | GitHub Actions | Auto-merge, orchestrator workflows |
| **Docs Agent** | `agents/docs-agent.md` | Documentation | TRD, README, docs-as-code |
| **Testing Agent** | `agents/testing-agent.md` | Test development | Jest tests, mocking patterns |

### Agent Delegation Pattern

```
User Request
    │
    ▼
Mayor West Dev (coordinator)
    │
    ├─→ Template changes? → @template-author
    ├─→ Workflow changes? → @workflow-agent
    ├─→ Documentation?    → @docs-agent
    └─→ Tests needed?     → @testing-agent
```

## Project Architecture

```
MayorWest/
├── Docs/                           # All documentation
│   ├── CLI-README.md               # Main README for the npm package
│   ├── cli-guide.md                # Detailed CLI user guide
│   ├── mayor_west_mode_trd.md      # Technical Requirements Document (architecture source of truth)
│   ├── mayor_west_quick_ref.md     # Quick reference card
│   ├── mayor-west-cli.md           # CLI source code (cli.js)
│   └── package-json.md             # Package.json definition
└── .vscode/settings.json           # Local VS Code settings
```

**Key pattern**: Documentation files in `Docs/` contain both Markdown documentation AND embedded source code (e.g., `mayor-west-cli.md` contains the full `cli.js` source). This is a documentation-first approach where the actual code is authored within markdown files.

## CLI Tool Overview

The CLI (`npx mayor-west-mode <command>`) creates 5 configuration files in target repositories:

| File | Purpose |
|------|---------|
| `.vscode/settings.json` | YOLO auto-approve settings for Copilot |
| `.github/agents/mayor-west-mode.md` | Agent behavioral instructions |
| `.github/workflows/mayor-west-auto-merge.yml` | Auto-approve/merge PRs from Copilot |
| `.github/workflows/mayor-west-orchestrator.yml` | Task queue orchestration workflow |
| `.github/ISSUE_TEMPLATE/mayor-task.md` | GitHub issue template for tasks |

## Code Patterns

### File Template System
Templates in `cli.js` are functions returning strings:
```javascript
const fileTemplates = {
  '.vscode/settings.json': () => JSON.stringify({...}, null, 2),
  '.github/agents/mayor-west-mode.md': () => `# Mayor West Mode...`,
  // Each template is a function that returns the file content
};
```

### CLI Command Structure
Commands follow this pattern in `main()`:
```javascript
switch (command) {
  case 'setup': await runSetupFlow(); break;
  case 'verify': await runVerifyFlow(); break;
  // Add new commands here with corresponding async functions
}
```

### Interactive Prompts
Use `inquirer` for user input:
```javascript
const answers = await inquirer.prompt([
  { type: 'list', name: 'setupType', message: '...', choices: [...] },
  { type: 'confirm', name: 'enableAutoMerge', message: '...', default: true },
]);
```

## Development Commands

```bash
npm install           # Install dependencies (chalk, inquirer, ora)
npm run setup        # Run: node cli.js setup
npm run verify       # Run: node cli.js verify
npm test             # Run Jest tests
npm run lint         # Run ESLint
```

## YOLO Configuration Patterns

Safe commands (auto-approved):
- `/^git\s+(commit|push)\b/` - Git commit and push
- `/^(npm|pnpm|yarn)\s+(test|lint|build)\b/` - Package manager commands

Blocked commands (require manual approval):
- `rm`, `kill`, `git reset --hard` - Destructive operations

## GitHub Workflow Patterns

### Auto-merge workflow triggers on:
- `pull_request: [opened, synchronize, reopened]`
- Filters for `github.actor == 'copilot'`

### Orchestrator workflow triggers on:
- `workflow_dispatch` - Manual trigger
- `pull_request: [closed]` - After PR merge
- `schedule: '*/15 * * * *'` - Every 15 minutes

## Key Dependencies

- **chalk** (^5.3.0): Terminal styling
- **inquirer** (^9.2.12): Interactive prompts
- **ora** (^8.0.1): Spinner animations
- **Node.js** >= 18.0.0 required (uses modern ESM features)

## Adding New Features

1. **New CLI command**: Add case in `main()` switch, create corresponding `runXxxFlow()` function
2. **New file template**: Add entry to `FILES_TO_CREATE` and `fileTemplates` objects
3. **New configuration option**: Add prompt in `runSetupFlow()`, update template generation

## Testing Considerations

- CLI requires a git repository context for most operations
- Mock `execSync` for git command tests
- Mock `fs` operations for file creation tests
- Interactive prompts can be tested by mocking `inquirer.prompt`

---

## Memory Enforcement Rules

**These rules are MANDATORY and must persist across all sessions:**

1. **Documentation-First**: Source code lives in `Docs/*.md` files. Edit the markdown, not standalone `.js` files.

2. **Agent Hierarchy**: Always check if a specialist agent applies before making changes:
   - `Docs/mayor-west-cli.md` → Consult **@template-author**
   - `**/workflow*.yml` → Consult **@workflow-agent**
   - `Docs/**` → Consult **@docs-agent**
   - `**/*.test.js` → Consult **@testing-agent**

3. **YOLO Safety**: Never auto-approve destructive commands (`rm`, `kill`, `reset --hard`)

4. **Template Escaping**: Double-escape regex in JSON, escape `$` in GitHub Actions

5. **TRD Sync**: Update `mayor_west_mode_trd.md` BEFORE implementing new features

6. **Commit Format**: `[MAYOR] <description>` for all commits

## Quick Reference

```bash
# Development
npm install && npm run setup

# Testing  
npm test

# CLI Commands
npx mayor-west-mode setup    # Interactive setup
npx mayor-west-mode verify   # Check configuration
npx mayor-west-mode status   # Show current state
npx mayor-west-mode examples # Show task examples
```

---

## Enforcement Architecture

This project uses **multi-layered instruction enforcement**:

### Layer 1: Root Instructions (Always Loaded)
- `.github/copilot-instructions.md` - This file, auto-loaded for all requests
- `AGENTS.md` - Root agent file, auto-loaded when enabled

### Layer 2: Pattern-Based Instructions (`.github/instructions/`)
| File | Pattern | Auto-Applies To |
|------|---------|-----------------|
| `docs-editing.instructions.md` | `Docs/**` | All documentation files |
| `javascript.instructions.md` | `**/*.js` | All JavaScript files |
| `workflows.instructions.md` | `**/*.yml` | All YAML/workflow files |
| `testing.instructions.md` | `**/*.test.js` | All test files |

### Layer 3: Specialist Agents (`.github/agents/`)
Custom agents with deep expertise, invoked by name or file pattern.

### Layer 4: Reusable Prompts (`.github/prompts/`)
| Prompt | Purpose |
|--------|---------|
| `add-command.prompt.md` | Add new CLI command |
| `add-template.prompt.md` | Add new file template |
| `verify-enforcement.prompt.md` | Verify instruction loading |

### VS Code Settings (Enforcement Config)
```json
{
  "github.copilot.chat.codeGeneration.useInstructionFiles": true,
  "chat.useAgentsMdFile": true,
  "chat.useNestedAgentsMdFiles": true,
  "chat.instructionsFilesLocations": [".github/instructions", ".github/agents"]
}
```
