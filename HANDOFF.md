# Handoff Brief – Public Docs (beppe-dotfiles-docs)
_Date: 2025-12-16 • Source: Codex CLI • Status: clean_

## Base paths (orientation)
- Session cwd when last running: /home/deck/Documents/Code/dotfiles/beppe-dotfiles-docs
- Public site base: /beppe-dotfiles-docs/
- Private repo path (related): /home/deck/Documents/Code/dotfiles/beppe-system-bootstrap

## Repo / Branch / Live
- Repo: github.com/Aristoddle/beppe-dotfiles-docs
- Branch: main
- Live: https://aristoddle.github.io/beppe-dotfiles-docs/

## Recent Changes
- Naming aligned to “Beppe's System Bootstrap” (title/siteTitle/hero).
- Version pages: mac, bazzite, main; per-version theming (mac blue, bazzite teal); delta notes on mac/bazzite; main page present.
- Landing: trust strip/badges, uninstall snippet, repo/issues CTA, version CTA, Testing CTA; quick-start commands + safety.
- Testing: command→test map. Architecture: mermaid diagrams (flow + secret flow).
- Tools page with official links (chezmoi, OMZ, P10k, fzf, direnv, zoxide, eza).
- Quickstart cheat includes auth status, apply --exclude, destroy.

## Open Issue
- Favicon not showing on GH Pages. Files: docs/.vitepress/public/favicon.{ico,png}; logo path: /beppe-dotfiles-docs/favicon.ico. Try absolute URL or cache-bust/rename later.

## Build/Run
- Dev: npm ci && npm run docs:dev -- --host --port 4173
- Build: npm ci && npm run docs:build
- Base must remain /beppe-dotfiles-docs/; strict link checking on.

## Key Files
- Config: docs/.vitepress/config.ts
- Versions: docs/versions/{mac,bazzite,main}/index.md
- Tools: docs/TOOLS.md
- Architecture: docs/ARCHITECTURE.md
- Testing: docs/TESTING.md
- Landing: docs/index.md

## Cleanliness
- Working tree clean after commit 8e1fd9c (handoff). Latest naming/logo commits: 9d6c07a, b772180, fe496fd.

## Next Steps (suggested)
- Fix favicon visibility (absolute URL/cache-bust). 
- Optional: add repo/issues button to nav; badge row for build/tests in private README (already handled privately).
- Keep base path and strict links when modifying config.

Priority if time is short
- Fix favicon (user-facing) while keeping base path intact.
- After mac review, port any delta tweaks back to main/bazzite as needed.
- Minor polish (nav CTA, badges) last.
