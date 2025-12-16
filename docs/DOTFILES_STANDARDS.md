# Dotfiles Standards & Architecture Guide

**Purpose**: Aspirational guide for consistent, maintainable dotfiles commands
**Status**: Living document - updated as patterns evolve
**Audience**: Contributors adding new `dotfiles` subcommands

---

## Philosophy

**Goal**: Build a unified CLI hub (`dotfiles`) that:
- Provides discoverable access to all dotfiles functionality
- Follows consistent patterns across all subcommands
- Maintains DRY principle (documentation lives in one place)
- Degrades gracefully when tools are missing
- Works cross-platform (macOS, Linux, WSL)

---

## DRY Documentation Pattern

**Problem**: Help text embedded in functions duplicates docs/*.md files, causing drift.

**Current State** (needs refactoring):
```zsh
# ❌ OLD PATTERN - Help text in function
_dotfiles_ssh() {
  cat <<'EOF'
╭──────────────────────────────────────────────────────────────╮
│              SSH & AUTHENTICATION SETUP                      │
╰──────────────────────────────────────────────────────────────╯
[... 100+ lines of inline help ...]
EOF
}
```

**Desired State**:
```zsh
# ✅ NEW PATTERN - Reference external docs
_dotfiles_ssh() {
  _dotfiles_show_doc "SSH_AUTH.md" "ssh"
}

_dotfiles_show_doc() {
  local doc_file="$1"
  local topic="$2"
  local docs_dir="${HOME}/.local/share/chezmoi/docs"

  if [[ ! -f "$docs_dir/$doc_file" ]]; then
    echo "❌ Documentation not found: $doc_file"
    echo "This is a bug - please report it"
    return 1
  fi

  # Use best available pager
  if type bat &>/dev/null; then
    bat "$docs_dir/$doc_file"
  elif type glow &>/dev/null; then
    glow "$docs_dir/$doc_file"
  else
    less "$docs_dir/$doc_file"
  fi
}
```

**Benefits**:
- Single source of truth (docs/*.md)
- Chezmoi manages documentation
- No drift between help and docs
- Easy to update via `dotfiles edit`

### Hybrid Pattern (Quick Reference + Dynamic Status)

**Use Case**: Commands that need both documentation AND live system status.

**Example** (`dotfiles ssh`):
```zsh
_dotfiles_ssh() {
  # Option 1: Show comprehensive docs
  _dotfiles_show_doc "SSH_AUTH.md" "ssh"

  # Option 2: Quick reference + dynamic status checks
  cat <<'EOF'
Quick SSH Reference:
- Check keys: ssh-add -l
- Test GitHub: ssh -T git@github.com
EOF

  # Dynamic status checking
  if type op &>/dev/null && op whoami &>/dev/null 2>&1; then
    echo "✅ 1Password CLI: Signed in"
  else
    echo "⚠️  1Password CLI: Not signed in"
  fi

  # Live SSH connection test
  if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
    echo "✅ GitHub SSH: Working"
  fi
}
```

**Guidelines**:
- Use hybrid pattern ONLY when dynamic checks are valuable
- Quick reference should be <30 lines (for longer docs, reference external file)
- Always provide link to comprehensive docs: `dotfiles docs <topic>`
- Document the split: "Quick reference below, full docs: dotfiles docs ssh"

**Current Hybrid Commands**:
- `dotfiles ssh` - Quick ref + 1Password/SSH status + GitHub connection test
- `dotfiles arch` - Inline summary (comprehensive version at `dotfiles docs arch`)

---

## Graceful Degradation Pattern

**Principle**: Commands should check for required tools and fail gracefully with helpful messages.

**Good Example** (from nvim integration):
```zsh
_dotfiles_nvim_install() {
  # Check dependencies BEFORE proceeding
  local missing=()
  command -v nvim &>/dev/null || missing+=("neovim")
  command -v git &>/dev/null || missing+=("git")
  command -v node &>/dev/null || missing+=("node")

  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "❌ Missing dependencies: ${missing[*]}"
    echo ""
    echo "Install with:"
    echo "  brew install ${missing[*]}"
    return 1
  fi

  # ... proceed with installation
}
```

**Checklist**:
- ✅ Check `command -v` before using tools
- ✅ Collect all missing deps in array
- ✅ Show single clear error message
- ✅ Provide installation instructions
- ✅ Return non-zero on failure

---

## Tab Completion Standards

**Requirements**:
1. Every subcommand must have tab completion
2. Completions must be context-aware (subcommand level)
3. Use descriptive completion text

**Pattern**:
```zsh
if [[ -n "${ZSH_VERSION:-}" ]]; then
  _dotfiles_completion() {
    local -a commands
    commands=(
      'help:Show command help'
      'edit:Edit dotfiles safely via chezmoi'
      'nvim:Manage Neovim setup (install, update, health, fix)'
    )

    # Subcommand completions
    local -a nvim_commands
    nvim_commands=(
      'install:Bootstrap Neovim setup'
      'update:Update plugins'
      'health:Run health checks'
      'fix:Fix common issues'
    )

    # Context-aware completion
    if (( CURRENT == 2 )); then
      _describe 'dotfiles commands' commands
    elif (( CURRENT == 3 )) && [[ "${words[2]}" == "nvim" ]]; then
      _describe 'nvim commands' nvim_commands
    fi
  }

  compdef _dotfiles_completion dotfiles
fi
```

**Checklist**:
- ✅ Completion function named `_<command>_completion`
- ✅ Descriptions for each option (`:Description text`)
- ✅ Context-aware (responds to CURRENT position)
- ✅ Registered with `compdef`

---

## Command Structure Pattern

**Standard Layout**:
```zsh
_dotfiles_<subcommand>() {
  local cmd="${1:-help}"
  shift

  # Define any local variables
  local CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}"

  case "$cmd" in
    install|i)
      _dotfiles_<subcommand>_install "$@"
      ;;

    update|up|u)
      _dotfiles_<subcommand>_update "$@"
      ;;

    status|stat|s)
      _dotfiles_<subcommand>_status "$@"
      ;;

    help|--help|-h)
      _dotfiles_show_doc "<SUBCOMMAND>.md" "<subcommand>"
      ;;

    *)
      echo "❌ Unknown <subcommand> command: $cmd"
      echo "Run 'dotfiles <subcommand> help' for usage"
      return 1
      ;;
  esac
}
```

**Conventions**:
- Short aliases for common commands (i, u, s, h)
- Pass remaining args with `"$@"`
- Help references external docs
- Clear error messages

---

## Testing Requirements

**Every new command must include**:

1. **Unit tests** in `tests/<feature>.bats`:
```bash
@test "<subcommand>: shows help when no arguments" {
  run dotfiles <subcommand>
  assert_success
  assert_output --partial "Usage:"
}

@test "<subcommand>: gracefully handles missing dependencies" {
  # Mock missing command
  PATH="/nonexistent:$PATH" run dotfiles <subcommand> install
  assert_failure
  assert_output --partial "Missing dependencies"
}
```

2. **Integration test** in `tests/integration/deployment_test.bats`:
```bash
@test "deployment: <subcommand> function exists" {
  run bash -c "source $HOME/.config/zsh/functions/dotfiles-helper.zsh && type _dotfiles_<subcommand>"
  assert_success
}
```

---

## Cross-Platform Considerations

**Use XDG variables**:
```zsh
# ✅ GOOD
local CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}"
local DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}"
local STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}"

# ❌ BAD - hardcoded paths
local CONFIG_DIR="$HOME/.config"
```

**Check OS when needed**:
```zsh
case "$(uname -s)" in
  Darwin)
    # macOS-specific
    ;;
  Linux)
    if grep -qi microsoft /proc/version; then
      # WSL
    else
      # Native Linux
    fi
    ;;
esac
```

---

## Documentation Requirements

**Every new subcommand needs**:

1. **Standalone doc file**: `docs/DOTFILES_<SUBCOMMAND>.md`
   - Comprehensive usage guide
   - Examples for each sub-action
   - Troubleshooting section
   - Related commands section

2. **QUICKSTART.md entry**:
   - Add to relevant category
   - Show most common use case
   - 1-2 line example

3. **CLAUDE.md update**:
   - Add to "Commands" section if workflow-related
   - Document any new patterns

---

## Refactoring Path

**Commands needing DRY refactoring**:
- [ ] `_dotfiles_ssh` → Extract to `docs/DOTFILES_SSH.md`
- [ ] `_dotfiles_arch` → Extract to `docs/DOTFILES_ARCH.md`
- [ ] `_dotfiles_nvim_help` → Extract to `docs/DOTFILES_NVIM.md`

**Process**:
1. Create `docs/DOTFILES_<CMD>.md` with full content
2. Replace heredoc with `_dotfiles_show_doc` call
3. Test with `dotfiles <cmd> help`
4. Verify chezmoi applies correctly
5. Commit with message: `refactor(docs): Extract <cmd> help to DRY pattern`

---

## Examples

### Good: nvim Integration Structure
```zsh
_dotfiles_nvim() {
  local cmd="${1:-help}"
  shift

  # ✅ Graceful degradation
  local missing=()
  command -v nvim &>/dev/null || missing+=("neovim")

  # ✅ Clear command structure
  case "$cmd" in
    install|i) _dotfiles_nvim_install ;;
    update|up|u) _dotfiles_nvim_update ;;
    # ...
  esac
}

# ✅ Tab completions provided
# ✅ Error messages clear
# ⚠️ Help text inline (needs refactoring to external doc)
```

### Needs Refactoring: ssh command
```zsh
_dotfiles_ssh() {
  cat <<'EOF'
[... 100+ lines ...]
EOF
}

# ⚠️ No graceful degradation checks
# ⚠️ Help text embedded (DRY violation)
# ✅ Tab completion exists (via docs dispatcher)
```

---

## Skills Integration

This project uses Claude Code skills that auto-activate:

**Always Active**:
- `chezmoi-expert` - Enforces source editing workflow
- `zsh-expert` - Ensures proper zsh syntax
- `graceful-degradation` - Validates tool availability checks
- `pipe-safety-checker` - Ensures commands work in pipes
- `portability-guardian` - Cross-platform compatibility
- `performance-optimizer` - Shell startup optimization
- `security-hardener` - Secure configuration practices

**When to Invoke**:
- Adding new commands → All skills auto-activate
- Refactoring → `graceful-degradation` + `chezmoi-expert`
- Performance concerns → `performance-optimizer`

---

## Validation Checklist

Before committing a new `dotfiles` subcommand:

**Functionality**:
- [ ] Command dispatcher added to main `dotfiles()` function
- [ ] All sub-actions implemented
- [ ] Error handling for invalid sub-actions

**Quality**:
- [ ] Graceful degradation for all external tools
- [ ] Help text extracted to docs/*.md (or plan to refactor)
- [ ] XDG variables used (not hardcoded paths)
- [ ] Tab completions implemented and registered

**Documentation**:
- [ ] `docs/DOTFILES_<CMD>.md` created (or plan to create)
- [ ] QUICKSTART.md updated with examples
- [ ] Commit message follows conventional commits

**Testing**:
- [ ] Unit tests added to `tests/<feature>.bats`
- [ ] Integration test added
- [ ] All tests passing (`bats tests/*.bats`)

**Deployment**:
- [ ] `chezmoi apply` works without errors
- [ ] Changes pushed to git
- [ ] CI tests passing

---

## Future Improvements

**Planned**:
1. `_dotfiles_show_doc` helper function (centralized doc viewing)
2. `/dotfiles-standards` validation command
3. Pre-commit hook to check standards compliance
4. Automated refactoring tool for existing commands

**Under Consideration**:
- Auto-generated completion from help text
- Standardized status/health check framework
- Common authentication helper library

---

## Questions?

- Review existing commands: `dotfiles list`
- Check implementation: `dotfiles edit functions/dotfiles-helper.zsh`
- See architecture: `dotfiles arch`
- Ask in issues: https://github.com/Aristoddle/beppe-system-bootstrap/issues

---

**Last Updated**: 2025-01-03
**Status**: Initial version - living document
**Next Review**: After auth/tools/doctor implementations
