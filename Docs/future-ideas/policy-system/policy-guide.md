# Mayor West Mode - Custom Policy Guide

> **For Repository Owners**: Learn how to configure fine-grained control over what Copilot can and cannot do.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Policy Categories](#policy-categories)
3. [Common Patterns](#common-patterns)
4. [Override Mechanism](#override-mechanism)
5. [Testing Policies](#testing-policies)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## Quick Start

### Create Your First Policy File

```bash
# Initialize with wizard
npx mayor-west-mode setup

# Or create manually
npx mayor-west-mode policy init

# This creates: .github/mayor-west-policies.yml
```

### Basic Policy Structure

```yaml
version: 1.0
enabled: true

policies:
  files:
    allowed_patterns:
      - "src/**/*.ts"     # Allow TypeScript in src/
      - "tests/**/*.ts"   # Allow test files
    
    blocked_patterns:
      - "**/*.sql"        # Block SQL files
      - ".github/**"      # Block CI config

  commits:
    format:
      pattern: "^\\[MAYOR\\]\\s+.{10,100}$"
      example: "[MAYOR] Add authentication"

overrides:
  bypass_labels:
    - "emergency"         # Skip all policies
```

### Enable Policy Enforcement

Policies are automatically enforced once the file exists. No additional configuration needed!

---

## Policy Categories

### 1. File Policies

Control which files Copilot can modify.

```yaml
policies:
  files:
    # ✅ Allowed patterns (whitelist)
    allowed_patterns:
      - "src/**/*.ts"              # All TypeScript in src/
      - "src/**/*.tsx"             # All React components
      - "tests/**/*.test.ts"       # All test files
      - "README.md"                # Root README only
      - "docs/**/*.md"             # All markdown in docs/
    
    # ❌ Blocked patterns (blacklist)
    # Takes precedence over allowed_patterns
    blocked_patterns:
      - ".github/workflows/**"     # Protect CI/CD
      - "package.json"             # Protect dependencies
      - "package-lock.json"        # Protect lock file
      - "**/*.sql"                 # No database changes
      - "**/migrations/**"         # No migrations
      - "**/.env*"                 # No env files
      - "**/secrets/**"            # No secrets
    
    # Limits
    max_files_per_pr: 20           # Max files in one PR
    max_lines_per_file: 500        # Max lines changed per file
```

**Pattern Syntax:**
- `**` = any number of directories
- `*` = any characters except `/`
- `*.ts` = files ending in .ts
- `src/**/*.ts` = all .ts files under src/, any depth

### 2. Command Policies

Extend YOLO terminal auto-approval rules.

```yaml
policies:
  commands:
    # ✅ Allowed commands (auto-approved)
    allowed:
      - pattern: "^npm\\s+(test|run\\s+test)"
        description: "Running tests"
      
      - pattern: "^git\\s+(commit|push|status|diff)"
        description: "Safe git operations"
      
      - pattern: "^npm\\s+run\\s+(lint|format|build)"
        description: "Code quality tools"
    
    # ❌ Blocked commands (never approved)
    blocked:
      - pattern: "^npm\\s+publish"
        reason: "Publishing requires manual approval"
      
      - pattern: "^docker"
        reason: "Container operations not allowed"
      
      - pattern: "^rm\\s+-rf"
        reason: "Destructive operation"
      
      - pattern: "^git\\s+push\\s+--force"
        reason: "Force push not allowed"
```

**Important**: Command policies work **in addition to** VS Code YOLO settings.

### 3. Code Quality Policies

Enforce testing and code standards.

```yaml
policies:
  quality:
    # Required checks that must pass
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
        min_coverage: 80              # Minimum 80%
      
      - name: "type-check"
        command: "tsc --noEmit"
        must_pass: true
    
    # Code complexity limits
    complexity:
      max_cyclomatic_complexity: 10   # Max complexity per function
      max_function_length: 50         # Max lines per function
      max_file_length: 300            # Max lines per file
```

### 4. Dependency Policies

Control package additions.

```yaml
policies:
  dependencies:
    # Mode: "whitelist", "blacklist", or "approval_required"
    mode: "approval_required"
    
    # ✅ Whitelist (only these allowed)
    whitelist:
      npm:
        - "lodash"
        - "axios"
        - "express"
        - "@types/*"                  # All @types packages
      pip:
        - "requests"
        - "pytest"
        - "django"
    
    # ❌ Blacklist (these forbidden)
    blacklist:
      npm:
        - "left-pad"                  # Historical issues
        - "*crypto*"                  # Requires security review
        - "node-forge"                # Known vulnerabilities
    
    # Approval workflow
    approval_required:
      - condition: "new_dependency"
        label: "dependencies"          # Add this label
        notify: "@tech-lead"           # Notify this person
      
      - condition: "major_version_bump"
        label: "breaking-change"
        notify: "@team"
```

**Modes Explained:**
- **whitelist**: Only listed packages allowed (strict)
- **blacklist**: All packages except listed allowed (permissive)
- **approval_required**: Any change needs review (moderate)

### 5. Commit Policies

Enforce commit message standards.

```yaml
policies:
  commits:
    # Format validation
    format:
      pattern: "^\\[MAYOR\\]\\s+.{10,100}$"
      example: "[MAYOR] Add user authentication"
    
    # Size limits
    max_size: 1000                    # Max lines changed per commit
    max_files: 10                     # Max files per commit
    
    # Required trailer (at end of message)
    required_trailer:
      pattern: "^Fixes\\s+#\\d+$"
      example: "Fixes #42"
```

**Valid Commit Example:**
```
[MAYOR] Implement OAuth2 authentication flow

- Add Google OAuth provider
- Implement session management
- Add tests for auth routes

Fixes #123
```

### 6. Pull Request Policies

Define PR requirements.

```yaml
policies:
  pull_requests:
    # Title validation
    title:
      pattern: "^\\[MAYOR\\]\\s+.+"
      example: "[MAYOR] Add feature X"
    
    # Description sections (must all be present)
    description:
      required_sections:
        - "## Changes"
        - "## Testing"
        - "## Fixes #"
    
    # Required labels
    required_labels:
      - "mayor-task"
    
    # Auto-add labels based on conditions
    auto_add_labels:
      - condition: "files_changed > 10"
        label: "large-change"
      
      - condition: "has_dependency_change"
        label: "dependencies"
      
      - condition: "touches_test_files"
        label: "tests"
    
    # Required reviewers based on conditions
    required_reviewers:
      - condition: "touches_security_files"
        reviewers: ["@security-team"]
      
      - condition: "dependency_added"
        reviewers: ["@tech-lead"]
      
      - condition: "files_changed > 20"
        reviewers: ["@senior-dev"]
```

**Valid PR Description Example:**
```markdown
# [MAYOR] Add user authentication

## Changes

- Implemented OAuth2 flow
- Added session management
- Updated user model

## Testing

- Added unit tests for auth module
- Added integration tests for login flow
- Tested with Google OAuth provider

## Fixes #123
```

---

## Override Mechanism

Sometimes you need to bypass policies (emergencies, hotfixes, special cases).

### Global Bypass

Skip **ALL** policies with a label:

```yaml
overrides:
  bypass_labels:
    - "emergency"
    - "hotfix"
    - "security-patch"
```

**Usage:**
1. Add label to issue: `emergency`
2. Copilot proceeds without policy checks
3. PR comment shows bypass was used
4. Audit trail preserved

### Partial Bypass

Skip **specific** policies with a label:

```yaml
overrides:
  partial_bypass:
    # Skip coverage requirement for prototypes
    - label: "prototype"
      bypasses: ["quality.coverage"]
    
    # Allow large refactors
    - label: "refactor"
      bypasses:
        - "files.max_files_per_pr"
        - "commits.max_size"
    
    # Skip linting for generated code
    - label: "generated-code"
      bypasses: ["quality.required_checks.lint"]
```

### When to Use Overrides

✅ **Good reasons:**
- Critical production bug fix
- Security vulnerability patch
- Infrastructure emergency
- Large-scale refactor
- Generated code (migrations, protobuf, etc.)

❌ **Bad reasons:**
- "Policy is annoying"
- "Don't have time"
- "Just this once"
- "I know better"

**Remember**: Every override is logged and auditable.

---

## Testing Policies

### Validate Syntax

```bash
# Check if policy file is valid YAML
npx mayor-west-mode policy validate

# Output:
# ✓ Policy file syntax is valid
# ✓ All required fields present
# ✓ No conflicting rules detected
```

### Test Against Hypothetical Changes

```bash
# Test if files would be allowed
npx mayor-west-mode policy test \
  --files "src/index.ts,package.json"

# Output:
# ✓ src/index.ts - ALLOWED (matches src/**/*.ts)
# ✗ package.json - BLOCKED (matches blocked pattern)
# 
# Result: FAILED - 1 violation
```

### Dry-Run on Existing PR

```bash
# Test policies against PR #42
npx mayor-west-mode policy dry-run --pr-number 42

# Output:
# PR #42: [MAYOR] Add authentication
# Files changed: 8
# 
# ✓ File policies: PASSED
# ✓ Commit format: PASSED
# ✗ Code coverage: FAILED (75% < 80%)
# 
# Violations: 1
# Action: Would block auto-merge
```

### List Active Policies

```bash
# Show all policies
npx mayor-west-mode policy list

# Show specific category
npx mayor-west-mode policy show files
npx mayor-west-mode policy show quality
```

---

## Troubleshooting

### Policy Validation Failed

**Symptom**: PR has "Policy Validation Failed" check

**Solution**:
1. Check PR comments for violation details
2. Fix the violations (e.g., remove blocked files)
3. Push fixes → validation re-runs automatically

**OR** add override label if legitimate:
```bash
gh issue edit 42 --add-label "skip-coverage"
```

### Too Restrictive

**Symptom**: Copilot can't complete any tasks

**Solution**:
```bash
# Temporarily disable policies
echo "enabled: false" >> .github/mayor-west-policies.yml

# Or add allowed patterns
vim .github/mayor-west-policies.yml
# Add: - "src/new-feature/**"
```

### Policies Not Enforced

**Symptom**: Copilot ignores policies

**Check**:
1. File exists: `.github/mayor-west-policies.yml`
2. Enabled: `enabled: true` in file
3. Workflow exists: `.github/workflows/mayor-west-policy-validation.yml`
4. Workflow enabled in GitHub Actions

### False Positives

**Symptom**: Valid changes blocked by policy

**Solutions**:
1. **Refine pattern**: Make `blocked_patterns` more specific
2. **Add exception**: Use `allowed_patterns` override
3. **Use bypass label**: Add `skip-<policy-name>` label

---

## Best Practices

### 1. Start Permissive, Then Tighten

```yaml
# Phase 1: Initial setup (permissive)
policies:
  files:
    blocked_patterns:
      - ".github/workflows/**"    # Only critical files

# Phase 2: After 1 week (moderate)
policies:
  files:
    blocked_patterns:
      - ".github/workflows/**"
      - "package.json"
      - "**/*.sql"
    max_files_per_pr: 50          # Generous limit

# Phase 3: After 1 month (strict)
policies:
  files:
    blocked_patterns:
      - ".github/workflows/**"
      - "package.json"
      - "**/*.sql"
      - "**/secrets/**"
    max_files_per_pr: 20          # Stricter limit
```

### 2. Document Your Policies

```yaml
policies:
  files:
    # WHY: Prevent accidental workflow changes that could break CI
    blocked_patterns:
      - ".github/workflows/**"
    
    # WHY: Large PRs are hard to review
    max_files_per_pr: 20
```

### 3. Review Policy Violations Weekly

```bash
# Find all blocked PRs this week
gh pr list --label "policy-violation" --state all

# Identify patterns
# - Are policies too strict?
# - Are there legitimate use cases?
# - Should we add bypass categories?
```

### 4. Use Semantic Bypass Labels

```yaml
overrides:
  partial_bypass:
    - label: "migration"       # Database migrations
      bypasses: ["files.blocked_patterns.sql"]
    
    - label: "deps-update"     # Dependency updates
      bypasses: ["dependencies"]
    
    - label: "ci-fix"          # Fix broken CI
      bypasses: ["files.blocked_patterns.workflows"]
```

### 5. Test Policies Locally First

```bash
# Before committing policy changes
npx mayor-west-mode policy validate
npx mayor-west-mode policy test --files "common-file.ts"

# Ensure no false positives
```

---

## Examples

### Example 1: Strict Security Repository

```yaml
version: 1.0
enabled: true

policies:
  files:
    allowed_patterns:
      - "src/**/*.ts"
      - "tests/**/*.test.ts"
    blocked_patterns:
      - ".github/**"
      - "**/secrets/**"
      - "**/*.pem"
      - "**/*.key"
      - "package.json"
      - "**/migrations/**"
    max_files_per_pr: 5

  dependencies:
    mode: "approval_required"
    approval_required:
      - condition: "new_dependency"
        label: "security-review"
        notify: "@security-team"

  quality:
    required_checks:
      - name: "tests"
        must_pass: true
      - name: "security-scan"
        command: "npm audit"
        must_pass: true
      - name: "coverage"
        min_coverage: 90

  commits:
    format:
      pattern: "^\\[MAYOR\\]\\s+.{10,100}$"
    max_size: 500

overrides:
  # No blanket bypasses
  partial_bypass:
    - label: "security-hotfix"
      bypasses: ["commits.max_size"]
      # Still requires security review
```

### Example 2: Fast-Moving Startup

```yaml
version: 1.0
enabled: true

policies:
  files:
    blocked_patterns:
      - ".github/workflows/**"  # Protect CI only
    max_files_per_pr: 100       # Large changes OK

  quality:
    required_checks:
      - name: "tests"
        must_pass: true
        # No coverage requirement
    complexity:
      max_cyclomatic_complexity: 20  # Relaxed

  dependencies:
    mode: "blacklist"
    blacklist:
      - "left-pad"              # Known issues only

overrides:
  bypass_labels:
    - "move-fast"
    - "prototype"
    - "experiment"
```

### Example 3: Open Source Project

```yaml
version: 1.0
enabled: true

policies:
  files:
    allowed_patterns:
      - "src/**"
      - "tests/**"
      - "docs/**"
      - "examples/**"
    blocked_patterns:
      - ".github/workflows/**"
      - "package.json"
    max_files_per_pr: 30

  quality:
    required_checks:
      - name: "tests"
        must_pass: true
      - name: "lint"
        must_pass: true
      - name: "coverage"
        min_coverage: 75

  commits:
    format:
      pattern: "^(feat|fix|docs|style|refactor|test|chore):\\s+.+"
      example: "feat: add dark mode support"

  pull_requests:
    description:
      required_sections:
        - "## What"
        - "## Why"
        - "## Testing"
    required_labels:
      - "mayor-task"

overrides:
  partial_bypass:
    - label: "docs-only"
      bypasses: ["quality"]
    - label: "refactor"
      bypasses: ["files.max_files_per_pr"]
```

### Example 4: Monorepo with Multiple Teams

```yaml
version: 1.0
enabled: true

policies:
  files:
    # Team boundaries
    allowed_patterns:
      - "packages/frontend/**"   # Frontend team
      - "packages/backend/**"    # Backend team
      - "packages/shared/**"     # Shared libs
    
    # Never touch other teams' code
    blocked_patterns:
      - "packages/mobile/**"     # Mobile team only
      - "packages/infra/**"      # DevOps only

  quality:
    required_checks:
      - name: "tests"
        must_pass: true
      - name: "monorepo-lint"
        command: "npm run lint --workspaces"
        must_pass: true

  dependencies:
    mode: "approval_required"
    approval_required:
      - condition: "shared_dependency"
        notify: "@tech-leads"

overrides:
  partial_bypass:
    - label: "cross-team"
      bypasses: ["files.blocked_patterns"]
      # Requires manual review from affected teams
```

---

## FAQ

**Q: Can I have multiple policy files?**  
A: No, only `.github/mayor-west-policies.yml` is read. Use YAML anchors for reuse.

**Q: What happens if I don't have a policy file?**  
A: Default security layers (CODEOWNERS, protected paths) still apply.

**Q: Can policies block human developers?**  
A: No, policies only apply to Copilot PRs (filtered by `github.actor`).

**Q: How do I test policies without affecting production?**  
A: Use `npx mayor-west-mode policy dry-run` or test in a separate branch.

**Q: Can I require specific npm package versions?**  
A: Not directly, but you can block certain patterns like `"axios@<1.0.0"`.

**Q: What if Copilot violates a policy?**  
A: Auto-merge is blocked. PR comment explains violations. Human reviews.

**Q: Can I make policies mandatory for all repos in my org?**  
A: Not yet. Create org template repo with policies included.

---

## Need Help?

- 📚 [Full Technical Design](./custom-policy-design.md)
- 🐛 [Report Issues](https://github.com/your-org/mayor-west-mode/issues)
- 💬 [Discussions](https://github.com/your-org/mayor-west-mode/discussions)
- 📖 [Main Documentation](../README.md)

---

**Made with 🎩 by Mayor West Mode**
