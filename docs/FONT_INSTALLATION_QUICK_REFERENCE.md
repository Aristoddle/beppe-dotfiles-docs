# Font Installation Quick Reference

## TL;DR

Fonts install automatically on new systems. To customize or skip:

```toml
# ~/.config/chezmoi/chezmoi.toml
[font_install]
  skip = true          # Skip automatic installation
  phase = "nerdfonts"  # Or: all, japanese, coding, ui
```

## Common Commands

```bash
# Install all fonts manually
~/.local/share/chezmoi/scripts/install-fonts.sh

# Install only Nerd Fonts (terminal fonts)
~/.local/share/chezmoi/scripts/install-fonts.sh nerdfonts

# Force reinstall on existing system
chezmoi apply --force

# Check installed fonts (Linux)
fc-list | grep -i firacode

# Check installed fonts (macOS)
system_profiler SPFontsDataType | grep -i firacode
```

## Behavior Matrix

| Scenario | Behavior | How to Change |
|----------|----------|---------------|
| **New system** | Fonts install automatically on first `chezmoi apply` | Add `font_install.skip = true` to config |
| **Existing system** | Fonts install when `FONT_VERSION_HASH` changes | Edit `run_onchange_after_install-fonts.sh.tmpl` |
| **Already installed** | Skips download (idempotent) | Delete fonts to force redownload |
| **Want only terminal fonts** | Set `phase = "nerdfonts"` | Add to `chezmoi.toml` |
| **Disable permanently** | Set `skip = true` | Add to `chezmoi.toml` |

## Font Phases & Sizes

| Phase | Fonts | Size | Use Case |
|-------|-------|------|----------|
| `nerdfonts` | FiraCode, JetBrains Mono, Hack, Meslo, Ubuntu Mono | ~100MB | Terminal with Powerlevel10k |
| `japanese` | Noto Sans CJK | ~40MB | Japanese text support |
| `all` | nerdfonts + japanese | ~140MB | Recommended default |

> Note: `coding` and `ui` phases exist but disabled in `all` - URLs go stale. Nerd Fonts include essential coding fonts.

## Configuration Examples

### Minimal (Terminal Only)

```toml
[font_install]
  phase = "nerdfonts"
```

**Result**: Only Nerd Fonts installed (~100MB)

### Complete (Everything)

```toml
[font_install]
  phase = "all"
```

**Result**: All fonts installed (~240MB, default)

### Opt-In Manual

```toml
[font_install]
  skip = true
```

**Result**: No automatic installation. Run manually:
```bash
~/.local/share/chezmoi/scripts/install-fonts.sh nerdfonts
```

### Custom Per-Machine

**Work laptop** (minimal):
```toml
[font_install]
  phase = "nerdfonts"
```

**Personal machine** (complete):
```toml
[font_install]
  phase = "all"
```

## Troubleshooting

### "Fonts not appearing in terminal"

**macOS**:
1. Restart terminal app
2. Check: `system_profiler SPFontsDataType | grep -i firacode`

**Linux**:
1. Refresh cache: `fc-cache -fv ~/.local/share/fonts`
2. Check: `fc-list | grep -i firacode`
3. Restart terminal

### "Missing dependencies"

**macOS**:
```bash
brew install wget unzip
```

**Debian/Ubuntu**:
```bash
sudo apt install curl unzip fontconfig
```

**Fedora/Bazzite**:
```bash
sudo dnf install curl unzip fontconfig
```

### "Download failed"

1. Check internet connection
2. Wait a few minutes (rate limiting)
3. Run manually: `~/.local/share/chezmoi/scripts/install-fonts.sh nerdfonts`

### "Disk space issues"

Install only what you need:
```toml
[font_install]
  phase = "nerdfonts"  # Only 100MB
```

## Version Management

To trigger reinstallation on all systems:

1. Edit `run_onchange_after_install-fonts.sh.tmpl`
2. Change `FONT_VERSION_HASH`:
   ```bash
   FONT_VERSION_HASH="20241209-02-nerdfonts-japanese-coding-ui"
   #                           ^^ increment this
   ```
3. Commit and push
4. Run `chezmoi apply` on all systems

## Platform-Specific Details

### macOS

- **Directory**: `~/Library/Fonts`
- **Cache**: Automatic (no manual refresh needed)
- **Verification**: `system_profiler SPFontsDataType`

### Linux (Ubuntu/Debian)

- **Directory**: `~/.local/share/fonts`
- **Cache**: `fc-cache -fv ~/.local/share/fonts`
- **Verification**: `fc-list | grep -i font-name`

### Bazzite/Fedora (Steam Deck)

- **Directory**: `~/.local/share/fonts`
- **Cache**: `fc-cache -fv ~/.local/share/fonts`
- **Verification**: `fc-list | grep -i font-name`
- **Note**: Fonts survive system updates (in user directory)

## Terminal Configuration

After font installation, configure your terminal:

### Alacritty

```yaml
# ~/.config/alacritty/alacritty.yml
font:
  normal:
    family: "FiraCode Nerd Font"
  size: 14.0
```

### iTerm2 (macOS)

1. Preferences → Profiles → Text
2. Font: FiraCode Nerd Font Mono
3. Size: 14

### GNOME Terminal

1. Preferences → Profiles → [Your Profile]
2. Custom font: FiraCode Nerd Font Mono 14

### Kitty

```conf
# ~/.config/kitty/kitty.conf
font_family FiraCode Nerd Font
font_size 14.0
```

## Resources

- **Full Documentation**: `docs/FONT_MANAGEMENT.md`
- **Script Source**: `scripts/install-fonts.sh`
- **Chezmoi Hook**: `run_onchange_after_install-fonts.sh.tmpl`
- **Nerd Fonts**: https://www.nerdfonts.com/
