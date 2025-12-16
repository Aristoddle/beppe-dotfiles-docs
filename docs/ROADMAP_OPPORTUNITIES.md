# Roadmap Opportunities (snapshot 2025-11-18)

## Adopt
- Swap OMZ loader to Antidote/zgenom for faster cached startup while keeping OMZ plugins.
- Add availability guards for pyenv/mise/Atuin/fzf (startup resilience).
- Fix darwin.zsh top-level `local` bug (done).
- Pin runtimes via `mise.lock`; add Brewfile/mise tool pins for deterministic bootstrap.
- Add tmux/zellij managed config; track WezTerm/iTerm2 prefs alongside Alacritty.
- Git hygiene: manage `~/.gitignore_global` and `.gitattributes`.
- macOS defaults script as opt-in (key repeat, Dock, screenshots) with clear risk notes.

## Evaluate
- prezto/zimfw as OMZ alternates if Antidote swap underperforms.
- Atuin advanced features (tags/search/sync strategies); automate Atuin backup.
- Nvim GUI plugin management (e.g., activate.nvim) if compatible with LazyVim.

## Park (documented for later)
- HTTP/3 support for curl (nghttp3/ngtcp2) — extra deps, optional.
- rsync zstd/lz4/xxhash patch on macOS — deps built; patch needed to enable.

## Tooling / QA
- Measure shell init (zsh-bench/hyperfine) and gate changes; add `dotfiles perf`.
- Smoke tests for overlays (`scripts/smoke-core-tools.sh`) and hook into `dotfiles doctor`.
- Add `docs/updates/` index entries for manual builds; keep build-info with versions/flags.

## High Priority (2025-11-19)
- gitstatus / SSH diagnostics helper — script a quick log collector (GITSTATUS_LOG_LEVEL=DEBUG + `_p9k_init_ssh` timing) so we can verify the prompt pipeline on demand.
- SequentialThinking / CLAUDE context sync — reconcile `~/.config/claude/global-system-context.txt` with the chezmoi template (KD-beam spec) so `chezmoi apply` stops warning.
- Externals refresh workflow — add `scripts/refresh-externals.sh` (chezmoi apply --refresh-externals=true + shell timing + known skips) to make updates safe and repeatable.
- 1Password auto-signin docs — document `OP_AUTOSIGNIN` / `OP_AUTOSIGNIN_CACHE_SECS` defaults and toggles (manual mode, longer cache) in README/Secrets.
- PATH guard lint — add a lint/test (shellcheck or grep) that rejects top-level `local` usage so the PATH export bug doesn’t return.
