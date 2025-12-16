---
title: Using Bazzite
description: A comprehensive guide to Bazzite, aligned with its design philosophy
tags:
  - bazzite
  - linux
  - immutable
  - gaming
aliases:
  - Bazzite Guide
  - Bazzite Reference
---

# Using Bazzite

A comprehensive guide to using Bazzite effectively, aligned with its design philosophy and intended workflows.

---

## What is Bazzite?

Bazzite is a **gaming-focused, immutable Linux distribution** built as a layered stack:

| Layer | Description |
|-------|-------------|
| **Fedora Silverblue** | Core immutable OS foundation |
| **Universal Blue** | Hardware support, quality-of-life improvements |
| **Bazzite** | Gaming optimizations, Steam, drivers, codecs |
| **Your Customizations** | Flatpaks, Homebrew, Distrobox containers |

Your system is delivered as an **OCI container image** from `ghcr.io/ublue-os/bazzite-gnome:stable`.

> [!info] What This Means
> - Every Bazzite user on the same version has an **identical base system**
> - Updates are **atomic** — all-or-nothing, never partial
> - **Rollback is trivial** — boot the previous image if something breaks
> - The system is **tamper-resistant** — you can't accidentally break core components

### What Makes Bazzite Special

- Pre-installed Steam, Lutris, and gaming tools
- Optimized for Steam Deck and handheld gaming devices
- HDR support, Gamescope integration
- Hardware-accelerated codecs out of the box
- Automatic driver configuration (including NVIDIA)
- First-class Decky Loader support for handhelds

---

## The Philosophy: Why Immutable?

### Traditional Linux Problems

- System state becomes unique over time ("works on my machine")
- Package conflicts accumulate
- Updates can leave system in broken intermediate states
- Difficult to reproduce exact system configurations

### The Immutable Solution

| Aspect | Traditional | Bazzite |
|--------|-------------|---------|
| Root filesystem | Writable | Read-only |
| Updates | In-place modification | Atomic image swap |
| Rollback | Complex/impossible | One command |
| System state | Unique per machine | Identical across users |
| Breakage risk | Cumulative | Near-zero |

> [!tip] The Trade-off
> You install software differently. But the reliability gains are massive.

---

## System Architecture

### Filesystem Layout

**Read-Only (Immutable)**
- `/usr` — System binaries, libraries
- `/bin`, `/sbin`, `/lib` — Core utilities
- `/opt` — Optional packages

**Writable (Persistent)**
- `/home` — Your files
- `/etc` — System configuration (overlayed)
- `/var` — Containers, logs, data
- `~/.config`, `~/.local` — App configs

### Key System Services

| Service | Purpose |
|---------|---------|
| `bazzite-hardware-setup` | Detects hardware, sets kernel args |
| `bazzite-user-setup` | Per-user initialization on first login |
| `bazzite-flatpak-manager` | Manages system Flatpaks, Flathub setup |
| `ublue-os-media-automount` | Auto-mounts labeled partitions |

---

## The Software Installation Hierarchy

> [!warning] This is the Most Important Section
> Bazzite has a clear preference order for installing software. Following this hierarchy keeps your system healthy and easy to maintain.

### 1. Flatpak — Preferred for GUI Apps

```bash
flatpak search <app>           # Find apps
flatpak install flathub <app>  # Install
flatpak update                 # Update all
flatpak uninstall <app>        # Remove
```

**Why first?**
- Sandboxed and isolated from the system
- Auto-updates independently
- Huge catalog on Flathub
- No reboot required

**Good for:** Browsers, media players, office apps, development IDEs, games

**Manage permissions:** Use **Flatseal** to adjust app sandbox permissions.

### 2. Distrobox — Preferred for CLI Tools & Dev Environments

> [!note] User Preference
> This user prefers **NOT to use Homebrew**. Use Distrobox with Fedora-based containers instead.

```bash
# Create Fedora-based container (ABI-compatible with host)
distrobox create --name dev --image ghcr.io/ublue-os/fedora-toolbox:latest

# Enter and install tools normally
distrobox enter dev
sudo dnf install -y bat fd-find ripgrep zoxide fzf

# Export tools to host (transparent usage from host shell)
distrobox-export --bin /usr/bin/bat --export-path ~/.local/bin
```

**Why Fedora-based (not Ubuntu)?**
- Same C library (glibc) and ABI as host
- No library version mismatches
- Tools work identically to native installation
- Same approach works on SteamOS (where rpm-ostree unavailable)

**Why second (ahead of Homebrew)?**
- Native package manager (dnf) has better package coverage
- No Homebrew path/symlink issues with /var/home
- Cleaner separation between host and dev tools
- Consistent with immutable OS philosophy

**Good for:** All CLI tools, compilers, dev environments, language runtimes

### 3. Homebrew — Alternative (Not Preferred)

> [!warning] User Preference
> **This user prefers NOT to use Homebrew.** The Distrobox approach above is preferred.

```bash
brew search <package>    # Find packages
brew install <package>   # Install
brew upgrade             # Update all
brew uninstall <package> # Remove
```

Known issues:
- Bazzite's `/home` symlink to `/var/home` is "Tier 2" support
- Can have linking issues
- Adds complexity compared to Distrobox approach

### 4. rpm-ostree — Last Resort

```bash
rpm-ostree install <package>   # Install (requires reboot)
rpm-ostree uninstall <package> # Remove (requires reboot)
rpm-ostree status              # Show deployments
```

> [!caution] Use Sparingly
> - Requires reboot to apply
> - Increases update time
> - Can cause conflicts with base image
> - Makes your system "special" (harder to troubleshoot)

**Appropriate for:** System-level tools needing deep integration (VPN clients, 1Password, etc.)

### Quick Decision Guide

| Need | Solution |
|------|----------|
| GUI application | `flatpak install` |
| CLI tool | `distrobox` + export |
| Language runtimes | `distrobox` (mise, pyenv inside) |
| System-level integration | `rpm-ostree` (last resort) |

> [!tip] 1Password Exception
> Install 1Password via `rpm-ostree` (not Flatpak) for full CLI integration, SSH agent, and browser extension support.

---

## Essential Commands

### Daily Operations

| Command | Description |
|---------|-------------|
| `ujust update` | Update everything (system, flatpaks, brew) |
| `ujust clean-system` | Remove old images, unused flatpaks |
| `rpm-ostree status` | Show current and previous deployments |
| `fastfetch` | Display system information |

### Updates and Rollback

```bash
# Standard update (recommended)
ujust update

# Check pending changes
rpm-ostree status

# Rollback if something broke
rpm-ostree rollback
systemctl reboot

# Pin current deployment (prevent auto-cleanup)
sudo ostree admin pin 0
```

> [!tip] Recovery from Bad Update
> 1. Reboot your system
> 2. In GRUB menu, select the previous deployment
> 3. Once booted, run `rpm-ostree rollback` to make it default

---

## The ujust System

`ujust` provides pre-written scripts for common Bazzite tasks.

> [!note] Always Check ujust First
> Before googling how to do something, run `ujust --choose` — there's probably already a script for it.

```bash
ujust --choose    # Interactive menu (recommended)
ujust <command>   # Run specific command
```

### Core Commands

| Command | Description |
|---------|-------------|
| `ujust update` | Update system, flatpaks, and containers |
| `ujust clean-system` | Clean old images, unused packages |
| `ujust changelogs` | View recent Bazzite changes |
| `ujust get-logs` | Generate debug logs for issue reporting |

### Gaming

| Command | Description |
|---------|-------------|
| `ujust setup-decky` | Install Decky Loader for handhelds |
| `ujust install-decky-plugins` | Install Decky plugins |
| `ujust install-emudeck` | Set up retro game emulators |
| `ujust fix-proton-hang` | Kill frozen Wine/Proton processes |
| `ujust fix-reset-steam` | Reset Steam (preserves games/saves) |
| `ujust setup-sunshine` | Set up game streaming |

### Hardware

| Command | Description |
|---------|-------------|
| `ujust configure-nvidia` | Configure NVIDIA drivers |
| `ujust toggle-nvk` | Switch between NVIDIA/NVK drivers |
| `ujust install-openrazer` | Razer hardware support |
| `ujust install-openrgb` | RGB lighting control |
| `ujust add-user-to-input-group` | Fix controller permissions |

### System

| Command | Description |
|---------|-------------|
| `ujust configure-grub` | Show/hide GRUB menu |
| `ujust regenerate-grub` | Fix dual-boot detection |
| `ujust toggle-ssh` | Enable/disable SSH server |
| `ujust enable-tailscale` | Enable Tailscale VPN |
| `ujust bios` | Reboot into UEFI/BIOS |

### Audio

| Command | Description |
|---------|-------------|
| `ujust setup-virtual-channels` | Create virtual audio sinks for streaming |
| `ujust setup-virtual-surround` | Enable virtual 7.1 surround |
| `ujust restart-pipewire` | Restart audio service |

### Storage

| Command | Description |
|---------|-------------|
| `ujust configure-snapshots` | Enable BTRFS snapshots for /home |
| `ujust enable-deduplication` | Enable storage deduplication |
| `ujust enable-automount-all` | Auto-mount labeled partitions |

### Applications

| Command | Description |
|---------|-------------|
| `ujust setup-waydroid` | Set up Android app support |
| `ujust install-resolve` | Install DaVinci Resolve |
| `ujust setup-virtualization` | Set up KVM/QEMU VMs |

> [!info] Full Reference
> Run `ujust --choose` for the complete list, or explore `/usr/share/ublue-os/just/`

---

## Homebrew Integration (Not Recommended)

> [!warning] User Preference
> **This user prefers the Distrobox approach instead of Homebrew.** See the Distrobox section below for the recommended workflow.

Homebrew is pre-configured at `/home/linuxbrew/.linuxbrew`, but has known issues on Bazzite due to the `/var/home` symlink ("Tier 2" support).

If you must use Homebrew:
```bash
brew search ripgrep      # Search
brew install ripgrep     # Install
brew link --overwrite <formula>  # Fix linking issues
```

---

## Distrobox & Containers (Primary Dev Environment)

Distrobox runs Linux distributions in containers with seamless home directory access. **This is the preferred approach for CLI tools and development.**

### Creating the Dev Container

```bash
# RECOMMENDED: Fedora-based for ABI compatibility with Bazzite host
distrobox create --name dev --image ghcr.io/ublue-os/fedora-toolbox:latest

# Alternative images (use if you have specific needs):
# distrobox create -n ubuntu-box -i ubuntu:24.04  # Ubuntu-specific software
# distrobox create -n arch-box -i archlinux:latest  # AUR packages
```

> [!tip] Why Fedora-based?
> Bazzite is Fedora-based. Using a Fedora container means identical ABI, same glibc version, and no library mismatches. This is especially important for compiled tools.

### Installing and Exporting Tools

```bash
# Enter container
distrobox enter dev

# Install CLI tools (available via dnf)
sudo dnf install -y bat fd-find ripgrep zoxide fzf git-delta pandoc lynx neovim jq gh chezmoi

# Exit and export tools to host
exit
distrobox enter dev -- distrobox-export --bin /usr/bin/bat --export-path ~/.local/bin
distrobox enter dev -- distrobox-export --bin /usr/bin/rg --export-path ~/.local/bin
# etc.
```

### Friction Points Discovered

These issues were encountered during real-world setup:

| Problem | Solution |
|---------|----------|
| Distrobox image pull prompts | Pipe `echo "Y"` or use `--yes` flag |
| `eza` not in Fedora repos | Install via cargo: `cargo install eza` |
| pyenv Python missing sqlite3/tkinter | Install dev libs first: `sudo dnf install sqlite-devel tk-devel` |
| Python 3.12 incompatible with Tcl 9.0 | Use Python 3.13+ (Fedora 42 ships Tcl 9) |

### Complete Bootstrap Script

```bash
# Full dev environment setup
./scripts/bazzite-bootstrap.sh
```

### GUI Management

Use **DistroShelf** (Flatpak) for a graphical container manager.

### When to Use Distrobox

- **ALL CLI tools** (preferred over Homebrew)
- Development environments
- Language runtimes (Node, Go, Rust via mise; Python via pyenv)
- Software only available for specific distros
- Testing without affecting your system

---

## Operating Principles

### The Golden Rules

1. **Don't fight the immutability** — Use the installation hierarchy
2. **Check ujust first** — There's probably a script for what you need
3. **Flatpak for apps, Distrobox for CLI** — Reserve rpm-ostree for essentials
4. **Updates are safe** — Atomic updates mean you can always roll back
5. **Your home directory is yours** — Customize there, not in /usr
6. **Fedora-based containers** — Use Fedora distrobox for ABI compatibility

### Anti-Patterns to Avoid

| Don't | Why | Do Instead |
|-------|-----|------------|
| `sudo dnf install` | Won't work properly | Use hierarchy above |
| Edit files in `/usr` | Won't persist | Use `/etc` overrides |
| Layer many rpm-ostree packages | Slows updates | Flatpak/Distrobox |
| Skip `ujust` for system config | Miss edge cases | Use ujust scripts |
| Ignore Flatpak permissions | Apps are sandboxed | Use Flatseal |

### Configuration Best Practices

**System config overrides:** Place in `/etc/`, not `/usr/etc/`
```bash
ujust check-local-overrides  # See your customizations
```

**Systemd overrides:** Use drop-in directories
```bash
sudo systemctl edit <service>  # Creates override in /etc/
```

**Shell customization:** Use standard dotfiles
- `~/.bashrc` — Bash config
- `~/.zshrc` — Zsh config
- `~/.config/` — App configs

### Regular Maintenance

```bash
# Monthly cleanup
ujust clean-system
```

This removes old podman images, unused flatpak packages, and old rpm-ostree deployments.

---

## Troubleshooting

### System Won't Boot After Update

1. Reboot and select previous deployment from GRUB
2. Once booted: `rpm-ostree rollback && systemctl reboot`
3. Report the issue with `ujust get-logs`

### Game Frozen / Proton Hung

```bash
ujust fix-proton-hang
```

### Steam Broken

```bash
ujust fix-reset-steam  # Preserves games, saves, controller config
```

### Audio Issues

```bash
ujust restart-pipewire
```

### Need Debug Logs

```bash
ujust get-logs  # Creates pastebin links for issue reporting
```

### Check Boot Logs

```bash
ujust logs-this-boot   # Current session
ujust logs-last-boot   # Previous session
```

### Flatpak App Can't Access Files

1. Open **Flatseal**
2. Select the app
3. Add filesystem permissions as needed

---

## Resources & Community

### Official

| Resource | Link |
|----------|------|
| Bazzite Docs | <https://docs.bazzite.gg/> |
| Universal Blue | <https://universal-blue.org/> |
| Bazzite GitHub | <https://github.com/ublue-os/bazzite> |

### Community

| Platform | Link |
|----------|------|
| Discord | <https://discord.bazzite.gg/> |
| Discourse Forums | <https://universal-blue.discourse.group/> |
| Issue Tracker | <https://github.com/ublue-os/bazzite/issues> |

### Learning

| Topic | Link |
|-------|------|
| Flatpak | <https://flatpak.org/setup/> |
| Homebrew | <https://brew.sh/> |
| Distrobox | <https://distrobox.it/> |
| rpm-ostree | <https://coreos.github.io/rpm-ostree/> |
| Fedora Silverblue | <https://docs.fedoraproject.org/en-US/fedora-silverblue/> |

### Local Documentation

Bazzite ships docs locally:
```bash
ls /usr/share/ublue-os/docs/html/       # HTML docs
cat /usr/share/ublue-os/motd/tips/*.md  # Quick tips
cat /usr/share/ublue-os/image-info.json # Image info
```

---

## Quick Reference

### System

| Action | Command |
|--------|---------|
| Update everything | `ujust update` |
| Clean system | `ujust clean-system` |
| All ujust commands | `ujust --choose` |
| System info | `fastfetch` |
| Rollback | `rpm-ostree rollback` |

### Install Software

| Type | Command |
|------|---------|
| GUI app | `flatpak install flathub <app>` |
| CLI tool | `distrobox enter dev` → `sudo dnf install` → `distrobox-export` |
| System-level | `rpm-ostree install <pkg>` (requires reboot) |
| 1Password | `rpm-ostree install 1password 1password-cli` (not Flatpak!) |

### Troubleshooting

| Problem | Command |
|---------|---------|
| Game frozen | `ujust fix-proton-hang` |
| Steam broken | `ujust fix-reset-steam` |
| Audio issues | `ujust restart-pipewire` |
| Get debug logs | `ujust get-logs` |

---

---

## Bazzite Welcome Banner (MOTD)

Preserve this - it's educational:

```
󱋩  bazzite-gnome:stable

  Command                          │ Description
────────────────────────────────────┼───────────────────────────────────
  ujust --choose                    │ List all available commands
  ujust toggle-user-motd            │ Toggle this banner on/off
  fastfetch                         │ View system information
  brew help                         │ Manage command line packages

󰋼 It is always better to install packages with Distrobox rather than layer
them with rpm-ostree.  ujust distrobox  makes it easy!
More info: https://docs.bazzite.gg/Installing_and_Managing_Software/Distrobox/
```

---

## When rpm-ostree IS Appropriate

While "avoid rpm-ostree" is the general guidance, these are **legitimate exceptions**:

| Package | Why rpm-ostree | Why NOT Distrobox/Flatpak |
|---------|----------------|---------------------------|
| **zsh** | Login shell | Must be in /etc/shells, available before session |
| **1Password** | System integration | SSH agent, browser extension, CLI integration |
| **VPN clients** | Network stack | Needs kernel/system network access |
| **Login shells** | Pre-session | Runs before containers are available |

**Check first if it's already there:**
```bash
rpm -q zsh           # Is it installed?
cat /etc/shells      # What shells are available?
```

**Bazzite base shells (as of 43.20251127):**
- bash (default)
- fish (pre-installed!)
- sh
- tmux

**zsh is NOT in the base image** - rpm-ostree is required.

---

## Related Documentation

- Bootstrap script: `~/Documents/Code/dotfiles/beppe-system-bootstrap/scripts/bazzite-bootstrap.sh`
- Continuation notes: `~/Documents/Code/dotfiles/beppe-system-bootstrap/CLAUDE_BAZZITE_CONTINUATION.md`
- Chezmoi config: `~/.config/chezmoi/chezmoi.toml`

---

*Updated: 2025-12-09 | Aligned with lived experience from actual Bazzite bootstrap*
*Original template for Bazzite GNOME 43.20251127 (Fedora Silverblue base)*
