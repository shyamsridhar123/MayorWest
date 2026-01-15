# Autonomous Repository Health Audit Feature

## Overview

The **Autonomous Repository Health Audit** is a fully autonomous feature that scans repositories for common quality issues, technical debt, and improvement opportunities. It automatically generates mayor-task issues that can be picked up by Copilot for autonomous fixing.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. Audit Command Runs                                      │
│     (Manual: `npx mayor-west-mode audit`)                  │
│     (Scheduled: GitHub Actions - Weekly)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Repository Scan                                         │
│     - Missing documentation (README, LICENSE)               │
│     - Missing test infrastructure                           │
│     - Missing package.json scripts                          │
│     - Missing .gitignore                                    │
│     - Outdated dependencies                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Generate Findings                                       │
│     Each finding includes:                                  │
│     - Severity (high/medium/low)                            │
│     - Category (documentation/testing/etc.)                 │
│     - Description                                           │
│     - Acceptance criteria (checklist)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Create GitHub Issues                                    │
│     - Issues tagged with: mayor-task, audit, automated      │
│     - Ready for Copilot to pick up and fix                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Orchestrator Assigns to Copilot                         │
│     - Mayor West Orchestrator finds unassigned tasks        │
│     - Copilot implements fixes autonomously                 │
│     - PRs auto-merge when checks pass                       │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Manual Audit

Run an audit anytime with:

```bash
npx mayor-west-mode audit
```

The command will:
1. Scan your repository for issues
2. Display findings with severity levels
3. Prompt you to create GitHub issues
4. Generate issue templates in `.mayor-west-audit/`

### Autonomous Scheduled Audit

The audit can run completely autonomously via GitHub Actions:

1. **Setup** (one-time):
   ```bash
   npx mayor-west-mode setup
   # Choose "Full Setup" to include the audit workflow
   ```

2. **The workflow runs automatically**:
   - **Schedule**: Every Sunday at midnight UTC
   - **Manual trigger**: GitHub Actions → "Mayor West Autonomous Audit" → Run workflow

3. **Fully autonomous operation**:
   - Scans repository
   - Creates GitHub issues automatically
   - No human intervention required

## Audit Checks

### 1. Documentation (High Priority)
- **Missing README.md**: Creates task to add project documentation
- **Missing LICENSE**: Creates task to add open source license

### 2. Testing (High Priority)
- **Missing test infrastructure**: Creates task to set up testing framework
- **No test files**: Creates task to write initial tests

### 3. Build Tooling (Medium Priority)
- **Missing package.json scripts**: Creates tasks to add `test`, `lint`, `build` scripts

### 4. Configuration (Medium Priority)
- **Missing .gitignore**: Creates task to add gitignore with common patterns

### 5. Dependencies (Low Priority)
- **No dependencies defined**: Creates task to review dependency needs

## Issue Format

Each audit finding generates a GitHub issue with:

```markdown
## Audit Finding: <category>

**Priority**: HIGH/MEDIUM/LOW

**Description**:
Clear description of the issue

## Acceptance Criteria

- [ ] Specific action item 1
- [ ] Specific action item 2
- [ ] Specific action item 3

## Technical Notes

This issue was automatically generated by the Mayor West Mode audit system.

**Category**: <category>
**Severity**: <severity>

## Definition of Done

Task is complete when:
- [ ] All acceptance criteria are met
- [ ] Changes are tested
- [ ] Code passes linting
- [ ] PR is merged

---
*Generated by: mayor-west-mode audit @ <timestamp>*
```

## Complete Autonomous Workflow

Here's how everything works together:

1. **Sunday midnight**: Audit workflow runs automatically
2. **Findings detected**: Issues created with `mayor-task` label
3. **Every 15 minutes**: Orchestrator checks for unassigned tasks
4. **Copilot assigned**: Picks up first task and implements fix
5. **Tests run**: Copilot verifies implementation locally (YOLO mode)
6. **PR created**: Copilot pushes changes, PR auto-created
7. **Auto-merge**: When checks pass, PR merges automatically
8. **Loop repeats**: Next task assigned, process continues

**Result**: Repository gradually improves itself with zero human intervention! 🤖

## Configuration

### Workflow Schedule

Edit `.github/workflows/mayor-west-audit.yml` to change the schedule:

```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday at midnight
    # Change to:
    # - cron: '0 0 * * *'  # Daily at midnight
    # - cron: '0 0 1 * *'  # Monthly on 1st at midnight
```

### Disable Autonomous Issue Creation

If you want audits without automatic issue creation:

1. Run manually: `npx mayor-west-mode audit`
2. Review findings locally
3. Decline issue creation prompt
4. Manually create issues as needed

## Safety Features

1. **Non-destructive**: Audit only reads files, never modifies
2. **Opt-in automation**: Autonomous issue creation requires workflow setup
3. **Human oversight**: Review issues before Copilot picks them up
4. **Issue labels**: All audit issues tagged `automated` for easy filtering
5. **Cleanup**: Audit artifacts automatically removed after processing

## Example Output

```bash
$ npx mayor-west-mode audit

━━━ Repository Health Audit ━━━

Scanning repository for quality improvements and technical debt...

✔ Running audit checks...

─────────────────────────────────────────────────────────────

Found 3 improvements:

1. [HIGH] Missing test infrastructure
   Category: testing
   Repository lacks test files or test directory structure

2. [MEDIUM] Missing package.json scripts
   Category: build-tooling
   Package.json lacks standard scripts: test, lint

3. [LOW] Missing LICENSE file
   Category: legal
   Repository lacks a license file, which clarifies usage rights

─────────────────────────────────────────────────────────────

? Create mayor-task GitHub issues for these findings? (Y/n)
```

## Benefits

### For Development Teams
- **Proactive quality**: Issues identified before they become problems
- **Reduced manual overhead**: No need to manually track technical debt
- **Consistent standards**: Automated enforcement of best practices

### For Open Source Projects
- **Always improving**: Repository quality increases over time
- **New contributor friendly**: Documentation and tests maintained automatically
- **Professional appearance**: License, README, tests always present

### For Solo Developers
- **Set and forget**: Weekly audits run while you sleep
- **Focus on features**: Infrastructure tasks handled autonomously
- **Best practices**: Learn from automated suggestions

## Advanced Usage

### Custom Audit Checks

Future versions will support custom audit rules. For now, you can:

1. Fork the repo
2. Edit `runAuditFlow()` in `cli.js`
3. Add your custom audit checks
4. Publish as your own CLI tool

### Integration with CI/CD

Add audit as a CI check:

```yaml
# .github/workflows/ci.yml
- name: Run Audit
  run: |
    npx mayor-west-mode audit
    if [ -d ".mayor-west-audit" ]; then
      echo "::warning::Audit findings detected"
    fi
```

### Metrics and Reporting

Track audit trends over time:

```bash
# Run audit monthly, save results
npx mayor-west-mode audit > audit-$(date +%Y-%m).txt
```

## Troubleshooting

### Issue: Audit workflow not running

**Solution**: 
- Check workflow is enabled: GitHub → Actions → Enable workflow
- Verify schedule trigger is correct
- Run manually to test: Actions → Mayor West Autonomous Audit → Run workflow

### Issue: Issues not being created

**Solution**:
- Verify `issues: write` permission in workflow
- Check GitHub token has correct scopes
- Review Actions logs for errors

### Issue: Too many audit findings

**Solution**:
- Fix high-priority issues first
- Adjust audit checks in CLI code
- Disable certain categories if not relevant

## Future Enhancements

Planned features:
- [ ] Configurable audit rules (`.mayorwest-audit.config.js`)
- [ ] Custom severity thresholds
- [ ] Audit reports with trends
- [ ] Integration with code quality tools (ESLint, SonarQube)
- [ ] Security vulnerability scanning
- [ ] Performance benchmark audits
- [ ] Accessibility audits for web projects

## Philosophy

The autonomous audit embodies the Mayor West mindset:

> *"I don't wait for problems to become crises. I identify and fix them proactively, without asking permission."*

- **Eccentric Autonomy**: Runs on schedule without human intervention
- **Proactive Excellence**: Finds issues before they impact development
- **Continuous Improvement**: Repository quality increases incrementally
- **Unwavering Confidence**: Creates tasks knowing Copilot will fix them

---

**Ready to try autonomous audits?**

```bash
npx mayor-west-mode setup  # Include audit workflow
npx mayor-west-mode audit  # Run your first audit
```

*Mayor West Mode Autonomous Audit - Always improving, never asking permission.*
