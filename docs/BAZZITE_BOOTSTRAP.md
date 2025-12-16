# Bazzite Bootstrap Guide

**For**: Fresh Bazzite install on AMD 7840HS + Radeon 780M
**Username**: `deck` (for EmuDeck SD card compatibility with Steam Deck)
**Backup Location**: `Dropbox:Bazzite-Migration-Backup-20251205/`

---

## CONTEXT FOR CLAUDE AGENTS

```
User: Joe
System: Bazzite Linux (Fedora Atomic, immutable)
Hardware: AMD Ryzen 7 7840HS (Zen 4, 8C/16T, 35W TDP) + Radeon 780M (RDNA 3, 12 CUs)
RAM: 93GB
Username: deck (UID 1000, GID 1000)
Use case: Gaming (EmuDeck/Steam), Media Server (Plex), Steam Deck companion

Key preferences:
- Modern CLI tools: fd, rg, bat, eza, zoxide, mise
- Shell: zsh with extensive configuration
- Dotfiles: chezmoi managed in ~/.local/share/chezmoi
- Development: Distrobox containers (Fedora-based for ABI compatibility)
- Package preference: Flatpak > Distrobox > rpm-ostree (NO Homebrew!)
- Autonomous operation: Complete tasks without asking permission
- Python: pyenv + pyenv-virtualenv (NOT mise for Python)
```

---

## Quick Reference: Immutable OS

Bazzite is **immutable Fedora** (Fedora Atomic). Key differences from traditional Linux:

| Method | Use Case | Survives Updates? |
|--------|----------|-------------------|
| `flatpak install` | GUI apps (PREFERRED) | Yes |
| `distrobox` | Dev tools + CLI via Fedora container | Yes |
| `rpm-ostree install` | System packages requiring deep integration | Yes (requires reboot) |
| `brew install` | DO NOT USE (user preference) | - |
| `sudo dnf install` | DO NOT USE (immutable OS) | No |

### Distrobox Philosophy

**Key Insight**: Use Fedora-based distrobox (not Ubuntu) for ABI compatibility with host.

```bash
# Create Fedora-based dev container
distrobox create --name dev --image ghcr.io/ublue-os/fedora-toolbox:latest

# Install tools INSIDE distrobox
distrobox enter dev -- sudo dnf install -y bat fd-find ripgrep zoxide fzf

# Export tools to host (transparent usage)
distrobox enter dev -- distrobox-export --bin /usr/bin/bat --export-path ~/.local/bin
```

This approach:
- Tools work seamlessly from host shell
- No ABI/library version mismatches
- Survives system updates
- Same pattern works on SteamOS (where rpm-ostree is unavailable)

---

## AUTOMATED BOOTSTRAP OPTION

For a fully automated setup, use the bootstrap script:

```bash
# Clone repo first
git clone https://github.com/Aristoddle/beppe-system-bootstrap.git ~/Documents/Code/dotfiles/beppe-system-bootstrap
cd ~/Documents/Code/dotfiles/beppe-system-bootstrap
git checkout bazzite

# Run automated bootstrap
./scripts/bazzite-bootstrap.sh all
```

This script handles:
- Creating Fedora distrobox with all build dependencies
- Installing mise with tiered dependency ordering (26 tools)
- Installing pyenv with Python 3.13 (for Tcl 9.0 compatibility)
- Exporting tools to host
- Installing Flatpaks
- **Setting up shell environment** (Oh-My-Zsh, Powerlevel10k, zsh-autosuggestions, zsh-syntax-highlighting)

**Note**: 1Password must still be installed manually via rpm-ostree (requires reboot).

### Shell Setup Details (Phase 7)

The bootstrap script installs these on the **HOST** (not distrobox):

1. **Oh-My-Zsh** - zsh framework with plugin management
2. **Powerlevel10k** - Fast, beautiful prompt theme
3. **zsh-autosuggestions** - Fish-like command suggestions
4. **zsh-syntax-highlighting** - Syntax highlighting while typing

After bootstrap, run:
```bash
# Apply chezmoi to create ~/.zshrc symlink and deploy configs
chezmoi init --apply https://github.com/Aristoddle/beppe-system-bootstrap.git

# Reload shell
exec zsh

# Optional: customize Powerlevel10k prompt
p10k configure
```

**Why on HOST?** The shell runs on the host, not inside distrobox. Distrobox tools are exported and available, but the prompt and shell config must be on the host.

For friction points discovered during live bootstrap, see `CLAUDE_BAZZITE_CONTINUATION.md`.

---

## PHASE 1: RESTORE SSH KEYS (FIRST!)

```bash
# Install rclone (Bazzite may have it pre-installed)
rpm-ostree install rclone
systemctl reboot  # Required for rpm-ostree changes

# OR use Flatpak version (no reboot needed)
flatpak install flathub org.rclone.rclone

# Configure Dropbox remote
rclone config
# Choose: n (new remote) -> dropbox -> follow OAuth flow

# Download backup
mkdir -p ~/restored-backup
rclone sync Dropbox:Bazzite-Migration-Backup-20251205/ ~/restored-backup/

# Restore SSH keys
cp -r ~/restored-backup/credentials/ssh ~/.ssh
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_*
chmod 644 ~/.ssh/*.pub
```

---

## PHASE 2: CLONE CHEZMOI REPO

```bash
# Install chezmoi (via curl - no reboot needed)
sh -c "$(curl -fsLS get.chezmoi.io)"

# Clone the repo
git clone git@github.com:Aristoddle/beppe-system-bootstrap.git ~/.local/share/chezmoi

# Initialize (don't apply yet - review first)
chezmoi init
chezmoi diff  # Review what will change
chezmoi apply
```

---

## PHASE 3: RESTORE CREDENTIALS

```bash
# GPG keys
gpg --import ~/restored-backup/credentials/gpg-keys/*.gpg

# Environment file (API keys)
cp ~/restored-backup/root-configs/.env ~/.env

# GNOME keyrings
mkdir -p ~/.local/share/keyrings
cp ~/restored-backup/credentials/gnome-keyrings/* ~/.local/share/keyrings/
```

---

## PHASE 4: INSTALL CLI TOOLS (via Distrobox)

**IMPORTANT**: Use Distrobox (Fedora-based) for CLI tools. NO Homebrew!

### Step 1: Create Fedora Distrobox
```bash
# Use Fedora-based container for ABI compatibility with host
distrobox create --yes --name dev --image ghcr.io/ublue-os/fedora-toolbox:latest
```

### Step 2: Install Build Dependencies
```bash
# Required for building mise tools (postgres, erlang, ruby)
distrobox enter dev -- sudo dnf install -y \
  bat fd-find ripgrep zoxide fzf git-delta \
  pandoc lynx python3 python3-pip zsh tmux neovim \
  jq yq curl wget git make gcc gcc-c++ gh chezmoi \
  openssl-devel readline-devel zlib-devel \
  bzip2-devel libffi-devel xz-devel sqlite-devel tk-devel \
  bison flex libyaml-devel libuuid-devel perl autoconf automake
```

### Step 3: Install mise for Language Management
```bash
distrobox enter dev -- bash -c 'curl https://mise.run | sh'

# Copy mise config from this repo
mkdir -p ~/.config/mise
cp ~/.local/share/chezmoi/private_dot_config/mise/config.toml ~/.config/mise/config.toml

# Run tiered bootstrap (installs 26 tools in dependency order)
distrobox enter dev -- bash -c 'eval "$(~/.local/bin/mise activate bash)" && mise run bootstrap'
```

### Step 4: Export Tools to Host
```bash
# Export frequently-used tools (run from inside distrobox)
distrobox enter dev -- bash -c '
  for tool in bat rg fd fzf delta jq pandoc lynx nvim tmux zoxide gh chezmoi; do
    distrobox-export --bin /usr/bin/$tool --export-path ~/.local/bin 2>/dev/null || true
  done
'

# Export eza (installed via cargo, not in Fedora repos)
distrobox enter dev -- bash -c 'source ~/.cargo/env && cargo install eza'
distrobox enter dev -- distrobox-export --bin ~/.cargo/bin/eza --export-path ~/.local/bin
```

### Optional: bazzite-cli Enhancement
```bash
# Opt-in enhanced CLI (atuin, eza, fd, fzf, ripgrep, tealdeer, zoxide)
ujust bazzite-cli
```

---

## PHASE 5: INSTALL GUI APPS (Flatpak)

Bazzite prefers Flatpak for GUI apps. Use **Bazaar** app store (default) or CLI:

```bash
# Communication
flatpak install flathub com.discordapp.Discord
flatpak install flathub org.signal.Signal
flatpak install flathub com.slack.Slack
flatpak install flathub org.telegram.desktop

# Productivity
flatpak install flathub com.spotify.Client
flatpak install flathub md.obsidian.Obsidian
flatpak install flathub org.mozilla.Thunderbird

# Development
flatpak install flathub com.visualstudio.code

# Security (1Password via rpm-ostree for CLI integration - see PHASE 6)
```

---

## PHASE 6: SYSTEM PACKAGES (rpm-ostree - MINIMIZE!)

Each rpm-ostree install requires a reboot. Batch together.

**Only use rpm-ostree for**:
- Shell (zsh) - Required for login shell
- 1Password - Required for CLI integration and SSH agent

```bash
# Add 1Password repo
sudo rpm --import https://downloads.1password.com/linux/keys/1password.asc
sudo sh -c 'cat > /etc/yum.repos.d/1password.repo << EOF
[1password]
name=1Password Stable Channel
baseurl=https://downloads.1password.com/linux/rpm/stable/\$basearch
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://downloads.1password.com/linux/keys/1password.asc
EOF'

# Install essential system packages
rpm-ostree install zsh 1password 1password-cli

# Reboot to apply
systemctl reboot

# Set zsh as default shell after reboot
sudo usermod --shell /bin/zsh deck
```

**After reboot**: Enable 1Password CLI integration:
1. Open 1Password GUI and sign in
2. Settings > Developer > Enable "Integrate with 1Password CLI"
3. Settings > Security > Enable "Unlock using system authentication"

---

## PHASE 7: RESTORE PERSONAL DATA

```bash
# Obsidian vault
mkdir -p ~/Documents
cp -r ~/restored-backup/Obsidian-Vault ~/Documents/Joes_Default_Vault

# Code projects
cp -r ~/restored-backup/Code ~/Code

# Pictures
cp -r ~/restored-backup/Pictures ~/Pictures
```

---

## PHASE 8: CLAUDE CODE SETUP

**Note**: Assumes you already have the `dev` Fedora distrobox from Phase 4.

```bash
# Inside dev distrobox, Node is installed via mise
# Claude Code is already available via npm (mise installs it globally)
distrobox enter dev -- bash -c 'eval "$(~/.local/bin/mise activate bash)" && npm install -g @anthropic-ai/claude-code'

# Export to host
distrobox enter dev -- distrobox-export --bin $(which claude) --export-path ~/.local/bin

# Apply chezmoi config (includes Claude agents, skills, commands)
chezmoi apply

# Restore Claude config from backup (if available)
cp ~/restored-backup/root-configs/.claude.json ~/.claude.json 2>/dev/null || true
```

**Verify Claude Code works**:
```bash
claude --version
claude  # Start interactive session
```

---

## PHASE 9: DOCKER/PODMAN SETUP (for MCP)

```bash
# Bazzite has Podman pre-installed
# Enable Docker compatibility (if needed)
rpm-ostree install docker docker-compose
systemctl reboot

# Enable Docker
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## PHASE 10: EMUDECK SETUP

```bash
# Recommended installation method
ujust install-emudeck

# Or via Bazzite Portal during first boot
# Your ROMs should be on external/SD storage
# EmuDeck will configure paths automatically
```

**For comprehensive emulation setup**, see **`EMULATION_SETUP.md`** which covers:
- ROM folder structure and file formats
- BIOS requirements by system
- Recommended emulators per platform
- Cloud save sync between Steam Deck and Bazzite
- RetroAchievements configuration
- Steam ROM Manager setup
- Performance tuning per system
- Controller configuration and troubleshooting

---

## HARDWARE-SPECIFIC: AMD 7840HS + Radeon 780M

### Specs
```
CPU:  AMD Ryzen 7 7840HS (Zen 4, 8C/16T, 3.8GHz base, 35W TDP)
GPU:  AMD Radeon 780M (RDNA 3 integrated, 12 CUs)
RAM:  93GB
APU:  Phoenix1 architecture
Performance: Comparable to GTX 1050 Ti/GTX 1650
```

### Known Issue: TDP Control on Phoenix APUs

The SMU kernel module may not load properly, but **ryzenadj still works**!

**Check if affected:**
```bash
ryzenadj -i  # May show "no compatible ryzenadj kernel module found"
```

**Working TDP adjustment (despite error):**
```bash
# Set TDP to 55W (max for this APU)
sudo ryzenadj --stapm-limit=55000 --fast-limit=55000 --slow-limit=55000
```

**Automate at boot (systemd service):**
```bash
# Create /etc/systemd/system/ryzenadj.service
sudo tee /etc/systemd/system/ryzenadj.service << 'EOF'
[Unit]
Description=Set TDP via ryzenadj
After=multi-user.target

[Service]
Type=oneshot
ExecStart=/usr/bin/ryzenadj --stapm-limit=55000 --fast-limit=55000 --slow-limit=55000

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable ryzenadj
```

**Alternative kernel parameter fix:**
```bash
# Edit /etc/default/grub, add to GRUB_CMDLINE_LINUX:
amdgpu.ppfeaturemask=0xffffffff

# Rebuild grub
sudo grub2-mkconfig -o /boot/grub2/grub.cfg
sudo reboot
```

### Power Profile for Gaming
```bash
powerprofilesctl set performance
```

### SimpleDeckyTDP (Recommended for TDP control in Gaming Mode)
```bash
# Install via Decky Store or:
curl -L https://github.com/aarron-lee/SimpleDeckyTDP/raw/main/install.sh | sh
# Reboot required
```

---

## DECKY LOADER & STEAM DECK SYNC

### Install Decky on Bazzite
```bash
ujust setup-decky
```

### Recommended Decky Plugins

| Plugin | Purpose | Sync with Deck? |
|--------|---------|-----------------|
| CSS Loader | UI themes | YES |
| SteamGridDB | Custom artwork | YES |
| ProtonDB Badges | Compatibility info | YES |
| SimpleDeckyTDP | TDP control | NO (device-specific) |
| PowerTools | CPU/GPU control | NO (device-specific) |
| Animation Changer | Boot animations | YES |
| HLTB for Deck | Game time info | YES |

### Sync Strategy: Manual Bootstrap + Syncthing

**Phase 1: Initial Setup (Manual)**
```bash
# On Steam Deck (Desktop Mode):
tar -czvf ~/decky-backup.tar.gz ~/.local/share/decky
cp ~/decky-backup.tar.gz /run/media/deck/SanDisk932/

# On Bazzite:
tar -xzvf /mnt/SanDisk932/decky-backup.tar.gz -C ~/
```

**Phase 2: Ongoing Sync (Syncthing)**

1. Install Syncthing (Flatpak):
```bash
flatpak install flathub me.kozec.syncthingtk
# Or via system package:
# rpm-ostree install syncthing
```

2. **CRITICAL**: Use port 8385 (not 8384 - conflicts with Decky):
```bash
# Edit ~/.config/syncthing/config.xml
sed -i 's/127.0.0.1:8384/0.0.0.0:8385/' ~/.config/syncthing/config.xml
```

3. Create sync folders (sync settings/themes only, not plugins):
   - `~/homebrew/settings/` - Plugin configurations
   - `~/homebrew/themes/` - CSS Loader themes

4. Create `.stignore` in settings folder:
```
# Device-specific plugins (DO NOT SYNC)
/PowerTools/
/Battery*/
/Bluetooth/
/Audio*/
*.lock
*.pid
*.tmp
```

5. Start with **Send Only** from Steam Deck, **Receive Only** on Bazzite
6. After 1 week stable, change both to **Send & Receive**

---

## EMUDECK CLOUD SAVES

EmuDeck CloudSync syncs saves across devices (premium feature):

```bash
# Setup requires Chromium browser (Firefox has a bug)
# Configure via EmuDeck app -> CloudSync

# Alternative: Syncthing for save folders
# Sync: ~/Emulation/saves/
```

---

## USEFUL UJUST COMMANDS

### System
```bash
ujust update              # Update everything (system + flatpaks + containers)
ujust clean-system        # Clean up old packages
ujust device-info         # Generate system info for support
ujust bios                # Reboot to BIOS
ujust --choose            # Interactive menu
```

### Gaming
```bash
ujust setup-decky         # Install Decky Loader
ujust install-emudeck     # Install EmuDeck
ujust fix-reset-steam     # Fix Steam issues (keeps games/saves)
ujust fix-proton-hang     # Kill stuck Proton processes
```

### Troubleshooting
```bash
ujust logs-this-boot      # View current boot logs
ujust logs-last-boot      # View previous boot logs
ujust restart-pipewire    # Fix audio crackling
```

---

## GNOME vs KDE Choice

**KDE Plasma** (recommended for Steam Deck familiarity):
- Windows-like interface
- SteamOS themes pre-installed
- 7x more popular in Bazzite Deck images

**GNOME** (recommended for touch devices):
- Better touch input
- VRR and fractional scaling enabled by default
- GSConnect (Android integration) pre-installed

**WARNING**: Do NOT rebase between desktop environments - breaks installations!

---

## TROUBLESHOOTING

### "rpm-ostree: command not found"
You're not on immutable Fedora. Use `dnf` instead.

### "Package not found"
Try `rpm-ostree search <name>` or check if it's a Flatpak.

### Keybindings not working
GNOME settings may not transfer. Manually set:
- Alt+Space -> Application launcher
- Super+V -> Clipboard manager
- Shift+Super+S -> Screenshot tool

### MCP servers not connecting
```bash
systemctl status docker
docker ps
```

### TDP stuck / poor gaming performance
```bash
# Check current TDP
cat /sys/class/drm/card0/device/power_dpm_force_performance_level

# Force high performance
echo high | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level

# Or use ryzenadj
sudo ryzenadj --stapm-limit=55000 --fast-limit=55000 --slow-limit=55000
```

### Audio issues
```bash
ujust restart-pipewire
```

---

## FIRST CLAUDE CODE SESSION

Tell Claude:

> "I just installed Bazzite and restored from backup. Read
> `~/.local/share/chezmoi/docs/BAZZITE_BOOTSTRAP.md` for context.
> My companion Steam Deck syncs with this device via Syncthing.
> Help me [your task]."

---

## FILES RESTORED FROM BACKUP

| Folder | Contains |
|--------|----------|
| `credentials/` | SSH, GPG, 1password, keyrings |
| `Obsidian-Vault/` | Main notes vault |
| `Code/` | All code projects |
| `dotfiles/` | ~/.dotfiles backup |
| `claude-config/` | MCP infrastructure |
| `root-configs/` | .env, .gitconfig, histories |

---

## RELATED DOCS

- `EMULATION_SETUP.md` - Comprehensive EmuDeck setup and emulation guide
- `STEAM_DECK_SETUP.md` - Claude Code setup on Steam Deck
- `QUICKSTART_NEW_MACHINE.md` - General bootstrap guide
- `CLAUDE_CODE_AGENTS_SKILLS.md` - Agent system reference

---

## SOURCES

- [Bazzite Documentation](https://docs.bazzite.gg/)
- [GitHub Issue #3433 - TDP Control](https://github.com/ublue-os/bazzite/issues/3433)
- [GitHub Issue #320 - TDP Workaround](https://github.com/ublue-os/bazzite/issues/320)
- [SimpleDeckyTDP](https://github.com/aarron-lee/SimpleDeckyTDP)
- [Syncthing Decky Plugin](https://github.com/theCapypara/steamdeck-decky-syncthing)
- [EmuDeck Wiki](https://emudeck.github.io/)

---

**Last Updated**: 2025-12-09
**Source**: `github.com/Aristoddle/beppe-system-bootstrap`
