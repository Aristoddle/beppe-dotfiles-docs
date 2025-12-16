# Homebrew ↔ mise Coexistence Architecture

**Last Updated**: 2025-11-17
**Philosophy**: mise as invisible infrastructure, not a workflow change

---

## TL;DR

- **Homebrew**: System tools, Alfred workflows, system dependencies (KEEP)
- **mise**: Dev tool version management (node, ruby, python, etc.)
- **pyenv**: Python dev environments (your "rock for years")
- **Workflow**: Use tools normally (`npm install -g`), mise handles persistence transparently

---

## Why Both?

### The Problem We're Solving

**What happened**: Node upgraded (22.19.0 → 22.21.1), npm globals vanished (codex disappeared)

**Root cause**: npm globals install to version-specific directories
```bash
~/.local/share/mise/installs/node/22.19.0/lib/node_modules  # Old (deleted)
~/.local/share/mise/installs/node/22.21.1/lib/node_modules  # New (empty)
```

**Traditional solutions** (all bad):
1. Manual tracking (error-prone, forgotten)
2. Reinstall scripts (maintenance burden)
3. Don't upgrade (security risk)

**Our solution**: Transparent wrappers that preserve globals automatically

---

## Architecture Layers

```
┌─────────────────────────────────────────────────┐
│ Your Workflow (unchanged)                       │
│ npm install -g typescript                       │
│ pipx install black                              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Transparent Wrappers (invisible)                │
│ Auto-persist to mise config.toml                │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│ Tool Providers (layered by PATH priority)       │
├─────────────────────────────────────────────────┤
│ 1. mise (dev tools)          ← First in PATH   │
│    ~/.local/share/mise/installs/*/bin           │
├─────────────────────────────────────────────────┤
│ 2. pyenv (Python dev)        ← Python work      │
│    ~/.pyenv/shims                               │
├─────────────────────────────────────────────────┤
│ 3. Homebrew (system tools)   ← Fallback        │
│    /opt/homebrew/bin                            │
└─────────────────────────────────────────────────┘
```

---

## Safe Coexistence Rules

### ✅ DO: Layer Tools Safely

**Rule**: mise provides, Homebrew falls back

**How PATH works**:
```bash
# PATH order (first match wins):
1. ~/.local/share/mise/installs/node/22.21.1/bin/node  # mise's node
2. /opt/homebrew/bin/node                              # Homebrew's node (fallback)

# Result: You get mise's node@22.21.1
# Homebrew's node@25.1.0 is ignored BUT still there (Alfred can use it)
```

**Tool Source Diagnostic**:
```bash
which-source node
# node: /Users/joe/.local/share/mise/installs/node/22.21.1/bin/node
#   Source: mise

which-source python3
# python3: /Users/joe/.pyenv/shims/python3
#   Source: pyenv
```

### ✅ DO: Check Dependencies Before Removing

**NEVER** `brew uninstall` without checking:
```bash
# Check what depends on a package
brew uses --installed --recursive node

# If output is empty: Safe to remove (but keep for safety anyway)
# If output has packages: DON'T REMOVE (things depend on it)
```

**Example - pipx dependencies**:
```bash
❯ brew uses --installed pipx
python@3.14  # pipx needs Homebrew Python

# DON'T remove python@3.14 - would break pipx
```

### ✅ DO: Document Hard Dependencies

**Alfred workflows** often hardcode paths:
```python
#!/opt/homebrew/bin/python3  # Expects Homebrew Python
```

**If you removed Homebrew Python**: Alfred workflow breaks

**Safe approach**: Keep Homebrew packages, layer mise on top

### ❌ DON'T: Assume Homebrew Packages are Safe to Remove

**Examples of "orphaned" packages that aren't actually orphaned**:
- `node` - Alfred workflows may use `/opt/homebrew/bin/node`
- `python@3.14` - pipx, yt-dlp depend on it
- `python@3.13` - May be used by scripts with hardcoded shebangs

---

## Migration Decision Tree

### When to Keep Homebrew Package

```
Is it a dev tool (node, python, ruby, go, rust)?
├─ YES: Does anything depend on it?
│  ├─ YES (brew uses shows packages): KEEP (layered coexistence)
│  └─ NO (brew uses is empty): Still KEEP (Alfred/scripts may use it)
└─ NO (system tool like jq, bat, fd): KEEP (Homebrew is fine for these)
```

**Philosophy**: When in doubt, keep it. Disk space is cheap, broken workflows are expensive.

### When to Migrate to mise

```
Is it a language runtime or version manager?
├─ YES: Install via mise IN ADDITION to Homebrew
│  └─ Example: mise use -g node@22 (alongside brew install node)
└─ NO: Leave in Homebrew
   └─ Example: jq, bat, fd, ripgrep (no version management needed)
```

---

## Tool Decision Matrix

| Tool | Homebrew | mise | pyenv | Why |
|------|----------|------|-------|-----|
| node | ✅ Keep | ✅ Primary | - | mise for dev, Homebrew for Alfred |
| python@3.14 | ✅ Keep | ❌ | - | pipx dependency, system tools |
| python dev | ❌ | ❌ | ✅ Primary | pyenv is your "rock" |
| pipx | ✅ Keep | ❌ | - | Homebrew provides, uses Homebrew Python |
| ruby | ✅ Keep | ✅ Primary | - | mise for dev, Homebrew for system scripts |
| rust | ❌ | ✅ Primary | - | mise manages via rustup |
| cargo tools | ❌ | ❌ | - | cargo install (tracked in Cargo.lock) |
| jq, bat, fd | ✅ Keep | ❌ | - | Single version tools, no mise benefit |

---

## Transparent Wrapper Behavior

### npm Wrapper

**Before** (what you type):
```bash
npm install -g typescript
```

**What happens**:
1. Executes: `command npm install -g typescript` (normal npm)
2. If successful: `mise use -g npm:typescript@latest` (background, silent)
3. Result: Works exactly as expected + persists to config.toml

**Bypass** (if you want ephemeral install):
```bash
command npm install -g typescript  # Skip wrapper, don't persist
```

### pipx Wrapper

**Same pattern**:
```bash
pipx install black
# → command pipx install black (normal)
# → mise use -g pipx:black@latest (background)
```

---

## Verification Commands

### Check Tool Sources
```bash
which-source node    # Shows: mise or Homebrew
which-source python  # Shows: pyenv or Homebrew
which-all node       # Lists ALL node binaries in PATH
```

### Check mise Status
```bash
mise doctor          # Health check
mise ls              # Currently installed tools
mise outdated        # Available updates
```

### Check Homebrew Dependencies
```bash
brew uses --installed node        # What depends on Homebrew node
brew uses --installed python@3.14  # What depends on Python 3.14
```

---

## Troubleshooting

### "Which node am I using?"

```bash
node --version              # Shows version
which node                  # Shows path
which-source node           # Shows provider (mise/Homebrew/system)
```

### "npm global disappeared after upgrade"

**Diagnosis**:
```bash
mise ls node  # Check current node version
cat ~/.config/mise/config.toml | rg npm:  # Check persisted globals
```

**Fix**:
```bash
mise install  # Reinstalls all tools from config.toml (including npm globals)
```

### "Alfred workflow broke"

**Diagnosis**: Workflow probably expects `/opt/homebrew/bin/node`

**Fix**: Keep Homebrew node installed (coexistence, not replacement)

---

## Best Practices

### 1. Default to Coexistence
- Keep Homebrew packages unless they're provably unused
- Layer mise on top (PATH priority)
- Document exceptions in this file

### 2. Transparent Wrappers, Not Workflow Changes
- User types: `npm install -g package`
- System handles: persistence automatically
- No new commands to remember

### 3. Trust But Verify
- Use `which-source` before debugging
- Check `mise doctor` after upgrades
- Verify `brew uses` before removing packages

### 4. Document Hard Dependencies
- Add to this file when you discover Alfred workflow dependencies
- Note system scripts that use `/opt/homebrew/*` paths
- Track pipx packages and their Python version requirements

---

## Future Migration Notes

### New Computer Setup
```bash
# 1. Install Homebrew (system tools + Alfred dependencies)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Install mise
curl https://mise.run | sh

# 3. Restore dotfiles
chezmoi init --apply

# 4. mise installs all tools from config.toml (including npm/pipx globals)
mise install

# Done - everything persisted, including globals
```

### Adding New Tools

**Language runtimes**: Use mise
```bash
mise use -g go@latest
```

**Single-version tools**: Use Homebrew
```bash
brew install jq bat fd ripgrep
```

**npm globals**: Use npm normally (wrapper persists)
```bash
npm install -g typescript  # Auto-persists to mise
```

---

**Philosophy**: mise is infrastructure you don't think about daily. Use tools normally, mise handles persistence transparently.
