# LLM Guide (context for AI agents)

**Read this first when operating via an LLM.**

**System prompt to load**: see `CLAUDE.md` → “Unified system prompt (Claude Code + Codex CLI)”. Use it as the prepend block for every session.

1) Source of truth
   - Edit only in `~/.local/share/chezmoi` and run `chezmoi apply`.
   - Never edit deployed files in `~/.config` directly.

2) Current status highlights
   - Core toolchain overlay lives at `~/Documents/Code/core-build/install`; PATH/MANPATH guards are in zsh config.
   - Latest build note: `docs/updates/2025-11-18-core-toolchain.md`.
   - Roadmap/opportunities: `docs/ROADMAP_OPPORTUNITIES.md`.

3) Health checks
   - Run `dotfiles doctor` (includes core-overlay smoke).
   - Core smoke script: `scripts/smoke-core-tools.sh`.

4) Safe defaults
   - Use PATH guard instead of overwriting system binaries.
   - Prefer `chezmoi diff` before `chezmoi apply`.
   - Keep auth: `dotfiles auth 1password` (OP TouchID), `dotfiles neovim copilot`.

5) Key docs
   - Onboarding: `docs/QUICKSTART.md`, `docs/SETUP.md`.
   - Updates index: `docs/updates/README.md` and `docs/updates/LATEST.md`.
   - Agents/skills: `docs/CLAUDE_CODE_AGENTS_SKILLS.md`, `docs/AGENT_DEVELOPMENT.md`.

6) Logging / diagnostics
   - Core overlay smoke log: `/tmp/core-smoke.log`.
   - chezmoi state: `~/.config/chezmoi/chezmoistate.boltdb`.

7) Do not
   - Do not overwrite /bin or /usr/bin (SIP). Use PATH overlays.
   - Do not edit generated/manually managed state files.
