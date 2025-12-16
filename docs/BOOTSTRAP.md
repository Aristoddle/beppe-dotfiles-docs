# Bootstrap Process Guide

Complete technical documentation of the dotfiles bootstrap process using chezmoi.

## Table of Contents

1. [What is Bootstrap?](#what-is-bootstrap)
2. [Bootstrap Workflow](#bootstrap-workflow)
3. [Automated vs Manual](#automated-vs-manual)
4. [Technical Details](#technical-details)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Topics](#advanced-topics)

---

## What is Bootstrap?

**Bootstrap** = Automated deployment of dotfiles configuration to a new system.

### What Bootstrap IS

✅ **Configuration Deployment**:
- Copies dotfiles to correct locations (`~/.config/zsh/`, `~/.gitconfig`, etc.)
- Renders templates with user-specific variables (git name/email)
- Tracks changes via git for version control

### What Bootstrap IS NOT

❌ **Tool Installation**:
- Does NOT install Oh-My-Zsh, Powerlevel10k, Nerd Fonts
- Does NOT install cargo tools (bat, eza, fd, etc.)
- Does NOT install developer tools (fzf, lazygit, etc.)
- Does NOT install version managers (mise, pyenv)
- Does NOT install 1Password CLI

**Why?** chezmoi is a dotfile manager, not a package manager. It deploys configs, not binaries.

---

## Bootstrap Workflow

### Step 1: Prerequisites

Before running bootstrap, install:

**macOS**:
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install git and zsh
brew install git zsh

# Make zsh default shell (if needed)
chsh -s $(which zsh)
```

**Ubuntu/WSL**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y git zsh curl wget build-essential

# Make zsh default shell
chsh -s $(which zsh)

# Add ~/.local/bin to PATH
mkdir -p ~/.local/bin
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
```

### Step 2: Run One-Line Install

```bash
curl -fsSL https://raw.githubusercontent.com/Aristoddle/beppe-system-bootstrap/main/install.sh | bash
```

**What this script does**:
1. Detects OS (macOS, WSL, or Linux)
2. Installs chezmoi via Homebrew (macOS) or standalone installer (Linux)
3. Runs `chezmoi init --apply https://github.com/Aristoddle/beppe-system-bootstrap.git`

**During execution**:
- Prompts for git name, email, GitHub username, device name
- Clones dotfiles to `~/.local/share/chezmoi/`
- Deploys files to target locations (`~/.config/zsh/`, `~/.gitconfig`, etc.)

### Step 3: Post-Bootstrap Manual Setup

After bootstrap completes, manually install tools:

**Essential Shell Framework**:
```bash
# Oh-My-Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

**Modern CLI Tools**:
```bash
# macOS
brew install bat eza fd ripgrep sd git-delta dust procs zoxide

# Ubuntu/WSL (via cargo)
cargo install bat eza fd-find ripgrep-all sd git-delta du-dust procs zoxide
```

**Developer Tools**:
```bash
# macOS
brew install htop tldr fzf ncdu tree watch lazygit lazydocker direnv

# Ubuntu/WSL
sudo apt install -y htop fzf ncdu tree
```

**Version Managers**:
```bash
# mise (multi-language)
curl https://mise.run | sh

# pyenv (Python-specific)
brew install pyenv  # macOS
curl https://pyenv.run | bash  # Ubuntu/WSL
```

**Restart shell**:
```bash
exec zsh
```

**Configure Powerlevel10k**:
```bash
p10k configure
```

See [SETUP.md](SETUP.md) for complete platform-specific instructions.

---

## Automated vs Manual

### ✅ Automated (via chezmoi)

**Dotfiles Configuration**:
- `~/.config/zsh/config/*.zsh` - Shell options, plugins, completions
- `~/.config/zsh/aliases/*.zsh` - Command shortcuts
- `~/.config/zsh/functions/*.zsh` - Shell functions
- `~/.config/zsh/os/{darwin,linux,wsl}.zsh` - Platform-specific configs
- `~/.gitconfig` - Git configuration (templated)
- `~/.claude/skills/*.md` - Claude Code skills
- `~/.claude/agents/*.md` - Claude Code agents

**Template Variables**:
- Prompts for `git.name`, `git.email`, `github.username`, `device.name`
- Renders `*.tmpl` files with user-specific values

### ❌ Manual (requires installation)

**Shell Framework**:
- Oh-My-Zsh (zsh framework)
- Powerlevel10k (prompt theme)
- Nerd Fonts (required for p10k icons)

**Modern CLI Tools** (Rust-based):
- bat, eza, fd, rga, sd, delta, dust, procs, zoxide

**Developer Tools**:
- htop, tldr, fzf, ncdu, tree, watch
- lazygit, lazydocker, direnv

**Version Managers**:
- mise (multi-language: node, python, go, rust, ruby, etc.)
- pyenv (Python-specific)

**Secret Management**:
- 1Password CLI
- 1Password shell plugins (gh, docker, npm)

---

## Technical Details

### chezmoi Architecture

**Three-Layer System**:

1. **Source** (`~/.local/share/chezmoi/`):
   - Git repository with traditional project structure
   - Contains templates (`*.tmpl`), scripts (`run_once_*`), and regular files
   - All editing happens here

2. **Deployed** (`~/.config/zsh/`, `~/.gitconfig`, etc.):
   - Where your shell actually reads configs
   - Managed by chezmoi - **NEVER edit these directly!**
   - Overwritten by `chezmoi apply`

3. **State** (`~/.local/share/chezmoi/.chezmoistate.boltdb`):
   - Tracks chezmoi's internal state
   - Ensures idempotent operations

### File Naming Conventions

| Source File | Deployed Location | Purpose |
|------------|-------------------|---------|
| `symlink_dot_zshrc` | `~/.zshrc` | Symlink to `~/.config/zsh/.zshrc` |
| `private_dot_config/zsh/dot_zshrc` | `~/.config/zsh/.zshrc` | Main shell config |
| `dot_gitconfig.tmpl` | `~/.gitconfig` | Template with variables |
| `private_dot_config/zsh/` | `~/.config/zsh/` | Directory structure |
| `.chezmoiignore` | (not deployed) | Files to skip |

### Template Rendering

**Variables** (`.chezmoi.toml.tmpl`):
```toml
{{- $gitName := promptStringOnce . "git.name" "Git user name" -}}
{{- $gitEmail := promptStringOnce . "git.email" "Git user email" -}}
{{- $githubUsername := promptStringOnce . "github.username" "GitHub username" -}}
{{- $deviceName := promptStringOnce . "device.name" "Device name" -}}
```

**Usage in Templates**:
```toml
# dot_gitconfig.tmpl
[user]
    name = {{ .git.name }}
    email = {{ .git.email }}

[github]
    user = {{ .github.username }}
```

### run_once Scripts

**Naming Convention**:
- `run_once_*.sh` - Runs once on any OS
- `run_onchange_*.sh` - Runs when script content changes

**State Tracking**:
- chezmoi tracks execution in `.chezmoistate.boltdb`
- Will NOT re-run on subsequent `chezmoi apply`
- To force re-run: `chezmoi state delete-bucket --bucket=scriptState`

### Platform Detection

**OS Detection** (in templates):
```bash
# Example: Platform-specific configuration
{{ if eq .chezmoi.os "darwin" -}}
# macOS-specific code
{{ else if eq .chezmoi.os "linux" -}}
# Linux-specific code
{{ end -}}
```

**Config Sourcing** (`.zshrc`):
```bash
case "$(uname -s)" in
  Darwin)
    source ~/.config/zsh/os/darwin.zsh
    ;;
  Linux)
    if grep -qi microsoft /proc/version; then
      source ~/.config/zsh/os/wsl.zsh
    else
      source ~/.config/zsh/os/linux.zsh
    fi
    ;;
esac
```

---

## Troubleshooting

### Bootstrap Fails During Template Prompts

**Symptom**: chezmoi prompts for git.name but errors out

**Solution**:
```bash
# Edit chezmoi config manually
chezmoi edit-config

# Add your details:
[data.git]
    name = "Your Name"
    email = "your@email.com"

[data.github]
    username = "yourusername"

[data.device]
    name = "your-device"

# Then apply
chezmoi apply
```

### Dotfiles Applied to Wrong Locations

**Symptom**: Files end up in wrong directories

**Cause**: Incorrect file naming in source

**Solution**:
```bash
# Check where files will deploy
chezmoi diff

# See source → target mapping
chezmoi managed

# Fix source file naming
cd ~/.local/share/chezmoi
mv incorrect_name correct_name
chezmoi apply
```

### chezmoi Can't Find Config

**Symptom**: `chezmoi: no config file found`

**Solution**:
```bash
# Initialize chezmoi config
chezmoi init

# Or specify config location
chezmoi --config ~/.config/chezmoi/chezmoi.toml apply
```

### Template Variables Not Rendering

**Symptom**: `{{ .git.name }}` appears literally in files

**Cause**: File missing `.tmpl` extension

**Solution**:
```bash
cd ~/.local/share/chezmoi

# Rename file to add .tmpl
mv dot_gitconfig dot_gitconfig.tmpl

# Re-apply
chezmoi apply
```

---

## Advanced Topics

### Custom Bootstrap Scripts

**Adding Semi-Automated Tool Installation**:

Create `run_once_install_tools.sh.tmpl`:
```bash
#!/bin/bash
{{ if eq .chezmoi.os "darwin" -}}
# Install Oh-My-Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Install Powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# Install Nerd Font
brew tap homebrew/cask-fonts
brew install --cask font-meslo-lg-nerd-font
{{ end -}}
```

**Note**: This would make Oh-My-Zsh/p10k semi-automated, but requires user consent to run interactive installers.

### Idempotent Scripts

**run_onchange Pattern**:
```bash
#!/bin/bash
# run_onchange_configure_mise.sh
# Re-runs when script content changes

mise install node@latest
mise install python@latest
mise use --global node@latest
mise use --global python@latest
```

### Multi-Machine Configs

**Different configs per machine**:
```bash
# .chezmoi.toml.tmpl
{{- $isWork := promptBool "Work machine" -}}
```

**Conditional deployment**:
```bash
# dot_gitconfig.tmpl
{{ if .isWork -}}
[user]
    email = "work@company.com"
{{ else -}}
[user]
    email = "personal@example.com"
{{ end -}}
```

### Testing Bootstrap Safely

**Dry-run mode**:
```bash
# See what would change without applying
chezmoi apply --dry-run --verbose

# See diff for specific file
chezmoi diff ~/.config/zsh/config/10-omz.zsh
```

**Docker testing**:
```bash
# Test on clean Ubuntu container
docker run -it ubuntu:24.04 /bin/bash

# Inside container, run bootstrap
apt update && apt install -y curl git zsh
curl -fsSL https://raw.githubusercontent.com/Aristoddle/beppe-system-bootstrap/main/install.sh | bash
```

---

## Quick Reference

### Essential Commands

```bash
# Initial setup
chezmoi init --apply https://github.com/Aristoddle/beppe-system-bootstrap.git

# Update from git
chezmoi update

# See what changed
chezmoi diff

# Apply changes
chezmoi apply

# Edit source file
chezmoi edit ~/.zshrc

# Navigate to source
chezmoi cd

# See managed files
chezmoi managed

# Check state
chezmoi status
```

### File Locations

| Purpose | Location |
|---------|----------|
| Source (git repo) | `~/.local/share/chezmoi/` |
| Deployed configs | `~/.config/zsh/`, `~/.gitconfig`, etc. |
| chezmoi config | `~/.config/chezmoi/chezmoi.toml` |
| State database | `~/.local/share/chezmoi/.chezmoistate.boltdb` |

---

**Last Updated**: November 1, 2025

For setup instructions, see [SETUP.md](SETUP.md).
For tool inventory, see [TOOLS.md](TOOLS.md).
