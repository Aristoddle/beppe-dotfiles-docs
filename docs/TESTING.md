# Testing & Quality Gates

_Last reviewed: 2025‑12‑16 • Stack: BATS (bash) testing zsh functions_

## Snapshot
- **Files:** 57 (23 unit, 13 integration, 11 root helpers/examples/templates, 10 misc)
- **Approx tests:** 700+ (majority unit; integration covers shell startup, chezmoi workflows, wrappers)
- **Runtime:** `make test` ~60–90s on laptop; `run-parallel.sh` trims to ~30s if GNU parallel present.

## Philosophy
- **Risk‑weighted:** Cover daily drivers first (wrappers, auth, doctor, install/update).
- **Hybrid bash/zsh:** BATS runs bash; we load zsh functions into bash. Most POSIX/zsh syntax works; unusual zshisms (`*(.)`, `${(U)var}`) need guards or shellcheck disables.
- **Deterministic:** No network calls; fixtures/mocks only. Prefer explicit env setup/teardown in `tests/test_helper.bash`.
- **Portable:** Tests avoid macOS/Linux‑only assumptions unless explicitly gated.

## Architecture (mental model)
```
chezmoi source (templates, data)
        │
        ├─ render → target files (~/)
        │
        ├─ unit tests   : functions in isolation (mocks)
        ├─ integration  : workflows (auth, chezmoi apply, shell startup)
        └─ smoke/examples: quick sanity demos
```

## Layers & Coverage
- **Unit (`tests/unit/*.bats`)** – core functions:
  - smart wrappers (bat/ls/man), git helpers (root/undo/ignore), system utils (mkcd), doctor/reload/auth, install/update helpers, language helpers (mise/pyenv/python/node).
- **Integration (`tests/integration/*.bats`)** – end‑to‑end flows:
  - shell startup, chezmoi workflow, deployment, wrapper integration, auth paths, mise transparent wrappers.
- **Examples (`tests/examples/*.bats`)** – tiny smoke tests / helper demos.
- **Templates (`tests/templates/*.bats`)** – starting points for new tests (unit/integration/edge).
- **Helpers (`tests/helpers/*.bash`)** – shared setup, assertions, mocks, loader for zsh functions.

Known gaps (as of 2025‑12‑16):
- macOS‑only flows (e.g., Homebrew GUI installs) lightly covered.
- Agent/MCP end‑to‑end is partly manual; only CLI helpers are unit tested.
- Networked services (gh/op/cloud) stubbed; no live calls.

## How to Run
```bash
# from repo root (fast path)
make test            # all
make test-unit       # unit only
make test-integration

# direct
./tests/run-all.sh            # serial
./tests/run-parallel.sh       # parallel if GNU parallel present
./tests/run-unit.sh           # unit only
./tests/run-integration.sh    # integration only

# single file / filtered
bats tests/unit/smart_wrappers_test.bats
bats -f "bat" tests/unit/*.bats
```

## Command → Test Map (top surfaces)
- `dotfiles doctor` → `tests/unit/dotfiles_doctor_test.bats`, `tests/integration/dotfiles_command_test.bats`
- `dotfiles auth` → `tests/unit/dotfiles_auth_test.bats`, `tests/integration/auth_integration_test.bats`
- `dotfiles update` → `tests/unit/dotfiles_update_test.bats`
- Smart wrappers (`bat`, `ls`, `man`, `git-root`, `mkcd`) → `tests/unit/smart_wrappers_test.bats`, `tests/unit/git_utils_test.bats`, `tests/unit/system_utils_test.bats`
- Shell startup → `tests/integration/shell_startup_test.bats`
- mise transparent wrappers → `tests/unit/mise_transparent_wrappers_test.bats`, `tests/integration/mise_integration_test.bats`

## Writing a New Test (cheat sheet)
1) Copy a template from `tests/templates/` (unit/integration/edge).  
2) Source the helper in the header:
   ```bash
   load 'test_helper.bash'
   ```
3) If loading a zsh file with z‑specific syntax, add comments like `# shellcheck disable=SC2039` where needed.
4) Keep tests hermetic: create temp dirs, set env vars explicitly, avoid network.
5) Update descriptions to be actionable (“should … when …”).

## Quality gates to keep
- Stay deterministic (no network, no host‑specific paths).
- Prefer mocks over touching user config; if you must, use temp dirs.
- Keep assertions readable; fail fast with context (`assert_contains` helpers).
- When adding new surface areas (agents, VPN, chezmoi generators), add at least one unit + one integration path.

## For LLM agents
- Use the **public docs** plus the test helper comments. Avoid linking to private paths from the public site; treat paths as code literals (`tests/unit/...`), not Markdown links, to keep builds green.
- When editing or adding tests, keep changes in `~/.local/share/chezmoi` source tree; never in deployed files.
