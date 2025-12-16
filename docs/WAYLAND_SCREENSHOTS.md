# Wayland Screenshots on Bazzite/Steam Deck

## The Problem

Wayland's security model prevents applications from capturing the screen directly. Unlike X11 where any app could grab pixels, Wayland requires apps to request permission through **xdg-desktop-portal**.

This means:
- Traditional screenshot tools (Flameshot, Shutter) have issues
- GNOME 41+ blocks direct DBus screenshot access
- Every screenshot request may show a permission dialog

## Recommended Workflow: grim + slurp + Satty

This is the native Wayland approach that works reliably:

```bash
# Take screenshot with area selection, open in Satty for annotation
grim -g "$(slurp)" - | satty --filename -
```

### What Each Tool Does

| Tool | Purpose | Install |
|------|---------|---------|
| **grim** | Captures screenshots on Wayland | `rpm-ostree install grim` |
| **slurp** | Area selection overlay | `rpm-ostree install slurp` |
| **Satty** | Modern annotation editor (GTK4) | Bootstrap installs to `~/.local/bin/` |

### Setting Up a Keyboard Shortcut

GNOME Settings → Keyboard → Custom Shortcuts:

- **Name**: Screenshot + Annotate
- **Command**: `sh -c 'grim -g "$(slurp)" - | satty --filename -'`
- **Key**: `Super+Shift+S` (or your preference)

## Alternative: GNOME Built-in

Press `Print Screen` to use GNOME's native screenshot tool:

| Key | Action |
|-----|--------|
| `Print Screen` | Opens screenshot UI (area/window/screen) |
| `Shift+Print` | Captures full screen immediately |
| `Alt+Print` | Captures current window |

Screenshots save to `~/Pictures/Screenshots/`

## Flameshot on Wayland

Flameshot can work but requires portal permissions. The bootstrap script configures these automatically:

```bash
sudo flatpak override --talk-name=org.freedesktop.portal.Screenshot org.flameshot.Flameshot
sudo flatpak override --talk-name=org.freedesktop.portal.Desktop org.flameshot.Flameshot
sudo flatpak override --talk-name=org.gnome.Shell.Screenshot org.flameshot.Flameshot
```

**Note**: Even with these permissions, Flameshot may have issues on GNOME Wayland. The grim+slurp+Satty workflow is more reliable.

## Tool Comparison

| Tool | Wayland Support | Annotation | Notes |
|------|-----------------|------------|-------|
| **grim+slurp+Satty** | Native | Yes (Satty) | Best for Wayland |
| **GNOME Screenshot** | Native | No | Built-in, always works |
| **Ksnip** | Portal | Yes | Shows dialog each time |
| **Flameshot** | Partial | Yes | Buggy on GNOME Wayland |
| **Gradia** | N/A | Beautify | For adding backgrounds/shadows |

## Satty Features

- Hardware-accelerated (OpenGL)
- Brush, lines, arrows, shapes
- Text annotations
- Blur/pixelate sensitive info
- Crop after capture
- Copy to clipboard or save to file

Configuration: `~/.config/satty/config.toml`

## Steam Deck Game Mode

In Game Mode, use the Steam overlay: `Steam button + R1` to capture screenshots. These are managed by Steam and saved to your Steam screenshots folder.

## Troubleshooting

### "Unable to capture screen"
- Ensure grim/slurp are installed via rpm-ostree (not in distrobox)
- These tools need system-level Wayland access

### Flameshot not working
- Check Flatseal for portal permissions
- Try the grim+slurp+Satty workflow instead

### Satty not found
- Run `./scripts/bazzite-bootstrap.sh flatpaks` to install
- Or manually: download from https://github.com/Satty-org/Satty/releases

---

*Last updated: December 2025*
