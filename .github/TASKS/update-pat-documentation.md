# [DOCS] Update README with Clear Fine-Grained PAT Scope Requirements

**Status**: Open  
**Priority**: High  
**Labels**: documentation, enhancement

## Problem

The current README doesn't provide clear guidance on the required scopes for the Fine-Grained Personal Access Token (PAT) used by Mayor West Mode.

## Proposed Changes

Add a dedicated section to the README explaining the required token scopes:

### Required Scopes for Fine-Grained PAT

The token needs these repository permissions:

**Actions - Read and Write**
- Used to approve pending workflow runs from Copilot

**Contents - Read and Write**
- Used to commit changes and push code

**Issues - Read and Write**
- Used to assign Copilot to issues, create comments, and manage issue labels

**Pull Requests - Read and Write**
- Used to create PRs, approve them, merge them, and manage PR state

**Workflows - Read and Write**
- Used to interact with workflow runs and deployments

### Additional Configuration

- **Repository Access**: The token should have access to this specific repository
- **Token Type**: GitHub Fine-Grained Personal Access Token (not Classic)
- **Expiration**: Set according to your security policy (recommended: 90 days max)

### Why These Scopes?

The Mayor West orchestrator workflow uses the token to:

- Auto-approve Copilot's pending workflow runs
- Assign the copilot-swe-agent to issues via GraphQL API
- Create comments with instructions
- Approve and merge Copilot's PRs automatically
- Mark draft PRs as ready for review

The `GH_AW_AGENT_TOKEN` secret should be added in your repository settings at **Settings → Secrets and variables → Actions → New repository secret**.

## Files to Update

- [ ] `README.md` - Add new section for PAT requirements
- [ ] `Docs/CLI-README.md` - Mirror the same information
- [ ] `Docs/cli-guide.md` - Add troubleshooting section for token issues

## Acceptance Criteria

- [ ] All required scopes are clearly documented
- [ ] Each scope has an explanation of why it's needed
- [ ] Configuration steps are easy to follow
- [ ] Troubleshooting guidance is included
- [ ] Security best practices are mentioned (expiration, token type)
