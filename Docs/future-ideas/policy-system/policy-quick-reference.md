# Mayor West Mode - Custom Policy Quick Reference

> **One-page cheat sheet** for custom policy syntax and commands

---

## 📁 Policy File Location

```
.github/mayor-west-policies.yml
```

---

## 🎯 Basic Structure

```yaml
version: 1.0
enabled: true

policies:
  files: { ... }           # Which files Copilot can touch
  commands: { ... }        # Which commands auto-approve
  quality: { ... }         # Code quality requirements
  dependencies: { ... }    # Package management rules
  commits: { ... }         # Commit message format
  pull_requests: { ... }   # PR requirements

overrides:
  bypass_labels: [...]     # Skip ALL policies
  partial_bypass: [...]    # Skip SOME policies
```

---

## 📋 Policy Categories

### Files

```yaml
files:
  allowed_patterns:        # Whitelist (if present)
    - "src/**/*.ts"
  blocked_patterns:        # Blacklist (takes precedence)
    - ".github/workflows/**"
  max_files_per_pr: 20
  max_lines_per_file: 500
```

### Commands

```yaml
commands:
  allowed:
    - pattern: "^npm\\s+test"
      description: "Run tests"
  blocked:
    - pattern: "^rm\\s+-rf"
      reason: "Destructive"
```

### Quality

```yaml
quality:
  required_checks:
    - name: "tests"
      command: "npm test"
      must_pass: true
    - name: "coverage"
      min_coverage: 80
  complexity:
    max_cyclomatic_complexity: 10
```

### Dependencies

```yaml
dependencies:
  mode: "approval_required"  # or "whitelist" or "blacklist"
  whitelist:
    npm: ["lodash", "axios"]
  blacklist:
    npm: ["left-pad"]
```

### Commits

```yaml
commits:
  format:
    pattern: "^\\[MAYOR\\]\\s+.{10,100}$"
    example: "[MAYOR] Add feature"
  required_trailer:
    pattern: "^Fixes\\s+#\\d+$"
```

### Pull Requests

```yaml
pull_requests:
  title:
    pattern: "^\\[MAYOR\\]\\s+.+"
  description:
    required_sections:
      - "## Changes"
      - "## Testing"
  required_labels:
    - "mayor-task"
  required_reviewers:
    - condition: "dependency_added"
      reviewers: ["@tech-lead"]
```

---

## 🚨 Override Mechanism

### Global Bypass

```yaml
overrides:
  bypass_labels:
    - "emergency"    # Skip ALL policies
    - "hotfix"
```

**Usage**: Add label to issue → All policies ignored

### Partial Bypass

```yaml
overrides:
  partial_bypass:
    - label: "skip-coverage"
      bypasses: ["quality.coverage"]
    - label: "large-refactor"
      bypasses: ["files.max_files_per_pr"]
```

**Usage**: Add label to issue → Specific policies ignored

---

## 💻 CLI Commands

```bash
# Create default policy file
npx mayor-west-mode policy init

# Validate syntax
npx mayor-west-mode policy validate

# Test hypothetical changes
npx mayor-west-mode policy test --files "src/index.ts,package.json"

# Test against existing PR
npx mayor-west-mode policy dry-run --pr-number 42

# List all policies
npx mayor-west-mode policy list

# Show specific category
npx mayor-west-mode policy show files
```

---

## 🔍 Pattern Matching

| Pattern | Matches | Example |
|---------|---------|---------|
| `**/*.ts` | All .ts files, any depth | `src/app/index.ts` ✅ |
| `src/**/*.ts` | .ts files under src/ | `src/utils/api.ts` ✅ |
| `*.json` | JSON in root only | `package.json` ✅ |
| `.github/**` | Everything in .github/ | `.github/workflows/ci.yml` ✅ |
| `**/migrations/**` | All migration dirs | `db/migrations/001.sql` ✅ |

---

## 📝 Common Patterns

### Protect Infrastructure

```yaml
files:
  blocked_patterns:
    - ".github/workflows/**"
    - "package.json"
    - "**/.env*"
    - "**/secrets/**"
```

### Enforce Tests

```yaml
quality:
  required_checks:
    - name: "tests"
      must_pass: true
    - name: "coverage"
      min_coverage: 80
```

### Require Issue Reference

```yaml
commits:
  required_trailer:
    pattern: "^(Fixes|Closes)\\s+#\\d+$"
    example: "Fixes #123"
```

### Control Dependencies

```yaml
dependencies:
  mode: "approval_required"
  approval_required:
    - condition: "new_dependency"
      label: "dependencies"
      notify: "@tech-lead"
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Policies not working** | Check file exists, `enabled: true`, workflow exists |
| **Too strict** | Add `bypass_labels` or loosen patterns |
| **False positives** | Refine `blocked_patterns` to be more specific |
| **Syntax error** | Run `npx mayor-west-mode policy validate` |

---

## 📚 Full Documentation

- [Technical Design](./custom-policy-design.md)
- [User Guide](./policy-guide.md)
- [Implementation Summary](./policy-implementation-summary.md)

---

## 🎩 Examples

```yaml
# Strict Security
policies:
  files:
    blocked_patterns: [".github/**", "**/*.sql", "**/secrets/**"]
    max_files_per_pr: 5
  dependencies:
    mode: "approval_required"
  quality:
    required_checks:
      - name: "security-scan"
        must_pass: true

# Fast Startup
policies:
  files:
    blocked_patterns: [".github/workflows/**"]
    max_files_per_pr: 100
  dependencies:
    mode: "blacklist"
    blacklist: {npm: ["left-pad"]}

# Open Source
policies:
  files:
    allowed_patterns: ["src/**", "tests/**", "docs/**"]
  quality:
    required_checks:
      - name: "tests"
        must_pass: true
      - name: "coverage"
        min_coverage: 75
```

---

**Made with 🎩 by Mayor West Mode**
