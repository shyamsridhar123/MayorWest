# Contributing to Mayor West Mode

Thank you for your interest in contributing to Mayor West Mode! This document provides guidelines for contributing to the project.

---

## How to Report Bugs

If you find a bug, please create a GitHub issue with the following information:

### Bug Report Template

**Title**: Brief description of the bug

**Description**:
- What happened?
- What did you expect to happen?
- Steps to reproduce the bug

**Environment**:
- Node.js version: `node --version`
- Operating system: (macOS, Linux, Windows)
- Mayor West Mode version: Check `package.json`

**Additional Context**:
- Screenshots (if applicable)
- Error messages or logs
- Relevant configuration files (`.vscode/settings.json`, workflow files)

**Example**:
```
Title: Auto-merge workflow fails with 403 error

Description:
The auto-merge workflow fails when trying to approve PRs with a 403 Forbidden error.

Environment:
- Node.js: v18.17.0
- OS: macOS 13.4
- Version: 1.0.0

Error message:
HttpError: Resource not accessible by integration
```

---

## How to Submit Pull Requests

We welcome contributions! Please follow these steps:

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR-USERNAME/mayor-west-mode.git
cd mayor-west-mode
```

### 2. Create a Feature Branch

```bash
# Use descriptive branch names
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 3. Make Your Changes

- Keep changes focused and minimal
- Follow the existing code style (see below)
- Add or update tests as needed
- Update documentation if you're changing functionality

### 4. Test Your Changes

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

All tests must pass before submitting your PR.

### 5. Commit Your Changes

Use clear, descriptive commit messages:

```bash
# Format: [MAYOR] Brief description
git commit -m "[MAYOR] Add new CLI command for status check"
git commit -m "[MAYOR] Fix auto-merge workflow permissions"
```

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:
- **Title**: Clear description of what the PR does
- **Description**: 
  - What problem does it solve?
  - How does it solve it?
  - Any breaking changes?
  - Screenshots (for UI changes)

### 7. PR Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, your PR will be merged

---

## Code Style Guidelines

### JavaScript/Node.js

- **Module System**: ES Modules (ESM) - use `import`/`export`
- **Node.js Version**: >= 18.0.0
- **Formatting**: Run `npm run format` (Prettier)
- **Linting**: Run `npm run lint` (ESLint)

### Code Conventions

**File Operations**:
```javascript
// Always ensure directories exist before writing files
function ensureDirectory(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}
```

**Error Handling**:
```javascript
// Use the log utility for consistent messaging
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
};
```

**Git Operations**:
```javascript
// Always wrap in try/catch for git commands
try {
  execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  return true;
} catch (e) {
  return false;
}
```

**CLI Commands**:
- Add new commands in `main()` switch statement
- Create corresponding `runXxxFlow()` async function
- Use `inquirer` for interactive prompts
- Use `ora` for progress spinners
- Use `chalk` for colored output

### Documentation Standards

When editing documentation:
- Keep line length reasonable (aim for 80-120 characters)
- Use markdown formatting consistently
- Update the TRD (`Docs/mayor_west_mode_trd.md`) for architectural changes
- Update CLI-README.md for user-facing changes
- Maintain the docs-as-code pattern (source code in markdown files)

### Template Escaping Rules

When editing file templates in `cli.js`:

```javascript
// Escape $ for GitHub Actions expressions
`\${{ secrets.GITHUB_TOKEN }}`

// Escape backticks in template literals
`body: \`Message here\``

// Double-escape regex in JSON (actual pattern: /^git\s+(commit|push)\b/)
// In JSON template string, each backslash must be escaped:
"pattern": "/^git\\\\s+(commit|push)\\\\b/"
```

---

## Testing Requirements

### Test Coverage Targets

| Category | Target |
|----------|--------|
| CLI commands | 90% |
| Utility functions | 100% |
| Template generation | 100% |
| Error handling | 80% |

### Writing Tests

- Use **Jest** (version specified in `package.json`)
- Place tests in `*.test.js` files
- Follow existing test patterns (see `cli.test.js`)

**Test Structure**:
```javascript
describe('Feature Name', () => {
  test('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

**Mock Examples**:
```javascript
// Mock file system
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));

// Mock git commands
jest.mock('child_process', () => ({
  execSync: jest.fn((cmd) => {
    if (cmd.includes('rev-parse --git-dir')) return '.git';
    throw new Error('Unknown command');
  }),
}));
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch
```

---

## Development Workflow

### Setting Up Development Environment

```bash
# 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/mayor-west-mode.git
cd mayor-west-mode

# 2. Install dependencies
npm install

# 3. Run tests to verify setup
npm test

# 4. Try the CLI locally
node cli.js --help
npm run setup
```

### Testing Your Changes

```bash
# Test CLI commands
npm run setup      # Test setup flow
npm run verify     # Test verify flow
npm run status     # Test status flow
npm run examples   # Test examples flow

# Run the full test suite
npm test

# Check code style
npm run lint
npm run format
```

### Common Development Tasks

**Adding a new CLI command**:
1. Add case in `main()` switch statement in `cli.js`
2. Create `runXxxFlow()` async function
3. Add corresponding test in `cli.test.js`
4. Update documentation in `Docs/CLI-README.md`

**Adding a new file template**:
1. Add entry to `FILES_TO_CREATE` array
2. Add template function to `fileTemplates` object
3. Add validation test in `cli.test.js`
4. Document in relevant docs

---

## Questions or Need Help?

- Check existing GitHub Issues in the repository
- Review the [documentation](Docs/)
- Create a new issue with your question

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Mayor West Mode!** 🎉
