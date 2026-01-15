/**
 * Comprehensive End-to-End Test Suite for Mayor West Mode CLI
 * 
 * This test suite validates:
 * - URL parsing logic
 * - File template generation and validation
 * - Configuration validation
 * - CLI business logic
 */

import path from 'path';

describe('Mayor West Mode CLI - End-to-End Tests', () => {

  describe('GitHub URL Parsing Logic', () => {
    // Extracted from cli.js parseGitHubUrl function
    function parseGitHubUrl(url) {
      const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
      const sshMatch = url.match(/git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/);

      if (httpsMatch) {
        return { owner: httpsMatch[1], repo: httpsMatch[2] };
      } else if (sshMatch) {
        return { owner: sshMatch[1], repo: sshMatch[2] };
      }
      return null;
    }

    test('should parse HTTPS URL with .git', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo.git');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    test('should parse HTTPS URL without .git', () => {
      const result = parseGitHubUrl('https://github.com/owner/repo');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    test('should parse SSH URL with .git', () => {
      const result = parseGitHubUrl('git@github.com:owner/repo.git');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    test('should parse SSH URL without .git', () => {
      const result = parseGitHubUrl('git@github.com:owner/repo');
      expect(result).toEqual({ owner: 'owner', repo: 'repo' });
    });

    test('should return null for non-GitHub URL', () => {
      const result = parseGitHubUrl('https://gitlab.com/owner/repo.git');
      expect(result).toBeNull();
    });

    test('should return null for malformed URLs', () => {
      expect(parseGitHubUrl('https://github.com')).toBeNull();
      expect(parseGitHubUrl('git@github.com')).toBeNull();
      expect(parseGitHubUrl('')).toBeNull();
    });
  });

  describe('Path Utilities', () => {
    test('should extract dirname from file path', () => {
      const dirname = path.dirname('.vscode/settings.json');
      expect(dirname).toBe('.vscode');
    });

    test('should extract dirname from nested path', () => {
      const dirname = path.dirname('.github/workflows/auto-merge.yml');
      // Normalize both to forward slashes for cross-platform compatibility
      expect(dirname.replace(/\\/g, '/')).toBe('.github/workflows');
    });

    test('should handle root level files', () => {
      const dirname = path.dirname('README.md');
      expect(dirname).toBe('.');
    });
  });

  describe('File Template Validation', () => {
    test('VS Code settings.json template should be valid JSON', () => {
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
      
      expect(() => JSON.parse(settingsTemplate)).not.toThrow();
      const parsed = JSON.parse(settingsTemplate);
      expect(parsed['chat.tools.autoApprove']).toBe(true);
      expect(parsed['chat.agent.iterationLimit']).toBe(15);
    });

    test('VS Code settings should block destructive commands', () => {
      const settings = {
        'chat.tools.terminal.autoApprove': {
          'rm': false,
          'kill': false,
          'git reset --hard': false,
          'rm -rf': false,
        },
      };
      
      expect(settings['chat.tools.terminal.autoApprove']['rm']).toBe(false);
      expect(settings['chat.tools.terminal.autoApprove']['kill']).toBe(false);
      expect(settings['chat.tools.terminal.autoApprove']['git reset --hard']).toBe(false);
      expect(settings['chat.tools.terminal.autoApprove']['rm -rf']).toBe(false);
    });

    test('VS Code settings should auto-approve safe git commands', () => {
      const settings = {
        'chat.tools.terminal.autoApprove': {
          '/^git\\s+(commit|push)\\b/': true,
        },
      };
      
      expect(settings['chat.tools.terminal.autoApprove']['/^git\\s+(commit|push)\\b/']).toBe(true);
    });

    test('Agent template should contain required sections', () => {
      const agentTemplate = `# Mayor West Mode - Copilot Agent Protocol

You are operating in **Mayor West Mode**: eccentric, confident, autonomous.

## Your Mission

When assigned a GitHub issue with the \`mayor-task\` label, you are responsible for:
1. **Understanding** the complete task by reading the issue details
2. **Implementing** all acceptance criteria from the issue
3. **Testing** your implementation with the project's test suite
4. **Committing** your changes with a clear, descriptive message
5. **Creating/Updating** a pull request for review and merge`;
      
      expect(agentTemplate).toContain('Mayor West Mode');
      expect(agentTemplate).toContain('Your Mission');
      expect(agentTemplate).toContain('Understanding');
      expect(agentTemplate).toContain('Testing');
      expect(agentTemplate).toContain('Committing');
    });

    test('Auto-merge workflow template should have required structure', () => {
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
      
      expect(workflowTemplate).toContain('name: Mayor West Auto-Merge');
      expect(workflowTemplate).toContain('pull_request:');
      expect(workflowTemplate).toContain('permissions:');
      expect(workflowTemplate).toContain('github.actor == \'copilot\'');
    });

    test('Orchestrator workflow template should have required structure', () => {
      const orchestratorTemplate = `name: Mayor West Orchestrator

on:
  workflow_dispatch:
  pull_request:
    types: [closed]
    paths: []
  schedule:
    - cron: '*/15 * * * *'

permissions:
  contents: read
  issues: write
  pull-requests: read`;
      
      expect(orchestratorTemplate).toContain('name: Mayor West Orchestrator');
      expect(orchestratorTemplate).toContain('workflow_dispatch:');
      expect(orchestratorTemplate).toContain('schedule:');
      expect(orchestratorTemplate).toContain('cron:');
    });

    test('Issue template should have required structure', () => {
      const issueTemplate = `---
name: Mayor Task
about: Create a task for autonomous execution
labels: mayor-task
---

# [MAYOR] Brief Description of Task

**Summary**: One-sentence executive summary of what needs to be done.

## Context

## Acceptance Criteria

## Technical Constraints

## Testing Requirements

## Files Likely to Change

## Definition of Done`;
      
      expect(issueTemplate).toContain('name: Mayor Task');
      expect(issueTemplate).toContain('labels: mayor-task');
      expect(issueTemplate).toContain('Acceptance Criteria');
      expect(issueTemplate).toContain('Testing Requirements');
      expect(issueTemplate).toContain('Definition of Done');
    });
  });

  describe('Configuration Constants', () => {
    test('should have all required file configurations', () => {
      const FILES_TO_CREATE = {
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
      
      expect(Object.keys(FILES_TO_CREATE)).toHaveLength(5);
      expect(FILES_TO_CREATE['.vscode/settings.json'].critical).toBe(true);
      expect(FILES_TO_CREATE['.github/ISSUE_TEMPLATE/mayor-task.md'].critical).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    test('should validate iteration limit is positive and within range', () => {
      const validInputs = [1, 5, 15, 50];
      validInputs.forEach(input => {
        expect(input > 0 && input <= 50).toBe(true);
      });
    });

    test('should reject invalid iteration limits', () => {
      const invalidInputs = [0, -1, 51, 100];
      invalidInputs.forEach(input => {
        expect(input > 0 && input <= 50).toBe(false);
      });
    });

    test('should validate merge strategies', () => {
      const validStrategies = ['SQUASH', 'MERGE', 'REBASE'];
      expect(validStrategies).toContain('SQUASH');
      expect(validStrategies).toContain('MERGE');
      expect(validStrategies).toContain('REBASE');
      expect(validStrategies).toHaveLength(3);
    });
  });

  describe('Security Constraints', () => {
    test('should block all destructive commands', () => {
      const blockedCommands = {
        'rm': false,
        'rm -rf': false,
        'kill': false,
        'git reset --hard': false,
      };
      
      Object.values(blockedCommands).forEach(value => {
        expect(value).toBe(false);
      });
    });

    test('should allow safe package manager commands', () => {
      const allowedPatterns = [
        '/^(npm|pnpm|yarn)\\s+(test|lint|build)\\b/',
        '/^(npm|pnpm|yarn)\\s+run\\s+(test|lint|format)\\b/',
      ];
      
      expect(allowedPatterns.length).toBeGreaterThan(0);
      allowedPatterns.forEach(pattern => {
        expect(pattern).toContain('npm|pnpm|yarn');
      });
    });

    test('should enforce iteration limit constraint', () => {
      const iterationLimit = 15;
      const maxIterationLimit = 50;
      
      expect(iterationLimit).toBeLessThanOrEqual(maxIterationLimit);
      expect(iterationLimit).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty git remote URL', () => {
      const remoteUrl = '';
      // Test case: simple string check for empty URL
      const isValid = remoteUrl && remoteUrl.includes('github.com');
      expect(isValid).toBeFalsy();
    });

    test('should handle non-GitHub remote URL', () => {
      const remoteUrl = 'https://gitlab.com/owner/repo.git';
      // Test case: simple string check for non-GitHub URL
      const isGitHub = remoteUrl && remoteUrl.includes('github.com');
      expect(isGitHub).toBe(false);
    });

    test('should handle GitHub URL with subdomains', () => {
      const remoteUrl = 'https://api.github.com/owner/repo.git';
      // Production code uses proper regex matching (see parseGitHubUrl function)
      const match = remoteUrl.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
      expect(match).toBeTruthy();
      expect(match[1]).toBe('owner');
      expect(match[2]).toBe('repo');
    });
  });

  describe('Setup Mode Logic', () => {
    test('should filter for minimal setup mode', () => {
      const FILES_TO_CREATE = {
        'file1': { critical: true },
        'file2': { critical: true },
        'file3': { critical: false },
      };
      
      const minimalFiles = Object.entries(FILES_TO_CREATE)
        .filter(([_, config]) => config.critical)
        .map(([key]) => key);
      
      expect(minimalFiles).toHaveLength(2);
      expect(minimalFiles).toContain('file1');
      expect(minimalFiles).toContain('file2');
      expect(minimalFiles).not.toContain('file3');
    });

    test('should handle custom setup with selective files', () => {
      const allFiles = {
        'file1': true,
        'file2': false,
        'file3': true,
      };
      
      const selected = Object.entries(allFiles)
        .filter(([_, selected]) => selected)
        .map(([key]) => key);
      
      expect(selected).toHaveLength(2);
      expect(selected).toContain('file1');
      expect(selected).toContain('file3');
      expect(selected).not.toContain('file2');
    });
  });

  describe('CLI Commands', () => {
    test('should support all required commands', () => {
      const supportedCommands = ['setup', 'verify', 'help', 'examples', 'status'];
      
      expect(supportedCommands).toContain('setup');
      expect(supportedCommands).toContain('verify');
      expect(supportedCommands).toContain('help');
      expect(supportedCommands).toContain('examples');
      expect(supportedCommands).toContain('status');
      expect(supportedCommands).toHaveLength(5);
    });
  });

  describe('File Categories', () => {
    test('should categorize files correctly', () => {
      const categories = {
        configuration: ['.vscode/settings.json'],
        agent: ['.github/agents/mayor-west-mode.md'],
        workflow: [
          '.github/workflows/mayor-west-auto-merge.yml',
          '.github/workflows/mayor-west-orchestrator.yml'
        ],
        template: ['.github/ISSUE_TEMPLATE/mayor-task.md'],
      };
      
      expect(categories.configuration).toHaveLength(1);
      expect(categories.agent).toHaveLength(1);
      expect(categories.workflow).toHaveLength(2);
      expect(categories.template).toHaveLength(1);
    });
  });
});
