# Custom Policy System - Technical Design Document

**Version**: 1.0  
**Date**: January 2026  
**Status**: Design Phase  

---

## Executive Summary

This document specifies the design for a **Custom Policy System** for Mayor West Mode that allows repository owners to define fine-grained rules controlling what Copilot can and cannot do during autonomous task execution.

The policy system extends the existing 4-layer security architecture with configurable, declarative policies that work within GitHub and GitHub Copilot's constraints.

---

## 1. Motivation

### Current State

Mayor West Mode has a fixed security model:
- **Layer 1**: Actor allowlist (CODEOWNERS)
- **Layer 2**: Protected paths (hardcoded in mayor-west.yml)
- **Layer 3**: Kill switch (enable/disable all)
- **Layer 4**: Audit trail

**Limitations:**
- Protected paths are static - can't add new paths without editing YAML manually
- No file-type restrictions (e.g., "allow .ts changes but not .sql")
- No command-level policies beyond VS Code YOLO settings
- No dependency control (Copilot can add any npm package)
- No code quality gates (coverage, complexity, test requirements)

### Desired State

Repository owners should be able to:
1. Define custom file patterns Copilot can/cannot modify
2. Add project-specific command restrictions
3. Enforce code quality policies (test coverage, linting rules)
4. Control dependency additions (whitelist/blacklist packages)
5. Define PR requirements (labels, reviewers, description format)
6. Override policies for specific issues (escape hatch)

---

## 2. Architecture

### 2.1 Policy File Structure

**Location**: `.github/mayor-west-policies.yml`

**Schema**:
```yaml
version: 1.0
enabled: true  # Global policy enable/disable

# Policy categories
policies:
  # File modification policies
  files:
    allowed_patterns:
      - "src/**/*.ts"
      - "tests/**/*.test.ts"
      - "README.md"
    
    blocked_patterns:
      - ".github/workflows/**"
      - "package.json"
      - "**/*.sql"
      - "**/migrations/**"
    
    max_files_per_pr: 20
    max_lines_per_file: 500
  
  # Command policies (extends YOLO settings)
  commands:
    allowed:
      - pattern: "^npm\\s+(test|run\\s+test)"
        description: "Running tests"
      - pattern: "^git\\s+(commit|push)"
        description: "Git operations"
    
    blocked:
      - pattern: "^npm\\s+publish"
        reason: "Package publishing requires manual approval"
      - pattern: "^docker"
        reason: "Container operations not allowed"
  
  # Code quality policies
  quality:
    required_checks:
      - name: "tests"
        command: "npm test"
        must_pass: true
      
      - name: "lint"
        command: "npm run lint"
        must_pass: true
      
      - name: "coverage"
        command: "npm run coverage"
        must_pass: true
        min_coverage: 80  # Percentage
    
    complexity:
      max_cyclomatic_complexity: 10
      max_function_length: 50
  
  # Dependency policies
  dependencies:
    mode: "whitelist"  # or "blacklist" or "approval_required"
    
    whitelist:
      npm:
        - "lodash"
        - "axios"
        - "@types/*"
      pip:
        - "requests"
        - "pytest"
    
    blacklist:
      npm:
        - "left-pad"  # Historical security concerns
        - "*crypto*"   # Requires security review
    
    approval_required:
      - condition: "new_dependency"
        label: "dependencies"
        notify: "@security-team"
  
  # Commit policies
  commits:
    format:
      pattern: "^\\[MAYOR\\]\\s+.{10,100}$"
      example: "[MAYOR] Add user authentication flow"
    
    max_size: 1000  # Max lines changed per commit
    
    required_trailer:
      pattern: "^Fixes\\s+#\\d+$"
      example: "Fixes #42"
  
  # Pull Request policies
  pull_requests:
    title:
      pattern: "^\\[MAYOR\\]\\s+.+"
      example: "[MAYOR] Implement feature X"
    
    description:
      required_sections:
        - "## Changes"
        - "## Testing"
        - "## Fixes #"
    
    required_labels:
      - "mayor-task"
    
    auto_add_labels:
      - condition: "files_changed > 10"
        label: "large-change"
      - condition: "has_dependency_change"
        label: "dependencies"
    
    required_reviewers:
      - condition: "touches_security_files"
        reviewers: ["@security-team"]
      - condition: "dependency_added"
        reviewers: ["@tech-lead"]
  
  # Override mechanism
  overrides:
    # Issues with these labels bypass ALL policies
    bypass_labels:
      - "emergency"
      - "hotfix"
    
    # Issues with these labels bypass specific policy categories
    partial_bypass:
      - label: "skip-coverage"
        bypasses: ["quality.coverage"]
      - label: "large-refactor"
        bypasses: ["files.max_files_per_pr", "commits.max_size"]

# Policy metadata
metadata:
  last_updated: "2026-01-17"
  owner: "@tech-lead"
  documentation: "https://github.com/your-org/your-repo/wiki/Policies"
```

### 2.2 Policy Enforcement Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Policy Enforcement Flow                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  1. Issue Created with mayor-task label                  │
│     └─→ Check for override labels (bypass, skip-*)       │
│                                                           │
│  2. Orchestrator Assigns Copilot                         │
│     └─→ Inject active policies into agent instructions   │
│                                                           │
│  3. Copilot Plans Changes                                │
│     └─→ Validate against file policies                   │
│     └─→ Validate against command policies                │
│                                                           │
│  4. Copilot Runs Tests/Lint                              │
│     └─→ Enforce quality policies                         │
│                                                           │
│  5. Copilot Creates PR                                   │
│     └─→ Validate PR title/description format             │
│     └─→ Check dependency changes                         │
│     └─→ Add auto-labels based on conditions              │
│     └─→ Request reviewers based on policies              │
│                                                           │
│  6. Auto-Merge Workflow Runs                             │
│     └─→ Final policy validation gate                     │
│     └─→ Generate policy compliance report                │
│     └─→ Allow/block merge based on policies              │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

### 2.3 GitHub Actions Workflow Integration

#### New Workflow: `.github/workflows/mayor-west-policy-validation.yml`

```yaml
name: Mayor West Policy Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]
  pull_request_target:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write
  issues: read

jobs:
  validate-policies:
    runs-on: ubuntu-latest
    if: github.actor == 'copilot-swe-agent' || github.actor == 'copilot' || github.actor == 'copilot[bot]'
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install Mayor West CLI
        run: npm install -g mayor-west-mode
      
      - name: Load Policy File
        id: load_policies
        run: |
          if [ -f .github/mayor-west-policies.yml ]; then
            echo "policies_exist=true" >> $GITHUB_OUTPUT
          else
            echo "policies_exist=false" >> $GITHUB_OUTPUT
            echo "No policy file found, skipping validation"
            exit 0
          fi
      
      - name: Validate PR Against Policies
        if: steps.load_policies.outputs.policies_exist == 'true'
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const yaml = require('js-yaml');
            
            // Load policies
            const policyFile = fs.readFileSync('.github/mayor-west-policies.yml', 'utf8');
            const policies = yaml.load(policyFile);
            
            if (!policies.enabled) {
              console.log('Policies are disabled globally');
              return { passed: true, reason: 'Policies disabled' };
            }
            
            // Get PR details
            const pr = context.payload.pull_request;
            const { data: files } = await github.rest.pulls.listFiles({
              owner: context.repo.owner,
              repo: context.repo.repo,
              pull_number: pr.number
            });
            
            // Check for override labels
            const labels = pr.labels.map(l => l.name);
            const hasBypass = policies.overrides?.bypass_labels?.some(l => labels.includes(l));
            
            if (hasBypass) {
              console.log('🚨 Policy bypass detected via label');
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: pr.number,
                body: '⚠️ **Policy Bypass Active**: This PR has a bypass label. All policies are skipped.'
              });
              return { passed: true, reason: 'Bypass label present' };
            }
            
            // Validate file policies
            const violations = [];
            
            // 1. Check blocked patterns
            if (policies.policies?.files?.blocked_patterns) {
              const blockedPatterns = policies.policies.files.blocked_patterns;
              for (const file of files) {
                for (const pattern of blockedPatterns) {
                  const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'));
                  if (regex.test(file.filename)) {
                    violations.push(`❌ File ${file.filename} matches blocked pattern: ${pattern}`);
                  }
                }
              }
            }
            
            // 2. Check max files per PR
            if (policies.policies?.files?.max_files_per_pr) {
              const maxFiles = policies.policies.files.max_files_per_pr;
              if (files.length > maxFiles) {
                violations.push(`❌ Too many files changed: ${files.length} > ${maxFiles}`);
              }
            }
            
            // 3. Check PR title format
            if (policies.policies?.pull_requests?.title?.pattern) {
              const titlePattern = new RegExp(policies.policies.pull_requests.title.pattern);
              if (!titlePattern.test(pr.title)) {
                violations.push(`❌ PR title doesn't match required format: ${policies.policies.pull_requests.title.example}`);
              }
            }
            
            // 4. Check for dependency changes
            const hasDependencyChange = files.some(f => 
              f.filename === 'package.json' || 
              f.filename === 'requirements.txt' ||
              f.filename.endsWith('package-lock.json')
            );
            
            if (hasDependencyChange && policies.policies?.dependencies?.approval_required) {
              violations.push(`⚠️  Dependency changes detected - requires review from ${policies.policies.dependencies.approval_required[0]?.notify}`);
            }
            
            // Generate report
            const passed = violations.length === 0;
            const reportLines = [
              '## 🔍 Policy Validation Report',
              '',
              `**Status**: ${passed ? '✅ PASSED' : '❌ FAILED'}`,
              '',
              `**Files Changed**: ${files.length}`,
              `**Policy File**: .github/mayor-west-policies.yml`,
              `**Bypass Labels**: ${hasBypass ? 'Yes' : 'No'}`,
              ''
            ];
            
            if (violations.length > 0) {
              reportLines.push('### Violations');
              reportLines.push('');
              violations.forEach(v => reportLines.push(v));
              reportLines.push('');
              reportLines.push('**Actions Required**:');
              reportLines.push('- Fix the violations listed above');
              reportLines.push('- OR add a bypass label if this is an emergency');
              reportLines.push('- OR request policy exception from @tech-lead');
            } else {
              reportLines.push('✅ All policies satisfied!');
            }
            
            // Post comment
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: pr.number,
              body: reportLines.join('\n')
            });
            
            // Set status
            if (!passed) {
              core.setFailed('Policy validation failed');
            }
            
            return { passed, violations };
```

#### Update Orchestrator Workflow

Inject policies into Copilot's context:

```yaml
# In .github/workflows/mayor-west-orchestrator.yml
# After assigning Copilot, add policy injection step:

- name: Inject Policies into Issue Context
  uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.GH_AW_AGENT_TOKEN || secrets.GITHUB_TOKEN }}
    script: |
      const fs = require('fs');
      const taskNumber = ${{ steps.find_task.outputs.task_number }};
      
      // Check if policies exist
      if (!fs.existsSync('.github/mayor-west-policies.yml')) {
        console.log('No policy file found, skipping injection');
        return;
      }
      
      const policyContent = fs.readFileSync('.github/mayor-west-policies.yml', 'utf8');
      
      // Post as comment
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: taskNumber,
        body: `## 📋 Active Policies

**@copilot-swe-agent** - You must follow these policies:

\`\`\`yaml
${policyContent}
\`\`\`

**Key rules:**
- Only modify files matching allowed patterns
- All quality checks must pass
- Follow commit message format
- Include required PR sections

**Violations will block auto-merge.**`
      });
```

---

## 3. CLI Integration

### 3.1 New Command: `npx mayor-west-mode policy`

#### Subcommands:

```bash
# Initialize policy file with defaults
npx mayor-west-mode policy init

# Validate policy syntax
npx mayor-west-mode policy validate

# Test policies against a hypothetical change
npx mayor-west-mode policy test --files "src/auth.ts,package.json"

# List all active policies
npx mayor-west-mode policy list

# Show policy for specific category
npx mayor-west-mode policy show files
npx mayor-west-mode policy show dependencies

# Dry-run mode - show what would be blocked
npx mayor-west-mode policy dry-run --pr-number 42
```

### 3.2 Template Generation

Add policy initialization to setup wizard:

```javascript
// In cli.js runSetupFlow()
const policyAnswers = await inquirer.prompt([
  {
    type: 'confirm',
    name: 'createPolicies',
    message: 'Create a custom policy file?',
    default: true,
  },
  {
    type: 'checkbox',
    name: 'policyCategories',
    message: 'Which policy categories do you want to enable?',
    choices: [
      { name: 'File modification policies', value: 'files', checked: true },
      { name: 'Command policies', value: 'commands', checked: true },
      { name: 'Code quality policies', value: 'quality', checked: false },
      { name: 'Dependency policies', value: 'dependencies', checked: false },
      { name: 'Commit format policies', value: 'commits', checked: true },
      { name: 'Pull request policies', value: 'pull_requests', checked: true },
    ],
    when: (answers) => answers.createPolicies,
  },
]);
```

### 3.3 Policy Template

```javascript
// In fileTemplates object
'.github/mayor-west-policies.yml': (options = {}) => {
  const categories = options.policyCategories || ['files', 'commits', 'pull_requests'];
  
  let template = `# Mayor West Mode - Custom Policies
# Documentation: https://github.com/your-org/mayor-west-mode/docs/policies

version: 1.0
enabled: true

policies:
`;

  if (categories.includes('files')) {
    template += `  # File modification policies
  files:
    allowed_patterns:
      - "src/**/*.ts"
      - "tests/**/*.test.ts"
      - "README.md"
    
    blocked_patterns:
      - ".github/workflows/**"
      - "package.json"
      - "**/*.sql"
    
    max_files_per_pr: 20
    max_lines_per_file: 500

`;
  }
  
  // ... more categories
  
  template += `# Override mechanism
overrides:
  bypass_labels:
    - "emergency"
    - "hotfix"
`;

  return template;
}
```

---

## 4. GitHub Constraints & Workarounds

### 4.1 Constraints

| Constraint | Impact | Workaround |
|------------|--------|------------|
| **No custom workflow inputs from issues** | Can't pass policy overrides directly | Use issue labels for overrides |
| **GraphQL API rate limits** | Policy validation calls cost quota | Cache policy results per PR |
| **CODEOWNERS only supports file paths** | Can't use CODEOWNERS for command policies | Implement in workflow validation |
| **Branch protection is binary** | Can't conditionally require checks | Use workflow status checks |
| **Can't modify PR from PR target context** | Policy auto-labels tricky | Use separate workflow run |

### 4.2 Solutions

#### Rate Limit Management
```javascript
// Cache policy validation results
const cacheKey = `policy-validation-${pr.number}-${pr.head.sha}`;
// Store in PR comments with specific format for retrieval
```

#### Label-Based Overrides
```yaml
# Issue labels as policy escape hatches
labels:
  - "emergency"        # Bypass ALL policies
  - "skip-coverage"    # Bypass only coverage requirement
  - "large-refactor"   # Bypass file count limits
```

#### Conditional Status Checks
```yaml
# Make policy validation a required status check
# If it fails, auto-merge is blocked by GitHub
required_status_checks:
  strict: true
  contexts:
    - "Mayor West Policy Validation"
```

---

## 5. Copilot Integration

### 5.1 Agent Instructions Update

Update `.github/copilot/instructions.md` to include:

```markdown
## Policy Awareness

**CRITICAL**: This repository has custom policies defined in `.github/mayor-west-policies.yml`.

### Before Making Changes

1. **Read the policy file** - It will be posted in your assigned issue
2. **Validate file patterns** - Only modify allowed files
3. **Check quality requirements** - Run all required checks
4. **Follow commit format** - Match the required pattern
5. **Include PR sections** - Add all required description sections

### If Policy Blocks You

- Check issue labels for bypass options
- If truly stuck, comment on the issue asking for human intervention
- DO NOT attempt to modify policy files yourself

### Policy Violations

Violations will:
- Block auto-merge
- Require human review
- Generate audit trail
```

### 5.2 Runtime Policy Injection

When orchestrator assigns a task:
1. Read `.github/mayor-west-policies.yml`
2. Extract relevant rules for this task
3. Post as issue comment
4. Copilot reads and follows

---

## 6. Migration Path

### For Existing Repos

```bash
# Step 1: Generate policy file from existing config
npx mayor-west-mode policy migrate

# Step 2: Review and edit the generated policy file
vim .github/mayor-west-policies.yml

# Step 3: Validate syntax
npx mayor-west-mode policy validate

# Step 4: Dry-run test
npx mayor-west-mode policy dry-run --test-mode

# Step 5: Commit and enable
git add .github/mayor-west-policies.yml
git commit -m "[MAYOR] Add custom policy file"
git push
```

### For New Repos

Policies are created during `setup` wizard with sensible defaults.

---

## 7. Testing Strategy

### 7.1 Unit Tests

```javascript
// tests/policy-parser.test.js
describe('Policy Parser', () => {
  test('parses valid policy file', () => {
    const yaml = `
      version: 1.0
      policies:
        files:
          blocked_patterns:
            - "**/*.sql"
    `;
    const parsed = parsePolicyFile(yaml);
    expect(parsed.policies.files.blocked_patterns).toContain('**/*.sql');
  });
  
  test('rejects invalid schema', () => {
    const yaml = `invalid: yaml: structure`;
    expect(() => parsePolicyFile(yaml)).toThrow();
  });
});

// tests/policy-validator.test.js
describe('Policy Validator', () => {
  test('blocks files matching blocked patterns', () => {
    const policies = { files: { blocked_patterns: ['**/*.sql'] } };
    const files = [{ filename: 'migrations/001_init.sql' }];
    const result = validateFiles(files, policies);
    expect(result.passed).toBe(false);
    expect(result.violations).toContain('001_init.sql matches blocked pattern');
  });
});
```

### 7.2 Integration Tests

```yaml
# .github/workflows/test-policies.yml
name: Test Policy Validation

on:
  push:
    paths:
      - '.github/mayor-west-policies.yml'
      - '.github/workflows/mayor-west-policy-validation.yml'

jobs:
  test-policy-scenarios:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        scenario:
          - name: "allowed-file-change"
            files: ["src/index.ts"]
            should_pass: true
          
          - name: "blocked-workflow-change"
            files: [".github/workflows/test.yml"]
            should_pass: false
          
          - name: "too-many-files"
            files: ["src/file1.ts", "src/file2.ts", ..., "src/file25.ts"]
            should_pass: false
    
    steps:
      - uses: actions/checkout@v4
      - name: Test Policy Scenario
        run: |
          npx mayor-west-mode policy test \
            --files "${{ join(matrix.scenario.files, ',') }}" \
            --expect-pass=${{ matrix.scenario.should_pass }}
```

### 7.3 E2E Tests

```javascript
// e2e/policy-enforcement.test.js
describe('E2E Policy Enforcement', () => {
  test('blocked file change prevents merge', async () => {
    // 1. Create issue
    const issue = await createMayorTaskIssue({
      title: '[MAYOR] Modify SQL schema',
      files: ['migrations/001.sql']
    });
    
    // 2. Trigger orchestrator
    await triggerOrchestrator();
    
    // 3. Wait for Copilot PR
    const pr = await waitForPR(issue.number);
    
    // 4. Check policy validation failed
    const checks = await getPRChecks(pr.number);
    expect(checks['Mayor West Policy Validation'].conclusion).toBe('failure');
    
    // 5. Verify auto-merge was blocked
    await sleep(60000); // Wait 1 minute
    const prStatus = await getPR(pr.number);
    expect(prStatus.merged).toBe(false);
  });
});
```

---

## 8. Rollout Plan

### Phase 1: Foundation (Week 1-2)
- [ ] Implement policy parser
- [ ] Create policy validation workflow
- [ ] Add CLI `policy` command
- [ ] Write unit tests

### Phase 2: Integration (Week 3-4)
- [ ] Update orchestrator workflow
- [ ] Update agent instructions
- [ ] Add policy injection logic
- [ ] Write integration tests

### Phase 3: Documentation (Week 5)
- [ ] Write policy guide
- [ ] Create migration guide
- [ ] Add examples for common policies
- [ ] Record video tutorials

### Phase 4: Beta Testing (Week 6)
- [ ] Deploy to 3-5 test repos
- [ ] Gather feedback
- [ ] Fix issues
- [ ] Refine documentation

### Phase 5: General Availability (Week 7-8)
- [ ] Announce feature
- [ ] Add to default setup wizard
- [ ] Monitor adoption
- [ ] Iterate based on feedback

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Adoption Rate** | 30% of users add policies | Track policy file presence in repos |
| **Policy Violations Caught** | >50 violations prevented per month | Count workflow blocks |
| **False Positives** | <5% of blocks are incorrect | Survey users on blocked PRs |
| **Time to Configure** | <10 minutes | Track setup wizard completion time |
| **Documentation Clarity** | >4.5/5 rating | User feedback surveys |

---

## 10. Future Enhancements

### v2.0 Features

1. **Policy Templates Library**
   - Pre-built policies for common tech stacks
   - React, Node, Python, Go templates
   - Security-focused templates

2. **Policy Composition**
   - Import policies from other files
   - Reusable policy snippets
   - Organization-level default policies

3. **Machine Learning Integration**
   - Learn common violation patterns
   - Suggest policy improvements
   - Predict likely violations

4. **Policy Marketplace**
   - Share policies with community
   - Rate and review policies
   - Install policies with one command

5. **Advanced Override Logic**
   - Time-based overrides (emergency windows)
   - User-based overrides (admin can bypass)
   - Conditional overrides (if X then allow Y)

---

## 11. Alternatives Considered

| Alternative | Pros | Cons | Decision |
|-------------|------|------|----------|
| **JSON Schema** | Strong validation, IDE support | More verbose, less readable | ❌ Rejected - YAML more user-friendly |
| **JavaScript Policies** | Programmable, flexible | Security risk, complex | ❌ Rejected - Too dangerous |
| **Separate Policy Service** | Centralized, scalable | Additional infrastructure | ❌ Rejected - Too complex for v1 |
| **GitHub Rulesets** | Native GitHub feature | Limited to branch protection | ⚠️ Partial - Use for some checks |
| **YAML Policies (Chosen)** | Declarative, simple, readable | Less flexible than code | ✅ **Selected** |

---

## 12. Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Policy parsing errors block all tasks** | Medium | High | Validate policies on commit, fail gracefully |
| **Performance degradation from validation** | Low | Medium | Cache validation results, optimize checks |
| **Users create overly restrictive policies** | High | Medium | Provide sensible defaults, warn on strict policies |
| **Policy bypass vulnerabilities** | Low | High | Audit bypass labels, require justification |
| **GitHub API rate limits** | Medium | Medium | Implement exponential backoff, cache aggressively |

---

## 13. References

- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [YAML Schema](https://yaml.org/spec/1.2.2/)
- [Glob Patterns](https://en.wikipedia.org/wiki/Glob_(programming))
- [Mayor West Mode TRD](./mayor_west_mode_trd.md)

---

## Appendix A: Policy Examples

### Example 1: Strict Security Policy

```yaml
version: 1.0
enabled: true

policies:
  files:
    blocked_patterns:
      - ".github/workflows/**"
      - "**/secrets/**"
      - "**/*.pem"
      - "**/*.key"
    max_files_per_pr: 5
  
  dependencies:
    mode: "approval_required"
    approval_required:
      - condition: "new_dependency"
        notify: "@security-team"
        label: "security-review"
  
  quality:
    required_checks:
      - name: "security-scan"
        command: "npm audit"
        must_pass: true
      - name: "coverage"
        min_coverage: 90

overrides:
  bypass_labels: []  # No bypasses allowed
```

### Example 2: Flexible Development Policy

```yaml
version: 1.0
enabled: true

policies:
  files:
    allowed_patterns:
      - "src/**"
      - "tests/**"
      - "docs/**"
    max_files_per_pr: 50
  
  quality:
    required_checks:
      - name: "tests"
        command: "npm test"
        must_pass: true
    complexity:
      max_cyclomatic_complexity: 15

overrides:
  bypass_labels:
    - "emergency"
    - "quick-fix"
  partial_bypass:
    - label: "wip"
      bypasses: ["quality"]
```

---

**END OF DESIGN DOCUMENT**
