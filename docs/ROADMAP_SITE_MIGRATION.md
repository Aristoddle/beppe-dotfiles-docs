# Website Migration Plan (Dotfiles / Bootstrap)

Goal: replace README-first docs with a proper site (like the usenet-media-stack docs) that lets readers flip between OS-specific instructions (Bazzite, macOS, Ubuntu, WSL, SteamOS) via a toggle.

## Stack
- Prefer **Docusaurus 3** (MDX, React tabs, search, versioning). MkDocs is lighter but weaker for interactive OS switches.
- Source lives under `docs/website/`; publish to `gh-pages` with GitHub Actions.

## IA (initial pass)
- Landing: OS selector (tabs/pills) with persistent choice.
- Guides: Onboarding, Host Layers (rpm-ostree/brew/apt), Containers (Podman vs Docker), AI/MCP setup, Shell/Editor stack, Recovery/rollback.
- References: Layered package ledger (per OS), Mise toolchain matrix, MCP config reference, shortcuts (ulauncher, tmux, fzf).
- Playbooks: “Fresh install (30 min)”, “Drift audit/rebase checklist”.
- Changelog: auto from git tags.

## Execution steps
1) Scaffold Docusaurus in `docs/website/` (config, sidebar, theme with OS accent colors). Base URL for GH Pages.
2) Migrate current markdown into MDX pages; use `<Tabs groupId="os">` blocks for per-OS commands/snippets.
3) Add OS picker UI (localStorage) and dark-mode toggle; copy/clipboard on code blocks.
4) CI: `npm run lint && npm run build` and deploy job to `gh-pages` (GITHUB_TOKEN).
5) Update root README to a short “Quick start” + link to the site; keep legacy markdown only as source pages.
6) Branch policy: author in `bazzite`, backport shared pages to `main`; keep OS diffs as tabs, not divergent branches.

## Open decisions
- Search: DocSearch vs local lunr.
- Hosting: GH Pages (default) vs Cloudflare Pages; avoid Cloudflare-dependent path until decided.
- URL structure for per-OS anchors (`/bazzite/…` vs tabbed single page).

## Immediate todos
- Add wmctrl to Bazzite host-layer ledger and bootstrap script (done in this branch; pending reboot/apply).
- After reboot: set `ulauncher-toggle` hotkey; confirm docker service/group for Swarm use.
- Once site scaffolded, mirror to `main` as “coming soon” and replace scattered OS notes.

## Docusaurus tab pattern (for OS toggle)
Use shared groupId so tabs stay in sync and bookmarkable:
```mdx
<Tabs groupId="os" queryString>
  <TabItem value="bazzite" label="Bazzite">
  # Commands
  sudo rpm-ostree install wmctrl
  </TabItem>
  <TabItem value="macos" label="macOS">
  brew install --cask raycast
  </TabItem>
</Tabs>
```
Tabs persist via URL query string/localStorage. citeturn0search2
