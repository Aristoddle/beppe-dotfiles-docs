# Steam Deck Claude Code Setup Guide

**For**: Installing Claude Code on Steam Deck
**Companion to**: `BAZZITE_BOOTSTRAP.md` (for the Bazzite machine)
**Goal**: Development environment on Steam Deck for dotfiles sync and quick fixes

---

## CONTEXT FOR CLAUDE AGENTS

```
Device: Steam Deck (LCD or OLED)
OS: SteamOS 3.x (Arch-based, immutable)
Username: deck (UID 1000)
Use case: Quick development, dotfiles sync, Claude Code access on-the-go
Companion device: Bazzite machine (same user, same UID)

Key constraints:
- SteamOS is immutable (pacman changes revert on update)
- Limited storage (internal 64GB-1TB + SD card)
- No dedicated keyboard (use external or virtual)
- Battery considerations
- 16GB RAM shared between CPU/GPU (1GB default VRAM)
```

---

## PHASE 1: ENTER DESKTOP MODE

1. Press Steam button -> Power -> Switch to Desktop
2. Connect external keyboard/mouse (recommended) or use virtual keyboard

---

## PHASE 2: INSTALL DEVELOPMENT TOOLS

### Option A: Distrobox (RECOMMENDED - survives updates)

```bash
# Distrobox is pre-installed on SteamOS 3.5+
# But Podman needs to be installed to user directory

# 1. Install Podman to home directory
mkdir -p ~/.local/bin
curl -L -o ~/.local/bin/podman https://github.com/89luca89/podman-launcher/releases/download/v0.0.5/podman-launcher-amd64
chmod +x ~/.local/bin/podman

# 2. Add to PATH (add to ~/.bashrc)
echo 'export PATH=$PATH:$HOME/.local/bin' >> ~/.bashrc
source ~/.bashrc

# 3. Configure UID/GID mapping for rootless containers
mkdir -p ~/.config/containers
echo "deck:100000:65536" | sudo tee /etc/subuid
echo "deck:100000:65536" | sudo tee /etc/subgid

# 4. Create distrobox config
cat > ~/.distroboxrc << 'EOF'
# Enable GUI apps
xhost +si:localuser:$USER >/dev/null 2>&1

# Force PulseAudio (PipeWire compatibility)
export PIPEWIRE_RUNTIME_DIR=/dev/null
EOF

# 5. Create Ubuntu dev container (RECOMMENDED)
distrobox create --name dev --image ubuntu:24.04

# Or Fedora (for cutting-edge tools)
distrobox create --name dev --image fedora:41

# 6. Enter container
distrobox enter dev
```

### Inside Distrobox: Install Dev Tools

```bash
# Inside the 'dev' distrobox:

# Node.js via NVM (CRITICAL: use v18, NOT v20+)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
source ~/.bashrc
nvm install 18.18.2
nvm use 18.18.2

# Git and essentials (Ubuntu)
sudo apt update
sudo apt install -y git curl wget zsh ripgrep fd-find bat

# Or for Fedora:
# sudo dnf install -y git curl wget zsh ripgrep fd-find bat eza

# Claude Code
npm install -g @anthropic-ai/claude-code
```

### Export Apps to Host

```bash
# Make Claude Code available from SteamOS
distrobox-export --bin claude --export-path ~/.local/bin

# Test
exit  # Leave distrobox
claude --version
```

### Option B: Flatpak + Native (easier but less flexible)

```bash
# VS Code via Flatpak
flatpak install flathub com.visualstudio.code

# For Claude Code, still need distrobox or native npm
```

### Option C: Native pacman (NOT RECOMMENDED - reverts on SteamOS updates)

```bash
# Will be wiped on next SteamOS update!
sudo pacman -S nodejs npm git
npm install -g @anthropic-ai/claude-code
```

---

## PHASE 3: CLONE DOTFILES

```bash
# If SSH keys not set up, use HTTPS first
git clone https://github.com/Aristoddle/beppe-system-bootstrap.git ~/.local/share/chezmoi

# Or with SSH (if keys are on SD card from Bazzite sync)
git clone git@github.com:Aristoddle/beppe-system-bootstrap.git ~/.local/share/chezmoi

# Install chezmoi
sh -c "$(curl -fsLS get.chezmoi.io)"

# Apply dotfiles
chezmoi apply
```

---

## PHASE 4: CONFIGURE CLAUDE CODE

### API Key Setup

```bash
# Option 1: Environment variable
export ANTHROPIC_API_KEY="your-key-here"

# Option 2: If 1Password CLI is installed
eval $(op signin)
export ANTHROPIC_API_KEY=$(op read "op://Private/Anthropic API Key/credential")

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export ANTHROPIC_API_KEY="your-key-here"' >> ~/.bashrc
```

### Claude Config Restore

```bash
# Copy config from Bazzite backup if available
cp /run/media/deck/SanDisk932/claude-backup/.claude.json ~/.claude.json
cp -r /run/media/deck/SanDisk932/claude-backup/.claude ~/.claude
```

---

## PHASE 5: SYNCTHING SETUP (BAZZITE <-> STEAM DECK)

### Install Syncthing

**Option A: Decky Plugin (Gaming Mode - RECOMMENDED)**
1. Install Decky Loader: `ujust setup-decky` (on Bazzite) or manual install on Deck
2. Open Decky Store -> Install "Syncthing"
3. Configure via Quick Access Menu

**Option B: Flatpak (Desktop Mode)**
```bash
flatpak install flathub me.kozec.syncthingtk
```

**Option C: Manual Binary (survives updates)**
```bash
# Download and install to user directory
mkdir -p ~/.local/bin
cd ~/.local/bin
curl -LO https://github.com/syncthing/syncthing/releases/download/v1.29.2/syncthing-linux-amd64-v1.29.2.tar.gz
tar -xzf syncthing-linux-amd64-v1.29.2.tar.gz --strip-components=1 syncthing-linux-amd64-v1.29.2/syncthing
rm syncthing-linux-amd64-v1.29.2.tar.gz

# Create systemd service
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/syncthing.service << 'EOF'
[Unit]
Description=Syncthing
After=network.target

[Service]
ExecStart=%h/.local/bin/syncthing serve --no-browser --logflags=0 --gui-address=0.0.0.0:8385
Restart=on-failure

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now syncthing
```

### Configure Sync Folders

**CRITICAL**: Use port 8385, not 8384 or 8080 (conflicts with Decky)

Folders to sync:

| Folder | Purpose | Sync Mode |
|--------|---------|-----------|
| `~/.local/share/chezmoi` | Dotfiles source | Send & Receive |
| `~/homebrew/settings` | Decky plugin settings | Send & Receive |
| `~/homebrew/themes` | CSS Loader themes | Send & Receive |
| `~/.claude` | Claude Code config + todos | Send & Receive |
| `~/Emulation/saves` | Emulator saves (EmuDeck) | Send & Receive |

### .stignore for Decky Settings

Create `~/homebrew/settings/.stignore`:
```
# Device-specific plugins (DO NOT SYNC)
/PowerTools/
/Battery*/
/Bluetooth/
/Audio*/
/SDH-PlayTime/

# Temporary files
*.lock
*.pid
*.tmp
*.log
__pycache__/
```

### Pairing with Bazzite

1. Open Syncthing web UI: `http://localhost:8385`
2. Add remote device (get device ID from Bazzite)
3. Share folders bidirectionally
4. Enable "Watch for Changes" for real-time sync

---

## PHASE 6: DECKY BACKUP FOR BAZZITE

Before setting up Bazzite, backup your Steam Deck's Decky config:

```bash
# Create backup
tar -czvf ~/decky-backup.tar.gz ~/homebrew/

# Copy to SD card
cp ~/decky-backup.tar.gz /run/media/deck/SanDisk932/

# Also backup Steam artwork customizations
tar -czvf ~/steam-artwork-backup.tar.gz ~/.local/share/Steam/userdata/*/config/grid/
cp ~/steam-artwork-backup.tar.gz /run/media/deck/SanDisk932/
```

---

## BATTERY OPTIMIZATION FOR DEVELOPMENT

### High Drain Activities
- Syncthing (constant disk I/O + network)
- Desktop Mode (30% more power than Gaming Mode)
- Node.js dev servers
- Heavy compilation

### Battery-Saving Tips

```bash
# 1. Disable Syncthing when not syncing
systemctl --user stop syncthing

# 2. Use power-saving TDP (3-5W for coding)
# Via Decky PowerTools or SimpleDeckyTDP

# 3. Lower screen brightness (biggest impact)
# Steam Settings -> Display -> Brightness

# 4. For heavy compilation, use remote machine
# SSH to Bazzite: ssh deck@bazzite.local

# 5. Limit background processes
# Steam button -> Settings -> System -> Task Manager
```

### Expected Battery Life

| Activity | TDP | Battery Life |
|----------|-----|--------------|
| Gaming | 15W | 1.5-3 hours |
| Coding (light) | 5W, brightness 30% | 4-6 hours |
| Idle Desktop Mode | - | 3-4 hours |

---

## USB-C HUB RECOMMENDATIONS

| Hub | Ports | Price | Notes |
|-----|-------|-------|-------|
| Baseus 6-in-1 | 3x USB-A, HDMI, SD, 100W PD | ~$40 | Best value |
| Valve Steam Deck Dock | 3x USB-A, HDMI, DP, Ethernet | $89 | Official |
| Anker USB-C Hub | 2x USB-A, HDMI, SD, 100W PD | ~$25 | Budget |
| UGREEN Revodok Pro | HDMI 4K@60Hz, Ethernet, 100W | ~$50 | Travel |

### External Display Tips

- **1080p@60Hz**: Best battery, native resolution
- **1080p@120Hz**: Smooth desktop (requires HDMI 2.0)
- **4K@60Hz**: More screen real estate for coding

Desktop Mode scaling: System Settings -> Display -> Global Scale (125-150%)

---

## USEFUL COMMANDS ON STEAM DECK

### System
```bash
# Check SteamOS version
cat /etc/os-release

# Available storage
df -h

# Battery status
cat /sys/class/power_supply/BAT1/capacity
```

### Development
```bash
# Enter dev container
distrobox enter dev

# Run Claude Code (from distrobox)
claude

# Quick file edit
chezmoi edit ~/.config/zsh/aliases.zsh
chezmoi apply
```

### Sync
```bash
# Check sync status
syncthing cli show stats

# Force rescan
syncthing cli operations rescan --folder chezmoi
```

---

## CONSTRAINTS & WORKAROUNDS

### Limited Storage
- Keep development in distrobox (containerized)
- Store large repos on SD card: `git clone <repo> /run/media/deck/SanDisk932/projects/`
- Symlink if needed: `ln -s /run/media/deck/SanDisk932/projects ~/projects`

### No Hardware Keyboard
- Use Steam + X for virtual keyboard
- Or connect USB-C hub with keyboard
- Consider Bluetooth keyboard for desktop mode

### Battery Life
- Close Desktop Mode when not using
- Disable Syncthing when not syncing
- Gaming Mode is more battery-efficient than Desktop

### SteamOS Updates Wipe pacman
- Use Distrobox for everything persistent
- Flatpak apps survive updates
- Native pacman installs will be lost

### Memory Considerations
- 16GB shared CPU/GPU
- Default 1GB VRAM (don't increase above 2GB for dev work)
- Containers share host memory

---

## CHEZMOI TEMPLATES FOR MULTI-DEVICE

Detect Steam Deck vs Bazzite in chezmoi templates:

```
{{- if eq .chezmoi.hostname "steamdeck" }}
# Steam Deck specific config
export DEVICE_TYPE="steamdeck"
{{- else if eq .chezmoi.hostname "bazzite" }}
# Bazzite specific config
export DEVICE_TYPE="bazzite"
{{- end }}
```

Use cases:
- Fewer shell plugins on Steam Deck (battery)
- Different Syncthing folders per device
- Skip macOS-specific configs

---

## FIRST CLAUDE CODE SESSION ON STEAM DECK

Tell Claude:

> "I'm on my Steam Deck. Read `~/.local/share/chezmoi/docs/STEAM_DECK_SETUP.md`
> and `~/.local/share/chezmoi/docs/BAZZITE_BOOTSTRAP.md` for context.
> My companion Bazzite machine syncs with this device via Syncthing.
> Help me [your task]."

---

## QUICK REFERENCE

| Task | Command |
|------|---------|
| Enter Desktop Mode | Steam -> Power -> Switch to Desktop |
| Enter dev container | `distrobox enter dev` |
| Run Claude Code | `claude` (in distrobox or if exported) |
| Edit dotfile | `chezmoi edit <file>` |
| Apply changes | `chezmoi apply` |
| Sync now | Syncthing web UI -> Rescan |
| Backup Decky | `tar -czvf ~/decky-backup.tar.gz ~/homebrew/` |
| Battery status | `cat /sys/class/power_supply/BAT1/capacity` |
| Stop Syncthing | `systemctl --user stop syncthing` |

---

## RELATED DOCS

- `EMULATION_SETUP.md` - Comprehensive EmuDeck setup and emulation guide
- `BAZZITE_BOOTSTRAP.md` - Bazzite machine setup
- `QUICKSTART_NEW_MACHINE.md` - General bootstrap guide
- `CLAUDE_CODE_AGENTS_SKILLS.md` - Agent system reference

---

## SOURCES

- [Distrobox Steam Deck Guide](https://distrobox.it/posts/steamdeck_guide/)
- [Steam Deck SSH Setup](https://gist.github.com/andygeorge/eee2825fa6446b629745ea92e862593a)
- [Syncthing Decky Plugin](https://github.com/theCapypara/steamdeck-decky-syncthing)
- [Steam Deck Optimization Guide](https://github.com/denis-g/steam-deck-optimization-guide)
- [Best USB-C Hubs 2025](https://www.pcgamesn.com/best-steam-deck-dock)

---

**Last Updated**: 2025-12-05
**Source**: `github.com/Aristoddle/beppe-system-bootstrap`
