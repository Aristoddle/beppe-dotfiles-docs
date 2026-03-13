import{_ as n,c as a,o as p,a1 as e}from"./chunks/framework.TuIRSVI8.js";const k=JSON.parse('{"title":"Font Management Architecture","description":"","frontmatter":{},"headers":[],"relativePath":"FONT_ARCHITECTURE.md","filePath":"FONT_ARCHITECTURE.md","lastUpdated":1765863345000}'),i={name:"FONT_ARCHITECTURE.md"};function l(t,s,c,o,r,h){return p(),a("div",null,[...s[0]||(s[0]=[e(`<h1 id="font-management-architecture" tabindex="-1">Font Management Architecture <a class="header-anchor" href="#font-management-architecture" aria-label="Permalink to &quot;Font Management Architecture&quot;">​</a></h1><h2 id="system-overview" tabindex="-1">System Overview <a class="header-anchor" href="#system-overview" aria-label="Permalink to &quot;System Overview&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                        FONT MANAGEMENT SYSTEM                            │</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  Standalone Script + Chezmoi Integration + Configuration                │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 1. CONFIGURATION LAYER                                                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  ~/.config/chezmoi/chezmoi.toml                                         │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │ [font_install]                                                 │    │</span></span>
<span class="line"><span>│  │   skip = false    # Enable/disable automatic installation      │    │</span></span>
<span class="line"><span>│  │   phase = &quot;all&quot;   # Which fonts to install                     │    │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                ↓                                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 2. CHEZMOI INTEGRATION LAYER                                             │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  run_onchange_after_install-fonts.sh.tmpl                               │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │ Responsibilities:                                              │    │</span></span>
<span class="line"><span>│  │ • Version tracking (FONT_VERSION_HASH)                         │    │</span></span>
<span class="line"><span>│  │ • Dependency checking (curl/wget/unzip)                        │    │</span></span>
<span class="line"><span>│  │ • Configuration reading (skip/phase)                           │    │</span></span>
<span class="line"><span>│  │ • Script delegation                                            │    │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                ↓                                         │</span></span>
<span class="line"><span>│  Triggers on:                                                            │</span></span>
<span class="line"><span>│  ✓ First run (new system)                                               │</span></span>
<span class="line"><span>│  ✓ Hash change (font list update)                                       │</span></span>
<span class="line"><span>│  ✓ Force apply (--force flag)                                           │</span></span>
<span class="line"><span>│                                ↓                                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 3. EXECUTION LAYER                                                       │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  scripts/install-fonts.sh [phase]                                       │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │ Cross-Platform Installation Logic:                            │    │</span></span>
<span class="line"><span>│  │                                                                │    │</span></span>
<span class="line"><span>│  │ Platform Detection → Font Directory → Download Fonts          │    │</span></span>
<span class="line"><span>│  │       ↓                    ↓                    ↓              │    │</span></span>
<span class="line"><span>│  │   macos/linux      ~/Library/Fonts    idempotent check        │    │</span></span>
<span class="line"><span>│  │                    ~/.local/share     parallel downloads      │    │</span></span>
<span class="line"><span>│  │                                                                │    │</span></span>
<span class="line"><span>│  │ Phases:                                                        │    │</span></span>
<span class="line"><span>│  │ • nerdfonts  → FiraCode, JetBrains, Hack, Meslo, Ubuntu       │    │</span></span>
<span class="line"><span>│  │ • japanese   → Noto Sans CJK                                   │    │</span></span>
<span class="line"><span>│  │ • coding     → Cascadia Code, Victor Mono, Iosevka           │    │</span></span>
<span class="line"><span>│  │ • ui         → Inter, Source Sans Pro                         │    │</span></span>
<span class="line"><span>│  │ • all        → Everything above                               │    │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│                                ↓                                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 4. FONT STORAGE LAYER                                                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  Platform-Specific Directories                                          │</span></span>
<span class="line"><span>│  ┌──────────────────┬──────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │ macOS            │ ~/Library/Fonts/                             │   │</span></span>
<span class="line"><span>│  │                  │ • Automatic cache refresh                    │   │</span></span>
<span class="line"><span>│  │                  │ • System integration immediate               │   │</span></span>
<span class="line"><span>│  ├──────────────────┼──────────────────────────────────────────────┤   │</span></span>
<span class="line"><span>│  │ Linux            │ ~/.local/share/fonts/                        │   │</span></span>
<span class="line"><span>│  │                  │ • fc-cache -fv (fontconfig)                  │   │</span></span>
<span class="line"><span>│  │                  │ • Persistent across updates                  │   │</span></span>
<span class="line"><span>│  ├──────────────────┼──────────────────────────────────────────────┤   │</span></span>
<span class="line"><span>│  │ Bazzite/Fedora   │ ~/.local/share/fonts/                        │   │</span></span>
<span class="line"><span>│  │                  │ • User directory (survives rebases)          │   │</span></span>
<span class="line"><span>│  │                  │ • fc-cache -fv                               │   │</span></span>
<span class="line"><span>│  └──────────────────┴──────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="state-management-flow" tabindex="-1">State Management Flow <a class="header-anchor" href="#state-management-flow" aria-label="Permalink to &quot;State Management Flow&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                         STATE MANAGEMENT                                  │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>NEW SYSTEM:</span></span>
<span class="line"><span>  chezmoi init --apply</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Template rendering (run_onchange_after_install-fonts.sh.tmpl)</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Check: No previous state exists</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Execute: scripts/install-fonts.sh [phase]</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Download fonts (skip if exist)</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Refresh font cache</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Save state hash</span></span>
<span class="line"><span>       ✓ Fonts installed</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>EXISTING SYSTEM (no changes):</span></span>
<span class="line"><span>  chezmoi apply</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Template rendering</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Check: FONT_VERSION_HASH matches saved state</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Skip: No execution needed</span></span>
<span class="line"><span>       ✓ Fonts up-to-date</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>EXISTING SYSTEM (font list updated):</span></span>
<span class="line"><span>  chezmoi apply</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Template rendering</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Check: FONT_VERSION_HASH changed</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Execute: scripts/install-fonts.sh [phase]</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Download NEW fonts only (idempotent)</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Refresh font cache</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Save new state hash</span></span>
<span class="line"><span>       ✓ New fonts installed</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>MANUAL INSTALLATION:</span></span>
<span class="line"><span>  ~/.local/share/chezmoi/scripts/install-fonts.sh nerdfonts</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Direct execution (bypasses chezmoi)</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Download fonts for specified phase</span></span>
<span class="line"><span>       ↓</span></span>
<span class="line"><span>  Refresh font cache</span></span>
<span class="line"><span>       ✓ Fonts installed (state unchanged)</span></span></code></pre></div><h2 id="decision-matrix" tabindex="-1">Decision Matrix <a class="header-anchor" href="#decision-matrix" aria-label="Permalink to &quot;Decision Matrix&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    DESIGN DECISION RATIONALE                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────┬──────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Decision                │ Rationale                                    │</span></span>
<span class="line"><span>├─────────────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Standalone script       │ • Testable independently                     │</span></span>
<span class="line"><span>│ + Chezmoi hook          │ • Reusable in other contexts                 │</span></span>
<span class="line"><span>│                         │ • Automatic on new systems                   │</span></span>
<span class="line"><span>│                         │ • Manual override available                  │</span></span>
<span class="line"><span>├─────────────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ run_onchange_           │ • Reruns when font list changes              │</span></span>
<span class="line"><span>│ (not run_once_)         │ • Existing systems get updates               │</span></span>
<span class="line"><span>│                         │ • Force rerun with --force                   │</span></span>
<span class="line"><span>│                         │ • Version-controlled via hash                │</span></span>
<span class="line"><span>├─────────────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Download on-demand      │ • Smaller git repo (no binaries)             │</span></span>
<span class="line"><span>│ (not in repo)           │ • Faster clone                               │</span></span>
<span class="line"><span>│                         │ • No GitHub size limits                      │</span></span>
<span class="line"><span>│                         │ • Only download what&#39;s needed                │</span></span>
<span class="line"><span>├─────────────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Phase-based             │ • Minimal installation option                │</span></span>
<span class="line"><span>│ installation            │ • Save disk space (~100MB vs ~240MB)         │</span></span>
<span class="line"><span>│                         │ • Faster for specific use cases              │</span></span>
<span class="line"><span>│                         │ • Per-machine customization                  │</span></span>
<span class="line"><span>├─────────────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Idempotent downloads    │ • Safe to rerun                              │</span></span>
<span class="line"><span>│                         │ • Skip existing fonts                        │</span></span>
<span class="line"><span>│                         │ • Bandwidth friendly                         │</span></span>
<span class="line"><span>│                         │ • Recovers from partial failures             │</span></span>
<span class="line"><span>├─────────────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ User directory          │ • No sudo required                           │</span></span>
<span class="line"><span>│ installation            │ • Survives system updates (Bazzite)          │</span></span>
<span class="line"><span>│                         │ • Per-user isolation                         │</span></span>
<span class="line"><span>│                         │ • Cross-platform consistency                 │</span></span>
<span class="line"><span>├─────────────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Optional automatic      │ • Opt-in for slow connections                │</span></span>
<span class="line"><span>│ installation            │ • Control over disk usage                    │</span></span>
<span class="line"><span>│                         │ • Manual installation alternative            │</span></span>
<span class="line"><span>│                         │ • Graceful for minimal setups                │</span></span>
<span class="line"><span>└─────────────────────────┴──────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="file-relationship-diagram" tabindex="-1">File Relationship Diagram <a class="header-anchor" href="#file-relationship-diagram" aria-label="Permalink to &quot;File Relationship Diagram&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Repository Structure:</span></span>
<span class="line"><span>~/.local/share/chezmoi/</span></span>
<span class="line"><span>├── .chezmoi.toml.tmpl ──────────────┐</span></span>
<span class="line"><span>│   └─[font_install]                 │  Configuration</span></span>
<span class="line"><span>│      • skip: bool                  │  prompts &amp; storage</span></span>
<span class="line"><span>│      • phase: string ───────────────┘</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── run_onchange_after_install-fonts.sh.tmpl ──┐</span></span>
<span class="line"><span>│   └─ FONT_VERSION_HASH ──────────────────┐   │</span></span>
<span class="line"><span>│      Triggers rerun when changed          │   │  Chezmoi</span></span>
<span class="line"><span>│                                           │   │  integration</span></span>
<span class="line"><span>│   Reads config:                           │   │  (automatic)</span></span>
<span class="line"><span>│   • {{ .font_install.skip }}              │   │</span></span>
<span class="line"><span>│   • {{ .font_install.phase }}             │   │</span></span>
<span class="line"><span>│                                           │   │</span></span>
<span class="line"><span>│   Calls:                                  │   │</span></span>
<span class="line"><span>│   └─→ scripts/install-fonts.sh [phase] ──┼───┘</span></span>
<span class="line"><span>│                                           │</span></span>
<span class="line"><span>└── scripts/install-fonts.sh ───────────────┘</span></span>
<span class="line"><span>    │                                           Standalone</span></span>
<span class="line"><span>    ├─ Platform detection                       script</span></span>
<span class="line"><span>    ├─ Font directory selection                 (reusable)</span></span>
<span class="line"><span>    ├─ Phase execution:</span></span>
<span class="line"><span>    │  ├─ install_nerdfonts()</span></span>
<span class="line"><span>    │  ├─ install_japanese_fonts()</span></span>
<span class="line"><span>    │  ├─ install_coding_fonts()</span></span>
<span class="line"><span>    │  ├─ install_ui_fonts()</span></span>
<span class="line"><span>    │  └─ install_all_fonts()</span></span>
<span class="line"><span>    └─ Font cache refresh</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>Deployed Locations:</span></span>
<span class="line"><span>~/Library/Fonts/           (macOS)</span></span>
<span class="line"><span>~/.local/share/fonts/      (Linux/Bazzite)</span></span>
<span class="line"><span>  ├── FiraCode*.ttf</span></span>
<span class="line"><span>  ├── JetBrainsMono*.ttf</span></span>
<span class="line"><span>  ├── Hack*.ttf</span></span>
<span class="line"><span>  ├── Noto*.ttc</span></span>
<span class="line"><span>  └── ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>State Tracking:</span></span>
<span class="line"><span>~/.local/share/chezmoi/.chezmoistate.boltdb</span></span>
<span class="line"><span>  └── run_onchange state hashes</span></span>
<span class="line"><span>      └── install-fonts script hash</span></span>
<span class="line"><span>          ↳ Compares FONT_VERSION_HASH to trigger reruns</span></span></code></pre></div><h2 id="integration-patterns" tabindex="-1">Integration Patterns <a class="header-anchor" href="#integration-patterns" aria-label="Permalink to &quot;Integration Patterns&quot;">​</a></h2><h3 id="pattern-1-automatic-default" tabindex="-1">Pattern 1: Automatic (Default) <a class="header-anchor" href="#pattern-1-automatic-default" aria-label="Permalink to &quot;Pattern 1: Automatic (Default)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>User: chezmoi init --apply https://github.com/user/dotfiles.git</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Flow:</span></span>
<span class="line"><span>  1. Clone repository</span></span>
<span class="line"><span>  2. Render templates</span></span>
<span class="line"><span>  3. Deploy files</span></span>
<span class="line"><span>  4. Execute run_onchange_ scripts</span></span>
<span class="line"><span>     └─→ install-fonts.sh runs (first time)</span></span>
<span class="line"><span>  5. Fonts available in terminal</span></span></code></pre></div><h3 id="pattern-2-selective-phases" tabindex="-1">Pattern 2: Selective Phases <a class="header-anchor" href="#pattern-2-selective-phases" aria-label="Permalink to &quot;Pattern 2: Selective Phases&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>User: Edits ~/.config/chezmoi/chezmoi.toml</span></span>
<span class="line"><span>      [font_install]</span></span>
<span class="line"><span>        phase = &quot;nerdfonts&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Flow:</span></span>
<span class="line"><span>  1. chezmoi apply</span></span>
<span class="line"><span>  2. Template rerendered with new phase</span></span>
<span class="line"><span>  3. Hash changes (phase changed)</span></span>
<span class="line"><span>  4. install-fonts.sh runs with &quot;nerdfonts&quot; arg</span></span>
<span class="line"><span>  5. Only Nerd Fonts installed</span></span></code></pre></div><h3 id="pattern-3-manual-override" tabindex="-1">Pattern 3: Manual Override <a class="header-anchor" href="#pattern-3-manual-override" aria-label="Permalink to &quot;Pattern 3: Manual Override&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>User: ~/.local/share/chezmoi/scripts/install-fonts.sh japanese</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Flow:</span></span>
<span class="line"><span>  1. Script runs directly (no chezmoi)</span></span>
<span class="line"><span>  2. Installs Japanese fonts</span></span>
<span class="line"><span>  3. Skips already-installed fonts</span></span>
<span class="line"><span>  4. Chezmoi state unchanged (manual operation)</span></span></code></pre></div><h3 id="pattern-4-version-update" tabindex="-1">Pattern 4: Version Update <a class="header-anchor" href="#pattern-4-version-update" aria-label="Permalink to &quot;Pattern 4: Version Update&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Maintainer: Adds new font to install_nerdfonts()</span></span>
<span class="line"><span>            Increments FONT_VERSION_HASH</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Flow (on all systems):</span></span>
<span class="line"><span>  1. git pull (in chezmoi source dir)</span></span>
<span class="line"><span>  2. chezmoi apply</span></span>
<span class="line"><span>  3. Hash mismatch detected</span></span>
<span class="line"><span>  4. install-fonts.sh reruns</span></span>
<span class="line"><span>  5. New font downloaded (existing skipped)</span></span>
<span class="line"><span>  6. New hash saved</span></span></code></pre></div><h2 id="platform-differences" tabindex="-1">Platform Differences <a class="header-anchor" href="#platform-differences" aria-label="Permalink to &quot;Platform Differences&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌───────────────┬────────────────────┬──────────────────┬─────────────────┐</span></span>
<span class="line"><span>│ Aspect        │ macOS              │ Linux            │ Bazzite         │</span></span>
<span class="line"><span>├───────────────┼────────────────────┼──────────────────┼─────────────────┤</span></span>
<span class="line"><span>│ Directory     │ ~/Library/Fonts    │ ~/.local/share/  │ ~/.local/share/ │</span></span>
<span class="line"><span>│               │                    │      fonts       │      fonts      │</span></span>
<span class="line"><span>├───────────────┼────────────────────┼──────────────────┼─────────────────┤</span></span>
<span class="line"><span>│ Cache         │ Automatic          │ fc-cache -fv     │ fc-cache -fv    │</span></span>
<span class="line"><span>│ Refresh       │ (atsutil?)         │                  │                 │</span></span>
<span class="line"><span>├───────────────┼────────────────────┼──────────────────┼─────────────────┤</span></span>
<span class="line"><span>│ Permissions   │ User-owned         │ User-owned       │ User-owned      │</span></span>
<span class="line"><span>│               │ No sudo            │ No sudo          │ No sudo         │</span></span>
<span class="line"><span>├───────────────┼────────────────────┼──────────────────┼─────────────────┤</span></span>
<span class="line"><span>│ Persistence   │ Native             │ Native           │ Survives rebase │</span></span>
<span class="line"><span>│               │                    │                  │ (atomic updates)│</span></span>
<span class="line"><span>├───────────────┼────────────────────┼──────────────────┼─────────────────┤</span></span>
<span class="line"><span>│ Verification  │ system_profiler    │ fc-list          │ fc-list         │</span></span>
<span class="line"><span>│               │ SPFontsDataType    │                  │                 │</span></span>
<span class="line"><span>└───────────────┴────────────────────┴──────────────────┴─────────────────┘</span></span></code></pre></div><h2 id="error-handling" tabindex="-1">Error Handling <a class="header-anchor" href="#error-handling" aria-label="Permalink to &quot;Error Handling&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Dependency Check</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>    ├─ curl/wget missing → Error + Install instructions</span></span>
<span class="line"><span>    ├─ unzip missing     → Error + Install instructions</span></span>
<span class="line"><span>    └─ fc-cache missing  → Warning (Linux only, optional)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Configuration Check</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>    ├─ skip = true → Exit gracefully (show manual command)</span></span>
<span class="line"><span>    └─ skip = false → Continue</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Download Phase</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>    ├─ Network failure  → Error (retry manually)</span></span>
<span class="line"><span>    ├─ File exists      → Skip (idempotent)</span></span>
<span class="line"><span>    ├─ Partial download → Cleanup temp, error</span></span>
<span class="line"><span>    └─ Success          → Install font</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Cache Refresh</span></span>
<span class="line"><span>    ↓</span></span>
<span class="line"><span>    ├─ macOS      → Success (automatic)</span></span>
<span class="line"><span>    ├─ Linux      → fc-cache (if available)</span></span>
<span class="line"><span>    └─ No fc-cache → Warning (fonts may not appear immediately)</span></span></code></pre></div><h2 id="extension-points" tabindex="-1">Extension Points <a class="header-anchor" href="#extension-points" aria-label="Permalink to &quot;Extension Points&quot;">​</a></h2><h3 id="adding-new-fonts" tabindex="-1">Adding New Fonts <a class="header-anchor" href="#adding-new-fonts" aria-label="Permalink to &quot;Adding New Fonts&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># In scripts/install-fonts.sh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">install_nerdfonts</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # ... existing fonts ...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # Add new font:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  download_font_archive</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;https://github.com/user/font/releases/download/v1.0/Font.zip&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;FontName&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;*.ttf&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>Then update version:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># In run_onchange_after_install-fonts.sh.tmpl</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">FONT_VERSION_HASH</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;20241210-01-added-new-font&quot;</span></span></code></pre></div><h3 id="adding-new-phases" tabindex="-1">Adding New Phases <a class="header-anchor" href="#adding-new-phases" aria-label="Permalink to &quot;Adding New Phases&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># In scripts/install-fonts.sh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">install_custom_phase</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  print_info</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Installing custom fonts...&quot;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # ... download logic ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># In main():</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">case</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$phase</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> in</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # ... existing phases ...</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">  custom</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    install_custom_phase</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ;;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">esac</span></span></code></pre></div><h3 id="platform-specific-handling" tabindex="-1">Platform-Specific Handling <a class="header-anchor" href="#platform-specific-handling" aria-label="Permalink to &quot;Platform-Specific Handling&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Platform-specific logic already exists:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">case</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">$PLATFORM</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> in</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">  macos</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # macOS-specific code</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ;;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">  fedora</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">bazzite</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # Fedora-specific code</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ;;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">  debian</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#032F62;--shiki-dark:#DBEDFF;">ubuntu</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # Debian-specific code</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ;;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  *)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # Generic Linux</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ;;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">esac</span></span></code></pre></div><h2 id="testing-strategy" tabindex="-1">Testing Strategy <a class="header-anchor" href="#testing-strategy" aria-label="Permalink to &quot;Testing Strategy&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Unit Testing (script isolation):</span></span>
<span class="line"><span>  ✓ Platform detection</span></span>
<span class="line"><span>  ✓ Font directory resolution</span></span>
<span class="line"><span>  ✓ Idempotent download checks</span></span>
<span class="line"><span>  ✓ Archive extraction</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Integration Testing (with chezmoi):</span></span>
<span class="line"><span>  ✓ Template rendering</span></span>
<span class="line"><span>  ✓ Configuration reading</span></span>
<span class="line"><span>  ✓ State tracking</span></span>
<span class="line"><span>  ✓ Hash change detection</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Manual Testing:</span></span>
<span class="line"><span>  ✓ Fresh system installation</span></span>
<span class="line"><span>  ✓ Existing system update</span></span>
<span class="line"><span>  ✓ Manual script execution</span></span>
<span class="line"><span>  ✓ Phase selection</span></span>
<span class="line"><span>  ✓ Skip configuration</span></span>
<span class="line"><span>  ✓ Force rerun</span></span>
<span class="line"><span></span></span>
<span class="line"><span>Platform Testing:</span></span>
<span class="line"><span>  ✓ macOS (arm64, x86_64)</span></span>
<span class="line"><span>  ✓ Ubuntu/Debian</span></span>
<span class="line"><span>  ✓ Fedora/Bazzite</span></span>
<span class="line"><span>  ✓ Arch Linux</span></span></code></pre></div>`,33)])])}const g=n(i,[["render",l]]);export{k as __pageData,g as default};
