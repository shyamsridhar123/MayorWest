# Mayor West Mode - CLI Installation & User Guide

**Version**: 1.0.0  
**Status**: Production-Ready (January 2026)  
**Last Updated**: January 14, 2026

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation Methods](#installation-methods)
3. [CLI Commands](#cli-commands)
4. [Setup Wizard](#setup-wizard)
5. [Configuration Guide](#configuration-guide)
6. [Usage Examples](#usage-examples)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

---

## Quick Start

**One-liner installation** (requires Node.js 18+):

```bash
npx mayor-west-mode setup
```

That's it! The CLI will guide you through setup interactively.

**Verify your setup:**

```bash
npx mayor-west-mode verify
```

---

## Installation Methods

### Method 1: NPX (Recommended - No Installation)

Run directly without installing:

```bash
npx mayor-west-mode setup
```

**Pros**: No system clutter, always latest version  
**Cons**: Slower first run (downloads package)

### Method 2: Global NPM Installation

Install globally once, use everywhere:

```bash
npm install -g mayor-west-mode
```

Then use anywhere:

```bash
mayor-west-mode setup
```

**Pros**: Faster, available in any directory  
**Cons**: Takes disk space, need updates manually

### Method 3: Local Project Installation

Install in your project directory:

```bash
npm install mayor-west-mode --save-dev
```

Then use via npm scripts:

```bash
npm run setup    # configured in package.json
npm run verify
npm run examples
```

Or via npx:

```bash
npx mayor-west-mode setup
```

### Method 4: Docker (For Team Distribution)

Create a Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

RUN npm install -g mayor-west-mode

ENTRYPOINT ["mayor-west-mode"]
CMD ["help"]
```

Build and use:

```bash
docker build -t mayor-west-mode .
docker run -v $(pwd):/app mayor-west-mode setup
```

---

## CLI Commands

### `mayor-west-mode setup`

**Description**: Guided interactive setup wizard  
**Usage**: `npx mayor-west-mode setup`

**What it does**:
1. Verifies git repository
2. Extracts GitHub repository info
3. Prompts for configuration preferences
4. Creates all necessary files
5. Provides next steps

**Output**:
```
━━━ 🤖 Mayor West Mode Setup ━━━

✓ Git repository detected
✓ GitHub repository: yourusername/your-repo

[Interactive prompts for setup options]

✓ Created 5 configuration files

🎉 Setup Complete!

Next Steps:
1. Review generated files
2. Configure GitHub settings
3. Commit and push
4. Test the setup
```

---

### `mayor-west-mode verify`

**Description**: Verify all setup files are in place  
**Usage**: `npx mayor-west-mode verify`

**What it checks**:
- ✓ Git repository
- ✓ .vscode/settings.json
- ✓ .github/agents/mayor-west-mode.md
- ✓ .github/workflows/mayor-west-auto-merge.yml
- ✓ .github/workflows/mayor-west-orchestrator.yml
- ✓ .github/ISSUE_TEMPLATE/mayor-task.md
- ✓ GitHub remote

**Output**:
```
━━━ 🔍 Verifying Setup ━━━

✓ Git Repository
✓ VS Code YOLO Settings
✓ Copilot Agent Instructions
✓ Auto-Merge Workflow
✓ Orchestrator Workflow
✓ Task Template
✓ GitHub Remote

Result: 7/7 checks passed

✓ All systems go! 🚀
```

---

### `mayor-west-mode help`

**Description**: Show help message and usage guide  
**Usage**: `npx mayor-west-mode help`

**Output**: Shows all available commands, usage patterns, and examples

---

### `mayor-west-mode examples`

**Description**: Show usage examples and best practices  
**Usage**: `npx mayor-west-mode examples`

**Examples shown**:
1. Simple bug fix task
2. Feature implementation task
3. Complex feature task

**Best practices included**:
- Writing clear acceptance criteria
- Setting technical constraints
- Defining testing requirements
- Task complexity estimation

---

### `mayor-west-mode status`

**Description**: Show current Mayor West Mode status  
**Usage**: `npx mayor-west-mode status`

**Output**:
```
━━━ Mayor West Mode Status ━━━

Repository Information:
  Git Repository: ✓
  Remote URL: git@github.com:yourusername/your-repo.git
  Current Branch: main

Configuration Files:
  ✓ VS Code YOLO Settings
  ✓ Copilot Agent Instructions
  ✓ Auto-Merge Workflow
  ✓ Orchestrator Workflow
  ✓ Task Template
```

---

## Setup Wizard

### Step 1: Repository Verification

The CLI checks that you're in a git repository with a GitHub remote.

**If this fails**:
```bash
# Initialize git if needed
git init

# Add GitHub remote
git remote add origin git@github.com:yourusername/your-repo.git
```

### Step 2: Setup Type Selection

Choose your installation type:

```
? Which setup mode would you like?
❯ Full Setup (all files + configuration)
  Minimal Setup (core files only)
  Custom Setup (choose files individually)
```

**Full Setup** (Recommended):
- Installs all 5 files
- Most productive mode
- Complete Mayor West Mode functionality

**Minimal Setup**:
- Installs only critical files (4 of 5)
- Skips optional task template
- Good if you have custom templates

**Custom Setup**:
- Choose each file individually
- Most control
- Useful for gradual rollout

### Step 3: Configuration Options

```
? Enable auto-merge on PRs?
  (Y/n) Y

? How should PRs be merged?
  ❯ Squash (recommended)
    Merge (preserve commits)
    Rebase (linear history)

? Max Copilot iterations before stopping:
  (15)
```

**Auto-Merge**: Automatically approve and merge PRs from Copilot  
**Merge Strategy**:
- **Squash**: Combines all commits into one (clean history)
- **Merge**: Preserves all commits (detailed history)
- **Rebase**: Linear history without merge commits

**Iteration Limit**: Maximum number of times Copilot can retry (safety limit)

### Step 4: File Creation

```
Creating Configuration Files

✓ VS Code YOLO Settings
✓ Copilot Agent Instructions
✓ Auto-Merge Workflow
✓ Orchestrator Workflow
✓ Task Template

Created 5 configuration files
```

### Step 5: Next Steps

The CLI provides actionable next steps:

```
1. Review the generated files:
   .vscode/settings.json
   .github/agents/mayor-west-mode.md
   .github/workflows/mayor-west-auto-merge.yml
   .github/workflows/mayor-west-orchestrator.yml
   .github/ISSUE_TEMPLATE/mayor-task.md

2. Configure GitHub repository settings:
   a) Enable auto-merge:
      GitHub → Settings → Pull Requests → Allow auto-merge

   b) Enable branch protection:
      GitHub → Settings → Branches → Add Rule
      ├─ Branch: main
      ├─ ☑ Require status checks
      └─ ☑ Require PR reviews

3. Commit and push:
   git add .vscode .github
   git commit -m "Mayor West Mode: Add autonomous workflows"
   git push origin main

4. Test the setup:
   GitHub → Actions → Mayor West Orchestrator → Run workflow

5. Create your first task:
   GitHub → Issues → New → Mayor Task template
```

---

## Configuration Guide

### VS Code Settings (.vscode/settings.json)

**What it does**: Configures GitHub Copilot to auto-approve safe commands

**Key settings**:

```json
{
  "chat.tools.autoApprove": true,
  "chat.tools.terminal.autoApprove": {
    "/^git\\s+(commit|push)\\b/": true,
    "/^(npm|pnpm|yarn)\\s+(test|lint|build)\\b/": true,
    "rm": false,
    "kill": false
  },
  "chat.agent.iterationLimit": 15,
  "chat.agent.maxTokensPerIteration": 4000
}
```

**Auto-approved commands**:
- `git commit` - Commit changes
- `git push` - Push to remote
- `npm test`, `npm run test` - Run tests
- `npm lint`, `npm run lint` - Run linter
- `npm build`, `npm run build` - Build project

**Blocked commands** (require manual approval):
- `rm`, `rm -rf` - Delete files
- `kill` - Kill processes
- `git reset --hard` - Destructive operations

**Customizing**:

Edit .vscode/settings.json to add/remove commands:

```json
{
  "chat.tools.terminal.autoApprove": {
    "/^docker\\s+push/": false,  // Require approval for docker push
    "/^npm\\s+publish/": false    // Require approval for npm publish
  }
}
```

### Agent Instructions (.github/agents/mayor-west-mode.md)

**What it does**: Tells Copilot how to behave when assigned tasks

**Key sections**:
1. Mission - What to do
2. Operating Principles - How to approach tasks
3. Failure Recovery - How to handle errors
4. Safety Constraints - What not to do
5. Success Metrics - How to know when done

**Customizing**:

Modify `.github/agents/mayor-west-mode.md` to:
- Add project-specific guidelines
- Reference your code style guide
- Include architectural patterns
- Add domain-specific constraints

Example addition:
```markdown
## Project-Specific Rules

- Always use TypeScript strict mode
- Follow BEM naming for CSS classes
- Use snake_case for database columns
- Write JSDoc for public APIs
```

### Workflows

**Auto-Merge** (.github/workflows/mayor-west-auto-merge.yml):
- Triggers on PR creation by @copilot
- Approves the PR automatically
- Enables auto-merge with SQUASH strategy
- Merges when all checks pass

**Orchestrator** (.github/workflows/mayor-west-orchestrator.yml):
- Finds unassigned mayor-task issues
- Assigns to @copilot
- Waits for completion
- Loops for next task

---

## Usage Examples

### Example 1: Simple Setup (5 minutes)

```bash
# 1. Go to your repository
cd /path/to/your/repo

# 2. Run setup
npx mayor-west-mode setup

# Select:
# - Full Setup
# - Enable auto-merge: yes
# - Merge strategy: SQUASH
# - Iterations: 15

# 3. The CLI creates all files and tells you next steps

# 4. Follow GitHub configuration steps
# (Enable auto-merge, branch protection)

# 5. Commit and push
git add .vscode .github
git commit -m "Mayor West Mode: Add autonomous workflows"
git push origin main

# 6. Verify
npx mayor-west-mode verify
```

### Example 2: Viewing Examples

```bash
# Show all usage examples and best practices
npx mayor-west-mode examples

# Output shows:
# - 3 task examples (simple, medium, complex)
# - Best practices for writing tasks
# - Complexity estimation guide
```

### Example 3: Checking Status

```bash
# Check current setup status
npx mayor-west-mode status

# Shows:
# - Git and GitHub info
# - Which files are present
# - Which files are missing (if any)
```

### Example 4: Creating Your First Task

After setup:

```bash
# 1. Go to GitHub
# github.com/yourusername/your-repo

# 2. Click "Issues" → "New Issue"

# 3. Select "Mayor Task" template

# 4. Fill in details:
#    [MAYOR] Fix login button alignment
#    
#    Context: Button looks misaligned on mobile
#    
#    Acceptance Criteria:
#    - [ ] Fix alignment on <768px screens
#    - [ ] Tests pass
#    - [ ] Works on Safari and Chrome
#    
#    Testing: npm test

# 5. Click "Submit new issue"

# 6. Go to Actions → Mayor West Orchestrator
#    Click "Run workflow"

# 7. Watch as Copilot implements the task!
```

---

## Troubleshooting

### Problem: "Not a git repository"

**Cause**: You're not in a git repository

**Solution**:
```bash
# Initialize git if needed
git init

# Add GitHub remote
git remote add origin git@github.com:yourusername/your-repo.git

# Then run setup again
npx mayor-west-mode setup
```

### Problem: "No git remote found"

**Cause**: Repository has no GitHub remote

**Solution**:
```bash
# Add GitHub remote
git remote add origin git@github.com:yourusername/your-repo.git

# Verify it was added
git remote -v

# Run setup again
npx mayor-west-mode setup
```

### Problem: "Could not parse GitHub URL"

**Cause**: Remote URL doesn't point to GitHub

**Solution**:
```bash
# Check current remote
git remote -v

# If wrong, remove and re-add
git remote remove origin
git remote add origin git@github.com:yourusername/your-repo.git

# Run setup again
npx mayor-west-mode setup
```

### Problem: Files already exist (overwrite?)

**Cause**: Files from previous setup attempts exist

**Solution**:
```bash
# Option 1: Let CLI overwrite them
# Choose "Yes" when prompted

# Option 2: Manual cleanup
rm .vscode/settings.json
rm .github/agents/mayor-west-mode.md
rm .github/workflows/mayor-west-*.yml
rm .github/ISSUE_TEMPLATE/mayor-task.md

# Then run setup again
npx mayor-west-mode setup
```

### Problem: Verify shows missing files

**Cause**: Some files didn't create successfully

**Solution**:
```bash
# Check which files are missing
npx mayor-west-mode verify

# Run setup again (selective)
npx mayor-west-mode setup
# Choose: Custom Setup
# Select only missing files
```

### Problem: Node.js version too old

**Cause**: Node.js < 18.0.0 installed

**Solution**:
```bash
# Check current version
node --version

# Update Node.js (using nvm recommended)
nvm install 18
nvm use 18

# Verify
node --version  # Should be v18+

# Run setup
npx mayor-west-mode setup
```

### Problem: Permission denied when installing globally

**Cause**: npm permissions issue

**Solution**:
```bash
# Option 1: Use sudo (not recommended)
sudo npm install -g mayor-west-mode

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Then install
npm install -g mayor-west-mode
```

---

## Advanced Usage

### Custom Configuration per Repository

Different repos can have different settings:

```bash
# In repo-A (simple projects)
npx mayor-west-mode setup
# Choose: Minimal Setup, 10 iterations

# In repo-B (complex projects)
npx mayor-west-mode setup
# Choose: Full Setup, 25 iterations
```

### Integration with CI/CD

Verify setup in CI pipeline:

```yaml
# .github/workflows/verify-setup.yml
name: Verify Mayor West Setup

on: [push]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npx mayor-west-mode verify
```

### Automating Across Multiple Repos

Setup multiple repos at once:

```bash
#!/bin/bash

for repo in repo-a repo-b repo-c; do
  cd ~/projects/$repo
  echo "Setting up $repo..."
  npx mayor-west-mode setup --type full
  git add .vscode .github
  git commit -m "Mayor West Mode: Add autonomous workflows"
  git push origin main
done
```

### Custom Installation via GitHub

Clone from GitHub instead of NPM:

```bash
git clone https://github.com/yourusername/mayor-west-mode.git
cd mayor-west-mode
npm install
npm link

# Now available globally
mayor-west-mode setup
```

---

## Support & Resources

**Getting Help**:
- `npx mayor-west-mode help` - Show help
- `npx mayor-west-mode examples` - Show examples
- `npx mayor-west-mode status` - Show current status

**Full Documentation**:
- TRD (Technical Requirements Document)
- README with detailed architecture
- GitHub issues for bug reports

**Community**:
- GitHub Discussions for questions
- Issues for bug reports
- Contributions welcome!

---

## Changelog

### v1.0.0 (January 14, 2026)
- ✅ Initial release
- ✅ Full setup wizard
- ✅ Verification checks
- ✅ Examples and best practices
- ✅ Multiple installation methods
- ✅ Error handling and recovery

---

## License

MIT - Use freely in your projects

---

**Ready to activate Mayor West Mode?**

```bash
npx mayor-west-mode setup
```

**Remember**: *"I don't ask for permission. I execute with confidence. I iterate when I fail. I deliver results through unconventional means."* — Mayor West

---

*Last updated: January 14, 2026*  
*Mayor West Mode v1.0.0 - Production Ready*
