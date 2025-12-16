# chezmoi Usage Guide

Complete reference for managing dotfiles with chezmoi - daily workflows, best practices, and troubleshooting.

## Table of Contents

1. [Daily Workflows](#daily-workflows)
2. [Git Operations](#git-operations)
3. [Adding New Dotfiles](#adding-new-dotfiles)
4. [Templates & Variables](#templates--variables)
5. [Oh-My-Zsh Plugin Management](#oh-my-zsh-plugin-management)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Topics](#advanced-topics)

---

## Daily Workflows

### Edit Existing Configuration

**Method 1: chezmoi edit (Recommended)**
```bash
# Edit any managed file
chezmoi edit ~/.config/zsh/config/10-omz.zsh

# Opens in $EDITOR, auto-detects source location
```

**Method 2: Direct source editing**
```bash
# Navigate to source
cd ~/.local/share/chezmoi

# Edit source file directly
vim private_dot_config/zsh/config/10-omz.zsh
```

**Always apply changes after editing:**
```bash
# Preview what will change
chezmoi diff

# Apply changes to system
chezmoi apply

# Reload shell to see changes
exec zsh
```

### Typical Edit Workflow

```bash
# 1. Edit configuration
chezmoi edit ~/.config/zsh/aliases/git.zsh

# 2. Check what changed
chezmoi diff

# 3. Apply if satisfied
chezmoi apply

# 4. Test changes
exec zsh

# 5. Commit if working
chezmoi git add .
chezmoi git -- commit -m "feat(aliases): Add git shortcuts"
chezmoi git push
```

---

## Git Operations

### Using chezmoi git Wrapper (Recommended)

The `chezmoi git` wrapper runs git commands in the source directory, regardless of your current location.

```bash
# Add changes
chezmoi git add .

# Commit (use -- for git flags)
chezmoi git -- commit -m "feat: Add new configuration"

# Push to remote
chezmoi git push

# Pull latest changes
chezmoi git pull

# Check status
chezmoi git status

# View log
chezmoi git -- log --oneline -10
```

### Traditional Git Workflow

If you prefer standard git commands:

```bash
# Navigate to source
cd ~/.local/share/chezmoi

# Standard git operations
git add .
git commit -m "feat: Update aliases"
git push

# Then apply to system
chezmoi apply
```

### Pulling Updates from Upstream

```bash
# Pull latest changes from GitHub
chezmoi git pull

# OR: Update and apply in one command
chezmoi update

# Check what would change before applying
chezmoi diff
```

---

## Adding New Dotfiles

### Add Existing File to Management

```bash
# Add a regular file
chezmoi add ~/.config/alacritty/alacritty.yml

# Add a directory
chezmoi add ~/.config/bat

# Add with template processing
chezmoi add --template ~/.gitconfig
```

### Create New File in chezmoi

```bash
# Method 1: Add placeholder, then edit
touch ~/.newconfig
chezmoi add ~/.newconfig
chezmoi edit ~/.newconfig

# Method 2: Edit source directly
cd ~/.local/share/chezmoi
vim dot_newconfig
chezmoi apply
```

### Re-add Modified File

If you accidentally edited a deployed file instead of source:

```bash
# WARNING: This overwrites source with deployed version!
chezmoi add --force ~/.config/zsh/functions/new-function.zsh

# Better: Check diff first
chezmoi diff ~/.config/zsh/functions/new-function.zsh
```

---

## Templates & Variables

### Using Template Variables

Templates use Go's template syntax with double curly braces.

**Access predefined variables:**
```bash
# In any *.tmpl file
{{ .git.name }}           # Your git name
{{ .git.email }}          # Your git email
{{ .chezmoi.os }}         # OS: darwin, linux, etc.
{{ .chezmoi.hostname }}   # Machine hostname
{{ .chezmoi.username }}   # Current username
```

**Example: .gitconfig.tmpl**
```toml
[user]
    name = {{ .git.name }}
    email = {{ .git.email }}
{{ if .git.signingkey }}
    signingkey = {{ .git.signingkey }}
{{ end }}
```

### Platform-Specific Configuration

```bash
# Conditional based on OS
{{ if eq .chezmoi.os "darwin" -}}
# macOS-specific config
export PATH="/opt/homebrew/bin:$PATH"
{{- else if eq .chezmoi.os "linux" -}}
# Linux-specific config
export PATH="/usr/local/bin:$PATH"
{{- end }}
```

### 1Password Integration

```bash
# In template files, reference 1Password secrets
export GITHUB_TOKEN={{ onepasswordRead "op://Private/GitHub/token" }}
export ANTHROPIC_API_KEY={{ onepasswordRead "op://Private/Anthropic/credential" }}
```

**Requirements:**
- 1Password CLI installed (`op`)
- Signed in: `op signin`
- Desktop app unlocked (for TouchID)

### Edit Template Variables

```bash
# Edit variable definitions
chezmoi edit-config

# In .chezmoi.toml.tmpl, add/modify:
[data.git]
    name = "Your Name"
    email = "your@email.com"
    signingkey = "GPG_KEY_ID"  # optional
```

---

## Oh-My-Zsh Plugin Management

### Current Plugins

**Managed file**: `~/.config/zsh/config/10-omz.zsh`

**Default plugins** (line 32-43):
```zsh
plugins=(
  git                    # Enhanced git aliases and prompt
  docker                 # Docker completions and aliases
  kubectl                # Kubernetes completions
  sudo                   # ESC ESC to add sudo to previous command
  colored-man-pages      # Colorized man pages
  command-not-found      # Suggests packages for missing commands
  extract                # Universal archive extraction (x command)
  copyfile               # Copy file contents to clipboard
  copypath               # Copy current directory path to clipboard
  jsontools              # JSON pretty-printing and validation
)
```

### Add a Plugin

1. **Find plugin**: https://github.com/ohmyzsh/ohmyzsh/wiki/Plugins
2. **Edit configuration**:
   ```bash
   chezmoi edit ~/.config/zsh/config/10-omz.zsh
   ```
3. **Add to plugins array**:
   ```zsh
   plugins=(
     git
     docker
     kubectl
     NEW_PLUGIN_NAME  # Add here
   )
   ```
4. **Apply and reload**:
   ```bash
   chezmoi apply
   exec zsh
   ```

### Remove a Plugin

```bash
# Edit config
chezmoi edit ~/.config/zsh/config/10-omz.zsh

# Remove plugin from array
# Save, then apply
chezmoi apply && exec zsh
```

### Popular Plugin Recommendations

**Built-in plugins** (just add to list):
- `history-substring-search` - Search history with UP/DOWN arrows
- `web-search` - Search engines from terminal (google, ddg, etc.)
- `z` - Jump to frecent directories (we use zoxide wrapper instead)

**External plugins** (require manual installation):

1. **zsh-autosuggestions** (fish-like suggestions):
   ```bash
   # Install
   git clone https://github.com/zsh-users/zsh-autosuggestions \
     ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

   # Add to plugins array
   plugins=(... zsh-autosuggestions)
   ```

2. **zsh-syntax-highlighting** (command validation):
   ```bash
   # Install
   git clone https://github.com/zsh-users/zsh-syntax-highlighting \
     ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

   # Add to plugins array
   plugins=(... zsh-syntax-highlighting)
   ```

**Note**: External plugins are NOT managed by chezmoi. You install them to `~/.oh-my-zsh/custom/plugins/`, then add the plugin name to the managed config file.

---

## Troubleshooting

### Check What's Managed

```bash
# List all managed files
chezmoi managed

# Count managed files
chezmoi managed | wc -l

# Find specific file
chezmoi managed | grep zsh
```

### Verify Deployment State

```bash
# Check if source matches deployed
chezmoi diff

# No output = in sync
# Output shows differences = need to apply
```

### Source vs Deployed Mismatch

**Symptom**: Changes aren't appearing after editing

**Diagnosis**:
```bash
# Check which version is active
cat ~/.config/zsh/config/10-omz.zsh  # Deployed
cat ~/.local/share/chezmoi/private_dot_config/zsh/config/10-omz.zsh  # Source

# See differences
chezmoi diff
```

**Fix**:
```bash
# If source is correct:
chezmoi apply

# If deployed has changes you want to keep:
chezmoi add --force ~/.config/zsh/config/10-omz.zsh
```

### Accidentally Edited Deployed File

```bash
# Copy deployed → source (overwrites source!)
chezmoi add --force ~/.config/zsh/functions/my-function.zsh

# Or: Manually copy changes, then revert deployed
chezmoi apply
```

### Remove File from Management

```bash
# Stop managing file (keeps deployed file)
chezmoi forget ~/.config/unwanted

# To also delete deployed file
rm ~/.config/unwanted
chezmoi forget ~/.config/unwanted
```

### Shell Changes Not Loading

```bash
# Always reload after changes
exec zsh

# If still broken, check for errors
zsh -x  # Debug mode

# Check specific file
source ~/.config/zsh/config/10-omz.zsh
```

---

## Advanced Topics

### Ignore Patterns

**File**: `.chezmoiignore`

```bash
# Syntax: glob patterns, one per line
README.md          # Ignore file
docs/              # Ignore directory
*.md               # Ignore all markdown files
```

**Common ignores**:
- Documentation files (README.md, CHANGELOG.md)
- Development files (Makefile, scripts/)
- Local-only configs

### Run Scripts on Apply

**run_once Scripts** (execute once):
```bash
# In source: run_once_setup.sh
#!/bin/bash
# This runs once, tracked by chezmoi
```

**run_onchange Scripts** (execute when changed):
```bash
# In source: run_onchange_update.sh
#!/bin/bash
# This runs every time script content changes
```

**Force re-run**:
```bash
chezmoi state delete-bucket --bucket=scriptState
chezmoi apply
```

### Private Files (Not in Git)

Use `private_` prefix:
```bash
# Source: private_dot_ssh/config
# Deployed: ~/.ssh/config
# Git: Tracked (but marked private in chezmoi)
```

Use `.chezmoiignore` to prevent deployment:
```bash
# Fully exclude from git
echo "private_secrets.txt" >> .chezmoiignore
```

### Encrypted Files

```bash
# Encrypt sensitive file
chezmoi add --encrypt ~/.ssh/id_rsa

# chezmoi will prompt for encryption key
# Stored encrypted in source, decrypted on apply
```

### Dry Run (Preview Changes)

```bash
# See what would change without applying
chezmoi apply --dry-run --verbose

# See what would be added
chezmoi add --dry-run ~/.newfile
```

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Edit file | `chezmoi edit <path>` |
| Preview changes | `chezmoi diff` |
| Apply changes | `chezmoi apply` |
| Reload shell | `exec zsh` |
| Add new file | `chezmoi add <path>` |
| Git add | `chezmoi git add .` |
| Git commit | `chezmoi git -- commit -m "msg"` |
| Git push | `chezmoi git push` |
| Pull updates | `chezmoi git pull` |
| List managed | `chezmoi managed` |
| Verify state | `chezmoi diff` |
| Forget file | `chezmoi forget <path>` |
| Edit config | `chezmoi edit-config` |

---

## Related Documentation

- [BOOTSTRAP.md](BOOTSTRAP.md) - Bootstrap process and automation
- [SETUP.md](SETUP.md) - Platform-specific setup instructions
- [Home](/) - Project overview and quick start
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [chezmoi Official Docs](https://www.chezmoi.io/) - Complete chezmoi documentation

---

**Last Updated**: 2025-11-02
**chezmoi Version**: 2.x+
