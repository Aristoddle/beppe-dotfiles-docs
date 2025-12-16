# Dotfiles Architecture Guide

**Visual guide to system structure and data flow**

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Directory Structure](#directory-structure)
3. [Data Flow](#data-flow)
4. [Loading Order](#loading-order)
5. [Component Interaction](#component-interaction)
6. [Edit-Deploy Workflow](#edit-deploy-workflow)

---

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOTFILES ECOSYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐           ┌──────────────────┐          │
│  │   SOURCE REPO    │           │     DEPLOYED     │          │
│  │  (editable)      │  chezmoi  │   (read-only)    │          │
│  │                  │  ──────>  │                  │          │
│  │  ~/.local/share/ │  apply    │  ~/.config/zsh/  │          │
│  │  chezmoi/        │           │  ~/.gitconfig    │          │
│  └──────────────────┘           └──────────────────┘          │
│         │                                 │                    │
│         │                                 │                    │
│         │ git                             │ source             │
│         │ push/pull                       │                    │
│         │                                 │                    │
│         ▼                                 ▼                    │
│  ┌──────────────────┐           ┌──────────────────┐          │
│  │  GitHub Remote   │           │   Zsh Shell      │          │
│  │  Backup & Sync   │           │   Runtime        │          │
│  └──────────────────┘           └──────────────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Concepts

| Component | Purpose | Location |
|-----------|---------|----------|
| **Source Repo** | Where you edit | `~/.local/share/chezmoi/` |
| **Deployed Files** | What shell uses | `~/.config/zsh/`, `~/`, etc. |
| **chezmoi** | Deployment tool | Manages source → deployed sync |
| **Git** | Version control | Backs up source repo |

---

## Directory Structure

### Complete Tree View

```
$HOME/
│
├── .local/share/chezmoi/          ← SOURCE REPOSITORY (EDIT HERE!)
│   │
│   ├── .git/                      ← Git version control
│   ├── .github/                   ← CI/CD workflows
│   │   └── workflows/
│   │       └── test.yml           (Automated testing)
│   │
│   ├── private_dot_config/        ← Will deploy to ~/.config/
│   │   └── zsh/
│   │       ├── dot_zshrc          ├─► ~/.config/zsh/.zshrc
│   │       │
│   │       ├── config/            ← Core configuration
│   │       │   ├── 00-environment.zsh    (PATH, XDG, exports)
│   │       │   ├── 05-shell-options.zsh  (history, options)
│   │       │   ├── 10-omz.zsh            (Oh-My-Zsh)
│   │       │   ├── 20-plugins.zsh        (fzf, gh, direnv)
│   │       │   ├── 30-completions.zsh    (completion system)
│   │       │   ├── 40-prompt.zsh         (Powerlevel10k)
│   │       │   └── 99-welcome.zsh        (welcome message)
│   │       │
│   │       ├── aliases/           ← Command shortcuts
│   │       │   ├── common.zsh             (general)
│   │       │   ├── git.zsh                (git)
│   │       │   ├── docker.zsh             (docker)
│   │       │   ├── kubectl.zsh            (kubernetes)
│   │       │   ├── gh.zsh                 (GitHub CLI)
│   │       │   └── rust-tools.zsh         (bat, eza, etc.)
│   │       │
│   │       ├── functions/         ← Custom functions
│   │       │   ├── dotfiles-helper.zsh    (dotfiles command)
│   │       │   ├── smart-wrappers.zsh     (bat, ls, cd, man)
│   │       │   ├── python-dev.zsh         (pyinit, venv)
│   │       │   ├── node-dev.zsh           (nodeinit, npmup)
│   │       │   ├── polyglot-dev.zsh       (go, rust, etc.)
│   │       │   ├── git-utils.zsh          (fshow, fco)
│   │       │   └── system.zsh             (mkcd, path)
│   │       │
│   │       ├── os/                ← Platform-specific
│   │       │   ├── darwin.zsh             (macOS)
│   │       │   ├── linux.zsh              (Linux)
│   │       │   └── wsl.zsh                (WSL)
│   │       │
│   │       └── private/           ← Secrets (templates)
│   │           └── secrets.zsh.tmpl       (1Password)
│   │
│   ├── dot_claude/                ← Autonomous agents
│   │   ├── agents/                        (maintenance, security)
│   │   ├── skills/                        (zsh-expert, etc.)
│   │   ├── commands/                      (slash commands)
│   │   └── preferences.yml                (learning system)
│   │
│   ├── docs/                      ← Documentation
│   │   ├── QUICKSTART.md
│   │   ├── ARCHITECTURE_VISUAL.md         (this file)
│   │   ├── SSH_AUTH.md
│   │   ├── SETUP.md
│   │   └── ...
│   │
│   ├── tests/                     ← Test suite (bats)
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   │
│   ├── CLAUDE.md                  ← AI instructions
│   ├── README.md                  ← Main documentation
│   └── install.sh                 ← Bootstrap script
│
├── .config/zsh/                   ← DEPLOYED FILES (READ-ONLY!)
│   ├── .zshrc                     (Auto-managed by chezmoi)
│   ├── config/                    (Same structure as source)
│   ├── aliases/
│   ├── functions/
│   ├── os/
│   └── private/
│
├── .claude/                       ← Agent system (deployed)
│   ├── agents/
│   └── skills/
│
└── .gitconfig                     ← Git config (deployed)
```

### Naming Convention

chezmoi uses special prefixes for file naming:

| Prefix | Deployed As | Example |
|--------|-------------|---------|
| `dot_` | `.` | `dot_zshrc` → `.zshrc` |
| `private_` | (no prefix) | `private_dot_config` → `.config/` |
| `.tmpl` | (processed) | `secrets.zsh.tmpl` → `secrets.zsh` |

---

## Data Flow

### Source to Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW DIAGRAM                          │
└─────────────────────────────────────────────────────────────────┘

  1. EDIT SOURCE
  ┌───────────────────────────────────────┐
  │ ~/.local/share/chezmoi/               │
  │   private_dot_config/zsh/             │
  │     aliases/common.zsh                │
  └───────────────────────────────────────┘
           │
           │ chezmoi diff (preview)
           │
           ▼
  2. PREVIEW CHANGES
  ┌───────────────────────────────────────┐
  │ Shows:                                │
  │   + Added lines                       │
  │   - Removed lines                     │
  │   ~ Modified lines                    │
  └───────────────────────────────────────┘
           │
           │ chezmoi apply (deploy)
           │
           ▼
  3. DEPLOY TO SYSTEM
  ┌───────────────────────────────────────┐
  │ ~/.config/zsh/aliases/common.zsh      │
  │                                       │
  │ ⚠️  Read-only, managed by chezmoi     │
  └───────────────────────────────────────┘
           │
           │ source ~/.config/zsh/.zshrc
           │ (or: exec zsh)
           │
           ▼
  4. SHELL USES DEPLOYED FILES
  ┌───────────────────────────────────────┐
  │ Zsh Shell                             │
  │   ✅ New aliases available            │
  │   ✅ Functions loaded                 │
  └───────────────────────────────────────┘
```

### Version Control Flow

```
  LOCAL SOURCE                 REMOTE REPOSITORY
  ┌─────────────┐              ┌─────────────┐
  │  Edit files │              │   GitHub    │
  └──────┬──────┘              └──────▲──────┘
         │                            │
         │ git add .                  │ git push
         │ git commit                 │
         │                            │
         ▼                            │
  ┌─────────────┐                     │
  │ Committed   │─────────────────────┘
  │ Changes     │
  └─────────────┘
         │
         │ chezmoi apply
         │
         ▼
  ┌─────────────┐
  │ Deployed to │
  │ System      │
  └─────────────┘
```

---

## Loading Order

### Shell Initialization Sequence

```
┌────────────────────────────────────────────────────────────────┐
│                 ZSH INITIALIZATION FLOW                        │
└────────────────────────────────────────────────────────────────┘

  1. Powerlevel10k Instant Prompt
     ├─► Fast prompt rendering
     └─► ~/.cache/p10k-instant-prompt-*.zsh

  2. Main .zshrc
     ├─► ~/.config/zsh/.zshrc
     └─► Orchestrates all other files

  3. Core Configuration (in order)
     ├─► 00-environment.zsh      (PATH, XDG_CONFIG_HOME, exports)
     ├─► 05-shell-options.zsh    (HIST_SIZE, setopt, etc.)
     ├─► 10-omz.zsh              (Oh-My-Zsh initialization)
     ├─► 20-plugins.zsh          (fzf, gh, direnv, zoxide)
     ├─► 30-completions.zsh      (Completion system)
     ├─► 40-prompt.zsh           (Powerlevel10k config)
     └─► 99-welcome.zsh          (Welcome message)

  4. Aliases
     ├─► For each file in aliases/*.zsh:
     │   ├─► common.zsh
     │   ├─► git.zsh
     │   ├─► docker.zsh
     │   └─► ... (all .zsh files)
     └─► Loaded alphabetically

  5. Functions
     ├─► For each file in functions/*.zsh:
     │   ├─► dotfiles-helper.zsh
     │   ├─► smart-wrappers.zsh
     │   ├─► python-dev.zsh
     │   └─► ... (all .zsh files)
     └─► Loaded alphabetically

  6. OS-Specific Configuration
     ├─► Detect OS: uname -s
     ├─► If Darwin: source os/darwin.zsh
     ├─► If Linux + Microsoft: source os/wsl.zsh
     └─► If Linux: source os/linux.zsh

  7. Private/Secrets
     ├─► Source private/secrets.zsh
     └─► 1Password integration, API keys

  8. Custom User Config
     └─► If exists: source ~/.config/zsh/custom.zsh

  9. Powerlevel10k Final Setup
     └─► Source ~/.p10k.zsh

┌────────────────────────────────────────────────────────────────┐
│ ✅ Shell Ready!                                                │
│ All aliases, functions, and configurations loaded              │
└────────────────────────────────────────────────────────────────┘
```

### Why This Order Matters

1. **Environment First** - PATH must be set before anything else
2. **Oh-My-Zsh Early** - Framework must load before plugins
3. **Plugins After OMZ** - Plugins depend on OMZ being initialized
4. **Aliases Before Functions** - Functions can override aliases
5. **OS-Specific Last** - Override defaults for specific platform
6. **Secrets Last** - Private config can override public defaults

---

## Component Interaction

### How Components Work Together

```
┌─────────────────────────────────────────────────────────────────┐
│              COMPONENT INTERACTION DIAGRAM                      │
└─────────────────────────────────────────────────────────────────┘

           User Types Command
                   │
                   ▼
         ┌─────────────────┐
         │  Zsh Shell      │
         └────────┬────────┘
                  │
                  ├──────► Alias?  ─────► aliases/*.zsh
                  │                         ↓
                  │                       Execute
                  │
                  ├──────► Function? ───► functions/*.zsh
                  │                         ↓
                  │                       Execute
                  │
                  ├──────► Binary? ────► Check $PATH
                  │                         │
                  │                         ├─► ~/.local/bin
                  │                         ├─► /opt/homebrew/bin
                  │                         ├─► ~/.cargo/bin
                  │                         └─► /usr/bin
                  │
                  └──────► Not Found ───► command-not-found plugin
                                             ↓
                                           Suggest Package
```

### Example: `pyinit` Command

```
 User runs: pyinit myproject
    │
    ▼
 Zsh searches:
    │
    ├─► Alias? ❌ Not found in aliases/*.zsh
    │
    ├─► Function? ✅ Found in functions/python-dev.zsh
    │
    └─► Execute function:
         │
         ├─► 1. Check if mise installed (graceful degradation)
         │
         ├─► 2. Create project directory
         │
         ├─► 3. Create .mise.toml with Python version
         │
         ├─► 4. Create virtualenv (.venv)
         │
         ├─► 5. Activate virtualenv
         │
         └─► 6. Install basic packages (pip, wheel, setuptools)
```

---

## Edit-Deploy Workflow

### Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  EDIT-DEPLOY-TEST WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

  START
    │
    ▼
  ┌──────────────────────────────┐
  │ 1. DECIDE WHAT TO EDIT       │
  │                              │
  │ Run: dotfiles list           │
  │ Run: dotfiles docs arch      │
  └──────────────┬───────────────┘
                 │
                 ▼
  ┌──────────────────────────────┐
  │ 2. EDIT SOURCE FILE          │
  │                              │
  │ Option A:                    │
  │   dotfiles edit <file>       │
  │                              │
  │ Option B:                    │
  │   cd ~/.local/share/chezmoi  │
  │   vim private_dot_config/... │
  └──────────────┬───────────────┘
                 │
                 ▼
  ┌──────────────────────────────┐
  │ 3. PREVIEW CHANGES           │
  │                              │
  │ Run: chezmoi diff            │
  │                              │
  │ Review:                      │
  │   + Added lines              │
  │   - Removed lines            │
  │   ~ Modified lines           │
  └──────────────┬───────────────┘
                 │
                 ├─► Happy? ────► YES ──┐
                 │                       │
                 └─► NO ─────────────► (Edit again)
                                         │
  ┌──────────────────────────────────◄──┘
  │ 4. APPLY CHANGES             │
  │                              │
  │ Run: chezmoi apply           │
  │                              │
  │ Source files → Deployed      │
  └──────────────┬───────────────┘
                 │
                 ▼
  ┌──────────────────────────────┐
  │ 5. TEST IN SHELL             │
  │                              │
  │ Run: exec zsh                │
  │                              │
  │ Test: your-new-command       │
  └──────────────┬───────────────┘
                 │
                 ├─► Works? ────► YES ──┐
                 │                       │
                 └─► NO ─────────────► (Debug & edit again)
                                         │
  ┌──────────────────────────────────◄──┘
  │ 6. COMMIT TO GIT             │
  │                              │
  │ cd ~/.local/share/chezmoi    │
  │ git add .                    │
  │ git commit -m "..."          │
  │ git push                     │
  └──────────────┬───────────────┘
                 │
                 ▼
  ┌──────────────────────────────┐
  │ 7. DONE! ✅                  │
  │                              │
  │ Changes:                     │
  │  ✅ Applied to system        │
  │  ✅ Committed to git         │
  │  ✅ Pushed to GitHub         │
  │  ✅ Backed up safely         │
  └──────────────────────────────┘
```

### Common Mistake: Editing Deployed Files

```
❌ WRONG WAY (Changes will be lost!)

  Edit: ~/.config/zsh/aliases/common.zsh
    │
    ├─► Changes work temporarily
    │
    └─► Next 'chezmoi apply' overwrites your changes!


✅ CORRECT WAY (Changes are permanent)

  Edit: ~/.local/share/chezmoi/private_dot_config/zsh/aliases/common.zsh
    │
    ├─► Run: chezmoi apply
    │
    ├─► Commit to git
    │
    └─► Changes persist forever!
```

---

## Quick Reference

### File Location Cheat Sheet

| What | Source Location | Deployed Location |
|------|----------------|-------------------|
| Main config | `~/.local/share/chezmoi/private_dot_config/zsh/dot_zshrc` | `~/.config/zsh/.zshrc` |
| Common aliases | `~/.local/share/chezmoi/private_dot_config/zsh/aliases/common.zsh` | `~/.config/zsh/aliases/common.zsh` |
| Python functions | `~/.local/share/chezmoi/private_dot_config/zsh/functions/python-dev.zsh` | `~/.config/zsh/functions/python-dev.zsh` |
| Oh-My-Zsh config | `~/.local/share/chezmoi/private_dot_config/zsh/config/10-omz.zsh` | `~/.config/zsh/config/10-omz.zsh` |
| Secrets | `~/.local/share/chezmoi/private_dot_config/zsh/private/secrets.zsh.tmpl` | `~/.config/zsh/private/secrets.zsh` |

### Command Cheat Sheet

| Task | Command |
|------|---------|
| Edit file | `dotfiles edit <file>` |
| Preview changes | `chezmoi diff` |
| Apply changes | `chezmoi apply` |
| Reload shell | `exec zsh` |
| Check status | `dotfiles status` |
| Go to source | `cd ~/.local/share/chezmoi` |
| Commit changes | `git add . && git commit && git push` |

---

**Last Updated**: 2025-01-03
**View Online**: Run `dotfiles docs architecture`
