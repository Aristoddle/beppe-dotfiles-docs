---
title: main version
---

# main (default macOS + Linux/WSL)

This is the baseline. mac and bazzite add small deltas on top.

## Install / Prereqs
- macOS: none; one-line installs chezmoi.
- Linux: install chezmoi first (apt/pacman/dnf), then run the init command.
- WSL: same as Linux; ensure git + curl present.

## Quick start
```bash
# macOS
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply Aristoddle/beppe-system-bootstrap

# Linux/WSL (chezmoi installed)
chezmoi init --apply https://github.com/Aristoddle/beppe-system-bootstrap.git
```

## Platform notes
- OneDrive detection: `~/onedrive` (rclone) or `~/OneDrive`. If not found, templates skip gracefully.
- Secrets: 1Password CLI for templating; nothing sensitive committed.
- Package managers: Homebrew (mac), distro pkg manager (Linux), mise for dev runtimes; they coexist.

## Safety / rollback
- Preview: `chezmoi diff`
- Apply: `chezmoi apply`
- Uninstall: `chezmoi destroy` (copy anything you need first)
- Pause: `chezmoi apply --exclude=dotfiles`

## Health checks
- Run `dotfiles doctor` after apply.
- Auth status: `dotfiles auth status`
- If shell feels slow: clear caches `rm -rf ~/.cache/zsh/p10k && exec zsh`
