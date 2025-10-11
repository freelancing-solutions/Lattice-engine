# **AGENTS.md**
### Agentic Coding Workflow Specification

**Version:** 1.0
**Last Updated:** 2025-10-11

---

## **Purpose**

This document defines how autonomous and semi-autonomous agents collaborate within the project’s development lifecycle.
It establishes mandatory rules for planning, execution, and traceability to ensure that all actions remain auditable, reversible, and grounded in an explicit reasoning trail.

---

## **Agent Roles**

| Role                | Description                                                 | Key Responsibilities                                                                     |
| ------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **PlannerAgent**    | Designs high-level goals, architecture, and specifications. | Initiate planning sessions, create GitHub Issues (via MCP), and define task outlines.    |
| **ExecutorAgent**   | Implements planned tasks into code.                         | Generate branches, commits, and PRs referencing the planning issue.                      |
| **ReviewerAgent**   | Audits and validates work products.                         | Review pull requests, verify compliance with issue linkage, and approve merges.          |
| **SupervisorAgent** | Enforces governance rules.                                  | Monitor compliance with R-001 and R-002, block non-compliant operations, and audit logs. |

---

## **Core Workflow Overview**

1. **Initiation – Planning Session**

   * A planning session *must* be opened via `github.issues.create` through the MCP server.
   * The resulting issue is the canonical artifact for all further actions.
   * Example:

     ```bash
     github.issues.create --title "Implement user session manager" \
         --body "Planning session for authentication refactor" \
         --labels ["planning-session", "planner"]
     ```

2. **Execution – Implementation Phase**

   * ExecutorAgent retrieves the issue ID and initializes a feature branch:

     ```
     feature/issue-123-session-manager
     ```
   * All commits *must* contain the trailer:

     ```
     Related-Issue: #123
     Agent-Role: executor
     ```
   * Pull Requests reference the same issue and post a status comment through:

     ```
     github.issues.comment
     ```

3. **Review – Verification Phase**

   * ReviewerAgent checks:

     * Each PR has a valid `Related-Issue` trailer.
     * Branch naming conforms to the `issue-###` pattern.
     * Linked issue is in an “Open” or “In Review” state.
   * Upon approval, a comment is added to the issue thread:

     ```
     ✅ Review complete – PR #67 approved by ReviewerAgent
     ```

4. **Closure – Completion Phase**

   * When merged, SupervisorAgent updates the original issue:

     ```
     github.issues.update --state closed --body "Merged via PR #67"
     ```
   * The issue remains the authoritative log of planning and reasoning.

---

## **Governance Rules**

### **R-001: PlanningSession-GitHubIssueCompliance**

Every planning session must be logged as a GitHub Issue via MCP.
No planning context may exist solely in local memory or private state.
Agents that attempt to plan without `github.issues.create` will be halted by the SupervisorAgent and reported in the audit ledger.

### **R-002: Execution-PlanLinkIntegrity**

Every code generation or mutation task must include a valid `planning_issue_id`.
All branches, commits, and pull requests must reference the originating issue by ID.
Non-compliant commits are rejected and flagged for manual review.

---

## **Audit & Enforcement**

* **SupervisorAgent** periodically verifies linkage integrity by traversing:

  ```
  Issue → Branch → Pull Request → Commits
  ```
* Violations trigger automated comments on the issue thread and a recorded entry in `.lattice/audit/log.json`.
* All enforcement logic derives from `.lattice/policies/agent_rules.json`, e.g.:

  ```json
  {
    "R-001": { "enforced": true, "mcp_command": "github.issues.create" },
    "R-002": { "enforced": true, "commit_trailer": "Related-Issue" }
  }
  ```

---

## **Example Interaction Flow**

**PlannerAgent**

```
> Initiating plan for async job queue integration...
> Creating GitHub issue...
✅ Issue #212 created via github.issues.create
```

**ExecutorAgent**

```
> Linked to Issue #212
> Branch created: feature/issue-212-async-jobs
> Commits include Related-Issue: #212
> PR opened and comment posted to issue thread
```

**ReviewerAgent**

```
> Verified linkage to Issue #212
> Approved PR #45
> Commented 'Review complete'
```

**SupervisorAgent**

```
> Detected merged PR #45
> Closed Issue #212
> Updated audit log
```

---

## **Philosophy**

Agents are collaborators, not isolated functions.
Every action, from conception to commit, must leave a trace in the shared reasoning network.
GitHub Issues serve as the collective “memory cortex” of the system—transparent, versioned, and accessible to both humans and machines.

---

Would you like me to extend this with **R-003: Review-and-Merge Discipline** (closing the lifecycle) so the file becomes the full governance spec for all agent operations?
