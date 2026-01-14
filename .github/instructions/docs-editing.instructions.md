---
applyTo: "Docs/**"
description: Instructions for editing documentation files that contain source code
---

# Documentation-First Architecture

## CRITICAL: Source Code in Markdown

This project uses a **docs-as-code** pattern where actual source code is embedded in markdown files:

| Document | Contains Actual Source For |
|----------|---------------------------|
| `Docs/mayor-west-cli.md` | `cli.js` |
| `Docs/package-json.md` | `package.json` |

## When Editing These Files

1. **Edit the code block content** - this IS the source code
2. **Preserve markdown formatting** around the code blocks
3. **Test changes** by extracting the code and running it
4. **Update related docs** (TRD, README) when making changes

## Cross-Reference Requirements

When modifying code in docs:

- [ ] Update TRD (`mayor_west_mode_trd.md`) if adding features
- [ ] Update CLI-README.md if changing CLI commands
- [ ] Update quick reference if changing user-facing behavior

## File Templates in cli.js

When editing `fileTemplates` in `mayor-west-cli.md`:

```javascript
// Template pattern - function returning string
'.path/to/file': () => `template content`,

// JSON template - use JSON.stringify
'.vscode/settings.json': () => JSON.stringify({...}, null, 2),

// Escape rules:
// - Double-escape regex in JSON: \\s+ not \s+
// - Escape $ in GitHub Actions: \${{ }} not ${{ }}
// - Escape backticks in template literals: \`
```

## Consult Specialist Agents

- **@template-author** for `fileTemplates` changes
- **@workflow-agent** for workflow template changes
- **@docs-agent** for documentation structure
