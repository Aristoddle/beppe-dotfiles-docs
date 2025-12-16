# New Machine Setup - Complete Quickstart Guide

**From unboxing to fully configured development environment**

This guide takes you from a fresh machine (macOS or Linux) to a fully configured development environment with shell, tools, and secrets.

**Estimated Total Time**:
- **macOS**: 45-60 minutes
- **Linux**: 40-55 minutes (slightly faster, no Homebrew install)

---

## Table of Contents

1. [Prerequisites (Manual)](#step-1-prerequisites-manual)
2. [Install Homebrew](#step-2-install-homebrew)
3. [Install chezmoi](#step-3-install-chezmoi)
4. [Critical: 1Password Setup](#step-4-critical-1password-setup)
5. [Initialize Dotfiles](#step-5-initialize-dotfiles)
6. [Install Shell Framework](#step-6-install-shell-framework)
7. [Install CLI Tools](#step-7-install-cli-tools)
8. [Install Developer Tools](#step-8-install-developer-tools)
9. [Install from Brewfile](#step-9-install-from-brewfile)
10. [Post-Install Configuration](#step-10-post-install-configuration)
11. [Verification](#step-11-verification)
12. [Troubleshooting](#troubleshooting)

---

## Step 1: Prerequisites (Manual)

**Time**: 2-3 minutes

### What You Need

**macOS**:
1. **New macOS machine** (fresh out of the box or clean install)
2. **Internet connection** (required for all downloads)
3. **Apple ID** (for App Store, already set up during macOS setup)
4. **GitHub account** (for repository access)

**Linux (Ubuntu/Debian)**:
1. **Fresh Ubuntu/Debian install** (tested on Ubuntu 22.04+)
2. **Internet connection** (required for all downloads)
3. **sudo privileges** (for package installation)
4. **GitHub account** (for repository access)

### Optional But Recommended (Both Platforms)

- **1Password account** (CRITICAL for secrets management)
- **SSH key for GitHub** (speeds up git operations)

---

## Step 2: Install Package Manager & chezmoi

### macOS: Install Homebrew (3-5 minutes)

Homebrew is the package manager for macOS. EVERYTHING else depends on this.

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH (copy exact commands from installer output)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Verify
brew --version  # Should output: Homebrew 4.x.x

# Install chezmoi
brew install chezmoi
```

### Linux: Install chezmoi (1-2 minutes)

On Linux, use apt/nala for packages. Install chezmoi first.

```bash
# Update package lists
sudo apt update

# Install chezmoi
sudo apt install -y chezmoi

# Verify
chezmoi --version  # Should output: chezmoi version 2.x.x

# Optional: Install nala for better apt experience
sudo apt install -y nala
```

**Note on Package Managers**:
- macOS: Homebrew is primary package manager
- Linux: apt/nala is primary, Homebrew is optional (not recommended)
- Both: mise handles language runtimes (node, python, go, rust)

### Verify chezmoi Installation (Both Platforms)

```bash
chezmoi --version
# Should output: chezmoi version 2.x.x
```

---

## Step 3: CRITICAL - 1Password Setup

**Time**: 5-10 minutes

**WHY THIS IS CRITICAL**: The dotfiles include `~/.config/zsh/private/secrets.zsh` which uses 1Password CLI to fetch secrets. If 1Password is NOT set up, this file will break your shell startup.

### macOS: Install 1Password

**IMPORTANT**: Install the DESKTOP APP before the CLI. The CLI requires the app for authentication.

```bash
# Install desktop app (if not already installed from App Store)
brew install --cask 1password

# Install CLI
brew install --cask 1password-cli

# Open 1Password app and sign in
open -a "1Password"
# Keep app running for authentication
```

### Linux: Install 1Password

```bash
# Add 1Password repository
curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] \
  https://downloads.1password.com/linux/debian/$(dpkg --print-architecture) stable main" | \
  sudo tee /etc/apt/sources.list.d/1password.list

sudo mkdir -p /etc/debsig/policies/AC2D62742012EA22/
curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | \
  sudo tee /etc/debsig/policies/AC2D62742012EA22/1password.pol

sudo mkdir -p /usr/share/debsig/keyrings/AC2D62742012EA22
curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/debsig/keyrings/AC2D62742012EA22/debsig.gpg

# Install 1Password desktop app and CLI
sudo apt update
sudo apt install -y 1password 1password-cli

# Launch 1Password and sign in
1password &
# Keep app running for authentication
```

### Sign In with CLI (Both Platforms)

```bash
op signin
```

This will prompt you to:
1. Authenticate via the 1Password desktop app (biometric or password)
2. NOT in the terminal (uses desktop integration)

### Verify 1Password CLI (Both Platforms)

```bash
op whoami
# Should show: your-email@example.com (account name)
```

### What Breaks Without This

If you skip this step, when you reload your shell you'll see:

```
op: command not found
_load_github_token: function definition error
```

And your shell will be broken. You'll need to:

1. Install 1Password desktop app
2. Install 1Password CLI
3. Sign in: `op signin`
4. Reload shell: `exec zsh`

---

## Step 4: Initialize Dotfiles

**Time**: 3-5 minutes

This step clones the dotfiles repository and prompts for configuration values.

### Run chezmoi init (Both Platforms)

```bash
chezmoi init https://github.com/Aristoddle/beppe-system-bootstrap.git
```

### You'll Be Prompted For

chezmoi will ask for these values (stored in `~/.config/chezmoi/chezmoi.toml`):

1. **Git user name**: Your full name (e.g., "John Doe")
2. **Git user email**: Your email for git commits
3. **GPG signing key**: Press Enter to skip (optional)
4. **GitHub username**: Your GitHub handle (e.g., "johndoe")
5. **Device name**: Identifier for this machine (e.g., "joes-macbook")

### Apply Dotfiles

```bash
chezmoi apply
```

This deploys:
- Shell configuration to `~/.config/zsh/`
- Git config to `~/.gitconfig`
- macOS customizations (600+ settings)

### What Happens

- ✅ Creates `~/.config/zsh/` directory structure
- ✅ Deploys aliases, functions, completions
- ✅ Creates `.gitconfig` with your name/email
- ✅ Runs macOS system customizations (if on macOS)

**IMPORTANT**: Your shell will reference tools that aren't installed yet. Don't restart the shell until Step 10.

---

## Step 5: Install Shell Framework

**Time**: 2-3 minutes (Both Platforms)

Install Oh-My-Zsh and Powerlevel10k theme (required for prompt).

### Automated Installation (Both Platforms)

```bash
bash ~/.local/share/chezmoi/scripts/install-shell-tools.sh --yes
```

This installs:
- Oh-My-Zsh (shell framework)
- Powerlevel10k (fast prompt theme)

### Manual Installation (Alternative, Both Platforms)

If the script fails:

```bash
# Install Oh-My-Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install Powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

### Verify Installation (Both Platforms)

```bash
ls -la ~/.oh-my-zsh/custom/themes/powerlevel10k
# Should show powerlevel10k directory
```

---

## Step 6: Install CLI Tools

**Time**: 5-7 minutes

Install modern Rust-based CLI tools (bat, eza, fd, ripgrep, etc.).

### macOS: Automated Installation

```bash
bash ~/.local/share/chezmoi/scripts/install-cli-tools.sh --yes
# Or manually:
brew install bat eza fzf zoxide fd ripgrep sd git-delta dust procs
```

### Linux: Install CLI Tools

```bash
# Install via apt
sudo apt install -y bat eza fzf zoxide fd-find ripgrep git-delta dust

# Note package naming differences:
# - bat → installed as 'batcat' on Ubuntu/Debian
# - fd → installed as 'fdfind' on Ubuntu/Debian
# - Aliases are configured automatically in linux.zsh

# Verify (will use aliases if needed)
which bat eza fzf fd rg delta dust
```

### Tools Installed (Both Platforms)

- `bat` (cat with syntax highlighting)
- `eza` (modern ls)
- `fzf` (fuzzy finder - CRITICAL)
- `zoxide` (smart cd)
- `fd` (better find)
- `ripgrep`/`rg` (better grep)
- `sd` (better sed)
- `delta` (git diffs)
- `dust` (disk usage)
- `procs` (modern ps)

### Verify Installation

```bash
which bat eza fzf fd rg
# Should show paths to all tools
```

---

## Step 8: Install Developer Tools

**Time**: 10-15 minutes

Install essential development tools (git, tmux, nvim, lazygit, mise, pyenv, etc.).

### Automated Installation

```bash
bash ~/.local/share/chezmoi/scripts/install-dev-tools.sh --yes
```

This installs:
- **Essential**: docker, gh, direnv, jq, mise, pyenv
- **Terminal utilities**: tmux, htop, ncdu, tree, watch, nvim, tldr
- **Optional**: lazygit, lazydocker, VSCode Insiders, Cursor

### Manual Installation (Alternative)

```bash
# Essential tools
brew install gh direnv jq tmux htop ncdu tree watch neovim tldr lazygit lazydocker

# mise (multi-language version manager)
curl https://mise.run | sh

# pyenv (Python version manager)
brew install pyenv pyenv-virtualenv

# Optional: GUI apps
brew install --cask docker cursor visual-studio-code@insiders
```

### Verify Installation

```bash
which gh direnv jq tmux nvim lazygit mise pyenv
# Should show paths to all tools
```

---

## Step 9: Install from Brewfile

**Time**: 10-15 minutes

The Brewfile contains additional dependencies and GUI apps.

### Install Brewfile Dependencies

```bash
cd ~/.local/share/chezmoi
brew bundle install
```

This installs:
- Additional libraries (openssl, readline, etc.)
- Fonts (FiraCode Nerd Font, Hack Nerd Font)
- Additional tools (chezmoi, gh, glow, etc.)
- GUI apps (1password-cli, alacritty, claude, cursor)

### What If Packages Fail?

Some packages may already be installed (from previous steps). That's OK.

```bash
# Check what failed
brew bundle check --verbose
```

---

## Step 10: Post-Install Configuration

**Time**: 5-10 minutes

Configure tools and reload shell.

### 1. Install Nerd Font in Terminal

**Required for Powerlevel10k icons to display correctly.**

If using **Terminal.app**:
1. Open Terminal Preferences (Cmd+,)
2. Go to Profiles > Text
3. Click "Change" under Font
4. Select "FiraCode Nerd Font Mono" or "MesloLGS NF"
5. Size: 14pt
6. Close preferences

If using **Alacritty** (recommended):
- Already configured in `~/.config/alacritty/alacritty.toml`
- Uses FiraCode Nerd Font Mono

If using **iTerm2**:
1. Preferences > Profiles > Text
2. Font: "MesloLGS NF" or "FiraCode Nerd Font Mono"
3. Size: 14pt

### 2. Reload Shell

**NOW you can safely reload the shell** (all tools are installed):

```bash
exec zsh
```

### 3. Configure Powerlevel10k

On first shell reload, Powerlevel10k wizard will appear:

**Recommended Settings**:
- Does this look like a diamond? → Yes
- Does this look like a lock? → Yes
- Does this look like a Debian logo? → Yes
- Prompt Style: **Rainbow** or **Lean**
- Character Set: **Unicode**
- Show current time?: **12-hour format**
- Prompt Separators: **Angled**
- Prompt Heads: **Sharp**
- Prompt Tails: **Flat**
- Prompt Height: **Two lines**
- Prompt Connection: **Disconnected**
- Prompt Frame: **No frame**
- Prompt Spacing: **Sparse**
- Icons: **Many icons**
- Prompt Flow: **Concise**
- Enable Transient Prompt?: **Yes**
- Instant Prompt Mode: **Verbose**

If you mess up, run:

```bash
p10k configure
```

### 4. Sign Into GitHub CLI

```bash
gh auth login
```

Choose:
- GitHub.com
- HTTPS (or SSH if you have keys)
- Authenticate with browser
- Follow browser prompts

### 5. Verify 1Password Auto-Signin

```bash
check_1password
# Should show: ✅ 1Password CLI is signed in as: your-email@example.com
```

If not signed in:

```bash
op signin
```

### 6. Configure mise (Optional)

Install language runtimes as needed:

```bash
# View available runtimes
mise list

# Install latest versions
mise install node@latest
mise install python@latest
mise install go@latest

# Or use .tool-versions file in projects
```

### 7. Configure pyenv (Optional)

```bash
# List available Python versions
pyenv install --list | grep "^\s*3\."

# Install latest Python 3.x
pyenv install 3.12.0
pyenv global 3.12.0

# Verify
python --version
```

---

## Step 11: Verification

**Time**: 5 minutes

Verify everything works correctly.

### Run Health Check

```bash
dotfiles doctor
```

This checks:
- Git configuration
- SSH keys
- Tool availability
- Shell configuration
- Completions

### Check Authentication Status

```bash
dotfiles auth status
```

Should show:
- ✓ GitHub CLI (gh)
- ✓ 1Password CLI (op)
- Status of optional tools (claude, codex, copilot)

### Check Tools

```bash
# Shell framework
echo $ZSH  # Should show ~/.oh-my-zsh
echo $ZSH_THEME  # Should show powerlevel10k/powerlevel10k

# Modern CLI tools
which bat eza fzf fd rg sd delta dust procs zoxide
# Should show paths for all

# Developer tools
which gh direnv jq tmux nvim lazygit mise pyenv
# Should show paths for all

# 1Password
op whoami
# Should show your account email
```

### Test Aliases and Functions

```bash
# Test modern CLI tools
ls  # Should use eza (colored output with icons)
cat README.md  # Should use bat (syntax highlighting)

# Test custom functions
dotfiles list  # Shows all available commands
dotfiles help  # Shows help menu

# Test git integration
git status  # Should show delta-formatted diffs
```

### Check Secrets

```bash
# Verify secrets.zsh loaded without errors
echo $GH_TOKEN  # May be empty if not using Copilot CLI
# (It's normal for this to be empty)

# Check 1Password integration
check_1password
# Should show signed in status
```

---

## Troubleshooting

### Shell Won't Start After chezmoi apply

**Symptom**: `exec zsh` hangs or shows errors about missing commands

**Cause**: Tools referenced in shell config aren't installed yet

**Fix**:
1. Don't reload shell until Step 10
2. Complete Steps 6-9 first
3. Then reload: `exec zsh`

---

### 1Password CLI Not Working

**Symptom**: `op: command not found` or `You are not currently signed in`

**Fix**:

```bash
# 1. Ensure desktop app is installed and running
open -a "1Password"

# 2. Install CLI
brew install --cask 1password-cli

# 3. Sign in
op signin

# 4. Reload shell
exec zsh

# 5. Verify
check_1password
```

---

### Icons Don't Show in Prompt

**Symptom**: Prompt shows `?` or boxes instead of icons

**Cause**: Terminal not using Nerd Font

**Fix**:
1. Install Nerd Font: `brew install --cask font-fira-code-nerd-font`
2. Configure terminal to use "FiraCode Nerd Font Mono" (see Step 10.1)
3. Reload terminal window
4. Run `p10k configure` if still broken

---

### mise or pyenv Not Found

**Symptom**: `mise: command not found` after installation

**Cause**: Not in PATH yet

**Fix**:

```bash
# For mise
export PATH="$HOME/.local/bin:$PATH"

# For pyenv
export PATH="$HOME/.pyenv/bin:$PATH"

# Then reload shell
exec zsh
```

---

### Homebrew Command Not Found After Installation

**Symptom**: `brew: command not found` after running installer

**Cause**: Homebrew not added to PATH

**Fix**:

```bash
# Apple Silicon Macs
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Intel Macs
echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/usr/local/bin/brew shellenv)"

# Verify
brew --version
```

---

### Powerlevel10k Configuration Wizard Won't Start

**Symptom**: `p10k configure` does nothing or errors

**Cause**: Powerlevel10k not installed or not set as theme

**Fix**:

```bash
# 1. Verify installation
ls ~/.oh-my-zsh/custom/themes/powerlevel10k

# 2. If missing, install it
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 3. Reload shell
exec zsh

# 4. Manually trigger wizard
p10k configure
```

---

### Git Asks for Username/Password on Every Push

**Symptom**: Git constantly prompts for credentials

**Fix**: Set up SSH keys or credential helper

**SSH Keys** (recommended):

```bash
# 1. Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. Add to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 3. Copy public key
cat ~/.ssh/id_ed25519.pub | pbcopy

# 4. Add to GitHub:
# Go to https://github.com/settings/keys
# Click "New SSH key"
# Paste and save
```

**HTTPS Credential Helper**:

```bash
# macOS keychain helper (already configured in .gitconfig)
git config --global credential.helper osxkeychain
```

---

### chezmoi Complains About Dirty Working Tree

**Symptom**: `chezmoi apply` warns about uncommitted changes

**Cause**: You edited deployed files instead of source files

**Fix**:

```bash
# See what changed
chezmoi diff

# Discard changes (if you want to keep source)
chezmoi apply --force

# Or edit source files
cd ~/.local/share/chezmoi
# Make your edits
chezmoi apply
```

---

## Quick Command Reference

| Task | Command |
|------|---------|
| **Install Homebrew** | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` |
| **Install chezmoi** | `brew install chezmoi` |
| **Initialize dotfiles** | `chezmoi init https://github.com/Aristoddle/beppe-system-bootstrap.git` |
| **Apply dotfiles** | `chezmoi apply` |
| **Install shell tools** | `bash ~/.local/share/chezmoi/scripts/install-shell-tools.sh --yes` |
| **Install CLI tools** | `bash ~/.local/share/chezmoi/scripts/install-cli-tools.sh --yes` |
| **Install dev tools** | `bash ~/.local/share/chezmoi/scripts/install-dev-tools.sh --yes` |
| **Install Brewfile** | `cd ~/.local/share/chezmoi && brew bundle install` |
| **Reload shell** | `exec zsh` |
| **Configure p10k** | `p10k configure` |
| **Health check** | `dotfiles doctor` |
| **Sign in 1Password** | `op signin` |
| **Check auth status** | `dotfiles auth status` |

---

## What's Next?

After completing this guide, you have:

- ✅ Fully configured shell (zsh + Oh-My-Zsh + Powerlevel10k)
- ✅ Modern CLI tools (bat, eza, fzf, ripgrep, etc.)
- ✅ Developer tools (git, docker, tmux, nvim, lazygit)
- ✅ Version managers (mise, pyenv)
- ✅ Secret management (1Password CLI)
- ✅ macOS system customizations (600+ settings)

### Explore Further

```bash
# Discover available commands
dotfiles list

# View documentation
dotfiles docs quickstart      # This guide
dotfiles docs architecture    # System design
dotfiles docs ssh             # SSH setup

# Make changes
dotfiles edit aliases/common.zsh
chezmoi diff
chezmoi apply
exec zsh

# Check health
dotfiles status
dotfiles doctor
```

### Customize

Edit source files in `~/.local/share/chezmoi/`:

- **Aliases**: `private_dot_config/zsh/aliases/*.zsh`
- **Functions**: `private_dot_config/zsh/functions/*.zsh`
- **Config**: `private_dot_config/zsh/config/*.zsh`
- **Secrets**: `private_dot_config/zsh/private/secrets.zsh.tmpl`

Then apply:

```bash
chezmoi apply
exec zsh
```

### Commit Your Changes

```bash
cd ~/.local/share/chezmoi
git status
git add .
git commit -m "feat(aliases): Add custom shortcuts"
git push
```

---

## Time Estimates Summary

| Step | Task | Time |
|------|------|------|
| 1 | Prerequisites | 2-3 min |
| 2 | Install Homebrew | 3-5 min |
| 3 | Install chezmoi | 1-2 min |
| 4 | 1Password Setup | 5-10 min |
| 5 | Initialize Dotfiles | 3-5 min |
| 6 | Install Shell Framework | 2-3 min |
| 7 | Install CLI Tools | 5-7 min |
| 8 | Install Developer Tools | 10-15 min |
| 9 | Install Brewfile | 10-15 min |
| 10 | Post-Install Config | 5-10 min |
| 11 | Verification | 5 min |
| **TOTAL** | | **45-60 min** |

---

## Additional Resources

- **Repository**: https://github.com/Aristoddle/beppe-system-bootstrap
- **chezmoi Docs**: https://www.chezmoi.io/
- **Oh-My-Zsh**: https://ohmyz.sh/
- **Powerlevel10k**: https://github.com/romkatv/powerlevel10k
- **1Password CLI**: https://developer.1password.com/docs/cli/

---

**Last Updated**: 2025-12-03
**Tested On**: macOS Sonoma 14.x, macOS Sequoia 15.x
**Maintained By**: Aristoddle

---

**Pro Tip**: Bookmark this guide:

```bash
# Add to your shell
alias quickstart='glow ~/.local/share/chezmoi/docs/QUICKSTART_NEW_MACHINE.md'
```

Then just run: `quickstart`
