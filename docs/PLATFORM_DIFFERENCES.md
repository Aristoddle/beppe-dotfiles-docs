# Platform-Specific Differences

Comprehensive guide to macOS vs Linux differences in the dotfiles system.

**Last Updated**: December 5, 2025

---

## Quick Reference

| Feature | macOS | Linux (Ubuntu/Debian) |
|---------|-------|----------------------|
| **Package Manager** | Homebrew (`brew`) | apt/nala (`sudo apt`) |
| **chezmoi Install** | `brew install chezmoi` | `sudo apt install chezmoi` |
| **OneDrive** | Native CLI via OneDrive.app | rclone mount |
| **Clipboard** | `pbcopy`/`pbpaste` | `xclip` (aliased) |
| **File Opener** | `open` | `xdg-open` (aliased) |
| **bat binary** | `bat` | `batcat` (aliased to `bat`) |
| **fd binary** | `fd` | `fdfind` (aliased to `fd`) |
| **Homebrew Path** | `/opt/homebrew` (M1) or `/usr/local` (Intel) | `/home/linuxbrew/.linuxbrew` (optional) |

---

## Environment Variables

### ONEDRIVE_ROOT

**macOS**:
```bash
export ONEDRIVE_ROOT="$HOME/OneDrive"  # Native OneDrive app
```

**Linux**:
```bash
export ONEDRIVE_ROOT="$HOME/onedrive"  # rclone mount point (lowercase)
```

**Detection** (automatic in `00-env.zsh`):
```bash
if [[ "$(uname -s)" == "Darwin" ]]; then
  export ONEDRIVE_ROOT="$HOME/OneDrive"
else
  export ONEDRIVE_ROOT="$HOME/onedrive"
fi
```

### HOMEBREW_PREFIX

**macOS Apple Silicon (M1/M2/M3)**:
```bash
export HOMEBREW_PREFIX="/opt/homebrew"
```

**macOS Intel**:
```bash
export HOMEBREW_PREFIX="/usr/local"
```

**Linux** (if using Homebrew - not recommended):
```bash
export HOMEBREW_PREFIX="/home/linuxbrew/.linuxbrew"
```

---

## Package Management

### Installing Tools

**macOS (Homebrew)**:
```bash
# Install CLI tools
brew install bat eza fd ripgrep fzf zoxide delta dust procs

# Install GUI apps
brew install --cask 1password cursor alacritty

# Install from Brewfile
brew bundle install
```

**Linux (apt/nala)**:
```bash
# Install CLI tools (note package names)
sudo apt install -y bat eza fd-find ripgrep fzf zoxide git-delta dust

# GUI apps must be installed separately
# 1Password: Add repository first (see QUICKSTART_NEW_MACHINE.md)
# Cursor/VSCode: Download .deb from official sites
# Alacritty: sudo apt install alacritty

# No Brewfile equivalent - use packages-debian.txt (future)
```

### Package Naming Differences

| Tool | macOS Package | Linux Package | Notes |
|------|---------------|---------------|-------|
| bat | `bat` | `bat` | Binary is `batcat`, aliased to `bat` |
| fd | `fd` | `fd-find` | Binary is `fdfind`, aliased to `fd` |
| eza | `eza` | `eza` | Same on both |
| ripgrep | `ripgrep` | `ripgrep` | Binary is `rg` on both |
| delta | `git-delta` | `git-delta` | Binary is `delta` on both |
| dust | `dust` | `dust` | Same on both |
| fzf | `fzf` | `fzf` | Same on both |
| zoxide | `zoxide` | `zoxide` | Same on both |

---

## OneDrive Integration

### macOS: Native OneDrive CLI

**Status**: Fully functional via OneDrive.app

**Features**:
- Files On-Demand (cloud-only storage)
- Native CLI: `/Applications/OneDrive.app/Contents/MacOS/OneDrive`
- Touch ID authentication
- Automatic sync

**Usage**:
```bash
# Check file status
onedrive-status ~/OneDrive/Documents/file.pdf

# Download file/folder
onedrive-download ~/OneDrive/Photos/
onedrive-download -r ~/OneDrive/Photos/Vacation

# Free up space (make cloud-only)
onedrive-free-space ~/OneDrive/Archive/
onedrive-free-space -r ~/OneDrive/Comics/Completed/

# Archive manga series
onedrive-manga-archive ~/OneDrive/Comics/"One Piece"
```

### Linux: rclone Alternative

**Status**: Requires rclone setup (manual)

**Installation**:
```bash
# Install rclone
sudo apt install -y rclone

# Configure OneDrive
rclone config
# Follow prompts to add Microsoft OneDrive

# Create mount point
mkdir -p ~/onedrive

# Mount OneDrive (foreground)
rclone mount onedrive: ~/onedrive --vfs-cache-mode writes

# Mount OneDrive (background, recommended)
rclone mount onedrive: ~/onedrive --vfs-cache-mode writes --daemon
```

**Limitations**:
- No native Files On-Demand support
- `onedrive-*` functions will show error with rclone instructions
- Must manually manage sync/cache
- No Touch ID authentication

**Workaround**:
```bash
# Access OneDrive files via mount
cd ~/onedrive
ls -la

# Copy files for offline use
cp ~/onedrive/file.pdf ~/Downloads/

# Changes sync automatically when mounted
```

**See**: https://rclone.org/onedrive/ for full rclone documentation

---

## Clipboard Operations

### macOS: Native pbcopy/pbpaste

```bash
# Copy to clipboard
echo "Hello" | pbcopy
cat file.txt | pbcopy

# Paste from clipboard
pbpaste
pbpaste > file.txt
```

### Linux: xclip (aliased)

**Installation**:
```bash
sudo apt install -y xclip
```

**Usage** (same commands via aliases):
```bash
# Copy to clipboard (alias pbcopy='xclip -selection clipboard')
echo "Hello" | pbcopy
cat file.txt | pbcopy

# Paste from clipboard (alias pbpaste='xclip -selection clipboard -o')
pbpaste
pbpaste > file.txt
```

**Aliases configured automatically in** `private_dot_config/zsh/os/linux.zsh`

---

## File Opening

### macOS: native `open` command

```bash
# Open file with default app
open document.pdf

# Open URL in browser
open https://google.com

# Open current directory in Finder
open .

# Open with specific app
open -a Safari https://google.com
```

### Linux: xdg-open (aliased to `open`)

**Installation**:
```bash
sudo apt install -y xdg-utils
```

**Usage** (same commands via alias):
```bash
# Open file with default app (alias open='xdg-open')
open document.pdf

# Open URL in browser
open https://google.com

# Open current directory in file manager
open .

# Note: No -a flag for specific apps
# Use direct command instead: firefox https://google.com
```

**Alias configured automatically in** `private_dot_config/zsh/os/linux.zsh`

---

## System Customization

### macOS: defaults and system settings

**Customizations Applied**:
- 600+ macOS settings via `run_once_macos.sh.tmpl`
- Dock, Finder, keyboard, trackpad settings
- Terminal.app font configuration (Nerd Font)
- Alfred workflow dependencies

**Script Location**: `run_once_macos.sh.tmpl`

### Linux: No system customization script

**Not Applied**:
- No equivalent `run_once_linux.sh` script
- Manual system configuration required
- GNOME/KDE settings must be configured separately

**Future Enhancement**: Could add `run_once_linux.sh.tmpl` for:
- GNOME settings via `gsettings`
- Terminal emulator configuration
- Desktop environment tweaks

---

## Shell Configuration

### OS Detection

**Automatic detection in** `~/.config/zsh/.zshrc`:
```bash
# Load OS-specific configuration
case "$(uname -s)" in
  Darwin)
    [[ -f "$ZDOTDIR/os/darwin.zsh" ]] && source "$ZDOTDIR/os/darwin.zsh"
    ;;
  Linux)
    [[ -f "$ZDOTDIR/os/linux.zsh" ]] && source "$ZDOTDIR/os/linux.zsh"
    ;;
  CYGWIN*|MINGW*|MSYS*)
    [[ -f "$ZDOTDIR/os/wsl.zsh" ]] && source "$ZDOTDIR/os/wsl.zsh"
    ;;
esac
```

### OS-Specific Files

**darwin.zsh** (`private_dot_config/zsh/os/darwin.zsh`):
- Homebrew PATH configuration
- Build flags for Apple Silicon
- macOS aliases (show/hide hidden files, cleanup, flushdns)
- Key bindings for Alacritty
- pbcopy/pbpaste shortcuts

**linux.zsh** (`private_dot_config/zsh/os/linux.zsh`):
- xdg-open alias
- xclip clipboard aliases
- Package name compatibility (batcat→bat, fdfind→fd)

**wsl.zsh** (`private_dot_config/zsh/os/wsl.zsh`):
- Windows interoperability
- WSL-specific PATH adjustments

---

## Font Installation

### macOS: Homebrew Casks

```bash
# Install via Homebrew
brew install --cask font-fira-code-nerd-font
brew install --cask font-meslo-lg-nerd-font
brew install --cask font-hack-nerd-font

# Fonts installed to:
# /Library/Fonts/ (system-wide)
# ~/Library/Fonts/ (user-specific)
```

### Linux: Manual Installation

```bash
# Create fonts directory
mkdir -p ~/.local/share/fonts

# Download and install Nerd Fonts
cd ~/.local/share/fonts

# MesloLGS NF (Powerlevel10k recommended)
curl -fLo "MesloLGS NF Regular.ttf" \
  https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf
curl -fLo "MesloLGS NF Bold.ttf" \
  https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold.ttf

# Or: Use font packages
sudo apt install -y fonts-firacode fonts-hack

# Rebuild font cache
fc-cache -f -v

# Verify installation
fc-list | grep -i "meslo\|fira\|hack"
```

---

## Terminal Emulators

### macOS

**Built-in**:
- Terminal.app (native, auto-configured)
- iTerm2 (popular alternative)

**Third-party**:
- Alacritty (GPU-accelerated, cross-platform)
- Kitty (GPU-accelerated, advanced features)
- WezTerm (GPU-accelerated, Rust-based)

### Linux

**Built-in** (varies by DE):
- GNOME Terminal (GNOME)
- Konsole (KDE)
- XFCE Terminal (XFCE)

**Third-party**:
- Alacritty (recommended, GPU-accelerated)
- Kitty (GPU-accelerated, advanced features)
- WezTerm (GPU-accelerated, Rust-based)
- Terminator (multiple terminals in one window)

**Installation**:
```bash
sudo apt install -y alacritty kitty terminator
```

---

## GUI Applications

### macOS: Homebrew Casks

```bash
# Install GUI apps via Homebrew
brew install --cask 1password cursor visual-studio-code alfred docker
```

### Linux: Multiple Sources

**1Password**:
```bash
# Requires repository setup (see QUICKSTART_NEW_MACHINE.md)
curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
# ... (full installation in QUICKSTART)
sudo apt install -y 1password 1password-cli
```

**Cursor/VSCode**:
```bash
# Download .deb from official sites
# Cursor: https://cursor.sh/
# VSCode: https://code.visualstudio.com/

# Install .deb
sudo dpkg -i cursor.deb
sudo apt install -f  # Fix dependencies
```

**Docker**:
```bash
# Use official Docker repository
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER  # Add user to docker group
```

---

## Known Limitations

### Linux-Specific Limitations

1. **OneDrive**: No native CLI, must use rclone
2. **Brewfile**: Not recommended on Linux, use apt packages
3. **Alfred**: macOS-only (alternatives: Albert, Ulauncher, Rofi)
4. **System Customization**: No equivalent to `run_once_macos.sh`
5. **TouchID**: Not applicable (use fingerprint reader if available)

### macOS-Specific Limitations

1. **apt/nala**: Not available (use Homebrew exclusively)
2. **GNOME/KDE**: Not applicable (macOS native UI)
3. **xclip/xdg-utils**: Not needed (native pbcopy/open)

---

## Testing Platform-Specific Code

### Unit Tests

**Test OS detection**:
```bash
# In tests/integration/cross_platform.bats (future)
@test "OS detection works correctly" {
  if [[ "$(uname -s)" == "Darwin" ]]; then
    [[ -f "$HOME/.config/zsh/os/darwin.zsh" ]]
  else
    [[ -f "$HOME/.config/zsh/os/linux.zsh" ]]
  fi
}
```

### Manual Testing

**macOS**:
```bash
# Test macOS-specific functions
onedrive-status ~/OneDrive/file.txt
echo "test" | pbcopy
open .
brew --version
```

**Linux**:
```bash
# Test Linux aliases
echo "test" | pbcopy  # Should use xclip
open .                # Should use xdg-open
bat --version         # Should work even though binary is batcat
fd --version          # Should work even though binary is fdfind
```

---

## Migration Between Platforms

### macOS → Linux

**What transfers automatically**:
- ✅ Shell configuration (zsh, Oh-My-Zsh, Powerlevel10k)
- ✅ Git config
- ✅ mise runtime configurations
- ✅ SSH keys (if copied manually)
- ✅ Aliases and functions (platform-aware)

**What requires manual setup**:
- ❌ OneDrive (install rclone, configure mount)
- ❌ GUI apps (reinstall via apt/deb packages)
- ❌ Homebrew packages (install equivalent apt packages)
- ❌ System settings (no auto-configuration)

### Linux → macOS

**What transfers automatically**:
- ✅ Shell configuration (zsh, Oh-My-Zsh, Powerlevel10k)
- ✅ Git config
- ✅ mise runtime configurations
- ✅ SSH keys (if copied manually)
- ✅ Aliases and functions (platform-aware)

**What requires manual setup**:
- ❌ OneDrive (install OneDrive.app from App Store)
- ❌ GUI apps (install via Homebrew casks)
- ❌ apt packages (install equivalent brew packages)
- ⚠️ System settings (run `chezmoi apply` again to apply macOS settings)

---

## Future Enhancements

### Planned Improvements

1. **Linux system customization script** (`run_once_linux.sh.tmpl`)
   - GNOME settings via gsettings
   - Terminal emulator configuration
   - Desktop environment tweaks

2. **Unified package list** (`packages-debian.txt`)
   - Equivalent to macOS Brewfile
   - apt/nala package manifest
   - Automated installation script

3. **OneDrive rclone automation**
   - Auto-detect rclone on Linux
   - Provide setup wizard
   - Graceful fallback in `onedrive-*` functions

4. **Cross-platform testing**
   - Automated tests for both platforms
   - CI/CD with GitHub Actions (macOS + Linux runners)
   - Integration tests for platform-specific features

---

## Troubleshooting

### Command not found after platform switch

**Issue**: Tool installed on one platform not available on another

**Solution**:
```bash
# Check which platform you're on
uname -s

# macOS: Install via Homebrew
brew install <package>

# Linux: Install via apt
sudo apt install <package>

# Verify installation
which <command>
```

### Aliases not working

**Issue**: Platform-specific aliases not loaded

**Solution**:
```bash
# Verify OS-specific file is sourced
echo $OSTYPE

# Check if file exists
ls -la ~/.config/zsh/os/

# Reload shell
exec zsh

# Manually source if needed
source ~/.config/zsh/os/darwin.zsh  # macOS
source ~/.config/zsh/os/linux.zsh   # Linux
```

### OneDrive functions fail on Linux

**Issue**: `onedrive-*` functions show errors on Linux

**Expected**: This is intentional behavior

**Solution**:
```bash
# Error message includes rclone instructions
onedrive-status ~/file.txt
# ❌ OneDrive CLI is not available on Linux
#
# Alternative: Use rclone for OneDrive access
#   1. Install: sudo apt install rclone
#   2. Configure: rclone config
#   3. Mount: rclone mount onedrive: ~/onedrive --vfs-cache-mode writes &

# Follow instructions to set up rclone
sudo apt install rclone
rclone config
# ... configure OneDrive

# Mount OneDrive
mkdir -p ~/onedrive
rclone mount onedrive: ~/onedrive --vfs-cache-mode writes --daemon
```

---

## Additional Resources

- **chezmoi Cross-Platform Support**: https://www.chezmoi.io/user-guide/manage-machine-to-machine-differences/
- **rclone OneDrive Setup**: https://rclone.org/onedrive/
- **Homebrew on Linux**: https://docs.brew.sh/Homebrew-on-Linux (not recommended for this setup)
- **xclip Documentation**: `man xclip` or https://github.com/astrand/xclip
- **xdg-utils**: https://www.freedesktop.org/wiki/Software/xdg-utils/

---

**Last Updated**: December 5, 2025
**Platforms Tested**: macOS Sonoma 14.x+, Ubuntu 22.04+, Ubuntu 24.04
**Maintained By**: Aristoddle
