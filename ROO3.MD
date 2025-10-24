
---

# **AGENTS.md**

### Agentic Coding Workflow Specification

**Version:** 1.1
**Last Updated:** 2025-10-11

---

## **Purpose**

This document defines how autonomous and semi-autonomous agents collaborate within the project’s development lifecycle.
It codifies the rules, responsibilities, and sequence of interactions that ensure all actions are traceable, reviewable, and compliant with organizational policy.

---

## **Agent Roles**

| Role                | Description                                                 | Key Responsibilities                                                            |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **PlannerAgent**    | Translates feature requests or goals into actionable plans. | Initiate planning sessions, create GitHub Issues, and define execution scope.   |
| **ExecutorAgent**   | Implements the plan through code generation and mutation.   | Create branches, commits, and pull requests linked to planning issues.          |
| **ReviewerAgent**   | Performs quality, compliance, and correctness reviews.      | Validate branch-to-issue linkage, check code quality, and approve merges.       |
| **SupervisorAgent** | Enforces global policies and audits agent compliance.       | Halt non-compliant operations, update audit logs, and manage enforcement hooks. |

---

## **Core Workflow**

### **1. Planning Phase**

* PlannerAgent begins every session by creating a new GitHub Issue via the MCP server:

  ```bash
  github.issues.create \
    --title "Implement async job queue" \
    --body "Planning session for background processing" \
    --labels ["planning-session","planner"]
  ```
* The issue ID returned becomes the **canonical reference** for the task.

### **2. Execution Phase**

* ExecutorAgent clones the issue context and initializes a branch:

  ```
  feature/issue-212-async-jobs
  ```
* Commits include mandatory trailers:

  ```
  Related-Issue: #212
  Agent-Role: executor
  ```
* A pull request is created referencing the same issue and posts:

  ```
  github.issues.comment
  ```

### **3. Review Phase**

* ReviewerAgent validates that:

  * The PR references a valid issue ID.
  * All commits contain the proper trailers.
  * Code quality and architecture meet the project’s standards.
* If approved, the reviewer posts:

  ```
  ✅ Review complete – PR #67 approved by ReviewerAgent
  ```
* If rejected, the reviewer uses:

  ```
  github.issues.comment
  ```

  to log reasoning and re-assign the ExecutorAgent.

### **4. Merge & Closure Phase**

* Once a PR passes review, SupervisorAgent performs or authorizes the merge.
* After merge:

  * The originating issue is automatically closed.
  * A final comment is appended linking PR, merge commit, and build result.
  * The audit ledger records:

    ```
    Issue → PR → Merge Commit → Release Tag
    ```

---

## **Governance Rules**

### **R-001: PlanningSession-GitHubIssueCompliance**

Every planning session must be initiated as a GitHub Issue via the MCP server.
No ephemeral or local-only plans are permitted.

Violations result in an immediate halt and audit entry.

---

### **R-002: Execution-PlanLinkIntegrity**

Every code generation, mutation, or pull request must link to a valid planning issue ID.
Branches, commits, and PRs must include `Related-Issue` trailers or metadata.

SupervisorAgent periodically verifies chain integrity across repositories.

---

### **R-003: Review-and-Merge Discipline**

**Purpose:**
To ensure that every pull request undergoes verified review, traceable approval, and compliant merging.

**Rule Statement:**

1. **Review Enforcement:**
   No PR may be merged unless:

   * It has at least one approval comment from a ReviewerAgent or authorized human.
   * The PR body references its planning issue via `Related-Issue: #<id>`.
   * All commits within the PR conform to R-002.

2. **Automated Status Posting:**
   Upon approval, ReviewerAgent executes:

   ```bash
   github.issues.comment \
     --issue <id> \
     --body "✅ Review complete – PR #<pr> approved and queued for merge."
   ```

3. **Merge Authorization:**
   Only SupervisorAgent or a designated maintainer may perform merges.
   If a PR is merged without the required review metadata, the SupervisorAgent must:

   * Reopen the linked issue,
   * Flag the merge as **non-compliant**, and
   * Record the violation in `.lattice/audit/log.json`.

4. **Post-Merge Updates:**
   Upon successful merge:

   ```bash
   github.issues.update \
     --issue <id> \
     --state closed \
     --body "Merged via PR #<pr> by SupervisorAgent."
   ```

5. **Continuous Verification:**
   SupervisorAgent periodically scans recent merges:

   * Verifies reviewer signatures.
   * Ensures every merged branch originated from a valid planning issue.
   * Syncs status with build artifacts and deployment metadata.

**Rationale:**
This rule enforces a human-or-agent “four-eyes principle,” guarantees auditability, and maintains causal linkage from plan to merge.
It eliminates “shadow merges” and ensures all reasoning threads are archived inside GitHub Issues.

---

## **Audit & Enforcement Layer**

* Enforcement logic resides in `.lattice/policies/agent_rules.json`

  ```json
  {
    "R-001": { "enforced": true, "mcp_command": "github.issues.create" },
    "R-002": { "enforced": true, "commit_trailer": "Related-Issue" },
    "R-003": { "enforced": true, "requires_approval": true }
  }
  ```
* Audit logs live in `.lattice/audit/log.json` with schema:

  ```json
  {
    "timestamp": "2025-10-11T12:41:00Z",
    "rule": "R-003",
    "action": "merge",
    "status": "approved",
    "issue_id": 212,
    "pr_number": 67,
    "agent": "SupervisorAgent"
  }
  ```

---

## **End-to-End Example**

```
PlannerAgent  → creates Issue #212
ExecutorAgent → develops on feature/issue-212-async-jobs
ReviewerAgent → approves PR #67
SupervisorAgent → merges PR #67, closes Issue #212
```

Audit chain:

```
#212 → PR #67 → Commit 3fae8c9 → Merge → Release v1.2.0
```

---

## **Philosophy**

Agents are part of a *collaborative cognition network*.
Every plan, execution, and review is a neuron in the project’s collective reasoning.
GitHub Issues are the connective tissue of that intelligence — persistent memory that fuses thought with action.

A codebase without reasoning is noise.
A codebase with linked reasoning is knowledge.

---

Would you like me to add **R-004: Continuous Feedback & Retrospective Learning** next — which would allow agents to self-evaluate completed issues and feed improvements back into new planning sessions?
