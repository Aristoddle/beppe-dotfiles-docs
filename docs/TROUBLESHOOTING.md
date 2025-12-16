# Troubleshooting Guide

Common issues and their solutions for the dotfiles setup.

## Table of Contents

1. [Shell Issues](#shell-issues)
2. [Powerlevel10k Issues](#powerlevel10k-issues)
3. [chezmoi Issues](#chezmoi-issues)
4. [1Password Issues](#1password-issues)
5. [Tool Issues](#tool-issues)
6. [Platform-Specific Issues](#platform-specific-issues)

---

## Shell Issues

### Shell starts with errors

**Symptom**: Error messages when opening a new terminal.

**Diagnosis**:
```bash
# Check zsh syntax
zsh -n ~/.zshrc

# Verbose loading
zsh -xv
```

**Common Causes**:

1. **Missing source file**:
   ```bash
   # Error: No such file or directory
   # Fix: Check file exists
   ls -la ~/.config/zsh/config/*.zsh
   ```

2. **Syntax error in config**:
   ```bash
   # Fix: Check recent changes
   chezmoi diff

   # Revert if needed
   chezmoi apply --force
   ```

3. **Plugin initialization failed**:
   ```bash
   # Comment out plugins one by one in:
   # ~/.config/zsh/config/20-plugins.zsh
   ```

### Slow shell startup

**Symptom**: Shell takes > 1 second to load.

**Diagnosis**:
```bash
# Profile startup time
time zsh -i -c exit

# Detailed profiling
zsh -xv 2>&1 | ts -i '%.s'
```

**Solutions**:

1. **Disable instant prompt temporarily**:
   ```bash
   # Comment out in ~/.config/zsh/config/40-prompt.zsh
   # if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
   #   source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
   # fi
   ```

2. **Check Oh-My-Zsh plugins**:
   ```bash
   # Reduce plugins in ~/.config/zsh/config/10-omz.zsh
   plugins=()  # Start with empty
   ```

3. **Profile each source**:
   ```bash
   # Add timing to .zshrc
   for file in ~/.config/zsh/config/*.zsh; do
     time source "$file"
   done
   ```

### Commands not found

**Symptom**: Installed tools not available (`command not found`).

**Diagnosis**:
```bash
# Check PATH
echo $PATH

# Check where command should be
which -a bat eza fd
```

**Solutions**:

1. **Cargo tools not in PATH**:
   ```bash
   # Verify in ~/.config/zsh/config/00-environment.zsh:
   export PATH="$HOME/.cargo/bin:$PATH"

   # Reload
   source ~/.zshrc
   ```

2. **Homebrew not in PATH**:
   ```bash
   # Add to ~/.config/zsh/os/darwin.zsh:
   export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:${PATH}"
   ```

3. **mise shims not in PATH**:
   ```bash
   # Verify in ~/.config/zsh/config/00-environment.zsh:
   export PATH="$HOME/.local/share/mise/shims:$PATH"

   # Or re-activate
   eval "$($HOME/.local/bin/mise activate zsh)"
   ```

---

## Powerlevel10k Issues

### Prompt shows weird characters

**Symptom**: Prompt displays `?` or broken symbols.

**Cause**: Nerd Font not installed or not configured in terminal.

**Solution**:

1. **Install Nerd Font**:
   ```bash
   # macOS
   brew install --cask font-meslo-lg-nerd-font

   # Linux
   mkdir -p ~/.local/share/fonts
   cd ~/.local/share/fonts
   curl -fLo "MesloLGS NF Regular.ttf" \
     https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf
   fc-cache -f -v
   ```

2. **Configure Terminal**:
   - **Alacritty**: Edit `~/.config/alacritty/alacritty.yml`:
     ```yaml
     font:
       normal:
         family: "MesloLGS NF"
     ```
   - **iTerm2**: Preferences → Profiles → Text → Font → MesloLGS NF
   - **Windows Terminal**: Settings → Profile → Appearance → Font → MesloLGS NF
   - **macOS Terminal.app**: Automatically configured via `run_once_macos.sh.tmpl`

### macOS Terminal.app shows broken glyphs

**Symptom**: Powerlevel10k works in Alacritty but shows `?` or broken symbols in macOS Terminal.app.

**Cause**: Terminal.app not configured to use a Nerd Font.

**Solution**:

1. **Automatic (Recommended)**:
   The `run_once_macos.sh.tmpl` script automatically configures Terminal.app with FiraCode Nerd Font Mono during initial setup.

2. **Manual Fix**:
   ```bash
   # Set font via AppleScript
   osascript <<EOF
   tell application "Terminal"
       tell settings set "Clear Dark"
           set font name to "FiraCode Nerd Font Mono"
           set font size to 14
       end tell
       set default settings to settings set "Clear Dark"
   end tell
   EOF

   # Quit and reopen Terminal.app
   # Press ⌘Q to quit, then reopen
   ```

3. **Verify Font**:
   ```bash
   # Check current font setting
   osascript -e 'tell application "Terminal" to tell settings set "Clear Dark" to get font name'
   # Should return: FiraCodeNFM-Reg (FiraCode Nerd Font Mono)
   ```

4. **Alternative Fonts**:
   If FiraCode Nerd Font isn't installed, use MesloLGS NF (Powerlevel10k's recommended font):
   ```bash
   # Install MesloLGS NF
   brew install --cask font-meslo-for-powerlevel10k

   # Configure Terminal.app
   osascript <<EOF
   tell application "Terminal"
       tell settings set "Clear Dark"
           set font name to "MesloLGS NF"
           set font size to 14
       end tell
   end tell
   EOF
   ```

**Note**: Changes take effect after quitting and reopening Terminal.app (⌘Q → reopen).

### Prompt configuration wizard won't start

**Symptom**: `p10k configure` does nothing or errors.

**Solution**:
```bash
# Remove old config
rm ~/.p10k.zsh
rm -rf ~/.cache/p10k*

# Remove Powerlevel10k
rm -rf ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# Reinstall
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# Restart shell
exec zsh

# Should auto-start wizard, or manually run:
p10k configure
```

### Instant prompt warnings

**Symptom**: Warning about console output during instant prompt.

**Solution**:
```bash
# Identify culprit by checking:
cat ~/.cache/p10k-instant-prompt-*.zsh.log

# Move slow initializations after instant prompt
# In ~/.config/zsh/config/40-prompt.zsh, ensure instant prompt loads FIRST
```

---

## chezmoi Issues

### `chezmoi apply` fails

**Symptom**: Error when applying dotfiles.

**Diagnosis**:
```bash
# Dry run to see what would change
chezmoi apply --dry-run --verbose

# Check diff
chezmoi diff

# Verify chezmoi state
chezmoi verify
```

**Solutions**:

1. **File conflicts**:
   ```bash
   # See what's different
   chezmoi diff

   # Force apply (CAUTION: overwrites local changes)
   chezmoi apply --force
   ```

2. **Permission errors**:
   ```bash
   # Check file permissions
   ls -la $(chezmoi source-path)

   # Fix if needed
   chmod 644 $(chezmoi source-path)/private_dot_config/zsh/.zshrc
   ```

3. **Template errors**:
   ```bash
   # Check template syntax
   chezmoi execute-template < ~/.local/share/chezmoi/template.tmpl
   ```

### Can't push to GitHub

**Symptom**: `git push` fails from chezmoi directory.

**Solution**:
```bash
cd $(chezmoi source-path)

# Check remote
git remote -v

# Add remote if missing
git remote add origin https://github.com/YOUR_USERNAME/beppe-system-bootstrap.git

# Set upstream
git branch -M main
git push -u origin main
```

### `chezmoi update` fails

**Symptom**: Can't pull latest changes.

**Solution**:
```bash
cd $(chezmoi source-path)

# Check Git status
git status

# Pull manually
git pull

# Then apply
chezmoi apply
```

---

## 1Password Issues

### Can't sign in

**Symptom**: `op signin` fails or hangs indefinitely.

**CRITICAL**: The 1Password CLI **REQUIRES** the 1Password desktop app to be installed and unlocked. The CLI alone is not sufficient.

**Root Cause**: Without the desktop app, `op signin` hangs waiting for desktop integration that never arrives. Biometric prompts (Touch ID) cannot appear without the app.

**Solutions**:

1. **Install 1Password Desktop App** (REQUIRED):
   ```bash
   # macOS: Install from Mac App Store or:
   brew install --cask 1password

   # Linux: Download from https://1password.com/downloads
   # WSL: Install 1Password for Windows + enable WSL integration

   # Verify installation (macOS):
   open -a "1Password"  # Should launch app

   # Verify installation (Linux):
   1password --version  # Should show desktop app version
   ```

2. **Unlock Desktop App First**:
   ```bash
   # macOS: Open and unlock with Touch ID
   open -a "1Password"
   # Wait for unlock prompt, authenticate

   # Then retry CLI signin
   op signin
   ```

3. **Account not configured**:
   ```bash
   # List accounts
   op account list

   # Add account if missing (requires secret key)
   op account add --address my.1password.com --email your@email.com
   ```

4. **Session expired**:
   ```bash
   # Sessions last 10 min (idle) or 12 hours (max)
   # Just sign in again (with desktop app unlocked)
   op signin
   ```

**Warning Signs**:
- `op signin` hangs with no output → Desktop app missing or locked
- No Touch ID prompt appears → Desktop app not running
- Error "desktop app integration failed" → Desktop app needs to be opened

### Plugins won't initialize

**Symptom**: `op plugin init gh` fails.

**Cause**: Requires interactive selection, can't be automated.

**Solution**:
```bash
# Must run interactively
op signin          # First
op plugin init gh  # Then select credential from list

# Verify
op plugin list
```

### Commands still prompt for password

**Symptom**: `gh` or `docker` still ask for credentials.

**Solution**:
```bash
# Check plugin configured
op plugin list | grep gh

# Re-init if missing
op plugin init gh

# Verify plugin is used
op plugin run -- gh auth status
```

---

## Tool Issues

### Cargo tools not working after install

**Symptom**: `bat`, `eza`, etc. not found.

**Solution**:
```bash
# Check cargo bin in PATH
echo $PATH | grep cargo

# Add to ~/.config/zsh/config/00-environment.zsh if missing:
export PATH="$HOME/.cargo/bin:$PATH"

# Reload
source ~/.zshrc

# Verify
which bat eza fd
```

### mise "missing shims" warning

**Symptom**: `mise doctor` shows missing shims for bat, eza, fd, etc.

**Cause**: These are cargo-managed tools, NOT mise-managed.

**Solution**: **Ignore this warning**. It's expected behavior.

```bash
# mise can only shim tools it installs
# Cargo tools are managed via PATH, not mise shims
```

### fzf not working with Ctrl+R

**Symptom**: Ctrl+R doesn't trigger fuzzy history search.

**Solution**:
```bash
# If using Atuin (default in this setup), Ctrl+R is handled by Atuin
# To verify:
bindkey | grep '\^R'

# Should show:
# "^R" atuin-search

# If you want native fzf instead, comment out Atuin in:
# ~/.config/zsh/config/20-plugins.zsh
```

### tmux not preserving environment

**Symptom**: Environment variables lost in tmux sessions.

**Solution**:
```bash
# Add to ~/.tmux.conf:
set-option -g update-environment "DISPLAY SSH_ASKPASS SSH_AUTH_SOCK SSH_AGENT_PID SSH_CONNECTION WINDOWID XAUTHORITY"

# Or source ~/.zshrc in tmux.conf:
set-option -g default-shell /bin/zsh
```

---

## Platform-Specific Issues

### macOS: Homebrew commands not found

**Solution**:
```bash
# Ensure Homebrew in PATH (darwin.zsh)
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:${PATH}"

# If on Intel Mac:
export PATH="/usr/local/bin:/usr/local/sbin:${PATH}"

# Reload
source ~/.zshrc
```

### macOS: Key bindings don't work in Alacritty

**Symptom**: Home/End keys don't work.

**Solution**: Verify in `~/.config/zsh/os/darwin.zsh`:
```bash
bindkey "\e[H" beginning-of-line
bindkey "\e[F" end-of-line
```

### Linux: bat/fd commands not found

**Symptom**: `bat: command not found` or `fd: command not found` after installation

**Cause**: Ubuntu/Debian rename these commands to avoid conflicts
- `bat` → `batcat`
- `fd` → `fdfind`

**Solution**: Aliases are configured automatically, but verify:
```bash
# Check if aliases exist
type bat
type fd

# Should show:
# bat is an alias for batcat
# fd is an alias for fdfind

# If missing, add to ~/.config/zsh/os/linux.zsh:
alias bat='batcat'
alias fd='fdfind'

# Reload
source ~/.zshrc
```

### Linux: OneDrive functions fail

**Symptom**: `onedrive-status` and other OneDrive functions show errors

**Cause**: OneDrive CLI is macOS-only

**Solution**: Use rclone alternative
```bash
# Install rclone
sudo apt install -y rclone

# Configure OneDrive
rclone config
# Follow prompts to add Microsoft OneDrive remote

# Create mount point
mkdir -p ~/onedrive

# Mount OneDrive (background)
rclone mount onedrive: ~/onedrive --vfs-cache-mode writes --daemon

# Verify
ls ~/onedrive

# Add to startup (optional)
echo "rclone mount onedrive: ~/onedrive --vfs-cache-mode writes --daemon" >> ~/.zshrc
```

**See**: `docs/PLATFORM_DIFFERENCES.md` for full OneDrive setup

### Linux: Clipboard commands not working

**Symptom**: `pbcopy` or `pbpaste` not found

**Cause**: These are macOS commands, need xclip on Linux

**Solution**:
```bash
# Install xclip
sudo apt install -y xclip

# Aliases should be configured automatically in linux.zsh
# Verify:
type pbcopy
type pbpaste

# Should show:
# pbcopy is an alias for xclip -selection clipboard
# pbpaste is an alias for xclip -selection clipboard -o

# Test
echo "test" | pbcopy
pbpaste  # Should output: test
```

### Linux: Font rendering issues

**Symptom**: Powerlevel10k icons appear as boxes or question marks

**Solution**:
```bash
# Install Nerd Font
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts

# Download MesloLGS NF (Powerlevel10k recommended)
curl -fLo "MesloLGS NF Regular.ttf" \
  https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf
curl -fLo "MesloLGS NF Bold.ttf" \
  https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold.ttf

# Rebuild font cache
fc-cache -f -v

# Verify installation
fc-list | grep "MesloLGS NF"
# Should show: /home/user/.local/share/fonts/MesloLGS NF Regular.ttf: MesloLGS NF:style=Regular

# Configure terminal to use font (varies by terminal)
# GNOME Terminal: Preferences → Profile → Text → Font
# Alacritty: Edit ~/.config/alacritty/alacritty.yml
```

### Linux: Permission denied for cargo install

**Solution**:
```bash
# Don't use sudo with cargo
# Install to user directory (default: ~/.cargo/bin)
cargo install bat

# If needed, ensure ~/.cargo/bin is writable
chmod 755 ~/.cargo/bin
```

### Linux: 1Password CLI not working

**Symptom**: `op signin` fails or hangs

**Cause**: Desktop app not installed or not running

**Solution**:
```bash
# Verify desktop app is installed
which 1password

# If not installed, follow full installation from QUICKSTART_NEW_MACHINE.md
# Quick version:
curl -sS https://downloads.1password.com/linux/keys/1password.asc | \
  sudo gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
# ... (see QUICKSTART for full steps)

# Launch desktop app
1password &

# Wait for app to start, then sign in
op signin

# Verify
op whoami
```

### Linux: Package not found in apt

**Symptom**: `sudo apt install <package>` fails with "Unable to locate package"

**Solution**:
```bash
# Update package lists first
sudo apt update

# Try alternative package names
# Some packages have different names on Ubuntu/Debian:
# - bat → may need to add universe repository
# - eza → may need PPA or manual install

# Add universe repository (Ubuntu)
sudo add-apt-repository universe
sudo apt update

# For eza (if not in repos):
sudo apt install -y gpg
wget -qO- https://raw.githubusercontent.com/eza-community/eza/main/deb.asc | sudo gpg --dearmor -o /etc/apt/keyrings/gierens.gpg
echo "deb [signed-by=/etc/apt/keyrings/gierens.gpg] http://deb.gierens.de stable main" | sudo tee /etc/apt/sources.list.d/gierens.list
sudo apt update
sudo apt install -y eza
```

### WSL: Can't access Windows files

**Symptom**: Slow or can't access `/mnt/c/`.

**Solution**:
```bash
# Use Windows paths via WSL mount
cd /mnt/c/Users/YourName/

# Or add to ~/.config/zsh/os/wsl.zsh:
export WINHOME="/mnt/c/Users/YourName"
alias cdc='cd $WINHOME'
```

### WSL: 1Password CLI not working

**Cause**: Requires 1Password Desktop app on Windows.

**Solution**:
1. Install 1Password for Windows
2. Enable Windows integration in WSL
3. Or use SSH agent forwarding

---

## Emergency Recovery

### Complete reset (CAUTION)

If everything is broken and you want to start fresh:

```bash
# 1. Backup current config
cp -r ~/.config/zsh ~/.config/zsh.backup.$(date +%Y%m%d)

# 2. Remove chezmoi
rm -rf ~/.local/share/chezmoi

# 3. Remove Oh-My-Zsh
rm -rf ~/.oh-my-zsh

# 4. Remove zsh config
rm -rf ~/.config/zsh
rm ~/.zshrc ~/.zprofile ~/.zshenv

# 5. Restore pre-omz config if available
cp ~/.zshrc.pre-oh-my-zsh ~/.zshrc

# 6. Start fresh setup (see SETUP.md)
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# ... continue with full setup
```

### Restore from backup

```bash
# If you backed up before changes
cp -r ~/.config/zsh.backup.YYYYMMDD ~/.config/zsh

# If using chezmoi git history
cd $(chezmoi source-path)
git log --oneline
git checkout <commit-hash>
chezmoi apply
```

---

## Getting Help

### Check logs

```bash
# Shell startup errors
zsh -xv 2>&1 | tee ~/zsh-debug.log

# chezmoi operations
chezmoi apply --verbose

# 1Password operations
op signin --debug
```

### Gather system info

```bash
cat > ~/system-info.txt << EOF
=== System Information ===
OS: $(uname -a)
Shell: $(zsh --version)
chezmoi: $(chezmoi --version)
1Password: $(op --version)
Homebrew: $(brew --version 2>/dev/null || echo "Not installed")
mise: $(mise --version 2>/dev/null || echo "Not installed")

=== PATH ===
$PATH

=== Installed Tools ===
$(which bat eza fd rga sd delta dust procs zoxide)

=== chezmoi Status ===
$(chezmoi status)
EOF

cat ~/system-info.txt
```

### Report issue

Include in issue report:
1. System information (above)
2. Steps to reproduce
3. Expected vs actual behavior
4. Relevant error messages
5. Recent changes made

---

**Last Updated**: October 29, 2025
