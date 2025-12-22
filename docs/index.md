---
layout: home
title: Beppe System Bootstrap
hero:
  name: A developer shell that's actually fast.
  text: 200ms startup · 30+ CLI wrappers · macOS + Linux
  tagline: Modern CLI tools, intelligent defaults, cross-platform by design. One command to try it.
  actions:
    - theme: brand
      text: Get Started
      link: /QUICKSTART
    - theme: alt
      text: Browse Features
      link: /ARCHITECTURE
    - theme: alt
      text: View on GitHub
      link: https://github.com/Aristoddle/beppe-system-bootstrap
  trust:
    - "700+ BATS tests · No secrets in git · CI-enforced docs"
  badges:
    - "Tests: 700+"
    - "Startup: <200ms"
    - "Updated: 2025-12-22"
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

## Quick Install

::: code-group

```bash [macOS]
# Install chezmoi and apply dotfiles in one command
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply Aristoddle/beppe-system-bootstrap
```

```bash [Linux/WSL]
# Install chezmoi and apply dotfiles
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply Aristoddle/beppe-system-bootstrap

# Or if chezmoi is already installed:
chezmoi init --apply https://github.com/Aristoddle/beppe-system-bootstrap.git
```

```bash [Bazzite/Steam Deck]
# Same command works on Bazzite
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply Aristoddle/beppe-system-bootstrap

# Use the bazzite branch for gaming-specific defaults:
chezmoi init --apply --branch bazzite Aristoddle/beppe-system-bootstrap
```

:::

After install, run `dotfiles doctor` to verify everything works.

## What's Inside

| Category | What You Get |
|----------|--------------|
| **Shell** | Tuned zsh + OMZ + Powerlevel10k, autosuggestions, syntax highlighting |
| **CLI Tools** | bat, eza, fd, rg, fzf, zoxide, lazygit, delta, dust, procs |
| **Runtimes** | mise (multi-language) + pyenv (Python) with intelligent defaults |
| **AI Agents** | Claude Code + Codex CLI with MCP servers preconfigured |
| **Secrets** | 1Password templating - no secrets in git, ever |
| **Quality** | 700+ BATS tests, health checks, drift detection |

## Quick Links

**Getting Started**: [Quickstart](/QUICKSTART) · [Setup](/SETUP) · [Troubleshooting](/TROUBLESHOOTING)

**Deep Dive**: [Architecture](/ARCHITECTURE) · [Agents & Skills](/CLAUDE_CODE_AGENTS_SKILLS) · [Platform Differences](/PLATFORM_DIFFERENCES)

**Platform Guides**: [Using Bazzite](/USING_BAZZITE) · [Recovery Quick Reference](/RECOVERY_QUICK_REFERENCE)

## Safety

- **Secrets**: 1Password templating; nothing sensitive in git
- **Rollback**: `chezmoi diff` before apply, `chezmoi destroy` to uninstall
- **Tests**: 700+ BATS tests; docs build is CI-enforced
- **Privacy**: Site is noindex; this is for friends, not SEO
