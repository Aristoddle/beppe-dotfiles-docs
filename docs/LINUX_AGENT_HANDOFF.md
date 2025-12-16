# Linux Agent Handoff Notes

**Date**: 2025-12-05
**From**: macOS agent (joes-macbook)
**To**: Linux agent

---

## Summary of Changes

Cross-platform chezmoi architecture has been implemented on main branch. The linux branch is now **obsolete** - its good ideas have been merged into main with proper architecture.

### What Was Done

1. **Cherry-picked compdef fix** (commit `08934a5`)
   - Fixed `compdef:153: _comps: assignment to invalid subscript range` error
   - Centralized all compdef calls in `30-completions.zsh` after compinit

2. **Implemented proper chezmoi data/config split**
   - `.chezmoidata.toml` - Shared project definitions (NO hardcoded paths)
   - `chezmoi.toml` - Machine-specific data (paths, platform detection)
   - `.chezmoi.toml.tmpl` - Template that generates machine-specific config

3. **Platform-aware project generator**
   - Auto-detects macOS/Linux/WSL/Steam Deck
   - Auto-detects OneDrive location (or prompts if not found)
   - Gracefully skips projects when paths don't exist
   - Uses correct MCP syntax (`disabledMcpjsonServers`)
   - Auto-disables macOS-only MCPs (imessage, apple-notes, things) on Linux

---

## What You Need To Do

### 1. Pull and Re-init

```bash
cd ~/.local/share/chezmoi
git fetch origin
git checkout main
git pull

# IMPORTANT: Re-initialize to generate new chezmoi.toml with platform detection
chezmoi init
```

The init will:
- Auto-detect Linux platform
- Auto-detect OneDrive path (if rclone mounted at ~/onedrive or ~/OneDrive)
- Prompt for Git identity if not cached
- Generate new `~/.config/chezmoi/chezmoi.toml`

### 2. Verify Platform Detection

After init, check:

```bash
chezmoi data | jq '.platform'
```

Expected output for Ubuntu:
```json
{
  "os": "linux",
  "is_wsl": false,
  "is_steam_deck": false,
  "is_mac": false,
  "is_linux": true,
  "linux_distro": "ubuntu"
}
```

### 3. Apply Changes

```bash
chezmoi apply
```

The generator script will:
- Skip Comics project if OneDrive not available
- Generate Dotfiles project settings
- Auto-disable macOS-only MCPs

### 4. Delete Obsolete Linux Branch (Optional)

The linux branch changes have been properly merged. You can delete it:

```bash
git branch -d linux
git push origin --delete linux
```

---

## Architecture Reference

### File Purposes

| File | Location | VC? | Purpose |
|------|----------|-----|---------|
| `.chezmoidata.toml` | source | YES | Project definitions (shared) |
| `.chezmoi.toml.tmpl` | source | YES | Generates machine config on init |
| `chezmoi.toml` | ~/.config/chezmoi/ | NO | Machine-specific data |
| `run_onchange_after_*_generate-project-configs.sh.tmpl` | source | YES | Generates Claude settings |

### Platform Detection Variables

Available in templates via `\\{\\{ .platform.* \\}\\}`:

::: v-pre
```toml
[data.platform]
os = "linux"              # darwin, linux
is_wsl = false            # true if WSL detected
is_steam_deck = false     # true if SteamOS detected
is_mac = false
is_linux = true
linux_distro = "ubuntu"   # ubuntu, debian, arch, fedora, steamos
```
:::

### OneDrive Detection

The template auto-detects OneDrive at:
- macOS: `~/Library/CloudStorage/OneDrive-Personal` or `~/OneDrive`
- Linux: `~/onedrive` (rclone mount) or `~/OneDrive`

If not found, prompts for manual path entry.

---

## Graceful Degradation Examples

### Comics Project (Requires OneDrive)

On a Linux machine WITHOUT OneDrive:

```
🔧 Generating project configurations...

⏭️  Comics: OneDrive not available
✅ Dotfiles: ~/.local/share/chezmoi/.claude/settings.local.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Generated: 1 project(s)
⏭️  Skipped: 1 project(s)
```

No errors, no crashes - just a clear skip message.

### MCP Auto-Disable

On Linux, these macOS-only MCPs are automatically added to `disabledMcpjsonServers`:
- `imessage`
- `apple-notes`
- `things`

This is read from `.chezmoidata.toml`:
```toml
[mcp_categories]
darwin_only = ["imessage", "apple-notes", "things"]
```

---

## If Something Breaks

### jq Not Installed

```
❌ ERROR: jq is required but not installed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Install jq to continue:
  macOS:      brew install jq
  Ubuntu:     sudo apt install jq
  Arch/Steam: sudo pacman -S jq
```

### Platform Detection Wrong

Check `/etc/os-release`:
```bash
cat /etc/os-release
```

If distro not detected, add to `.chezmoi.toml.tmpl`:

::: v-pre
```go-template
{{- else if contains "your-distro" (lower $osRelease) -}}
{{-   $linuxDistro = "your-distro" -}}
```
:::

### OneDrive Path Wrong

Edit `~/.config/chezmoi/chezmoi.toml`:
```toml
[data.onedrive]
root = "/path/to/your/onedrive"
available = true
```

Then: `chezmoi apply`

---

## Questions?

The user-advocate agent validated this architecture with 85% confidence. Key design decisions:

1. **Single branch** - Better than separate linux/darwin branches (merge hell)
2. **Graceful degradation** - Never crash, just skip with clear messages
3. **No hardcoded paths** - Everything from chezmoi.toml or auto-detected
4. **Single source of truth** - MCP categories in `.chezmoidata.toml` only

See commit history for full context.
