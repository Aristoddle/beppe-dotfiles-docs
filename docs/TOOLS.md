# Complete Tool Inventory

Comprehensive list of all tools installed and managed by this dotfiles setup.

## Table of Contents

1. [Modern CLI Replacements (Rust)](#modern-cli-replacements-rust)
2. [Developer Tools](#developer-tools)
3. [Version Managers](#version-managers)
4. [Programming Languages](#programming-languages-via-mise)
5. [Shell Framework](#shell-framework)
6. [Platform-Specific Tools](#platform-specific-tools)

---

## Modern CLI Replacements (Rust)

All installed via `cargo install` or Homebrew, managed via mise on macOS.

| Tool | Replaces | Description | Usage |
|------|----------|-------------|-------|
| **bat** | `cat` | Syntax highlighting, git integration | `bat file.js` |
| **eza** | `ls` | Modern listing with icons, git status | `eza -la --git --icons` |
| **fd** | `find` | Fast, user-friendly file finder | `fd pattern` |
| **rga** | `grep` | Searches PDFs, docs, archives | `rga "text" docs/` |
| **sd** | `sed` | Simpler find/replace | `sd 'old' 'new' file.txt` |
| **delta** | `diff` | Beautiful git diffs with syntax | `git diff` (auto-configured) |
| **dust** | `du` | Disk usage visualization | `dust /path` |
| **procs** | `ps` | Modern process viewer | `procs` |
| **zoxide** | `cd` | Smart directory jumper | `z project` |

### Smart Wrappers vs Direct Shortcuts

**Smart Wrappers** (in `functions/smart-wrappers.zsh`):
- `cat` → `bat` (pipe-aware: plain when piped, fancy in terminal)
- `ls` → `eza` (context-aware: clean by default, detailed with `-l`)
- `cd` → `zoxide` (fallback: tries zoxide, falls back to builtin)

**Direct Shortcuts** (in `aliases/rust-tools.zsh`):
- `dust` - Disk usage (different interface than du)
- `procs` - Process viewer (different interface than ps)
- `rga` - ripgrep-all (searches PDFs, docs)
- `ll`, `la`, `tree` - eza extras (don't override ls)

### Installation

```bash
# Via cargo
cargo install bat eza fd-find ripgrep-all sd git-delta du-dust procs zoxide

# Via Homebrew (macOS)
brew install bat eza fd ripgrep sd git-delta dust procs zoxide
```

---

## Developer Tools

Essential tools for development workflow.

| Tool | Category | Description | Installation |
|------|----------|-------------|--------------|
| **htop** | Monitoring | Interactive process viewer | `brew install htop` |
| **tldr** | Documentation | Simplified man pages | `brew install tldr` |
| **fzf** | Search | Fuzzy finder for files/history | `brew install fzf` |
| **ncdu** | Disk | NCurses disk usage analyzer | `brew install ncdu` |
| **tree** | Files | Directory tree visualization | `brew install tree` |
| **watch** | Monitoring | Execute commands repeatedly | `brew install watch` |
| **lazygit** | Git | Terminal UI for git | `brew install lazygit` |
| **lazydocker** | Docker | Terminal UI for docker | `brew install lazydocker` |
| **direnv** | Environment | Per-directory environment variables | `brew install direnv` |
| **jq** | JSON | JSON processor | `mise install jq@latest` |
| **yq** | YAML | YAML processor | `mise install yq@latest` |
| **gh** | GitHub | GitHub CLI | `brew install gh` |

### Usage Examples

```bash
# fzf - Fuzzy find files
fzf  # Opens fuzzy finder
Ctrl+R  # Fuzzy search shell history

# lazygit - Git UI
lazygit  # Opens in current repo

# direnv - Auto-load .envrc
echo 'export API_KEY=xxx' > .envrc
direnv allow .

# jq/yq - JSON/YAML processing
cat package.json | jq '.dependencies'
cat config.yaml | yq '.server.port'
```

---

## Version Managers

Tools for managing multiple language versions.

### mise (Multi-Language)

Universal version manager for 17+ languages.

**Managed Languages**:
```bash
mise list
# bun, deno, dotnet, elixir, erlang, go, java, jq, kotlin,
# lua, node, postgres, ruby, rust, scala, sqlite, yq
```

**Usage**:
```bash
# Install runtime
mise install node@latest
mise install python@3.11

# Set global version
mise use --global node@22

# Set local version
mise use node@20  # Creates .mise.toml

# List installed
mise list

# Update all
mise upgrade
```

**Configuration**: `~/.config/mise/config.toml`

### pyenv (Python-Specific)

Dedicated Python version manager with virtualenv support.

**Usage**:
```bash
# Install Python version
pyenv install 3.12.0

# Set global version
pyenv global 3.12.0

# Set local version
pyenv local 3.11.0  # Creates .python-version

# Create virtualenv
pyenv virtualenv 3.12.0 myproject

# List versions
pyenv versions
```

**Configuration**: Initialized in `~/.config/zsh/config/20-plugins.zsh`

---

## Programming Languages (via mise)

Currently installed and managed by mise:

| Language | Version | Installation Command |
|----------|---------|---------------------|
| **Bun** | 1.2.21 | `mise install bun@latest` |
| **Deno** | 2.5.0 | `mise install deno@latest` |
| **.NET** | 9.0.305 | `mise install dotnet@latest` |
| **Elixir** | 1.18.4 | `mise install elixir@latest` |
| **Erlang** | 28.0.4 | `mise install erlang@latest` |
| **Go** | 1.25.1 | `mise install go@latest` |
| **Java** | 25.0.0 | `mise install java@latest` |
| **Kotlin** | 2.2.20 | `mise install kotlin@latest` |
| **Lua** | 5.4.8 | `mise install lua@latest` |
| **Node.js** | 22.19.0 | `mise install node@latest` |
| **PostgreSQL** | 17.6 | `mise install postgres@latest` |
| **Ruby** | 3.4.5 | `mise install ruby@latest` |
| **Rust** | 1.89.0 | `mise install rust@latest` |
| **Scala** | 3.7.3 | `mise install scala@latest` |
| **SQLite** | 3.50.4 | `mise install sqlite@latest` |

### Add New Language

```bash
# Search for available runtimes
mise registry

# Install specific version
mise install <runtime>@<version>

# Or install latest
mise install <runtime>@latest

# Set global default
mise use --global <runtime>@<version>
```

---

## Shell Framework

### Oh-My-Zsh

**Version**: Latest stable
**Installation**: `~/.oh-my-zsh/`
**Plugins**: Minimal (loaded via `~/.config/zsh/config/10-omz.zsh`)

**Configuration**:
```bash
# ~/.config/zsh/config/10-omz.zsh
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"

zstyle ':omz:update' mode reminder
zstyle ':omz:update' frequency 14

plugins=()  # We use external plugin managers
```

### Powerlevel10k

**Version**: Latest stable
**Installation**: `${ZSH_CUSTOM}/themes/powerlevel10k`
**Configuration**: `~/.config/zsh/config/40-prompt.zsh`

**Features**:
- Instant prompt (loads in < 1ms)
- Transient prompt (compact past commands)
- Git status integration
- Command execution time
- Exit code indicator
- Custom segments

**Reconfigure**:
```bash
p10k configure
```

### Additional Shell Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **Atuin** | Shell history with fuzzy search | `~/.config/zsh/config/20-plugins.zsh` |
| **zoxide** | Smart `cd` with frecency | `~/.config/zsh/aliases/cargo-tools.zsh` |
| **direnv** | Auto-load environment variables | `~/.config/zsh/config/20-plugins.zsh` |

---

## Platform-Specific Tools

### macOS Only

| Tool | Purpose | Installation |
|------|---------|--------------|
| **Homebrew** | Package manager | `/bin/bash -c "$(curl -fsSL ..."` |
| **pbcopy/pbpaste** | Clipboard access | Built-in |
| **1Password Desktop** | GUI password manager | App Store |

**macOS Aliases** (`~/.config/zsh/os/darwin.zsh`):
```bash
alias show='defaults write com.apple.finder AppleShowAllFiles true && killall Finder'
alias hide='defaults write com.apple.finder AppleShowAllFiles false && killall Finder'
alias cleanup="find . -type f -name '*.DS_Store' -ls -delete"
alias flushdns='sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder'
alias copy='pbcopy'
alias paste='pbpaste'
```

### Linux/WSL Only

| Tool | Purpose | Installation |
|------|---------|--------------|
| **APT** | Package manager | Built-in |
| **systemd** | Service manager | Built-in |
| **xclip** | Clipboard access | `sudo apt install xclip` |

---

## 1Password Integration

### 1Password CLI

**Version**: 2.32.0+
**Installation**:
```bash
# macOS - BOTH components required
brew install --cask 1password     # Desktop app (REQUIRED)
brew install 1password-cli        # CLI tool

# Linux - Install desktop app first from https://1password.com/downloads
# Then install CLI from package repository
```

**CRITICAL DEPENDENCY**: The 1Password CLI **requires** the desktop app to be installed and unlocked. The CLI alone will not work - `op signin` will hang indefinitely without the desktop app.

**Authentication**:
```bash
# 1. Open and unlock desktop app FIRST
open -a "1Password"  # macOS - authenticate with Touch ID

# 2. THEN sign in with CLI
op signin

# Check status
op whoami

# Session duration: 10 min idle OR 12 hours hard limit
```

**Shell Plugins** (Credential Caching):
```bash
# Initialize plugins (interactive)
op plugin init gh       # GitHub CLI
op plugin init docker   # Docker
op plugin init npm      # npm

# List plugins
op plugin list
```

**Usage in Scripts**:
```bash
# Read secret
API_KEY=$(op read "op://Private/API_KEY/credential")

# Inject into command
op run -- gh api /user
```

**Completions**: Added in `~/.config/zsh/config/20-plugins.zsh`

---

## Installation Status

**Legend**:
- ✅ **Managed** - Deployed automatically by chezmoi (configs only, not tools)
- ⚙️ **Semi-Automated** - One-liner install via chezmoi script
- ❌ **Manual** - Requires manual installation

| Tool Category | Deployment | Installation Method |
|--------------|------------|---------------------|
| **Dotfiles Configuration** | ✅ Managed | `chezmoi init --apply` |
| **macOS System Customization** | ⚙️ Semi-Automated | Runs automatically via `run_once_macos.sh.tmpl` |
| **Oh-My-Zsh** | ❌ Manual | `sh -c "$(curl -fsSL ...)"` |
| **Powerlevel10k** | ❌ Manual | `git clone --depth=1 ...` |
| **Nerd Fonts** | ❌ Manual | Homebrew/manual download |
| **Rust Tools** (bat, eza, fd, etc.) | ❌ Manual | `brew install` or `cargo install` |
| **Developer Tools** (fzf, lazygit, etc.) | ❌ Manual | `brew install` or `apt install` |
| **Version Managers** (mise, pyenv) | ❌ Manual | Installer scripts |
| **1Password CLI** | ❌ Manual | Homebrew or apt repository |

**For complete installation instructions**, see [SETUP.md](SETUP.md).

---

## Maintenance

### Update All Tools

```bash
# Homebrew (macOS)
brew update && brew upgrade

# mise runtimes
mise upgrade

# Rust tools
cargo install-update -a  # Requires cargo-update

# Oh-My-Zsh
omz update

# chezmoi (pull latest dotfiles)
chezmoi update
```

### Check Tool Versions

```bash
# Create version check script
cat > ~/.local/bin/check-versions << 'EOF'
#!/bin/bash
echo "=== Tool Versions ==="
bat --version | head -1
eza --version
fd --version
rg --version
delta --version
mise --version
gh --version
op --version
chezmoi --version
zsh --version
EOF

chmod +x ~/.local/bin/check-versions
check-versions
```

---

**Last Updated**: November 1, 2025
**Total Tools**: 40+ (17 languages, 12 Rust tools, 11 dev tools, misc)

**Note**: This inventory lists tools that are **configured** by the dotfiles. See [SETUP.md](SETUP.md) for installation instructions - most tools require manual installation.
