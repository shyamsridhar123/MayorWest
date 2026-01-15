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

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const MAYOR_WEST_CONFIG = {
  version: '1.0.0',
  name: 'Mayor West Mode',
  description: 'Autonomous GitHub Copilot development workflow',
};

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
  '.github/workflows/mayor-west-audit.yml': {
    displayName: 'Autonomous Audit Workflow',
    category: 'workflow',
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

// ============================================================================
// FILE TEMPLATES
// ============================================================================

const fileTemplates = {
  '.vscode/settings.json': () => JSON.stringify({
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

  '.github/agents/mayor-west-mode.md': () => `# Mayor West Mode - Copilot Agent Protocol

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

  '.github/workflows/mayor-west-auto-merge.yml': () => `name: Mayor West Auto-Merge

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

  '.github/workflows/mayor-west-orchestrator.yml': () => `name: Mayor West Orchestrator

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

  '.github/ISSUE_TEMPLATE/mayor-task.md': () => `---
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

  '.github/workflows/mayor-west-audit.yml': () => `name: Mayor West Autonomous Audit

on:
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday at midnight UTC

permissions:
  contents: read
  issues: write

jobs:
  audit:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install Mayor West Mode
        run: npm install -g mayor-west-mode

      - name: Run Autonomous Audit
        id: audit
        run: |
          echo "Running autonomous repository health audit..."
          mkdir -p audit-results
          npx mayor-west-mode audit --output audit-results/ || true
          echo "Audit complete"

      - name: Check for Audit Findings
        id: check_findings
        run: |
          if [ -d ".mayor-west-audit" ] && [ "$(ls -A .mayor-west-audit)" ]; then
            echo "findings=true" >> \$GITHUB_OUTPUT
            echo "Found audit issues"
          else
            echo "findings=false" >> \$GITHUB_OUTPUT
            echo "No audit issues found"
          fi

      - name: Create GitHub Issues from Audit Findings
        if: steps.check_findings.outputs.findings == 'true'
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const path = require('path');
            
            const auditDir = '.mayor-west-audit';
            if (!fs.existsSync(auditDir)) {
              console.log('No audit directory found');
              return;
            }
            
            const files = fs.readdirSync(auditDir);
            console.log(\`Found \${files.length} audit findings\`);
            
            for (const file of files) {
              const filePath = path.join(auditDir, file);
              const content = fs.readFileSync(filePath, 'utf-8');
              
              // Extract title from first line (## Audit Finding: category)
              const titleMatch = content.match(/## Audit Finding: (.+)/);
              const category = titleMatch ? titleMatch[1] : 'unknown';
              
              // Extract description
              const descMatch = content.match(/\\*\\*Description\\*\\*:\\n(.+?)\\n\\n/s);
              const description = descMatch ? descMatch[1].trim() : '';
              
              const issueTitle = \`[MAYOR] Audit: \${category} - \${description.substring(0, 50)}...\`;
              
              try {
                const issue = await github.rest.issues.create({
                  owner: context.repo.owner,
                  repo: context.repo.repo,
                  title: issueTitle,
                  body: content,
                  labels: ['mayor-task', 'audit', 'automated']
                });
                
                console.log(\`✅ Created issue #\${issue.data.number}: \${issueTitle}\`);
              } catch (error) {
                console.log(\`❌ Failed to create issue: \${error.message}\`);
              }
            }

      - name: Cleanup Audit Files
        if: always()
        run: |
          rm -rf .mayor-west-audit
          echo "Cleaned up audit artifacts"

      - name: Summary
        if: always()
        run: |
          echo "=== Autonomous Audit Complete ==="
          if [ "\${{ steps.check_findings.outputs.findings }}" == "true" ]; then
            echo "✅ Issues created from audit findings"
            echo "Next: Run Mayor West Orchestrator to assign tasks to Copilot"
          else
            echo "✅ No issues found - repository is healthy!"
          fi
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
  log.header('Creating Configuration Files');

  const spinner = ora('Creating files...').start();
  let created = 0;

  for (const [filePath, config] of Object.entries(filesToCreate)) {
    try {
      ensureDirectory(filePath);
      const content = fileTemplates[filePath]();
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

  // Step 5: Next steps
  log.header('🎉 Setup Complete!');

  console.log(chalk.cyan.bold('Next Steps:\n'));
  console.log('1. Review the generated files:');
  Object.keys(filesToCreate).forEach(file => {
    console.log(chalk.gray(`   ${file}`));
  });

  console.log('\n2. Configure GitHub repository settings:');
  console.log(chalk.cyan('   a) Enable auto-merge:'));
  console.log(chalk.gray('      GitHub → Settings → Pull Requests → Allow auto-merge'));
  console.log(chalk.cyan('   b) Enable branch protection:'));
  console.log(chalk.gray('      GitHub → Settings → Branches → Add Rule'));
  console.log(chalk.gray('      ├─ Branch: main'));
  console.log(chalk.gray('      ├─ ☑ Require status checks'));
  console.log(chalk.gray('      └─ ☑ Require PR reviews'));

  console.log('\n3. Commit and push:');
  console.log(chalk.gray('   git add .vscode .github'));
  console.log(chalk.gray('   git commit -m "Mayor West Mode: Add autonomous workflows"'));
  console.log(chalk.gray('   git push origin main'));

  console.log('\n4. Test the setup:');
  console.log(chalk.gray('   GitHub → Actions → Mayor West Orchestrator → Run workflow'));

  console.log('\n5. Create your first task:');
  console.log(chalk.gray('   GitHub → Issues → New → Mayor Task template'));

  console.log(chalk.cyan.bold('\n\nReady? Run: ') + chalk.yellow('npx mayor-west-mode verify'));
}

// ============================================================================
// VERIFICATION
// ============================================================================

async function runVerifyFlow() {
  log.header('🔍 Verifying Setup');

  const checks = [];

  // Check git
  checks.push({
    name: 'Git Repository',
    pass: isGitRepository(),
  });

  // Check files
  const fileChecks = Object.entries(FILES_TO_CREATE).map(([filePath, config]) => ({
    name: config.displayName,
    pass: fs.existsSync(filePath),
  }));
  checks.push(...fileChecks);

  // Check GitHub connection
  const remoteUrl = getGitRemoteUrl();
  checks.push({
    name: 'GitHub Remote',
    pass: remoteUrl !== null && remoteUrl.includes('github.com'),
  });

  // Display results
  let passed = 0;
  checks.forEach(check => {
    if (check.pass) {
      log.success(check.name);
      passed++;
    } else {
      log.warning(check.name);
    }
  });

  log.divider();

  const total = checks.length;
  console.log(
    `\nResult: ${chalk.bold(passed)}/${chalk.bold(total)} checks passed\n`
  );

  if (passed === total) {
    log.success(chalk.bold('All systems go! 🚀'));
    console.log('\nYour Mayor West Mode setup is complete and ready to use.\n');
    console.log('Next: Create a task and trigger the orchestrator workflow.\n');
  } else {
    log.warning('Some checks failed. Run setup again to fix issues.\n');
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

  console.log(chalk.yellow('  audit'));
  console.log(chalk.gray('    Run autonomous repository health audit and generate improvement tasks\n'));

  console.log(chalk.cyan.bold('Examples:\n'));
  console.log(chalk.gray('  npx mayor-west-mode setup'));
  console.log(chalk.gray('  npx mayor-west-mode verify'));
  console.log(chalk.gray('  npx mayor-west-mode audit\n'));
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

// ============================================================================
// AUDIT FLOW - AUTONOMOUS REPOSITORY HEALTH CHECK
// ============================================================================

async function runAuditFlow() {
  log.header('🔍 Repository Health Audit');

  console.log(chalk.cyan(
    'Scanning repository for quality improvements and technical debt...\n'
  ));

  // Verify git repository
  if (!isGitRepository()) {
    log.error('Not a git repository. Please run this from a git repository root.');
    process.exit(1);
  }

  const spinner = ora('Running audit checks...').start();
  const findings = [];

  // Audit Check 1: Missing or outdated documentation
  spinner.text = 'Checking documentation...';
  if (!fs.existsSync('README.md')) {
    findings.push({
      severity: 'high',
      category: 'documentation',
      title: 'Missing README.md',
      description: 'Repository lacks a README.md file for project documentation',
      acceptance: [
        'Create README.md with project overview',
        'Add installation instructions',
        'Add usage examples',
        'Add contributing guidelines'
      ]
    });
  }

  // Audit Check 2: Missing package.json scripts
  spinner.text = 'Checking package.json configuration...';
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    // Only check for test and lint - build is optional for CLI tools
    const requiredScripts = ['test', 'lint'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts || !packageJson.scripts[script]);
    
    if (missingScripts.length > 0) {
      findings.push({
        severity: 'medium',
        category: 'build-tooling',
        title: 'Missing package.json scripts',
        description: `Package.json lacks standard scripts: ${missingScripts.join(', ')}`,
        acceptance: missingScripts.map(script => `Add "${script}" script to package.json`)
      });
    }
  }

  // Audit Check 3: Missing .gitignore
  spinner.text = 'Checking .gitignore...';
  if (!fs.existsSync('.gitignore')) {
    findings.push({
      severity: 'medium',
      category: 'configuration',
      title: 'Missing .gitignore file',
      description: 'Repository lacks a .gitignore file to exclude build artifacts and dependencies',
      acceptance: [
        'Create .gitignore file',
        'Add node_modules/ to .gitignore',
        'Add common build directories (dist/, build/)',
        'Add OS-specific files (.DS_Store, Thumbs.db)'
      ]
    });
  }

  // Audit Check 4: Missing LICENSE file
  spinner.text = 'Checking license...';
  if (!fs.existsSync('LICENSE') && !fs.existsSync('LICENSE.md')) {
    findings.push({
      severity: 'low',
      category: 'legal',
      title: 'Missing LICENSE file',
      description: 'Repository lacks a license file, which clarifies usage rights',
      acceptance: [
        'Add LICENSE file with appropriate open source license (MIT, Apache 2.0, etc.)',
        'Update package.json with license field'
      ]
    });
  }

  // Audit Check 5: Missing tests directory
  spinner.text = 'Checking test coverage...';
  const testDirs = ['test', 'tests', '__tests__', 'spec'];
  const hasTestDir = testDirs.some(dir => fs.existsSync(dir));
  const hasTestFiles = fs.existsSync('.') && 
    fs.readdirSync('.').some(file => file.endsWith('.test.js') || file.endsWith('.spec.js'));
  
  if (!hasTestDir && !hasTestFiles) {
    findings.push({
      severity: 'high',
      category: 'testing',
      title: 'Missing test infrastructure',
      description: 'Repository lacks test files or test directory structure',
      acceptance: [
        'Create test directory structure',
        'Add testing framework (Jest, Mocha, etc.)',
        'Write initial unit tests for core functionality',
        'Configure test script in package.json'
      ]
    });
  }

  // Audit Check 6: Outdated dependencies (basic check)
  spinner.text = 'Checking dependencies...';
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    if (!packageJson.dependencies && !packageJson.devDependencies) {
      findings.push({
        severity: 'low',
        category: 'dependencies',
        title: 'No dependencies defined',
        description: 'Package.json has no dependencies or devDependencies listed',
        acceptance: [
          'Review if any dependencies should be added',
          'Document why there are no dependencies if intentional'
        ]
      });
    }
  }

  spinner.stop();

  // Display audit results
  log.divider();
  
  if (findings.length === 0) {
    log.success(chalk.bold('No issues found! Repository is healthy. 🎉\n'));
    return;
  }

  console.log(chalk.yellow.bold(`Found ${findings.length} improvement${findings.length > 1 ? 's' : ''}:\n`));
  
  findings.forEach((finding, index) => {
    const severityColor = {
      high: chalk.red,
      medium: chalk.yellow,
      low: chalk.gray
    }[finding.severity];
    
    console.log(severityColor(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.title}`));
    console.log(chalk.gray(`   Category: ${finding.category}`));
    console.log(chalk.gray(`   ${finding.description}\n`));
  });

  log.divider();

  // Prompt user to create issues
  const { createIssues } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'createIssues',
      message: 'Create mayor-task GitHub issues for these findings?',
      default: true
    }
  ]);

  if (!createIssues) {
    log.info('Audit complete. No issues created.');
    return;
  }

  // Display issue creation plan
  console.log(chalk.cyan('\nIssue creation plan:'));
  findings.forEach((finding, index) => {
    console.log(chalk.gray(`  ${index + 1}. [MAYOR] ${finding.title}`));
  });

  const { confirmCreate } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmCreate',
      message: '\nProceed with creating these issues on GitHub?',
      default: false
    }
  ]);

  if (!confirmCreate) {
    log.info('Issue creation cancelled.');
    return;
  }

  // Generate issue bodies
  console.log(chalk.cyan('\n📝 Generating issue templates...\n'));
  
  findings.forEach((finding, index) => {
    const issueBody = `## Audit Finding: ${finding.category}

**Priority**: ${finding.severity.toUpperCase()}

**Description**:
${finding.description}

## Acceptance Criteria

${finding.acceptance.map(criterion => `- [ ] ${criterion}`).join('\n')}

## Technical Notes

This issue was automatically generated by the Mayor West Mode audit system.

**Category**: ${finding.category}
**Severity**: ${finding.severity}

## Definition of Done

Task is complete when:
- [ ] All acceptance criteria are met
- [ ] Changes are tested
- [ ] Code passes linting
- [ ] PR is merged

---
*Generated by: mayor-west-mode audit @ ${new Date().toISOString()}*`;

    const fileName = `mayor-task-audit-${Date.now()}-${index + 1}.md`;
    const filePath = path.join('.mayor-west-audit', fileName);
    
    ensureDirectory(filePath);
    fs.writeFileSync(filePath, issueBody, 'utf-8');
    
    log.success(`Created: ${fileName}`);
  });

  log.divider();
  console.log(chalk.cyan.bold('\n✅ Audit Complete!\n'));
  console.log(chalk.gray('Issue templates created in: .mayor-west-audit/\n'));
  console.log(chalk.yellow('Next steps:'));
  console.log(chalk.gray('1. Review the generated issue templates'));
  console.log(chalk.gray('2. Create issues manually from these templates, or'));
  console.log(chalk.gray('3. Use GitHub CLI: gh issue create --title "[MAYOR] ..." --body-file <file>'));
  console.log(chalk.gray('4. Run the orchestrator to have Copilot fix them autonomously\n'));
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

async function main() {
  const command = process.argv[2] || 'help';

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
      case 'audit':
        await runAuditFlow();
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
