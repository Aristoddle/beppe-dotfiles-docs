# Tab Completion Implementation Guide

**Created**: 2025-11-14
**Context**: Fix wrapper completion failures + add recursive completions for top 10 commands
**Status**: READY FOR IMPLEMENTATION

---

## Problem Statement

### Current Issues
1. **Wrapper functions fail to inherit completions**
   - `compdef bat=bat` checks `${+_comps[bat]}` → returns false
   - Native completions not loaded because tools installed via cargo/standalone (not Homebrew)

2. **Missing completions for high-frequency commands**
   - Top 10 from atuin stats: bat (145), codex (54), atuin (40), mise (32), eza (28), dotfiles (25), cat (22), chezmoi (20), brew (18)
   - All missing tab completion despite native support

3. **No recursive completion for custom functions**
   - `dotfiles` has 3-level command tree but no completion
   - Example: `dotfiles neovim <tab>` should show: status, install, update, health, fix, clean, copilot

### Root Cause
**Loading order issue**:
```
Current (broken):
1. compinit loads Homebrew completions from fpath
2. Wrapper compdef attempts: compdef bat=bat
3. Check fails: ${+_comps[bat]} returns false (bat not in fpath)
4. Result: No completion for bat wrapper

Should be:
1. Load native completions via lazy-loading (bat --completion zsh)
2. THEN wrapper compdef inherits properly
```

---

## Solution Architecture

### Three-Tier Completion System

```
┌─────────────────────────────────────────────────┐
│ Tier 1: Native Tool Completions                │
│ (bat, atuin, mise, chezmoi)                     │
│ - Lazy-loaded from tool --completion zsh       │
│ - 7-day cache regeneration                     │
│ - Handles own recursion internally             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Tier 2: Wrapper Completions                    │
│ (bat, ls, ll, la, tree, cd, man)                │
│ - Inherits from Tier 1 via compdef             │
│ - Now works because native loaded above        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Tier 3: Custom Completions                     │
│ (dotfiles, pyinit, nodeinit)                    │
│ - Hand-crafted state machines                  │
│ - Recursive via $words array inspection        │
└─────────────────────────────────────────────────┘
```

---

## Implementation: Phase 1 - Native Tool Completions

**File**: `~/.local/share/chezmoi/private_dot_config/zsh/config/30-completions.zsh`

**Location**: Insert after line 79 (after claude completion, before wrapper completions)

### Code to Add

```zsh
# ============================================================================
# Native Tool Completions (Lazy-Loaded)
# ============================================================================
# Tools installed via cargo/standalone (not Homebrew) need manual completion loading
# Pattern: Generate from native tool, cache for 7 days, source cached file
# This MUST happen BEFORE wrapper completions so compdef inheritance works

# bat - Syntax-highlighting cat replacement (145 uses)
if type -p bat &>/dev/null; then
  local bat_completion="${XDG_CACHE_HOME:-$HOME/.cache}/zsh/bat_completion.zsh"

  # Regenerate if missing or older than 7 days
  if [[ ! -f "$bat_completion" ]] || find "$bat_completion" -mtime +7 2>/dev/null | grep -q .; then
    mkdir -p "${XDG_CACHE_HOME:-$HOME/.cache}/zsh"
    command bat --completion zsh > "$bat_completion" 2>/dev/null
  fi

  # Source cached completion
  [[ -f "$bat_completion" ]] && source "$bat_completion"
fi

# atuin - Shell history management (40 uses)
if type -p atuin &>/dev/null; then
  local atuin_completion="${XDG_CACHE_HOME:-$HOME/.cache}/zsh/atuin_completion.zsh"

  if [[ ! -f "$atuin_completion" ]] || find "$atuin_completion" -mtime +7 2>/dev/null | grep -q .; then
    mkdir -p "${XDG_CACHE_HOME:-$HOME/.cache}/zsh"
    command atuin gen-completions --shell zsh > "$atuin_completion" 2>/dev/null
  fi

  [[ -f "$atuin_completion" ]] && source "$atuin_completion"
fi

# mise - Polyglot version manager (32 uses)
if type -p mise &>/dev/null; then
  local mise_completion="${XDG_CACHE_HOME:-$HOME/.cache}/zsh/mise_completion.zsh"

  if [[ ! -f "$mise_completion" ]] || find "$mise_completion" -mtime +7 2>/dev/null | grep -q .; then
    mkdir -p "${XDG_CACHE_HOME:-$HOME/.cache}/zsh"
    command mise completion zsh > "$mise_completion" 2>/dev/null
  fi

  [[ -f "$mise_completion" ]] && source "$mise_completion"
fi

# chezmoi - Dotfile manager (20 uses)
if type -p chezmoi &>/dev/null; then
  local chezmoi_completion="${XDG_CACHE_HOME:-$HOME/.cache}/zsh/chezmoi_completion.zsh"

  if [[ ! -f "$chezmoi_completion" ]] || find "$chezmoi_completion" -mtime +7 2>/dev/null | grep -q .; then
    mkdir -p "${XDG_CACHE_HOME:-$HOME/.cache}/zsh"
    command chezmoi completion zsh > "$chezmoi_completion" 2>/dev/null
  fi

  [[ -f "$chezmoi_completion" ]] && source "$chezmoi_completion"
fi
```

**Lines added**: ~60
**Testing**: After reload, `bat --<tab>` should complete flags, `mise use <tab>` should complete plugins

---

## Implementation: Phase 2 - Fix Wrapper Completions

**File**: Same file, update existing wrapper completion section (lines 86-106)

### Current Code (BROKEN)
```zsh
# bat wrapper - use bat's completion if available
if type bat &>/dev/null && (( ${+_comps[bat]} )); then
  compdef bat=bat
fi
```

### Fixed Code
```zsh
# bat wrapper - inherit bat's completion (loaded above in Phase 1)
if type -p bat &>/dev/null && (( ${+_comps[bat]} )); then
  compdef bat=bat
fi
```

**Changes**:
1. Added comment clarifying dependency on Phase 1
2. Changed `type bat` to `type -p bat` for consistency (finds binary, not function)

**Repeat for**: ls, ll, la, tree, cd, man wrappers

---

## Implementation: Phase 3 - Custom Dotfiles Completion

**File**: Same file, add after wrapper completions section

### Command Tree Analysis
```
dotfiles
├── doctor / health              (0 args)
├── auth
│   ├── status                  (0 args)
│   ├── 1password               (0 args)
│   ├── gh                      (0 args)
│   ├── claude                  (0 args)
│   └── codex                   (0 args)
├── neovim
│   ├── status                  (0 args)
│   ├── install                 (0 args)
│   ├── update                  (0 args)
│   ├── health                  (0 args)
│   ├── fix                     (0 args)
│   ├── clean                   (0 args)
│   └── copilot                 (0 args)
├── reload [--force]            (optional flag)
├── sync                        (0 args)
├── edit <file>                 (file completion)
├── status                      (0 args)
├── update                      (0 args)
├── list [category]             (optional: all/functions/aliases)
├── arch                        (0 args)
└── ssh                         (0 args)
```

**Max depth**: 3 levels (command → subcommand → sub-subcommand)

### Code to Add

```zsh
# ============================================================================
# Custom Function Completions
# ============================================================================
# Hand-crafted completions for custom shell functions
# Uses _arguments with state machines for recursive completion

# dotfiles - Dotfiles management (25 uses)
# Handles 3-level recursion: dotfiles → auth/neovim → 1password/status
_dotfiles() {
  local curcontext="$curcontext" state line
  typeset -A opt_args

  # Level 1: dotfiles <command>
  # Level 2+: Captured by *::arg:->args
  _arguments -C \
    '1:command:->cmds' \
    '*::arg:->args'

  case $state in
    cmds)
      # Level 1: Top-level commands
      local -a commands
      commands=(
        'doctor:Check dotfiles health (all systems)'
        'health:Alias for doctor'
        'auth:Authentication management'
        'neovim:Neovim management'
        'reload:Pull from git, apply changes, reload shell'
        'sync:Apply changes without git pull'
        'edit:Edit dotfiles safely via chezmoi'
        'status:Check dotfiles status'
        'update:Update chezmoi and apply'
        'list:List available functions/aliases'
        'arch:Show architecture overview'
        'ssh:Show SSH/auth setup info'
      )
      _describe 'command' commands
      ;;

    args)
      # Level 2+: Subcommands based on $words[2]
      case $words[2] in
        auth)
          # Level 2: dotfiles auth <subcommand>
          local -a auth_cmds
          auth_cmds=(
            'status:Check all auth statuses (op, gh, claude, codex, copilot)'
            '1password:Sign in to 1Password'
            'gh:Authenticate GitHub CLI'
            'claude:Authenticate Claude CLI'
            'codex:Setup Codex authentication'
          )
          _describe 'auth command' auth_cmds
          ;;

        neovim)
          # Level 2: dotfiles neovim <subcommand>
          local -a nvim_cmds
          nvim_cmds=(
            'status:Check Neovim health (plugins, LSP, AI assistants)'
            'install:First-time setup (plugins, language servers)'
            'update:Update all plugins'
            'health:Run Neovim health checks'
            'fix:Fix common issues (rebuild, clean)'
            'clean:Clean cache and old logs'
            'copilot:Authenticate GitHub Copilot'
          )
          _describe 'neovim command' nvim_cmds
          ;;

        reload)
          # Level 2: dotfiles reload [--force]
          _arguments '--force[Force reload, skip uncommitted check]'
          ;;

        list)
          # Level 2: dotfiles list [category]
          local -a categories
          categories=(
            'all:Show all functions and aliases'
            'functions:Show only functions'
            'aliases:Show only aliases'
          )
          _describe 'category' categories
          ;;

        edit)
          # Level 2: dotfiles edit <file>
          # Complete from chezmoi managed files
          local -a managed_files
          if type -p chezmoi &>/dev/null; then
            # Get list of managed files from chezmoi
            managed_files=(${(f)"$(chezmoi managed 2>/dev/null)"})
            _describe 'managed file' managed_files
          else
            # Fallback to generic file completion
            _files
          fi
          ;;
      esac
      ;;
  esac
}

# Register completion function
compdef _dotfiles dotfiles
```

**Lines added**: ~90
**Recursion depth**: 3 levels via state machine
**Testing**: `dotfiles neovim <tab>` → shows 7 subcommands, `dotfiles auth <tab>` → shows 5 subcommands

---

## Testing Checklist

### Phase 1: Native Tool Completions
```bash
# Reload shell
exec zsh

# Test bat completion
bat --<tab>               # Should show flags (--help, --version, --theme, etc.)
bat <tab>                 # Should complete files

# Test atuin completion
atuin <tab>               # Should show subcommands (search, history, stats, etc.)

# Test mise completion
mise use <tab>            # Should show plugins (node, python, etc.)
mise use node<tab>        # Should show node versions

# Test chezmoi completion
chezmoi <tab>             # Should show subcommands (add, apply, edit, etc.)
chezmoi edit <tab>        # Should complete managed files
```

### Phase 2: Wrapper Completions
```bash
# Test wrapper inheritance
bat <tab>                 # Should use bat completion (same as command bat)
ls <tab>                  # Should use eza completion if available

# Verify wrappers still work
bat README.md             # Should show syntax highlighting
bat README.md | head      # Should show plain output (pipe detection works)
```

### Phase 3: Custom Completions
```bash
# Test level 1
dotfiles <tab>            # Should show: doctor, auth, neovim, reload, sync, edit, status, etc.

# Test level 2 (auth)
dotfiles auth <tab>       # Should show: status, 1password, gh, claude, codex

# Test level 2 (neovim)
dotfiles neovim <tab>     # Should show: status, install, update, health, fix, clean, copilot

# Test level 2 (flags)
dotfiles reload <tab>     # Should show: --force

# Test level 2 (categories)
dotfiles list <tab>       # Should show: all, functions, aliases

# Test level 2 (files)
dotfiles edit <tab>       # Should complete chezmoi managed files
```

---

## Verification

### Success Criteria
- [ ] Native tools (bat, atuin, mise, chezmoi) have full completion
- [ ] Wrappers (bat, ls, etc.) inherit completion properly
- [ ] `dotfiles` command completes 3 levels deep
- [ ] No performance degradation on shell startup (<200ms)
- [ ] Completions regenerate every 7 days automatically
- [ ] All tests in checklist pass

### Performance Check
```bash
# Measure shell startup time
time zsh -i -c exit
# Should be <200ms

# Check cache files exist
ls -lh ~/.cache/zsh/
# Should show: bat_completion.zsh, atuin_completion.zsh, mise_completion.zsh, chezmoi_completion.zsh

# Verify cache freshness
find ~/.cache/zsh/ -name "*_completion.zsh" -mtime +7
# Should be empty (no files older than 7 days)
```

---

## Rollback Plan

If issues arise:

### Quick Rollback
```bash
cd ~/.local/share/chezmoi
git revert HEAD  # Revert completion changes
chezmoi apply
exec zsh
```

### Selective Disable
Comment out problematic sections in `30-completions.zsh`:
```bash
chezmoi edit ~/.config/zsh/config/30-completions.zsh
# Comment out Phase 1/2/3 as needed
chezmoi apply
exec zsh
```

### Clear Cache
```bash
rm -rf ~/.cache/zsh/*_completion.zsh
exec zsh  # Regenerates on next load
```

---

## Future Enhancements

### Phase 4: Additional Completions
- **nvim**: Check if Neovim supports completion generation
- **eza**: Hand-craft if no native completion available
- **brew**: Already in Homebrew fpath, just needs compdef if wrapper exists

### Phase 5: Completion Documentation
Add inline help for custom completions:
```zsh
_dotfiles() {
  # ... existing code ...

  # Add help message for unclear commands
  case $words[2] in
    arch)
      _message 'Show architecture overview (no arguments)'
      ;;
  esac
}
```

### Phase 6: Dynamic Completion
For `dotfiles edit`, parse chezmoi managed list dynamically:
```zsh
local -a managed=(${(f)"$(chezmoi managed -i files)"})
```

---

## Notes

**Why lazy-loading?**
- Tools update frequently (new flags, subcommands)
- 7-day cache ensures completion stays fresh
- Startup cost minimal (source cached file ~10ms)

**Why state machines for custom completions?**
- Handles arbitrary depth (not limited to 3 levels)
- Extensible (add new subcommands easily)
- Standard zsh pattern (well-documented)

**Why 3-tier architecture?**
- Native tools: Best completion (tool-generated, always accurate)
- Wrappers: Inherit native (zero maintenance)
- Custom: Necessary evil (hand-crafted, high maintenance)

---

## References

- **Zsh Completion System**: http://zsh.sourceforge.net/Doc/Release/Completion-System.html
- **Writing Completions**: https://github.com/zsh-users/zsh-completions/blob/master/zsh-completions-howto.org
- **Current Implementation**: `~/.local/share/chezmoi/private_dot_config/zsh/config/30-completions.zsh`
- **Sequential Thinking Analysis**: This session (2025-11-14)
