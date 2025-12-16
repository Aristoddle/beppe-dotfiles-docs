# Handoff Brief – Public Docs (beppe-dotfiles-docs)
_Date: 2025-12-16 • Source: Codex CLI • Status: clean_

## Repo / Branch / Live
- Repo: github.com/Aristoddle/beppe-dotfiles-docs
- Branch: main
- Live site: https://aristoddle.github.io/beppe-dotfiles-docs/
- Base path: /beppe-dotfiles-docs/

## Recent Key Changes
- Naming aligned: title/siteTitle/hero = "Beppe's System Bootstrap".
- Version pages: mac, bazzite, main; per-version theming (mac blue, bazzite teal); delta notes on mac/bazzite pages; main page added.
- Landing page: trust strip, badges, uninstall snippet, repo/issues CTA, Testing & Quality CTA, version CTA, quick-start commands with safety.
- Testing: added command→test map.
- Architecture: added mermaid architecture + secret-flow diagrams.
- Tools: added official links page (chezmoi, OMZ, P10k, fzf, direnv, zoxide, eza) linked in sidebar.
- Quickstart cheat sheet: includes auth status, apply --exclude, destroy.

## Open Issue
- Favicon still not showing on GH Pages. Files exist at docs/.vitepress/public/favicon.{ico,png}; logo points to /beppe-dotfiles-docs/favicon.ico. Try absolute URL or cache-bust/rename on a future pass.

## Build/Run
- Dev: npm ci && npm run docs:dev -- --host --port 4173
- Build: npm ci && npm run docs:build
- Strict link checking is ON; base must stay /beppe-dotfiles-docs/.

## Key Files
- Config: docs/.vitepress/config.ts (title/siteTitle/logo/base/nav/sidebar)
- Versions: docs/versions/{mac,bazzite,main}/index.md
- Tools: docs/TOOLS.md
- Architecture: docs/ARCHITECTURE.md
- Testing: docs/TESTING.md
- Landing: docs/index.md

## Cleanliness
- Working tree clean after push (latest main: 9d6c07a/fe496fd/b772180, favicon path tweak at b772180). Handoff file uncommitted until you commit it.

## Next Steps (suggested)
- Fix favicon visibility (absolute URL/cache-bust). 
- Optional: add repo/issues button to nav; badge row for build/tests in private README (already in private repo).
- Keep base path and strict links when modifying config.
