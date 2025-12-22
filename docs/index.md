---
layout: home
title: Beppe System Bootstrap
hero:
  name: AI-native dotfiles for the agentic era.
  text: 34 agents · 26 skills · MCP servers preconfigured
  tagline: Your shell speaks to Claude and Codex out of the box. Cross-platform, tested, fast.
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
    - "700+ BATS tests · 1Password secrets · Works on macOS, Linux, Steam Deck"
  badges:
    - "Agents: 34"
    - "Skills: 26"
    - "Tests: 700+"
    - "Startup: <200ms"
features:
  - title: "🤖 Agent-Ready Shell"
    details: Claude Code + Codex CLI with MCP servers (filesystem, git, memory, sequential-thinking) preconfigured. Pipe anything to AI.
  - title: "⚡ One-Command Projects"
    details: "pyinit, nodeinit, goinit, rustinit — create fully configured projects with venvs/toolchains in seconds."
  - title: "🔧 Self-Healing Config"
    details: "dotfiles doctor checks auth, tools, and shell health. dotfiles auth manages 1Password, gh, Claude, Copilot."
  - title: "🔐 Secrets Built-In"
    details: 1Password CLI templating; no secrets in git. gh/op plugin auto-wire and op-reup helper.
  - title: "🌍 Cross-Platform"
    details: chezmoi templates for macOS, Linux, WSL, Steam Deck/Bazzite; platform-specific tweaks baked in.
  - title: "🧪 700+ Tests"
    details: BATS test suite with 700+ tests, CI-enforced docs, drift detection via chezmoi diff.
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

## Pipe Anything to AI

```bash
# Quick queries with full tool access
ask "explain this code"
cat file.py | ask "review this"

# Smart routing to best model
ai "summarize these logs"
git diff | gpt "write commit message"

# Direct model shortcuts
opus "complex task"
sonnet "general task"
haiku "quick question"
```

## What's Inside

| Category | What You Get |
|----------|--------------|
| **AI Agents** | 34 agents, 26 skills, Claude/Codex CLIs, MCP servers preconfigured |
| **Shell** | Tuned zsh + OMZ + Powerlevel10k, autosuggestions, syntax highlighting |
| **CLI Tools** | bat, eza, fd, rg, fzf, zoxide, lazygit, delta, dust, procs |
| **Runtimes** | mise (multi-language) + pyenv (Python) with intelligent defaults |
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
