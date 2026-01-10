---
title: Platform Support
---

# Platform Support

All platforms use a **single `main` branch**. Platform-specific files are excluded at deploy time via `.chezmoiignore.tmpl`.

## Supported Platforms

| Platform | Status | Notes |
|----------|--------|-------|
| **macOS** | Full support | Homebrew, Alfred workflows, TouchID/1Password |
| **Linux** (Ubuntu/Fedora/Arch) | Full support | apt/dnf packages, systemd integration |
| **WSL** | Full support | Windows 1Password integration, symlinked paths |
| **Bazzite / Steam Deck** | Full support | Immutable OS tweaks, Deck UI, Proton paths |

## How Platform Detection Works

chezmoi uses `.chezmoiignore.tmpl` to exclude files based on the host system:

```
# Example exclusions (simplified)
{{- if ne .chezmoi.os "darwin" }}
# Linux: Exclude macOS-specific files
private_dot_config/alfred/
{{- end }}

{{- if ne .chezmoi.os "linux" }}
# macOS: Exclude Linux-specific files
private_dot_config/systemd/
private_dot_config/sunshine/
{{- end }}
```

## Installation (All Platforms)

The same command works everywhere:

```bash
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply Aristoddle/beppe-system-bootstrap
```

After install, run `dotfiles doctor` to verify platform-specific tools are available.

## Platform-Specific Docs

- [Using Bazzite](/USING_BAZZITE) - Steam Deck / HTPC running Bazzite
- [Platform Differences](/PLATFORM_DIFFERENCES) - Tool availability across platforms
- [Recovery Quick Reference](/RECOVERY_QUICK_REFERENCE) - Platform-specific recovery steps
