---
applyTo: "**/*.test.js"
description: Jest testing standards for Mayor West Mode CLI
---

# Testing Standards

## Test Framework

- **Jest** (^29.7.0)
- Run with: `npm test`

## Mocking Strategy

### File System
```javascript
jest.mock('fs', () => ({
  existsSync: jest.fn(() => true),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
}));
```

### Git Commands
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

### Interactive Prompts
```javascript
jest.mock('inquirer', () => ({
  prompt: jest.fn().mockResolvedValue({
    setupType: 'full',
    enableAutoMerge: true,
    mergeStrategy: 'SQUASH',
    iterationLimit: 15,
  }),
}));
```

## Test Categories

### 1. CLI Commands
```javascript
describe('CLI Commands', () => {
  test('setup creates all files', async () => {
    await runSetupFlow();
    expect(fs.writeFileSync).toHaveBeenCalledTimes(5);
  });
});
```

### 2. Template Validation
```javascript
describe('Templates', () => {
  test('settings.json is valid JSON', () => {
    const content = fileTemplates['.vscode/settings.json']();
    expect(() => JSON.parse(content)).not.toThrow();
  });
});
```

### 3. URL Parsing
```javascript
describe('parseGitHubUrl', () => {
  test.each([
    ['https://github.com/owner/repo.git', { owner: 'owner', repo: 'repo' }],
    ['git@github.com:owner/repo.git', { owner: 'owner', repo: 'repo' }],
  ])('parses %s', (url, expected) => {
    expect(parseGitHubUrl(url)).toEqual(expected);
  });
});
```

## Coverage Targets

| Category | Target |
|----------|--------|
| CLI commands | 90% |
| Utility functions | 100% |
| Template generation | 100% |
| Error handling | 80% |

## Consult @testing-agent

For complex test scenarios, invoke the testing-agent.
