# Bazzite Post-Install Recovery Instructions

**Target System**: Bazzite (Fedora-based, SteamOS-like immutable OS)
**New Username**: `deck` (for EmuDeck SD card compatibility)
**Date Created**: 2025-12-05
**For**: Fresh Claude Code agent on new system

---

## Table of Contents

1. [Pre-Recovery Checklist](#pre-recovery-checklist)
2. [Phase 1: First Boot Critical Setup](#phase-1-first-boot-critical-setup)
3. [Phase 2: Dropbox Recovery](#phase-2-dropbox-recovery)
4. [Phase 3: SSH & GPG Restoration](#phase-3-ssh--gpg-restoration)
5. [Phase 4: Chezmoi Bootstrap](#phase-4-chezmoi-bootstrap)
6. [Phase 5: MCP Server Setup](#phase-5-mcp-server-setup)
7. [Phase 6: Development Tools](#phase-6-development-tools)
8. [Phase 7: Application Installation](#phase-7-application-installation)
9. [Phase 8: GNOME Customization](#phase-8-gnome-customization)
10. [Bazzite-Specific Notes](#bazzite-specific-notes)
11. [Verification](#verification)
12. [Troubleshooting](#troubleshooting)

---

## Pre-Recovery Checklist

Before starting, verify the backup was completed successfully:

- [ ] **Dropbox Backup Location**: `Dropbox:Bazzite-Migration-Backup-20251205/`
- [ ] **Expected Backup Size**: ~3.2GB
- [ ] **Critical Items Backed Up**:
  - SSH keys (id_ed25519, id_rsa)
  - GPG keys (j3lanzone@gmail.com)
  - 1Password export (1.4MB)
  - .env file (GitHub PAT + API keys)
  - GNOME keyrings
  - Obsidian vault (1.3GB)
  - Claude config (~/.claude/)
  - Dotfiles git repository
  - Custom scripts (~/.local/bin)

---

## Phase 1: First Boot Critical Setup

**Time**: 10-15 minutes
**Goal**: Get basic system access and networking configured

### 1.1 Complete Bazzite Initial Setup

```bash
# During first boot wizard:
# - Set username to: deck
# - Set hostname to: bazzite-deck (or preferred)
# - Enable automatic login (optional)
```

### 1.2 Install Base Dependencies

Bazzite uses **rpm-ostree** for system packages (immutable) and **Flatpak** for apps.

```bash
# Update system first
rpm-ostree upgrade

# Install essential development tools
rpm-ostree install git zsh vim curl wget

# Reboot to apply ostree changes
sudo systemctl reboot
```

### 1.3 Configure Zsh as Default Shell

```bash
# After reboot, change shell
chsh -s $(which zsh)

# Log out and back in to activate zsh
```

### 1.4 Create Essential Directories

```bash
# Standard directory structure
mkdir -p ~/.local/bin
mkdir -p ~/.local/share
mkdir -p ~/.config
mkdir -p ~/restored-backup
mkdir -p ~/Documents
mkdir -p ~/Pictures
mkdir -p ~/.ssh
mkdir -p ~/.gnupg
```

---

## Phase 2: Dropbox Recovery

**Time**: 20-30 minutes (depending on internet speed)
**Goal**: Download all backup files from Dropbox

### 2.1 Install rclone

```bash
# Install rclone (Fedora package)
rpm-ostree install rclone

# Reboot to apply
sudo systemctl reboot
```

### 2.2 Configure Dropbox Remote

```bash
# Start rclone configuration wizard
rclone config

# Follow prompts:
# n) New remote
# name> Dropbox
# Storage> dropbox
# client_id> (press Enter to use defaults)
# client_secret> (press Enter to use defaults)
# Edit advanced config? n
# Use auto config? y (opens browser for OAuth)
# Yes this is OK? y
# q) Quit config
```

### 2.3 Download Backup

```bash
# Test connection first
rclone lsd Dropbox:

# Download backup (this will take a while)
rclone sync Dropbox:Bazzite-Migration-Backup-20251205/ ~/restored-backup/ \
  --progress \
  --transfers 8 \
  --checkers 16

# Verify download completed
du -sh ~/restored-backup
# Should show ~3.2GB
```

---

## Phase 3: SSH & GPG Restoration

**Time**: 5 minutes
**Goal**: Restore authentication keys FIRST (needed for git operations)

### 3.1 Restore SSH Keys

```bash
# Copy SSH keys
cp -r ~/restored-backup/credentials/ssh/* ~/.ssh/

# Set correct permissions (CRITICAL)
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_ed25519.pub
chmod 644 ~/.ssh/id_rsa.pub
chmod 644 ~/.ssh/known_hosts

# Verify keys are readable
ls -la ~/.ssh/

# Test SSH to GitHub
ssh -T git@github.com
# Should see: "Hi Aristoddle! You've successfully authenticated..."
```

### 3.2 Restore GPG Keys

```bash
# Import GPG private key
gpg --import ~/restored-backup/credentials/gpg-keys/private-key.asc

# Import public keys (if backed up separately)
gpg --import ~/restored-backup/credentials/gpg-keys/public-keys.asc

# List imported keys
gpg --list-secret-keys
# Should show: j3lanzone@gmail.com

# Trust the key
gpg --edit-key j3lanzone@gmail.com
# gpg> trust
# Your decision? 5 (ultimate trust)
# gpg> quit
```

### 3.3 Restore Environment Variables

```bash
# Copy .env file (contains GitHub PAT and API keys)
cp ~/restored-backup/root-configs/.env ~/.env

# Set secure permissions
chmod 600 ~/.env

# Source it temporarily (will be auto-loaded by zsh later)
source ~/.env

# Verify GitHub token exists
echo $GITHUB_PERSONAL_ACCESS_TOKEN
# Should output a non-empty value (token redacted in public docs)
```

### 3.4 Restore GNOME Keyrings

```bash
# Copy keyrings
mkdir -p ~/.local/share/keyrings
cp ~/restored-backup/credentials/keyrings/* ~/.local/share/keyrings/

# Set permissions
chmod 700 ~/.local/share/keyrings
chmod 600 ~/.local/share/keyrings/*.keyring
```

---

## Phase 4: Chezmoi Bootstrap

**Time**: 10-15 minutes
**Goal**: Deploy dotfiles configuration

### 4.1 Install Chezmoi

```bash
# Install chezmoi
rpm-ostree install chezmoi

# Reboot
sudo systemctl reboot
```

**Alternative** (if rpm-ostree doesn't have chezmoi):

```bash
# Install to ~/.local/bin
cd ~/.local/bin
curl -sfL https://git.io/chezmoi | sh

# Add to PATH (temporary, will be permanent after dotfiles)
export PATH="$HOME/.local/bin:$PATH"
```

### 4.2 Clone Dotfiles Repository

```bash
# Clone the dotfiles source repository
git clone git@github.com:Aristoddle/beppe-system-bootstrap.git ~/.local/share/chezmoi

# Verify clone
ls -la ~/.local/share/chezmoi/
```

### 4.3 Initialize Chezmoi

```bash
# Initialize (will prompt for configuration values)
chezmoi init

# You'll be prompted for:
# - Git user name: Joe Lanzone (or your name)
# - Git user email: j3lanzone@gmail.com
# - GPG signing key: (press Enter to skip or provide key ID)
# - GitHub username: Aristoddle
# - Device name: bazzite-deck
```

### 4.4 Review and Apply Dotfiles

```bash
# Preview what will be deployed
chezmoi diff

# Apply dotfiles (deploys to ~/.config/)
chezmoi apply

# DO NOT restart shell yet - tools aren't installed
```

**What This Deployed**:
- Shell configuration: `~/.config/zsh/`
- Git config: `~/.gitconfig`
- Claude agents: `~/.claude/agents/`
- Claude skills: `~/.claude/skills/`
- Platform-specific configs: `~/.config/zsh/os/linux.zsh`

---

## Phase 5: MCP Server Setup

**Time**: 15-20 minutes
**Goal**: Restore Claude Code's 17 MCP servers

### 5.1 Restore Claude Configuration

```bash
# Copy Claude config
cp ~/restored-backup/claude-config/.claude.json ~/.claude.json

# Copy all claude directory contents
cp -r ~/restored-backup/claude-config/* ~/.claude/

# Verify MCP servers are configured
grep -A 5 '"mcpServers"' ~/.claude.json
```

### 5.2 Install Node.js (for NPX-based MCP servers)

```bash
# Install mise (modern version manager)
curl https://mise.run | sh

# Add to PATH temporarily
export PATH="$HOME/.local/bin:$PATH"

# Install Node.js
mise install node@latest
mise use --global node@latest

# Verify
node --version
npm --version
```

### 5.3 Install Python (for UVX-based MCP servers)

```bash
# Install pyenv dependencies
rpm-ostree install make gcc zlib-devel bzip2-devel readline-devel \
  sqlite-devel openssl-devel tk-devel libffi-devel xz-devel

# Reboot to apply
sudo systemctl reboot

# Install pyenv
curl https://pyenv.run | bash

# Install latest Python
pyenv install 3.12.0
pyenv global 3.12.0

# Install pipx/uvx
pip install pipx
pipx ensurepath

# Verify
python --version
uvx --version
```

### 5.4 Setup Docker MCP Bridge

The Docker MCP bridge allows Claude to manage Docker containers.

```bash
# Install Docker
rpm-ostree install docker

# Reboot
sudo systemctl reboot

# Enable and start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add deck user to docker group
sudo usermod -aG docker deck

# Log out and back in to apply group membership

# Start the MCP bridge container
docker run -d \
  --name mcp-bridge \
  --network host \
  --restart unless-stopped \
  alpine/socat \
  TCP-LISTEN:8811,fork,reuseaddr EXEC:/bin/sh

# Verify bridge is running
docker ps | grep mcp-bridge
```

### 5.5 Test MCP Servers

```bash
# Test direct MCP servers (after installing Claude Code)
# These are configured in ~/.claude.json:
# - filesystem (npx @modelcontextprotocol/server-filesystem)
# - github (npx @modelcontextprotocol/server-github)
# - memory (npx @modelcontextprotocol/server-memory)
# - playwright (npx @playwright/mcp@latest)
# - sqlite (uvx mcp-server-sqlite)
# - time (uvx mcp-server-time)
# - docker-mcp-toolkit (Docker bridge)

# They will auto-load when Claude Code starts
```

---

## Phase 6: Development Tools

**Time**: 30-45 minutes
**Goal**: Install modern CLI tools and development environment

### 6.1 Install Rust Toolchain

Rust CLI tools (fd, rg, bat, eza, etc.) are CRITICAL for the dotfiles.

```bash
# Install rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Source cargo environment
source ~/.cargo/env

# Verify
rustc --version
cargo --version
```

### 6.2 Install Rust CLI Tools

**CRITICAL**: These tools are referenced in the dotfiles configuration.

```bash
# Install modern CLI tools via cargo
cargo install \
  bat \
  eza \
  fd-find \
  ripgrep \
  sd \
  git-delta \
  du-dust \
  procs \
  zoxide \
  bottom \
  broot \
  duf \
  tldr

# This will take 15-20 minutes
```

### 6.3 Install Oh-My-Zsh and Powerlevel10k

**REQUIRED**: The shell configuration depends on these.

```bash
# Install Oh-My-Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# Install Powerlevel10k theme
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# Install Meslo Nerd Font (for icons)
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
curl -fLO https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf
curl -fLO https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold.ttf
curl -fLO https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Italic.ttf
curl -fLO https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold%20Italic.ttf

# Refresh font cache
fc-cache -f -v
```

### 6.4 Install Additional Developer Tools

```bash
# Install via rpm-ostree (requires reboot)
rpm-ostree install \
  htop \
  ncdu \
  tree \
  tmux \
  neovim \
  gh \
  direnv \
  jq \
  fzf

# Reboot to apply
sudo systemctl reboot
```

### 6.5 Restore Custom Scripts

```bash
# Copy custom scripts from backup
cp -r ~/restored-backup/custom-scripts/* ~/.local/bin/

# Make executable
chmod +x ~/.local/bin/*

# Verify critical scripts exist
ls -la ~/.local/bin/ | grep -E "(flameshot-wayland|dotfiles-check|mcp)"
```

---

## Phase 7: Application Installation

**Time**: 30-60 minutes
**Goal**: Install GUI applications and essential software

### 7.1 Install Flatpak Applications

Bazzite prefers Flatpak for GUI apps. Install from Flathub:

```bash
# Communication
flatpak install flathub com.discordapp.Discord
flatpak install flathub org.signal.Signal
flatpak install flathub com.slack.Slack
flatpak install flathub org.telegram.desktop
flatpak install flathub com.spotify.Client

# Productivity
flatpak install flathub md.obsidian.Obsidian
flatpak install flathub org.mozilla.Thunderbird
flatpak install flathub org.flameshot.Flameshot
flatpak install flathub com.axosoft.GitKraken

# Development
flatpak install flathub com.visualstudio.code
flatpak install flathub io.github.zen_browser.zen

# Media
flatpak install flathub org.videolan.VLC
flatpak install flathub org.gimp.GIMP
flatpak install flathub org.inkscape.Inkscape

# Emulation (EmuDeck compatible)
flatpak install flathub com.valvesoftware.Steam
flatpak install flathub com.usebottles.bottles
flatpak install flathub net.retrodeck.retrodeck
```

### 7.2 Install VS Code (Microsoft Repo)

```bash
# Add Microsoft repository
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc

sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'

# Install via rpm-ostree
rpm-ostree install code

# Reboot
sudo systemctl reboot
```

### 7.3 Install 1Password

**CRITICAL**: Required for secrets management in dotfiles.

```bash
# Add 1Password repository
sudo rpm --import https://downloads.1password.com/linux/keys/1password.asc

sudo sh -c 'echo -e "[1password]\nname=1Password\nbaseurl=https://downloads.1password.com/linux/rpm/stable/\$basearch\nenabled=1\ngpgcheck=1\ngpgkey=https://downloads.1password.com/linux/keys/1password.asc" > /etc/yum.repos.d/1password.repo'

# Install desktop app AND CLI
rpm-ostree install 1password 1password-cli

# Reboot
sudo systemctl reboot

# After reboot: Sign in to 1Password desktop app
# Then test CLI
op signin
op whoami
# Should show: j3lanzone@gmail.com
```

### 7.4 Restore Obsidian Vault

```bash
# Copy Obsidian vault
cp -r ~/restored-backup/Obsidian-Vault ~/Documents/Joes_Default_Vault

# Verify
du -sh ~/Documents/Joes_Default_Vault
# Should show ~1.3GB

# Launch Obsidian (Flatpak) and open vault
flatpak run md.obsidian.Obsidian
# File > Open vault > ~/Documents/Joes_Default_Vault
```

---

## Phase 8: GNOME Customization

**Time**: 10-15 minutes
**Goal**: Restore GNOME settings and extensions

### 8.1 Restore GNOME Settings

```bash
# Restore dconf settings (all GNOME preferences)
dconf load / < ~/restored-backup/local-backup/gnome-settings.dconf

# Log out and back in to apply
```

### 8.2 Install GNOME Extensions

The backup included 72 extensions. Install key ones:

```bash
# Install extension manager (Flatpak)
flatpak install flathub com.mattjakeman.ExtensionManager

# Launch and install extensions:
# - Pano (clipboard manager)
# - Dash to Dock
# - AppIndicator Support
# - Blur My Shell
# - User Themes
# - Just Perfection

# Or restore from dconf (extensions auto-enable if installed)
```

### 8.3 Configure Custom Keybindings

The backup included these keybindings (should restore via dconf):

- **Alt+Space**: Albert launcher
- **Super+V**: Pano clipboard
- **Shift+Super+S**: Flameshot screenshot

Verify in Settings > Keyboard > Keyboard Shortcuts.

### 8.4 Restore QMK Keyboard Config

```bash
# Copy QMK keymap
mkdir -p ~/qmk_firmware/keyboards/kbdfans/odin/v2/keymaps/joe
cp -r ~/restored-backup/qmk-keyboard-config/joe/* \
  ~/qmk_firmware/keyboards/kbdfans/odin/v2/keymaps/joe/

# Install QMK CLI
pip install qmk

# Flash keyboard (when ready)
# qmk flash -kb kbdfans/odin/v2 -km joe
```

---

## Bazzite-Specific Notes

**Important differences from Ubuntu 24.04:**

### Package Management

| Task | Ubuntu | Bazzite |
|------|--------|---------|
| **System packages** | `sudo apt install` | `rpm-ostree install` + reboot |
| **GUI apps** | `sudo apt install` | `flatpak install flathub` |
| **Python packages** | `pip install` | `pipx install` or `uvx` |
| **Remove package** | `sudo apt remove` | `rpm-ostree uninstall` + reboot |

### Immutable Filesystem

- `/` is **read-only** (immutable)
- `/etc/` is writable but overlayed
- `/home/` is writable (normal)
- `/var/` is writable (normal)
- System changes require `rpm-ostree` and reboot

### Layering System Packages

```bash
# Install additional system packages
rpm-ostree install package-name

# View layered packages
rpm-ostree status

# Remove layered package
rpm-ostree uninstall package-name

# Rollback to previous state
rpm-ostree rollback
```

### User vs System Apps

- **System apps**: Via rpm-ostree (Docker, git, zsh, vim)
- **User apps**: Via Flatpak (Discord, Obsidian, VS Code)
- **CLI tools**: Via cargo/mise/pipx (fd, rg, bat)

### Username Change: joe → deck

Update these locations if paths are hardcoded:

```bash
# Search for hardcoded /home/joe paths
rg --hidden '/home/joe' ~/.config/

# Replace with /home/deck
sd '/home/joe' '/home/deck' ~/.config/zsh/config/paths.zsh

# Re-apply chezmoi
chezmoi apply
```

---

## Verification

**After completing all phases, verify system is working:**

### Check Shell Configuration

```bash
# Reload shell
exec zsh

# Verify prompt (should see Powerlevel10k)
# If not configured, run:
p10k configure

# Verify environment
echo $SHELL
# Should output: /usr/bin/zsh

echo $ZSH_THEME
# Should output: powerlevel10k/powerlevel10k

# Test modern CLI tools
which bat eza fd rg sd delta dust procs zoxide
# All should show paths in ~/.cargo/bin/

# Test aliases
ls
# Should use eza (colored output with icons)

cat README.md
# Should use bat (syntax highlighting)
```

### Check Git Configuration

```bash
# Verify git config
git config --list | grep user

# Should show:
# user.name=Joe Lanzone
# user.email=j3lanzone@gmail.com

# Test GitHub SSH
ssh -T git@github.com
# Should show: "Hi Aristoddle!"

# Test GitHub CLI
gh auth status
# Should show: Logged in to github.com as Aristoddle
```

### Check MCP Servers

```bash
# Install Claude Code (if not already)
npm install -g @anthropic-ai/claude-code

# Start Claude Code
claude

# In Claude, run:
/mcp

# Should list 17 MCP servers:
# - docker-mcp-toolkit
# - filesystem
# - github
# - memory
# - sqlite
# - time
# - playwright
# - sequential-thinking
# (and others from Docker-wrapped servers)
```

### Check 1Password Integration

```bash
# Verify 1Password CLI
op whoami
# Should show: j3lanzone@gmail.com (Aristoddle)

# Test secret loading (from dotfiles)
check_1password
# Should show: ✅ 1Password CLI is signed in
```

### Check Version Managers

```bash
# Check mise
mise --version
mise list

# Check pyenv
pyenv --version
pyenv versions

# Check installed runtimes
node --version
python --version
```

### Run Health Check

```bash
# If dotfiles includes health check script
dotfiles doctor

# Or manually verify
which git zsh gh docker docker-compose mise pyenv
```

---

## Troubleshooting

### Shell Won't Start or Errors About Missing Tools

**Symptom**: `exec zsh` fails or shows errors about `bat`, `eza`, etc.

**Cause**: Cargo tools not installed yet

**Fix**:
```bash
# Reinstall cargo tools
cargo install bat eza fd-find ripgrep sd git-delta du-dust procs zoxide

# Add to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Reload shell
exec zsh
```

### rpm-ostree Says "No Space Left on Device"

**Symptom**: Can't layer packages

**Cause**: Too many layered packages or old deployments

**Fix**:
```bash
# Clean up old deployments
rpm-ostree cleanup -b

# Or reset to base image and reinstall
rpm-ostree reset
```

### MCP Servers Not Loading

**Symptom**: `/mcp` shows empty list or errors

**Cause**: Node.js or Python not installed

**Fix**:
```bash
# Verify Node.js
node --version
npm --version

# If missing, install via mise
mise install node@latest
mise use --global node@latest

# Verify Python/uvx
uvx --version

# If missing, install pipx
pip install pipx
pipx ensurepath
```

### 1Password CLI Not Working

**Symptom**: `op: command not found` or `You are not signed in`

**Cause**: Desktop app not running or CLI not installed

**Fix**:
```bash
# Ensure desktop app installed
rpm-ostree install 1password

# Reboot
sudo systemctl reboot

# Launch desktop app
1password &

# Sign in via desktop app, then:
op signin

# Verify
op whoami
```

### Chezmoi Apply Fails

**Symptom**: `chezmoi apply` shows errors about templates

**Cause**: Missing template variables or wrong username

**Fix**:
```bash
# Re-initialize with correct values
chezmoi init

# Answer prompts correctly
# Git name: Joe Lanzone
# Git email: j3lanzone@gmail.com
# GitHub username: Aristoddle
# Device name: bazzite-deck

# Then re-apply
chezmoi apply --verbose
```

### Docker Bridge Not Working

**Symptom**: docker-mcp-toolkit fails to connect

**Cause**: Bridge container not running or port conflict

**Fix**:
```bash
# Check if bridge is running
docker ps | grep mcp-bridge

# If not running, start it
docker run -d \
  --name mcp-bridge \
  --network host \
  --restart unless-stopped \
  alpine/socat \
  TCP-LISTEN:8811,fork,reuseaddr EXEC:/bin/sh

# Test connection
docker exec mcp-bridge ps
```

### Obsidian Vault Won't Open

**Symptom**: Obsidian shows "Vault not found"

**Cause**: Path incorrect or permissions wrong

**Fix**:
```bash
# Verify vault exists
ls -la ~/Documents/Joes_Default_Vault

# If missing, restore from backup
cp -r ~/restored-backup/Obsidian-Vault ~/Documents/Joes_Default_Vault

# Fix permissions
chmod -R u+rw ~/Documents/Joes_Default_Vault
```

---

## Summary Checklist

After completing recovery, you should have:

- [ ] Bazzite installed with username `deck`
- [ ] SSH keys restored and working with GitHub
- [ ] GPG keys imported and trusted
- [ ] .env file with GitHub PAT and API keys
- [ ] Chezmoi dotfiles deployed to ~/.config/
- [ ] Oh-My-Zsh + Powerlevel10k installed and configured
- [ ] Rust CLI tools (bat, eza, fd, rg, etc.) installed
- [ ] Node.js and Python installed via mise/pyenv
- [ ] 17 MCP servers configured in ~/.claude.json
- [ ] Docker MCP bridge running
- [ ] 1Password desktop app + CLI working
- [ ] Flatpak apps installed (Discord, Obsidian, etc.)
- [ ] VS Code installed via Microsoft repo
- [ ] Obsidian vault restored to ~/Documents/
- [ ] GNOME settings and extensions restored
- [ ] Custom scripts in ~/.local/bin/
- [ ] QMK keyboard config backed up

---

## Next Steps After Recovery

1. **Configure Powerlevel10k**: Run `p10k configure` on first shell launch
2. **Test All MCP Servers**: Launch Claude Code and run `/mcp` to verify
3. **Update GitHub PAT**: If token expired, generate new one at https://github.com/settings/tokens
4. **Setup EmuDeck**: Run EmuDeck installer for SD card sharing (username `deck` is critical)
5. **Configure Media Server**: Docker compose for SABnzbd, Plex, etc.
6. **Test Docker**: `docker ps` should work without sudo (after logging out/in)
7. **Customize**: Edit dotfiles in `~/.local/share/chezmoi/` and `chezmoi apply`

---

## Additional Resources

- **Bazzite Documentation**: https://bazzite.gg/
- **Chezmoi Docs**: https://www.chezmoi.io/
- **Claude Code Docs**: https://code.claude.com/docs/
- **MCP Documentation**: https://modelcontextprotocol.io/
- **rpm-ostree Guide**: https://docs.fedoraproject.org/en-US/fedora-silverblue/

---

**Recovery Document Version**: 1.0
**Last Updated**: 2025-12-05
**Created For**: Claude Code agent post-Bazzite migration
**Original System**: Ubuntu 24.04 (username: joe)
**Target System**: Bazzite (username: deck)

---

## Emergency Contacts

If you need help during recovery:

- **GitHub Repository**: https://github.com/Aristoddle/beppe-system-bootstrap
- **Backup Location**: Dropbox:Bazzite-Migration-Backup-20251205/
- **Original User**: j3lanzone@gmail.com (Joe Lanzone)

**IMPORTANT**: This document should be read by a FRESH Claude Code agent on the new Bazzite system. The agent should execute these steps in order and verify each phase before proceeding to the next.
