# Beppe System Bootstrap — AI-Native Dotfiles

> Dotfiles for the agentic era. 34 agents, 26 skills, MCP servers preconfigured. Your shell speaks to Claude and Codex out of the box.

---

## 🚀 One-Line Install

```bash
sh -c "$(curl -fsLS get.chezmoi.io)" -- init --apply Aristoddle/beppe-system-bootstrap
```

Already have chezmoi installed?
```bash
chezmoi init --apply https://github.com/Aristoddle/beppe-system-bootstrap.git
```

**Time to shell:** ~1–2 minutes on a clean host. No manual dotfile copying.

---

## 🎯 Who This Is For
- You use or experiment with **AI agents** and want them pre-wired (Claude/Codex, MCP servers).
- You want a **consistent shell** across macOS, Linux, WSL, and Steam Deck/Bazzite.
- You prefer **guardrails + automation** (chezmoi templates, 1Password secrets, health checks).
- You like **modern CLI defaults** (fzf, eza, zoxide, direnv, mise/pyenv) without hand-tuning.

---

## 🤖 AI-Native Features

### Pipe Anything to AI
```bash
ask "explain this code"
cat file.py | ask "review this"
git diff | gpt "write commit message"
ai "summarize these logs"
```

### Pre-wired MCP Servers
- **filesystem** — Read/write files from agents
- **git** — Git operations from agents
- **memory** — Persistent memory store
- **sequential-thinking** — Deep reasoning mode

### Agent Infrastructure
- **34 agents** — Task executors with YAML frontmatter
- **26 skills** — Always-active context guidance
- **700+ BATS tests** — Comprehensive coverage

---

## 📦 What You Get (Curated Stack)
- **Shell UX:** zsh + Oh‑My‑Zsh + Powerlevel10k, tuned startup (<200ms), per-host completion cache.
- **Modern CLI:** eza, fd, ripgrep, fzf, zoxide, direnv, lazygit, bat, dust, procs, delta.
- **Runtimes:** mise for multi-language, pyenv for Python venvs; optional core-toolchain overlay.
- **Secrets:** 1Password CLI integration; templated secrets injection (no secrets in git).
- **Platforms:** macOS, Ubuntu/Debian, Bazzite/Steam Deck, WSL — with platform-specific tweaks.

---

## 🛠️ Daily Workflows (Ready Out-of-the-Box)
- `op-reup` — refresh 1Password + gh plugin session fast.
- `dotfiles doctor` — health check of auth, tools, and shell config.
- `dotfiles explain <cmd>` — look up where any command is defined.
- `pyinit / nodeinit / goinit / rustinit` — project bootstraps with toolchains.
- AI: Claude/Codex MCP config, git + filesystem servers, memory store, sequential-thinking.

---

## 🔒 Safety & Recovery
- chezmoi-managed templates keep `$HOME` clean; drift detected via `chezmoi diff`.
- 1Password-backed secrets; no tokens in repo.
- Recovery guides for macOS, Linux, Bazzite/Steam Deck; agent-ready playbooks for rebuilds.

---

## 🧭 Quick Links
- **Quickstart:** [docs/QUICKSTART.md](QUICKSTART.md)
- **Full Setup:** [docs/SETUP.md](SETUP.md)
- **Agents & Skills:** [docs/CLAUDE_CODE_AGENTS_SKILLS.md](CLAUDE_CODE_AGENTS_SKILLS.md)
- **Troubleshooting:** [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **ChezMoi Guide:** [docs/CHEZMOI_GUIDE.md](CHEZMOI_GUIDE.md)

---

## ✅ Ready?
Clone, apply, and you're in a tuned shell with agents, secrets, and runtimes already wired. If something feels off, run `dotfiles doctor` or check [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md).
