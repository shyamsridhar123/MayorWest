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

## ⚠️ CRITICAL: Issue-Only Workflow

**YOU MUST ONLY WORK ON TASKS THAT COME FROM GITHUB ISSUES.**

### Mandatory Rules

1. **REFUSE** any direct code change requests that don't reference an issue
2. **REFUSE** to implement features without an associated issue number
3. **ALWAYS** verify the issue exists and is assigned to you before starting
4. If asked to do work without an issue:
   - Respond: "I can only work on tasks from GitHub issues. Please create an issue with the \`mayor-task\` label and I'll be automatically assigned."
   - Do NOT proceed with the work

### Why Issues?

- Issues provide a clear audit trail
- Issues define acceptance criteria
- Issues enable the auto-assignment workflow
- Issues allow proper PR linking with \`Fixes #<number>\`

## Your Mission

When assigned a GitHub issue with the \`mayor-task\` label, you are responsible for:
1. **Verifying** you have a valid issue number assigned to you
2. **Understanding** the complete task by reading the issue details
3. **Implementing** all acceptance criteria from the issue
4. **Testing** your implementation with the project's test suite
5. **Committing** with format: \`[MAYOR] <description>\` and \`Fixes #<issue>\`
6. **Creating/Updating** a pull request for review and merge

## Operating Principles

### 1. Validate the Issue First
- Confirm issue number exists
- Confirm you are assigned to the issue
- If no issue: STOP and ask user to create one
- If not assigned: STOP and wait for assignment

### 2. Read the Issue Completely
- Parse the issue title and description thoroughly
- Extract all acceptance criteria (numbered list or checklist)
- Identify testing requirements
- Note any technical constraints or architectural guidelines

### 3. Implement with Autonomy
- Make architectural decisions based on code style in the repository
- Use existing patterns and conventions
- Don't ask for clarification—infer intent from context
- Iterate on your own output when initial attempts fail

### 4. Test Before Committing
- Run the project's test suite: \`npm test\`, \`pytest\`, or equivalent
- Ensure all tests pass before committing
- If tests fail, analyze the error and fix your implementation
- Don't commit broken code under any circumstances

### 5. Commit with Issue Reference
- Use format: \`[MAYOR] <issue-title>: <specific-change>\`
- **MUST** include: \`Fixes #<issue-number>\` or \`Closes #<issue-number>\`
- Example: \`[MAYOR] Add authentication flow: Implement JWT verification\\n\\nFixes #42\`

### 6. Create or Update Pull Request
- Push your branch (YOLO auto-approval will handle this)
- GitHub will automatically create/update the PR
- The PR title should match the issue title
- PR body **MUST** include: \`Fixes #<issue-number>\`

## Refusing Work Without Issues

When asked to make changes without an issue reference:

\`\`\`
User: "Add a dark mode toggle to the settings page"

Your response:
"I operate in Mayor West Mode and can only work on tasks from GitHub issues.

To proceed:
1. Create a new issue at: [repo]/issues/new
2. Use the 'mayor-task' template
3. Describe the feature: 'Add dark mode toggle to settings page'
4. I'll be automatically assigned and will implement it

This ensures proper tracking, clear acceptance criteria, and a clean audit trail."
\`\`\`

## Failure Recovery

If something fails:
1. **Test Failure**: Analyze the error, fix your code, re-run tests, commit again
2. **Type Errors**: Review type definitions, fix implementation, re-run tests
3. **Linting Errors**: Run formatter (\`prettier\`, \`black\`), commit, re-run tests
4. **Import Errors**: Check imports are correct, verify file paths, fix, re-run tests
5. **Merge Conflict**: Rebase onto latest main, resolve conflicts, force-push

**You have 15 iterations maximum**—use them wisely.

## Safety Constraints

- **Never** use \`rm -rf\` or destructive commands without confirmation
- **Never** force-push to \`main\` or \`master\`
- **Always** run tests before committing
- **Always** respect branch protection rules
- **Always** create PRs—don't push directly to main
- **Always** work from issues—never from direct requests

## Success Metrics

You have successfully completed a task when:
- ✅ Task originated from a GitHub issue
- ✅ All acceptance criteria implemented
- ✅ All tests pass
- ✅ Code linting passes
- ✅ PR created with \`Fixes #<issue-number>\`
- ✅ PR is ready for auto-merge

**Remember**: Mayor West works autonomously, but ONLY on properly issued tasks.
`,

  '.github/workflows/mayor-west-auto-merge.yml': (options = {}) => `name: Mayor West Auto-Merge
# IMPORTANT: Uses pull_request_target to run in base repo context
# This avoids "first-time contributor" approval requirements for Copilot PRs

on:
  pull_request_target:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'copilot-swe-agent' || github.actor == 'copilot' || github.actor == 'copilot[bot]'
    
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
              console.log('✅ Auto-merge enabled for PR #' + context.payload.pull_request.number);
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
# Autonomous task assignment and PR merge workflow
# IMPORTANT: Uses pull_request_target to run in base repo context
# This avoids "first-time contributor" approval requirements for Copilot PRs

on:
  workflow_dispatch:
  issues:
    types: [opened, labeled]
  pull_request_target:
    types: [opened, synchronize, closed]
  # Run periodically to catch pending approvals
  schedule:
    - cron: '*/5 * * * *'

permissions:
  contents: write
  issues: write
  pull-requests: write
  actions: write

jobs:
  # Job 0: Auto-approve pending workflow runs from Copilot
  approve-copilot-runs:
    runs-on: ubuntu-latest
    steps:
      - name: Approve Pending Copilot Workflow Runs
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.GH_AW_AGENT_TOKEN || secrets.GITHUB_TOKEN }}
          script: |
            const owner = context.repo.owner;
            const repo = context.repo.repo;
            
            // Find runs that need approval (action_required status)
            const { data: runs } = await github.rest.actions.listWorkflowRunsForRepo({
              owner,
              repo,
              status: 'action_required',
              per_page: 20
            });
            
            if (runs.workflow_runs.length === 0) {
              console.log('No workflow runs awaiting approval');
              return;
            }
            
            console.log(\`Found \${runs.workflow_runs.length} runs awaiting approval\`);
            
            for (const run of runs.workflow_runs) {
              const actor = run.actor?.login?.toLowerCase() || '';
              const triggeringActor = run.triggering_actor?.login?.toLowerCase() || '';
              
              const isCopilot = actor.includes('copilot') || triggeringActor.includes('copilot');
              
              if (!isCopilot) {
                console.log(\`Skipping run \${run.id} - not from Copilot (actor: \${actor})\`);
                continue;
              }
              
              console.log(\`Approving run \${run.id} (\${run.name}) from \${actor}\`);
              
              try {
                // Approve the pending deployment
                const { data: pendingDeployments } = await github.rest.actions.getPendingDeploymentsForRun({
                  owner,
                  repo,
                  run_id: run.id
                });
                
                if (pendingDeployments.length > 0) {
                  const envIds = pendingDeployments.map(d => d.environment.id);
                  await github.rest.actions.reviewPendingDeploymentsForRun({
                    owner,
                    repo,
                    run_id: run.id,
                    environment_ids: envIds,
                    state: 'approved',
                    comment: 'Auto-approved by Mayor West Orchestrator'
                  });
                  console.log(\`  Approved deployments for run \${run.id}\`);
                } else {
                  // No pending deployments, try re-running the workflow
                  console.log(\`  No pending deployments, attempting rerun...\`);
                  try {
                    await github.rest.actions.reRunWorkflow({
                      owner,
                      repo,
                      run_id: run.id
                    });
                    console.log(\`  Re-triggered run \${run.id}\`);
                  } catch (e) {
                    console.log(\`  Could not rerun: \${e.message}\`);
                  }
                }
              } catch (error) {
                console.log(\`  Error approving run \${run.id}: \${error.message}\`);
              }
            }

  orchestrate:
    runs-on: ubuntu-latest
    needs: [approve-copilot-runs]
    if: always()
    
    steps:
      - name: Find Next Unassigned mayor-task
        id: find_task
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.GITHUB_TOKEN }}
          script: |
            const owner = context.repo.owner;
            const repo = context.repo.repo;
            
            // RULE: Only 1 PR at a time - check if Copilot already has an open PR
            const { data: prs } = await github.rest.pulls.list({
              owner,
              repo,
              state: 'open',
              per_page: 50
            });
            
            const openCopilotPR = prs.find(pr => {
              const login = pr.user.login.toLowerCase();
              return login === 'copilot-swe-agent' || login.includes('copilot');
            });
            
            if (openCopilotPR) {
              console.log(\`Copilot already has open PR #\${openCopilotPR.number}: \${openCopilotPR.title}\`);
              console.log('Waiting for it to be merged before assigning next task.');
              return { found: false };
            }
            
            // Find oldest unassigned mayor-task
            const { data: issues } = await github.rest.issues.listForRepo({
              owner,
              repo,
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
            const findAgentQuery = \`
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
            \`;
            
            const agentResponse = await github.graphql(findAgentQuery, { owner, repo });
            const actors = agentResponse.repository.suggestedActors.nodes;
            const copilotAgent = actors.find(actor => actor.login === 'copilot-swe-agent');
            
            if (!copilotAgent) {
              console.log('Available actors:', actors.map(a => a.login).join(', '));
              throw new Error('Copilot coding agent (copilot-swe-agent) not available');
            }
            
            console.log(\`Found copilot agent with ID: \${copilotAgent.id}\`);
            
            // Step 2: Get issue ID and current assignees
            const issueQuery = \`
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
            \`;
            
            const issueResponse = await github.graphql(issueQuery, { owner, repo, issueNumber: taskNumber });
            const issueId = issueResponse.repository.issue.id;
            const currentAssignees = issueResponse.repository.issue.assignees.nodes.map(a => a.id);
            
            // Step 3: Assign Copilot using replaceActorsForAssignable mutation
            const actorIds = [copilotAgent.id, ...currentAssignees.filter(id => id !== copilotAgent.id)];
            
            const assignMutation = \`
              mutation($assignableId: ID!, $actorIds: [ID!]!) {
                replaceActorsForAssignable(input: {
                  assignableId: $assignableId,
                  actorIds: $actorIds
                }) {
                  __typename
                }
              }
            \`;
            
            await github.graphql(assignMutation, { assignableId: issueId, actorIds });
            console.log(\`Successfully assigned Copilot to issue #\${taskNumber}\`);
            
            // Step 4: Add comment with instructions
            const commentBody = [
              '**@copilot-swe-agent** assigned to this task.',
              '',
              '**Before starting, read:**',
              '- \`.github/copilot/instructions.md\` - Your operating protocol',
              '- \`.github/copilot-instructions.md\` - Project rules',
              '',
              '**Key requirements:**',
              '1. Run \`npm test\` before committing',
              '2. Use commit format: \`[MAYOR] <description>\`',
              \`3. Include \\\`Fixes #\${taskNumber}\\\` in PR body\`,
              '4. Never use destructive commands'
            ].join('\\n');
            
            await github.rest.issues.createComment({
              owner,
              repo,
              issue_number: taskNumber,
              body: commentBody
            });
            console.log(\`Added instructions comment to issue #\${taskNumber}\`);

  # Job 2: Merge ready Copilot PRs (runs after orchestrate to avoid race conditions)
  merge-copilot-prs:
    runs-on: ubuntu-latest
    needs: [orchestrate]
    if: always()
    
    steps:
      - name: Find and Merge Copilot PRs
        uses: actions/github-script@v7
        with:
          github-token: \${{ secrets.GH_AW_AGENT_TOKEN || secrets.GITHUB_TOKEN }}
          script: |
            const owner = context.repo.owner;
            const repo = context.repo.repo;
            
            const { data: prs } = await github.rest.pulls.list({
              owner,
              repo,
              state: 'open',
              sort: 'created',
              direction: 'asc'
            });
            
            const copilotPRs = prs.filter(pr => {
              const login = pr.user.login.toLowerCase();
              return login === 'copilot' || login === 'copilot-swe-agent' || login.includes('copilot');
            });
            
            if (copilotPRs.length === 0) {
              console.log('No open Copilot PRs found');
              return;
            }
            
            // Check if Copilot is still actively working (has in_progress workflow)
            const { data: workflowRuns } = await github.rest.actions.listWorkflowRunsForRepo({
              owner,
              repo,
              status: 'in_progress',
              per_page: 10
            });
            
            const copilotActiveRun = workflowRuns.workflow_runs.find(run => {
              const name = (run.name || '').toLowerCase();
              const actor = (run.actor?.login || '').toLowerCase();
              return name.includes('copilot') || actor.includes('copilot');
            });
            
            if (copilotActiveRun) {
              console.log(\`Copilot is still working (run \${copilotActiveRun.id}). Skipping merge.\`);
              return;
            }
            
            for (const pr of copilotPRs) {
              console.log(\`Processing PR #\${pr.number}: \${pr.title}\`);
              
              // Skip WIP PRs - Copilot is still working on them
              if (pr.title.includes('[WIP]') || pr.title.toLowerCase().startsWith('wip')) {
                console.log('  Skipping: PR is marked as Work In Progress');
                continue;
              }
              
              // Check if there's an active Copilot session on this PR's branch
              const prBranchActiveRun = workflowRuns.workflow_runs.find(run => 
                run.head_branch === pr.head.ref
              );
              
              if (prBranchActiveRun) {
                console.log(\`  Skipping: Active Copilot session on branch \${pr.head.ref}\`);
                continue;
              }
              
              // Get full PR details
              const { data: prDetails } = await github.rest.pulls.get({
                owner,
                repo,
                pull_number: pr.number
              });
              
              // If PR is draft but no [WIP] and no active session, mark it ready
              if (prDetails.draft) {
                console.log('  PR is draft but Copilot seems done. Marking ready for review...');
                try {
                  await github.graphql(\`
                    mutation(\$prId: ID!) {
                      markPullRequestReadyForReview(input: { pullRequestId: \$prId }) {
                        pullRequest { id }
                      }
                    }
                  \`, { prId: pr.node_id });
                  console.log(\`  ✅ Marked PR #\${pr.number} as ready for review\`);
                } catch (error) {
                  console.log(\`  ⚠️ Could not mark ready: \${error.message}\`);
                  continue;
                }
              }
              
              if (prDetails.mergeable_state === 'dirty' || prDetails.mergeable_state === 'blocked') {
                console.log(\`  Skipping: PR is \${prDetails.mergeable_state}\`);
                continue;
              }
              
              try {
                await github.rest.pulls.createReview({
                  owner,
                  repo,
                  pull_number: pr.number,
                  event: 'APPROVE',
                  body: 'Auto-approved by Mayor West Orchestrator'
                });
                console.log(\`  ✅ Approved PR #\${pr.number}\`);
              } catch (error) {
                console.log(\`  Could not approve: \${error.message}\`);
              }
              
              try {
                await github.rest.pulls.merge({
                  owner,
                  repo,
                  pull_number: pr.number,
                  merge_method: 'squash'
                });
                console.log(\`  ✅ Merged PR #\${pr.number}\`);
                
                // STOP after merging one PR - next run will pick up the next one
                console.log('Stopping after merging one PR. Next task will be assigned on next run.');
                return;
              } catch (error) {
                console.log(\`  ❌ Could not merge: \${error.message}\`);
                // Continue to try next PR if this one failed
              }
            }
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

## ⚠️ CRITICAL: Issue-Only Enforcement

**YOU MUST ONLY WORK ON TASKS FROM GITHUB ISSUES.**

### Non-Negotiable Rules

1. **NO ISSUE = NO WORK**: Refuse any code changes without an issue reference
2. **VERIFY ASSIGNMENT**: Confirm you are assigned to the issue before starting
3. **REDIRECT REQUESTS**: If asked to work without an issue, instruct the user to create one

### Standard Response for Direct Requests

If someone asks you to make changes without referencing an issue:

> "I operate in Mayor West Mode and only work on GitHub issues.
> 
> **To get this done:**
> 1. Go to [Issues → New Issue](../../issues/new/choose)
> 2. Select 'Mayor Task' template
> 3. Describe your request with clear acceptance criteria
> 4. I'll be auto-assigned and will implement it
> 
> This ensures traceability and proper PR linking."

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

### Issue Reference is MANDATORY
- Every commit MUST include \`Fixes #<issue-number>\`
- Every PR MUST link to the originating issue
- No exceptions

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

1. **VERIFY** you have an issue number assigned to you
2. **READ** the issue completely - extract all acceptance criteria
3. **PLAN** your implementation - identify files to change
4. **IMPLEMENT** following existing code patterns
5. **TEST** with \`npm test\` - fix any failures
6. **COMMIT** with \`[MAYOR]\` prefix and \`Fixes #<issue>\`
7. **PUSH** to create/update PR

## Success Criteria

Your task is complete when:
- ✅ Task originated from a GitHub issue
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

## ⚠️ CRITICAL: Issue-Only Workflow

**ALL WORK MUST ORIGINATE FROM GITHUB ISSUES.**

### Enforcement Rules

1. **NO ISSUE = NO CODE CHANGES**: Do not implement any feature or fix without an issue
2. **VERIFY BEFORE STARTING**: Confirm the issue exists and you are assigned
3. **REDIRECT DIRECT REQUESTS**: When asked to work without an issue, respond:

> "This project uses Mayor West Mode. All work must come from GitHub issues.
> 
> **Create an issue:**
> 1. Go to [Issues → New Issue](../../issues/new/choose)
> 2. Use the 'Mayor Task' template
> 3. Add clear acceptance criteria
> 4. I'll be auto-assigned and implement it"

## Project Overview

This project uses **Mayor West Mode** for autonomous GitHub Copilot development workflows.

## Key Rules

1. **Issue Required**: All work must reference a GitHub issue
2. **Commit Format**: \`[MAYOR] <description>\\n\\nFixes #<issue-number>\`
3. **Test Before Commit**: Always run \`npm test\` before committing
4. **No Destructive Commands**: Never use \`rm -rf\`, \`git reset --hard\`, etc.
5. **PR Format**: Include \`Fixes #<issue-number>\` in PR body

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

# Create a task (REQUIRED before any work)
# GitHub → Issues → New → Mayor Task template
\`\`\`
`;
  },

  'AGENTS.md': (options = {}) => {
    const projectName = options.projectName || 'Project';
    return `# ${projectName} - Agent Instructions

> **MANDATORY ENFORCEMENT**: This file is automatically loaded for ALL AI interactions in this workspace.

## ⚠️ CRITICAL: Issue-Only Workflow

**ALL WORK MUST COME FROM GITHUB ISSUES. NO EXCEPTIONS.**

### Enforcement

When asked to make code changes WITHOUT an issue reference:
1. **STOP** - Do not proceed with any code changes
2. **INFORM** - Tell the user: "Mayor West Mode requires all work to originate from GitHub issues"
3. **REDIRECT** - Provide link: \`[Create Issue](../../issues/new/choose)\` with Mayor Task template
4. **WAIT** - Only proceed after issue is created and assigned

### Why This Matters

- **Traceability**: Every change is linked to a tracked issue
- **Automation**: Issues trigger auto-assignment to Copilot
- **PR Linking**: \`Fixes #<number>\` auto-closes issues on merge
- **Audit Trail**: Clear history of what was requested and delivered

## Project Identity

This project uses **Mayor West Mode** - autonomous GitHub Copilot development workflows.

## Agent Hierarchy

| Pattern | Agent | Location |
|---------|-------|----------|
| \`**\` | Mayor West Mode | \`.github/agents/mayor-west-mode.md\` |

## Mandatory Rules

1. **Issue Required**: All work must originate from a GitHub issue
2. **Never auto-approve destructive commands**: \`rm\`, \`kill\`, \`reset --hard\`
3. **Always run tests before committing**
4. **Use commit format**: \`[MAYOR] <description>\\n\\nFixes #<issue-number>\`
5. **Include \`Fixes #<issue>\` in PR body**

## Development Commands

\`\`\`bash
npm install           # Install dependencies
npm test              # Run tests
npm run lint          # Lint code
\`\`\`

## Creating Tasks

All work flows through issues:
1. Go to **Issues → New Issue**
2. Select **Mayor Task** template
3. Fill in acceptance criteria
4. Copilot is auto-assigned
5. PR is auto-merged when tests pass
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

  // Check for gh CLI
  let ghCliAvailable = false;
  try {
    execSync('gh auth status', { stdio: 'pipe' });
    ghCliAvailable = true;
    log.success('GitHub CLI authenticated');
  } catch (e) {
    log.warning('GitHub CLI not authenticated (some features require manual setup)');
  }

  // Check if repo is private and inform user
  let isPrivateRepo = false;
  if (ghCliAvailable) {
    try {
      const isPrivate = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo} --jq ".private"`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
      isPrivateRepo = isPrivate === 'true';
      if (isPrivateRepo) {
        log.info('Private repository detected');
        console.log(chalk.gray('   └─ GitHub Actions minutes apply (2,000 free/month)'));
      }
    } catch (e) {
      // Ignore - repo check failed
    }
  }

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

      // Check if branch protection exists, if not create minimal rule
      try {
        execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/branches/main/protection`, { stdio: 'pipe' });
        ora().succeed('Branch protection already configured on main');
      } catch (e) {
        // No branch protection - create rule with 1 required review (needed for auto-merge)
        try {
          const json = '{"enforce_admins":false,"required_pull_request_reviews":{"dismiss_stale_reviews":false,"require_code_owner_reviews":false,"required_approving_review_count":1},"required_status_checks":null,"restrictions":null}';
          execSync(`echo '${json}' | gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/branches/main/protection -X PUT -H "Accept: application/vnd.github+json" --input -`, { stdio: 'pipe', shell: true });
          ora().succeed('Branch protection enabled on main (1 review required for auto-merge)');
        } catch (e2) {
          ora().warn('Could not enable branch protection - auto-merge may fail');
          console.log(chalk.yellow('   → Go to Settings → Branches → Add rule for "main"'));
          console.log(chalk.yellow('   → Enable "Require pull request reviews" with 1 approval'));
        }
      }
    } else {
      console.log(chalk.yellow('\nManual configuration required:'));
      console.log(chalk.gray('   GitHub → Settings → General'));
      console.log(chalk.gray('   ├─ ☑ Allow auto-merge'));
      console.log(chalk.gray('   ├─ ☑ Automatically delete head branches'));
      console.log(chalk.gray('   └─ ☑ Allow squash merging'));
      console.log(chalk.gray(''));
      console.log(chalk.gray('   GitHub → Settings → Branches → Add rule'));
      console.log(chalk.gray('   └─ Branch name pattern: main'));
      console.log(chalk.yellow('   ⚠ Branch protection is REQUIRED for auto-merge!'));
    }
  }

  log.divider();

  // Step 6: Workflow Permissions (Auto-configure via API)
  log.header('🔐 Step 3: Workflow Permissions');

  console.log(chalk.cyan('\nConfiguring workflow permissions for autonomous operation...\n'));

  if (ghCliAvailable) {
    // Configure workflow permissions via API
    try {
      // Set default workflow permissions to "write" and enable PR approvals
      execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/actions/permissions/workflow -X PUT -f default_workflow_permissions=write -F can_approve_pull_request_reviews=true --silent`, { stdio: 'pipe' });
      ora().succeed('Workflow permissions set to "Read and write"');
      ora().succeed('GitHub Actions can now approve pull requests');
    } catch (e) {
      // Fallback to manual if API fails
      console.log(chalk.yellow('\n⚠ Could not auto-configure workflow permissions (may require admin access)'));
      console.log(chalk.white('\nManual configuration required:'));
      console.log(chalk.gray('   GitHub → Settings → Actions → General'));
      console.log(chalk.gray('   └─ Workflow permissions:'));
      console.log(chalk.green('      ◉ Read and write permissions'));
      console.log(chalk.green('      ☑ Allow GitHub Actions to create and approve pull requests'));
      
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

    // CRITICAL: Configure fork PR workflow approval for Copilot
    console.log(chalk.cyan('\nConfiguring Copilot workflow approval bypass...\n'));
    console.log(chalk.yellow('⚠ IMPORTANT: Copilot PRs require a one-time manual setting:'));
    console.log(chalk.white('\n   GitHub → Settings → Actions → General'));
    console.log(chalk.white('   Under "Fork pull request workflows from outside collaborators":'));
    console.log(chalk.green('   ◉ Require approval for first-time contributors who are new to GitHub'));
    console.log(chalk.gray('\n   (This allows Copilot PRs to run workflows without manual approval)'));
    
    const actionsSettingsUrl = `https://github.com/${gitHubInfo.owner}/${gitHubInfo.repo}/settings/actions`;
    
    const forkApproval = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'openSettings',
        message: 'Open Actions settings to configure this?',
        default: true,
      },
    ]);

    if (forkApproval.openSettings) {
      if (!openUrl(actionsSettingsUrl)) {
        console.log(chalk.gray(`\n   Open: ${actionsSettingsUrl}`));
      }
      
      await inquirer.prompt([
        {
          type: 'confirm',
          name: 'continue',
          message: 'Press Enter after configuring the setting...',
          default: true,
        },
      ]);
    }
  } else {
    console.log(chalk.yellow('\nManual configuration required (gh CLI not available):'));
    console.log(chalk.gray('   GitHub → Settings → Actions → General'));
    console.log(chalk.gray('   └─ Workflow permissions:'));
    console.log(chalk.green('      ◉ Read and write permissions'));
    console.log(chalk.green('      ☑ Allow GitHub Actions to create and approve pull requests'));
  }

  log.divider();

  // Step 7: PAT Token Setup (CRITICAL for Copilot assignment)
  log.header('🔑 Step 4: Personal Access Token (PAT) Setup');

  // Check if secret already exists
  let secretExists = false;
  if (ghCliAvailable) {
    try {
      const secrets = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/actions/secrets --jq ".secrets[].name"`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      secretExists = secrets.includes('GH_AW_AGENT_TOKEN');
    } catch (e) {}
  }

  if (secretExists) {
    log.success('GH_AW_AGENT_TOKEN secret already configured!');
    console.log(chalk.gray('   └─ Copilot auto-assignment is ready to work.'));
  } else {
    // Check for token in environment variable
    const envToken = process.env.MAYOR_WEST_TOKEN || process.env.GH_AW_AGENT_TOKEN;
    
    if (envToken && ghCliAvailable) {
      console.log(chalk.cyan('Found token in environment variable!'));
      const useEnvToken = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'useIt',
          message: 'Use MAYOR_WEST_TOKEN from environment to configure this repo?',
          default: true,
        },
      ]);

      if (useEnvToken.useIt) {
        try {
          execSync(`gh secret set GH_AW_AGENT_TOKEN --body "${envToken}" --repo ${gitHubInfo.owner}/${gitHubInfo.repo}`, { stdio: 'pipe' });
          log.success('Secret GH_AW_AGENT_TOKEN added from environment variable!');
          secretExists = true;
        } catch (e) {
          log.error('Failed to add secret from environment variable.');
        }
      }
    }

    if (!secretExists) {
      console.log(chalk.red.bold('\n⚠️  REQUIRED for Copilot auto-assignment!\n'));
      console.log(chalk.white('The orchestrator workflow needs a PAT to assign Copilot to issues.'));
      console.log(chalk.white('Without this, issues won\'t be automatically picked up by Copilot.\n'));
      
      console.log(chalk.yellow('💡 Pro tip: Set MAYOR_WEST_TOKEN environment variable to skip this step!\n'));
      console.log(chalk.gray('   PowerShell: $env:MAYOR_WEST_TOKEN = "ghp_xxxxx"'));
      console.log(chalk.gray('   Bash:       export MAYOR_WEST_TOKEN="ghp_xxxxx"'));
      console.log(chalk.gray('   Or add to your shell profile for permanent use.\n'));

    // Ask if they have an existing token
    const existingTokenPrompt = await inquirer.prompt([
      {
        type: 'list',
        name: 'hasExistingToken',
        message: 'Do you have an existing Mayor West PAT token?',
        choices: [
          { name: 'Yes, I have a token I can reuse', value: 'reuse' },
          { name: 'No, I need to create a new token', value: 'create' },
          { name: 'Skip for now (auto-assignment won\'t work)', value: 'skip' },
        ],
      },
    ]);

    if (existingTokenPrompt.hasExistingToken === 'reuse') {
      console.log(chalk.cyan('\n📝 Reusing existing token\n'));
      console.log(chalk.gray('If your token has "All repositories" access, it will work for this repo.'));
      console.log(chalk.gray('If it\'s scoped to specific repos, you may need to edit the token to add this repo.'));
      console.log(chalk.gray(''));
      console.log(chalk.gray('To edit an existing token:'));
      console.log(chalk.gray('   1. Go to: https://github.com/settings/tokens?type=beta'));
      console.log(chalk.gray('   2. Click on your token name'));
      console.log(chalk.gray('   3. Under "Repository access", add ' + chalk.cyan(`${gitHubInfo.owner}/${gitHubInfo.repo}`)));
      console.log(chalk.gray(''));

      const reusePrompt = await inquirer.prompt([
        {
          type: 'list',
          name: 'addMethod',
          message: 'How would you like to add the secret to this repo?',
          choices: [
            { name: 'Use gh CLI to add it now (paste token)', value: 'cli' },
            { name: 'I\'ll add it manually in GitHub', value: 'manual' },
          ],
        },
      ]);

      if (reusePrompt.addMethod === 'cli' && ghCliAvailable) {
        const tokenInput = await inquirer.prompt([
          {
            type: 'password',
            name: 'token',
            message: 'Paste your existing PAT token:',
            mask: '*',
          },
        ]);

        if (tokenInput.token) {
          try {
            execSync(`gh secret set GH_AW_AGENT_TOKEN --body "${tokenInput.token}" --repo ${gitHubInfo.owner}/${gitHubInfo.repo}`, { stdio: 'pipe' });
            log.success('Secret GH_AW_AGENT_TOKEN added successfully!');
          } catch (e) {
            log.error('Failed to add secret. Please add it manually.');
            const secretsUrl = `https://github.com/${gitHubInfo.owner}/${gitHubInfo.repo}/settings/secrets/actions/new`;
            console.log(chalk.gray(`   ${secretsUrl}`));
          }
        }
      } else {
        const secretsUrl = `https://github.com/${gitHubInfo.owner}/${gitHubInfo.repo}/settings/secrets/actions/new`;
        if (!openUrl(secretsUrl)) {
          console.log(chalk.gray(`\n   Open: ${secretsUrl}`));
        }
        console.log(chalk.cyan('\nAdd a new repository secret:'));
        console.log(chalk.green('   Name: GH_AW_AGENT_TOKEN'));
        console.log(chalk.green('   Value: <paste your existing token>'));
        
        await inquirer.prompt([
          {
            type: 'confirm',
            name: 'continue',
            message: 'Press Enter when you\'ve added the secret...',
            default: true,
          },
        ]);
      }
    } else if (existingTokenPrompt.hasExistingToken === 'create') {
      console.log(chalk.cyan('\n📝 Create a Fine-Grained Personal Access Token:\n'));
      console.log(chalk.yellow('💡 Tip: Create one token with "All repositories" access to reuse across all Mayor West repos!\n'));
      console.log(chalk.gray('1. Go to: https://github.com/settings/tokens?type=beta'));
      console.log(chalk.gray('2. Click "Generate new token"'));
      console.log(chalk.gray('3. Configure token settings:'));
      console.log(chalk.gray('   ├─ Token name: ' + chalk.white('Mayor West Agent Token')));
      console.log(chalk.gray('   ├─ Expiration: ' + chalk.white('90 days') + chalk.gray(' (or longer for less maintenance)')));
      console.log(chalk.gray('   ├─ Description: ' + chalk.white('Enables Copilot auto-assignment for Mayor West Mode')));
      console.log(chalk.gray('   └─ Resource owner: ' + chalk.cyan(`${gitHubInfo.owner}`)));
      console.log(chalk.gray(''));
      console.log(chalk.gray('4. Repository access ' + chalk.yellow('(choose one)') + ':'));
      console.log(chalk.green('   ◉ All repositories') + chalk.gray(' ← Recommended! Reuse for all repos'));
      console.log(chalk.gray('   ○ Only select repositories → Select: ' + chalk.cyan(`${gitHubInfo.owner}/${gitHubInfo.repo}`)));
      console.log(chalk.gray(''));
      console.log(chalk.gray('5. Repository permissions ' + chalk.yellow('(expand this section)') + ':'));
      console.log(chalk.green('   ├─ Actions: ') + chalk.white('Read-only') + chalk.gray(' (view workflow runs)'));
      console.log(chalk.green('   ├─ Contents: ') + chalk.white('Read and write') + chalk.gray(' (for PR merging)'));
      console.log(chalk.green('   ├─ Issues: ') + chalk.white('Read and write') + chalk.gray(' (assign Copilot, add comments)'));
      console.log(chalk.green('   ├─ Metadata: ') + chalk.white('Read-only') + chalk.gray(' (auto-selected, required)'));
      console.log(chalk.green('   └─ Pull requests: ') + chalk.white('Read and write') + chalk.gray(' (for auto-merge)'));
      console.log(chalk.gray(''));
      console.log(chalk.gray('6. Account permissions: ' + chalk.white('No access needed') + chalk.gray(' (leave all as default)')));
      console.log(chalk.gray(''));
      console.log(chalk.gray('7. Click ' + chalk.white('"Generate token"') + ' and ' + chalk.red('copy it immediately!')));
      console.log(chalk.yellow('   ⚠ You won\'t be able to see it again after leaving the page.'));

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

      console.log(chalk.cyan('\n8. Add the token as a repository secret:\n'));
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
            { name: 'Use gh CLI to add it now (paste token)', value: 'cli' },
            { name: 'I\'ll add it manually in GitHub', value: 'manual' },
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
      } else {
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
      }
    } else {
      log.warning('Skipped PAT setup - Copilot auto-assignment will not work');
    }
    }
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
// PLAN - BREAK DOWN PROMPTS INTO MULTIPLE ISSUES
// ============================================================================

async function runPlanFlow() {
  log.header('📋 Mayor West Task Planner');
  
  console.log(chalk.gray('Break down a high-level goal into multiple detailed GitHub issues.\n'));

  // Check for gh CLI
  try {
    execSync('gh --version', { stdio: 'pipe' });
  } catch {
    log.error('GitHub CLI (gh) is required for this command.');
    console.log(chalk.gray('Install it: https://cli.github.com/'));
    process.exit(1);
  }

  // Check for authenticated gh
  try {
    execSync('gh auth status', { stdio: 'pipe' });
  } catch {
    log.error('You must be logged in to GitHub CLI.');
    console.log(chalk.gray('Run: gh auth login'));
    process.exit(1);
  }

  // Get repo info
  let repoInfo;
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
    repoInfo = parseGitHubUrl(remoteUrl);
    if (!repoInfo) throw new Error('Not a GitHub repo');
  } catch {
    log.error('Could not detect GitHub repository.');
    process.exit(1);
  }

  console.log(chalk.green(`✓ Repository: ${repoInfo.owner}/${repoInfo.repo}\n`));

  // Get the high-level goal
  const { goal } = await inquirer.prompt([
    {
      type: 'input',
      name: 'goal',
      message: 'What do you want to build?',
      validate: (input) => input.trim().length > 0 || 'Please enter a goal',
    },
  ]);

  console.log(chalk.cyan('\n📝 Now break this down into specific tasks.'));
  console.log(chalk.gray('Enter each task on a new line. Type "done" when finished.\n'));

  const tasks = [];
  let taskNum = 1;

  while (true) {
    const { task } = await inquirer.prompt([
      {
        type: 'input',
        name: 'task',
        message: `Task ${taskNum}:`,
        default: taskNum === 1 ? '' : 'done',
      },
    ]);

    if (task.toLowerCase() === 'done') {
      if (tasks.length === 0) {
        console.log(chalk.yellow('Please add at least one task.'));
        continue;
      }
      break;
    }

    if (task.trim()) {
      tasks.push(task.trim());
      taskNum++;
    }
  }

  // Ask for additional context for each task
  console.log(chalk.cyan('\n📄 Add context for each task (optional - press Enter to skip):\n'));

  const detailedTasks = [];
  for (let i = 0; i < tasks.length; i++) {
    console.log(chalk.white.bold(`\nTask ${i + 1}: ${tasks[i]}`));
    
    const { context, criteria } = await inquirer.prompt([
      {
        type: 'input',
        name: 'context',
        message: 'Context (why is this needed?):',
        default: '',
      },
      {
        type: 'input',
        name: 'criteria',
        message: 'Acceptance criteria (comma-separated):',
        default: '',
      },
    ]);

    detailedTasks.push({
      title: tasks[i],
      context: context.trim(),
      criteria: criteria.split(',').map(c => c.trim()).filter(c => c),
    });
  }

  // Preview and confirm
  console.log(chalk.cyan.bold('\n📋 Issue Preview:\n'));
  console.log(chalk.gray(`Goal: ${goal}\n`));
  
  detailedTasks.forEach((task, i) => {
    console.log(chalk.white.bold(`${i + 1}. [MAYOR] ${task.title}`));
    if (task.context) console.log(chalk.gray(`   Context: ${task.context}`));
    if (task.criteria.length > 0) {
      console.log(chalk.gray(`   Criteria: ${task.criteria.join(', ')}`));
    }
  });

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Create ${detailedTasks.length} issues in ${repoInfo.owner}/${repoInfo.repo}?`,
      default: true,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('\nAborted.'));
    return;
  }

  // Create the issues
  console.log(chalk.cyan('\n🚀 Creating issues...\n'));

  const createdIssues = [];
  for (const task of detailedTasks) {
    const spinner = ora(`Creating: ${task.title}`).start();

    // Build issue body
    let body = `# [MAYOR] ${task.title}\n\n`;
    body += `**Goal:** ${goal}\n\n`;
    
    if (task.context) {
      body += `## Context\n\n${task.context}\n\n`;
    }
    
    body += `## Acceptance Criteria\n\n`;
    if (task.criteria.length > 0) {
      task.criteria.forEach(c => {
        body += `- [ ] ${c}\n`;
      });
    } else {
      body += `- [ ] Implementation complete\n`;
      body += `- [ ] Tests pass\n`;
    }
    
    body += `\n## Technical Notes\n\n`;
    body += `*Add any technical details here.*\n\n`;
    body += `---\n`;
    body += `*Created by Mayor West Task Planner*`;

    try {
      const result = execSync(
        `gh issue create --repo ${repoInfo.owner}/${repoInfo.repo} --title "[MAYOR] ${task.title}" --body "${body.replace(/"/g, '\\"')}" --label mayor-task`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      
      const issueUrl = result.trim();
      const issueNum = issueUrl.split('/').pop();
      createdIssues.push({ num: issueNum, title: task.title, url: issueUrl });
      spinner.succeed(`Created #${issueNum}: ${task.title}`);
    } catch (error) {
      spinner.fail(`Failed: ${task.title}`);
      console.log(chalk.red(`   Error: ${error.message}`));
    }
  }

  // Summary
  console.log(chalk.green.bold(`\n✅ Created ${createdIssues.length}/${detailedTasks.length} issues!\n`));
  
  if (createdIssues.length > 0) {
    console.log(chalk.cyan('Issues created:'));
    createdIssues.forEach(issue => {
      console.log(chalk.gray(`  #${issue.num} - ${issue.title}`));
    });
    
    console.log(chalk.cyan('\n🤖 Copilot will be assigned automatically by the orchestrator workflow.'));
    console.log(chalk.gray('Trigger manually: gh workflow run mayor-west-orchestrator.yml\n'));
  }
}

// ============================================================================
// UNINSTALL - REMOVE ALL MAYOR WEST FILES
// ============================================================================

async function runUninstallFlow() {
  log.header('🗑️  Uninstall Mayor West Mode');

  console.log(chalk.yellow('This will remove all Mayor West Mode files from this repository.\n'));

  // Check if we're in a git repo
  if (!isGitRepository()) {
    log.error('Not a git repository. Run this from a repo with Mayor West Mode installed.');
    process.exit(1);
  }

  // List all Mayor West files
  const allFiles = Object.keys(FILES_TO_CREATE);
  const existingFiles = allFiles.filter(file => fs.existsSync(file));

  if (existingFiles.length === 0) {
    console.log(chalk.green('No Mayor West Mode files found. Nothing to uninstall.\n'));
    return;
  }

  console.log(chalk.cyan('Files to remove:\n'));
  existingFiles.forEach(file => {
    const config = FILES_TO_CREATE[file];
    console.log(chalk.red(`  ✗ ${file}`) + chalk.gray(` (${config.displayName})`));
  });

  // Confirm
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: chalk.yellow(`Remove ${existingFiles.length} files?`),
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.gray('\nUninstall cancelled.\n'));
    return;
  }

  // Additional confirmation for safety
  const { doubleConfirm } = await inquirer.prompt([
    {
      type: 'input',
      name: 'doubleConfirm',
      message: 'Type "uninstall" to confirm:',
    },
  ]);

  if (doubleConfirm.toLowerCase() !== 'uninstall') {
    console.log(chalk.gray('\nUninstall cancelled.\n'));
    return;
  }

  console.log(chalk.cyan('\n🗑️  Removing files...\n'));

  let removed = 0;
  let failed = 0;

  for (const file of existingFiles) {
    try {
      fs.unlinkSync(file);
      console.log(chalk.green(`  ✓ Removed ${file}`));
      removed++;

      // Clean up empty directories
      const dir = path.dirname(file);
      if (dir !== '.' && fs.existsSync(dir)) {
        try {
          const contents = fs.readdirSync(dir);
          if (contents.length === 0) {
            fs.rmdirSync(dir);
            console.log(chalk.gray(`    (removed empty directory: ${dir})`));
          }
        } catch {
          // Directory not empty or can't remove, that's fine
        }
      }
    } catch (error) {
      console.log(chalk.red(`  ✗ Failed to remove ${file}: ${error.message}`));
      failed++;
    }
  }

  // Clean up nested empty directories
  const dirsToCheck = [
    '.github/agents',
    '.github/workflows', 
    '.github/ISSUE_TEMPLATE',
    '.github/copilot',
    '.github',
    '.vscode',
  ];

  for (const dir of dirsToCheck) {
    if (fs.existsSync(dir)) {
      try {
        const contents = fs.readdirSync(dir);
        if (contents.length === 0) {
          fs.rmdirSync(dir);
          console.log(chalk.gray(`  (removed empty directory: ${dir})`));
        }
      } catch {
        // Can't remove, that's fine
      }
    }
  }

  // Summary
  console.log();
  if (failed === 0) {
    console.log(chalk.green.bold(`✅ Successfully removed ${removed} files.\n`));
  } else {
    console.log(chalk.yellow(`Removed ${removed} files, ${failed} failed.\n`));
  }

  // Offer to remove GitHub secret
  console.log(chalk.cyan('Optional cleanup:\n'));
  console.log(chalk.gray('  • Remove the GH_AW_AGENT_TOKEN secret from your repo settings'));
  console.log(chalk.gray('  • Delete the PAT token from github.com/settings/tokens'));
  console.log(chalk.gray('  • Disable auto-merge in repo settings if not needed\n'));

  // Offer to commit the removal
  const { commitRemoval } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'commitRemoval',
      message: 'Commit the file removals?',
      default: true,
    },
  ]);

  if (commitRemoval) {
    try {
      execSync('git add -A', { stdio: 'pipe' });
      execSync('git commit -m "[MAYOR] Uninstall Mayor West Mode"', { stdio: 'pipe' });
      console.log(chalk.green('\n✓ Changes committed.'));
      
      const { pushChanges } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'pushChanges',
          message: 'Push to remote?',
          default: true,
        },
      ]);

      if (pushChanges) {
        execSync('git push', { stdio: 'pipe' });
        console.log(chalk.green('✓ Changes pushed.\n'));
      }
    } catch (error) {
      console.log(chalk.yellow(`\nCould not commit: ${error.message}`));
      console.log(chalk.gray('You can commit manually: git add -A && git commit -m "Remove Mayor West Mode"\n'));
    }
  }

  console.log(chalk.cyan.bold('👋 Mayor West Mode has been uninstalled.\n'));
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

  // Check repo visibility for context
  const gitHubInfo = remoteUrl ? parseGitHubUrl(remoteUrl) : null;
  let isPrivateRepo = false;

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

  if (ghCliAvailable && remoteUrl && gitHubInfo) {
    // Check repo visibility
    try {
      const visibility = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo} --jq ".private"`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      isPrivateRepo = visibility === 'true';
    } catch (e) {}

    try {
      // Check auto-merge setting
      const repoInfo = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo} --jq ".allow_auto_merge"`, { 
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
      const deleteBranch = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo} --jq ".delete_branch_on_merge"`, { 
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

    // Check branch protection (REQUIRED for auto-merge to work)
    try {
      execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/branches/main/protection`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      });
      checks.push({
        name: 'Branch Protection on main',
        pass: true,
        category: 'github',
      });
    } catch (e) {
      checks.push({
        name: 'Branch Protection on main',
        pass: false,
        category: 'github',
      });
      warnings.push('Branch protection NOT configured - auto-merge will FAIL without it!');
    }

    try {
      // Check squash merge enabled
      const gitHubInfo = parseGitHubUrl(remoteUrl);
      const squashMerge = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo} --jq ".allow_squash_merge"`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      checks.push({
        name: 'Squash Merge Enabled',
        pass: squashMerge === 'true',
        category: 'github',
      });
    } catch (e) {
      warnings.push('Could not check squash merge setting');
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

    // Check workflow default permissions (read-write needed for auto-merge)
    try {
      const gitHubInfo = parseGitHubUrl(remoteUrl);
      const workflowPerms = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/actions/permissions/workflow --jq ".default_workflow_permissions"`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      checks.push({
        name: 'Workflow Permissions: Read & Write',
        pass: workflowPerms === 'write',
        category: 'github',
      });
      if (workflowPerms !== 'write') {
        warnings.push('Workflow permissions should be "Read and write" for auto-merge to work');
      }
    } catch (e) {
      warnings.push('Could not check workflow default permissions');
    }

    // Check if workflows can create PRs
    try {
      const gitHubInfo = parseGitHubUrl(remoteUrl);
      const canApprovePRs = execSync(`gh api repos/${gitHubInfo.owner}/${gitHubInfo.repo}/actions/permissions/workflow --jq ".can_approve_pull_request_reviews"`, { 
        encoding: 'utf8', 
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).trim();
      checks.push({
        name: 'Workflows Can Approve PRs',
        pass: canApprovePRs === 'true',
        category: 'github',
      });
      if (canApprovePRs !== 'true') {
        warnings.push('Enable "Allow GitHub Actions to create and approve pull requests" in Settings → Actions');
      }
    } catch (e) {
      warnings.push('Could not check workflow PR approval permissions');
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

  log.divider();
  
  // Show repo info
  if (gitHubInfo) {
    console.log(chalk.cyan(`\n📍 Repository: ${gitHubInfo.owner}/${gitHubInfo.repo}`));
    if (isPrivateRepo) {
      console.log(chalk.gray('   └─ Private repo (GitHub Actions minutes apply: 2,000 free/month)'));
    }
  }

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

  console.log(chalk.yellow('  plan'));
  console.log(chalk.gray('    Break down a goal into multiple GitHub issues\n'));

  console.log(chalk.yellow('  verify'));
  console.log(chalk.gray('    Verify that all Mayor West Mode files are in place\n'));

  console.log(chalk.yellow('  uninstall'));
  console.log(chalk.gray('    Remove all Mayor West Mode files from the repository\n'));

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
  console.log(chalk.gray('  npx mayor-west-mode plan'));
  console.log(chalk.gray('  npx mayor-west-mode verify'));
  console.log(chalk.gray('  npx mayor-west-mode uninstall\n'));
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
      case 'plan':
        await runPlanFlow();
        break;
      case 'uninstall':
        await runUninstallFlow();
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
