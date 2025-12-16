# Implementation Roadmap: State-Centric Architecture
**Status**: Ready for Phase 1 Execution  
**Strategy**: Progressive Enhancement (3 Phases)

---

## Phase 1: Quick Win (This Week)
**Timeline**: 1-2 hours  
**Risk**: LOW  
**Priority**: HIGH ⭐

### Goal
Solve immediate pain points with minimal code changes.

### Deliverables

#### 1. `state_manager.py`
Utility for reading/writing state with file locking.

```python
import fcntl
import yaml
from pathlib import Path

class StateManager:
    def __init__(self, state_file: Path):
        self.state_file = state_file
    
    def read_state(self):
        """Read state with shared lock."""
        with open(self.state_file, 'r') as f:
            fcntl.flock(f, fcntl.LOCK_SH)  # Shared lock (multiple readers)
            state = yaml.safe_load(f)
            fcntl.flock(f, fcntl.LOCK_UN)
            return state
    
    def write_state(self, state):
        """Write state with exclusive lock."""
        with open(self.state_file, 'w') as f:
            fcntl.flock(f, fcntl.LOCK_EX)  # Exclusive lock (single writer)
            yaml.dump(state, f, default_flow_style=False)
            fcntl.flock(f, fcntl.LOCK_UN)
    
    def update_section(self, section_path, new_value):
        """Atomically update a section."""
        state = self.read_state()
        set_nested(state, section_path, new_value)
        self.write_state(state)

def set_nested(dictionary, path, value):
    """Set nested dictionary value via dot notation."""
    keys = path.split('.')
    for key in keys[:-1]:
        dictionary = dictionary.setdefault(key, {})
    dictionary[keys[-1]] = value
```

#### 2. `project_resolver.py`
Continuous semantic project resolution.

```python
import os
import subprocess
from pathlib import Path

class ProjectResolver:
    def __init__(self, config_file='~/.claude/project_mapping.yml'):
        self.config = self.load_config(config_file)
    
    def resolve_project_continuous(self):
        """
        Resolve project on EVERY invocation (not cached).
        Returns: (project_name, confidence, signals)
        """
        signals = {}
        
        # Signal 1: Working directory (HIGH confidence)
        pwd = os.getcwd()
        signals['pwd'] = self.classify_directory(pwd)
        
        # Signal 2: Git context (MEDIUM confidence)
        if self.in_git_repo():
            remote = self.git_remote_url()
            signals['git'] = self.classify_git_remote(remote)
        
        # Signal 3: Recent file activity (MEDIUM confidence)
        recent_files = self.get_recent_files(minutes=10)
        signals['recent_files'] = self.classify_files(recent_files)
        
        # Signal 4: User override (HIGHEST confidence)
        override = os.environ.get('CLAUDE_PROJECT')
        if override:
            signals['user_override'] = {
                'project': override,
                'confidence': 1.0,
                'reason': 'Explicit user override'
            }
        
        # Weighted vote
        return self.weighted_vote(signals)
    
    def classify_directory(self, pwd):
        """Map directory to project."""
        if '.local/share/chezmoi' in pwd:
            return {'project': 'dotfiles', 'confidence': 0.9}
        elif 'Comics' in pwd:
            return {'project': 'manga', 'confidence': 0.9}
        # ... more mappings from config ...
        return {'project': 'unknown', 'confidence': 0.1}
    
    def weighted_vote(self, signals):
        """Compute weighted vote from all signals."""
        votes = {}
        for signal_name, signal in signals.items():
            project = signal['project']
            weight = signal['confidence']
            votes[project] = votes.get(project, 0) + weight
        
        winner = max(votes.items(), key=lambda x: x[1])
        total_weight = sum(votes.values())
        
        return {
            'project': winner[0],
            'confidence': winner[1] / total_weight,
            'signals': signals,
            'alternatives': sorted(votes.items(), key=lambda x: -x[1])[1:]
        }
```

#### 3. Updated `work-continuity-orchestrator.md`
Modify orchestrator to use continuous resolution.

**Changes**:
```markdown
## Phase 1: State Gathering → State Reading

# OLD (v3.0):
project = resolve_project()  # Once at startup

# NEW (v4.0):
resolver = ProjectResolver()
project_info = resolver.resolve_project_continuous()  # Every invocation
project = project_info['project']

state_file = f"~/.claude/sessions/{project}/SESSION_STATE.md"
state_manager = StateManager(state_file)
state = state_manager.read_state()
```

#### 4. New SESSION_STATE Template
Use minimal schema (see `SESSION_STATE_V4_SCHEMA.md`).

#### 5. Tests
```bash
# tests/state_management.bats

@test "File locking prevents concurrent writes" {
  # Start two writers simultaneously
  python state_manager.py write "test1" &
  python state_manager.py write "test2" &
  wait
  
  # State should be valid (not corrupted)
  python state_manager.py validate
}

@test "Project resolution is continuous" {
  # Resolve in dotfiles directory
  cd ~/.local/share/chezmoi
  result=$(python project_resolver.py)
  [ "$result" = "dotfiles" ]
  
  # Resolve in manga directory
  cd ~/Library/.../Comics
  result=$(python project_resolver.py)
  [ "$result" = "manga" ]
}
```

### Success Criteria
- [ ] Two parallel shells can work on same project without state file corruption
- [ ] Project resolution re-evaluates on every orchestrator invocation
- [ ] SESSION_STATE.md uses state-centric format (no agent history)
- [ ] All existing agents continue working (backward compatible)

### Estimated Effort
- `state_manager.py`: 30 minutes
- `project_resolver.py`: 30 minutes
- Orchestrator updates: 15 minutes
- Testing: 15 minutes
- **Total: 1.5 hours**

---

## Phase 2: Strategic Foundation (Next Week)
**Timeline**: 3 days  
**Risk**: MEDIUM  
**Priority**: MEDIUM

### Goal
Add rich state infrastructure without breaking existing system.

### Deliverables

#### 1. Full CURRENT_STATE Section
Expand from minimal to complete observable facts:
- Git (detailed status, uncommitted files with metadata)
- Tests (full test suite status)
- Filesystem (chezmoi source + deployed)
- Notion (sync status)
- Token budget (detailed tracking)

#### 2. TASKS Section
Derived from state gaps, not prescribed.

**Gap Detection Engine**:
```python
def detect_gaps(state):
    gaps = []
    
    # Gap: Uncommitted files
    if state['CURRENT_STATE']['git']['uncommitted_files'] > 0:
        gaps.append({
            'id': generate_id(),
            'type': 'unvalidated_changes',
            'priority': 'P1',
            'description': f"{state['git']['uncommitted_files']} uncommitted files",
            'resolution_criteria': ['validate_frontmatter', 'no_syntax_errors']
        })
    
    # Gap: Test failures
    if state['CURRENT_STATE']['tests']['failed'] > 0:
        gaps.append({
            'id': generate_id(),
            'type': 'broken_tests',
            'priority': 'P0',
            'description': f"{state['tests']['failed']} tests failing"
        })
    
    # ... more gap detectors ...
    
    return prioritize_gaps(gaps)
```

#### 3. METADATA Sections
- PROJECT_RESOLUTION (full signals)
- WORK_CONTEXT (why state exists)
- LEARNED_PATTERNS (accumulated knowledge)

#### 4. RESOURCE_LOCKS
Enable resource-based parallel coordination.

```python
def acquire_lock(state, resource_name, pid):
    if state['RESOURCE_LOCKS'][resource_name]['locked']:
        return {'success': False, 'wait_until': state['RESOURCE_LOCKS'][resource_name]['estimated_release']}
    
    state['RESOURCE_LOCKS'][resource_name] = {
        'locked': True,
        'locked_by': pid,
        'locked_at': now(),
        'estimated_release': now() + timedelta(minutes=5)
    }
    return {'success': True}
```

#### 5. Backward Compatibility Layer
```python
def read_state_with_migration(state_file):
    state = read_yaml(state_file)
    
    if state.get('SCHEMA_VERSION', '3.0.0') == '3.0.0':
        # Auto-migrate v3.0 → v4.0
        return migrate_v3_to_v4(state)
    
    return state
```

### Success Criteria
- [ ] GROUND_TRUTH section tracks all observable facts
- [ ] TASKS derived from state gaps (not prescribed)
- [ ] Learned patterns accumulate in metadata
- [ ] Resource locks coordinate parallel work
- [ ] v3.0 state files auto-migrate to v4.0

### Estimated Effort
- Full CURRENT_STATE: 1 day
- Gap detection engine: 1 day
- Metadata + resource locks: 0.5 days
- Migration layer: 0.5 days
- **Total: 3 days**

---

## Phase 3: Long-term Goal (Next Month)
**Timeline**: 7 days  
**Risk**: HIGH  
**Priority**: LOW (defer until Phase 1 & 2 validated)

### Goal
Pure state-centric architecture with agents as transformers.

### Deliverables

#### 1. State Transformer Interface
```python
from typing import Protocol

class StateTransformer(Protocol):
    def transform(self, state: SessionState, task: Task) -> SessionState:
        """Pure function: Same input → same output"""
        ...
```

#### 2. Migrate Agents to Transformers
Convert existing agents (agent-validator, chezmoi-workflow-agent, etc.) to pure state transformers.

#### 3. Orchestrator v5.0
- Reads state
- Detects gaps
- Matches capabilities to gaps
- Executes transformers
- Writes new state

#### 4. Full Parallel Coordination
- Multi-shell support
- Multi-project support
- Stale lock detection
- Conflict resolution

#### 5. Production Hardening
- Error recovery (backup/restore)
- Performance optimization
- Comprehensive testing
- Migration guide

### Success Criteria
- [ ] Agents are pure state transformers
- [ ] No agent identity in state
- [ ] Full parallel coordination works
- [ ] Production-ready error recovery
- [ ] Complete v3.0 deprecation

### Estimated Effort
- Transformer interface: 1 day
- Agent migration: 3 days
- Orchestrator v5.0: 2 days
- Production hardening: 1 day
- **Total: 7 days**

---

## Dependencies

### Phase 1
- **Required**: None (standalone)
- **Optional**: User review of architecture analysis

### Phase 2
- **Required**: Phase 1 complete and validated
- **Optional**: User approval of progressive strategy

### Phase 3
- **Required**: Phase 2 complete, user approval for breaking changes
- **Optional**: Production use cases identified

---

## Rollback Plan

### Phase 1
- Minimal risk - orchestrator can read old format
- Rollback: Revert orchestrator changes, keep v3.0 format

### Phase 2
- Medium risk - auto-migration from v3.0
- Rollback: Disable migration, use v3.0 format

### Phase 3
- High risk - agents rewritten
- Rollback: Keep v3.0 agents alongside v4.0 (dual system)

---

## Decision Gates

### Before Phase 1
- [ ] User reviews architecture analysis
- [ ] User approves Phase 1 scope

### Before Phase 2
- [ ] Phase 1 validated in production (1 week)
- [ ] User approves progressive strategy
- [ ] No major issues discovered

### Before Phase 3
- [ ] Phase 2 validated in production (2 weeks)
- [ ] User approves breaking changes
- [ ] Clear migration path for existing agents

---

## References

- Architecture analysis: `STATE_CENTRIC_ANALYSIS.md`
- Schema specification: `SESSION_STATE_V4_SCHEMA.md`
- User directive: Continuous semantic resolution, parallel sessions, state-centric tracking
