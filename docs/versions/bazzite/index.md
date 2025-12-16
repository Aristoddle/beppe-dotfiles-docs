---
title: bazzite version
pageClass: bazzite-theme
---

# bazzite (Steam Deck / HTPC)

Base docs apply from **main**. Differences to know:

## Install / Prereqs
- Use the same one-line chezmoi init; chezmoi is already available on Bazzite.
- Keep SteamOS/Bazzite paths: Emulation directories, Deck-specific config, and GPU/power defaults stay intact.

## Paths & secrets
- 1Password CLI as on main; secrets never in git.
- OneDrive is usually rclone-mounted at `~/onedrive` (if present); otherwise skipped.

## Branch choice
- On Bazzite/Deck, prefer **bazzite** docs; code tracks main with extra Deck tweaks.

## Quick start (Bazzite)
```bash
chezmoi init --apply https://github.com/Aristoddle/beppe-system-bootstrap.git
```

## Deltas vs main
- Steam Deck/Bazzite platform flags baked into templates (deck detection, UI paths).
- Keeps Steam libraries and Deck power/GPU defaults; doesn’t touch Steam data.
- Optional rclone/OneDrive mounts for ROMs/Comics if present; otherwise gracefully skipped.

## Tweaks vs main
- Deck/Bazzite platform flags for chezmoi templates (steamdeck detection).
- UI/power defaults kept; no touching Steam libraries.
- Optional rclone/OneDrive mount support for ROMs/Comics if present.

## Health / troubleshooting
- Run `dotfiles doctor` after apply.
- If Steam or Deck UI is running, prefer restarting the shell session to load env updates cleanly.
