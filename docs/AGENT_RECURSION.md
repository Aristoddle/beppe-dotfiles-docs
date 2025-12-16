# Agent Recursion Architecture (Turtles All The Way Down)

**Purpose**: Enable agents to spawn sub-agents recursively for parallel execution and decomposition

**Status**: PROPOSED 2025-11-14 (NOT CURRENTLY SUPPORTED BY CLAUDE CODE)

**⚠️ IMPORTANT**: As of Nov 2025, Claude Code explicitly prevents subagents from spawning other subagents. This document describes a **proposed future architecture**, not current functionality.

---

## The Vision

**User request**: "Sub-agents should be able to spin off their own sub-n agents: turtles all the way down"

**Goal**: Fractal agent architecture where any agent can delegate to specialized sub-agents, who can themselves delegate further.

```
User
  ↓
Main Conversation (Claude Code)
  ↓
  ├─→ @chezmoi-workflow
  │   ├─→ @git-coordinator (commit formatting)
  │   └─→ @security-scanner (validate changes)
  │
  ├─→ @notion-manager
  │   ├─→ [Self-reconnect on timeout]
  │   └─→ @template-sync-agent (sync findings back)
  │
  └─→ @template-sync-agent
      ├─→ @chezmoi-workflow (apply drifted changes)
      └─→ @git-coordinator (commit synced templates)
```

**Depth**: Unlimited (constrained only by Claude Code context limits)

---

## Current State (Nov 14, 2025)

### ✅ What Works

**Level 1**: Main conversation → Sub-agent
```
User: "@notion-manager create KB entry"
  → notion-manager executes in parallel
```

**Agents can use Task tool** to spawn other agents:
```javascript
// Inside chezmoi-workflow-agent
Task({
  subagent_type: "git-coordinator",
  prompt: "Create commit for these dotfile changes",
  description: "Git commit formatting"
});
```

### ❌ What's Missing

**No explicit recursion guidance**: Agents don't know they CAN spawn sub-agents

**No depth tracking**: Can't detect infinite loops

**No resource limits**: Could spawn 100s of agents in parallel

**No communication protocol**: Sub-agents can't report back to parent

---

## Proposed Architecture

### 1. Agent Capabilities Matrix

**Every agent declares**:
```yaml
---
name: chezmoi-workflow-agent
can_delegate: true
max_depth: 3
preferred_subagents:
  - git-coordinator: "For commit formatting"
  - security-scanner: "For validation"
  - template-sync-agent: "For drift detection"
---
```

**Agents that should NOT delegate** (terminal nodes):
```yaml
---
name: git-coordinator
can_delegate: false  # Pure execution, no further decomposition
---
```

### 2. Recursive Delegation Pattern

**Pattern for agents**:
```javascript
// Inside any agent that can_delegate: true

function delegateToSubAgent(task, context) {
  // Check depth limit
  const currentDepth = context.recursion_depth || 0;
  if (currentDepth >= this.max_depth) {
    console.log("⚠️  Max delegation depth reached, executing directly");
    return executeDirect(task);
  }

  // Check if task matches preferred subagent
  const subagent = matchSubAgent(task);
  if (!subagent) {
    return executeDirect(task);
  }

  // Delegate with depth tracking
  return Task({
    subagent_type: subagent,
    prompt: buildPrompt(task, context),
    description: task.description,
    context: {
      ...context,
      recursion_depth: currentDepth + 1,
      parent_agent: this.name,
      parent_task_id: task.id
    }
  });
}
```

### 3. Depth Tracking

**Context passed through recursion**:
```javascript
{
  recursion_depth: 2,                    // Current depth (0 = user → agent)
  parent_agent: "chezmoi-workflow",      // Who spawned this
  parent_task_id: "workflow-abc123",     // Parent's task ID
  root_user_request: "Update zsh config", // Original user ask
  trace: ["user", "chezmoi-workflow", "git-coordinator"]  // Full path
}
```

**Depth limits** (prevent infinite loops):
- Level 0: User → Main conversation
- Level 1: Main → Sub-agent (chezmoi-workflow)
- Level 2: Sub-agent → Sub-sub-agent (git-coordinator)
- Level 3: Sub-sub → Sub-sub-sub (if needed)
- **Max**: 5 levels (configurable per agent)

### 4. Communication Protocol

**Parent → Child**:
```javascript
Task({
  subagent_type: "git-coordinator",
  prompt: "Create commit for: <changes>",
  context: {
    parent_agent: "chezmoi-workflow",
    expected_output: "commit_sha",
    timeout_ms: 30000
  }
});
```

**Child → Parent** (via return value):
```javascript
// git-coordinator returns
{
  status: "success",
  commit_sha: "abc123",
  message: "feat(zsh): Add parallel completions",
  execution_time_ms: 1200
}
```

**Error propagation**:
```javascript
// If sub-agent fails
{
  status: "error",
  error: "Git repo not clean",
  recovery_suggestion: "Run: git stash",
  parent_can_retry: true
}
```

### 5. Parallel Execution

**Pattern**: Spawn multiple sub-agents simultaneously

```javascript
// chezmoi-workflow spawns 3 sub-agents in parallel
const results = await Promise.all([
  Task({subagent_type: "security-scanner", prompt: "Scan changes"}),
  Task({subagent_type: "test-validator", prompt: "Run tests"}),
  Task({subagent_type: "template-sync-agent", prompt: "Check drift"})
]);

// Wait for all, proceed only if all succeed
if (results.every(r => r.status === "success")) {
  // All validations passed, proceed with apply
  await applyChanges();
}
```

**Benefit**: 3 validation tasks in parallel vs sequential = **3x speedup**

---

## Example: 3-Level Recursion

**User request**: "Update zsh to enable parallel completion loading"

**Level 0 → 1**: User → chezmoi-workflow
```
User: "@chezmoi-workflow enable parallel completion loading in zsh"
  ↓
chezmoi-workflow receives task
```

**Level 1 → 2**: chezmoi-workflow → sub-agents (parallel)
```
chezmoi-workflow spawns:
  ├─→ @security-scanner "Validate parallel loading is safe"
  ├─→ @test-validator "Test zsh loads without errors"
  └─→ @template-sync-agent "Check if templates need sync"
```

**Level 2 → 3**: Sub-agents → sub-sub-agents
```
template-sync-agent detects drift
  ↓
Spawns: @git-coordinator "Commit template sync changes"
        ↓
        git-coordinator executes (terminal node, no further delegation)
```

**Result Tree**:
```
User
└─ chezmoi-workflow (depth: 1)
   ├─ security-scanner (depth: 2) ✓ SAFE
   ├─ test-validator (depth: 2) ✓ PASS
   └─ template-sync-agent (depth: 2)
      └─ git-coordinator (depth: 3) ✓ COMMITTED
```

**Total time**: ~5 seconds (parallelized) vs ~15 seconds (sequential)

---

## Resource Limits & Safety

### Max Concurrent Agents

**Per-depth limits**:
```javascript
const LIMITS = {
  max_depth: 5,
  max_concurrent_per_level: 10,
  max_total_concurrent: 50,
  timeout_per_agent_ms: 60000
};
```

**Enforcement**:
```javascript
if (getCurrentAgentCount() >= LIMITS.max_total_concurrent) {
  throw "Too many concurrent agents, wait for some to complete";
}
```

### Infinite Loop Prevention

**Detection**:
```javascript
// Check for cycles in trace
const trace = ["user", "chezmoi-workflow", "git-coordinator", "chezmoi-workflow"];
if (hasCycle(trace)) {
  throw "Cycle detected: chezmoi-workflow → git-coordinator → chezmoi-workflow";
}
```

**Max identical delegations**:
```javascript
// Prevent same agent being called repeatedly
if (trace.filter(a => a === "git-coordinator").length > 3) {
  throw "Agent git-coordinator called 3+ times in chain, likely loop";
}
```

### Timeout Handling

**Per-agent timeouts**:
```javascript
const result = await Task({...}, timeout_ms: 30000);
if (result.status === "timeout") {
  // Parent decides: retry, skip, or fail entire operation
}
```

---

## Implementation Checklist

**Phase 1: Enable Recursion** (Week 1)
- [ ] Add `can_delegate`, `max_depth`, `preferred_subagents` to all agent YAML
- [ ] Update agent prompt templates with delegation guidance
- [ ] Document recursion patterns in each agent

**Phase 2: Depth Tracking** (Week 1)
- [ ] Implement context passing (recursion_depth, parent_agent, trace)
- [ ] Add depth limit enforcement
- [ ] Add cycle detection

**Phase 3: Communication Protocol** (Week 2)
- [ ] Standardize return value format {status, data, error}
- [ ] Implement error propagation
- [ ] Add parent-child messaging

**Phase 4: Parallel Execution** (Week 2)
- [ ] Enable Promise.all() pattern for parallel sub-agents
- [ ] Add resource limits (max concurrent)
- [ ] Implement timeout handling

**Phase 5: Monitoring** (Week 3)
- [ ] Log recursion traces for debugging
- [ ] Track agent execution times
- [ ] Identify optimization opportunities

---

## Benefits

**Decomposition**: Complex tasks → simple sub-tasks

**Parallelization**: Independent sub-tasks execute simultaneously

**Specialization**: Each agent does one thing well

**Scalability**: Add new agents without rewriting existing ones

**Debuggability**: Trace shows exact execution path

**Resource efficiency**: Terminal nodes don't spawn unnecessary agents

---

## Future: Auto-Delegation

**Vision**: Agents learn optimal delegation patterns

```javascript
// Agent observes:
// - Task "validate zsh syntax" took 2s when executed directly
// - Task "validate zsh syntax" took 0.5s when delegated to security-scanner

// After 10 observations, auto-delegate syntax validation
if (task.type === "validate_syntax" && stats.delegation_faster) {
  autoDelegate("security-scanner", task);
}
```

**Learning**: Track success rates, execution times, resource usage → optimize delegation decisions

---

**Status**: Proposed architecture, NOT supported by Claude Code as of Nov 2025
**Limitation**: Claude Code currently prevents "subagents cannot spawn other subagents"
**Principle**: "Delegation is not overhead, it's specialization"
**Depth**: Turtles all the way down (within reason) - IF implemented

**Last Updated**: 2025-11-14 (Corrected: Not actual Claude Code capability)
