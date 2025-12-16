# Codebase Analysis - Tool Installation Architecture

**Generated**: 2025-11-01
**Purpose**: Aider-style analysis for implementing automatic tool installation
**Status**: Active Design Document

---

## Executive Summary

**Problem**: Bootstrap installs configs but not the 26+ tools they reference, causing broken shell experience.

**Solution**: Create `bootstrap-tools.sh` with intelligent tool detection and installation.

**Key Insight**: Tool checks are already pervasive (47 graceful fallbacks), we just need to connect detection → installation.

---

## Tool Inventory (Complete)

### Category 1: Shell Framework (CRITICAL - Shell Won't Work)

| Tool | Check Location | Install Method | Priority |
|------|---------------|----------------|----------|
| **Oh-My-Zsh** | config/10-omz.zsh:8 | Official installer script | P0 |
| **Powerlevel10k** | config/40-prompt.zsh:3 | git clone to omz themes | P0 |
| **Nerd Fonts (MesloLGS)** | (visual requirement) | Manual font install | P1 |

### Category 2: Modern CLI Tools (Rust-based, HIGH VALUE)

| Tool | Checked In | Fallback | Install Method | Priority |
|------|-----------|----------|----------------|----------|
| **bat** | smart-wrappers.zsh:41 | cat | brew/cargo | P0 |
| **eza** | smart-wrappers.zsh:84 | ls | brew/cargo | P0 |
| **fzf** | config/20-plugins.zsh:8 | none (breaks UX) | brew/apt | P0 |
| **zoxide** | smart-wrappers.zsh:155 | cd | brew/cargo | P1 |
| **fd** | (references in docs) | find | brew/cargo | P1 |
| **rga** | (references in docs) | grep | brew/cargo | P2 |
| **sd** | (separate tool) | sed | brew/cargo | P2 |
| **delta** | (git config) | diff | brew/cargo | P1 |
| **dust** | (alias) | du | brew/cargo | P2 |
| **procs** | (alias) | ps | brew/cargo | P2 |

### Category 3: Developer Tools

| Tool | Checked In | Install Method | Priority |
|------|-----------|----------------|----------|
| **gh** | config/20-plugins.zsh:22 | brew/apt | P0 |
| **direnv** | config/20-plugins.zsh:45 | brew/apt | P1 |
| **jq** | system.zsh | brew/apt | P1 |
| **tmux** | (docs) | brew/apt | P1 |
| **htop** | (docs) | brew/apt | P2 |
| **tldr** | smart-wrappers.zsh:193 | brew/npm | P1 |
| **ncdu** | (docs) | brew/apt | P2 |
| **tree** | (docs) | brew/apt | P2 |
| **watch** | (docs) | brew/apt | P2 |
| **lazygit** | (docs) | brew/custom | P2 |
| **lazydocker** | (docs) | brew/custom | P2 |
| **nvim** | system.zsh | brew/apt/snap | P1 |

### Category 4: Version Managers

| Tool | Checked In | Install Method | Priority |
|------|-----------|----------------|----------|
| **mise** | config/20-plugins.zsh:58 | Official installer | P0 |
| **pyenv** | python-dev.zsh:12 | Official installer | P1 |

### Category 5: Secret Management (INTERACTIVE)

| Tool | Checked In | Install Method | Priority |
|------|-----------|----------------|----------|
| **1Password CLI (op)** | private/secrets.zsh.tmpl:3 | brew/manual | P1 |
| **op plugins** | (mentioned in docs) | Interactive: op plugin init | P2 |

### Category 6: Platform-Specific

| Tool | Platform | Checked In | Install Method | Priority |
|------|----------|-----------|----------------|----------|
| **brew** | macOS | os/darwin.zsh:3 | /bin/bash -c "$(curl...)" | P0 |
| **7z** | functions | brew/apt | P2 |
| **unrar** | functions | brew/apt | P2 |
| **fswatch** | darwin | brew only | P2 |

---

## Current Architecture Analysis

### Where Tool Checks Happen (11 Files)

```
private_dot_config/zsh/
├── config/
│   ├── 20-plugins.zsh        [fzf, gh, direnv, mise, op]
│   └── 30-completions.zsh    [bat, eza, gh, docker, kubectl, op]
├── functions/
│   ├── smart-wrappers.zsh    [bat, eza, zoxide, tldr, cat, cd, man]
│   ├── system.zsh            [nvim, jq, brew]
│   ├── git-utils.zsh         [fzf, bat]
│   ├── dev.zsh               [fzf, docker]
│   ├── python-dev.zsh        [pyenv, python, python3, pip]
│   ├── node-dev.zsh          [node, npm, mise]
│   └── polyglot-dev.zsh      [mise, pyenv, node, python]
├── os/
│   └── darwin.zsh            [brew]
└── private/
    └── secrets.zsh.tmpl      [op]
```

### Check Pattern (Consistent)

**Standard Pattern** (used 47 times):
```zsh
if type command TOOL &>/dev/null; then
  # Use tool
else
  # Fallback or skip
fi
```

**Alternative Pattern** (5 times):
```zsh
if ! type command TOOL &>/dev/null; then
  # Fallback
  return
fi
```

### Installation Flow (Current)

```
User → install.sh → Install chezmoi → chezmoi init --apply → Deploy configs → END
                                                                              ↓
                                                              Shell references 26+ missing tools
```

---

## Proposed Architecture

### New Installation Flow

```
User → install.sh
         ↓
       Install chezmoi
         ↓
       chezmoi init --apply (deploy configs)
         ↓
       bootstrap-tools.sh (NEW)
         ↓
       Detect OS → Check each tool → Install if missing
         ↓
       Report results
         ↓
       Prompt for interactive steps (1Password, fonts)
```

### File Structure (Proposed)

```
~/.local/share/chezmoi/
├── install.sh                    [MODIFY: Call bootstrap-tools.sh]
├── bootstrap-tools.sh            [NEW: Main tool installer]
├── scripts/                      [NEW DIRECTORY]
│   ├── detect-tools.sh          [NEW: Tool detection logic]
│   ├── install-shell-tools.sh   [NEW: Oh-My-Zsh, p10k]
│   ├── install-cli-tools.sh     [NEW: bat, eza, fzf, etc.]
│   ├── install-dev-tools.sh     [NEW: gh, direnv, tmux, etc.]
│   ├── install-version-mgrs.sh  [NEW: mise, pyenv]
│   └── install-macos-brew.sh    [NEW: Homebrew if macOS]
└── docs/
    ├── CODEBASE_ANALYSIS.md     [THIS FILE]
    └── TOOL_INSTALL_SPEC.md     [NEW: Detailed install specs]
```

### Design Principles

1. **Idempotent**: Safe to run multiple times
2. **Non-destructive**: Skip if tool already installed
3. **Platform-aware**: macOS (brew), Ubuntu/Debian (apt), Arch (pacman), Fedora (dnf)
4. **Graceful degradation**: Report failures but continue
5. **Interactive prompt**: Ask before installing each category
6. **Dry-run mode**: Show what would be installed
7. **Logged**: Save installation log to ~/.cache/bootstrap-tools.log

---

## Implementation Plan

### Phase 1: Detection System

**File**: `scripts/detect-tools.sh`

```bash
#!/bin/bash
# Tool detection with categorized reporting

detect_tool() {
  local tool=$1
  local category=$2
  if type "$tool" &>/dev/null; then
    echo "✓ $tool"
    return 0
  else
    echo "✗ $tool" >> "/tmp/missing-tools-$category.txt"
    return 1
  fi
}

# Check all tools, categorize results
# Return: Number of missing tools
```

### Phase 2: Installation Scripts (Per Category)

**Pattern**:
```bash
#!/bin/bash
# install-CATEGORY-tools.sh

install_TOOL() {
  local os=$1
  case "$os" in
    macos)
      brew install TOOL || return 1
      ;;
    ubuntu|debian)
      sudo apt-get update && sudo apt-get install -y TOOL || return 1
      ;;
    arch)
      sudo pacman -S --noconfirm TOOL || return 1
      ;;
    *)
      echo "Unsupported OS for TOOL" >&2
      return 1
      ;;
  esac
}
```

### Phase 3: Main Orchestrator

**File**: `bootstrap-tools.sh`

```bash
#!/bin/bash
# Main tool installation orchestrator

# 1. Detect OS
# 2. Run detection (scripts/detect-tools.sh)
# 3. Report missing tools by category
# 4. Prompt user for each category:
#    - Install all?
#    - Install selectively?
#    - Skip?
# 5. Call category installers
# 6. Re-run detection (verify)
# 7. Report final status
# 8. List manual steps (fonts, 1Password interactive)
```

### Phase 4: Integration

**Modify**: `install.sh` line ~150

```bash
# After chezmoi init --apply
if [[ -x "$HOME/.local/share/chezmoi/bootstrap-tools.sh" ]]; then
  print_info "Installing required tools..."
  bash "$HOME/.local/share/chezmoi/bootstrap-tools.sh"
fi
```

---

## Tool Installation Specifications

### Oh-My-Zsh (CRITICAL)

```bash
# Official installer
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Non-interactive mode
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Verify
[[ -d "$HOME/.oh-my-zsh" ]]
```

### Powerlevel10k (CRITICAL)

```bash
# Clone to Oh-My-Zsh custom themes
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# Verify
[[ -d "$HOME/.oh-my-zsh/custom/themes/powerlevel10k" ]]
```

### Homebrew (macOS CRITICAL)

```bash
# Official installer
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH (Apple Silicon)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Verify
type brew &>/dev/null
```

### mise (Multi-language Version Manager)

```bash
# Official installer
curl https://mise.run | sh

# Or via brew
brew install mise

# Verify
type mise &>/dev/null
```

### Modern CLI Tools (Rust-based)

```bash
# macOS
brew install bat eza fd ripgrep-all sd git-delta dust procs zoxide fzf

# Ubuntu/Debian (some via cargo, some via apt)
sudo apt-get install -y bat fd-find ripgrep fzf
cargo install eza sd git-delta dust procs zoxide  # Requires rust toolchain

# Verify each
for tool in bat eza fd rg sd delta dust procs zoxide fzf; do
  type "$tool" &>/dev/null && echo "✓ $tool" || echo "✗ $tool"
done
```

### GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
type -p curl >/dev/null || sudo apt install curl -y
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh -y

# Verify
type gh &>/dev/null
```

### 1Password CLI

```bash
# macOS
brew install --cask 1password-cli

# Ubuntu/Debian
curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/$(dpkg --print-architecture) stable main" | sudo tee /etc/apt/sources.list.d/1password.list
sudo mkdir -p /etc/debsig/policies/AC2D62742012EA22/
curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | sudo tee /etc/debsig/policies/AC2D62742012EA22/1password.pol
sudo mkdir -p /usr/share/debsig/keyrings/AC2D62742012EA22
curl -sS https://downloads.1password.com/linux/keys/1password.asc | sudo gpg --dearmor --output /usr/share/debsig/keyrings/AC2D62742012EA22/debsig.gpg
sudo apt update && sudo apt install -y 1password-cli

# Verify
type op &>/dev/null
```

---

## Risk Analysis

### High Risk

1. **Brew installation** - Can fail on M1 Macs, requires Rosetta
2. **Sudo requirements** - Apt-based installs need sudo access
3. **cargo toolchain** - Some tools require Rust compiler (large install)
4. **Interactive prompts** - Oh-My-Zsh installer can hang

### Medium Risk

1. **Network failures** - All installers depend on internet
2. **Package manager issues** - Old apt cache, brew conflicts
3. **Path not updated** - Tools installed but not in $PATH until shell reload

### Low Risk

1. **Idempotency** - Running twice should be safe (brew/apt handle this)
2. **Partial failures** - One tool failing shouldn't stop others

---

## Testing Strategy

### Test Matrix

| OS | Package Manager | Test Tools |
|----|----------------|------------|
| macOS 13+ (Intel) | Homebrew | bat, eza, fzf, gh, mise |
| macOS 14+ (M1/M2) | Homebrew (arm64) | bat, eza, fzf, gh, mise |
| Ubuntu 22.04 | apt + cargo | bat, fd, fzf, gh, mise |
| Ubuntu 24.04 | apt + cargo | bat, fd, fzf, gh, mise |
| Debian 12 | apt + cargo | bat, fd, fzf, gh, mise |
| WSL2 (Ubuntu) | apt + cargo | bat, fd, fzf, gh, mise |

### Test Cases

1. **Fresh install** - No tools present
2. **Partial install** - Some tools already installed
3. **Full install** - All tools present (should skip)
4. **Dry run** - Report only, no changes
5. **Network failure** - Graceful degradation
6. **Sudo denied** - Continue with user-space installs
7. **Interrupted install** - Resume capability

---

## Success Criteria

### P0 (Must Have)

- ✅ Oh-My-Zsh installed and functional
- ✅ Powerlevel10k theme available
- ✅ bat, eza, fzf installed (core UX)
- ✅ gh installed (development workflow)
- ✅ mise installed (language version management)
- ✅ Shell loads without errors

### P1 (Should Have)

- ✅ All modern CLI tools installed
- ✅ direnv, tldr, nvim installed
- ✅ pyenv installed
- ✅ 1Password CLI installed
- ✅ Installation log created
- ✅ Final verification report shown

### P2 (Nice to Have)

- ✅ lazygit, lazydocker installed
- ✅ dust, procs, 7z, unrar installed
- ✅ Nerd fonts installed (or guide shown)
- ✅ 1Password plugins configured (or guide shown)

---

## Open Questions

1. **Cargo dependency**: Should we install Rust toolchain for eza/sd/delta, or stick to brew/apt versions?
   - **Recommendation**: Use brew/apt when available, skip cargo-only tools on apt systems

2. **Interactive mode**: Should script prompt for each category or install all?
   - **Recommendation**: Prompt with default=yes, allow `--yes` flag for non-interactive

3. **Error handling**: Stop on first error or continue?
   - **Recommendation**: Continue, report all failures at end

4. **chezmoi integration**: Should bootstrap-tools.sh be chezmoi-managed?
   - **Recommendation**: Yes, track in source, deploy to ~/.local/bin/

5. **Update mechanism**: Should we check for tool updates?
   - **Recommendation**: No, that's what `brew upgrade` / `omz update` are for

---

## Next Steps

1. Create `scripts/` directory
2. Implement `scripts/detect-tools.sh`
3. Implement category installers
4. Implement `bootstrap-tools.sh` orchestrator
5. Modify `install.sh` integration
6. Test on macOS
7. Test on Ubuntu/WSL
8. Update documentation
9. Commit and deploy

---

**Status**: Design Complete - Ready for Implementation
**Last Updated**: 2025-11-01
**Owner**: Claude Code
