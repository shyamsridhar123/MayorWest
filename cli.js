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

function isGHCLIAvailable() {
  try {
    execSync('gh --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function isGHCLIAuthenticated() {
  try {
    execSync('gh auth status', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function checkAutoMergeEnabled(owner, repo) {
  try {
    const result = execSync(`gh api repos/${owner}/${repo} --jq .allow_auto_merge`, { encoding: 'utf-8' }).trim();
    return result === 'true';
  } catch (e) {
    return false;
  }
}

function checkWorkflowPermissions(owner, repo) {
  try {
    const result = execSync(`gh api repos/${owner}/${repo}/actions/permissions/workflow --jq .default_workflow_permissions`, { encoding: 'utf-8' }).trim();
    return result === 'write';
  } catch (e) {
    return false;
  }
}

function checkBranchProtection(owner, repo, branch = 'main') {
  try {
    execSync(`gh api repos/${owner}/${repo}/branches/${branch}/protection`, { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

function checkSecretExists(owner, repo, secretName) {
  try {
    const result = execSync(`gh api repos/${owner}/${repo}/actions/secrets`, { encoding: 'utf-8' });
    const secrets = JSON.parse(result);
    return secrets.secrets.some(s => s.name === secretName);
  } catch (e) {
    return false;
  }
}

function checkCopilotAgentAvailable(owner, repo) {
  try {
    const query = `query {
      repository(owner: "${owner}", name: "${repo}") {
        suggestedActors(first: 100, capabilities: CAN_BE_ASSIGNED) {
          nodes {
            ... on Bot {
              login
            }
          }
        }
      }
    }`;
    const result = execSync(`gh api graphql -f query='${query}'`, { encoding: 'utf-8' });
    const data = JSON.parse(result);
    const actors = data.data.repository.suggestedActors.nodes;
    return actors.some(actor => actor.login === 'copilot-swe-agent');
  } catch (e) {
    return false;
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
            console.log(\\\`Found task: #\\\${task.number} - \\\${task.title}\\\`);
            
            core.setOutput('task_number', task.number);
            core.setOutput('found', 'true');

      - name: Assign Copilot to Issue
        if: steps.find_task.outputs.found == 'true'
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.GH_AW_AGENT_TOKEN || secrets.GITHUB_TOKEN }}
          script: |
            const taskNumber = \${{ steps.find_task.outputs.task_number }};
            const owner = context.repo.owner;
            const repo = context.repo.repo;
            
            // Step 1: Find Copilot agent ID using suggestedActors query
            console.log('Looking for copilot coding agent...');
            const findAgentQuery = \\\`
              query($owner: String!, $repo: String!) {
                repository(owner: $owner, name: $repo) {
                  suggestedActors(first: 100, capabilities: CAN_BE_ASSIGNED) {
                    nodes {
                      ... on Bot {
                        id
                        login
                        __typename
                      }
                    }
                  }
                }
              }
            \\\`;
            
            const agentResponse = await github.graphql(findAgentQuery, { owner, repo });
            const actors = agentResponse.repository.suggestedActors.nodes;
            const copilotAgent = actors.find(actor => actor.login === 'copilot-swe-agent');
            
            if (!copilotAgent) {
              console.log('Available actors:', actors.map(a => a.login).join(', '));
              throw new Error('Copilot coding agent (copilot-swe-agent) is not available for this repository');
            }
            
            console.log(\\\`Found copilot agent with ID: \\\${copilotAgent.id}\\\`);
            
            // Step 2: Get issue ID and current assignees
            const issueQuery = \\\`
              query($owner: String!, $repo: String!, $issueNumber: Int!) {
                repository(owner: $owner, name: $repo) {
                  issue(number: $issueNumber) {
                    id
                    assignees(first: 100) {
                      nodes { id }
                    }
                  }
                }
              }
            \\\`;
            
            const issueResponse = await github.graphql(issueQuery, { 
              owner, 
              repo, 
              issueNumber: taskNumber 
            });
            
            const issueId = issueResponse.repository.issue.id;
            const currentAssignees = issueResponse.repository.issue.assignees.nodes.map(a => a.id);
            
            // Step 3: Assign Copilot using replaceActorsForAssignable mutation
            const assignMutation = \\\`
              mutation($assignableId: ID!, $actorIds: [ID!]!) {
                replaceActorsForAssignable(input: {
                  assignableId: $assignableId,
                  actorIds: $actorIds
                }) {
                  assignable {
                    ... on Issue {
                      id
                      number
                      assignees(first: 10) {
                        nodes { login }
                      }
                    }
                  }
                }
              }
            \\\`;
            
            const newAssignees = [...currentAssignees, copilotAgent.id];
            const assignResponse = await github.graphql(assignMutation, {
              assignableId: issueId,
              actorIds: newAssignees
            });
            
            const assignedLogins = assignResponse.replaceActorsForAssignable.assignable.assignees.nodes.map(a => a.login);
            console.log(\\\`✅ Assigned to issue #\\\${taskNumber}: \\\${assignedLogins.join(', ')}\\\`);
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
  console.log(chalk.cyan('   Run the configure command:'));
  console.log(chalk.yellow('   npx github:shyamsridhar123/MayorWest configure'));
  console.log(chalk.gray('   This will set up auto-merge, workflow permissions, and branch protection.'));

  console.log('\n3. Create a Personal Access Token (PAT):');
  console.log(chalk.gray('   The orchestrator needs a PAT to assign Copilot to issues.'));
  console.log(chalk.cyan('   a) Create token at: https://github.com/settings/personal-access-tokens/new'));
  console.log(chalk.gray('   b) Repository access: Select your repository'));
  console.log(chalk.gray('   c) Permissions: Actions, Contents, Issues, Pull-requests (Read+Write)'));
  console.log(chalk.cyan('   d) Add as secret: gh secret set GH_AW_AGENT_TOKEN'));

  console.log('\n4. Set fork PR workflow approval (one-time):');
  console.log(chalk.gray('   Settings → Actions → General → Fork pull request workflows'));
  console.log(chalk.gray('   Select: "Require approval for first-time contributors who are new to GitHub"'));

  console.log('\n5. Commit and push:');
  console.log(chalk.gray('   git add .vscode .github'));
  console.log(chalk.gray('   git commit -m "[MAYOR] Add autonomous workflows"'));
  console.log(chalk.gray('   git push origin main'));

  console.log('\n6. Test the setup:');
  console.log(chalk.gray('   GitHub → Actions → Mayor West Orchestrator → Run workflow'));

  console.log('\n7. Create your first task:');
  console.log(chalk.gray('   GitHub → Issues → New → Mayor Task template'));

  console.log(chalk.cyan.bold('\n\nReady? Run: ') + chalk.yellow('npx github:shyamsridhar123/MayorWest configure'));
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
    errorMsg: 'Not a git repository. Run: git init',
  });

  // Check files
  const fileChecks = Object.entries(FILES_TO_CREATE).map(([filePath, config]) => ({
    name: config.displayName,
    pass: fs.existsSync(filePath),
    errorMsg: `File missing: ${filePath}. Run: npx github:shyamsridhar123/MayorWest setup`,
  }));
  checks.push(...fileChecks);

  // Check GitHub connection
  const remoteUrl = getGitRemoteUrl();
  const hasGitHubRemote = remoteUrl !== null && remoteUrl.includes('github.com');
  checks.push({
    name: 'GitHub Remote',
    pass: hasGitHubRemote,
    errorMsg: 'No GitHub remote found. Run: git remote add origin <url>',
  });

  // GitHub Settings Checks (only if gh CLI is available)
  const ghAvailable = isGHCLIAvailable();
  const ghAuth = ghAvailable && isGHCLIAuthenticated();
  
  checks.push({
    name: 'GitHub CLI (gh) installed',
    pass: ghAvailable,
    errorMsg: 'GitHub CLI not found. Install from: https://cli.github.com',
  });

  if (ghAvailable) {
    checks.push({
      name: 'GitHub CLI authenticated',
      pass: ghAuth,
      errorMsg: 'Not authenticated with GitHub CLI. Run: gh auth login',
    });
  }

  // Only run GitHub API checks if gh CLI is available and authenticated
  if (ghAuth && hasGitHubRemote) {
    const gitHubInfo = parseGitHubUrl(remoteUrl);
    if (gitHubInfo) {
      const { owner, repo } = gitHubInfo;

      // Check auto-merge
      const autoMergeEnabled = checkAutoMergeEnabled(owner, repo);
      checks.push({
        name: 'Auto-merge enabled',
        pass: autoMergeEnabled,
        errorMsg: `Auto-merge not enabled. Fix: Settings → General → Pull Requests → ☑ Allow auto-merge\nOr run: gh api repos/${owner}/${repo} -X PATCH -f allow_auto_merge=true`,
      });

      // Check workflow permissions
      const workflowPerms = checkWorkflowPermissions(owner, repo);
      checks.push({
        name: 'Workflow permissions (read-write)',
        pass: workflowPerms,
        errorMsg: `Workflow permissions not set to write. Fix: Settings → Actions → General → Workflow permissions → ☑ Read and write\nOr run: gh api repos/${owner}/${repo}/actions/permissions/workflow -X PUT -f default_workflow_permissions=write`,
      });

      // Check branch protection
      const branchProtected = checkBranchProtection(owner, repo, 'main');
      checks.push({
        name: 'Branch protection (main)',
        pass: branchProtected,
        errorMsg: `Branch protection not configured. Fix: Settings → Branches → Add rule for 'main'\nOr run: npx github:shyamsridhar123/MayorWest configure`,
      });

      // Check GH_AW_AGENT_TOKEN secret
      const secretExists = checkSecretExists(owner, repo, 'GH_AW_AGENT_TOKEN');
      checks.push({
        name: 'GH_AW_AGENT_TOKEN secret',
        pass: secretExists,
        errorMsg: `Secret not found. Create a Fine-Grained PAT at https://github.com/settings/personal-access-tokens/new\nThen run: gh secret set GH_AW_AGENT_TOKEN`,
      });

      // Check Copilot agent availability
      const copilotAvailable = checkCopilotAgentAvailable(owner, repo);
      checks.push({
        name: 'Copilot coding agent available',
        pass: copilotAvailable,
        errorMsg: 'Copilot coding agent (copilot-swe-agent) not available for this repository. Ensure GitHub Copilot is enabled.',
      });
    }
  }

  // Display results
  log.divider();
  console.log('');
  
  let passed = 0;
  checks.forEach(check => {
    if (check.pass) {
      log.success(check.name);
      passed++;
    } else {
      log.error(check.name);
      if (check.errorMsg) {
        console.log(chalk.gray(`  → ${check.errorMsg}`));
      }
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
    log.warning('Some checks failed. See error messages above for fixes.\n');
    if (!ghAvailable || !ghAuth) {
      console.log(chalk.gray('Note: Install and authenticate with GitHub CLI to enable additional checks.\n'));
    }
  }
}

// ============================================================================
// HELP & EXAMPLES
// ============================================================================

function showHelp() {
  log.header('Mayor West Mode CLI - Help');

  console.log(chalk.cyan.bold('Usage:\n'));
  console.log(chalk.yellow('  npx github:shyamsridhar123/MayorWest <command>\n'));

  console.log(chalk.cyan.bold('Commands:\n'));
  console.log(chalk.yellow('  setup'));
  console.log(chalk.gray('    Guided setup wizard for Mayor West Mode configuration\n'));

  console.log(chalk.yellow('  verify'));
  console.log(chalk.gray('    Verify that all Mayor West Mode files are in place\n'));

  console.log(chalk.yellow('  configure'));
  console.log(chalk.gray('    Configure GitHub repository settings (auto-merge, permissions, etc.)\n'));

  console.log(chalk.yellow('  help'));
  console.log(chalk.gray('    Show this help message\n'));

  console.log(chalk.yellow('  examples'));
  console.log(chalk.gray('    Show usage examples and best practices\n'));

  console.log(chalk.yellow('  status'));
  console.log(chalk.gray('    Show current Mayor West Mode status\n'));

  console.log(chalk.yellow('  version'));
  console.log(chalk.gray('    Show version information\n'));

  console.log(chalk.cyan.bold('Examples:\n'));
  console.log(chalk.gray('  npx github:shyamsridhar123/MayorWest setup'));
  console.log(chalk.gray('  npx github:shyamsridhar123/MayorWest verify'));
  console.log(chalk.gray('  npx github:shyamsridhar123/MayorWest examples\n'));
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

// ============================================================================
// CONFIGURE COMMAND - GitHub Repository Settings
// ============================================================================

async function runConfigureFlow() {
  log.header('⚙️  Configuring GitHub Repository Settings');

  // Verify git repository and GitHub CLI
  if (!isGitRepository()) {
    log.error('Not a git repository. Please run this from a git repository root.');
    process.exit(1);
  }

  const remoteUrl = getGitRemoteUrl();
  const gitHubInfo = parseGitHubUrl(remoteUrl);
  if (!gitHubInfo) {
    log.error('Could not parse GitHub URL. Ensure remote points to GitHub.');
    process.exit(1);
  }

  // Check if gh CLI is installed
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (e) {
    log.error('GitHub CLI (gh) is required. Install it from: https://cli.github.com');
    process.exit(1);
  }

  // Check if authenticated
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch (e) {
    log.error('Not authenticated with GitHub CLI. Run: gh auth login');
    process.exit(1);
  }

  const { owner, repo } = gitHubInfo;
  log.success(`Configuring: ${owner}/${repo}`);
  log.divider();

  const spinner = ora('Configuring repository settings...').start();
  const results = [];

  // 1. Enable auto-merge on repository
  try {
    spinner.text = 'Enabling auto-merge...';
    execSync(`gh api repos/${owner}/${repo} -X PATCH -f allow_auto_merge=true`, { stdio: 'ignore' });
    results.push({ name: 'Auto-merge enabled', success: true });
  } catch (e) {
    results.push({ name: 'Auto-merge enabled', success: false, error: e.message });
  }

  // 2. Set workflow permissions to read-write
  try {
    spinner.text = 'Setting workflow permissions...';
    execSync(`gh api repos/${owner}/${repo}/actions/permissions/workflow -X PUT -f default_workflow_permissions=write -F can_approve_pull_request_reviews=true`, { stdio: 'ignore' });
    results.push({ name: 'Workflow permissions (write)', success: true });
  } catch (e) {
    results.push({ name: 'Workflow permissions (write)', success: false, error: e.message });
  }

  // 3. Set branch protection (minimal - just to enable auto-merge)
  try {
    spinner.text = 'Setting branch protection...';
    const branchProtection = JSON.stringify({
      required_status_checks: { strict: false, contexts: [] },
      enforce_admins: false,
      required_pull_request_reviews: null,
      restrictions: null
    });
    // Write to temp file for cross-platform compatibility
    const tempFile = path.join(process.cwd(), '.mayor-west-temp.json');
    fs.writeFileSync(tempFile, branchProtection);
    try {
      execSync(`gh api repos/${owner}/${repo}/branches/main/protection -X PUT --input "${tempFile}"`, { stdio: 'ignore' });
      results.push({ name: 'Branch protection (main)', success: true });
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  } catch (e) {
    results.push({ name: 'Branch protection (main)', success: false, error: e.message });
  }

  spinner.stop();

  // Display results
  log.header('Configuration Results');
  results.forEach(r => {
    if (r.success) {
      log.success(r.name);
    } else {
      log.warning(`${r.name}: ${r.error || 'Failed'}`);
    }
  });

  log.divider();

  // Check for GH_AW_AGENT_TOKEN
  console.log(chalk.cyan.bold('\n🔑 Personal Access Token Setup\n'));
  console.log(chalk.gray('The orchestrator needs a Personal Access Token (PAT) to assign Copilot to issues.'));
  console.log(chalk.gray('The default GITHUB_TOKEN does not have permission to assign bot accounts.\n'));
  
  console.log(chalk.yellow('Create a Fine-Grained PAT at:'));
  console.log(chalk.cyan('  https://github.com/settings/personal-access-tokens/new\n'));
  
  console.log(chalk.gray('Required permissions:'));
  console.log(chalk.gray('  • Repository access: ' + chalk.white(`${owner}/${repo}`)));
  console.log(chalk.gray('  • Actions: Read and Write'));
  console.log(chalk.gray('  • Contents: Read and Write'));
  console.log(chalk.gray('  • Issues: Read and Write'));
  console.log(chalk.gray('  • Pull requests: Read and Write\n'));
  
  console.log(chalk.yellow('Then add it as a repository secret:'));
  console.log(chalk.cyan('  gh secret set GH_AW_AGENT_TOKEN\n'));

  // Check fork PR workflow approval setting
  console.log(chalk.cyan.bold('🔧 Fork PR Workflow Approval\n'));
  console.log(chalk.gray('For Copilot PRs to run workflows without manual approval:\n'));
  console.log(chalk.gray('  1. Go to: Settings → Actions → General'));
  console.log(chalk.gray('  2. Under "Fork pull request workflows from contributors"'));
  console.log(chalk.gray('  3. Select: "Require approval for first-time contributors who are new to GitHub"'));
  console.log(chalk.gray('  4. Click Save\n'));

  log.success('Configuration complete! Run: npx github:shyamsridhar123/MayorWest verify');
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
  const command = process.argv[2] || 'help';

  try {
    switch (command) {
      case 'setup':
        await runSetupFlow();
        break;
      case 'verify':
        await runVerifyFlow();
        break;
      case 'configure':
        await runConfigureFlow();
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
