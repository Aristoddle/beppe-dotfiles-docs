# Font Management with Chezmoi

This guide explains how fonts are managed in this dotfiles setup using chezmoi.

## Overview

Fonts are installed via a cross-platform script (`scripts/install-fonts.sh`) that is automatically triggered by chezmoi on new systems. The system supports:

- **Automatic installation** on new machines
- **Version-controlled font lists** with hash-based change detection
- **Optional installation** (can be skipped if desired)
- **Phase-based installation** (install only what you need)
- **Idempotent operation** (safe to run multiple times)

## Architecture

### Components

1. **`scripts/install-fonts.sh`** - Standalone font installation script
   - Cross-platform (macOS, Linux, Bazzite/Fedora)
   - Supports phases: `all`, `nerdfonts`, `japanese`, `coding`, `ui`
   - Idempotent (checks before downloading)
   - Can be run manually anytime

2. **`run_onchange_after_install-fonts.sh.tmpl`** - Chezmoi integration hook
   - Runs automatically on `chezmoi apply`
   - Reruns when font version hash changes
   - Can be skipped via configuration
   - Uses `run_onchange_` to detect changes

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ chezmoi apply                                                │
│                                                              │
│ 1. Template rendering (run_onchange_after_install-fonts)    │
│ 2. Check FONT_VERSION_HASH                                  │
│ 3. If changed OR first run → Execute script                 │
│ 4. Call scripts/install-fonts.sh [phase]                    │
│ 5. Download fonts (skip if exist)                           │
│ 6. Refresh font cache                                       │
│ 7. Mark state as complete                                   │
└─────────────────────────────────────────────────────────────┘
```

### Font Directory Structure

Fonts are installed to platform-specific directories:

| Platform | Directory |
|----------|-----------|
| macOS | `~/Library/Fonts` |
| Linux | `~/.local/share/fonts` |
| Bazzite/Fedora | `~/.local/share/fonts` |

## Configuration

### Chezmoi Configuration

Add to `~/.config/chezmoi/chezmoi.toml`:

```toml
[font_install]
  # Skip automatic font installation (default: false)
  skip = false

  # Font installation phase (default: "all")
  # Options: all, nerdfonts, japanese, coding, ui
  phase = "all"
```

### Version Management

The font version is controlled by `FONT_VERSION_HASH` in `run_onchange_after_install-fonts.sh.tmpl`:

```bash
# Change this to trigger font reinstallation on all systems
FONT_VERSION_HASH="20241209-01-nerdfonts-japanese-coding-ui"
```

When you change this value, chezmoi will rerun the font installation on all systems.

## Usage

### Automatic Installation (Default)

On a new system, fonts are installed automatically:

```bash
chezmoi init --apply https://github.com/youruser/dotfiles.git
# Fonts are downloaded and installed automatically
```

### Skip Automatic Installation

To skip automatic installation, add to `chezmoi.toml`:

```toml
[font_install]
  skip = true
```

Then install manually when desired:

```bash
~/.local/share/chezmoi/scripts/install-fonts.sh
```

### Manual Installation

Run the script directly with optional phase:

```bash
# Install all fonts
~/.local/share/chezmoi/scripts/install-fonts.sh all

# Install only Nerd Fonts
~/.local/share/chezmoi/scripts/install-fonts.sh nerdfonts

# Install only Japanese fonts
~/.local/share/chezmoi/scripts/install-fonts.sh japanese

# Install only coding fonts
~/.local/share/chezmoi/scripts/install-fonts.sh coding

# Install only UI fonts
~/.local/share/chezmoi/scripts/install-fonts.sh ui
```

### Force Reinstallation

To force fonts to reinstall on all systems:

1. Update `FONT_VERSION_HASH` in `run_onchange_after_install-fonts.sh.tmpl`
2. Run `chezmoi apply`

Or force a single system:

```bash
chezmoi apply --force
```

## Font Phases

### `nerdfonts` - Developer Fonts with Icons

Essential fonts for terminal use with Powerlevel10k and other tools:

- **FiraCode Nerd Font** - Most popular programming font
- **JetBrains Mono Nerd Font** - JetBrains IDE default
- **Hack Nerd Font** - Clean, legible monospace
- **Meslo Nerd Font** - Menlo variant (Apple default)
- **Ubuntu Mono Nerd Font** - Ubuntu terminal default

These fonts include:
- All standard programming ligatures
- Powerline symbols
- Font Awesome icons
- Material Design icons
- Weather icons
- Devicons

**Size**: ~100MB total

### `japanese` - Japanese Text Support

Google Noto fonts with comprehensive CJK support:

- **Noto Sans CJK** - Sans-serif Japanese/Chinese/Korean

**Size**: ~40MB total

### `coding` - Additional Programming Fonts

Extra coding fonts beyond Nerd Fonts:

- **Cascadia Code** - Microsoft's modern terminal font
- **Victor Mono** - Cursive italics for code
- **Iosevka** - Highly customizable narrow font

**Size**: ~50MB total

### `ui` - Modern UI Fonts

System/UI fonts for better aesthetics:

- **Inter** - Modern UI font (GitHub, Figma, etc.)
- **Source Sans Pro** - Adobe's open-source UI font

**Size**: ~20MB total

### `all` - Everything

Installs all of the above phases.

**Total size**: ~240MB

## Troubleshooting

### Fonts Not Appearing After Installation

**macOS**: Restart your terminal application

**Linux**:
1. Check font cache: `fc-cache -fv ~/.local/share/fonts`
2. Verify installation: `fc-list | grep -i firacode`
3. Restart terminal

### Missing Dependencies

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

**Arch**:
```bash
sudo pacman -S curl unzip fontconfig
```

### Download Failures

If downloads fail (network issues, rate limiting):

1. Wait a few minutes
2. Run manually: `~/.local/share/chezmoi/scripts/install-fonts.sh nerdfonts`
3. The script is idempotent - it will skip already-downloaded fonts

### Disk Space Issues

If disk space is limited, install only what you need:

```toml
[font_install]
  phase = "nerdfonts"  # Only essential terminal fonts (~100MB)
```

## Examples

### Minimal Setup (Terminal Only)

```toml
# ~/.config/chezmoi/chezmoi.toml
[font_install]
  phase = "nerdfonts"
```

### Developer Setup (Terminal + Japanese)

```toml
# ~/.config/chezmoi/chezmoi.toml
[font_install]
  phase = "all"
```

### Opt-In Manual Installation

```toml
# ~/.config/chezmoi/chezmoi.toml
[font_install]
  skip = true
```

Then run manually:
```bash
~/.local/share/chezmoi/scripts/install-fonts.sh nerdfonts
```

## Adding New Fonts

To add new fonts to the installation script:

1. Edit `scripts/install-fonts.sh`
2. Add font to appropriate phase function:
   ```bash
   install_nerdfonts() {
     # ... existing fonts ...

     # Add new font
     download_font_archive "${base_url}/NewFont.zip" "NewFont" "*.ttf"
   }
   ```
3. Update `FONT_VERSION_HASH` in `run_onchange_after_install-fonts.sh.tmpl`
4. Commit and apply:
   ```bash
   git add scripts/install-fonts.sh run_onchange_after_install-fonts.sh.tmpl
   git commit -m "feat(fonts): add NewFont to nerdfonts phase"
   chezmoi apply
   ```

## Design Decisions

### Why Standalone Script + Chezmoi Hook?

**Standalone script** (`scripts/install-fonts.sh`):
- Can be run independently without chezmoi
- Easier to test and debug
- Can be called from other tools (Makefile, CI/CD)
- Users can run manually with custom phases

**Chezmoi hook** (`run_onchange_after_install-fonts.sh.tmpl`):
- Automatic installation on new systems
- Version-controlled via hash
- Optional (can be disabled)
- Integrates with chezmoi workflow

### Why `run_onchange_` Instead of `run_once_`?

`run_onchange_` is better because:
- Reruns when font list changes (via hash)
- Existing systems get new fonts automatically
- New systems get fonts on first run
- Users can force rerun with `--force`

`run_once_` would only run on first installation, requiring manual intervention for updates.

### Why Not Manage Fonts Directly in Chezmoi?

Fonts are **binary files** and **large** (240MB total). Storing them in the git repo would:
- Bloat repository size
- Slow down `git clone`
- Hit GitHub size limits
- Waste bandwidth

Instead, we:
- Download fonts on-demand
- Cache them locally
- Only download missing fonts (idempotent)
- Version the font *list*, not the files

## References

- [Nerd Fonts](https://www.nerdfonts.com/) - Patched fonts with icons
- [Google Noto Fonts](https://fonts.google.com/noto) - Multilingual font family
- [Cascadia Code](https://github.com/microsoft/cascadia-code) - Microsoft terminal font
- [Chezmoi Run Scripts](https://www.chezmoi.io/user-guide/use-scripts-to-perform-actions/#understand-how-scripts-are-used) - Official documentation
