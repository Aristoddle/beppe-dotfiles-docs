# Beppe System Bootstrap — Zero-Friction Dotfiles

> Opinionated, fast, cross‑platform dotfiles with autonomous agents, 1Password‑backed secrets, and a fully curated CLI stack. Works on macOS, Linux, WSL, and Bazzite/Steam Deck.

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
- You want a **consistent shell** across macOS, Linux, WSL, and Steam Deck/Bazzite.
- You prefer **guardrails + automation** (chezmoi templates, 1Password secrets, health checks).
- You like **modern CLI defaults** (fzf, eza, zoxide, direnv, mise/pyenv) without hand-tuning.
- You use or experiment with **AI agents** and want them pre-wired (Claude/Codex, MCP servers).

---

## 📦 What You Get (Curated Stack)
- **Shell UX:** zsh + Oh‑My‑Zsh + Powerlevel10k, tuned startup, per-host completion cache.
- **Modern CLI:** eza, fd, ripgrep, fzf, zoxide, direnv, lazygit, bat, dust, procs, delta.
- **Runtimes:** mise for multi-language, pyenv for Python venvs; optional core-toolchain overlay.
- **Secrets:** 1Password CLI integration; templated secrets injection (no secrets in git).
- **Agents:** 34 agents / 26 skills (Claude/Codex); MCP servers pre-wired; op/gh integration.
- **Platforms:** macOS, Ubuntu/Debian, Bazzite/Steam Deck, WSL — with platform-specific tweaks.

---

## 🛠️ Daily Workflows (Ready Out-of-the-Box)
- `op-reup` — refresh 1Password + gh plugin session fast.
- `dotfiles doctor` — health check of auth, tools, and shell config.
- `chezmoi edit ~/.config/zsh/...` → `chezmoi diff` → `chezmoi apply` — safe edits.
- `nodeinit / pyinit / goinit` — project bootstraps with mise/pyenv shims.
- AI: Claude/Codex MCP config, git + filesystem servers, memory store, sequential-thinking server.

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
- **Latest Snapshot:** [docs/updates/LATEST.md](updates/LATEST.md)

---

## 🖥️ Platforms & Hardware Notes
- **Bazzite / Steam Deck:** Bazzite bootstrap, EmuDeck/ES-DE setup, gaming-safe zsh profile.
- **macOS:** Homebrew + mise coexistence; SSH/Keychain integration.
- **WSL:** Path/line-ending safeguards; Windows interop helpers.

---

## ✅ Ready?
Clone, apply, and you’re in a tuned shell with secrets, runtimes, and agents already wired. If something feels off, run `dotfiles doctor` or check [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md).
