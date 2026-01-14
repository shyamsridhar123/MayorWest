---
description: Verify all instruction files are properly configured and enforced
---

# Verify Instruction Enforcement

## Check VS Code Settings

Verify `.vscode/settings.json` has:
```json
{
  "github.copilot.chat.codeGeneration.useInstructionFiles": true,
  "chat.useAgentsMdFile": true,
  "chat.useNestedAgentsMdFiles": true,
  "chat.instructionsFilesLocations": [
    ".github/instructions",
    ".github/agents"
  ]
}
```

## Check Instruction Files Exist

```
.github/
├── copilot-instructions.md          # Root instructions (auto-loaded)
├── agents/
│   ├── mayor-west-dev.md            # Primary coordinator
│   ├── template-author.md           # Template specialist
│   ├── workflow-agent.md            # GitHub Actions expert
│   ├── docs-agent.md                # Documentation maintainer
│   └── testing-agent.md             # Test specialist
├── instructions/
│   ├── docs-editing.instructions.md # Docs/** pattern
│   ├── javascript.instructions.md   # **/*.js pattern
│   ├── workflows.instructions.md    # **/*.yml pattern
│   └── testing.instructions.md      # **/*.test.js pattern
└── prompts/
    ├── add-command.prompt.md        # Add CLI command
    └── add-template.prompt.md       # Add file template
AGENTS.md                             # Root AGENTS file
```

## Verify applyTo Patterns

| File | Pattern | Applies To |
|------|---------|------------|
| mayor-west-dev.md | `**` | All files |
| template-author.md | `Docs/mayor-west-cli.md` | CLI source only |
| workflow-agent.md | `**/*workflow*` | Workflow files |
| docs-agent.md | `Docs/**` | All docs |
| testing-agent.md | `**/*.test.js` | Test files |

## Test Enforcement

1. Open a file matching a pattern
2. Start a chat conversation
3. Check the "References" section shows instruction files
4. Verify agent behavior matches instructions

## Debug Instructions

If instructions aren't loading:
1. Check file locations match settings
2. Verify frontmatter syntax is valid YAML
3. Check applyTo glob patterns
4. Review VS Code Output → Copilot logs
