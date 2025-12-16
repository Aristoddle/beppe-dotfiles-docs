---
layout: home
title: Beppe System Bootstrap
hero:
  name: Beppe Dotfiles
  text: One-line, agent-ready dotfiles for macOS, Linux, WSL, Bazzite.
  tagline: Modern CLI stack, 1Password secrets, and Claude/Codex MCP wiring—ready in minutes.
  actions:
    - theme: brand
      text: Quickstart
      link: /QUICKSTART
    - theme: alt
      text: Setup Guide
      link: /SETUP
    - theme: alt
      text: Agents & Skills
      link: /CLAUDE_CODE_AGENTS_SKILLS
    - theme: alt
      text: Pick Version (bazzite/main)
      link: /versions/bazzite/
features:
  - title: Curated CLI Stack
    details: zsh + OMZ + Powerlevel10k, fzf, eza, zoxide, direnv, lazygit, mise/pyenv—pre-tuned.
  - title: Secrets Built-In
    details: 1Password CLI templating; no secrets in git. gh/op plugin auto-wire and op-reup helper.
  - title: Agent-Ready
    details: Claude/Codex MCP servers (filesystem, git, memory, sequential-thinking) preconfigured.
  - title: Portable
    details: chezmoi templates for macOS, Linux, WSL, Steam Deck/Bazzite; platform-specific tweaks baked in.
  - title: Fast Recovery
    details: Recovery quick-reference, troubleshooting, and health commands (dotfiles doctor, dotfiles auth).
  - title: Safe by Default
    details: Noindex meta, minimal dependencies, guarded secrets flow, and drift checks via chezmoi diff.
---

## What’s Inside

- **Shell UX:** tuned zsh, autosuggestions, syntax highlighting, host-scoped completion cache.  
- **Runtimes:** mise for multi-language; pyenv for Python venvs; optional source-built core toolchain.  
- **Automation:** health checks, agent libraries, and scripts to keep installs reproducible.  
- **Docs:** Quickstart, Setup, ChezMoi guide, architecture, troubleshooting, platform notes.  

## Quick Links

- [Quickstart](/QUICKSTART) · [Setup](/SETUP) · [Troubleshooting](/TROUBLESHOOTING)  
- [ChezMoi Guide](/CHEZMOI_GUIDE) · [Agents & Skills](/CLAUDE_CODE_AGENTS_SKILLS)  
- [Platform Differences](/PLATFORM_DIFFERENCES) · [Using Bazzite](/USING_BAZZITE)  
- [VPN / Torrents](/VPN_TORRENT) · [Recovery Quick Reference](/RECOVERY_QUICK_REFERENCE)

## Deploy

```bash
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply Aristoddle/beppe-system-bootstrap
```

Already have chezmoi?

```bash
chezmoi init --apply https://github.com/Aristoddle/beppe-system-bootstrap.git
```

> Need help? Run `dotfiles doctor` after apply, or see [TROUBLESHOOTING](/TROUBLESHOOTING).

### Version picker
- **bazzite**: Steam Deck / HTPC (Bazzite defaults)
- **main**: Generic macOS + Linux
Use the navbar “Version” dropdown; docs and examples match the selected version.
