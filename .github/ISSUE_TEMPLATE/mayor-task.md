---
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

- [ ] Create `/api/auth/register` endpoint
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
- Use existing `User` model in `src/models/User.ts`
- Follow REST conventions already established in the codebase
- Don't add new npm dependencies without approval
- Use the existing test framework (Jest)

---

## Testing Requirements

Specify what tests Copilot should write and verify.

**Example**:
- Unit tests for validation logic
- Integration tests for endpoint
- Tests must pass with `npm test`
- Code coverage >= 80%

---

## Files Likely to Change

Help Copilot understand the scope. Which files will need modifications?

**Example**:
- `src/routes/auth.ts` - Add new endpoint
- `src/models/User.ts` - May need to update schema
- `src/tests/auth.test.ts` - Create test file
- `README.md` - Update API documentation

---

## Definition of Done

Task is complete when:
- [ ] All acceptance criteria implemented
- [ ] All tests pass (`npm test` returns exit code 0)
- [ ] Code linting passes (`npm run lint` returns exit code 0)
- [ ] PR created with description
- [ ] PR ready for merge
