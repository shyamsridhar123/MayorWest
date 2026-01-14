---
applyTo: "**/*.js"
description: JavaScript development standards for Mayor West Mode CLI
---

# JavaScript Development Standards

## Project Context

This is a Node.js CLI tool using **CommonJS** (not ESM).

## Module Pattern

```javascript
// ✅ CORRECT - CommonJS
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ❌ WRONG - ESM (not supported)
import fs from 'fs';
```

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| chalk | ^5.3.0 | Terminal colors |
| inquirer | ^9.2.12 | Interactive prompts |
| ora | ^8.0.1 | Spinner animations |

## CLI Command Pattern

```javascript
// In main() switch statement
case 'newcommand':
  await runNewCommandFlow();
  break;

// Corresponding flow function
async function runNewCommandFlow() {
  log.header('Command Title');
  
  const answers = await inquirer.prompt([
    { type: 'list', name: 'option', message: 'Choose:', choices: [...] }
  ]);
  
  const spinner = ora('Processing...').start();
  // ... work
  spinner.succeed('Done!');
}
```

## File Operations

```javascript
// Always ensure directory exists first
function ensureDirectory(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

// Usage
ensureDirectory(filePath);
fs.writeFileSync(filePath, content, 'utf-8');
```

## Git Operations

```javascript
// Always wrap in try/catch
function isGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}
```

## Error Handling

```javascript
// Use the log utility
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
};
```

## Node.js Version

- **Minimum**: 18.0.0
- Required for modern async/await and fs features
