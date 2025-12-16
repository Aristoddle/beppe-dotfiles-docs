# Font Management Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FONT MANAGEMENT SYSTEM                            │
│                                                                          │
│  Standalone Script + Chezmoi Integration + Configuration                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 1. CONFIGURATION LAYER                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ~/.config/chezmoi/chezmoi.toml                                         │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ [font_install]                                                 │    │
│  │   skip = false    # Enable/disable automatic installation      │    │
│  │   phase = "all"   # Which fonts to install                     │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                ↓                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 2. CHEZMOI INTEGRATION LAYER                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  run_onchange_after_install-fonts.sh.tmpl                               │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Responsibilities:                                              │    │
│  │ • Version tracking (FONT_VERSION_HASH)                         │    │
│  │ • Dependency checking (curl/wget/unzip)                        │    │
│  │ • Configuration reading (skip/phase)                           │    │
│  │ • Script delegation                                            │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                ↓                                         │
│  Triggers on:                                                            │
│  ✓ First run (new system)                                               │
│  ✓ Hash change (font list update)                                       │
│  ✓ Force apply (--force flag)                                           │
│                                ↓                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 3. EXECUTION LAYER                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  scripts/install-fonts.sh [phase]                                       │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │ Cross-Platform Installation Logic:                            │    │
│  │                                                                │    │
│  │ Platform Detection → Font Directory → Download Fonts          │    │
│  │       ↓                    ↓                    ↓              │    │
│  │   macos/linux      ~/Library/Fonts    idempotent check        │    │
│  │                    ~/.local/share     parallel downloads      │    │
│  │                                                                │    │
│  │ Phases:                                                        │    │
│  │ • nerdfonts  → FiraCode, JetBrains, Hack, Meslo, Ubuntu       │    │
│  │ • japanese   → Noto Sans CJK                                   │    │
│  │ • coding     → Cascadia Code, Victor Mono, Iosevka           │    │
│  │ • ui         → Inter, Source Sans Pro                         │    │
│  │ • all        → Everything above                               │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                ↓                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 4. FONT STORAGE LAYER                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Platform-Specific Directories                                          │
│  ┌──────────────────┬──────────────────────────────────────────────┐   │
│  │ macOS            │ ~/Library/Fonts/                             │   │
│  │                  │ • Automatic cache refresh                    │   │
│  │                  │ • System integration immediate               │   │
│  ├──────────────────┼──────────────────────────────────────────────┤   │
│  │ Linux            │ ~/.local/share/fonts/                        │   │
│  │                  │ • fc-cache -fv (fontconfig)                  │   │
│  │                  │ • Persistent across updates                  │   │
│  ├──────────────────┼──────────────────────────────────────────────┤   │
│  │ Bazzite/Fedora   │ ~/.local/share/fonts/                        │   │
│  │                  │ • User directory (survives rebases)          │   │
│  │                  │ • fc-cache -fv                               │   │
│  └──────────────────┴──────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT                                  │
└──────────────────────────────────────────────────────────────────────────┘

NEW SYSTEM:
  chezmoi init --apply
       ↓
  Template rendering (run_onchange_after_install-fonts.sh.tmpl)
       ↓
  Check: No previous state exists
       ↓
  Execute: scripts/install-fonts.sh [phase]
       ↓
  Download fonts (skip if exist)
       ↓
  Refresh font cache
       ↓
  Save state hash
       ✓ Fonts installed


EXISTING SYSTEM (no changes):
  chezmoi apply
       ↓
  Template rendering
       ↓
  Check: FONT_VERSION_HASH matches saved state
       ↓
  Skip: No execution needed
       ✓ Fonts up-to-date


EXISTING SYSTEM (font list updated):
  chezmoi apply
       ↓
  Template rendering
       ↓
  Check: FONT_VERSION_HASH changed
       ↓
  Execute: scripts/install-fonts.sh [phase]
       ↓
  Download NEW fonts only (idempotent)
       ↓
  Refresh font cache
       ↓
  Save new state hash
       ✓ New fonts installed


MANUAL INSTALLATION:
  ~/.local/share/chezmoi/scripts/install-fonts.sh nerdfonts
       ↓
  Direct execution (bypasses chezmoi)
       ↓
  Download fonts for specified phase
       ↓
  Refresh font cache
       ✓ Fonts installed (state unchanged)
```

## Decision Matrix

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    DESIGN DECISION RATIONALE                              │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────┬──────────────────────────────────────────────┐
│ Decision                │ Rationale                                    │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Standalone script       │ • Testable independently                     │
│ + Chezmoi hook          │ • Reusable in other contexts                 │
│                         │ • Automatic on new systems                   │
│                         │ • Manual override available                  │
├─────────────────────────┼──────────────────────────────────────────────┤
│ run_onchange_           │ • Reruns when font list changes              │
│ (not run_once_)         │ • Existing systems get updates               │
│                         │ • Force rerun with --force                   │
│                         │ • Version-controlled via hash                │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Download on-demand      │ • Smaller git repo (no binaries)             │
│ (not in repo)           │ • Faster clone                               │
│                         │ • No GitHub size limits                      │
│                         │ • Only download what's needed                │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Phase-based             │ • Minimal installation option                │
│ installation            │ • Save disk space (~100MB vs ~240MB)         │
│                         │ • Faster for specific use cases              │
│                         │ • Per-machine customization                  │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Idempotent downloads    │ • Safe to rerun                              │
│                         │ • Skip existing fonts                        │
│                         │ • Bandwidth friendly                         │
│                         │ • Recovers from partial failures             │
├─────────────────────────┼──────────────────────────────────────────────┤
│ User directory          │ • No sudo required                           │
│ installation            │ • Survives system updates (Bazzite)          │
│                         │ • Per-user isolation                         │
│                         │ • Cross-platform consistency                 │
├─────────────────────────┼──────────────────────────────────────────────┤
│ Optional automatic      │ • Opt-in for slow connections                │
│ installation            │ • Control over disk usage                    │
│                         │ • Manual installation alternative            │
│                         │ • Graceful for minimal setups                │
└─────────────────────────┴──────────────────────────────────────────────┘
```

## File Relationship Diagram

```
Repository Structure:
~/.local/share/chezmoi/
├── .chezmoi.toml.tmpl ──────────────┐
│   └─[font_install]                 │  Configuration
│      • skip: bool                  │  prompts & storage
│      • phase: string ───────────────┘
│
├── run_onchange_after_install-fonts.sh.tmpl ──┐
│   └─ FONT_VERSION_HASH ──────────────────┐   │
│      Triggers rerun when changed          │   │  Chezmoi
│                                           │   │  integration
│   Reads config:                           │   │  (automatic)
│   • {{ .font_install.skip }}              │   │
│   • {{ .font_install.phase }}             │   │
│                                           │   │
│   Calls:                                  │   │
│   └─→ scripts/install-fonts.sh [phase] ──┼───┘
│                                           │
└── scripts/install-fonts.sh ───────────────┘
    │                                           Standalone
    ├─ Platform detection                       script
    ├─ Font directory selection                 (reusable)
    ├─ Phase execution:
    │  ├─ install_nerdfonts()
    │  ├─ install_japanese_fonts()
    │  ├─ install_coding_fonts()
    │  ├─ install_ui_fonts()
    │  └─ install_all_fonts()
    └─ Font cache refresh


Deployed Locations:
~/Library/Fonts/           (macOS)
~/.local/share/fonts/      (Linux/Bazzite)
  ├── FiraCode*.ttf
  ├── JetBrainsMono*.ttf
  ├── Hack*.ttf
  ├── Noto*.ttc
  └── ...


State Tracking:
~/.local/share/chezmoi/.chezmoistate.boltdb
  └── run_onchange state hashes
      └── install-fonts script hash
          ↳ Compares FONT_VERSION_HASH to trigger reruns
```

## Integration Patterns

### Pattern 1: Automatic (Default)

```
User: chezmoi init --apply https://github.com/user/dotfiles.git

Flow:
  1. Clone repository
  2. Render templates
  3. Deploy files
  4. Execute run_onchange_ scripts
     └─→ install-fonts.sh runs (first time)
  5. Fonts available in terminal
```

### Pattern 2: Selective Phases

```
User: Edits ~/.config/chezmoi/chezmoi.toml
      [font_install]
        phase = "nerdfonts"

Flow:
  1. chezmoi apply
  2. Template rerendered with new phase
  3. Hash changes (phase changed)
  4. install-fonts.sh runs with "nerdfonts" arg
  5. Only Nerd Fonts installed
```

### Pattern 3: Manual Override

```
User: ~/.local/share/chezmoi/scripts/install-fonts.sh japanese

Flow:
  1. Script runs directly (no chezmoi)
  2. Installs Japanese fonts
  3. Skips already-installed fonts
  4. Chezmoi state unchanged (manual operation)
```

### Pattern 4: Version Update

```
Maintainer: Adds new font to install_nerdfonts()
            Increments FONT_VERSION_HASH

Flow (on all systems):
  1. git pull (in chezmoi source dir)
  2. chezmoi apply
  3. Hash mismatch detected
  4. install-fonts.sh reruns
  5. New font downloaded (existing skipped)
  6. New hash saved
```

## Platform Differences

```
┌───────────────┬────────────────────┬──────────────────┬─────────────────┐
│ Aspect        │ macOS              │ Linux            │ Bazzite         │
├───────────────┼────────────────────┼──────────────────┼─────────────────┤
│ Directory     │ ~/Library/Fonts    │ ~/.local/share/  │ ~/.local/share/ │
│               │                    │      fonts       │      fonts      │
├───────────────┼────────────────────┼──────────────────┼─────────────────┤
│ Cache         │ Automatic          │ fc-cache -fv     │ fc-cache -fv    │
│ Refresh       │ (atsutil?)         │                  │                 │
├───────────────┼────────────────────┼──────────────────┼─────────────────┤
│ Permissions   │ User-owned         │ User-owned       │ User-owned      │
│               │ No sudo            │ No sudo          │ No sudo         │
├───────────────┼────────────────────┼──────────────────┼─────────────────┤
│ Persistence   │ Native             │ Native           │ Survives rebase │
│               │                    │                  │ (atomic updates)│
├───────────────┼────────────────────┼──────────────────┼─────────────────┤
│ Verification  │ system_profiler    │ fc-list          │ fc-list         │
│               │ SPFontsDataType    │                  │                 │
└───────────────┴────────────────────┴──────────────────┴─────────────────┘
```

## Error Handling

```
Dependency Check
    ↓
    ├─ curl/wget missing → Error + Install instructions
    ├─ unzip missing     → Error + Install instructions
    └─ fc-cache missing  → Warning (Linux only, optional)

Configuration Check
    ↓
    ├─ skip = true → Exit gracefully (show manual command)
    └─ skip = false → Continue

Download Phase
    ↓
    ├─ Network failure  → Error (retry manually)
    ├─ File exists      → Skip (idempotent)
    ├─ Partial download → Cleanup temp, error
    └─ Success          → Install font

Cache Refresh
    ↓
    ├─ macOS      → Success (automatic)
    ├─ Linux      → fc-cache (if available)
    └─ No fc-cache → Warning (fonts may not appear immediately)
```

## Extension Points

### Adding New Fonts

```bash
# In scripts/install-fonts.sh

install_nerdfonts() {
  # ... existing fonts ...

  # Add new font:
  download_font_archive \
    "https://github.com/user/font/releases/download/v1.0/Font.zip" \
    "FontName" \
    "*.ttf"
}
```

Then update version:
```bash
# In run_onchange_after_install-fonts.sh.tmpl
FONT_VERSION_HASH="20241210-01-added-new-font"
```

### Adding New Phases

```bash
# In scripts/install-fonts.sh

install_custom_phase() {
  print_info "Installing custom fonts..."
  # ... download logic ...
}

# In main():
case "$phase" in
  # ... existing phases ...
  custom)
    install_custom_phase
    ;;
esac
```

### Platform-Specific Handling

```bash
# Platform-specific logic already exists:

case "$PLATFORM" in
  macos)
    # macOS-specific code
    ;;
  fedora|bazzite)
    # Fedora-specific code
    ;;
  debian|ubuntu)
    # Debian-specific code
    ;;
  *)
    # Generic Linux
    ;;
esac
```

## Testing Strategy

```
Unit Testing (script isolation):
  ✓ Platform detection
  ✓ Font directory resolution
  ✓ Idempotent download checks
  ✓ Archive extraction

Integration Testing (with chezmoi):
  ✓ Template rendering
  ✓ Configuration reading
  ✓ State tracking
  ✓ Hash change detection

Manual Testing:
  ✓ Fresh system installation
  ✓ Existing system update
  ✓ Manual script execution
  ✓ Phase selection
  ✓ Skip configuration
  ✓ Force rerun

Platform Testing:
  ✓ macOS (arm64, x86_64)
  ✓ Ubuntu/Debian
  ✓ Fedora/Bazzite
  ✓ Arch Linux
```
