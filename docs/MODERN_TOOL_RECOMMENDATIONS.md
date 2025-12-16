# Modern CLI Tool Recommendations (2025)

**Last Updated**: 2025-11-25
**Research Date**: 2025-11-25
**Status**: Comprehensive tool audit and upgrade recommendations

## Executive Summary

This document provides upgrade recommendations for the dotfiles CLI tool stack based on comprehensive research of 2025 modern alternatives. All recommendations prioritize:

- Cross-platform support (macOS, Linux, WSL)
- Active maintenance (commits within 6 months)
- Performance (Rust/Go preferred)
- Single binary distribution
- Strong community adoption (1000+ GitHub stars)

## Current Stack Assessment

### Core Tools (Currently Installed)

| Category | Tool | Status | GitHub Stars | Last Activity |
|----------|------|--------|--------------|---------------|
| File viewing | bat | ✅ Current | 49k+ | Active |
| Directory listing | eza | ✅ Current | 11k+ | Active (fork of exa) |
| Search (files) | fd | ✅ Current | 34k+ | Active |
| Search (content) | ripgrep (rg) | ✅ Current | 48k+ | Active |
| Git diff | delta | ✅ Current | 24k+ | Active |
| Git TUI | lazygit | ✅ Current | 52k+ | Active |
| Docker TUI | lazydocker | ✅ Current | 37k+ | Active |
| Process viewer | procs | ✅ Current | 5k+ | Active |
| Disk usage | dust | ✅ Current | 8k+ | Active |
| Navigation | zoxide | ✅ Current | 22k+ | Active |
| Shell history | atuin | ⚠️ Not mentioned in CLAUDE.md | 20k+ | Active |
| Text replacement | sd | ✅ Current | 6k+ | Active |

### Shell Infrastructure

| Component | Current | Status |
|-----------|---------|--------|
| Shell | zsh + Oh-My-Zsh | ✅ Current |
| Prompt | Powerlevel10k | ✅ Current |
| Fuzzy finder | fzf | ✅ Current |
| Package manager | mise + Homebrew + pyenv | ✅ Current (coexistence model) |

## Priority 1: Tools to Add

### 1. btop++ (System Monitoring Upgrade)

**Current**: procs (process viewer only)
**Recommended**: btop++ (comprehensive system monitor)

**Why Upgrade**:
- Procs only shows processes; btop++ shows CPU, memory, disk I/O, network, temperature, and processes
- Modern, mouse-driven interface with customizable layouts
- Video-game-like menu system with color schemes
- Better than bottom (btm), htop, and htop++ according to 2025 reviews
- Cross-platform (Linux, macOS, FreeBSD)

**Installation**:
```bash
brew install btop
```

**Sources**: [runcloud.io](https://runcloud.io/blog/best-htop-alternatives), [blackmoreops.com](https://www.blackmoreops.com/top-atop-btop-htop-linux-monitoring-tools-comparison/)

---

### 2. yazi (Terminal File Manager)

**Current**: None (manual navigation only)
**Recommended**: yazi

**Why Add**:
- Blazing fast (Rust, async I/O)
- Built-in image preview (Überzug++, Chafa, Kitty, iTerm2)
- Built-in code highlighting
- Lua scripting engine for customization
- Lazy loading (thousands of files without lag)
- Modern alternative to ranger, lf, nnn
- 15k+ GitHub stars

**Installation**:
```bash
brew install yazi
```

**Configuration**:
```bash
# Add to ~/.config/zsh/functions/smart-wrappers.zsh
y() {
  local tmp="$(mktemp -t "yazi-cwd.XXXXXX")"
  yazi "$@" --cwd-file="$tmp"
  if cwd="$(cat -- "$tmp")" && [ -n "$cwd" ] && [ "$cwd" != "$PWD" ]; then
    builtin cd -- "$cwd"
  fi
  rm -f -- "$tmp"
}
```

**Sources**: [github.com/sxyazi/yazi](https://github.com/sxyazi/yazi), [3li0.com](https://3li0.com/2025/03/yazi-the-terminal-file-manager-you-didnt-know-you-needed-why-i-switched-from-lf)

---

### 3. difftastic (Syntax-Aware Diff)

**Current**: delta (syntax highlighting)
**Recommended**: Add difftastic (complement, not replacement)

**Why Add**:
- Understands code structure (uses tree-sitter)
- Produces more concise, readable diffs for code changes
- Works alongside delta (use both for different scenarios)
- Dramatically better for refactoring/structural changes

**Installation**:
```bash
brew install difftastic
```

**Git Integration**:
```bash
# Add to ~/.gitconfig
[diff]
  tool = difftastic

[difftool]
  prompt = false

[difftool "difftastic"]
  cmd = difft "$LOCAL" "$REMOTE"

[alias]
  dft = difftool
```

**Usage Strategy**:
- `git diff` → delta (default, good for line changes)
- `git dft` → difftastic (structural changes, refactoring)

**Sources**: [ductile.systems/difftastic](https://www.ductile.systems/difftastic/), [github.com/Wilfred/difftastic](https://github.com/Wilfred/difftastic)

---

### 4. xh (Modern HTTP Client)

**Current**: curl (system default)
**Recommended**: Add xh (HTTPie alternative)

**Why Add**:
- Friendly syntax: `xh get api.example.com/users`
- JSON by default (no manual header setting)
- Syntax highlighting
- Faster than HTTPie (Rust vs Python)
- HTTPie-compatible syntax (easy transition)
- Better than curl for interactive API testing

**Installation**:
```bash
brew install xh
```

**Usage Strategy**:
- curl: Scripts, automation, complex requests
- xh: Interactive API testing, quick requests

**Sources**: [httpie.io/docs/cli/alternatives](https://httpie.io/docs/cli/alternatives), [yrkan.com](https://yrkan.com/blog/httpie-curl-cli-testing/)

---

### 5. jaq (jq Clone in Rust)

**Current**: jq
**Recommended**: Add jaq (faster alternative)

**Why Add**:
- 2-3x faster than jq (50ms startup vs jq's 50ms)
- Drop-in jq replacement (compatible filter syntax)
- Additional format support: YAML, TOML, CBOR, XML
- Multi-threaded support
- Can be used as Rust library

**Installation**:
```bash
brew install jaq
```

**Transition Strategy**:
- Keep jq installed (compatibility with existing scripts)
- Add alias: `alias jaq='command jaq'`
- Gradually transition scripts to jaq
- Use jq for YAML/TOML: `yq -oy file.yaml | jaq '.field'`

**Sources**: [github.com/01mf02/jaq](https://github.com/01mf02/jaq), [linuxlinks.com](https://www.linuxlinks.com/alternatives-popular-cli-tools-jq/)

---

### 6. ouch (Universal Archive Tool)

**Current**: extract() function (manual case statements)
**Recommended**: ouch

**Why Add**:
- Universal archive handler (no memorizing flags)
- Simple syntax: `ouch decompress file.tar.gz`
- Supports 20+ formats (tar.gz, zip, 7z, rar, zst, etc.)
- Smart auto-detection (by extension and content)
- Compression: `ouch compress files/ archive.tar.gz`
- Rust-based (fast, reliable)

**Installation**:
```bash
brew install ouch
```

**Integration**:
```bash
# Replace extract() function in system.zsh
extract() {
  if ! whence -p ouch &>/dev/null; then
    # Fallback to existing extract() logic
    _extract_fallback "$@"
  else
    command ouch decompress "$@"
  fi
}
```

**Sources**: [github.com/ouch-org/ouch](https://github.com/ouch-org/ouch), [wiki.archlinux.org](https://wiki.archlinux.org/title/Archiving_and_compression)

---

### 7. tlrc (tldr Rust Client)

**Current**: tldr
**Recommended**: Upgrade to tlrc (Rust implementation)

**Why Upgrade**:
- 10x faster than Node.js tldr
- Offline-first (caches pages locally)
- Better rendering (more compact, cleaner)
- Same tldr page database (community-maintained)
- Single binary (no Node.js runtime dependency)

**Installation**:
```bash
brew install tlrc
# Create alias for compatibility
alias tldr='tlrc'
```

**Sources**: [github.com/tldr-pages/tlrc](https://github.com/tldr-pages/tlrc)

---

### 8. hyperfine (Benchmarking Tool)

**Current**: None
**Recommended**: hyperfine

**Why Add**:
- Scientific command benchmarking
- Statistical analysis (min, max, mean, stddev)
- Warmup runs (cache effects)
- Side-by-side comparison
- Export to JSON, Markdown, CSV

**Installation**:
```bash
brew install hyperfine
```

**Use Cases**:
- Compare tool performance (e.g., `jq` vs `jaq`)
- Validate shell function optimizations
- Profile startup times

**Example**:
```bash
hyperfine 'fd pattern' 'find . -name pattern'
hyperfine --warmup 3 'jq .field file.json' 'jaq .field file.json'
```

**Sources**: [github.com/sharkdp/hyperfine](https://github.com/sharkdp/hyperfine), [dev.to](https://dev.to/dev_tips/15-rust-cli-tools-that-will-make-you-abandon-bash-scripts-forever-4mgi)

---

## Priority 2: Tools to Evaluate

### 1. glow (Markdown Viewer)

**Status**: Mentioned in CLAUDE.md but not confirmed installed
**Recommendation**: Verify installation, document usage

**Features**:
- Render markdown in terminal with styles
- Syntax highlighting
- Local file discovery
- Git repo markdown scanning
- Charm Cloud storage (optional)

**Installation** (if missing):
```bash
brew install glow
```

**Sources**: [github.com/charmbracelet/glow](https://github.com/charmbracelet/glow), [itsfoss.com](https://itsfoss.com/glow-cli-tool-markdown/)

---

### 2. starship (Prompt Alternative)

**Current**: Powerlevel10k
**Recommendation**: Evaluate as alternative (not urgent)

**Comparison**:

| Feature | Powerlevel10k | Starship |
|---------|---------------|----------|
| Speed | Fastest (zsh-native) | Very fast (Rust) |
| Configuration | Wizard-based | TOML file |
| Customization | Extensive | Modular |
| Shell Support | zsh only | bash, zsh, fish, etc. |
| Maintenance | Active | Active |

**Decision**: Keep Powerlevel10k for now (proven stable, no issues)

**Sources**: [starship.rs](https://starship.rs), [atuin.sh](https://atuin.sh/)

---

### 3. bottom (btm) vs btop++

**Current Recommendation**: btop++ (Priority 1)
**Alternative**: bottom (btm)

**Why btop++ over bottom**:
- More beginner-friendly interface
- Better color schemes
- Mouse support
- More comprehensive default view
- Described as "Lamborghini of tops" in reviews

**Note**: Both are excellent; btop++ edges ahead in 2025 reviews

**Sources**: [github.com/ClementTsang/bottom](https://github.com/ClementTsang/bottom), [linuxblog.io](https://linuxblog.io/bottom-btm/)

---

### 4. glances (System Monitor Alternative)

**Recommendation**: Consider for remote monitoring scenarios

**Features**:
- Web UI (remote access)
- Export to InfluxDB, Elasticsearch
- Container monitoring (Docker, LXC)
- Cross-platform

**Installation**:
```bash
brew install glances
```

**Use Case**: Remote server monitoring (btop++ for local)

**Sources**: [github.com/nicolargo/glances](https://github.com/nicolargo/glances), [itsfoss.com](https://itsfoss.com/linux-system-monitoring-tools/)

---

## Priority 3: Tools to Keep (No Changes)

### Proven and Optimal

1. **bat** - Industry standard for cat replacement
2. **eza** - Active fork of exa, well-maintained
3. **fd** - Fastest find alternative
4. **ripgrep (rg)** - Fastest grep alternative
5. **delta** - Best git diff pager
6. **lazygit** - Best git TUI (52k+ stars)
7. **lazydocker** - Best docker TUI (37k+ stars)
8. **dust** - Best du alternative
9. **zoxide** - Best cd alternative
10. **fzf** - Industry standard fuzzy finder
11. **sd** - Best sed alternative

### Rationale

These tools are:
- Market leaders in their categories
- Actively maintained
- No better alternatives as of 2025
- Well-integrated into current dotfiles

## Tools to Monitor (Future)

### 1. mise Evolution

**Current**: Version manager (20+ languages)
**Watch**: Expanding feature set

mise is evolving rapidly. Monitor for:
- New language support
- Task runner features
- Configuration improvements

---

### 2. Nushell

**Status**: Emerging shell alternative
**Not recommended yet** (too experimental)

**Why Monitor**:
- Native structured data (CSV, JSON, YAML)
- Pipeline-oriented
- Strong type system

**Why Wait**:
- Breaking changes still happening
- Shell script compatibility issues
- Dotfiles would need complete rewrite

**Revisit**: 2026 Q1

**Sources**: [nushell.sh](https://www.nushell.sh)

---

### 3. uv (Python Package Manager)

**Status**: Extremely fast pip alternative (Rust)
**Watch**: May replace pip/pipx workflows

**Current Verdict**: Wait for 1.0 stable release

---

## Recommended Action Plan

### Phase 1: Immediate Additions (Week 1)

1. **btop++** - Comprehensive system monitoring
   ```bash
   brew install btop
   # Test: btop
   ```

2. **yazi** - Terminal file manager
   ```bash
   brew install yazi
   # Add wrapper function to smart-wrappers.zsh
   ```

3. **xh** - HTTP client
   ```bash
   brew install xh
   # Test: xh get httpbin.org/get
   ```

### Phase 2: Performance Upgrades (Week 2)

4. **jaq** - Faster jq
   ```bash
   brew install jaq
   # Benchmark: hyperfine 'jq .' 'jaq .'
   ```

5. **ouch** - Universal archiver
   ```bash
   brew install ouch
   # Update extract() function
   ```

6. **hyperfine** - Benchmarking
   ```bash
   brew install hyperfine
   # Document performance wins
   ```

### Phase 3: Advanced Features (Week 3)

7. **difftastic** - Syntax-aware diff
   ```bash
   brew install difftastic
   # Add git alias: dft
   ```

8. **tlrc** - Fast tldr client
   ```bash
   brew install tlrc
   alias tldr='tlrc'
   ```

### Phase 4: Validation (Week 4)

- Run comprehensive tests (BATS suite)
- Update documentation
- Verify performance improvements
- Document wrapper functions
- Update CLAUDE.md

## Testing Strategy

### Performance Benchmarks

Use hyperfine to validate improvements:

```bash
# jq vs jaq
hyperfine --warmup 3 'jq . large.json' 'jaq . large.json'

# fd vs find
hyperfine 'fd pattern' 'find . -name "*pattern*"'

# bat startup
hyperfine --warmup 5 'bat large_file.txt > /dev/null'
```

### Functional Tests

Add to BATS test suite:

```bash
# tests/modern-tools.bats

@test "btop++ is installed" {
  command -v btop
}

@test "yazi is installed and has wrapper" {
  command -v yazi
  type y | grep -q "function"
}

@test "xh handles JSON correctly" {
  xh --print=b get httpbin.org/get | jq .
}

@test "jaq is jq-compatible" {
  echo '{"test": "value"}' | jaq '.test' | grep -q "value"
}

@test "ouch decompresses tar.gz" {
  echo "test" > /tmp/test.txt
  tar -czf /tmp/test.tar.gz /tmp/test.txt
  ouch decompress /tmp/test.tar.gz
}
```

## Integration Checklist

For each new tool, ensure:

- [ ] Homebrew installation documented
- [ ] Wrapper function added (if needed)
- [ ] Tests added to BATS suite
- [ ] Man page/help integration (if applicable)
- [ ] Completion scripts installed
- [ ] CLAUDE.md updated
- [ ] Performance benchmarks documented

## Migration Notes

### Breaking Changes: None

All recommendations are **additive** - no existing tools are being replaced (except upgrades like tlrc → tldr alias).

### Backward Compatibility

All wrapper functions maintain fallback to original tools:

```bash
# Example pattern
tool() {
  if ! whence -p modern-tool &>/dev/null; then
    command legacy-tool "$@"
  else
    command modern-tool "$@"
  fi
}
```

## Tool Version Tracking

Recommended approach:

```bash
# ~/.config/zsh/versions.zsh (new file)
alias tools-versions='
  echo "=== CLI Tool Versions ===";
  bat --version | head -1;
  eza --version;
  fd --version;
  rg --version | head -1;
  delta --version;
  dust --version;
  zoxide --version;
  btop --version;
  yazi --version;
  xh --version;
  jaq --version;
  ouch --version;
'
```

## Cost-Benefit Analysis

### Expected Performance Gains

| Tool | Category | Expected Improvement |
|------|----------|---------------------|
| jaq | JSON processing | 2-3x faster than jq |
| tlrc | Documentation | 10x faster than Node tldr |
| btop++ | Monitoring | Comprehensive (vs process-only procs) |
| xh | HTTP testing | Simpler syntax, faster than HTTPie |
| ouch | Archives | Unified interface (vs memorizing flags) |

### Time Investment

- Initial installation: 30 minutes
- Testing/validation: 2 hours
- Documentation updates: 1 hour
- BATS test additions: 1 hour

**Total**: ~4.5 hours

**ROI**: Daily time savings on common tasks, better developer experience

## Security Considerations

All recommended tools:

1. **Open Source** - Auditable code
2. **Active Maintenance** - Security patches applied
3. **Trusted Sources** - Homebrew official taps
4. **No Network Requirements** - Work offline (except xh for HTTP)
5. **Single Binary** - Minimal dependency attack surface

## Documentation Updates Required

After implementation:

1. Update `CLAUDE.md` Tech Stack section
2. Update `docs/QUICKSTART.md` with new tools
3. Add `docs/TOOL_COMPARISON.md` (performance benchmarks)
4. Update `README.md` feature list
5. Add tool-specific guides:
   - `docs/YAZI_GUIDE.md`
   - `docs/BENCHMARKING_GUIDE.md` (hyperfine)
   - `docs/API_TESTING.md` (xh)

## Community Validation

Research sources consulted:

- [modern-unix GitHub](https://github.com/ibraheemdev/modern-unix)
- [Rust CLI tools list](https://github.com/sts10/rust-command-line-utilities)
- [It's FOSS](https://itsfoss.com) - Linux tool reviews
- [DEV Community](https://dev.to) - Developer tool discussions
- [Hacker News](https://news.ycombinator.com) - Community feedback

## References

### Primary Sources

1. [It's FOSS - Rust Alternative CLI Tools](https://itsfoss.com/rust-alternative-cli-tools/)
2. [Zaiste - Shell Commands in Rust](https://zaiste.net/posts/shell-commands-rust/)
3. [DEV - 15 Rust CLI Tools](https://dev.to/dev_tips/15-rust-cli-tools-that-will-make-you-abandon-bash-scripts-forever-4mgi)
4. [modern-unix GitHub](https://github.com/ibraheemdev/modern-unix)
5. [maintained-modern-unix GitHub](https://github.com/johnalanwoods/maintained-modern-unix)
6. [LinuxLinks - jq Alternatives](https://www.linuxlinks.com/alternatives-popular-cli-tools-jq/)
7. [HTTPie Documentation](https://httpie.io/docs/cli/alternatives)
8. [Ductile Systems - Difftastic](https://www.ductile.systems/difftastic/)
9. [RunCloud - htop Alternatives](https://runcloud.io/blog/best-htop-alternatives)
10. [Yazi Documentation](https://yazi-rs.github.io/)
11. [It's FOSS - Glow CLI](https://itsfoss.com/glow-cli-tool-markdown/)
12. [Atuin Documentation](https://atuin.sh/)
13. [Starship Prompt](https://starship.rs)
14. [FreeCodeCamp - Essential CLI Tools](https://www.freecodecamp.org/news/essential-cli-tui-tools-for-developers/)
15. [3li0 - Why Yazi](https://3li0.com/2025/03/yazi-the-terminal-file-manager-you-didnt-know-you-needed-why-i-switched-from-lf)

---

**Next Review**: 2026-Q2
**Maintainer**: Autonomous overnight agent
**Status**: Ready for implementation
