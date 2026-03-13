import{_ as s,c as n,o as e,a1 as i}from"./chunks/framework.TuIRSVI8.js";const g=JSON.parse('{"title":"System Architecture","description":"","frontmatter":{},"headers":[],"relativePath":"ARCHITECTURE.md","filePath":"ARCHITECTURE.md","lastUpdated":1768004173000}'),l={name:"ARCHITECTURE.md"};function p(t,a,o,r,c,h){return e(),n("div",null,[...a[0]||(a[0]=[i(`<h1 id="system-architecture" tabindex="-1">System Architecture <a class="header-anchor" href="#system-architecture" aria-label="Permalink to &quot;System Architecture&quot;">​</a></h1><p>Complete architectural overview of beppe-system-bootstrap&#39;s 4-layer design.</p><h2 id="system-overview" tabindex="-1">System Overview <a class="header-anchor" href="#system-overview" aria-label="Permalink to &quot;System Overview&quot;">​</a></h2><p>Beppe-system-bootstrap is a <strong>programmable, AI-augmented development environment</strong> built on 4 distinct layers:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Layer 4: Agent Layer (Autonomous Maintenance)              │</span></span>
<span class="line"><span>│  ~/.claude/agents/ + ~/.claude/skills/                      │</span></span>
<span class="line"><span>│  - 35 specialized agents                                    │</span></span>
<span class="line"><span>│  - 30 skills (zsh-expert, graceful-degradation, etc.)       │</span></span>
<span class="line"><span>│  - 3 multi-agent workflows                                  │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                            ▼</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Layer 3: Meta Project (Planning &amp; Documentation)           │</span></span>
<span class="line"><span>│  ~/Documents/Code/Claude-Codex-Collaboration/docs/          │</span></span>
<span class="line"><span>│  - Workflow definitions                                     │</span></span>
<span class="line"><span>│  - Development standards                                    │</span></span>
<span class="line"><span>│  - Session summaries                                        │</span></span>
<span class="line"><span>│  - Knowledge graph index                                    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                            ▼</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Layer 2: Deployed Configs (What Shell Reads)               │</span></span>
<span class="line"><span>│  ~/.config/zsh/, ~/.gitconfig, ~/.p10k.zsh, etc.            │</span></span>
<span class="line"><span>│  - Managed by chezmoi (read-only, NEVER edit directly)      │</span></span>
<span class="line"><span>│  - Templates rendered with machine-specific variables       │</span></span>
<span class="line"><span>│  - Symlinked or copied from Layer 1                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>                            ▼</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  Layer 1: chezmoi Source (Configuration Management)          │</span></span>
<span class="line"><span>│  ~/.local/share/chezmoi/ (git repository)                   │</span></span>
<span class="line"><span>│  - Source of truth for all configs                          │</span></span>
<span class="line"><span>│  - Contains templates, scripts, dotfiles                    │</span></span>
<span class="line"><span>│  - Version-controlled, portable across machines             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h2 id="layer-1-chezmoi-source-foundation" tabindex="-1">Layer 1: chezmoi Source (Foundation) <a class="header-anchor" href="#layer-1-chezmoi-source-foundation" aria-label="Permalink to &quot;Layer 1: chezmoi Source (Foundation)&quot;">​</a></h2><h3 id="purpose" tabindex="-1">Purpose <a class="header-anchor" href="#purpose" aria-label="Permalink to &quot;Purpose&quot;">​</a></h3><p>Single source of truth for all configuration files, managed by git.</p><h3 id="location" tabindex="-1">Location <a class="header-anchor" href="#location" aria-label="Permalink to &quot;Location&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/.local/share/chezmoi/</span></span></code></pre></div><h3 id="structure" tabindex="-1">Structure <a class="header-anchor" href="#structure" aria-label="Permalink to &quot;Structure&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/.local/share/chezmoi/</span></span>
<span class="line"><span>├── .zshrc                              # Main shell orchestrator</span></span>
<span class="line"><span>├── private_dot_config/zsh/</span></span>
<span class="line"><span>│   ├── config/                         # Core configurations</span></span>
<span class="line"><span>│   │   ├── 00-environment.zsh          # PATH, XDG, exports</span></span>
<span class="line"><span>│   │   ├── 05-shell-options.zsh        # Shell behavior</span></span>
<span class="line"><span>│   │   ├── 10-omz.zsh                  # Oh-My-Zsh</span></span>
<span class="line"><span>│   │   ├── 20-plugins.zsh              # Plugin loading</span></span>
<span class="line"><span>│   │   ├── 30-completions.zsh          # Completion system</span></span>
<span class="line"><span>│   │   └── 40-prompt.zsh               # Powerlevel10k</span></span>
<span class="line"><span>│   ├── aliases/                        # Command shortcuts</span></span>
<span class="line"><span>│   │   ├── common.zsh</span></span>
<span class="line"><span>│   │   ├── git.zsh</span></span>
<span class="line"><span>│   │   ├── rust-tools.zsh</span></span>
<span class="line"><span>│   │   ├── docker.zsh</span></span>
<span class="line"><span>│   │   ├── kubectl.zsh</span></span>
<span class="line"><span>│   │   └── gh.zsh</span></span>
<span class="line"><span>│   ├── functions/                      # Shell functions</span></span>
<span class="line"><span>│   │   ├── smart-wrappers.zsh</span></span>
<span class="line"><span>│   │   ├── system.zsh</span></span>
<span class="line"><span>│   │   ├── git-utils.zsh</span></span>
<span class="line"><span>│   │   ├── dev.zsh</span></span>
<span class="line"><span>│   │   └── workflows.zsh</span></span>
<span class="line"><span>│   ├── os/                             # Platform-specific</span></span>
<span class="line"><span>│   │   ├── darwin.zsh                  # macOS</span></span>
<span class="line"><span>│   │   ├── linux.zsh                   # Linux</span></span>
<span class="line"><span>│   │   └── wsl.zsh                     # WSL</span></span>
<span class="line"><span>│   └── private/</span></span>
<span class="line"><span>│       └── secrets.zsh.tmpl            # 1Password integration</span></span>
<span class="line"><span>├── private_dot_config/</span></span>
<span class="line"><span>│   ├── nvim/                           # Neovim config</span></span>
<span class="line"><span>│   ├── alacritty/                      # Terminal emulator</span></span>
<span class="line"><span>│   ├── atuin/                          # Shell history</span></span>
<span class="line"><span>│   ├── mise/                           # Runtime manager</span></span>
<span class="line"><span>│   └── gh/                             # GitHub CLI</span></span>
<span class="line"><span>├── dot_claude/                         # Claude Code integration</span></span>
<span class="line"><span>│   ├── agents/                         # Autonomous agents</span></span>
<span class="line"><span>│   │   ├── dotfiles-maintainer.md</span></span>
<span class="line"><span>│   │   ├── security-scanner.md</span></span>
<span class="line"><span>│   │   ├── zsh-performance-auditor.md</span></span>
<span class="line"><span>│   │   ├── test-validator.md</span></span>
<span class="line"><span>│   │   └── doc-synchronizer.md</span></span>
<span class="line"><span>│   └── skills/                         # AI behavior guidelines</span></span>
<span class="line"><span>│       ├── zsh-expert.md</span></span>
<span class="line"><span>│       ├── graceful-degradation.md</span></span>
<span class="line"><span>│       ├── pipe-safety-checker.md</span></span>
<span class="line"><span>│       └── chezmoi-expert.md</span></span>
<span class="line"><span>├── dot_gitconfig.tmpl                  # Git config template</span></span>
<span class="line"><span>├── dot_chezmoi.toml.tmpl               # chezmoi variables</span></span>
<span class="line"><span>├── .chezmoiignore                      # Exclusion patterns</span></span>
<span class="line"><span>├── docs/                               # Documentation</span></span>
<span class="line"><span>│   ├── TOOLS.md</span></span>
<span class="line"><span>│   ├── MIGRATION.md</span></span>
<span class="line"><span>│   ├── ARCHITECTURE.md (this file)</span></span>
<span class="line"><span>│   ├── AGENT_DEVELOPMENT.md</span></span>
<span class="line"><span>│   └── workflows/</span></span>
<span class="line"><span>│       ├── health-check.md</span></span>
<span class="line"><span>│       ├── pre-commit.md</span></span>
<span class="line"><span>│       └── performance-audit.md</span></span>
<span class="line"><span>├── .github/</span></span>
<span class="line"><span>│   └── ROADMAP.md</span></span>
<span class="line"><span>├── README.md</span></span>
<span class="line"><span>├── CLAUDE.md                           # AI project instructions</span></span>
<span class="line"><span>└── CHANGELOG.md</span></span></code></pre></div><h3 id="key-characteristics" tabindex="-1">Key Characteristics <a class="header-anchor" href="#key-characteristics" aria-label="Permalink to &quot;Key Characteristics&quot;">​</a></h3><p><strong>Git-Managed</strong>:</p><ul><li>Full version control</li><li>Commit history</li><li>Portable across machines</li></ul><p><strong>Template Support</strong>:</p><ul><li><code>\\\\{\\\\{.git.name\\\\}\\\\}</code>, <code>\\\\{\\\\{.github.username\\\\}\\\\}</code>, etc.</li><li>Per-machine customization</li><li>Prompts on first init</li></ul><h2 id="architecture-at-a-glance" tabindex="-1">Architecture at a Glance <a class="header-anchor" href="#architecture-at-a-glance" aria-label="Permalink to &quot;Architecture at a Glance&quot;">​</a></h2><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">flowchart LR</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    A[chezmoi source\\n(templates, data)] --&gt; B[chezmoi render\\nplatform + secrets]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    B --&gt; C[target files\\n~/.config, ~/.zshrc, etc.]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    C --&gt; D[Runtime\\nshell, tools, agents]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    D --&gt; E[Tests\\nBATS: unit/integration]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    E --&gt; B</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    A --&gt; E</span></span></code></pre></div><h3 id="secret-flow-templating" tabindex="-1">Secret Flow (templating) <a class="header-anchor" href="#secret-flow-templating" aria-label="Permalink to &quot;Secret Flow (templating)&quot;">​</a></h3><div class="language-mermaid vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">mermaid</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">flowchart LR</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    OP[1Password CLI / env] --&gt; T[chezmoi template\\n(op secrets injected)]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    T --&gt; R[Rendered files\\n(no secrets in git)]</span></span></code></pre></div><p><strong>File Naming Convention</strong>:</p><ul><li><code>dot_filename</code> → <code>~/.filename</code></li><li><code>private_dot_config/zsh/</code> → <code>~/.config/zsh/</code></li><li><code>file.tmpl</code> → Rendered template</li></ul><h3 id="workflow" tabindex="-1">Workflow <a class="header-anchor" href="#workflow" aria-label="Permalink to &quot;Workflow&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Edit source (ALWAYS edit here)</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.local/share/chezmoi</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">vim</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> private_dot_config/zsh/config/10-omz.zsh</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Deploy to target locations</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chezmoi</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apply</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Version control</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> .</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;feat: Enable kubectl plugin&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span></span></code></pre></div><h2 id="layer-2-deployed-configs-runtime" tabindex="-1">Layer 2: Deployed Configs (Runtime) <a class="header-anchor" href="#layer-2-deployed-configs-runtime" aria-label="Permalink to &quot;Layer 2: Deployed Configs (Runtime)&quot;">​</a></h2><h3 id="purpose-1" tabindex="-1">Purpose <a class="header-anchor" href="#purpose-1" aria-label="Permalink to &quot;Purpose&quot;">​</a></h3><p>Where your shell and tools actually read configurations.</p><h3 id="locations" tabindex="-1">Locations <a class="header-anchor" href="#locations" aria-label="Permalink to &quot;Locations&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/.config/zsh/              # Shell configs</span></span>
<span class="line"><span>~/.gitconfig                # Git</span></span>
<span class="line"><span>~/.p10k.zsh                 # Powerlevel10k</span></span>
<span class="line"><span>~/.config/nvim/             # Neovim</span></span>
<span class="line"><span>~/.config/alacritty/        # Terminal</span></span>
<span class="line"><span>~/.config/atuin/            # Shell history</span></span>
<span class="line"><span>~/.config/mise/             # Runtime manager</span></span>
<span class="line"><span>~/.config/gh/               # GitHub CLI</span></span></code></pre></div><h3 id="key-characteristics-1" tabindex="-1">Key Characteristics <a class="header-anchor" href="#key-characteristics-1" aria-label="Permalink to &quot;Key Characteristics&quot;">​</a></h3><p><strong>Read-Only</strong> (from user perspective):</p><ul><li>Managed by chezmoi</li><li><strong>NEVER edit directly</strong></li><li>Changes overwritten by <code>chezmoi apply</code></li></ul><p><strong>Template Rendering</strong>:</p><div class="language-toml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">toml</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Source: dot_gitconfig.tmpl</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">user</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    name = {{ .git.name }</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">}</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    email = {{ .git.email }</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Deployed: ~/.gitconfig</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">user</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    name = J</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">oe Lanzone</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    email = j</span><span style="--shiki-light:#B31D28;--shiki-light-font-style:italic;--shiki-dark:#FDAEB7;--shiki-dark-font-style:italic;">3lanzone@gmail.com</span></span></code></pre></div><p><strong>Platform-Specific</strong>:</p><ul><li>OS-specific files loaded automatically</li><li><code>os/darwin.zsh</code> on macOS</li><li><code>os/linux.zsh</code> on Linux</li><li><code>os/wsl.zsh</code> on WSL</li></ul><h3 id="workflow-1" tabindex="-1">Workflow <a class="header-anchor" href="#workflow-1" aria-label="Permalink to &quot;Workflow&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Check deployed state</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chezmoi</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> diff</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># See what would change</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chezmoi</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apply</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --dry-run</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Apply changes from source</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chezmoi</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apply</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Reload shell to apply</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">exec</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> zsh</span></span></code></pre></div><h2 id="layer-3-meta-project-development" tabindex="-1">Layer 3: Meta Project (Development) <a class="header-anchor" href="#layer-3-meta-project-development" aria-label="Permalink to &quot;Layer 3: Meta Project (Development)&quot;">​</a></h2><h3 id="purpose-2" tabindex="-1">Purpose <a class="header-anchor" href="#purpose-2" aria-label="Permalink to &quot;Purpose&quot;">​</a></h3><p>Planning, documentation, and development workspace separate from config source.</p><h3 id="location-1" tabindex="-1">Location <a class="header-anchor" href="#location-1" aria-label="Permalink to &quot;Location&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/Documents/Code/beppe-system-bootstrap/</span></span></code></pre></div><h3 id="structure-1" tabindex="-1">Structure <a class="header-anchor" href="#structure-1" aria-label="Permalink to &quot;Structure&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/Documents/Code/beppe-system-bootstrap/</span></span>
<span class="line"><span>├── README.md                   # Meta project overview</span></span>
<span class="line"><span>├── docs/</span></span>
<span class="line"><span>│   ├── SESSION_SUMMARY_*.md   # Session notes</span></span>
<span class="line"><span>│   ├── KG_SCHEMA.md           # Knowledge graph standards</span></span>
<span class="line"><span>│   ├── KG_INDEX.md            # Entity index</span></span>
<span class="line"><span>│   └── SYSTEM_STATE_*.md      # System audits</span></span>
<span class="line"><span>├── workflows/                 # Workflow development</span></span>
<span class="line"><span>│   └── experimental/          # Testing new workflows</span></span>
<span class="line"><span>├── agents/                    # Agent development</span></span>
<span class="line"><span>│   └── prototypes/            # Testing new agents</span></span>
<span class="line"><span>└── .gitignore                 # Don&#39;t track in dotfiles repo</span></span></code></pre></div><h3 id="key-characteristics-2" tabindex="-1">Key Characteristics <a class="header-anchor" href="#key-characteristics-2" aria-label="Permalink to &quot;Key Characteristics&quot;">​</a></h3><p><strong>Not Part of Dotfiles</strong>:</p><ul><li>Separate from chezmoi source</li><li>Local development workspace</li><li>Not deployed to other machines</li></ul><p><strong>Purpose</strong>:</p><ul><li>Planning documents</li><li>Session summaries</li><li>Knowledge graph management</li><li>Agent/workflow prototyping</li><li>System audits</li></ul><p><strong>Why Separate?</strong></p><p>Benefits:</p><ul><li>✅ Don&#39;t clutter dotfiles repo with meta docs</li><li>✅ Keep development separate from production</li><li>✅ Test agents before deploying to <code>~/.claude/</code></li><li>✅ Machine-specific notes (don&#39;t sync)</li></ul><p>Drawbacks:</p><ul><li>Requires manual setup on new machines</li><li>Not automatically synced</li></ul><h3 id="workflow-2" tabindex="-1">Workflow <a class="header-anchor" href="#workflow-2" aria-label="Permalink to &quot;Workflow&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Navigate to meta workspace</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/Documents/Code/beppe-system-bootstrap</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Edit planning docs</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">vim</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> docs/SESSION_SUMMARY_OCT_31.md</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Develop new agent</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">vim</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> agents/prototypes/new-agent.md</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Test workflow</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cp</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> agents/prototypes/new-agent.md</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.local/share/chezmoi/dot_claude/agents/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">chezmoi</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> apply</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/agent</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> new-agent</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># If successful, commit to dotfiles repo</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.local/share/chezmoi</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> add</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dot_claude/agents/new-agent.md</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> commit</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;feat(agent): Add new-agent&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> push</span></span></code></pre></div><h2 id="layer-4-agent-layer-automation" tabindex="-1">Layer 4: Agent Layer (Automation) <a class="header-anchor" href="#layer-4-agent-layer-automation" aria-label="Permalink to &quot;Layer 4: Agent Layer (Automation)&quot;">​</a></h2><h3 id="purpose-3" tabindex="-1">Purpose <a class="header-anchor" href="#purpose-3" aria-label="Permalink to &quot;Purpose&quot;">​</a></h3><p>Autonomous maintenance, validation, and optimization through AI agents.</p><h3 id="location-2" tabindex="-1">Location <a class="header-anchor" href="#location-2" aria-label="Permalink to &quot;Location&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/.claude/agents/     # Deployed from dot_claude/agents/</span></span>
<span class="line"><span>~/.claude/skills/     # Deployed from dot_claude/skills/</span></span></code></pre></div><h3 id="components" tabindex="-1">Components <a class="header-anchor" href="#components" aria-label="Permalink to &quot;Components&quot;">​</a></h3><p><strong>Skills</strong> (30 total):</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/.claude/skills/</span></span>
<span class="line"><span>├── zsh-expert.md                  # Zsh syntax guidance</span></span>
<span class="line"><span>├── graceful-degradation.md        # Tool availability checks</span></span>
<span class="line"><span>├── pipe-safety-checker.md         # Pipe detection patterns</span></span>
<span class="line"><span>├── chezmoi-expert.md              # chezmoi workflow enforcement</span></span>
<span class="line"><span>└── [26 additional skills]         # See CLAUDE_CODE_AGENTS_SKILLS.md</span></span></code></pre></div><p><strong>Agents</strong> (35 total):</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/.claude/agents/</span></span>
<span class="line"><span>├── dotfiles-maintainer.md         # System health monitoring</span></span>
<span class="line"><span>├── security-scanner.md            # Secret scanning, permissions</span></span>
<span class="line"><span>├── zsh-performance-auditor.md     # Startup profiling</span></span>
<span class="line"><span>├── test-validator.md              # Function testing</span></span>
<span class="line"><span>├── doc-synchronizer.md            # Doc/code validation</span></span>
<span class="line"><span>└── [30 additional agents]         # See CLAUDE_CODE_AGENTS_SKILLS.md</span></span></code></pre></div><p><strong>Workflows</strong> (3 total):</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Documented in: docs/workflows/</span></span>
<span class="line"><span>├── health-check.md                # Parallel: maintainer + scanner</span></span>
<span class="line"><span>├── pre-commit.md                  # Parallel: test + doc validation</span></span>
<span class="line"><span>└── performance-audit.md           # Sequential: auditor + maintainer</span></span></code></pre></div><h3 id="key-characteristics-3" tabindex="-1">Key Characteristics <a class="header-anchor" href="#key-characteristics-3" aria-label="Permalink to &quot;Key Characteristics&quot;">​</a></h3><p><strong>Autonomous Operation</strong>:</p><ul><li>Skills: Always active (shape Claude&#39;s behavior)</li><li>Agents: On-demand or scheduled</li><li>Workflows: Orchestrate multiple agents</li></ul><p><strong>Integration</strong>:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Invoke single agent</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">/agent</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> dotfiles-maintainer</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Run workflow (launches multiple agents)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">workflow</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> health</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Pre-commit hook integration</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">git</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> core.hooksPath</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ~/.config/git/hooks</span></span></code></pre></div><p><strong>Outputs</strong>:</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>~/.cache/</span></span>
<span class="line"><span>├── system-health-report.md</span></span>
<span class="line"><span>├── security-audit-report.md</span></span>
<span class="line"><span>├── zsh-performance-report.md</span></span>
<span class="line"><span>├── test-validation-report.md</span></span>
<span class="line"><span>└── doc-sync-report.md</span></span></code></pre></div><h2 id="data-flow" tabindex="-1">Data Flow <a class="header-anchor" href="#data-flow" aria-label="Permalink to &quot;Data Flow&quot;">​</a></h2><h3 id="new-machine-setup" tabindex="-1">New Machine Setup <a class="header-anchor" href="#new-machine-setup" aria-label="Permalink to &quot;New Machine Setup&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>1. Install chezmoi</span></span>
<span class="line"><span>   ↓</span></span>
<span class="line"><span>2. Initialize from GitHub</span></span>
<span class="line"><span>   chezmoi init --apply github.com/Aristoddle/beppe-system-bootstrap</span></span>
<span class="line"><span>   ↓</span></span>
<span class="line"><span>3. chezmoi prompts for template variables:</span></span>
<span class="line"><span>   - Git name, email</span></span>
<span class="line"><span>   - GitHub username</span></span>
<span class="line"><span>   - Device name</span></span>
<span class="line"><span>   ↓</span></span>
<span class="line"><span>4. Source (Layer 1) → Deployed (Layer 2)</span></span>
<span class="line"><span>   - Render templates with variables</span></span>
<span class="line"><span>   - Copy/symlink files to target locations</span></span>
<span class="line"><span>   ↓</span></span>
<span class="line"><span>5. Skills &amp; Agents (Layer 4) deployed</span></span>
<span class="line"><span>   - ~/.claude/agents/ populated</span></span>
<span class="line"><span>   - ~/.claude/skills/ populated</span></span>
<span class="line"><span>   ↓</span></span>
<span class="line"><span>6. (Optional) Create meta workspace (Layer 3)</span></span>
<span class="line"><span>   mkdir -p ~/Documents/Code/beppe-system-bootstrap</span></span>
<span class="line"><span>   ↓</span></span>
<span class="line"><span>7. System ready!</span></span></code></pre></div><h3 id="making-changes" tabindex="-1">Making Changes <a class="header-anchor" href="#making-changes" aria-label="Permalink to &quot;Making Changes&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Edit Source (Layer 1):</span></span>
<span class="line"><span>  cd ~/.local/share/chezmoi</span></span>
<span class="line"><span>  vim private_dot_config/zsh/config/10-omz.zsh</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Deploy (Layer 1 → Layer 2):</span></span>
<span class="line"><span>  chezmoi apply</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Reload Shell:</span></span>
<span class="line"><span>  exec zsh</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Validate (Layer 4):</span></span>
<span class="line"><span>  workflow pre-commit</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Version Control:</span></span>
<span class="line"><span>  git add . &amp;&amp; git commit &amp;&amp; git push</span></span></code></pre></div><h3 id="agent-workflow-example" tabindex="-1">Agent Workflow Example <a class="header-anchor" href="#agent-workflow-example" aria-label="Permalink to &quot;Agent Workflow Example&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>User runs: workflow health</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Workflow Launcher (Layer 4):</span></span>
<span class="line"><span>  - Reads workflow definition from docs/workflows/health-check.md</span></span>
<span class="line"><span>  - Launches 2 agents in parallel:</span></span>
<span class="line"><span>    1. dotfiles-maintainer</span></span>
<span class="line"><span>    2. security-scanner</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Agents Execute:</span></span>
<span class="line"><span>  - Read source configs (Layer 1)</span></span>
<span class="line"><span>  - Check deployed configs (Layer 2)</span></span>
<span class="line"><span>  - Run diagnostics</span></span>
<span class="line"><span>  - Generate reports</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Output Reports:</span></span>
<span class="line"><span>  - ~/.cache/system-health-report.md</span></span>
<span class="line"><span>  - Exit code (0=healthy, 1=warnings, 2=critical)</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>User Reviews:</span></span>
<span class="line"><span>  - Read report</span></span>
<span class="line"><span>  - Execute recommended fixes</span></span>
<span class="line"><span>  - Re-run to verify</span></span></code></pre></div><h2 id="cross-layer-interactions" tabindex="-1">Cross-Layer Interactions <a class="header-anchor" href="#cross-layer-interactions" aria-label="Permalink to &quot;Cross-Layer Interactions&quot;">​</a></h2><h3 id="layer-1-↔-layer-2" tabindex="-1">Layer 1 ↔ Layer 2 <a class="header-anchor" href="#layer-1-↔-layer-2" aria-label="Permalink to &quot;Layer 1 ↔ Layer 2&quot;">​</a></h3><p><strong>chezmoi apply</strong></p><ul><li>Renders templates</li><li>Copies/symlinks files</li><li>Updates deployed configs</li></ul><h3 id="layer-1-↔-layer-4" tabindex="-1">Layer 1 ↔ Layer 4 <a class="header-anchor" href="#layer-1-↔-layer-4" aria-label="Permalink to &quot;Layer 1 ↔ Layer 4&quot;">​</a></h3><p><strong>Agents analyze source</strong></p><ul><li>Read chezmoi source directly</li><li>Check for uncommitted changes</li><li>Validate template syntax</li></ul><h3 id="layer-2-↔-layer-4" tabindex="-1">Layer 2 ↔ Layer 4 <a class="header-anchor" href="#layer-2-↔-layer-4" aria-label="Permalink to &quot;Layer 2 ↔ Layer 4&quot;">​</a></h3><p><strong>Agents validate runtime</strong></p><ul><li>Check deployed file integrity</li><li>Test actual tool configurations</li><li>Benchmark shell startup</li></ul><h3 id="layer-3-↔-layer-4" tabindex="-1">Layer 3 ↔ Layer 4 <a class="header-anchor" href="#layer-3-↔-layer-4" aria-label="Permalink to &quot;Layer 3 ↔ Layer 4&quot;">​</a></h3><p><strong>Development &amp; prototyping</strong></p><ul><li>Test agents in Layer 3 before deploying</li><li>Document workflows in Layer 3</li><li>Promote successful agents to Layer 1</li></ul><h2 id="design-principles" tabindex="-1">Design Principles <a class="header-anchor" href="#design-principles" aria-label="Permalink to &quot;Design Principles&quot;">​</a></h2><h3 id="_1-separation-of-concerns" tabindex="-1">1. Separation of Concerns <a class="header-anchor" href="#_1-separation-of-concerns" aria-label="Permalink to &quot;1. Separation of Concerns&quot;">​</a></h3><ul><li><strong>Layer 1</strong>: Source of truth (version control)</li><li><strong>Layer 2</strong>: Runtime environment (read-only)</li><li><strong>Layer 3</strong>: Development workspace (local)</li><li><strong>Layer 4</strong>: Automation &amp; intelligence (AI)</li></ul><h3 id="_2-unidirectional-flow" tabindex="-1">2. Unidirectional Flow <a class="header-anchor" href="#_2-unidirectional-flow" aria-label="Permalink to &quot;2. Unidirectional Flow&quot;">​</a></h3><ul><li>Source (Layer 1) → Deployed (Layer 2)</li><li>Never edit Layer 2 directly</li><li>Always use <code>chezmoi edit</code> or edit Layer 1</li></ul><h3 id="_3-portability" tabindex="-1">3. Portability <a class="header-anchor" href="#_3-portability" aria-label="Permalink to &quot;3. Portability&quot;">​</a></h3><ul><li>Layer 1 portable via git</li><li>Layer 2 generated per-machine</li><li>Layer 3 optional (machine-specific)</li><li>Layer 4 deployed with Layer 1</li></ul><h3 id="_4-automation-first" tabindex="-1">4. Automation-First <a class="header-anchor" href="#_4-automation-first" aria-label="Permalink to &quot;4. Automation-First&quot;">​</a></h3><ul><li>Agents automate maintenance</li><li>Workflows orchestrate complexity</li><li>Skills guide AI behavior</li><li>Self-optimizing system</li></ul><h2 id="for-new-users" tabindex="-1">For New Users <a class="header-anchor" href="#for-new-users" aria-label="Permalink to &quot;For New Users&quot;">​</a></h2><h3 id="minimum-understanding" tabindex="-1">Minimum Understanding <a class="header-anchor" href="#minimum-understanding" aria-label="Permalink to &quot;Minimum Understanding&quot;">​</a></h3><p>You only need to understand 2 layers to get started:</p><p><strong>Layer 1 (chezmoi source)</strong>:</p><ul><li>This is where you make changes</li><li><code>cd ~/.local/share/chezmoi &amp;&amp; vim file</code></li></ul><p><strong>Layer 2 (deployed configs)</strong>:</p><ul><li>This is where your shell reads from</li><li>Don&#39;t edit directly</li></ul><h3 id="advanced-understanding" tabindex="-1">Advanced Understanding <a class="header-anchor" href="#advanced-understanding" aria-label="Permalink to &quot;Advanced Understanding&quot;">​</a></h3><p>To leverage full power:</p><p><strong>Layer 3 (meta workspace)</strong>:</p><ul><li>Create for planning and development</li><li>Not required but useful</li></ul><p><strong>Layer 4 (agents)</strong>:</p><ul><li>Run <code>workflow health</code> weekly</li><li>Use <code>workflow pre-commit</code> before pushing</li><li>Let automation handle maintenance</li></ul><h2 id="troubleshooting" tabindex="-1">Troubleshooting <a class="header-anchor" href="#troubleshooting" aria-label="Permalink to &quot;Troubleshooting&quot;">​</a></h2><h3 id="my-changes-aren-t-applying" tabindex="-1">&quot;My changes aren&#39;t applying&quot; <a class="header-anchor" href="#my-changes-aren-t-applying" aria-label="Permalink to &quot;&quot;My changes aren&#39;t applying&quot;&quot;">​</a></h3><ul><li>Are you editing Layer 2 instead of Layer 1?</li><li>Did you run <code>chezmoi apply</code> after editing?</li><li>Check <code>chezmoi diff</code> to see what would change</li></ul><h3 id="where-do-i-edit-this-file" tabindex="-1">&quot;Where do I edit this file?&quot; <a class="header-anchor" href="#where-do-i-edit-this-file" aria-label="Permalink to &quot;&quot;Where do I edit this file?&quot;&quot;">​</a></h3><ul><li>If it&#39;s in <code>~/</code>, edit in <code>~/.local/share/chezmoi/</code></li><li>Use <code>chezmoi edit &lt;filepath&gt;</code> to open source</li></ul><h3 id="agents-aren-t-working" tabindex="-1">&quot;Agents aren&#39;t working&quot; <a class="header-anchor" href="#agents-aren-t-working" aria-label="Permalink to &quot;&quot;Agents aren&#39;t working&quot;&quot;">​</a></h3><ul><li>Check <code>~/.claude/agents/</code> exists</li><li>Verify agent files deployed: <code>chezmoi apply</code></li><li>Test single agent: <code>/agent agent-name</code></li></ul><h3 id="meta-workspace-missing" tabindex="-1">&quot;Meta workspace missing&quot; <a class="header-anchor" href="#meta-workspace-missing" aria-label="Permalink to &quot;&quot;Meta workspace missing&quot;&quot;">​</a></h3><ul><li>Layer 3 is optional</li><li>Create manually: <code>mkdir -p ~/Documents/Code/beppe-system-bootstrap</code></li><li>Populate with planning docs as needed</li></ul><hr><p><strong>Last Updated</strong>: 2026-01-09 <strong>Architecture Version</strong>: 1.1 <strong>Complexity</strong>: 4-layer system</p>`,130)])])}const u=s(l,[["render",p]]);export{g as __pageData,u as default};
