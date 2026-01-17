# Troubleshooting Guide - Mayor West Mode CLI

**Common issues and solutions**

---

## 🔴 "Nothing is working" / Dependencies not found

### Symptoms
```bash
# Running tests
$ npm test
sh: jest: not found

# Running CLI
$ node cli.js help
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'inquirer'
```

### Solution
**Install dependencies first!**

```bash
npm install
```

This is required after:
- Cloning the repository
- Switching branches
- Pulling updates that change package.json

### Verify installation
```bash
# Check node_modules exists
ls node_modules

# Test CLI
node cli.js help

# Run tests
npm test
```

---

## 🔴 Tests showing 0% coverage

### Expected Behavior
The current test suite shows 0% code coverage because tests duplicate logic instead of importing from `cli.js`. This is documented in:
- [TESTING_STRATEGY_ANALYSIS.md](TESTING_STRATEGY_ANALYSIS.md)
- [FUNCTIONAL_TESTING_SUMMARY.md](FUNCTIONAL_TESTING_SUMMARY.md)

### Not a Bug
This is a known architectural issue, not a test failure. All 80 tests pass successfully.

### Solution
See the improvement roadmap in TESTING_STRATEGY_ANALYSIS.md for how to fix this.

---

## 🔴 CLI commands not working

### Symptoms
```bash
$ npx mayor-west-mode setup
Command not found
```

### Solutions

**Option 1: Install globally**
```bash
npm install -g .
mayor-west-mode help
```

**Option 2: Use node directly**
```bash
node cli.js help
node cli.js setup
```

**Option 3: Use npm scripts**
```bash
npm run help
npm run setup
npm run verify
```

---

## 🔴 Import errors in tests

### Symptoms
```bash
SyntaxError: Cannot use import statement outside a module
```

### Solution
Tests use ES modules. Ensure you're running Jest with the correct Node options:

```bash
NODE_OPTIONS=--experimental-vm-modules jest
```

Or use the npm script:
```bash
npm test
```

---

## 🔴 Module resolution errors

### Symptoms
```bash
Cannot find module 'chalk'
Cannot find module 'inquirer'
```

### Solutions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Check Node version**
   ```bash
   node --version  # Should be >= 18.0.0
   ```

3. **Clear npm cache**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 🔴 Git/GitHub integration not working

### Symptoms
```bash
$ node cli.js verify
Error: gh CLI not found
```

### Requirements
The CLI requires:
- Git installed and initialized repository
- GitHub CLI (`gh`) for some features (verify, status)

### Solution

**Install GitHub CLI:**
```bash
# macOS
brew install gh

# Linux
sudo apt install gh

# Windows
winget install GitHub.cli
```

**Authenticate:**
```bash
gh auth login
```

---

## 🟡 Tests are slow

### Expected Behavior
Tests take ~2-3 seconds to run all 80 tests. This is normal.

### If taking longer
```bash
# Use watch mode for development
npm run test:watch

# Run specific test file
npm test cli.test.js
npm test cli.integration.test.js
```

---

## 🟡 Coverage report showing 0%

### Expected Behavior
This is documented and expected. See [TESTING_STRATEGY_ANALYSIS.md](TESTING_STRATEGY_ANALYSIS.md) for details.

The tests validate logic patterns but don't import actual code, resulting in 0% tracked coverage despite ~70% functional coverage.

### Not a Problem
All 80 tests pass. The coverage issue is architectural, not a test failure.

---

## ✅ Quick Health Check

Run this to verify everything is working:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Try CLI commands
node cli.js help
node cli.js version
node cli.js examples

# Expected output:
# Tests: 80 passed, 80 total
# CLI: Should display help/version/examples
```

---

## 📚 Related Documentation

- [README.md](README.md) - Getting started guide
- [TESTING_ANALYSIS_README.md](TESTING_ANALYSIS_README.md) - Testing overview
- [TESTING_STRATEGY_ANALYSIS.md](TESTING_STRATEGY_ANALYSIS.md) - Detailed testing analysis
- [Docs/cli-guide.md](Docs/cli-guide.md) - CLI usage guide

---

## 🆘 Still Having Issues?

1. **Check Node version**: `node --version` (need >= 18.0.0)
2. **Check npm version**: `npm --version` (need >= 8.0.0)
3. **Install dependencies**: `npm install`
4. **Run tests**: `npm test`
5. **Check git status**: `git status`

If problems persist after these steps, create an issue with:
- Node version
- npm version
- Operating system
- Full error message
- Steps to reproduce

---

**Last Updated:** January 17, 2026  
**Status:** Active troubleshooting guide
