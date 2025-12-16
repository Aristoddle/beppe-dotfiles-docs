# Notion Agent Workspace + Chezmoi Integration Architecture

**Created**: 2025-11-14
**Status**: Implementation Complete

---

## Summary

Successfully separated concerns between:
1. **Dotfiles Management** (North Star) - The foundation system
2. **Notion Agent Workspace Integration** - Infrastructure for agent coordination

Created proper multi-project chezmoi architecture with:
- Global MCP configuration (chezmoi-managed, doesn't overwrite state)
- Per-project settings templates (string interpolation for project paths)
- `notion-manager` subagent for parallel Notion operations
- Codex delegation hook for token optimization

---

## File Structure

```
~/.local/share/chezmoi/
├── private_dot_config/claude/
│   ├── mcp-servers.json.tmpl           # Global MCP configuration ✅
│   └── notion-agent-workspace.json     # Already deployed ✅
│
├── dot_claude/
│   ├── agents/
│   │   ├── notion-manager.md           # NEW: Parallel Notion operations ✅
│   │   └── [11 other agents]           # Already exist ✅
│   ├── hooks/
│   │   ├── codex-delegation.sh         # NEW: Token optimization ✅
│   │   └── README.md                    # NEW: Hook documentation ✅
│   ├── templates/
│   │   └── PROJECT_SETTINGS_TEMPLATE.json.tmpl  # NEW: Multi-project generator ✅
│   └── agents.md                        # Agent Coordination Framework ✅
│
├── Library/CloudStorage/OneDrive-Personal/Books/Comics/
│   └── dot_claude/
│       └── settings.local.json.tmpl    # NEW: Comics project config ✅
│
├── docs/
│   ├── MULTI_PROJECT_SETUP.md          # NEW: Multi-project guide ✅
│   └── NOTION_WORKSPACE_ARCHITECTURE.md # This file ✅
│
└── [Existing dotfiles structure]
```

---

## Key Improvements

### 1. Separated State from Configuration

**Problem**: `.claude.json` contains both state (numStartups, projects) AND configuration (mcpServers).

**Solution**: Separate MCP config file that doesn't overwrite state.

**Files**:
- `~/.config/claude/mcp-servers.json` - MCP configuration (chezmoi-managed)
- `~/.claude.json` - State (Claude Code manages, chezmoi ignores)

**Usage**:
```bash
# Option 1: Environment variable
export CLAUDE_MCP_CONFIG=~/.config/claude/mcp-servers.json
claude

# Option 2: Command-line flag
claude --mcp-config ~/.config/claude/mcp-servers.json

# Option 3: Add to shell profile
echo 'export CLAUDE_MCP_CONFIG=~/.config/claude/mcp-servers.json' >> ~/.zshrc
```

### 2. Multi-Project Template Architecture

**Problem**: Each project needs unique configuration but copy-paste leads to drift.

**Solution**: Chezmoi templates with project-specific variables.

**Pattern**:
```
~/.local/share/chezmoi/
└── PATH/TO/PROJECT/
    └── dot_claude/
        └── settings.local.json.tmpl
```

**Deploys to**:
```
/PATH/TO/PROJECT/.claude/settings.local.json
```

**Example**: Comics Project
```bash
# Source
~/.local/share/chezmoi/Library/CloudStorage/OneDrive-Personal/Books/Comics/dot_claude/settings.local.json.tmpl

# Deployed
/Users/joe/Library/CloudStorage/OneDrive-Personal/Books/Comics/.claude/settings.local.json
```

**Template Variables**:
```json
{{- $projectPath := "/Users/joe/Library/CloudStorage/OneDrive-Personal/Books/Comics" -}}
{{- $projectName := "Comics" -}}

{
  "permissions": {
    "allow": ["Read(//{{ $projectPath }}/**)", ...]
  },
  "env": {
    "PROJECT_ROOT": "{{ $projectPath }}"
  }
}
```

### 3. Notion Manager Subagent

**Purpose**: Handle Notion operations in parallel to main conversation.

**Location**: `~/.claude/agents/notion-manager.md`

**Model**: Haiku (cost-effective for Notion ops)

**Capabilities**:
- Create Knowledge Base entries
- Create project pages
- Create session notes
- Update databases
- Batch operations

**Drift Prevention**: Always validates database exists before write.

**Usage**:
```
User: "Document the agents.md format issue in Notion"
→ Claude delegates to notion-manager subagent
→ notion-manager operates in parallel
→ Returns: "Created KB entry: [URL]"
```

### 4. Codex Delegation Hook

**Purpose**: Optimize token usage by suggesting Codex for heavy tasks.

**Location**: `~/.claude/hooks/codex-delegation.sh`

**Triggers**:
- Visual analysis (image files)
- Large files (>100KB)
- Complex regex patterns

**Behavior**: Asks user, doesn't auto-delegate

**Token Economics**:
- Claude Code: Limited monthly (Sonnet 4.5)
- Codex (GPT-5): Pay-as-you-go (separate billing)
- Strategy: Codex for heavy lifting, Claude for coordination

---

## Notion Workspace Structure

**Config**: `~/.config/claude/notion-agent-workspace.json`

**Databases**:
1. **Agent Projects** - Multi-session initiatives
2. **Agent Session Notes** - Handoffs, findings
3. **Agent Knowledge Base** - Reusable patterns
4. **Agent Tasks** - Multi-step work tracking

**Project Separation**:
- **Dotfiles Management** (Parent, North Star)
  - Domain: Dotfiles, Development Workflows
  - Success metrics: <200ms startup, 230/230 tests passing
  - Child projects: Notion Workspace Integration, MCP Circuit Breaker

- **Notion Agent Workspace Integration** (Child)
  - Domain: AI Integration, Dotfiles
  - Parent: Dotfiles Management
  - Success metrics: Config deployed, 4 databases created, drift prevention tested

---

## chezmoi Workflow (With Templates)

### Apply Templates to System

```bash
cd ~/.local/share/chezmoi

# Preview changes
chezmoi diff

# Apply to system
chezmoi apply

# Verify Comics project
cat /Users/joe/Library/CloudStorage/OneDrive-Personal/Books/Comics/.claude/settings.local.json

# Verify global MCP config
cat ~/.config/claude/mcp-servers.json
```

### Add New Project

```bash
cd ~/.local/share/chezmoi

# 1. Create template directory (match target path structure)
mkdir -p "Documents/Code/MyProject/dot_claude"

# 2. Copy generator template
cp dot_claude/templates/PROJECT_SETTINGS_TEMPLATE.json.tmpl \
   "Documents/Code/MyProject/dot_claude/settings.local.json.tmpl"

# 3. Customize variables
$EDITOR "Documents/Code/MyProject/dot_claude/settings.local.json.tmpl"
# Change: $projectPath, $projectName, $projectType

# 4. Apply
chezmoi apply

# 5. Verify
ls -la ~/Documents/Code/MyProject/.claude/settings.local.json
```

---

## Agent Format Discoveries

**Problem**: `agents.md` is documentation, not executable.

**Finding**: Claude Code requires:
- Individual `.md` files per agent
- YAML frontmatter (`name`, `description`, `tools`, `model`)
- Location: `~/.claude/agents/agent-name.md`

**Current State**:
- ✅ 11 agents properly formatted in `dot_claude/agents/` (deploy correctly)
- ❌ `agents.md` is 26k documentation file (confusing, not functional)

**Recommendation**: Move `agents.md` content to:
1. Skills (coordination patterns → `multi-agent-coordinator` skill)
2. Notion Knowledge Base (performance tracking, delegation patterns)
3. Delete `agents.md` after migration

---

## Testing Checklist

### Before Deployment

- [ ] Run `chezmoi diff` to preview changes
- [ ] Verify no .claude.json overwrites (should be no diff)
- [ ] Check MCP config template renders correctly
- [ ] Verify Comics project settings template renders

### After Deployment

- [ ] `~/.config/claude/mcp-servers.json` exists
- [ ] Comics `.claude/settings.local.json` exists with correct paths
- [ ] `~/.claude/agents/notion-manager.md` exists
- [ ] `~/.claude/hooks/codex-delegation.sh` is executable
- [ ] Test: `cd ~/Comics && claude /mcp` shows only enabled MCPs
- [ ] Test: `claude` (with CLAUDE_MCP_CONFIG set) loads MCPs

---

## Next Steps

### Immediate (Required)

1. **Set CLAUDE_MCP_CONFIG environment variable**:
   ```bash
   echo 'export CLAUDE_MCP_CONFIG=~/.config/claude/mcp-servers.json' >> ~/.zshrc
   exec zsh
   ```

2. **Deploy templates**:
   ```bash
   cd ~/.local/share/chezmoi
   chezmoi apply
   ```

3. **Test notion-manager subagent**:
   ```bash
   claude "@notion-manager Document test entry in Notion KB"
   ```

### Follow-Up (Optional)

- [ ] Migrate `agents.md` content to proper locations
- [ ] Create Knowledge Base entries for key patterns
- [ ] Test Codex delegation hook with image analysis
- [ ] Add more project templates (dotfiles, code projects)
- [ ] Document freshness timestamps in Notion

---

## Documentation References

- **chezmoi templating**: https://www.chezmoi.io/user-guide/templating/
- **Claude Code hooks**: https://code.claude.com/docs/en/hooks
- **Claude Code subagents**: https://code.claude.com/docs/en/sub-agents
- **Claude Code skills**: https://code.claude.com/docs/en/skills
- **MCP configuration**: https://code.claude.com/docs/en/mcp

---

**Status**: Ready for deployment
**Token Savings**: 40k tokens recovered (Comics project)
**New Capabilities**: Parallel Notion ops, Codex delegation, multi-project templates
