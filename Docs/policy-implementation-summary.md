# Custom Policy Implementation - Summary

**Status**: Design Complete, Ready for Implementation  
**Date**: January 17, 2026  
**Epic**: Custom Policy System for Mayor West Mode

---

## 📋 Executive Summary

This document summarizes the complete plan for adding **Custom Policy** support to Mayor West Mode. The feature allows repository owners to define fine-grained, declarative rules controlling what GitHub Copilot can and cannot do during autonomous task execution.

### Key Value Proposition

Instead of a one-size-fits-all security model, repositories can now customize:
- Which files Copilot may modify
- Which commands are auto-approved
- Code quality requirements (coverage, linting, complexity)
- Dependency management (whitelist/blacklist/approval)
- Commit and PR format requirements
- Override mechanisms for special cases

---

## 🎯 Goals

1. **Flexibility**: Support diverse repository needs (startups vs. enterprises)
2. **Safety**: Maintain security while adding flexibility
3. **Simplicity**: Easy to configure, understand, and maintain
4. **GitHub Native**: Work within GitHub and Copilot constraints
5. **Auditable**: Every policy decision logged and traceable

---

## 🏗️ Architecture Overview

### Policy File Structure

**Location**: `.github/mayor-west-policies.yml`

**Core Sections**:
```yaml
version: 1.0
enabled: true

policies:
  files:           # Which files Copilot can modify
  commands:        # Which terminal commands are allowed
  quality:         # Code quality requirements
  dependencies:    # Package management rules
  commits:         # Commit message format
  pull_requests:   # PR requirements

overrides:
  bypass_labels:   # Global policy bypass
  partial_bypass:  # Selective policy bypass
```

### Enforcement Points

```
Issue Created
    ↓
Orchestrator Assigns Copilot
    ↓ (inject policies)
Copilot Plans Changes
    ↓ (validate against file/command policies)
Copilot Executes
    ↓ (run quality checks)
PR Created
    ↓ (validate PR format)
Policy Validation Workflow Runs
    ↓ (final gate)
Auto-Merge (if passed) / Human Review (if failed)
```

### New Workflows

1. **Policy Validation Workflow** (`.github/workflows/mayor-west-policy-validation.yml`)
   - Runs on every Copilot PR
   - Validates against all policies
   - Generates compliance report
   - Blocks merge if violations found

2. **Enhanced Orchestrator** (update existing)
   - Load policy file on task assignment
   - Inject policies as issue comment
   - Copilot reads and follows rules

### CLI Integration

```bash
# New command group
npx mayor-west-mode policy <subcommand>

# Subcommands:
policy init          # Create default policy file
policy validate      # Check syntax
policy test          # Test hypothetical changes
policy dry-run       # Test against existing PR
policy list          # Show active policies
policy show <cat>    # Show specific category
```

---

## 📦 Deliverables

### Phase 1: Core Implementation

**Files to Create**:
- [ ] `lib/policy-parser.js` - YAML parser and validator
- [ ] `lib/policy-validator.js` - Enforcement logic
- [ ] `.github/workflows/mayor-west-policy-validation.yml` - Validation workflow
- [ ] `templates/mayor-west-policies.yml` - Default template

**Files to Update**:
- [ ] `cli.js` - Add `policy` command group
- [ ] `.github/workflows/mayor-west-orchestrator.yml` - Inject policies
- [ ] `.github/copilot/instructions.md` - Add policy awareness
- [ ] `FILES_TO_CREATE` object - Add policy file

**Tests**:
- [ ] `tests/policy-parser.test.js` - Unit tests for parser
- [ ] `tests/policy-validator.test.js` - Unit tests for validator
- [ ] `tests/policy-integration.test.js` - Integration tests
- [ ] `tests/policy-e2e.test.js` - End-to-end tests

### Phase 2: Documentation

- [x] `Docs/custom-policy-design.md` - Technical design document (COMPLETED)
- [x] `Docs/policy-guide.md` - User guide with examples (COMPLETED)
- [x] `Docs/policy-implementation-summary.md` - This document (COMPLETED)
- [ ] Update `README.md` - Add policy feature overview
- [ ] Update `Docs/CLI-README.md` - Document policy commands
- [ ] Update `Docs/cli-guide.md` - Add policy section

### Phase 3: Examples

- [ ] `examples/policies/strict-security.yml` - High-security example
- [ ] `examples/policies/fast-startup.yml` - Permissive example
- [ ] `examples/policies/open-source.yml` - OSS project example
- [ ] `examples/policies/monorepo.yml` - Monorepo example

---

## 🔧 Technical Decisions

### 1. YAML vs JSON vs JavaScript

**Decision**: YAML

**Rationale**:
- More readable and maintainable than JSON
- Safer than JavaScript (no code execution)
- Native GitHub Actions support
- Community familiarity (used by CI/CD)

### 2. Validation Location

**Decision**: GitHub Actions Workflow

**Rationale**:
- Runs in GitHub's infrastructure (no local dependencies)
- Can block auto-merge via required status checks
- Generates audit trail automatically
- Works for all contributors (not just local)

### 3. Policy Injection Method

**Decision**: Issue Comment

**Rationale**:
- Copilot reads issue comments naturally
- No need to modify Copilot's context directly
- Human-readable audit trail
- Easy to debug (visible in issue)

### 4. Override Mechanism

**Decision**: GitHub Issue Labels

**Rationale**:
- Native GitHub feature (no custom state)
- Easy to add/remove (via CLI or UI)
- Visible in PR list views
- Auditable (label history tracked)

---

## 🛡️ Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| **Malicious policy file** | Validate schema on commit, fail safely |
| **Policy bypass abuse** | Log all bypasses, require justification |
| **Performance DoS** | Cache validation results, rate limit checks |
| **Policy file tampering** | Protected path (in .github/mayor-west.yml) |
| **Command injection** | Patterns are regex, not executed code |

### Safety Layers (Unchanged)

The existing 4-layer security model remains:
1. **Layer 1**: CODEOWNERS actor allowlist
2. **Layer 2**: Protected paths (mayor-west.yml)
3. **Layer 3**: Kill switch (enable/disable)
4. **Layer 4**: Audit trail

Custom policies add a **5th layer** of fine-grained control.

---

## 📊 Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| **Adoption Rate** | 30% of repos add policies | 3 months post-launch |
| **Policy Violations Caught** | >50/month across all repos | Ongoing |
| **False Positive Rate** | <5% of blocks | Ongoing |
| **Time to Configure** | <10 minutes | Post-launch |
| **Documentation Quality** | >4.5/5 rating | 1 month post-launch |

---

## 🚀 Rollout Plan

### Week 1-2: Foundation
- Implement policy parser
- Create validation workflow
- Add CLI commands
- Write unit tests

### Week 3-4: Integration
- Update orchestrator workflow
- Update agent instructions
- Add policy injection logic
- Write integration tests

### Week 5: Documentation
- Finalize user guide
- Create video tutorials
- Write migration guide
- Add troubleshooting section

### Week 6: Beta Testing
- Deploy to 3-5 test repos
- Gather feedback
- Fix issues
- Refine documentation

### Week 7-8: General Availability
- Announce feature
- Add to default setup wizard
- Monitor adoption
- Iterate based on feedback

---

## 🔗 Dependencies

### Required
- Node.js ≥18 (existing requirement)
- GitHub CLI (for setup automation)
- js-yaml npm package (for parsing)

### Optional
- glob npm package (for pattern matching)
- ajv npm package (for schema validation)

---

## 🧪 Testing Strategy

### Unit Tests
- Policy file parsing (valid/invalid syntax)
- Pattern matching (glob, regex)
- Validation logic (pass/fail scenarios)

### Integration Tests
- Workflow triggers correctly
- Policies injected into issues
- Validation results posted as comments
- Auto-merge blocked on violations

### End-to-End Tests
- Create issue → assign → Copilot works → PR created → policies enforced
- Test bypass labels
- Test partial bypasses
- Test policy updates

### Performance Tests
- Large policy files (100+ rules)
- Large PRs (100+ files)
- Validation speed (<5s target)

---

## 📚 Documentation Hierarchy

```
README.md                              # Feature overview
└── Docs/
    ├── custom-policy-design.md        # Technical design (this doc)
    ├── policy-guide.md                # User guide with examples
    ├── policy-implementation-summary.md  # Implementation plan
    └── examples/
        └── policies/
            ├── strict-security.yml
            ├── fast-startup.yml
            ├── open-source.yml
            └── monorepo.yml
```

---

## 🤝 Contribution Guidelines

For implementers working on this feature:

1. **Read the design doc first** (`custom-policy-design.md`)
2. **Follow the user guide** (`policy-guide.md`) to understand UX
3. **Start with unit tests** (TDD approach)
4. **Implement parser before validator**
5. **Test locally before CI integration**
6. **Update docs as you go** (not at the end)

### Commit Message Format

```
[POLICY] <type>: <description>

Types:
- feat: New feature (e.g., "Add dependency validation")
- fix: Bug fix (e.g., "Fix regex escaping in patterns")
- docs: Documentation (e.g., "Add examples to policy guide")
- test: Tests (e.g., "Add unit tests for parser")
- refactor: Code refactor (no functional change)
```

---

## 🔮 Future Enhancements (v2.0)

**Not in scope for v1, but planned:**

1. **Policy Templates Library**
   - Pre-built policies for common stacks (React, Node, Python)
   - Security-focused templates
   - Compliance templates (SOC2, HIPAA)

2. **Policy Composition**
   - Import policies from other files
   - Reusable policy snippets
   - Org-level default policies

3. **Machine Learning**
   - Learn from violation patterns
   - Suggest policy improvements
   - Predict likely violations

4. **Policy Marketplace**
   - Share policies with community
   - Rate and review policies
   - One-command install

5. **Advanced Overrides**
   - Time-based (emergency windows)
   - User-based (admin bypass)
   - Conditional (if X then allow Y)

---

## ❓ FAQ

**Q: Does this replace the existing security model?**  
A: No, it extends it. The 4-layer model remains. Policies add a 5th layer.

**Q: Can humans bypass policies?**  
A: Yes, policies only apply to Copilot PRs (filtered by `github.actor`).

**Q: What if there's no policy file?**  
A: Default security layers still apply. Policies are opt-in enhancement.

**Q: Can I use this for non-Mayor West repos?**  
A: No, it's tightly integrated with Mayor West Mode workflows.

**Q: How do I migrate existing repos?**  
A: Run `npx mayor-west-mode policy init` to generate default policies.

**Q: Are policies enforceable in CI?**  
A: Yes, the validation workflow is a required status check.

**Q: Can I test policies before enabling?**  
A: Yes, use `enabled: false` and `npx mayor-west-mode policy dry-run`.

---

## 📞 Contact

- **Implementation Questions**: @template-author (via GitHub Copilot)
- **Design Questions**: @mayor-west-dev (via GitHub Copilot)
- **Security Concerns**: @security-team
- **General Help**: GitHub Discussions

---

## 📄 License

This feature design is part of Mayor West Mode, licensed under [project license].

---

**Status**: ✅ Design Complete | ⏳ Implementation Pending | 🚀 Launch: Q2 2026

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-17 | 1.0 | Initial design document | Template Author Agent |

---

**END OF SUMMARY**
