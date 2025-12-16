---
title: mac version
pageClass: mac-theme
---

# mac (macOS) Notes

Base docs apply from **main**. Differences to know:

## Install / Prereqs
- chezmoi auto-installs in the one-liner; no extra prereqs.
- Homebrew stays; we don’t replace it—tools can come from brew or mise.
- OneDrive detection on mac: `~/Library/CloudStorage/OneDrive-Personal` or `~/OneDrive` (native client). Rclone not required on mac.

## Paths & secrets
- 1Password with TouchID: `op` CLI + browser integration; no secrets in git.
- mac-specific templates live under `private_dot_config` and `dot_config` with `darwin` gates.

## Platforms / branches
- If you’re on macOS, you can use **main** or **mac**; both work. **mac** is this page of callouts; code is shared with main.
- Steam Deck/Bazzite? Use **bazzite** instead.

## Quick start (mac)
```bash
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply Aristoddle/beppe-system-bootstrap
```

## Deltas vs main
- Native OneDrive path (no rclone needed).
- TouchID/1Password flow for `op` CLI; Homebrew coexists with mise.
- mac-specific shell paths/completions; keychain-friendly ssh-agent.

## Things that differ on mac
- Package manager: Homebrew + mise coexist (don’t delete Homebrew).
- Shell hooks: mac paths for completions, keychain/ssh-agent integration.
- Cloud storage: native OneDrive path; iCloud is ignored by default.

## Health / troubleshooting
- Run `dotfiles doctor` after apply.
- If completions lag: `rm -rf ~/.cache/zsh/p10k; exec zsh`.
- If brew and mise disagree on a tool: prefer mise for dev runtimes; keep brew for system/GUI.
