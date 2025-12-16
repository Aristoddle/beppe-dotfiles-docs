# Bazzite Tool Stack

This document describes all CLI tools installed by the bootstrap script and where they run.

## Architecture Overview

Bazzite (and other immutable Fedora-based systems) has multiple layers for tool installation:

| Layer | Method | Location | Use For |
|-------|--------|----------|---------|
| **Host (rpm-ostree)** | `rpm-ostree install` | `/usr/bin/` | System tools, TTY/Wayland access |
| **Host (binary)** | Direct download | `~/.local/bin/` | Shell integration tools |
| **Host (mise)** | `mise install` | `~/.local/share/mise/` | Language runtimes & CLI tools |
| **Host (cargo)** | `cargo install` | `~/.cargo/bin/` | Rust CLI tools (shared w/ distrobox) |
| **Distrobox (dnf)** | `distrobox enter -- dnf` | export wrapper | Non-interactive dev tools |

> **Note**: `~/.cargo/bin` is shared between host and distrobox (same home dir).
> Cargo tools installed via distrobox are directly accessible on host without wrappers.

## Host Tools (System Level)

Installed via `rpm-ostree install` - these need system-level access:

### Wayland/Desktop Integration

| Tool | Purpose | Why Host? |
|------|---------|-----------|
| **grim** | Wayland screenshot capture | Needs compositor access |
| **slurp** | Area selection overlay | Needs compositor access |
| **playerctl** | Media player control | MPRIS/D-Bus access |
| **wtype** | Wayland keyboard automation | Compositor access |
| **ulauncher** | Application launcher | Desktop integration |

### Interactive/TTY Tools

These tools need direct TTY access and CANNOT work via distrobox wrapper scripts:

| Tool | Purpose | Why Host? |
|------|---------|-----------|
| **fzf** | Fuzzy finder | TTY access for interactive mode (in base image) |
| **neovim** | Text editor | Terminal UI needs direct TTY |
| **git-delta** | Git diff viewer | Pager needs TTY for scrolling |
| **lynx** | Text web browser | Interactive text UI |
| **tmux** | Terminal multiplexer | Session management needs TTY (in base image) |

> **Critical**: Interactive tools MUST NOT be exported from distrobox. The wrapper
> scripts break TTY access, causing errors like "inappropriate ioctl for device".
> fzf and tmux come with Bazzite base image. Others installed via rpm-ostree.

## Host Tools (Binary Downloads)

Downloaded to `~/.local/bin/` - these need direct shell/system access:

| Tool | Purpose | Why Host? |
|------|---------|-----------|
| **chezmoi** | Dotfile manager | Manages host filesystem directly |
| **atuin** | Shell history sync | Hooks into zsh/bash for history capture |
| **lazygit** | Git TUI | Works better with native git/ssh |

## Distrobox Tools (Exported)

Installed inside Distrobox, exported to host via wrapper scripts.

> **Note**: Only NON-INTERACTIVE tools are exported. Interactive tools (editors, TUIs,
> pagers) break via distrobox wrapper - see "Interactive/TTY Tools" above.

### From DNF (Exported via wrapper)

These use `~/.local/bin/` wrapper scripts that proxy to distrobox:

| Tool | Purpose |
|------|---------|
| **bat** | `cat` with syntax highlighting |
| **fd** | Fast `find` alternative |
| **rg** (ripgrep) | Fast `grep` alternative |
| **zoxide** | Smart `cd` with frecency |
| **pandoc** | Document converter |
| **gh** | GitHub CLI |

### From Cargo (Shared ~/.cargo/bin)

These are installed via distrobox but land in `~/.cargo/bin/` which is shared
with the host. No wrapper needed - direct binary access:

| Tool | Purpose |
|------|---------|
| **eza** | Modern `ls` replacement |
| **sd** | Better `sed` |
| **dust** | Intuitive `du` |
| **hyperfine** | Command benchmarking |
| **xh** | Modern httpie alternative |

### NOT Exported (Interactive - Need Host Install)

These are installed in distrobox for container use but NOT exported:

| Tool | Why Not Exported | Host Alternative |
|------|------------------|------------------|
| **fzf** | TTY access | Use system `/usr/bin/fzf` |
| **neovim** | TUI editor | `rpm-ostree install neovim` |
| **tmux** | Session management | Use system `/usr/bin/tmux` |
| **delta** | Pager needs TTY | `rpm-ostree install git-delta` |
| **lynx** | Interactive TUI | `rpm-ostree install lynx` |
| **yazi** | TUI file manager | Install binary to `~/.local/bin` |
| **dua** | Interactive analyzer | Install binary to `~/.local/bin` |

### From mise (Host: ~/.local/share/mise/)

Mise runs on HOST and manages language runtimes plus some CLI tools.
Not distrobox - these are direct host binaries:

| Tool | Purpose |
|------|---------|
| **jq** | JSON processor |
| **yq** | YAML processor |
| **node** | JavaScript runtime |
| **bun** | Fast JS runtime/bundler |
| **deno** | Secure JS/TS runtime |
| **go** | Go programming language |
| **rust** | Rust programming language |
| **ruby** | Ruby programming language |
| **java** | Java runtime |
| **erlang** | Erlang runtime |
| **elixir** | Elixir language |
| **kotlin** | Kotlin language |
| **scala** | Scala language |
| **lua** | Lua scripting language |
| **dotnet** | .NET runtime |
| **postgres** | PostgreSQL database |
| **sqlite** | SQLite database |

## Screenshot Workflow

**Primary**: Use Flameshot with `Super+Shift+E` (see Flameshot Setup below)

**Shell function**: `screenshot [area|full|quick]` - uses grim+slurp+satty

See: [WAYLAND_SCREENSHOTS.md](./WAYLAND_SCREENSHOTS.md) for full details

## Installation Commands

```bash
# Full bootstrap (all phases)
./scripts/bazzite-bootstrap.sh all

# Individual phases
./scripts/bazzite-bootstrap.sh system    # rpm-ostree packages
./scripts/bazzite-bootstrap.sh host      # chezmoi, atuin, lazygit
./scripts/bazzite-bootstrap.sh distrobox # Create dev container
./scripts/bazzite-bootstrap.sh tools     # DNF tools in distrobox
./scripts/bazzite-bootstrap.sh cargo     # Rust tools in distrobox
./scripts/bazzite-bootstrap.sh mise      # Language runtimes
./scripts/bazzite-bootstrap.sh exports   # Export tools to host
./scripts/bazzite-bootstrap.sh flatpaks  # GUI apps
./scripts/bazzite-bootstrap.sh fonts     # Nerd Fonts
./scripts/bazzite-bootstrap.sh shell     # Oh-My-Zsh + Powerlevel10k
```

## Flameshot Setup (Wayland)

Flameshot works on Wayland when configured to use grim as the backend.

### Keyboard Shortcut

Bind `Super+Shift+E` to: **Flameshot → Take Screenshot**

In KDE/Plasma:
1. System Settings → Shortcuts → Custom Shortcuts
2. Add new shortcut: `Flameshot::Take Screenshot`
3. Trigger: `Super+Shift+E`
4. Action: `flameshot gui`

Or via command line:
```bash
# Flameshot uses grim internally on Wayland
flatpak run org.flameshot.Flameshot gui
```

### Alternative: grim + slurp + satty

For native Wayland screenshot workflow without Flameshot:
```bash
# Area select + annotate
grim -g "$(slurp)" - | satty --filename -
```

See: [WAYLAND_SCREENSHOTS.md](./WAYLAND_SCREENSHOTS.md)

---

## Development Gotchas

### Distrobox Wrapper Detection

**Problem**: `whence -p` (zsh builtin) only finds actual binaries, not shell script wrappers.

Distrobox exports tools as shell scripts in `~/.local/bin/` that proxy to the container:
```bash
$ file ~/.local/bin/bat
~/.local/bin/bat: POSIX shell script, ASCII text executable

$ whence -p bat
# Returns nothing! (not a binary)

$ command -v bat
/home/deck/.local/bin/bat  # Works!
```

Note: Some tools like `eza` are cargo binaries at `~/.cargo/bin/`, not wrappers.

**Fix**: Always use `command -v` instead of `whence -p` when checking for tools that might be distrobox exports.

**Affected tools**: bat, fd, rg, zoxide, pandoc, gh, and other distrobox wrapper exports.

> **Note**: Not all tools use wrappers:
> - **fzf, nvim, delta, tmux, lynx**: system binaries at `/usr/bin/`
> - **eza, sd, dust, xh**: cargo binaries at `~/.cargo/bin/` (no wrapper)
> - **jq, yq**: mise binaries at `~/.local/share/mise/` (no wrapper)

---

## Troubleshooting

### Tool not found after install

1. Check if it's a distrobox export: `ls -la ~/.local/bin/<tool>`
2. If it's a wrapper script, ensure distrobox is running: `distrobox enter dev`
3. For host tools, verify binary: `file ~/.local/bin/<tool>`
4. **In zsh scripts**: Use `command -v` not `whence -p` (see Development Gotchas above)

### atuin not syncing history

1. Verify installed on host: `which atuin` should show `~/.local/bin/atuin`
2. Initialize: `atuin init zsh` (auto-done by shell config)
3. Login: `atuin login`

### Screenshot tools not working

1. Verify system install: `rpm -q grim slurp`
2. If missing, install: `rpm-ostree install grim slurp --apply-live`
3. May need reboot for full activation

---

*Last updated: December 2025*
