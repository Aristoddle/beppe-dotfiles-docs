# Claude Code Multi-Project Architecture

**Purpose**: Manage Claude Code configurations for multiple projects using chezmoi data-driven templates.

## Architecture Overview

### Single Source of Truth: `.chezmoidata.toml`

All project configurations are defined in one data file:

```toml
[projects.myproject]
name = "My Project"
path = "/path/to/project"
description = "Project description"
disabled_mcps = ["mcp1", "mcp2"]
custom_permissions = [
  "Read(/path/to/project/**)",
  "Write(/path/to/project/**)"
]
```

### Auto-Generation Script

When `.chezmoidata.toml` changes, `run_onchange_generate-project-configs.sh` automatically:

1. Reads all project definitions from `.chezmoidata.toml`
2. Generates `<project>/.claude/settings.local.json` for each project
3. Applies project-specific MCP disabling and permissions

### File Hierarchy

```
~/.local/share/chezmoi/
├── .chezmoidata.toml                          # Project definitions (EDIT THIS)
├── .chezmoiscripts/
│   └── run_onchange_generate-project-configs.sh  # Auto-generator (chezmoi runs this)
├── dot_claude.json.tmpl                       # Global MCP config
├── dot_claude/
│   ├── private_settings.json.tmpl             # Global defaults
│   ├── agents/                                # Global subagents
│   │   ├── notion-manager.md                 # Parallel Notion operations
│   │   └── *.md                              # Other subagents
│   ├── hooks/
│   │   └── codex-delegation.sh               # Codex auto-delegation
│   └── skills/                                # Global skills
└── docs/
    └── CLAUDE_CODE_MULTI_PROJECT.md          # This file

Generated files (not in chezmoi):
/path/to/project/.claude/settings.local.json   # Auto-generated per project
```

## Adding a New Project

### Step 1: Edit `.chezmoidata.toml`

```bash
cd ~/.local/share/chezmoi
chezmoi edit .chezmoidata.toml
```

Add your project:

```toml
[projects.myproject]
name = "My Awesome Project"
path = "/Users/joe/Projects/MyAwesomeProject"
description = "What this project does"
disabled_mcps = ["things", "apple-notes"]  # MCPs you don't need for this project
custom_permissions = [
  "Read(/Users/joe/Projects/MyAwesomeProject/**)",
  "Edit(/Users/joe/Projects/MyAwesomeProject/**)",
  "Write(/Users/joe/Projects/MyAwesomeProject/**)"
]
```

### Step 2: Apply Changes

```bash
chezmoi apply
```

This automatically:
- Runs `run_onchange_generate-project-configs.sh`
- Generates `/Users/joe/Projects/MyAwesomeProject/.claude/settings.local.json`
- Configures project-specific permissions and disabled MCPs

### Step 3: Verify

```bash
cat /Users/joe/Projects/MyAwesomeProject/.claude/settings.local.json
```

## How It Works: Chezmoi Template System

### Why NOT Use Wildcards?

Chezmoi **does not support wildcards** in source paths. Each file needs an explicit source location.

**Wrong Approach** (doesn't work):
```
~/.local/share/chezmoi/**/dot_claude/settings.local.json.tmpl  # ❌ No wildcard support
```

**Correct Approach** (data-driven):
```
~/.local/share/chezmoi/.chezmoidata.toml                      # ✅ Define all projects
~/.local/share/chezmoi/.chezmoiscripts/run_onchange_*.sh      # ✅ Generate configs
```

### Template Variables Available

Inside `.tmpl` files, you have access to:

```go-template
{{ .chezmoi.homeDir }}              // /Users/joe
{{ .chezmoi.sourceDir }}            // /Users/joe/.local/share/chezmoi
{{ .chezmoi.os }}                   // darwin
{{ .projects.comics.path }}         // From .chezmoidata.toml
{{ .projects.comics.name }}         // From .chezmoidata.toml
```

## Managing Configurations

### Global Config (All Projects)

Edit global MCP servers and defaults:

```bash
chezmoi edit ~/.claude.json          # MCP server definitions
chezmoi edit ~/.claude/settings.json # Global defaults
chezmoi apply
```

### Project-Specific Config

Edit project definition in data file:

```bash
chezmoi edit .chezmoidata.toml       # Add/modify project
chezmoi apply                        # Regenerates all project configs
```

### Local Overrides (Not Managed)

For temporary project-specific changes:

```bash
# Edit directly (not managed by chezmoi)
nano /path/to/project/.claude/settings.local.json

# Revert to generated version
chezmoi apply  # Overwrites local changes with generated config
```

## MCP Management Per Project

### Disable Specific MCPs for a Project

Comics project example (doesn't need Things, Apple Notes, etc.):

```toml
[projects.comics]
disabled_mcps = ["things", "apple-notes", "control-chrome", "filesystem", "imessage"]
```

Result in `/Comics/.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "disabledMcpServers": ["things", "apple-notes", "control-chrome", "filesystem", "imessage"]
  }
}
```

### Custom Permissions Per Project

Dotfiles project example (needs chezmoi/git/gh access):

```toml
[projects.dotfiles]
custom_permissions = [
  "Read(//**)",
  "Edit(/Users/joe/.local/share/chezmoi/**)",
  "Write(/Users/joe/.local/share/chezmoi/**)",
  "Bash(chezmoi:*)",
  "Bash(git:*)",
  "Bash(gh:*)"
]
```

## Hooks Integration

### Global Hooks (All Projects)

Defined in `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": "~/.claude/hooks/codex-delegation.sh"
  }
}
```

### Project-Specific Hooks

Add to `.chezmoidata.toml`:

```toml
[projects.myproject.hooks]
PreToolUse = "/path/to/project/.claude/hooks/custom-hook.sh"
```

Then update `run_onchange_generate-project-configs.sh` to include:

```bash
"hooks": $(chezmoi data | jq ".projects.${project}.hooks // {}")
```

## Subagents

### Global Subagents (All Projects)

Located in `~/.claude/agents/*.md`:

- `notion-manager.md` - Parallel Notion operations
- `breaking-change-detector-agent.md`
- `tool-discovery-agent.md`
- etc.

### Project-Specific Subagents

Create in project directory:

```bash
mkdir -p /path/to/project/.claude/agents
cat > /path/to/project/.claude/agents/project-specific.md <<'EOF'
---
name: project-specific-agent
description: Handles project-specific operations
tools: Read, Write, Bash
---

Your subagent prompt here.
EOF
```

## Troubleshooting

### Config Not Regenerating

```bash
# Force regeneration
rm /path/to/project/.claude/settings.local.json
chezmoi apply
```

### Verify Project Data

```bash
chezmoi data | jq '.projects'
```

### Check Script Execution

```bash
# Manually run script
~/.local/share/chezmoi/.chezmoiscripts/run_onchange_generate-project-configs.sh
```

### View Generated Config

```bash
cat /path/to/project/.claude/settings.local.json | jq .
```

## Best Practices

1. **Use .chezmoidata.toml for all projects** - Single source of truth
2. **Don't manually edit generated configs** - They'll be overwritten on `chezmoi apply`
3. **Add new projects via data file** - Ensures consistency
4. **Test with `chezmoi diff` first** - Preview changes before applying
5. **Document project-specific needs** - Use `description` field in `.chezmoidata.toml`

## Migration from Manual Configs

If you have existing `.claude/settings.local.json` files:

1. Extract configuration to `.chezmoidata.toml`:

```bash
# For each project, copy settings to data file
cat /path/to/project/.claude/settings.local.json | jq '{
  disabled_mcps: .mcpServers.disabledMcpServers,
  custom_permissions: .permissions.allow
}'
```

2. Add to `.chezmoidata.toml`

3. Apply and verify:

```bash
chezmoi apply
diff /path/to/project/.claude/settings.local.json.backup /path/to/project/.claude/settings.local.json
```

## Future Enhancements

- [ ] Add `hooks` support per project
- [ ] Add `env` variables per project
- [ ] Add project-specific subagents via data file
- [ ] Create interactive `dotfiles project add` command

---

**Last Updated**: 2025-11-14
**Related**: SETUP.md, CLAUDE.md, MCP_SETUP.md
