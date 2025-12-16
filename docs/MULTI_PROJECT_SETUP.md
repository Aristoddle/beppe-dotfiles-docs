# Multi-Project Claude Code Configuration

**Purpose**: Manage Claude Code settings for multiple projects via chezmoi templates with project-specific customization.

## Architecture

### Global Configuration
```
~/.claude.json                    # MCP server definitions (chezmoi-managed)
~/.claude/settings.json          # Global defaults (chezmoi-managed)
```

### Project-Specific Configuration
```
<project>/.claude/
├── settings.local.json          # Project overrides (chezmoi-templated)
├── agents/                      # Project-specific agents
└── skills/                      # Project-specific skills
```

## Token Economics

**Problem**: 12 global MCPs = 82k tokens (41% of 200k budget)

**Solution**: Disable unused MCPs per-project via `settings.local.json`

**Savings**:
- Comics project: Disabled 6 MCPs → ~40k tokens recovered
- Dotfiles project: Keep all MCPs → Full functionality
- Code projects: Disable Notion → ~15k tokens recovered

## Creating Project-Specific Templates

### Step 1: Copy Template

```bash
cd ~/.local/share/chezmoi

# For OneDrive path
mkdir -p "Library/CloudStorage/OneDrive-Personal/Books/Comics/dot_claude"

# For regular home path
mkdir -p "Documents/Code/MyProject/dot_claude"
```

### Step 2: Customize Variables

Edit: `Library/.../ProjectName/dot_claude/settings.local.json.tmpl`

```json
{{- $projectPath := "/Users/joe/PATH/TO/PROJECT" -}}
{{- $projectName := "MyProject" -}}
{{- $projectType := "code" -}}  // Options: dotfiles, manga, code, general
```

### Step 3: Deploy

```bash
chezmoi apply
```

Verifies deployment:
```bash
ls -la /PATH/TO/PROJECT/.claude/settings.local.json
```

## Project Types

### Dotfiles (`projectType: "dotfiles"`)

**Permissions**:
- Edit chezmoi source files
- Chezmoi, git, gh, brew commands

**MCPs kept**: notion, sequential-thinking, memory

### Manga (`projectType: "manga"`)

**Permissions**:
- Edit MANGA_PROJECT_DOCS/**
- Unzip, find, du commands

**MCPs kept**: notion, sequential-thinking, codex-gpt5

**Disabled**: things, apple-notes, control-chrome, filesystem, imessage

### Code (`projectType: "code"`)

**Permissions**:
- Edit all project files
- npm, yarn, cargo, go commands

**MCPs kept**: sequential-thinking, codex-gpt5, codex-coding, memory

**Disabled**: notion, things, apple-notes, etc.

### General (`projectType: "general"`)

**Permissions**: Basic read/edit

**MCPs kept**: sequential-thinking, memory

**Disabled**: Everything else (maximum token recovery)

## String Interpolation

Templates support chezmoi variables:

```json
{
  "permissions": {
    "allow": [
      "Read(//{{ $projectPath }}/**)",
      "Edit({{ $projectPath }}/docs/**)",
      "Write({{ $projectPath }}/output/**)"
    ]
  },
  "env": {
    "PROJECT_ROOT": "{{ $projectPath }}",
    "USER_HOME": "{{ .chezmoi.homeDir }}",
    "USERNAME": "{{ .chezmoi.username }}"
  }
}
```

**Available variables**:
- `{{ $projectPath }}` - Full project path
- `{{ $projectName }}` - Project name
- `{{ .chezmoi.homeDir }}` - /Users/username
- `{{ .chezmoi.username }}` - username
- `{{ .chezmoi.sourceDir }}` - ~/.local/share/chezmoi

## Managing Multiple Projects

### Comics Project (Already Setup)

**Template**: `Library/CloudStorage/OneDrive-Personal/Books/Comics/dot_claude/settings.local.json.tmpl`

**Deploys to**: `/Users/joe/Library/CloudStorage/OneDrive-Personal/Books/Comics/.claude/settings.local.json`

**Token savings**: 6 MCPs disabled → ~40k tokens recovered

### Adding New Project

```bash
# 1. Create template directory
cd ~/.local/share/chezmoi
mkdir -p "PATH/TO/PROJECT/dot_claude"

# 2. Copy template
cp dot_claude/templates/PROJECT_SETTINGS_TEMPLATE.json.tmpl \
   "PATH/TO/PROJECT/dot_claude/settings.local.json.tmpl"

# 3. Edit variables
$EDITOR "PATH/TO/PROJECT/dot_claude/settings.local.json.tmpl"

# 4. Apply
chezmoi apply

# 5. Verify
ls -la /PATH/TO/PROJECT/.claude/settings.local.json
```

## Verification

**Check what chezmoi will deploy**:
```bash
chezmoi diff
```

**See project-specific settings**:
```bash
cat /PATH/TO/PROJECT/.claude/settings.local.json
```

**Test MCP configuration**:
```bash
cd /PATH/TO/PROJECT
claude /mcp  # Should show only enabled MCPs
```

## Maintenance

### Update Global MCPs

Edit: `~/.local/share/chezmoi/private_dot_claude.json.tmpl`

```bash
chezmoi edit ~/.claude.json
```

### Update Project Settings

Edit: `~/.local/share/chezmoi/PATH/TO/PROJECT/dot_claude/settings.local.json.tmpl`

```bash
chezmoi apply
```

### Add New MCP to Global

1. Add to `.claude.json` mcpServers
2. Optionally disable in project templates
3. Apply changes

## Best Practices

**DO**:
- ✅ Use templates for ALL project configs
- ✅ Set project-specific environment variables
- ✅ Disable unused MCPs to save tokens
- ✅ Use descriptive `$projectName`
- ✅ Document custom permissions

**DON'T**:
- ❌ Edit deployed files directly (always edit templates)
- ❌ Hardcode paths (use variables)
- ❌ Enable all MCPs (token waste)
- ❌ Forget to run `chezmoi apply` after template changes

---

**Last Updated**: 2025-11-14
**Examples**: Comics project, Dotfiles project
**Documentation**: https://www.chezmoi.io/user-guide/templating/
