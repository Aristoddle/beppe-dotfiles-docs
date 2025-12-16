# State-Centric Architecture Analysis
**Date**: 2025-11-16  
**Status**: Design Phase  
**Author**: Comprehensive pathway exploration via sequential thinking

---

## Executive Summary

Current agent system is **agent-centric** (tracking WHO did WHAT). This creates friction:
- Project resolution is one-time, not continuous
- Parallel sessions conflict
- Agent identity matters more than state truth

This document explores **11 pathways** to migrate to **state-centric** architecture (tracking WHAT IS TRUE, WHAT NEEDS DOING).

**Recommendation**: Progressive enhancement strategy
- **Phase 1** (This Week): Pathway 8 - Minimal File Lock (1-2 hours)
- **Phase 2** (Next Week): Pathway 2 - Hybrid Agent-State (3 days)
- **Phase 3** (Next Month): Pathway 1 - Full State-Centric (7 days)

---

## Problem Statement

### Current Pain Points

1. **One-Time Project Resolution**
   - Orchestrator resolves project at startup: `project = resolve_project()`
   - User switches directories (`cd ~/manga-collection`), system doesn't notice
   - Manual intervention needed: "I'm working on manga now"

2. **Parallel Session Conflicts**
   - Two terminals working on same project → conflicts
   - Agent coordination via "swim lanes" is heavyweight

3. **Agent-Centric Logging**
   - SESSION_STATE.md documents: "orchestrator delegated to agent-validator at 10:32am"
   - User doesn't care WHO, only WHAT is true

4. **Agent Identity Over-Emphasized**
   - System tracks which agent did what
   - Should track: "state changed from X to Y"

### Desired State

- **Continuous semantic project resolution** (re-evaluate on every invocation)
- **Parallel sessions via shared state** (not agent coordination)
- **State-centric tracking** (truth, tasklist, metadata - not agent history)
- **Agent identity hidden** (implementation detail, not architecture)

---

## Pathway Analysis

### Tier 1: Practical Solutions (Implement Now)

#### Pathway 1: Full State-Centric Architecture
**Concept**: Complete redesign - agents become pure state transformers.

**Design**:
```python
class StateTransformer(Protocol):
    def transform(self, state: SessionState, task: Task) -> SessionState:
        """Pure function: Same input → same output"""
        ...

# Agents become stateless functions
def validate_agents_transformer(state, task):
    # Read current state
    uncommitted = state.ground_truth.git.uncommitted_files
    
    # Execute validation (side effect: file reads)
    results = validate_frontmatter(uncommitted)
    
    # Return NEW state (immutable)
    return state.copy_with_updates({
        'tasks': remove_completed(state.tasks, task.id),
        'metadata.learned_patterns': append_pattern(results)
    })
```

**SESSION_STATE.md Structure**:
```yaml
GROUND_TRUTH:          # Observable facts
  git: {...}
  tests: {...}
  token_budget: {...}

TASKS:                 # Derived from state gaps
  P0_blockers: []
  P1_urgent: [...]

METADATA:              # Context for decisions
  project_resolution: {...}
  learned_patterns: [...]
  work_context: {...}

RESOURCE_LOCKS:        # Parallel coordination
  chezmoi_source: {locked: false}
  notion_workspace: {locked: false}

STATE_CHANGES:         # Git-style history
  - id: change_147
    timestamp: 2025-11-16T10:35:15Z
    change_type: ground_truth_update
    section: git.uncommitted_files
    diff: {before: [...], after: [...]}
```

**Effort**: HIGH (7 days)  
**Benefits**: Philosophically pure, highly testable, parallel-safe  
**Risks**: Breaking changes, complex migration  
**Recommendation**: Phase 3 (long-term goal)

---

#### Pathway 2: Hybrid Agent-State
**Concept**: Incremental evolution - add state sections, keep agents.

**Design**:
```yaml
# Dual format (backward compatible)

# OLD FORMAT (v3.0 - still supported)
NEXT_ACTIONS:
  - Validate uncommitted agents
  - Apply to system via chezmoi

# NEW FORMAT (v4.0 - preferred)
GROUND_TRUTH:
  git:
    uncommitted_files: [...]

TASKS:
  P1_urgent:
    - id: task_001
      type: unvalidated_changes
      # ...
```

Orchestrator uses new format when available, falls back to old format.

**Effort**: MEDIUM (3 days)  
**Benefits**: Backward compatible, gradual migration  
**Risks**: Technical debt from dual systems  
**Recommendation**: Phase 2 (strategic foundation)

---

#### Pathway 3: State as Metadata
**Concept**: Minimal addition - add metadata to existing structure.

**Design**:
```yaml
# Keep existing NEXT_ACTIONS

# ADD metadata sections
METADATA:
  project_resolution:
    project: dotfiles
    confidence: 0.95
    resolved_at: 2025-11-16T10:35:00Z
    method: continuous_semantic
    signals:
      pwd: dotfiles
      git: dotfiles
  
  learned_patterns:
    - pattern: "Always validate before commit"
      confidence: 0.95
```

**Effort**: LOW (1 day)  
**Benefits**: Quick win, continuous resolution  
**Risks**: Doesn't solve parallel coordination  
**Recommendation**: Quick win if Phase 1 not feasible

---

#### Pathway 8: Minimal File Lock
**Concept**: Simplest possible - add file locking + continuous resolution.

**Changes Required**:
1. Continuous project resolution (every orchestrator run)
2. File locking (fcntl for atomic writes)
3. Restructure SESSION_STATE (state-centric format)
4. Hide agent identity in logs

**Implementation**:
```python
# Continuous resolution
def orchestrator_v4():
    project = resolve_project_continuous()  # EVERY TIME
    state_file = f"~/.claude/sessions/{project}/SESSION_STATE.md"
    state = read_state(state_file)
    # ...

# File locking
def write_state_atomic(state_file, state):
    with open(state_file, 'w') as f:
        fcntl.flock(f, fcntl.LOCK_EX)
        f.write(yaml.dump(state))
        fcntl.flock(f, fcntl.LOCK_UN)

# State-centric format
CURRENT_STATE:
  git:
    uncommitted_files: 2
  tests:
    status: passing

TASKS:
  - Validate uncommitted agents
  - Apply to system via chezmoi
```

**Effort**: VERY LOW (1-2 hours)  
**Benefits**: Solves immediate pain, minimal risk  
**Risks**: Doesn't address deeper architecture  
**Recommendation**: **Phase 1 - Implement NOW**

---

### Tier 2: Strategic Solutions (Consider Later)

#### Pathway 4: Event Sourcing
**Concept**: All changes as events, state computed from event log.

**Design**:
```yaml
EVENTS:
  - id: event_147
    timestamp: 2025-11-16T10:35:15Z
    type: validation_completed
    data: {files: [...]}

# State is DERIVED by replaying events
GROUND_TRUTH: compute_from_events(EVENTS)
```

**Effort**: VERY HIGH (10 days)  
**Benefits**: Complete audit trail, easy rollback  
**Risks**: Performance concerns, complexity  
**Recommendation**: Not for initial implementation

---

#### Pathway 5: External State Store (SQLite/Redis)
**Concept**: Use database instead of YAML files.

**Benefits**: Better concurrency, ACID transactions, faster queries  
**Risks**: Loses human-readable state, debugging harder  
**Recommendation**: For production scale (>100 sessions)

---

#### Pathway 6: Stateless Orchestration
**Concept**: No SESSION_STATE.md - observe system directly every time.

**Benefits**: Always fresh, no stale state  
**Risks**: Slow (API calls every invocation), no learned patterns  
**Recommendation**: Prototype for testing concepts only

---

#### Pathway 7: Git as State Store
**Concept**: Use git commits for state changes, git merge for conflict resolution.

**Design**:
```bash
# Every state change is a git commit
update_state() {
  echo "new state" > SESSION_STATE.md
  git add SESSION_STATE.md
  git commit -m "state: validation completed"
}

# Parallel coordination via branches
git checkout -b state/shell-12345
# ... make changes ...
git merge state/shell-67890  # Git handles conflicts
```

**Benefits**: Built-in versioning, conflict resolution, history  
**Risks**: Git is heavyweight (not designed for frequent commits)  
**Recommendation**: For daily snapshots, not real-time state

---

### Tier 3: Academic Curiosities (Don't Implement)

#### Pathway 9: CRDTs (Conflict-Free Replicated Data Types)
**Concept**: Data structures that merge without conflicts.

**Verdict**: Academically interesting, practically overkill. File locking is simpler.

---

#### Pathway 10: Actor Model (Erlang-style)
**Concept**: Shells as actors, message passing for coordination.

**Verdict**: Designed for distributed systems, way too complex for local shells.

---

#### Pathway 11: Operational Transforms (Google Docs-style)
**Concept**: Track operations, transform for conflict resolution.

**Verdict**: Powers Google Docs, but EXTREME overkill for this use case.

---

## Comparison Matrix

| Pathway | Effort | Parallel Support | Semantic Resolution | Backward Compat | Performance | Recommendation |
|---------|--------|------------------|---------------------|-----------------|-------------|----------------|
| 1. Full State-Centric | 7 days | ✅ Excellent | ✅ Continuous | ⚠️ Migration | ✅ Fast | Phase 3 |
| 2. Hybrid Agent-State | 3 days | ⚠️ Partial | ✅ Continuous | ✅ Full | ✅ Fast | Phase 2 |
| 3. State as Metadata | 1 day | ❌ None | ✅ Continuous | ✅ Full | ✅ Fast | Quick win |
| **8. Minimal File Lock** | **1-2 hours** | **✅ Basic** | **✅ Continuous** | **✅ Full** | **✅ Fast** | **Phase 1** ⭐ |
| 4. Event Sourcing | 10 days | ✅ Excellent | ✅ Continuous | ❌ Breaking | ⚠️ Slower | Later |
| 5. External Store | 7 days | ✅ Excellent | ✅ Continuous | ❌ Breaking | ✅ Very fast | Production |
| 6. Stateless | 2 days | ✅ Natural | ✅ Continuous | ✅ Full | ❌ Very slow | Prototype |
| 7. Git as State | 4 days | ✅ Good | ✅ Continuous | ✅ Full | ⚠️ Slower | Snapshots |
| 9-11. Academic | Weeks | Varies | Varies | ❌ | Varies | Never |

---

## Recommended Strategy: Progressive Enhancement

### Phase 1: Quick Win (This Week - 1-2 hours)
**Implement**: Pathway 8 - Minimal File Lock

**Deliverables**:
- `state_manager.py` - Read/write state with file locking
- `project_resolver.py` - Continuous semantic resolution
- Updated `work-continuity-orchestrator.md` - Uses new utilities
- New SESSION_STATE schema (state-centric format)
- Bats tests for file locking

**Benefits**:
✅ Continuous project resolution (primary pain point)  
✅ Parallel sessions work (via file locking)  
✅ State-centric format (cleaner SESSION_STATE)  
✅ Minimal risk (1-2 hour implementation)

---

### Phase 2: Strategic Foundation (Next Week - 3 days)
**Implement**: Pathway 2 - Hybrid Agent-State

**Deliverables**:
- Full GROUND_TRUTH section (git, tests, filesystem, notion, token_budget)
- TASKS section (derived from state gaps)
- METADATA section (learned patterns, work context)
- RESOURCE_LOCKS section (parallel coordination)
- Gap detection engine
- Backward compatibility with v3.0 agents

**Benefits**:
✅ Rich metadata for decision-making  
✅ Learned patterns tracked  
✅ Resource-based locking (not agent-based)  
✅ Gradual migration path

---

### Phase 3: Long-term Goal (Next Month - 7 days)
**Implement**: Pathway 1 - Full State-Centric

**Deliverables**:
- State transformer interface
- Agents as pure functions
- Complete migration from agent-centric
- Full parallel coordination
- Event-compatible design (for future event sourcing)

**Benefits**:
✅ Philosophically pure architecture  
✅ Highly testable (pure functions)  
✅ Production-ready parallel coordination  
✅ Foundation for future scaling

---

## Implementation Priority

**Execute Phase 1 NOW** because:
1. Solves immediate pain (continuous resolution, parallel sessions)
2. Minimal risk (1-2 hours, backward compatible)
3. Validates approach before larger investment
4. Provides foundation for Phase 2 & 3

**Defer Phase 2 & 3** until:
1. Phase 1 validated by user
2. User approves progressive strategy
3. Time available for larger refactor

---

## Success Criteria

### Phase 1
- [ ] Project resolution is continuous (re-evaluates every invocation)
- [ ] Two parallel shells can work on same project without conflicts
- [ ] SESSION_STATE.md is state-centric (no agent history)
- [ ] File locking prevents concurrent write corruption
- [ ] All existing agents continue working (backward compatible)

### Phase 2
- [ ] GROUND_TRUTH section tracks observable facts
- [ ] TASKS derived from state gaps (not prescribed)
- [ ] Learned patterns accumulate in metadata
- [ ] Resource locks coordinate parallel work
- [ ] Gap detection engine identifies work automatically

### Phase 3
- [ ] Agents are pure state transformers
- [ ] No agent identity in state (only transformation results)
- [ ] Full parallel coordination (multiple shells, multiple projects)
- [ ] Production-ready error recovery
- [ ] Complete migration from v3.0

---

## References

- Sequential thinking analysis: 31 thoughts, 11 pathways explored
- User directive: "state-centric (truth, tasklist, operating state, rich metadata)"
- Pain points: Continuous resolution, parallel sessions, agent-centric logging

**Next Steps**: See `SESSION_STATE_V4_SCHEMA.md` and `IMPLEMENTATION_ROADMAP.md`
