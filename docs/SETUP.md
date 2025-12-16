# Detailed Setup Guide

Complete instructions for setting up the dotfiles on any supported platform (macOS, WSL, Ubuntu).

## Table of Contents

1. [What Gets Installed (Bootstrap vs Manual)](#what-gets-installed-bootstrap-vs-manual)
2. [macOS Setup](#macos-setup)
3. [WSL Setup](#wsl-setup)
4. [Ubuntu Setup](#ubuntu-setup)
5. [Post-Install Configuration](#post-install-configuration)
6. [Verification](#verification)

---

## Installation Order Matters

Follow these steps IN ORDER - some tools depend on previous installations:

1. **Homebrew** (package manager) - macOS only
2. **zsh** (shell) - Must be installed before Oh-My-Zsh
3. **Oh-My-Zsh** (shell framework) - Must be installed before Powerlevel10k
4. **Powerlevel10k** (prompt theme) - Requires Oh-My-Zsh
5. **Nerd Font** (icons) - Required for Powerlevel10k icons to display
6. **chezmoi** (dotfile manager) - Deploys configurations
7. **Everything else** (modern CLI tools, version managers, etc.) - Can be installed in parallel

**Why this order matters**:
- zsh must exist before Oh-My-Zsh installs
- Oh-My-Zsh must exist before Powerlevel10k can be added as a custom theme
- Nerd Font must be installed and configured before p10k icons display correctly
- chezmoi should be run after core shell setup to avoid prompt conflicts

---

## What Gets Installed (Bootstrap vs Manual)

### ✅ Automated (via `chezmoi init --apply`)

When you run the one-line install, chezmoi automatically:

- **Deploys dotfiles configuration**:
  - Zsh configs (`~/.config/zsh/config/*.zsh`)
  - Aliases (`~/.config/zsh/aliases/*.zsh`)
  - Functions (`~/.config/zsh/functions/*.zsh`)
  - OS-specific configs (`~/.config/zsh/os/{darwin,linux,wsl}.zsh`)
  - Completions (advanced completion system)
  - Git config (`~/.gitconfig` with templates)

- **Runs macOS system customization** (macOS only):
  - 600+ `defaults write` settings for developer productivity
  - Keyboard, Finder, Dock, Safari, Screenshots, etc.

- **Prompts for template variables**:
  - Git name and email
  - GitHub username
  - Device name
  - Optional GPG signing key

### ❌ Manual Installation Required

These tools are **configured** by the dotfiles but **not installed** automatically:

**Shell Framework**:
- Oh-My-Zsh (zsh framework)
- Powerlevel10k (fast prompt theme)
- Nerd Fonts (required for p10k icons)

**Modern CLI Tools** (Rust-based):
- `bat` (cat with syntax highlighting)
- `eza` (modern ls with git integration)
- `fd` (better find)
- `rga` (ripgrep-all for PDFs/docs)
- `sd` (better sed)
- `delta` (beautiful git diffs)
- `dust` (disk usage visualization)
- `procs` (modern ps)
- `zoxide` (smart cd with frecency)

**Developer Tools**:
- `fzf` (fuzzy finder - CRITICAL for modern UX)
- `htop`, `ncdu`, `tree`, `watch`
- `lazygit`, `lazydocker` (TUI tools)
- `direnv` (per-directory environments)
- `tldr` (simplified man pages)

**Version Managers**:
- `mise` (multi-language version manager for 20+ languages)
- `pyenv` (Python-specific version manager)

**Secret Management**:
- 1Password Desktop App (REQUIRED - not just CLI!)
- 1Password CLI (`op`)
- 1Password shell plugins (gh, docker)
- **CRITICAL**: Desktop app must be installed AND unlocked for CLI to work

**AI Coding Assistants** (optional):
- Claude Code CLI: `npm install -g @anthropic-ai/claude-cli`, then `dotfiles auth claude`
  - Configs auto-deployed: `~/.claude/settings.json`, `~/.claude/preferences.yml`
  - Override with: `~/.claude/settings.local.json` (gitignored)
- Codex CLI: `npm install -g codex-cli`, then `dotfiles auth codex`
  - Config auto-deployed: `~/.codex/config.toml`
- Copilot CLI: `npm install -g @github/copilot`, then `dotfiles auth copilot-cli`
  - Uses shared global context: `~/.config/claude/AGENTS.md`

**Note**: AI tool configurations are managed by chezmoi templates in `private_dot_claude/` and `private_dot_codex/`. Run `chezmoi apply` to deploy.

**Prerequisites** (platform-specific):
- **macOS**: Homebrew
- **WSL/Ubuntu**: APT, build-essential

---

## macOS Setup

### Step 1: Install Prerequisites

Install Homebrew and essential tools **before** running chezmoi:

```bash
# 1. Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install core dependencies
brew install git zsh

# 3. Make zsh the default shell (if needed)
chsh -s $(which zsh)
```

### Step 2: One-Line Install (Automated Bootstrap)

This installs chezmoi and deploys dotfiles configuration:

```bash
curl -fsSL https://raw.githubusercontent.com/Aristoddle/beppe-system-bootstrap/main/install.sh | bash
```

**What this does**:
- ✅ Installs chezmoi via Homebrew
- ✅ Clones and applies dotfiles to your system
- ✅ Deploys shell configuration (zsh configs, aliases, functions, completions)
- ✅ Runs macOS system customization (600+ defaults write settings)
- ✅ Prompts for git name/email (for templates)

**What it does NOT do**:
- ❌ Install Oh-My-Zsh, Powerlevel10k, Nerd Fonts
- ❌ Install cargo tools (bat, eza, fd, etc.)
- ❌ Install developer tools (fzf, lazygit, etc.)
- ❌ Install version managers (mise, pyenv)
- ❌ Install 1Password CLI

### Step 3: Post-Install Manual Setup

After the one-liner completes, install the remaining tools:

```bash
# 1. Install Oh-My-Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 2. Install Powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 3. Install Nerd Font (required for p10k icons)
brew tap homebrew/cask-fonts
brew install --cask font-meslo-lg-nerd-font

# 4. Install modern CLI tools (Rust-based)
brew install bat eza fd ripgrep sd git-delta dust procs zoxide

# 5. Install shell history tool
brew install atuin

# 6. Install developer tools
brew install htop tldr fzf ncdu tree watch lazygit lazydocker direnv

# 7. Install version managers
curl https://mise.run | sh   # mise (multi-language)
brew install pyenv pyenv-virtualenv  # pyenv (Python-specific + virtualenv plugin)

# 8. Install GUI applications (optional)
brew install --cask claude                        # Claude AI desktop app
brew install --cask cursor                        # AI-powered IDE
brew install --cask visual-studio-code-insiders   # VS Code preview builds

# 9. Install 1Password (Desktop App + CLI) - BOTH REQUIRED
# CRITICAL: CLI alone will NOT work - desktop app is required for authentication
brew install --cask 1password      # Desktop app (REQUIRED)
brew install 1password-cli          # CLI tool
# Open and unlock desktop app BEFORE using CLI
open -a "1Password"                 # Unlock with Touch ID
op signin                           # Should succeed after desktop app unlocked
op plugin init gh
op plugin init docker

# 10. Restart shell
exec zsh

# 11. Configure Powerlevel10k (one-time wizard)
p10k configure
```

**Configure Terminal Font**: Set font to "MesloLGS NF" in Alacritty/iTerm2 settings.

---

## WSL Setup

### Step 1: Install Prerequisites

**In Windows PowerShell (as Administrator)**:

```powershell
# Install WSL (if not already installed)
wsl --install -d Ubuntu-24.04
```

**In WSL Ubuntu terminal**:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install core dependencies
sudo apt install -y git zsh curl wget build-essential

# 3. Make zsh the default shell
chsh -s $(which zsh)

# 4. Add ~/.local/bin to PATH (for chezmoi)
mkdir -p ~/.local/bin
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
```

### Step 2: One-Line Install (Automated Bootstrap)

This installs chezmoi and deploys dotfiles configuration:

```bash
curl -fsSL https://raw.githubusercontent.com/Aristoddle/beppe-system-bootstrap/main/install.sh | bash
```

**What this does**:
- ✅ Installs chezmoi to `~/.local/bin`
- ✅ Clones and applies dotfiles to your system
- ✅ Deploys shell configuration (zsh configs, aliases, functions, completions)
- ✅ Prompts for git name/email (for templates)

**What it does NOT do**:
- ❌ Install Oh-My-Zsh, Powerlevel10k, Nerd Fonts
- ❌ Install cargo tools (bat, eza, fd, etc.)
- ❌ Install developer tools (fzf, lazygit, etc.)
- ❌ Install version managers (mise, pyenv)
- ❌ Install 1Password CLI

### Step 3: Post-Install Manual Setup

After the one-liner completes, install the remaining tools:

```bash
# 1. Install Oh-My-Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 2. Install Powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 3. Install Rust toolchain (required for cargo tools)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 4. Install modern CLI tools via cargo
cargo install bat eza fd-find ripgrep-all sd git-delta du-dust procs zoxide

# 5. Install developer tools via apt
sudo apt install -y htop fzf ncdu tree

# 6. Install version managers
curl https://mise.run | sh   # mise (multi-language)
# pyenv installation (requires build dependencies)
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
curl https://pyenv.run | bash

# 7. Install 1Password (Desktop App + CLI) - BOTH REQUIRED
# CRITICAL: For WSL, install 1Password for Windows first, then enable WSL integration
# Linux: Install desktop app from https://1password.com/downloads
# Then install CLI:
curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main' | \
  sudo tee /etc/apt/sources.list.d/1password.list
sudo apt update && sudo apt install -y 1password-cli
# WSL: Ensure 1Password for Windows is running and WSL integration enabled

# 8. Restart shell
exec zsh

# 9. Configure Powerlevel10k (one-time wizard)
p10k configure
```

**Configure Windows Terminal Font**:
1. Download and install [MesloLGS NF](https://github.com/romkatv/powerlevel10k#fonts) in Windows
2. In Windows Terminal settings, set font to "MesloLGS NF"

---

## Ubuntu Setup

### Step 1: Install Prerequisites

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install core dependencies
sudo apt install -y git zsh curl wget build-essential

# 3. Make zsh the default shell
chsh -s $(which zsh)

# 4. Add ~/.local/bin to PATH (for chezmoi)
mkdir -p ~/.local/bin
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
```

### Step 2: One-Line Install (Automated Bootstrap)

This installs chezmoi and deploys dotfiles configuration:

```bash
curl -fsSL https://raw.githubusercontent.com/Aristoddle/beppe-system-bootstrap/main/install.sh | bash
```

**What this does**:
- ✅ Installs chezmoi to `~/.local/bin`
- ✅ Clones and applies dotfiles to your system
- ✅ Deploys shell configuration (zsh configs, aliases, functions, completions)
- ✅ Prompts for git name/email (for templates)

**What it does NOT do**:
- ❌ Install Oh-My-Zsh, Powerlevel10k, Nerd Fonts
- ❌ Install cargo tools (bat, eza, fd, etc.)
- ❌ Install developer tools (fzf, lazygit, etc.)
- ❌ Install version managers (mise, pyenv)
- ❌ Install 1Password CLI

### Step 3: Post-Install Manual Setup

After the one-liner completes, install the remaining tools:

```bash
# 1. Install Oh-My-Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 2. Install Powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 3. Install Nerd Font
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
curl -fLo "MesloLGS NF Regular.ttf" \
  https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf
curl -fLo "MesloLGS NF Bold.ttf" \
  https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold.ttf
curl -fLo "MesloLGS NF Italic.ttf" \
  https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Italic.ttf
curl -fLo "MesloLGS NF Bold Italic.ttf" \
  https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold%20Italic.ttf
fc-cache -f -v

# 4. Install Rust toolchain (required for cargo tools)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 5. Install modern CLI tools via cargo
cargo install bat eza fd-find ripgrep-all sd git-delta du-dust procs zoxide

# 6. Install developer tools via apt
sudo apt install -y htop fzf ncdu tree

# 7. Install version managers
curl https://mise.run | sh   # mise (multi-language)
# pyenv installation (requires build dependencies)
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
curl https://pyenv.run | bash

# 8. Install 1Password (Desktop App + CLI) - BOTH REQUIRED
# CRITICAL: Install desktop app from https://1password.com/downloads first
# The CLI alone will NOT work - desktop app is required for authentication
# After desktop app is installed and running, install CLI:
curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main' | \
  sudo tee /etc/apt/sources.list.d/1password.list
sudo apt update && sudo apt install -y 1password-cli

# 9. Restart shell
exec zsh

# 10. Configure Powerlevel10k (one-time wizard)
p10k configure
```

**Configure Terminal Font**: Set font to "MesloLGS NF" in your terminal emulator settings.

---

## Verify Agent & Skill Deployment

chezmoi automatically deploys the agent and skill layer to `~/.claude/` during initialization.

### What Are Agents & Skills?

**Agents** are task-specific AI assistants that perform maintenance checks:
- `dotfiles-maintainer` - System health monitoring
- `security-scanner` - Secret detection & permission audits
- `zsh-performance-auditor` - Shell startup profiling
- `test-validator` - Function testing & coverage
- `doc-synchronizer` - Documentation validation

**Skills** are passive guidelines always active in Claude Code:
- `zsh-expert` - Zsh syntax expertise
- `graceful-degradation` - Tool availability checks & fallbacks
- `pipe-safety-checker` - Pipe detection & output adaptation
- `chezmoi-expert` - Source editing workflow enforcement

### Verify Deployment

Check that agents and skills were deployed:

```bash
# Verify ~/.claude/ structure
ls -la ~/.claude/

# Should see:
# agents/
# skills/

# List deployed agents
ls ~/.claude/agents/

# List deployed skills
find ~/.claude/skills/ -name "SKILL.md"
```

### How Agent Deployment Works

chezmoi deploys agents using the `dot_` prefix convention:

```
Source:   ~/.local/share/chezmoi/dot_claude/
Deployed: ~/.claude/

Source:   ~/.local/share/chezmoi/dot_claude/agents/dotfiles-maintainer.md
Deployed: ~/.claude/agents/dotfiles-maintainer.md
```

When you run `chezmoi apply`, it reads from `~/.local/share/chezmoi/dot_claude/` and deploys to `~/.claude/` (removing `dot_` prefix).

### Customizing Agents

To modify or add agents:

```bash
# 1. Edit in chezmoi source
cd ~/.local/share/chezmoi
vim dot_claude/agents/dotfiles-maintainer.md

# 2. Deploy changes
chezmoi apply

# 3. Verify update
cat ~/.claude/agents/dotfiles-maintainer.md

# 4. Commit to version control
git add dot_claude/
git commit -m "Update dotfiles-maintainer agent"
git push
```

See [AGENT_DEVELOPMENT.md](AGENT_DEVELOPMENT.md) for creating custom agents.

---

## Post-Install Configuration

### 1. Powerlevel10k Configuration

Run the configuration wizard (appears on first launch):

```bash
p10k configure
```

Recommended settings:
- Instant Prompt: Yes
- Style: Rainbow or Lean
- Unicode: Yes
- Icons: Many
- Transient Prompt: Yes

### 2. Configure Atuin (Shell History)

If using Atuin for shell history:

```bash
bash <(curl https://raw.githubusercontent.com/atuinsh/atuin/main/install.sh)
atuin import auto
atuin sync
```

### 3. Configure mise Languages

Install programming languages as needed:

```bash
# List available runtimes
mise list

# Install specific versions
mise install node@latest
mise install python@latest
mise install go@latest
```

### 4. SSH Key Setup

Generate SSH key for GitHub:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

Add to GitHub: Copy `~/.ssh/id_ed25519.pub` and add at https://github.com/settings/keys

---

## Verification

### Check Shell Configuration

```bash
# Verify zsh version
zsh --version  # Should be 5.8+

# Verify Oh-My-Zsh
echo $ZSH  # Should show ~/.oh-my-zsh

# Verify theme
echo $ZSH_THEME  # Should show powerlevel10k/powerlevel10k

# Verify prompt loads
echo $POWERLEVEL9K_MODE  # Should show nerdfont-complete or similar
```

### Check Tools

```bash
# Cargo tools
which bat eza fd rga sd delta dust procs zoxide

# Essential tools
which htop fzf lazygit lazydocker direnv

# Version managers
which mise pyenv

# 1Password
op --version
op whoami
```

### Check chezmoi

```bash
# Verify tracking
chezmoi status

# Verify source
chezmoi source-path

# Verify apply works
chezmoi apply --dry-run --verbose
```

### Check 1Password Integration

```bash
# Verify signin works
op signin

# Verify plugins
op plugin list

# Test credential access
op item list
```

---

## Troubleshooting

If you encounter issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

---

## Next Steps

1. Customize aliases in `~/.config/zsh/aliases/`
2. Add custom functions to `~/.config/zsh/functions/`
3. Configure platform-specific settings in `~/.config/zsh/os/`
4. Set up 1Password secrets in `~/.config/zsh/private/secrets.zsh`

---

**Last Updated**: December 4, 2025
