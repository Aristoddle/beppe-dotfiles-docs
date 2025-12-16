# Bazzite Recovery Quick Reference

**For**: Fresh Claude Code agent on new Bazzite system
**Full Guide**: See `RECOVERY_INSTRUCTIONS.md` for detailed steps

---

## Critical Order of Operations

**DO THESE IN ORDER - Dependencies matter!**

### Phase 1: First Boot (15 min)
```bash
# 1. Install base tools
rpm-ostree install git zsh vim curl wget
sudo systemctl reboot

# 2. Change shell
chsh -s $(which zsh)
```

### Phase 2: Dropbox Recovery (30 min)
```bash
# 1. Install rclone
rpm-ostree install rclone
sudo systemctl reboot

# 2. Configure Dropbox
rclone config
# Follow prompts: new remote → dropbox → OAuth

# 3. Download backup
rclone sync Dropbox:Bazzite-Migration-Backup-20251205/ ~/restored-backup/ --progress
```

### Phase 3: Credentials (5 min)
```bash
# CRITICAL: Do this BEFORE git operations

# SSH keys
cp -r ~/restored-backup/credentials/ssh/* ~/.ssh/
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_*
ssh -T git@github.com  # Test

# GPG keys
gpg --import ~/restored-backup/credentials/gpg-keys/private-key.asc

# Environment variables
cp ~/restored-backup/root-configs/.env ~/.env
chmod 600 ~/.env
source ~/.env

# Keyrings
cp ~/restored-backup/credentials/keyrings/* ~/.local/share/keyrings/
```

### Phase 4: Chezmoi (15 min)
```bash
# 1. Install chezmoi
rpm-ostree install chezmoi
sudo systemctl reboot

# 2. Clone dotfiles
git clone git@github.com:Aristoddle/beppe-system-bootstrap.git ~/.local/share/chezmoi

# 3. Initialize and apply
chezmoi init  # Answer prompts
chezmoi apply

# DON'T restart shell yet!
```

### Phase 5: MCP Servers (20 min)
```bash
# 1. Restore Claude config
cp ~/restored-backup/claude-config/.claude.json ~/.claude.json
cp -r ~/restored-backup/claude-config/* ~/.claude/

# 2. Install mise (for Node.js)
curl https://mise.run | sh
export PATH="$HOME/.local/bin:$PATH"
mise install node@latest
mise use --global node@latest

# 3. Install pyenv (for Python/uvx)
curl https://pyenv.run | bash
pyenv install 3.12.0
pyenv global 3.12.0
pip install pipx
pipx ensurepath

# 4. Setup Docker MCP bridge
rpm-ostree install docker
sudo systemctl reboot
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker deck
# Log out and back in
docker run -d --name mcp-bridge --network host --restart unless-stopped \
  alpine/socat TCP-LISTEN:8811,fork,reuseaddr EXEC:/bin/sh
```

### Phase 6: Dev Tools (45 min)
```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 2. Install cargo tools (CRITICAL - takes 15-20 min)
cargo install bat eza fd-find ripgrep sd git-delta du-dust procs zoxide bottom broot duf tldr

# 3. Install Oh-My-Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

# 4. Install Powerlevel10k
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 5. Install Nerd Font
mkdir -p ~/.local/share/fonts
cd ~/.local/share/fonts
for style in Regular Bold Italic "Bold Italic"; do
  curl -fLO "https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20${style}.ttf"
done
fc-cache -f -v

# 6. Install system dev tools
rpm-ostree install htop ncdu tree tmux neovim gh direnv jq fzf
sudo systemctl reboot

# 7. Restore custom scripts
cp -r ~/restored-backup/custom-scripts/* ~/.local/bin/
chmod +x ~/.local/bin/*
```

### Phase 7: Applications (60 min)
```bash
# 1. Flatpak apps (GUI)
flatpak install flathub \
  com.discordapp.Discord \
  org.signal.Signal \
  md.obsidian.Obsidian \
  org.mozilla.Thunderbird \
  org.flameshot.Flameshot \
  com.visualstudio.code

# 2. VS Code (Microsoft repo)
sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
rpm-ostree install code
sudo systemctl reboot

# 3. 1Password (CRITICAL for secrets)
sudo rpm --import https://downloads.1password.com/linux/keys/1password.asc
sudo sh -c 'echo -e "[1password]\nname=1Password\nbaseurl=https://downloads.1password.com/linux/rpm/stable/\$basearch\nenabled=1\ngpgcheck=1\ngpgkey=https://downloads.1password.com/linux/keys/1password.asc" > /etc/yum.repos.d/1password.repo'
rpm-ostree install 1password 1password-cli
sudo systemctl reboot

# Launch 1Password and sign in
op signin
op whoami  # Verify

# 4. Restore Obsidian vault
cp -r ~/restored-backup/Obsidian-Vault ~/Documents/Joes_Default_Vault
```

### Phase 8: GNOME (15 min)
```bash
# Restore GNOME settings
dconf load / < ~/restored-backup/local-backup/gnome-settings.dconf

# Install extension manager
flatpak install flathub com.mattjakeman.ExtensionManager

# Log out and back in
```

### Final Step: Reload Shell
```bash
# NOW you can restart the shell
exec zsh

# Configure Powerlevel10k
p10k configure
```

---

## Verification Commands

```bash
# Shell
echo $SHELL  # /usr/bin/zsh
echo $ZSH_THEME  # powerlevel10k/powerlevel10k

# Tools
which bat eza fd rg delta  # All in ~/.cargo/bin/
which git gh docker mise pyenv  # System tools

# Git
git config --list | grep user  # Should show your info
ssh -T git@github.com  # "Hi Aristoddle!"

# 1Password
op whoami  # j3lanzone@gmail.com

# MCP (after installing Claude Code)
npm install -g @anthropic-ai/claude-code
claude
# In Claude: /mcp
# Should list 17 servers

# Health check
dotfiles doctor  # Or manual checks
```

---

## Bazzite Package Management Cheat Sheet

| Task | Command |
|------|---------|
| **Install system package** | `rpm-ostree install <package>` + reboot |
| **Install GUI app** | `flatpak install flathub <app>` |
| **Install CLI tool** | `cargo install <tool>` or `mise install` |
| **Remove system package** | `rpm-ostree uninstall <package>` + reboot |
| **List layered packages** | `rpm-ostree status` |
| **Rollback system** | `rpm-ostree rollback` + reboot |
| **Clean old deployments** | `rpm-ostree cleanup -b` |

---

## Common Issues

### "No space left on device" during rpm-ostree
```bash
rpm-ostree cleanup -b
```

### Shell errors about missing commands
```bash
# Reinstall cargo tools
cargo install bat eza fd-find ripgrep sd git-delta du-dust procs zoxide
export PATH="$HOME/.cargo/bin:$PATH"
exec zsh
```

### MCP servers not loading
```bash
# Check Node.js
node --version  # If missing: mise install node@latest

# Check Python
python --version  # If missing: pyenv install 3.12.0

# Check Docker bridge
docker ps | grep mcp-bridge
```

### 1Password CLI not working
```bash
# Ensure desktop app installed and running
1password &
op signin
```

---

## Time Estimates

| Phase | Time |
|-------|------|
| First Boot | 15 min |
| Dropbox Recovery | 30 min |
| Credentials | 5 min |
| Chezmoi | 15 min |
| MCP Servers | 20 min |
| Dev Tools | 45 min |
| Applications | 60 min |
| GNOME | 15 min |
| **TOTAL** | **~3.5 hours** |

---

## Critical Files to Verify

```bash
# After recovery, these MUST exist:
~/.ssh/id_ed25519          # SSH key
~/.env                      # API tokens
~/.claude.json              # MCP config
~/.cargo/bin/bat            # Rust tools
~/.oh-my-zsh/               # Shell framework
~/.local/share/chezmoi/     # Dotfiles source
~/Documents/Joes_Default_Vault/  # Obsidian
```

---

## Emergency Reference

- **Backup Location**: `Dropbox:Bazzite-Migration-Backup-20251205/`
- **Dotfiles Repo**: `git@github.com:Aristoddle/beppe-system-bootstrap.git`
- **Original User**: j3lanzone@gmail.com
- **New Username**: deck
- **GitHub Token**: In `~/.env` as `GITHUB_PERSONAL_ACCESS_TOKEN`

---

**Full Documentation**: See `RECOVERY_INSTRUCTIONS.md` for detailed explanations.
