# Dotfiles Quick Start Guide

**Terminal-optimized guide for common tasks**

## Table of Contents

1. [Understanding the Setup](#understanding-the-setup)
2. [I Want To...](#i-want-to)
3. [Common Commands](#common-commands)
4. [Workflow](#workflow)
5. [Getting Help](#getting-help)

---

## Understanding the Setup

### The Big Picture

```
SOURCE (edit here)              DEPLOYED (read-only)
~/.local/share/chezmoi/    →    ~/.config/zsh/
                           →    ~/.gitconfig
                           →    other dotfiles
```

**Key Rule:** Always edit files in `~/.local/share/chezmoi/`, then run `chezmoi apply` to deploy.

### Why This Matters

- ✅ **CORRECT**: Edit `~/.local/share/chezmoi/private_dot_config/zsh/aliases/common.zsh`
- ❌ **WRONG**: Edit `~/.config/zsh/aliases/common.zsh` (changes will be lost!)

---

## I Want To...

### Discover Available Commands

```bash
dotfiles help          # Show all dotfiles commands
dotfiles list          # List ALL available functions and aliases
dotfiles list python   # List Python-specific commands
dotfiles list git      # List Git utilities
```

### Edit Configuration

```bash
# Easy way (recommended)
dotfiles edit aliases/common.zsh
dotfiles edit functions/system.zsh
dotfiles edit config/10-omz.zsh

# Manual way
cd ~/.local/share/chezmoi
vim private_dot_config/zsh/aliases/common.zsh
```

### Apply My Changes

```bash
# Quick apply (recommended)
dotfiles sync              # Apply changes

# Or preview first
chezmoi diff               # See what will change
dotfiles sync              # Apply changes

# Reload shell to see changes
exec zsh
```

### Check System Health

```bash
dotfiles status    # Check for drift, uncommitted changes, updates
dotfiles doctor    # 🆕 Comprehensive health check (all systems)
dotfiles auth status   # 🆕 Check authentication status (gh, 1password, copilot, claude, codex)
dotfiles neovim status   # 🆕 Check Neovim setup (plugins, LSP, AI assistants)
chezmoi doctor     # Chezmoi-specific diagnostic
```

### View Documentation

```bash
dotfiles docs quickstart     # This file
dotfiles docs architecture   # System architecture
dotfiles docs ssh            # SSH/auth setup
```

### Update Everything

```bash
# One-command refresh (recommended)
dotfiles reload    # Pull from git, apply, and reload shell

# Alternative: Update chezmoi binary too
dotfiles update    # Update chezmoi and pull latest changes
exec zsh           # Reload shell
```

### Commit My Changes

```bash
cd ~/.local/share/chezmoi
git status
git add .
git commit -m "feat(aliases): Add new shortcuts"
git push

### Use the upgraded core toolchain

The PATH/MANPATH guard in your shell config opts you into the custom core-build prefix (`~/Documents/Code/core-build/install`) for curl/rsync/ssh/git/tar/coreutils/grep. Open a new shell after `chezmoi apply` to use it; remove the guard if you ever need to fall back to system defaults.
```

### Start a Python Project

```bash
pyinit myproject    # Creates project dir with venv
cd myproject
venv                # Activates virtualenv
pip install requests
```

### Start a Node.js Project

```bash
nodeinit myapp      # Creates project dir with package.json
cd myapp
npm install express
```

### Create Other Language Projects

```bash
goinit myservice    # Go project with go.mod
rustinit mylib      # Rust project with Cargo.toml
javainit myapp      # Java project with Maven
```

### Use AI Assistants (Quick Queries)

```bash
# AI Coding Assistants (Interactive CLIs with global context)
claude "task description"         # Claude Code CLI
codex "task description"          # Codex CLI (optional)
copilot "task description"        # Copilot CLI (optional)

# Claude queries
ask "explain this code"
cat file.py | ask "review this code"
ask --opus "complex reasoning task"    # Most capable
ask --haiku "quick question"           # Fastest

# OpenAI/GPT queries
gpt "write a bash script"
git diff | gpt "write commit message"
gpt --o1 "solve this math problem"     # Advanced reasoning

# Smart router (auto-selects best model)
ai "prompt"
cat error.log | ai "diagnose issue"

# Convenience shortcuts
opus "task"    # Claude Opus
sonnet "task"  # Claude Sonnet (default)
haiku "task"   # Claude Haiku
o1 "task"      # GPT-o1
```

**Features:**
- Full piping support (`cat file | ask "summarize"`)
- Tool access enabled (web search, bash commands)
- No per-token costs (uses Claude Code + Codex subscriptions)

### View Markdown Files

```bash
# Beautiful markdown rendering
glow README.md
md CHANGELOG.md      # Shortcut
mdtui docs/          # TUI browser mode

# Works in pipes
curl https://url/file.md | glow
```

### Monitor System Resources

```bash
# Real-time system monitor (Rust)
btm                  # bottom (Rust alternative to htop)
top                  # Aliased to btm
```

### Manage Authentication 🆕

```bash
# Check all authentication statuses
dotfiles auth status     # Shows: gh, 1password, copilot, claude, codex

# Sign in to services
dotfiles auth 1password  # Sign in to 1Password (REQUIRED for secrets)
dotfiles auth gh         # Authenticate GitHub CLI
dotfiles auth claude     # Authenticate Claude CLI
dotfiles auth codex      # Setup Codex authentication
dotfiles auth copilot    # Redirects to nvim copilot

# Short aliases
dotfiles auth            # Same as status (default)
dotfiles a s             # status (short form)
dotfiles a 1p            # 1password (alias)
```

**Features**:
- Centralized authentication management
- Clear status indicators (✓ ✗ ⚠️)
- Installation instructions for missing tools
- Graceful degradation when tools not installed
- **Critical**: 1Password authentication unblocks secrets.zsh.tmpl

### Manage Neovim 🆕

```bash
# Setup and maintenance
dotfiles neovim install    # First-time setup (plugins, LSPs)
dotfiles neovim update     # Update all plugins
dotfiles neovim health     # Run health checks
dotfiles neovim fix        # Fix common issues
dotfiles neovim clean      # Clean cache and logs

# Status and authentication
dotfiles neovim status     # Check current status
dotfiles neovim copilot    # Authenticate GitHub Copilot

# Short aliases
dotfiles n s             # status
dotfiles n u             # update
dotfiles n h             # health
```

**Features**:
- LazyVim framework with 40+ plugins
- 25+ language servers (Python, Go, Rust, C/C++, etc.)
- AI assistants (Copilot + Claude Code)
- Telescope fuzzy finder with native fzf
- Automatic maintenance and health checks

---

## Common Commands

### Development Workflows

| Command | Description |
|---------|-------------|
| `pyinit <name>` | Create Python project with venv |
| `nodeinit <name>` | Create Node.js project |
| `goinit <name>` | Create Go project |
| `rustinit <name>` | Create Rust project |
| `venv` | Create/activate virtualenv |
| `pipup` | Update pip packages |
| `npmup` | Update npm packages |

### Git Utilities

| Command | Description |
|---------|-------------|
| `fshow` | Fuzzy search git log (interactive) |
| `fco` | Fuzzy checkout branch (interactive) |
| `git-cleanup` | Delete merged branches |
| `git-undo` | Undo last commit (keep changes) |
| `git-root` | Go to repository root |

### System Utilities

| Command | Description |
|---------|-------------|
| `mkcd <dir>` | Create directory and cd into it |
| `serve [port]` | Start HTTP server (default: 8000) |
| `path` | Show PATH entries with line numbers |
| `reload` | Reload shell configuration |
| `json` | Pretty-print JSON from stdin |

### Docker

| Command | Description |
|---------|-------------|
| `dps` | Docker ps with better formatting |
| `dlog <container>` | Follow container logs |
| `dex <container>` | Execute shell in container |
| `dclean` | Remove stopped containers |

---

## Workflow

### Daily Usage

```bash
# Open terminal
$ # Beautiful Powerlevel10k prompt appears

# Discover what's available
$ dotfiles list python

# Use custom commands
$ pyinit myproject
$ cd myproject
$ venv
$ pip install requests
```

### Making Changes

```bash
# Simple workflow (recommended)
$ dotfiles edit aliases/common.zsh
$ dotfiles sync              # Apply changes
$ exec zsh                   # Reload when ready

# Granular workflow (advanced)
$ dotfiles edit aliases/common.zsh
$ chezmoi diff               # Preview changes
$ dotfiles sync              # Apply changes
$ exec zsh                   # Reload shell

# Commit changes
$ cd ~/.local/share/chezmoi
$ git add .
$ git commit -m "feat(aliases): Add weather command"
$ git push
```

### Updating

```bash
# One-command sync (recommended)
$ dotfiles reload            # Pull, apply, and reload shell

# Alternative: Check first, then sync
$ dotfiles status            # Check for updates
$ dotfiles update            # Pull from git and apply
$ exec zsh                   # Reload shell
```

---

## Getting Help

### Commands

```bash
dotfiles help                 # Main help menu
dotfiles docs quickstart      # This guide
dotfiles docs architecture    # System architecture
dotfiles docs ssh             # SSH/auth setup
dotfiles list [category]      # List commands by category
dotfiles status               # System health check
```

### Where Things Live

```
~/.local/share/chezmoi/       # SOURCE (edit here!)
├── private_dot_config/zsh/
│   ├── dot_zshrc             # Main config
│   ├── config/               # Core settings
│   ├── aliases/              # Command shortcuts
│   ├── functions/            # Custom functions
│   ├── os/                   # Platform-specific
│   └── private/              # Secrets (1Password)
├── docs/                     # Documentation
└── tests/                    # Test suite

~/.config/zsh/                # DEPLOYED (read-only!)
└── (same structure, auto-managed)
```

### Key Files to Edit

| File | Purpose |
|------|---------|
| `aliases/common.zsh` | General aliases |
| `aliases/git.zsh` | Git aliases |
| `functions/system.zsh` | System utilities |
| `config/10-omz.zsh` | Oh-My-Zsh plugins |
| `config/00-environment.zsh` | PATH and environment variables |

### Online Resources

- **Repository**: https://github.com/Aristoddle/beppe-system-bootstrap
- **Main README**: `~/.local/share/chezmoi/README.md`
- **chezmoi Docs**: https://www.chezmoi.io/

---

## Quick Reference Card

```
╔══════════════════════════════════════════════════════════════╗
║                   DOTFILES CHEAT SHEET                       ║
╠══════════════════════════════════════════════════════════════╣
║ DISCOVERY                                                    ║
║   dotfiles help           Show all commands                  ║
║   dotfiles list           List functions/aliases             ║
║   dotfiles docs <topic>   View documentation                 ║
║                                                              ║
║ EDITING                                                      ║
║   dotfiles edit <file>    Edit source file                   ║
║   chezmoi diff            Preview changes                    ║
║   chezmoi apply           Apply changes                      ║
║   exec zsh                Reload shell                       ║
║                                                              ║
║ MAINTENANCE                                                  ║
║   dotfiles status         Check health                       ║
║   dotfiles update         Update everything                  ║
║   cd ~/.local/share/chezmoi   Go to source                   ║
║   git status              Check uncommitted changes          ║
║   dotfiles auth status    Verify 1Password/gh/op auth        ║
║   chezmoi apply --exclude=dotfiles  Pause deployment         ║
║   chezmoi destroy         Remove managed files (preview w/ diff) ║
║                                                              ║
║ DEVELOPMENT                                                  ║
║   pyinit <name>           Python project                     ║
║   nodeinit <name>         Node.js project                    ║
║   goinit <name>           Go project                         ║
║   rustinit <name>         Rust project                       ║
║                                                              ║
║ GIT UTILITIES                                                ║
║   fshow                   Fuzzy search commits               ║
║   fco                     Fuzzy checkout branch              ║
║   git-cleanup             Delete merged branches             ║
║   git-undo                Undo last commit                   ║
╚══════════════════════════════════════════════════════════════╝
```

---

**Pro Tip**: Bookmark this guide by adding an alias:

```bash
# Add to ~/.local/share/chezmoi/private_dot_config/zsh/aliases/common.zsh
alias quickstart='dotfiles docs quickstart'

# Then just run:
$ quickstart
```

---

**Last Updated**: 2025-01-03
**View Online**: Run `dotfiles docs quickstart`
