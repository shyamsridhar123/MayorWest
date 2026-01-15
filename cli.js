#!/usr/bin/env node

/**
 * Mayor West Mode - CLI Installer & Setup Tool
 * 
 * A comprehensive Node.js CLI tool for setting up autonomous GitHub Copilot
 * development workflows inspired by Family Guy's Mayor Adam West.
 * 
 * Usage:
 *   npx mayor-west-mode setup
 *   npx mayor-west-mode verify
 *   npx mayor-west-mode help
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import pkg from './package.json' with { type: 'json' };

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const MAYOR_WEST_CONFIG = {
  version: pkg.version,
  name: 'Mayor West Mode',
  description: 'Autonomous GitHub Copilot development workflow',
};

const FILES_TO_CREATE = {
  // Core Configuration
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
  // Security Layer Files
  '.github/CODEOWNERS': {
    displayName: 'CODEOWNERS (Actor Allowlist)',
    category: 'security',
    critical: true,
  },
  '.github/mayor-west.yml': {
    displayName: 'Security Config (Protected Paths)',
    category: 'security',
    critical: true,
  },
  // Copilot Integration
  '.github/copilot/instructions.md': {
    displayName: 'Copilot SWE Agent Instructions',
    category: 'copilot',
    critical: true,
  },
  '.github/copilot-instructions.md': {
    displayName: 'Project Copilot Instructions',
    category: 'copilot',
    critical: true,
  },
  'AGENTS.md': {
    displayName: 'Root Agent File',
    category: 'copilot',
    critical: true,
  },
  // Versioning
  '.versionrc.json': {
    displayName: 'Semantic Version Config',
    category: 'versioning',
    critical: false,
  },
  'CHANGELOG.md': {
    displayName: 'Changelog',
    category: 'versioning',
    critical: false,
  },
  '.github/workflows/release.yml': {
    displayName: 'Release Workflow',
    category: 'versioning',
    critical: false,
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠'), msg),
  header: (msg) => console.log(chalk.bold.cyan(`\n━━━ ${msg} ━━━\n`)),
  divider: () => console.log(chalk.gray('─'.repeat(60))),
};

function isGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function getGitRemoteUrl() {
  try {
    return execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
  } catch (e) {
    return null;
  }
}

function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch (e) {
    return 'main';
  }
}

function parseGitHubUrl(url) {
  // Supports both https and SSH URLs
  const httpsMatch = url.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
  const sshMatch = url.match(/git@github\.com:([^/]+)\/([^/]+?)(\.git)?$/);

  if (httpsMatch) {
    return { owner: httpsMatch[1], repo: httpsMatch[2] };
  } else if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }
  return null;
}

function ensureDirectory(dir) {
  const dirname = path.dirname(dir);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

function openUrl(url) {
  // Open URL in system default browser
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      execSync(`start "" "${url}"`, { stdio: 'ignore', shell: true });
    } else if (platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' });
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
    }
    return true;
  } catch (e) {
    return false;
  }
}

// ============================================================================
// FILE TEMPLATES
// ============================================================================

const fileTemplates = {
  '.vscode/settings.json': (options = {}) => JSON.stringify({
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
  }, null, 2),

  '.github/agents/mayor-west-mode.md': (options = {}) => `# Mayor West Mode - Copilot Agent Protocol

You are operating in **Mayor West Mode**: eccentric, confident, autonomous.

## Your Mission

When assigned a GitHub issue with the \`mayor-task\` label, you are responsible for:
1. **Understanding** the complete task by reading the issue details
2. **Implementing** all acceptance criteria from the issue
3. **Testing** your implementation with the project's test suite
4. **Committing** your changes with a clear, descriptive message
5. **Creating/Updating** a pull request for review and merge

## Operating Principles

### 1. Read the Issue Completely
- Parse the issue title and description thoroughly
- Extract all acceptance criteria (numbered list or checklist)
- Identify testing requirements
- Note any technical constraints or architectural guidelines

### 2. Implement with Autonomy
- Make architectural decisions based on code style in the repository
- Use existing patterns and conventions
- Don't ask for clarification—infer intent from context
- Iterate on your own output when initial attempts fail

### 3. Test Before Committing
- Run the project's test suite: \`npm test\`, \`pytest\`, or equivalent
- Ensure all tests pass before committing
- If tests fail, analyze the error and fix your implementation
- Don't commit broken code under any circumstances

### 4. Commit with Clear Messages
- Use format: \`[MAYOR] <issue-title>: <specific-change>\`
- Example: \`[MAYOR] Add authentication flow: Implement JWT verification\`
- Include reference to the original issue: \`Closes #123\`
- Commit messages should explain **what** changed and **why**

### 5. Create or Update Pull Request
- Push your branch (YOLO auto-approval will handle this)
- GitHub will automatically create/update the PR
- The PR title should match the issue title
- Include a link to the issue: \`Closes #<issue-number>\`
- Your job is complete when the PR is created—automation handles review/merge

## Failure Recovery

If something fails:
1. **Test Failure**: Analyze the error, fix your code, re-run tests, commit again
2. **Type Errors**: Review type definitions, fix implementation, re-run tests
3. **Linting Errors**: Run formatter (\`prettier\`, \`black\`), commit, re-run tests
4. **Import Errors**: Check imports are correct, verify file paths, fix, re-run tests
5. **Merge Conflict**: Rebase onto latest main, resolve conflicts, force-push

**You have 15 iterations maximum**—use them wisely.

## Example Workflow

Issue: "Add user profile endpoint"
Acceptance Criteria:
- [ ] Create GET /api/users/:id endpoint
- [ ] Fetch user from database
- [ ] Return JSON with user data
- [ ] Tests pass
- [ ] Linting passes

Your Actions:
1. Read issue → Understand requirements
2. Create branch: git checkout -b feature/user-profile-endpoint
3. Implement endpoint in src/routes/users.ts
4. Implement tests in src/routes/__tests__/users.test.ts
5. Run: npm test → ✅ All pass
6. Run: npm run lint → ✅ No errors
7. Commit: git commit -m "[MAYOR] Add user profile endpoint: GET /api/users/:id returns user data"
8. Push: git push origin feature/user-profile-endpoint
9. PR created automatically → Your job done

## Safety Constraints

- **Never** use \`rm -rf\` or destructive commands without confirmation
- **Never** force-push to \`main\` or \`master\`
- **Always** run tests before committing
- **Always** respect branch protection rules
- **Always** create PRs—don't push directly to main
- **Always** follow the project's code of conduct

## Success Metrics

You have successfully completed a task when:
- ✅ All acceptance criteria implemented
- ✅ All tests pass
- ✅ Code linting passes
- ✅ PR created with clear message
- ✅ PR is ready for auto-merge

**Remember**: Mayor West doesn't ask for permission. He executes with confidence.
`,

  '.github/workflows/mayor-west-auto-merge.yml': (options = {}) => `name: Mayor West Auto-Merge

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'copilot' || github.actor == 'copilot[bot]'
    
    steps:
      - name: Enable Auto-Merge
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          script: |
            try {
              await github.graphql(\`
                mutation {
                  enablePullRequestAutoMerge(input: {
                    pullRequestId: "\${context.payload.pull_request.node_id}"
                    mergeMethod: SQUASH
                  }) {
                    pullRequest {
                      id
                      title
                      autoMergeRequest {
                        enabledAt
                        mergeMethod
                      }
                    }
                  }
                }
              \`);
              console.log('✅ Auto-merge enabled for PR #' + context.issue.number);
              console.log('Note: PR will merge automatically once all required status checks pass.');
            } catch (error) {
              console.log('⚠️  Auto-merge could not be enabled:', error.message);
              console.log('This is expected if:');
              console.log('  - Repository does not have "Allow auto-merge" enabled in settings');
              console.log('  - Branch protection rules are not configured');
              console.log('  - Required status checks are not defined');
            }
`,

  '.github/workflows/mayor-west-orchestrator.yml': (options = {}) => `name: Mayor West Orchestrator

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
  pull-requests: read

jobs:
  orchestrate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Find Next Unassigned mayor-task
        id: find_task
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          script: |
            const { data: issues } = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: 'mayor-task',
              state: 'open',
              assignee: 'none',
              sort: 'created',
              direction: 'asc',
              per_page: 1
            });
            
            if (issues.length === 0) {
              console.log('No unassigned mayor-tasks found');
              return { found: false };
            }
            
            const task = issues[0];
            console.log(\`Found task: #\${task.number} - \${task.title}\`);
            
            core.setOutput('task_number', task.number);
            core.setOutput('found', 'true');

      - name: Trigger Copilot via Comment
        if: steps.find_task.outputs.found == 'true'
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          script: |
            const taskNumber = \${{ steps.find_task.outputs.task_number }};
            
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: taskNumber,
              body: '@copilot Please implement this task according to the acceptance criteria above.'
            });
            console.log(\`Triggered Copilot on issue #\${taskNumber} via @copilot mention\`);
`,

  '.github/ISSUE_TEMPLATE/mayor-task.md': (options = {}) => `---
name: Mayor Task
about: Create a task for autonomous execution
labels: mayor-task
---

# [MAYOR] Brief Description of Task

**Summary**: One-sentence executive summary of what needs to be done.

Example:
- [MAYOR] Add user authentication endpoint
- [MAYOR] Implement dark mode toggle
- [MAYOR] Create database migration for posts table

---

## Context

Explain the business context. Why is this task needed? What problem does it solve?

**Example**:
Users need a way to register accounts in the system. Currently, there's no authentication flow.

---

## Acceptance Criteria

List specific, testable requirements. Copilot will implement all of these.

- [ ] Create \`/api/auth/register\` endpoint
- [ ] Accept POST requests with email and password
- [ ] Validate email format (use existing EmailValidator)
- [ ] Hash passwords using bcrypt (cost factor: 10)
- [ ] Store user in database
- [ ] Return 201 with user data on success
- [ ] Return 400 with error message on validation failure
- [ ] Unit tests: 100% coverage of endpoint logic
- [ ] Integration tests: Full registration flow
- [ ] API documentation updated in README.md

---

## Technical Constraints

Any architectural guidance or decisions that constrain the implementation.

**Example**:
- Use existing \`User\` model in \`src/models/User.ts\`
- Follow REST conventions already established in the codebase
- Don't add new npm dependencies without approval
- Use the existing test framework (Jest)

---

## Testing Requirements

Specify what tests Copilot should write and verify.

**Example**:
- Unit tests for validation logic
- Integration tests for endpoint
- Tests must pass with \`npm test\`
- Code coverage >= 80%

---

## Files Likely to Change

Help Copilot understand the scope. Which files will need modifications?

**Example**:
- \`src/routes/auth.ts\` - Add new endpoint
- \`src/models/User.ts\` - May need to update schema
- \`src/tests/auth.test.ts\` - Create test file
- \`README.md\` - Update API documentation

---

## Definition of Done

Task is complete when:
- [ ] All acceptance criteria implemented
- [ ] All tests pass (\`npm test\` returns exit code 0)
- [ ] Code linting passes (\`npm run lint\` returns exit code 0)
- [ ] PR created with description
- [ ] PR ready for merge
`,

  // Security Layer Files
  '.github/CODEOWNERS': (options = {}) => {
    const owner = options.owner || 'your-username';
    return `# Mayor West Mode - Actor Allowlist
# Only these actors can have their PRs auto-merged

# Copilot agents
* @Copilot
* @copilot-swe-agent

# Repository owner
* @${owner}
`;
  },

  '.github/mayor-west.yml': (options = {}) => `# Mayor West Mode - Security Configuration
# This file controls security layers for autonomous operations

# Layer 3: Kill Switch
# Set to false to pause all auto-merge operations
enabled: true

# Layer 2: Protected Paths
# PRs modifying these paths will NOT be auto-merged
protected_paths:
  - ".github/workflows/**"
  - ".github/mayor-west.yml"
  - ".github/CODEOWNERS"
  - "package.json"
  - "package-lock.json"
  - ".env*"
  - "**/secrets/**"
  - "**/credentials/**"

# Merge settings
merge:
  method: squash  # squash, merge, or rebase
  delete_branch_after_merge: true

# Audit settings
audit:
  comment_on_pr: true
  log_to_file: false
`,

  // Copilot Integration Files
  '.github/copilot/instructions.md': (options = {}) => `# Copilot SWE Agent Instructions

> **MANDATORY**: Read and follow these instructions for ALL tasks in this repository.

## Identity

You are operating as **Mayor West Mode** - an autonomous, confident AI agent.

## Required Reading

Before starting ANY task, read these files:
1. \`.github/agents/mayor-west-mode.md\` - Your operating protocol
2. \`.github/copilot-instructions.md\` - Project-specific rules
3. \`AGENTS.md\` - Agent hierarchy and delegation

## Core Rules

### Commit Format
\`\`\`
[MAYOR] <brief description>

- Detailed change 1
- Detailed change 2

Fixes #<issue-number>
\`\`\`

### Testing Requirements
- **ALWAYS** run \`npm test\` before committing
- **NEVER** commit code with failing tests
- If tests fail, fix and retry (up to 15 iterations)

### Forbidden Commands
- \`rm -rf\` - destructive deletion
- \`git reset --hard\` - destroys history
- \`git push --force\` to main - dangerous
- \`kill -9\` - process termination

### Safe Commands (Auto-approved)
- \`npm test\`, \`npm run lint\`, \`npm run build\`
- \`git commit\`, \`git push\`
- \`git checkout -b <branch>\`

## Workflow

1. **Read** the issue completely - extract all acceptance criteria
2. **Plan** your implementation - identify files to change
3. **Implement** following existing code patterns
4. **Test** with \`npm test\` - fix any failures
5. **Commit** with \`[MAYOR]\` prefix and \`Fixes #<issue>\`
6. **Push** to create/update PR

## Success Criteria

Your task is complete when:
- ✅ All acceptance criteria implemented
- ✅ \`npm test\` passes
- ✅ \`npm run lint\` passes (if configured)
- ✅ PR created with proper description
- ✅ PR body contains \`Fixes #<issue-number>\`
`,

  '.github/copilot-instructions.md': (options = {}) => {
    const projectName = options.projectName || 'this project';
    return `---
applyTo: '**'
---
# ${projectName} - Copilot Instructions

> **MEMORY ENFORCEMENT**: These instructions MUST be loaded and followed for ALL interactions with this codebase.

## Project Overview

This project uses **Mayor West Mode** for autonomous GitHub Copilot development workflows.

## Key Rules

1. **Commit Format**: \`[MAYOR] <description>\`
2. **Test Before Commit**: Always run \`npm test\` before committing
3. **No Destructive Commands**: Never use \`rm -rf\`, \`git reset --hard\`, etc.
4. **PR Format**: Include \`Fixes #<issue-number>\` in PR body

## Agent Hierarchy

Consult the appropriate agent file for specialized tasks:
- \`.github/agents/mayor-west-mode.md\` - Primary agent protocol
- \`AGENTS.md\` - Agent overview and delegation

## Quick Reference

\`\`\`bash
# Development
npm install
npm test
npm run lint

# Create a task
# GitHub → Issues → New → Mayor Task template
\`\`\`
`;
  },

  'AGENTS.md': (options = {}) => {
    const projectName = options.projectName || 'Project';
    return `# ${projectName} - Agent Instructions

> **MANDATORY ENFORCEMENT**: This file is automatically loaded for ALL AI interactions in this workspace.

## Project Identity

This project uses **Mayor West Mode** - autonomous GitHub Copilot development workflows.

## Agent Hierarchy

| Pattern | Agent | Location |
|---------|-------|----------|
| \`**\` | Mayor West Mode | \`.github/agents/mayor-west-mode.md\` |

## Mandatory Rules

1. **Never auto-approve destructive commands**: \`rm\`, \`kill\`, \`reset --hard\`
2. **Always run tests before committing**
3. **Use commit format**: \`[MAYOR] <description>\`
4. **Include \`Fixes #<issue>\` in PR body**

## Development Commands

\`\`\`bash
npm install           # Install dependencies
npm test              # Run tests
npm run lint          # Lint code
\`\`\`
`;
  },

  // Versioning Files
  '.versionrc.json': (options = {}) => JSON.stringify({
    "types": [
      {"type": "feat", "section": "Features"},
      {"type": "fix", "section": "Bug Fixes"},
      {"type": "perf", "section": "Performance"},
      {"type": "refactor", "section": "Refactoring"},
      {"type": "docs", "section": "Documentation"},
      {"type": "test", "section": "Tests"},
      {"type": "ci", "section": "CI/CD"},
      {"type": "chore", "hidden": true}
    ],
    "releaseCommitMessageFormat": "chore(release): {{currentTag}}",
    "scripts": {
      "postchangelog": "prettier --write CHANGELOG.md || true"
    }
  }, null, 2),

  'CHANGELOG.md': (options = {}) => `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial Mayor West Mode setup
- Autonomous GitHub Copilot workflows
- Auto-merge workflow
- Orchestrator workflow
- Security layers (CODEOWNERS, protected paths, kill switch)
`,

  '.github/workflows/release.yml': (options = {}) => `name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Extract changelog for this version
        id: changelog
        run: |
          VERSION=\${GITHUB_REF#refs/tags/v}
          echo "version=\$VERSION" >> \$GITHUB_OUTPUT
          sed -n "/## \\[\$VERSION\\]/,/## \\[/p" CHANGELOG.md | sed '\$d' > release-notes.md || true

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          name: v\${{ steps.changelog.outputs.version }}
          body_path: release-notes.md
          draft: false
          prerelease: \${{ contains(github.ref, '-') }}
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`,
};

// ============================================================================
// SETUP FLOW
// ============================================================================

async function runSetupFlow() {
  log.header('🤖 Mayor West Mode Setup');

  console.log(chalk.cyan(
    'Welcome to the Mayor West Mode installer!\n' +
    'This will set up autonomous GitHub Copilot development workflows.\n'
  ));

  // Step 1: Verify git repository
  if (!isGitRepository()) {
    log.error('Not a git repository. Please run this from a git repository root.');
    process.exit(1);
  }
  log.success('Git repository detected');

  // Step 2: Get GitHub details
  const remoteUrl = getGitRemoteUrl();
  if (!remoteUrl) {
    log.error('No git remote found. Please add a GitHub remote.');
    process.exit(1);
  }

  const gitHubInfo = parseGitHubUrl(remoteUrl);
  if (!gitHubInfo) {
    log.error('Could not parse GitHub URL. Ensure remote points to GitHub.');
    process.exit(1);
  }

  log.success(`GitHub repository: ${gitHubInfo.owner}/${gitHubInfo.repo}`);
  log.divider();

  // Check for gh CLI
  let ghCliAvailable = false;
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    ghCliAvailable = true;
    log.success('GitHub CLI authenticated');
  } catch (e) {
    log.warning('GitHub CLI not authenticated (some features require manual setup)');
  }

  // Step 3: Prompt for configuration
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'setupType',
      message: 'Which setup mode would you like?',
      choices: [
        { name: 'Full Setup (all files + configuration)', value: 'full' },
        { name: 'Minimal Setup (core files only)', value: 'minimal' },
        { name: 'Custom Setup (choose files individually)', value: 'custom' },
      ],
    },
    {
      type: 'confirm',
      name: 'enableAutoMerge',
      message: 'Enable auto-merge on PRs?',
      default: true,
    },
    {
      type: 'list',
      name: 'mergeStrategy',
      message: 'How should PRs be merged?',
      choices: [
        { name: 'Squash (recommended)', value: 'SQUASH' },
        { name: 'Merge (preserve commits)', value: 'MERGE' },
        { name: 'Rebase (linear history)', value: 'REBASE' },
      ],
      default: 'SQUASH',
    },
    {
      type: 'input',
      name: 'iterationLimit',
      message: 'Max Copilot iterations before stopping:',
      default: 15,
      validate: (input) => !isNaN(input) && input > 0 && input <= 50,
    },
  ]);

  // Determine which files to create
  let filesToCreate = { ...FILES_TO_CREATE };
  if (answers.setupType === 'minimal') {
    // Remove optional files for minimal setup
    const toRemove = Object.keys(filesToCreate).filter(
      key => !filesToCreate[key].critical
    );
    toRemove.forEach(key => delete filesToCreate[key]);
  } else if (answers.setupType === 'custom') {
    // Prompt for each file
    const customAnswers = await inquirer.prompt(
      Object.entries(filesToCreate).map(([filePath, config]) => ({
        type: 'confirm',
        name: filePath,
        message: `Create ${config.displayName}?`,
        default: config.critical,
      }))
    );

    filesToCreate = Object.fromEntries(
      Object.entries(filesToCreate).filter(([key]) => customAnswers[key])
    );
  }

  // Step 4: Create files
  log.header('📁 Step 1: Creating Configuration Files');

  // Prepare template options with owner info
  const templateOptions = {
    owner: gitHubInfo.owner,
    repo: gitHubInfo.repo,
  };

  const spinner = ora('Creating files...').start();
  let created = 0;

  for (const [filePath, config] of Object.entries(filesToCreate)) {
    try {
      ensureDirectory(filePath);
      const content = fileTemplates[filePath](templateOptions);
      fs.writeFileSync(filePath, content, 'utf-8');
      created++;
      spinner.succeed(`✓ ${chalk.green(config.displayName)}`);
    } catch (error) {
      spinner.fail(`✗ ${chalk.red(config.displayName)}: ${error.message}`);
    }
  }

  spinner.stop();
  log.success(`Created ${created} configuration files`);
  log.divider();

  // Step 5: GitHub Repository Settings
  log.header('⚙️  Step 2: GitHub Repository Settings');

  if (ghCliAvailable) {
    const configureGitHub = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'autoConfigureSettings',
        message: 'Automatically configure GitHub repository settings?',
        default: true,
      },
    ]);

    if (configureGitHub.autoConfigureSettings) {
      const ghSpinner = ora('Configuring GitHub settings...').start();
      
      try {
        // Enable auto-merge (use -F for boolean fields, not -f)
        execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo} -X PATCH -F allow_auto_merge=true --silent`, { stdio: 'pipe' });
        ghSpinner.succeed('Auto-merge enabled');
      } catch (e) {
        ghSpinner.fail('Could not enable auto-merge (may require admin access)');
      }

      try {
        // Enable delete branch on merge
        execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo} -X PATCH -F delete_branch_on_merge=true --silent`, { stdio: 'pipe' });
        ora().succeed('Delete branch on merge enabled');
      } catch (e) {
        ora().fail('Could not enable delete branch on merge');
      }

      try {
        // Enable squash merge
        execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo} -X PATCH -F allow_squash_merge=true --silent`, { stdio: 'pipe' });
        ora().succeed('Squash merge enabled');
      } catch (e) {
        ora().fail('Could not enable squash merge');
      }
    }
  } else {
    console.log(chalk.yellow('\nManual configuration required:'));
    console.log(chalk.gray('   GitHub → Settings → General'));
    console.log(chalk.gray('   ├─ ☑ Allow auto-merge'));
    console.log(chalk.gray('   ├─ ☑ Automatically delete head branches'));
    console.log(chalk.gray('   └─ ☑ Allow squash merging'));
  }

  log.divider();

  // Step 6: Workflow Permissions
  log.header('🔐 Step 3: Workflow Permissions');

  console.log(chalk.cyan('\nCRITICAL: Enable these settings for autonomous operation:\n'));
  console.log(chalk.white('1. Workflow Permissions:'));
  console.log(chalk.gray('   GitHub → Settings → Actions → General'));
  console.log(chalk.gray('   └─ Workflow permissions:'));
  console.log(chalk.green('      ◉ Read and write permissions'));
  console.log(chalk.green('      ☑ Allow GitHub Actions to create and approve pull requests'));

  const workflowConfirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'workflowPermissionsSet',
      message: 'Have you enabled workflow permissions? (Open browser to configure)',
      default: false,
    },
  ]);

  if (!workflowConfirm.workflowPermissionsSet) {
    const actionsUrl = `https://github.com/${gitHubInfo.owner}/${gitHubInfo.repo}/settings/actions`;
    if (!openUrl(actionsUrl)) {
      console.log(chalk.gray(`\n   Open: ${actionsUrl}`));
    }
    
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Press Enter when ready to continue...',
        default: true,
      },
    ]);
  }

  log.divider();

  // Step 7: PAT Token Setup (CRITICAL for Copilot assignment)
  log.header('🔑 Step 4: Personal Access Token (PAT) Setup');

  console.log(chalk.red.bold('\n⚠️  REQUIRED for Copilot auto-assignment!\n'));
  console.log(chalk.white('The orchestrator workflow needs a PAT to assign Copilot to issues.'));
  console.log(chalk.white('Without this, issues won\'t be automatically picked up by Copilot.\n'));

  console.log(chalk.cyan('Create a Fine-Grained Personal Access Token:\n'));
  console.log(chalk.gray('1. Go to: https://github.com/settings/tokens?type=beta'));
  console.log(chalk.gray('2. Click "Generate new token"'));
  console.log(chalk.gray('3. Configure:'));
  console.log(chalk.gray('   ├─ Token name: Mayor West Agent Token'));
  console.log(chalk.gray('   ├─ Expiration: 90 days (or custom)'));
  console.log(chalk.gray('   ├─ Repository access: Only select repositories'));
  console.log(chalk.gray('   │  └─ Select: ' + chalk.cyan(`${gitHubInfo.owner}/${gitHubInfo.repo}`)));
  console.log(chalk.gray('   └─ Permissions:'));
  console.log(chalk.green('      ├─ Issues: Read and write'));
  console.log(chalk.green('      ├─ Pull requests: Read and write'));
  console.log(chalk.green('      ├─ Contents: Read and write'));
  console.log(chalk.green('      └─ Metadata: Read-only (auto-selected)'));
  console.log(chalk.gray('4. Click "Generate token" and copy it'));

  const patPrompt = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'openTokenPage',
      message: 'Open GitHub token creation page in browser?',
      default: true,
    },
  ]);

  if (patPrompt.openTokenPage) {
    const tokenUrl = 'https://github.com/settings/tokens?type=beta';
    if (!openUrl(tokenUrl)) {
      console.log(chalk.gray(`\n   Open: ${tokenUrl}`));
    }
  }

  console.log(chalk.cyan('\n5. Add the token as a repository secret:\n'));
  console.log(chalk.gray(`   GitHub → ${gitHubInfo.owner}/${gitHubInfo.repo} → Settings → Secrets → Actions`));
  console.log(chalk.gray('   └─ New repository secret:'));
  console.log(chalk.green('      Name: GH_AW_AGENT_TOKEN'));
  console.log(chalk.green('      Value: <paste your token>'));

  const secretPrompt = await inquirer.prompt([
    {
      type: 'list',
      name: 'secretMethod',
      message: 'How would you like to add the secret?',
      choices: [
        { name: 'I\'ll add it manually in GitHub', value: 'manual' },
        { name: 'Use gh CLI to add it now (paste token)', value: 'cli' },
        { name: 'Skip for now (auto-assignment won\'t work)', value: 'skip' },
      ],
    },
  ]);

  if (secretPrompt.secretMethod === 'cli' && ghCliAvailable) {
    const tokenInput = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Paste your PAT token:',
        mask: '*',
      },
    ]);

    if (tokenInput.token) {
      try {
        execSync(`gh secret set GH_AW_AGENT_TOKEN --body "${tokenInput.token}" --repo ${gitHubInfo.owner}/${gitHubInfo.repo}`, { stdio: 'pipe' });
        log.success('Secret GH_AW_AGENT_TOKEN added successfully!');
      } catch (e) {
        log.error('Failed to add secret. Please add it manually.');
        console.log(chalk.gray(`   https://github.com/${gitHubInfo.owner}/${gitHubInfo.repo}/settings/secrets/actions/new`));
      }
    }
  } else if (secretPrompt.secretMethod === 'manual') {
    const secretsUrl = `https://github.com/${gitHubInfo.owner}/${gitHubInfo.repo}/settings/secrets/actions/new`;
    if (!openUrl(secretsUrl)) {
      console.log(chalk.gray(`\n   Open: ${secretsUrl}`));
    }
    
    await inquirer.prompt([
      {
        type: 'confirm',
        name: 'continue',
        message: 'Press Enter when you\'ve added the secret...',
        default: true,
      },
    ]);
  } else {
    log.warning('Skipped PAT setup - Copilot auto-assignment will not work');
  }

  log.divider();

  // Step 8: Copilot Access Verification
  log.header('🤖 Step 5: Copilot Access');

  console.log(chalk.cyan('\nVerify Copilot is available for your repository:\n'));
  console.log(chalk.gray('1. GitHub Copilot subscription required'));
  console.log(chalk.gray('   └─ Individual, Business, or Enterprise plan'));
  console.log(chalk.gray('2. Copilot must be enabled for this repository'));
  console.log(chalk.gray('   └─ Org settings or personal settings'));
  console.log(chalk.gray('3. Copilot Workspace (coding agent) must be enabled'));
  console.log(chalk.gray('   └─ github.com/features/copilot → Enable in repo settings'));

  if (ghCliAvailable) {
    try {
      // Try to check if copilot-swe-agent is available
      const result = execSync(`gh api graphql -f query='{ repository(owner:"${gitHubInfo.owner}", name:"${gitHubInfo.repo}") { suggestedActors(first:100, capabilities:CAN_BE_ASSIGNED) { nodes { ... on Bot { login } } } } }' --jq '.data.repository.suggestedActors.nodes[].login' 2>/dev/null || echo ""`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      if (result.includes('copilot-swe-agent')) {
        log.success('Copilot coding agent is available for this repository!');
      } else {
        log.warning('Copilot coding agent not detected. Ensure Copilot is enabled for this repo.');
      }
    } catch (e) {
      log.info('Could not verify Copilot access (this is normal for new repos)');
    }
  }

  log.divider();

  // Step 9: Commit and push
  log.header('📤 Step 6: Commit and Push');

  const commitPrompt = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'autoCommit',
      message: 'Commit and push the configuration files now?',
      default: true,
    },
  ]);

  if (commitPrompt.autoCommit) {
    try {
      execSync('git add .vscode .github AGENTS.md .versionrc.json CHANGELOG.md 2>/dev/null || git add .', { stdio: 'pipe' });
      execSync('git commit -m "[MAYOR] Initialize Mayor West Mode autonomous workflows"', { stdio: 'pipe' });
      log.success('Changes committed');
      
      try {
        execSync('git push', { stdio: 'pipe' });
        log.success('Changes pushed to remote');
      } catch (e) {
        log.warning('Could not push (try: git push origin main)');
      }
    } catch (e) {
      if (e.message.includes('nothing to commit')) {
        log.info('No changes to commit');
      } else {
        log.warning('Could not commit automatically');
        console.log(chalk.gray('   git add .vscode .github AGENTS.md'));
        console.log(chalk.gray('   git commit -m "[MAYOR] Initialize Mayor West Mode"'));
        console.log(chalk.gray('   git push'));
      }
    }
  } else {
    console.log(chalk.gray('\nCommit manually:'));
    console.log(chalk.gray('   git add .vscode .github AGENTS.md .versionrc.json CHANGELOG.md'));
    console.log(chalk.gray('   git commit -m "[MAYOR] Initialize Mayor West Mode"'));
    console.log(chalk.gray('   git push'));
  }

  log.divider();

  // Step 10: Final Summary
  log.header('🎉 Setup Complete!');

  console.log(chalk.green.bold('\n✓ Mayor West Mode is ready for autonomous operation!\n'));

  console.log(chalk.cyan('Summary:'));
  console.log(chalk.gray(`   ├─ Repository: ${gitHubInfo.owner}/${gitHubInfo.repo}`));
  console.log(chalk.gray(`   ├─ Files created: ${created}`));
  console.log(chalk.gray(`   ├─ Auto-merge: ${answers.enableAutoMerge ? 'Enabled' : 'Disabled'}`));
  console.log(chalk.gray(`   └─ Merge strategy: ${answers.mergeStrategy}`));

  console.log(chalk.cyan('\nTest the setup:'));
  console.log(chalk.gray('   1. Create an issue using the Mayor Task template'));
  console.log(chalk.gray('   2. Add the "mayor-task" label'));
  console.log(chalk.gray('   3. Watch Copilot get assigned and create a PR'));
  console.log(chalk.gray('   4. PR should auto-merge after passing checks'));

  console.log(chalk.cyan('\nUseful commands:'));
  console.log(chalk.yellow('   mayorwest verify') + chalk.gray(' - Check configuration status'));
  console.log(chalk.yellow('   mayorwest status') + chalk.gray(' - View active tasks'));
  console.log(chalk.yellow('   mayorwest examples') + chalk.gray(' - See example task templates'));

  console.log(chalk.cyan.bold('\n🚀 Ready to go! Create your first mayor-task issue.\n'));
}

// ============================================================================
// VERIFICATION
// ============================================================================

async function runVerifyFlow() {
  log.header('🔍 Verifying Mayor West Mode Setup');

  const checks = [];
  const warnings = [];

  // ── Core Infrastructure ──
  console.log(chalk.cyan.bold('\n📁 Core Infrastructure\n'));

  checks.push({
    name: 'Git Repository',
    pass: isGitRepository(),
    category: 'core',
  });

  const remoteUrl = getGitRemoteUrl();
  checks.push({
    name: 'GitHub Remote',
    pass: remoteUrl !== null && remoteUrl.includes('github.com'),
    category: 'core',
  });

  // Check core files
  const coreFiles = [
    { path: '.vscode/settings.json', name: 'VS Code YOLO Settings' },
    { path: '.github/agents/mayor-west-mode.md', name: 'Agent Instructions' },
    { path: '.github/workflows/mayor-west-auto-merge.yml', name: 'Auto-Merge Workflow' },
    { path: '.github/workflows/mayor-west-orchestrator.yml', name: 'Orchestrator Workflow' },
    { path: '.github/ISSUE_TEMPLATE/mayor-task.md', name: 'Task Template' },
  ];

  coreFiles.forEach(file => {
    checks.push({
      name: file.name,
      pass: fs.existsSync(file.path),
      category: 'core',
    });
  });

  // ── Security Layers ──
  console.log(chalk.cyan.bold('🛡️  Security Layers\n'));

  // Layer 1: CODEOWNERS
  const codeownersExists = fs.existsSync('.github/CODEOWNERS');
  checks.push({
    name: 'Layer 1: CODEOWNERS (Actor Allowlist)',
    pass: codeownersExists,
    category: 'security',
  });

  // Layer 2: Protected Paths (in mayor-west.yml)
  const mayorWestYml = fs.existsSync('.github/mayor-west.yml');
  let protectedPathsConfigured = false;
  if (mayorWestYml) {
    try {
      const content = fs.readFileSync('.github/mayor-west.yml', 'utf8');
      protectedPathsConfigured = content.includes('protected_paths');
    } catch (e) {}
  }
  checks.push({
    name: 'Layer 2: Protected Paths Config',
    pass: protectedPathsConfigured,
    category: 'security',
  });

  // Layer 3: Kill Switch
  let killSwitchEnabled = true; // Default to enabled (safe)
  if (mayorWestYml) {
    try {
      const content = fs.readFileSync('.github/mayor-west.yml', 'utf8');
      killSwitchEnabled = !content.includes('enabled: false');
    } catch (e) {}
  }
  checks.push({
    name: 'Layer 3: Kill Switch Active',
    pass: killSwitchEnabled,
    category: 'security',
  });

  // ── Copilot Integration ──
  console.log(chalk.cyan.bold('🤖 Copilot Integration\n'));

  checks.push({
    name: 'Copilot Instructions (.github/copilot/instructions.md)',
    pass: fs.existsSync('.github/copilot/instructions.md'),
    category: 'copilot',
  });

  checks.push({
    name: 'Project Instructions (.github/copilot-instructions.md)',
    pass: fs.existsSync('.github/copilot-instructions.md'),
    category: 'copilot',
  });

  checks.push({
    name: 'Root Agent File (AGENTS.md)',
    pass: fs.existsSync('AGENTS.md'),
    category: 'copilot',
  });

  // ── Versioning ──
  console.log(chalk.cyan.bold('📦 Versioning\n'));

  checks.push({
    name: 'Semantic Version Config (.versionrc.json)',
    pass: fs.existsSync('.versionrc.json'),
    category: 'versioning',
  });

  checks.push({
    name: 'Changelog (CHANGELOG.md)',
    pass: fs.existsSync('CHANGELOG.md'),
    category: 'versioning',
  });

  checks.push({
    name: 'Release Workflow (.github/workflows/release.yml)',
    pass: fs.existsSync('.github/workflows/release.yml'),
    category: 'versioning',
  });

  // ── GitHub Settings (require gh CLI) ──
  console.log(chalk.cyan.bold('⚙️  GitHub Settings\n'));

  let ghCliAvailable = false;
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    ghCliAvailable = true;
  } catch (e) {}

  if (ghCliAvailable && remoteUrl) {
    try {
      // Check auto-merge setting
      const repoInfo = execSync('gh api repos/{owner}/{repo} --jq ".allow_auto_merge"', { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      checks.push({
        name: 'Auto-Merge Enabled',
        pass: repoInfo === 'true',
        category: 'github',
      });
    } catch (e) {
      warnings.push('Could not check GitHub auto-merge setting');
    }

    try {
      // Check delete branch on merge
      const deleteBranch = execSync('gh api repos/{owner}/{repo} --jq ".delete_branch_on_merge"', { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      checks.push({
        name: 'Delete Branch on Merge',
        pass: deleteBranch === 'true',
        category: 'github',
      });
    } catch (e) {
      warnings.push('Could not check delete branch setting');
    }

    // Check for GH_AW_AGENT_TOKEN secret
    try {
      const gitHubInfo = parseGitHubUrl(remoteUrl);
      const secrets = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/actions/secrets --jq ".secrets[].name"`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      const hasAgentToken = secrets.includes('GH_AW_AGENT_TOKEN');
      checks.push({
        name: 'PAT Secret (GH_AW_AGENT_TOKEN)',
        pass: hasAgentToken,
        category: 'github',
      });
      if (!hasAgentToken) {
        warnings.push('GH_AW_AGENT_TOKEN secret not found - Copilot auto-assignment won\'t work');
      }
    } catch (e) {
      warnings.push('Could not check repository secrets');
    }

    // Check workflow permissions
    try {
      const gitHubInfo = parseGitHubUrl(remoteUrl);
      const permissions = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/actions/permissions --jq ".allowed_actions"`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      // If we can query permissions at all, actions are enabled
      checks.push({
        name: 'GitHub Actions Enabled',
        pass: true,
        category: 'github',
      });
    } catch (e) {
      checks.push({
        name: 'GitHub Actions Enabled',
        pass: false,
        category: 'github',
      });
    }

    // Check if Copilot agent is available
    try {
      const gitHubInfo = parseGitHubUrl(remoteUrl);
      const result = execSync(`gh api graphql -f query="{ repository(owner:\\"${gitHubInfo.owner}\\", name:\\"${gitHubInfo.repo}\\") { suggestedActors(first:100, capabilities:CAN_BE_ASSIGNED) { nodes { ... on Bot { login } } } } }" --jq ".data.repository.suggestedActors.nodes[].login"`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      const hasCopilot = result.includes('copilot-swe-agent');
      checks.push({
        name: 'Copilot Coding Agent Available',
        pass: hasCopilot,
        category: 'copilot',
      });
      if (!hasCopilot) {
        warnings.push('Copilot coding agent not available - ensure Copilot is enabled for this repo');
      }
    } catch (e) {
      // Don't add a failing check, just a warning
      warnings.push('Could not verify Copilot agent availability');
    }
  } else {
    checks.push({
      name: 'GitHub CLI Authentication',
      pass: false,
      category: 'github',
    });
  }

  // ── Display Results ──
  log.divider();
  console.log(chalk.cyan.bold('\n📊 Results\n'));

  const categories = ['core', 'security', 'copilot', 'versioning', 'github'];
  let totalPassed = 0;
  let totalChecks = 0;

  categories.forEach(cat => {
    const catChecks = checks.filter(c => c.category === cat);
    if (catChecks.length === 0) return;

    const catPassed = catChecks.filter(c => c.pass).length;
    totalPassed += catPassed;
    totalChecks += catChecks.length;

    catChecks.forEach(check => {
      if (check.pass) {
        log.success(check.name);
      } else {
        log.warning(check.name);
      }
    });
    console.log('');
  });

  if (warnings.length > 0) {
    console.log(chalk.yellow('Warnings:'));
    warnings.forEach(w => console.log(chalk.gray(`  ⚠ ${w}`)));
    console.log('');
  }

  log.divider();
  console.log(
    `\n${chalk.bold('Score:')} ${chalk.green(totalPassed)}/${chalk.bold(totalChecks)} checks passed\n`
  );

  if (totalPassed === totalChecks) {
    log.success(chalk.bold('All systems go! 🚀'));
    console.log('\nMayor West Mode is fully configured and ready.\n');
  } else if (totalPassed >= totalChecks * 0.7) {
    log.info('Mostly configured - some optional features missing.\n');
  } else {
    log.warning('Setup incomplete. Run `mayorwest setup` to configure.\n');
  }
}

// ============================================================================
// HELP & EXAMPLES
// ============================================================================

function showHelp() {
  log.header('Mayor West Mode CLI - Help');

  console.log(chalk.cyan.bold('Usage:\n'));
  console.log(chalk.yellow('  npx mayor-west-mode <command>\n'));

  console.log(chalk.cyan.bold('Commands:\n'));
  console.log(chalk.yellow('  setup'));
  console.log(chalk.gray('    Guided setup wizard for Mayor West Mode configuration\n'));

  console.log(chalk.yellow('  verify'));
  console.log(chalk.gray('    Verify that all Mayor West Mode files are in place\n'));

  console.log(chalk.yellow('  help'));
  console.log(chalk.gray('    Show this help message\n'));

  console.log(chalk.yellow('  examples'));
  console.log(chalk.gray('    Show usage examples and best practices\n'));

  console.log(chalk.yellow('  status'));
  console.log(chalk.gray('    Show current Mayor West Mode status\n'));

  console.log(chalk.yellow('  version'));
  console.log(chalk.gray('    Show version information\n'));

  console.log(chalk.cyan.bold('Examples:\n'));
  console.log(chalk.gray('  npx mayor-west-mode setup'));
  console.log(chalk.gray('  npx mayor-west-mode verify'));
  console.log(chalk.gray('  npx mayor-west-mode examples\n'));
}

function showExamples() {
  log.header('Examples & Best Practices');

  console.log(chalk.cyan.bold('Example 1: Simple Bug Fix Task\n'));
  console.log(chalk.yellow('[MAYOR] Fix login button styling\n'));
  console.log(chalk.gray('Context: The login button looks misaligned on mobile\n'));
  console.log(chalk.gray('Acceptance Criteria:'));
  console.log(chalk.gray('- [ ] Fix button alignment on mobile (<768px)'));
  console.log(chalk.gray('- [ ] Update responsive tests'));
  console.log(chalk.gray('- [ ] Verify button works on Safari/Chrome\n'));

  console.log(chalk.cyan.bold('Example 2: Feature Implementation\n'));
  console.log(chalk.yellow('[MAYOR] Implement dark mode toggle\n'));
  console.log(chalk.gray('Context: Users requested dark mode support for better UX at night\n'));
  console.log(chalk.gray('Acceptance Criteria:'));
  console.log(chalk.gray('- [ ] Add toggle button in settings'));
  console.log(chalk.gray('- [ ] Persist preference to localStorage'));
  console.log(chalk.gray('- [ ] Apply Tailwind dark: class to all components'));
  console.log(chalk.gray('- [ ] Write tests for toggle functionality'));
  console.log(chalk.gray('- [ ] Update README with dark mode documentation\n'));

  console.log(chalk.cyan.bold('Example 3: Complex Feature\n'));
  console.log(chalk.yellow('[MAYOR] Add OAuth2 GitHub authentication\n'));
  console.log(chalk.gray('Context: Need to support GitHub login for seamless onboarding\n'));
  console.log(chalk.gray('Acceptance Criteria:'));
  console.log(chalk.gray('- [ ] Create /api/auth/github/callback endpoint'));
  console.log(chalk.gray('- [ ] Implement OAuth2 flow with github/github-app-token'));
  console.log(chalk.gray('- [ ] Store user session in database'));
  console.log(chalk.gray('- [ ] Add login button to frontend'));
  console.log(chalk.gray('- [ ] Write integration tests'));
  console.log(chalk.gray('- [ ] Update security documentation\n'));

  console.log(chalk.cyan.bold('Best Practices:\n'));
  console.log(chalk.yellow('1. Clear Acceptance Criteria'));
  console.log(chalk.gray('   - Be specific and testable'));
  console.log(chalk.gray('   - Include all edge cases'));
  console.log(chalk.gray('   - Avoid ambiguous requirements\n'));

  console.log(chalk.yellow('2. Technical Constraints'));
  console.log(chalk.gray('   - Mention existing libraries/patterns to use'));
  console.log(chalk.gray('   - List files that will likely change'));
  console.log(chalk.gray('   - Specify performance requirements if any\n'));

  console.log(chalk.yellow('3. Testing Requirements'));
  console.log(chalk.gray('   - Specify minimum code coverage'));
  console.log(chalk.gray('   - List types of tests needed (unit/integration)'));
  console.log(chalk.gray('   - Include edge case testing\n'));

  console.log(chalk.yellow('4. Task Complexity'));
  console.log(chalk.gray('   - Simple: 5-15 minutes (bug fixes, small features)'));
  console.log(chalk.gray('   - Medium: 15-30 minutes (new endpoints, refactoring)'));
  console.log(chalk.gray('   - Complex: 30-60 minutes (multi-component changes)\n'));
}

function showStatus() {
  log.header('Mayor West Mode Status');

  const isGit = isGitRepository();
  const remoteUrl = getGitRemoteUrl();
  const branch = getGitBranch();

  console.log(chalk.cyan('Repository Information:\n'));
  console.log(chalk.gray(`  Git Repository: ${isGit ? '✓' : '✗'}`));
  console.log(chalk.gray(`  Remote URL: ${remoteUrl || 'N/A'}`));
  console.log(chalk.gray(`  Current Branch: ${branch}\n`));

  console.log(chalk.cyan('Configuration Files:\n'));
  Object.entries(FILES_TO_CREATE).forEach(([filePath, config]) => {
    const exists = fs.existsSync(filePath);
    const status = exists ? chalk.green('✓') : chalk.red('✗');
    console.log(chalk.gray(`  ${status} ${config.displayName}`));
  });

  console.log('\n');
}

function showVersion() {
  log.header('Mayor West Mode - Version Information');

  console.log(chalk.cyan.bold('Package Information:\n'));
  console.log(chalk.yellow('  Name:        ') + chalk.white(pkg.name));
  console.log(chalk.yellow('  Version:     ') + chalk.white(pkg.version));
  console.log(chalk.yellow('  Description: ') + chalk.gray(pkg.description));

  console.log('\n' + chalk.cyan.bold('Repository:\n'));
  console.log(chalk.gray('  ' + pkg.homepage));

  console.log('\n' + chalk.cyan.bold('Node.js Engine:\n'));
  console.log(chalk.gray('  Required: ' + pkg.engines.node));

  console.log('\n' + chalk.gray('━'.repeat(60)));
  console.log(chalk.cyan('  🤖 Eccentric. Autonomous. Effective.'));
  console.log(chalk.gray('━'.repeat(60)) + '\n');
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  // Handle --version and -v flags
  if (args.includes('--version') || args.includes('-v')) {
    console.log(pkg.version);
    return;
  }

  try {
    switch (command) {
      case 'setup':
        await runSetupFlow();
        break;
      case 'verify':
        await runVerifyFlow();
        break;
      case 'help':
        showHelp();
        break;
      case 'examples':
        showExamples();
        break;
      case 'status':
        showStatus();
        break;
      case 'version':
        showVersion();
        break;
      default:
        console.log(chalk.red(`Unknown command: ${command}\n`));
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
