# SESSION_STATE v4.0 Schema Specification
**Version**: 4.0.0  
**Status**: Design Phase  
**Breaking Changes**: Yes (from v3.0)  
**Migration**: See end of document

---

## Design Philosophy

**v3.0 (Agent-Centric)**:
- Tracks WHO did WHAT
- "orchestrator delegated to agent-validator at 10:32am"
- Agent identity is architecture

**v4.0 (State-Centric)**:
- Tracks WHAT IS TRUE and WHAT NEEDS DOING
- "2 uncommitted files exist, validation needed"
- Agent identity is implementation detail

---

## Full Schema

```yaml
# ==============================================================================
# METADATA (Schema Version & Project Context)
# ==============================================================================
SCHEMA_VERSION: "4.0.0"
LAST_UPDATED: "2025-11-16T10:45:00Z"
PROJECT: "dotfiles"  # Resolved continuously, not cached

# ==============================================================================
# CURRENT_STATE (Observable Facts)
# ==============================================================================
CURRENT_STATE:
  # Git repository state
  git:
    repository: "~/.local/share/chezmoi"
    status: "dirty"  # clean | dirty | unknown
    branch: "main"
    commits_ahead: 0
    commits_behind: 0
    uncommitted_files:
      count: 2
      files:
        - path: "dot_claude/agents/content-pruner.md"
          modified: "2025-11-16T09:15:00Z"
          size_bytes: 4521
          validated: false  # Metadata: has this been validated?
        - path: "dot_claude/agents/breaking-change-detector.md"
          modified: "2025-11-16T09:20:00Z"
          size_bytes: 6234
          validated: false
    last_commit:
      hash: "abc123def456"
      message: "feat(agents): Add content-pruner skill"
      timestamp: "2025-11-15T18:45:00Z"
      author: "User <user@example.com>"
  
  # Test suite state
  tests:
    last_run: "2025-11-16T10:30:00Z"
    status: "passing"  # passing | failing | not_run
    total: 42
    passed: 42
    failed: 0
    skipped: 0
    failures: []  # List of failing tests when status=failing
  
  # File system state
  filesystem:
    chezmoi_source:
      path: "~/.local/share/chezmoi"
      modified: "2025-11-16T09:20:00Z"
      size_mb: 12.5
    deployed_config:
      path: "~/.config/zsh"
      modified: "2025-11-16T09:21:00Z"
      size_mb: 8.3
      in_sync: false  # Is deployed config in sync with source?
  
  # Notion workspace state
  notion_workspace:
    last_synced: "2025-11-16T10:00:00Z"
    sync_status: "synced"  # synced | pending | failed
    pending_updates:
      count: 0
      items: []
  
  # Token budget state
  token_budget:
    current: 66835
    limit: 200000
    percentage: 33.4
    estimated_sessions_remaining: 20

# ==============================================================================
# TASKS (What Needs Doing - Derived from State Gaps)
# ==============================================================================
TASKS:
  # Priority 0: Blockers (prevents all other work)
  P0_blockers: []
  
  # Priority 1: Urgent (blocks specific workflows)
  P1_urgent:
    - id: "task_001"
      description: "2 uncommitted agents need validation"
      gap_type: "unvalidated_changes"
      discovered_at: "2025-11-16T10:32:15Z"
      discovery_method: "git_status_check"
      blocking:
        - "chezmoi_apply"  # Can't apply until validated
      resolution_criteria:
        - "All files pass frontmatter validation"
        - "No YAML syntax errors"
        - "All required fields present"
      required_capabilities:
        - "yaml_parsing"
        - "file_reading"
        - "agent_schema_validation"
      required_resources:
        - "filesystem:dot_claude/agents/"
        - "lock:chezmoi_source"
      estimated_effort:
        complexity: "low"
        time_minutes: 5
        confidence: 0.9
  
  # Priority 2: Maintenance (improves but not urgent)
  P2_maintenance: []
  
  # Priority 3: Improvements (nice to have)
  P3_improvements: []

# ==============================================================================
# PROJECT_RESOLUTION (Continuous Semantic Resolution)
# ==============================================================================
PROJECT_RESOLUTION:
  project: "dotfiles"
  confidence: 0.95
  resolved_at: "2025-11-16T10:45:00Z"
  method: "continuous_semantic"
  
  # Signals used for resolution
  signals:
    pwd:
      project: "dotfiles"
      confidence: 0.9
      reason: "Working directory: ~/.local/share/chezmoi"
    
    git:
      project: "dotfiles"
      confidence: 0.7
      reason: "Git remote: beppe-system-bootstrap"
    
    recent_files:
      project: "dotfiles"
      confidence: 0.6
      reason: "Recent activity: 2 files in dot_claude/"
    
    user_override:
      project: null  # No explicit override
      confidence: 0.0
  
  # Alternative interpretations (lower confidence)
  alternatives:
    - project: "manga"
      confidence: 0.05
      reason: "No recent manga-related activity"

# ==============================================================================
# WORK_CONTEXT (Why State Exists)
# ==============================================================================
WORK_CONTEXT:
  current_phase: "phase_5_active"
  current_activity:
    type: "agent_system_refinement"
    started_at: "2025-11-16T09:00:00Z"
    status: "in_progress"
  
  uncommitted_files_context:
    reason: "mid_refactor"
    confidence: 0.8
    evidence:
      - "Files modified within last 2 hours"
      - "User actively in chezmoi directory"
      - "No commit message drafted yet"
    inferred_intent: "Testing new agent patterns before committing"
    alternative_interpretations:
      - intent: "Forgot to commit"
        confidence: 0.2
  
  blockers: []  # Nothing blocking progress

# ==============================================================================
# LEARNED_PATTERNS (Accumulated Knowledge)
# ==============================================================================
LEARNED_PATTERNS:
  - pattern: "Always validate agents before commit"
    confidence: 1.0
    sample_size: 15
    last_observed: "2025-11-16T10:32:00Z"
    applies_to: ["dotfiles"]
  
  - pattern: "chezmoi apply after agent changes"
    confidence: 1.0
    sample_size: 8
    last_observed: "2025-11-16T09:21:00Z"
    applies_to: ["dotfiles"]
  
  - pattern: "Mid-refactor uncommitted files normal for <4 hours"
    confidence: 0.9
    sample_size: 15
    last_observed: "2025-11-16T09:00:00Z"
    applies_to: ["dotfiles", "all_projects"]

# ==============================================================================
# RESOURCE_LOCKS (Parallel Session Coordination)
# ==============================================================================
RESOURCE_LOCKS:
  chezmoi_source:
    locked: false
    locked_by: null  # PID when locked
    locked_at: null
    locked_for: null
    estimated_release: null
  
  notion_workspace:
    locked: false
  
  git_repository:
    locked: false

# ==============================================================================
# STATE_HISTORY (Last 20 Significant Changes)
# ==============================================================================
STATE_HISTORY:
  - timestamp: "2025-11-16T10:32:15Z"
    change_type: "state_update"
    section: "CURRENT_STATE.git.uncommitted_files"
    summary: "Added 2 new uncommitted agents"
    changed_by_process: 12345  # PID, not agent name
  
  - timestamp: "2025-11-16T10:30:00Z"
    change_type: "task_completed"
    task_id: "task_000"
    summary: "Tests validated, all passing"
  
  - timestamp: "2025-11-16T09:21:00Z"
    change_type: "state_update"
    section: "CURRENT_STATE.filesystem.deployed_config"
    summary: "chezmoi apply executed successfully"
```

---

## Minimal Schema (Phase 1)

For Phase 1 implementation, use simplified schema:

```yaml
SCHEMA_VERSION: "4.0.0"
PROJECT: "dotfiles"  # Resolved continuously

CURRENT_STATE:
  git:
    uncommitted_files: 2
    status: "dirty"
  tests:
    status: "passing"
  token_budget: 66835

TASKS:
  - "Validate uncommitted agents"
  - "Apply to system via chezmoi"

PROJECT_RESOLUTION:
  confidence: 0.95
  signals:
    pwd: "dotfiles"
    git: "dotfiles"
```

Expand to full schema in Phase 2.

---

## Migration Guide: v3.0 → v4.0

### v3.0 Format (Agent-Centric)
```yaml
NEXT_ACTIONS:
  - action: "Validate uncommitted agents"
    assigned_to: "agent-validator"
    created_by: "orchestrator-v3"
    priority: "P1"
    created_at: "2025-11-16T10:30:00Z"

RECENT_WORK:
  - agent: "orchestrator-v3"
    action: "Analyzed git status"
    timestamp: "2025-11-16T10:29:00Z"
```

### v4.0 Format (State-Centric)
```yaml
CURRENT_STATE:
  git:
    uncommitted_files: 2
    status: "dirty"

TASKS:
  P1_urgent:
    - id: "task_001"
      description: "2 uncommitted agents need validation"
      gap_type: "unvalidated_changes"

STATE_HISTORY:
  - timestamp: "2025-11-16T10:29:00Z"
    change_type: "state_update"
    section: "CURRENT_STATE.git"
    summary: "Git status analyzed"
    # NO agent identity - just what changed
```

### Key Differences

| Aspect | v3.0 | v4.0 |
|--------|------|------|
| Focus | Agent actions | State truth |
| Tasks | Prescribed ("agent X should do Y") | Derived ("gap exists, needs resolution") |
| History | Agent activity log | State change log |
| Identity | Agent names everywhere | Process IDs only (hidden) |
| Metadata | Minimal | Rich (project resolution, learned patterns) |

### Backward Compatibility

Orchestrator v4.0 can READ v3.0 format:
```python
def read_state(state_file):
    state = yaml.load(state_file)
    
    if state.get('SCHEMA_VERSION', '3.0.0') == '3.0.0':
        # Convert v3.0 → v4.0
        return migrate_v3_to_v4(state)
    
    return state

def migrate_v3_to_v4(v3_state):
    """Automatic migration."""
    return {
        'SCHEMA_VERSION': '4.0.0',
        'CURRENT_STATE': derive_state_from_v3(v3_state),
        'TASKS': convert_next_actions_to_tasks(v3_state['NEXT_ACTIONS']),
        # ...
    }
```

---

## Validation Rules

### Required Fields
- `SCHEMA_VERSION` (must be "4.0.0")
- `PROJECT` (must be valid project name)
- `CURRENT_STATE` (must have at least one sub-section)

### Optional Fields
- `TASKS` (if empty, no work needed)
- `PROJECT_RESOLUTION` (can be computed if missing)
- `WORK_CONTEXT` (can be inferred if missing)
- `LEARNED_PATTERNS` (empty for new projects)
- `RESOURCE_LOCKS` (defaults to all unlocked)
- `STATE_HISTORY` (empty for new sessions)

### Schema Validation
```python
from jsonschema import validate

schema = {
    "type": "object",
    "required": ["SCHEMA_VERSION", "PROJECT", "CURRENT_STATE"],
    "properties": {
        "SCHEMA_VERSION": {"const": "4.0.0"},
        "PROJECT": {"type": "string"},
        "CURRENT_STATE": {
            "type": "object",
            "minProperties": 1
        }
    }
}

validate(instance=state, schema=schema)
```

---

## File Locations

**Per-Project State**:
- `~/.claude/sessions/dotfiles/SESSION_STATE.md`
- `~/.claude/sessions/manga/SESSION_STATE.md`

**Global State** (Phase 2+):
- `~/.claude/GLOBAL_STATE.md` (cross-project resources, learned patterns)

**Backups**:
- `~/.claude/sessions/dotfiles/history/YYYY-MM-DD/SESSION_STATE.md` (daily snapshots)

---

## References

- Architecture analysis: `STATE_CENTRIC_ANALYSIS.md`
- Implementation roadmap: `IMPLEMENTATION_ROADMAP.md`
- User directive: State-centric (truth, tasklist, operating state, rich metadata)
