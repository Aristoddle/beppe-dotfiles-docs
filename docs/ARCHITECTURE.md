# System Architecture

Complete architectural overview of beppe-system-bootstrap's 4-layer design.

## System Overview

Beppe-system-bootstrap is a **programmable, AI-augmented development environment** built on 4 distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4: Agent Layer (Autonomous Maintenance)              │
│  ~/.claude/agents/ + ~/.claude/skills/                      │
│  - 5 specialized agents                                     │
│  - 4 skills (zsh-expert, graceful-degradation, etc.)        │
│  - 3 multi-agent workflows                                  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Meta Project (Planning & Documentation)           │
│  ~/Documents/Code/Claude-Codex-Collaboration/docs/          │
│  - Workflow definitions                                     │
│  - Development standards                                    │
│  - Session summaries                                        │
│  - Knowledge graph index                                    │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Deployed Configs (What Shell Reads)               │
│  ~/.config/zsh/, ~/.gitconfig, ~/.p10k.zsh, etc.            │
│  - Managed by chezmoi (read-only, NEVER edit directly)      │
│  - Templates rendered with machine-specific variables       │
│  - Symlinked or copied from Layer 1                         │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: chezmoi Source (Configuration Management)          │
│  ~/.local/share/chezmoi/ (git repository)                   │
│  - Source of truth for all configs                          │
│  - Contains templates, scripts, dotfiles                    │
│  - Version-controlled, portable across machines             │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: chezmoi Source (Foundation)

### Purpose
Single source of truth for all configuration files, managed by git.

### Location
```
~/.local/share/chezmoi/
```

### Structure
```
~/.local/share/chezmoi/
├── .zshrc                              # Main shell orchestrator
├── private_dot_config/zsh/
│   ├── config/                         # Core configurations
│   │   ├── 00-environment.zsh          # PATH, XDG, exports
│   │   ├── 05-shell-options.zsh        # Shell behavior
│   │   ├── 10-omz.zsh                  # Oh-My-Zsh
│   │   ├── 20-plugins.zsh              # Plugin loading
│   │   ├── 30-completions.zsh          # Completion system
│   │   └── 40-prompt.zsh               # Powerlevel10k
│   ├── aliases/                        # Command shortcuts
│   │   ├── common.zsh
│   │   ├── git.zsh
│   │   ├── rust-tools.zsh
│   │   ├── docker.zsh
│   │   ├── kubectl.zsh
│   │   └── gh.zsh
│   ├── functions/                      # Shell functions
│   │   ├── smart-wrappers.zsh
│   │   ├── system.zsh
│   │   ├── git-utils.zsh
│   │   ├── dev.zsh
│   │   └── workflows.zsh
│   ├── os/                             # Platform-specific
│   │   ├── darwin.zsh                  # macOS
│   │   ├── linux.zsh                   # Linux
│   │   └── wsl.zsh                     # WSL
│   └── private/
│       └── secrets.zsh.tmpl            # 1Password integration
├── private_dot_config/
│   ├── nvim/                           # Neovim config
│   ├── alacritty/                      # Terminal emulator
│   ├── atuin/                          # Shell history
│   ├── mise/                           # Runtime manager
│   └── gh/                             # GitHub CLI
├── dot_claude/                         # Claude Code integration
│   ├── agents/                         # Autonomous agents
│   │   ├── dotfiles-maintainer.md
│   │   ├── security-scanner.md
│   │   ├── zsh-performance-auditor.md
│   │   ├── test-validator.md
│   │   └── doc-synchronizer.md
│   └── skills/                         # AI behavior guidelines
│       ├── zsh-expert.md
│       ├── graceful-degradation.md
│       ├── pipe-safety-checker.md
│       └── chezmoi-expert.md
├── dot_gitconfig.tmpl                  # Git config template
├── dot_chezmoi.toml.tmpl               # chezmoi variables
├── .chezmoiignore                      # Exclusion patterns
├── docs/                               # Documentation
│   ├── TOOLS.md
│   ├── MIGRATION.md
│   ├── ARCHITECTURE.md (this file)
│   ├── AGENT_DEVELOPMENT.md
│   └── workflows/
│       ├── health-check.md
│       ├── pre-commit.md
│       └── performance-audit.md
├── .github/
│   └── ROADMAP.md
├── README.md
├── CLAUDE.md                           # AI project instructions
└── CHANGELOG.md
```

### Key Characteristics

**Git-Managed**:
- Full version control
- Commit history
- Portable across machines

**Template Support**:
- `{{.git.name}}`, `{{.github.username}}`, etc.
- Per-machine customization
- Prompts on first init

**File Naming Convention**:
- `dot_filename` → `~/.filename`
- `private_dot_config/zsh/` → `~/.config/zsh/`
- `file.tmpl` → Rendered template

### Workflow

```bash
# Edit source (ALWAYS edit here)
cd ~/.local/share/chezmoi
vim private_dot_config/zsh/config/10-omz.zsh

# Deploy to target locations
chezmoi apply

# Version control
git add .
git commit -m "feat: Enable kubectl plugin"
git push
```

## Layer 2: Deployed Configs (Runtime)

### Purpose
Where your shell and tools actually read configurations.

### Locations
```
~/.config/zsh/              # Shell configs
~/.gitconfig                # Git
~/.p10k.zsh                 # Powerlevel10k
~/.config/nvim/             # Neovim
~/.config/alacritty/        # Terminal
~/.config/atuin/            # Shell history
~/.config/mise/             # Runtime manager
~/.config/gh/               # GitHub CLI
```

### Key Characteristics

**Read-Only** (from user perspective):
- Managed by chezmoi
- **NEVER edit directly**
- Changes overwritten by `chezmoi apply`

**Template Rendering**:
```toml
# Source: dot_gitconfig.tmpl
[user]
    name = {{ .git.name }}
    email = {{ .git.email }}

# Deployed: ~/.gitconfig
[user]
    name = Joe Lanzone
    email = j3lanzone@gmail.com
```

**Platform-Specific**:
- OS-specific files loaded automatically
- `os/darwin.zsh` on macOS
- `os/linux.zsh` on Linux
- `os/wsl.zsh` on WSL

### Workflow

```bash
# Check deployed state
chezmoi diff

# See what would change
chezmoi apply --dry-run

# Apply changes from source
chezmoi apply

# Reload shell to apply
exec zsh
```

## Layer 3: Meta Project (Development)

### Purpose
Planning, documentation, and development workspace separate from config source.

### Location
```
~/Documents/Code/beppe-system-bootstrap/
```

### Structure
```
~/Documents/Code/beppe-system-bootstrap/
├── README.md                   # Meta project overview
├── docs/
│   ├── SESSION_SUMMARY_*.md   # Session notes
│   ├── KG_SCHEMA.md           # Knowledge graph standards
│   ├── KG_INDEX.md            # Entity index
│   └── SYSTEM_STATE_*.md      # System audits
├── workflows/                 # Workflow development
│   └── experimental/          # Testing new workflows
├── agents/                    # Agent development
│   └── prototypes/            # Testing new agents
└── .gitignore                 # Don't track in dotfiles repo
```

### Key Characteristics

**Not Part of Dotfiles**:
- Separate from chezmoi source
- Local development workspace
- Not deployed to other machines

**Purpose**:
- Planning documents
- Session summaries
- Knowledge graph management
- Agent/workflow prototyping
- System audits

**Why Separate?**

Benefits:
- ✅ Don't clutter dotfiles repo with meta docs
- ✅ Keep development separate from production
- ✅ Test agents before deploying to `~/.claude/`
- ✅ Machine-specific notes (don't sync)

Drawbacks:
- Requires manual setup on new machines
- Not automatically synced

### Workflow

```bash
# Navigate to meta workspace
cd ~/Documents/Code/beppe-system-bootstrap

# Edit planning docs
vim docs/SESSION_SUMMARY_OCT_31.md

# Develop new agent
vim agents/prototypes/new-agent.md

# Test workflow
cp agents/prototypes/new-agent.md ~/.local/share/chezmoi/dot_claude/agents/
chezmoi apply
/agent new-agent

# If successful, commit to dotfiles repo
cd ~/.local/share/chezmoi
git add dot_claude/agents/new-agent.md
git commit -m "feat(agent): Add new-agent"
git push
```

## Layer 4: Agent Layer (Automation)

### Purpose
Autonomous maintenance, validation, and optimization through AI agents.

### Location
```
~/.claude/agents/     # Deployed from dot_claude/agents/
~/.claude/skills/     # Deployed from dot_claude/skills/
```

### Components

**Skills** (4 total):
```
~/.claude/skills/
├── zsh-expert.md                  # Zsh syntax guidance
├── graceful-degradation.md        # Tool availability checks
├── pipe-safety-checker.md         # Pipe detection patterns
└── chezmoi-expert.md              # chezmoi workflow enforcement
```

**Agents** (5 total):
```
~/.claude/agents/
├── dotfiles-maintainer.md         # System health monitoring
├── security-scanner.md            # Secret scanning, permissions
├── zsh-performance-auditor.md     # Startup profiling
├── test-validator.md              # Function testing
└── doc-synchronizer.md            # Doc/code validation
```

**Workflows** (3 total):
```
Documented in: docs/workflows/
├── health-check.md                # Parallel: maintainer + scanner
├── pre-commit.md                  # Parallel: test + doc validation
└── performance-audit.md           # Sequential: auditor + maintainer
```

### Key Characteristics

**Autonomous Operation**:
- Skills: Always active (shape Claude's behavior)
- Agents: On-demand or scheduled
- Workflows: Orchestrate multiple agents

**Integration**:
```bash
# Invoke single agent
/agent dotfiles-maintainer

# Run workflow (launches multiple agents)
workflow health

# Pre-commit hook integration
git config core.hooksPath ~/.config/git/hooks
```

**Outputs**:
```
~/.cache/
├── system-health-report.md
├── security-audit-report.md
├── zsh-performance-report.md
├── test-validation-report.md
└── doc-sync-report.md
```

## Data Flow

### New Machine Setup

```
1. Install chezmoi
   ↓
2. Initialize from GitHub
   chezmoi init --apply github.com/Aristoddle/beppe-system-bootstrap
   ↓
3. chezmoi prompts for template variables:
   - Git name, email
   - GitHub username
   - Device name
   ↓
4. Source (Layer 1) → Deployed (Layer 2)
   - Render templates with variables
   - Copy/symlink files to target locations
   ↓
5. Skills & Agents (Layer 4) deployed
   - ~/.claude/agents/ populated
   - ~/.claude/skills/ populated
   ↓
6. (Optional) Create meta workspace (Layer 3)
   mkdir -p ~/Documents/Code/beppe-system-bootstrap
   ↓
7. System ready!
```

### Making Changes

```
Edit Source (Layer 1):
  cd ~/.local/share/chezmoi
  vim private_dot_config/zsh/config/10-omz.zsh
  ↓
Deploy (Layer 1 → Layer 2):
  chezmoi apply
  ↓
Reload Shell:
  exec zsh
  ↓
Validate (Layer 4):
  workflow pre-commit
  ↓
Version Control:
  git add . && git commit && git push
```

### Agent Workflow Example

```
User runs: workflow health
  ↓
Workflow Launcher (Layer 4):
  - Reads workflow definition from docs/workflows/health-check.md
  - Launches 2 agents in parallel:
    1. dotfiles-maintainer
    2. security-scanner
  ↓
Agents Execute:
  - Read source configs (Layer 1)
  - Check deployed configs (Layer 2)
  - Run diagnostics
  - Generate reports
  ↓
Output Reports:
  - ~/.cache/system-health-report.md
  - Exit code (0=healthy, 1=warnings, 2=critical)
  ↓
User Reviews:
  - Read report
  - Execute recommended fixes
  - Re-run to verify
```

## Cross-Layer Interactions

### Layer 1 ↔ Layer 2
**chezmoi apply**
- Renders templates
- Copies/symlinks files
- Updates deployed configs

### Layer 1 ↔ Layer 4
**Agents analyze source**
- Read chezmoi source directly
- Check for uncommitted changes
- Validate template syntax

### Layer 2 ↔ Layer 4
**Agents validate runtime**
- Check deployed file integrity
- Test actual tool configurations
- Benchmark shell startup

### Layer 3 ↔ Layer 4
**Development & prototyping**
- Test agents in Layer 3 before deploying
- Document workflows in Layer 3
- Promote successful agents to Layer 1

## Design Principles

### 1. Separation of Concerns
- **Layer 1**: Source of truth (version control)
- **Layer 2**: Runtime environment (read-only)
- **Layer 3**: Development workspace (local)
- **Layer 4**: Automation & intelligence (AI)

### 2. Unidirectional Flow
- Source (Layer 1) → Deployed (Layer 2)
- Never edit Layer 2 directly
- Always use `chezmoi edit` or edit Layer 1

### 3. Portability
- Layer 1 portable via git
- Layer 2 generated per-machine
- Layer 3 optional (machine-specific)
- Layer 4 deployed with Layer 1

### 4. Automation-First
- Agents automate maintenance
- Workflows orchestrate complexity
- Skills guide AI behavior
- Self-optimizing system

## For New Users

### Minimum Understanding

You only need to understand 2 layers to get started:

**Layer 1 (chezmoi source)**:
- This is where you make changes
- `cd ~/.local/share/chezmoi && vim file`

**Layer 2 (deployed configs)**:
- This is where your shell reads from
- Don't edit directly

### Advanced Understanding

To leverage full power:

**Layer 3 (meta workspace)**:
- Create for planning and development
- Not required but useful

**Layer 4 (agents)**:
- Run `workflow health` weekly
- Use `workflow pre-commit` before pushing
- Let automation handle maintenance

## Troubleshooting

### "My changes aren't applying"
- Are you editing Layer 2 instead of Layer 1?
- Did you run `chezmoi apply` after editing?
- Check `chezmoi diff` to see what would change

### "Where do I edit this file?"
- If it's in `~/`, edit in `~/.local/share/chezmoi/`
- Use `chezmoi edit <filepath>` to open source

### "Agents aren't working"
- Check `~/.claude/agents/` exists
- Verify agent files deployed: `chezmoi apply`
- Test single agent: `/agent agent-name`

### "Meta workspace missing"
- Layer 3 is optional
- Create manually: `mkdir -p ~/Documents/Code/beppe-system-bootstrap`
- Populate with planning docs as needed

---

**Last Updated**: 2025-10-31
**Architecture Version**: 1.0
**Complexity**: 4-layer system
