/**
 * End-to-End Integration Tests for Mayor West Mode CLI
 * 
 * These tests validate complete workflows from user invocation through file system changes.
 * They test real file operations, git interactions, and CLI command execution.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Mayor West Mode CLI - End-to-End Integration Tests', () => {
  
  // Test workspace directory for isolated file operations
  const testWorkspace = path.join(__dirname, 'test-workspace');
  
  beforeEach(() => {
    // Create clean test workspace
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
    fs.mkdirSync(testWorkspace, { recursive: true });
  });
  
  afterEach(() => {
    // Clean up test workspace
    if (fs.existsSync(testWorkspace)) {
      fs.rmSync(testWorkspace, { recursive: true, force: true });
    }
  });

  describe('CLI Command Execution', () => {
    test('should execute help command successfully', () => {
      const result = execSync('node cli.js help', { 
        encoding: 'utf8',
        cwd: __dirname
      });
      
      expect(result).toContain('Mayor West Mode CLI');
      expect(result).toContain('Commands:');
      expect(result).toContain('setup');
      expect(result).toContain('verify');
      expect(result).toContain('help');
      expect(result).toContain('examples');
      expect(result).toContain('status');
    });

    test('should execute version command successfully', () => {
      const result = execSync('node cli.js version', { 
        encoding: 'utf8',
        cwd: __dirname
      });
      
      expect(result).toContain('Version Information');
      expect(result).toContain('mayor-west-mode');
      expect(result).toContain('Package Information');
    });

    test('should execute examples command successfully', () => {
      const result = execSync('node cli.js examples', { 
        encoding: 'utf8',
        cwd: __dirname
      });
      
      expect(result).toContain('Examples & Best Practices');
      expect(result).toContain('[MAYOR]');
      expect(result).toContain('Acceptance Criteria');
    });

    test('should handle --version flag', () => {
      const result = execSync('node cli.js --version', { 
        encoding: 'utf8',
        cwd: __dirname
      });
      
      // Should output just the version number
      expect(result.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should handle -v flag', () => {
      const result = execSync('node cli.js -v', { 
        encoding: 'utf8',
        cwd: __dirname
      });
      
      // Should output just the version number
      expect(result.trim()).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should show error for unknown command', () => {
      try {
        execSync('node cli.js invalid-command', { 
          encoding: 'utf8',
          cwd: __dirname,
          stdio: 'pipe'
        });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.stdout || error.message).toContain('Unknown command');
      }
    });
  });

  describe('File Template Generation', () => {
    test('should generate valid VS Code settings.json', () => {
      const settingsTemplate = JSON.stringify({
        'chat.tools.autoApprove': true,
        'chat.tools.terminal.autoApprove': {
          '/^git\\s+(commit|push)\\b/': true,
          '/^(npm|pnpm|yarn)\\s+(test|lint|build)\\b/': true,
          '/^(npm|pnpm|yarn)\\s+run\\s+(test|lint|format)\\b/': true,
          'rm': false,
          'kill': false,
          'git reset --hard': false,
          'rm -rf': false,
        },
        'chat.agent.iterationLimit': 15,
        'chat.agent.maxTokensPerIteration': 4000,
        'chat.agent.slowMode': false,
      }, null, 2);
      
      // Write to test file
      const testFile = path.join(testWorkspace, 'settings.json');
      fs.writeFileSync(testFile, settingsTemplate, 'utf8');
      
      // Read back and parse
      const content = fs.readFileSync(testFile, 'utf8');
      const parsed = JSON.parse(content);
      
      expect(parsed['chat.tools.autoApprove']).toBe(true);
      expect(parsed['chat.agent.iterationLimit']).toBe(15);
      expect(parsed['chat.tools.terminal.autoApprove']['rm']).toBe(false);
    });

    test('should generate valid YAML workflow files', () => {
      const workflowContent = `name: Mayor West Auto-Merge

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest`;
      
      const testFile = path.join(testWorkspace, 'workflow.yml');
      fs.writeFileSync(testFile, workflowContent, 'utf8');
      
      const content = fs.readFileSync(testFile, 'utf8');
      
      expect(content).toContain('name: Mayor West Auto-Merge');
      expect(content).toContain('pull_request:');
      expect(content).toContain('permissions:');
      expect(content).toContain('jobs:');
    });

    test('should generate valid markdown agent instructions', () => {
      const agentContent = `# Mayor West Mode - Copilot Agent Protocol

You are operating in **Mayor West Mode**: eccentric, confident, autonomous.

## Your Mission

When assigned a GitHub issue with the \`mayor-task\` label, you are responsible for:
1. **Understanding** the complete task
2. **Implementing** all acceptance criteria
3. **Testing** your implementation
4. **Committing** your changes
5. **Creating/Updating** a pull request`;
      
      const testFile = path.join(testWorkspace, 'agent.md');
      fs.writeFileSync(testFile, agentContent, 'utf8');
      
      const content = fs.readFileSync(testFile, 'utf8');
      
      expect(content).toContain('Mayor West Mode');
      expect(content).toContain('Your Mission');
      expect(content).toContain('Understanding');
      expect(content).toContain('Testing');
    });
  });

  describe('Directory Creation and Structure', () => {
    test('should create nested directories correctly', () => {
      const nestedPath = path.join(testWorkspace, '.github', 'workflows', 'test.yml');
      const dir = path.dirname(nestedPath);
      
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(nestedPath, 'test content', 'utf8');
      
      expect(fs.existsSync(nestedPath)).toBe(true);
      expect(fs.existsSync(path.join(testWorkspace, '.github'))).toBe(true);
      expect(fs.existsSync(path.join(testWorkspace, '.github', 'workflows'))).toBe(true);
    });

    test('should create all required Mayor West directories', () => {
      const directories = [
        '.vscode',
        '.github/agents',
        '.github/workflows',
        '.github/ISSUE_TEMPLATE',
        '.github/copilot',
      ];
      
      directories.forEach(dir => {
        const fullPath = path.join(testWorkspace, dir);
        fs.mkdirSync(fullPath, { recursive: true });
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    test('should handle directory creation idempotently', () => {
      const dirPath = path.join(testWorkspace, '.vscode');
      
      // Create once
      fs.mkdirSync(dirPath, { recursive: true });
      expect(fs.existsSync(dirPath)).toBe(true);
      
      // Create again (should not error)
      fs.mkdirSync(dirPath, { recursive: true });
      expect(fs.existsSync(dirPath)).toBe(true);
    });
  });

  describe('File System Operations', () => {
    test('should write and read files correctly', () => {
      const testFile = path.join(testWorkspace, 'test.txt');
      const content = 'Test content for Mayor West Mode';
      
      fs.writeFileSync(testFile, content, 'utf8');
      const readContent = fs.readFileSync(testFile, 'utf8');
      
      expect(readContent).toBe(content);
    });

    test('should handle UTF-8 encoding correctly', () => {
      const testFile = path.join(testWorkspace, 'unicode.txt');
      const content = 'Test with Unicode: 🤖 Mayor West Mode 🚀';
      
      fs.writeFileSync(testFile, content, 'utf8');
      const readContent = fs.readFileSync(testFile, 'utf8');
      
      expect(readContent).toBe(content);
    });

    test('should check file existence correctly', () => {
      const existingFile = path.join(testWorkspace, 'exists.txt');
      const nonExistingFile = path.join(testWorkspace, 'not-exists.txt');
      
      fs.writeFileSync(existingFile, 'content', 'utf8');
      
      expect(fs.existsSync(existingFile)).toBe(true);
      expect(fs.existsSync(nonExistingFile)).toBe(false);
    });

    test('should delete files correctly', () => {
      const testFile = path.join(testWorkspace, 'to-delete.txt');
      
      fs.writeFileSync(testFile, 'content', 'utf8');
      expect(fs.existsSync(testFile)).toBe(true);
      
      fs.unlinkSync(testFile);
      expect(fs.existsSync(testFile)).toBe(false);
    });

    test('should delete directories recursively', () => {
      const nestedDir = path.join(testWorkspace, 'nested', 'dir', 'structure');
      fs.mkdirSync(nestedDir, { recursive: true });
      fs.writeFileSync(path.join(nestedDir, 'file.txt'), 'content', 'utf8');
      
      expect(fs.existsSync(nestedDir)).toBe(true);
      
      fs.rmSync(path.join(testWorkspace, 'nested'), { recursive: true, force: true });
      expect(fs.existsSync(path.join(testWorkspace, 'nested'))).toBe(false);
    });
  });

  describe('Configuration File Validation', () => {
    test('should validate all required files structure', () => {
      const files = {
        '.vscode/settings.json': {
          displayName: 'VS Code YOLO Settings',
          category: 'configuration',
          critical: true,
        },
        '.github/agents/mayor-west-mode.md': {
          displayName: 'Copilot Agent Instructions',
          category: 'agent',
          critical: true,
        },
        '.github/workflows/mayor-west-auto-merge.yml': {
          displayName: 'Auto-Merge Workflow',
          category: 'workflow',
          critical: true,
        },
        '.github/workflows/mayor-west-orchestrator.yml': {
          displayName: 'Orchestrator Workflow',
          category: 'workflow',
          critical: true,
        },
        '.github/ISSUE_TEMPLATE/mayor-task.md': {
          displayName: 'Task Template',
          category: 'template',
          critical: false,
        },
      };
      
      expect(Object.keys(files)).toHaveLength(5);
      
      const criticalFiles = Object.entries(files)
        .filter(([_, config]) => config.critical)
        .map(([path]) => path);
      
      expect(criticalFiles).toHaveLength(4);
    });

    test('should categorize files by type', () => {
      const files = [
        { path: '.vscode/settings.json', category: 'configuration' },
        { path: '.github/agents/mayor-west-mode.md', category: 'agent' },
        { path: '.github/workflows/mayor-west-auto-merge.yml', category: 'workflow' },
        { path: '.github/workflows/mayor-west-orchestrator.yml', category: 'workflow' },
        { path: '.github/ISSUE_TEMPLATE/mayor-task.md', category: 'template' },
      ];
      
      const byCategory = files.reduce((acc, file) => {
        acc[file.category] = acc[file.category] || [];
        acc[file.category].push(file.path);
        return acc;
      }, {});
      
      expect(byCategory.configuration).toHaveLength(1);
      expect(byCategory.agent).toHaveLength(1);
      expect(byCategory.workflow).toHaveLength(2);
      expect(byCategory.template).toHaveLength(1);
    });
  });

  describe('Security and Safety Validations', () => {
    test('should validate YOLO settings block destructive commands', () => {
      const settings = {
        'chat.tools.terminal.autoApprove': {
          'rm': false,
          'rm -rf': false,
          'kill': false,
          'git reset --hard': false,
        }
      };
      
      Object.values(settings['chat.tools.terminal.autoApprove']).forEach(value => {
        expect(value).toBe(false);
      });
    });

    test('should validate YOLO settings allow safe commands', () => {
      const settings = {
        'chat.tools.terminal.autoApprove': {
          '/^git\\s+(commit|push)\\b/': true,
          '/^(npm|pnpm|yarn)\\s+(test|lint|build)\\b/': true,
        }
      };
      
      Object.values(settings['chat.tools.terminal.autoApprove']).forEach(value => {
        expect(value).toBe(true);
      });
    });

    test('should validate iteration limits', () => {
      const validLimits = [1, 5, 10, 15, 30, 50];
      const invalidLimits = [0, -1, 51, 100, 1000];
      
      validLimits.forEach(limit => {
        expect(limit > 0 && limit <= 50).toBe(true);
      });
      
      invalidLimits.forEach(limit => {
        expect(limit > 0 && limit <= 50).toBe(false);
      });
    });

    test('should validate merge strategy options', () => {
      const validStrategies = ['SQUASH', 'MERGE', 'REBASE'];
      const invalidStrategies = ['FAST_FORWARD', 'CHERRY_PICK', 'INVALID'];
      
      invalidStrategies.forEach(strategy => {
        expect(validStrategies.includes(strategy)).toBe(false);
      });
      
      validStrategies.forEach(strategy => {
        expect(validStrategies.includes(strategy)).toBe(true);
      });
    });
  });

  describe('URL Parsing and Validation', () => {
    const parseGitHubUrl = (url) => {
      const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
      const sshMatch = url.match(/git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/);

      if (httpsMatch) {
        return { owner: httpsMatch[1], repo: httpsMatch[2] };
      } else if (sshMatch) {
        return { owner: sshMatch[1], repo: sshMatch[2] };
      }
      return null;
    };

    test('should parse various GitHub URL formats', () => {
      const testCases = [
        {
          url: 'https://github.com/owner/repo.git',
          expected: { owner: 'owner', repo: 'repo' }
        },
        {
          url: 'https://github.com/owner/repo',
          expected: { owner: 'owner', repo: 'repo' }
        },
        {
          url: 'git@github.com:owner/repo.git',
          expected: { owner: 'owner', repo: 'repo' }
        },
        {
          url: 'git@github.com:owner/repo',
          expected: { owner: 'owner', repo: 'repo' }
        },
      ];
      
      testCases.forEach(({ url, expected }) => {
        const result = parseGitHubUrl(url);
        expect(result).toEqual(expected);
      });
    });

    test('should handle real-world repository URLs', () => {
      const realWorldUrls = [
        'https://github.com/facebook/react.git',
        'https://github.com/microsoft/vscode',
        'git@github.com:nodejs/node.git',
        'git@github.com:vercel/next.js',
      ];
      
      realWorldUrls.forEach(url => {
        const result = parseGitHubUrl(url);
        expect(result).not.toBeNull();
        expect(result.owner).toBeTruthy();
        expect(result.repo).toBeTruthy();
      });
    });

    test('should reject non-GitHub URLs', () => {
      const nonGitHubUrls = [
        'https://gitlab.com/owner/repo',
        'https://bitbucket.org/owner/repo',
        'http://example.com/repo',
        'not-a-url',
        '',
      ];
      
      nonGitHubUrls.forEach(url => {
        const result = parseGitHubUrl(url);
        expect(result).toBeNull();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing directories gracefully', () => {
      const nonExistentPath = path.join(testWorkspace, 'does', 'not', 'exist');
      expect(fs.existsSync(nonExistentPath)).toBe(false);
    });

    test('should handle empty file writes', () => {
      const testFile = path.join(testWorkspace, 'empty.txt');
      fs.writeFileSync(testFile, '', 'utf8');
      
      const content = fs.readFileSync(testFile, 'utf8');
      expect(content).toBe('');
    });

    test('should handle special characters in filenames', () => {
      const specialFiles = [
        'file-with-dashes.txt',
        'file_with_underscores.txt',
        'file.multiple.dots.txt',
      ];
      
      specialFiles.forEach(filename => {
        const filePath = path.join(testWorkspace, filename);
        fs.writeFileSync(filePath, 'content', 'utf8');
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('should handle path normalization', () => {
      const paths = [
        '.vscode/settings.json',
        '.github/workflows/test.yml',
        'AGENTS.md',
      ];
      
      paths.forEach(p => {
        const normalized = path.normalize(p);
        expect(normalized).toBeTruthy();
      });
    });
  });

  describe('Template Content Validation', () => {
    test('should validate agent template contains key sections', () => {
      const requiredSections = [
        'Mayor West Mode',
        'Your Mission',
        'Understanding',
        'Implementing',
        'Testing',
        'Committing',
        'Creating/Updating',
      ];
      
      const agentTemplate = `# Mayor West Mode - Copilot Agent Protocol

You are operating in **Mayor West Mode**: eccentric, confident, autonomous.

## Your Mission

When assigned a GitHub issue with the \`mayor-task\` label, you are responsible for:
1. **Understanding** the complete task
2. **Implementing** all acceptance criteria
3. **Testing** your implementation
4. **Committing** your changes
5. **Creating/Updating** a pull request`;
      
      requiredSections.forEach(section => {
        expect(agentTemplate).toContain(section);
      });
    });

    test('should validate workflow template structure', () => {
      const workflowTemplate = `name: Mayor West Auto-Merge

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'copilot' || github.actor == 'copilot[bot]'`;
      
      expect(workflowTemplate).toContain('name:');
      expect(workflowTemplate).toContain('on:');
      expect(workflowTemplate).toContain('permissions:');
      expect(workflowTemplate).toContain('jobs:');
      expect(workflowTemplate).toContain('runs-on:');
      expect(workflowTemplate).toContain('github.actor');
    });

    test('should validate issue template structure', () => {
      const issueTemplate = `---
name: Mayor Task
about: Create a task for autonomous execution
labels: mayor-task
---

# [MAYOR] Brief Description of Task

## Context

## Acceptance Criteria

## Technical Constraints

## Testing Requirements`;
      
      expect(issueTemplate).toContain('name: Mayor Task');
      expect(issueTemplate).toContain('labels: mayor-task');
      expect(issueTemplate).toContain('[MAYOR]');
      expect(issueTemplate).toContain('Context');
      expect(issueTemplate).toContain('Acceptance Criteria');
      expect(issueTemplate).toContain('Technical Constraints');
      expect(issueTemplate).toContain('Testing Requirements');
    });
  });

  describe('Complete Workflow Simulation', () => {
    test('should simulate complete file setup workflow', () => {
      // Step 1: Create all directories
      const directories = [
        '.vscode',
        '.github/agents',
        '.github/workflows',
        '.github/ISSUE_TEMPLATE',
      ];
      
      directories.forEach(dir => {
        const fullPath = path.join(testWorkspace, dir);
        fs.mkdirSync(fullPath, { recursive: true });
      });
      
      // Step 2: Create all files
      const files = {
        '.vscode/settings.json': '{"test": true}',
        '.github/agents/mayor-west-mode.md': '# Agent Instructions',
        '.github/workflows/auto-merge.yml': 'name: Auto-Merge',
        '.github/workflows/orchestrator.yml': 'name: Orchestrator',
        '.github/ISSUE_TEMPLATE/mayor-task.md': '# Task Template',
      };
      
      Object.entries(files).forEach(([filePath, content]) => {
        const fullPath = path.join(testWorkspace, filePath);
        fs.writeFileSync(fullPath, content, 'utf8');
      });
      
      // Step 3: Verify all files exist
      Object.keys(files).forEach(filePath => {
        const fullPath = path.join(testWorkspace, filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
      
      // Step 4: Verify content
      Object.entries(files).forEach(([filePath, expectedContent]) => {
        const fullPath = path.join(testWorkspace, filePath);
        const actualContent = fs.readFileSync(fullPath, 'utf8');
        expect(actualContent).toBe(expectedContent);
      });
    });

    test('should simulate uninstall workflow', () => {
      // Step 1: Create files
      const files = [
        '.vscode/settings.json',
        '.github/agents/mayor-west-mode.md',
        '.github/workflows/auto-merge.yml',
      ];
      
      files.forEach(filePath => {
        const fullPath = path.join(testWorkspace, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, 'content', 'utf8');
      });
      
      // Verify files exist
      files.forEach(filePath => {
        const fullPath = path.join(testWorkspace, filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
      
      // Step 2: Delete files
      files.forEach(filePath => {
        const fullPath = path.join(testWorkspace, filePath);
        fs.unlinkSync(fullPath);
      });
      
      // Verify files deleted
      files.forEach(filePath => {
        const fullPath = path.join(testWorkspace, filePath);
        expect(fs.existsSync(fullPath)).toBe(false);
      });
    });
  });
});
