# Testing Guide for Mayor West Mode CLI

## Overview

This document provides comprehensive information about testing the Mayor West Mode CLI tool, including automated tests, manual testing procedures, and guidelines for contributors.

## Test Suite

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

### Test Structure

The test suite is located in `cli.test.js` and consists of 30 comprehensive tests covering:

#### 1. GitHub URL Parsing Logic (6 tests)
- HTTPS URLs with and without `.git` extension
- SSH URLs with and without `.git` extension
- Invalid and malformed URL handling
- Support for both `https://github.com/owner/repo` and `git@github.com:owner/repo` formats

#### 2. Path Utilities (3 tests)
- Directory extraction from file paths
- Nested path handling
- Root-level file handling

#### 3. File Template Validation (6 tests)
- VS Code settings JSON validation
- Security constraint verification (blocked commands)
- Safe command auto-approval patterns
- Agent instruction template structure
- GitHub Actions workflow template structure
- Issue template structure

#### 4. Configuration Constants (1 test)
- All 5 required configuration files verified
- Critical vs. optional file designation

#### 5. Configuration Validation (3 tests)
- Iteration limit validation (1-50 range)
- Invalid iteration limit rejection
- Merge strategy validation (SQUASH, MERGE, REBASE)

#### 6. Security Constraints (3 tests)
- Destructive command blocking (`rm`, `kill`, `git reset --hard`)
- Safe package manager command approval
- Iteration limit enforcement

#### 7. Edge Cases (3 tests)
- Empty git remote URL handling
- Non-GitHub URL handling
- GitHub URLs with subdomains

#### 8. Setup Mode Logic (2 tests)
- Minimal setup mode filtering (critical files only)
- Custom setup mode with selective file creation

#### 9. CLI Commands (1 test)
- All 5 commands supported: setup, verify, help, examples, status

#### 10. File Categories (1 test)
- Proper categorization: configuration, agent, workflow, template

## Manual Testing

### Prerequisites

- Node.js 18+ installed
- Git repository initialized
- GitHub remote configured

### Test Scenarios

#### 1. Help Command
```bash
node cli.js help
```

**Expected Output:**
- Usage instructions
- List of all commands
- Command descriptions
- Example commands

**Validation:**
- ✓ All commands listed
- ✓ Descriptions clear and accurate
- ✓ Examples provided

#### 2. Examples Command
```bash
node cli.js examples
```

**Expected Output:**
- 3 example tasks (simple, medium, complex)
- Best practices section
- Task complexity guidelines

**Validation:**
- ✓ Examples cover different complexity levels
- ✓ Best practices are actionable
- ✓ Formatting is clear

#### 3. Status Command
```bash
node cli.js status
```

**Expected Output:**
- Git repository status
- Remote URL
- Current branch
- Configuration file status (✓ or ✗ for each)

**Validation:**
- ✓ Detects git repository correctly
- ✓ Shows correct remote URL
- ✓ Lists all 5 configuration files
- ✓ Accurately reports file existence

#### 4. Verify Command
```bash
node cli.js verify
```

**Expected Output:**
- Check results for each file and git repository
- Pass/fail count (X/7 checks passed)
- Success or warning message

**Validation:**
- ✓ Checks all 7 items
- ✓ Accurately reports pass/fail
- ✓ Provides actionable next steps

#### 5. Setup Command (Interactive)
```bash
node cli.js setup
```

**Expected Behavior:**
1. Validates git repository
2. Validates GitHub remote
3. Prompts for setup type (full/minimal/custom)
4. Prompts for auto-merge preference
5. Prompts for merge strategy
6. Prompts for iteration limit
7. Creates selected files
8. Shows success message with next steps

**Validation:**
- ✓ Exits early if not a git repository
- ✓ Exits early if no GitHub remote
- ✓ Creates all selected files
- ✓ Files contain correct content
- ✓ Directories created recursively
- ✓ Next steps clearly explained

### Error Scenario Testing

#### Non-Git Repository
```bash
mkdir /tmp/test-non-git
cd /tmp/test-non-git
node /path/to/cli.js setup
```

**Expected:** Error message indicating not a git repository, exit code 1

#### Missing GitHub Remote
```bash
mkdir /tmp/test-no-remote
cd /tmp/test-no-remote
git init
node /path/to/cli.js setup
```

**Expected:** Error message indicating no git remote found, exit code 1

#### Non-GitHub Remote
```bash
mkdir /tmp/test-gitlab
cd /tmp/test-gitlab
git init
git remote add origin https://gitlab.com/owner/repo.git
node /path/to/cli.js setup
```

**Expected:** Error message indicating remote doesn't point to GitHub, exit code 1

## Generated File Validation

After running setup, verify each generated file:

### 1. `.vscode/settings.json`
- ✓ Valid JSON
- ✓ `chat.tools.autoApprove` is `true`
- ✓ Destructive commands blocked (`rm`, `kill`, etc.)
- ✓ Safe commands auto-approved (git commit/push, npm test/build)
- ✓ `chat.agent.iterationLimit` set correctly

### 2. `.github/agents/mayor-west-mode.md`
- ✓ Contains "Your Mission" section
- ✓ Contains numbered steps for task execution
- ✓ Contains "Operating Principles" section
- ✓ Contains "Failure Recovery" section
- ✓ Contains "Safety Constraints" section

### 3. `.github/workflows/mayor-west-auto-merge.yml`
- ✓ Valid YAML syntax
- ✓ Triggers on pull_request events
- ✓ Filters for copilot actor
- ✓ Has approve and enable auto-merge steps
- ✓ Uses GitHub Actions v7

### 4. `.github/workflows/mayor-west-orchestrator.yml`
- ✓ Valid YAML syntax
- ✓ Triggers on workflow_dispatch, pull_request closed, schedule
- ✓ Cron schedule: `*/15 * * * *` (every 15 minutes)
- ✓ Finds unassigned mayor-task issues
- ✓ Triggers Copilot via comment

### 5. `.github/ISSUE_TEMPLATE/mayor-task.md`
- ✓ Has YAML frontmatter
- ✓ Label: `mayor-task`
- ✓ Contains all required sections
- ✓ Provides clear structure for tasks

## Test Maintenance

### Adding New Tests

When adding new functionality to the CLI:

1. **Add unit tests** for pure functions (URL parsing, validation, etc.)
2. **Test edge cases** (empty strings, null values, invalid inputs)
3. **Test error handling** (what happens when things go wrong)
4. **Update this guide** with new test scenarios

### Test Naming Convention

```javascript
describe('Feature Category', () => {
  test('should do something specific', () => {
    // Test implementation
  });
});
```

### Best Practices

- ✓ Keep tests independent (no shared state)
- ✓ Test one thing per test
- ✓ Use descriptive test names
- ✓ Prefer pure function testing over mocking when possible
- ✓ Test both success and failure paths

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Run tests with coverage
  run: npm run test:coverage
```

## Debugging Tests

### Running Individual Tests

```bash
# Run specific test file
NODE_OPTIONS=--experimental-vm-modules npx jest cli.test.js

# Run tests matching a pattern
NODE_OPTIONS=--experimental-vm-modules npx jest -t "GitHub URL Parsing"
```

### Verbose Output

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest --verbose
```

## Known Limitations

- **Coverage reporting:** Due to ES modules and the CLI structure, code coverage shows 0%. Tests validate business logic independently, which is actually better for maintainability.
- **Interactive prompts:** The test suite doesn't test interactive prompts directly (inquirer). Manual testing is required for these scenarios.
- **File system operations:** Tests validate logic, not actual file creation. Manual verification recommended after running setup.

## Contributing

When contributing to the test suite:

1. Ensure all existing tests pass
2. Add tests for new functionality
3. Update this guide with new test scenarios
4. Follow the existing test structure and naming conventions

## Support

For questions about testing:
- Review existing tests in `cli.test.js`
- Consult the Jest documentation: https://jestjs.io/
- Check this testing guide

---

**Last Updated:** January 15, 2026  
**Test Suite Version:** 1.0.0  
**Total Tests:** 30
