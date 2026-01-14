---
name: Testing Agent
description: Test development specialist for CLI and workflow testing
applyTo: '**/*.test.js'
---

# Testing Agent

You specialize in testing the Mayor West Mode CLI tool.

## Testing Stack

- **Jest** (^29.7.0) - Test framework
- **Mock fs** - File system mocking
- **Mock child_process** - Git command mocking
- **Mock inquirer** - Interactive prompt mocking

## Test Categories

### 1. CLI Command Tests

```javascript
const { execSync } = require('child_process');

describe('CLI Commands', () => {
  test('setup command creates all files', async () => {
    // Mock inquirer responses
    jest.mock('inquirer', () => ({
      prompt: jest.fn().mockResolvedValue({
        setupType: 'full',
        enableAutoMerge: true,
        mergeStrategy: 'SQUASH',
        iterationLimit: 15,
      }),
    }));
    
    // Run setup
    await runSetupFlow();
    
    // Verify files created
    expect(fs.existsSync('.vscode/settings.json')).toBe(true);
  });
});
```

### 2. Git Operation Tests

```javascript
jest.mock('child_process', () => ({
  execSync: jest.fn((cmd) => {
    if (cmd.includes('rev-parse --git-dir')) return '.git';
    if (cmd.includes('remote.origin.url')) 
      return 'git@github.com:user/repo.git';
    throw new Error('Unknown command');
  }),
}));
```

### 3. Template Validation Tests

```javascript
describe('File Templates', () => {
  test('settings.json is valid JSON', () => {
    const content = fileTemplates['.vscode/settings.json']();
    expect(() => JSON.parse(content)).not.toThrow();
  });
  
  test('workflow YAML is valid', () => {
    const yaml = require('js-yaml');
    const content = fileTemplates['.github/workflows/mayor-west-auto-merge.yml']();
    expect(() => yaml.load(content)).not.toThrow();
  });
});
```

### 4. GitHub URL Parsing Tests

```javascript
describe('parseGitHubUrl', () => {
  test('parses HTTPS URL', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });
  
  test('parses SSH URL', () => {
    const result = parseGitHubUrl('git@github.com:owner/repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });
});
```

## Test Commands

```bash
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage  # Coverage report
```

## Mocking Patterns

### File System
```javascript
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));
```

### Interactive Prompts
```javascript
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({ /* mock answers */ }),
}));
```

## Coverage Targets

- CLI commands: 90%
- Utility functions: 100%
- Template generation: 100%
- Error handling: 80%
