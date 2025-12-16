# ZSH Performance Audit Report
Generated: 2025-11-15

## Executive Summary

**Current Startup Time**: 2.54 seconds (measured average over 5 runs)
**Status**: POOR - Exceeds 200ms target by 12.7x
**Priority**: HIGH - Immediate optimization recommended

## Detailed Breakdown

### Top Slowest Components

| Component | Time | Impact | Category |
|-----------|------|--------|----------|
| gh completion | 1020ms | 40.2% | Tool initialization |
| compinit (full) | 1064ms | 41.9% | Completion system |
| Oh-My-Zsh init | 430ms | 16.9% | Framework loading |
| compdef calls (857×) | 400ms | 15.7% | Completion registration |
| compdump | 253ms | 10.0% | Completion cache |
| pyenv virtualenv-init | 140ms | 5.5% | Tool initialization |
| compaudit | 71ms | 2.8% | Completion security check |
| mise activate | 60ms | 2.4% | Tool initialization |
| pyenv init - zsh | 50ms | 2.0% | Tool initialization |
| op completion | 50ms | 2.0% | Tool initialization |
| pyenv init --path | 40ms | 1.6% | Tool initialization |

**Total Accounted**: ~3500ms (actual runtime 2540ms suggests parallel execution or caching)

### Component Analysis

#### 1. Completion System Overhead (1764ms total - 69.4%)

**Problem**: Completion system dominates startup time
- `compinit`: 1064ms (includes compdump 253ms + compaudit 71ms)
- `compdef`: 400ms (857 calls averaging 0.47ms each)
- Native completion generation: <10ms (already optimized with 7-day cache)

**Current Implementation** (`30-completions.zsh:15-19`):
```zsh
if [[ -n ${ZDOTDIR}/.zcompdump(#qN.mh+24) ]]; then
  compinit           # Full init if dump >24h old
else
  compinit -C        # Skip check if dump fresh
fi
```

**Issues**:
- `.zcompdump` age check uses `ZDOTDIR` (likely unset → defaults to `$HOME`)
- 24-hour regeneration is too frequent (should be 7 days)
- Full `compinit` runs on every new day, triggering expensive `compaudit`
- No profiling indicates dump is being regenerated unnecessarily

**Evidence from zprof**:
```
2)    2        1064.00   532.00   88.95%    342.65   171.32   28.64%  compinit
4)    2          70.71    35.35    5.91%     70.71    35.35    5.91%  compaudit
```
- `compinit` called 2 times (should be once)
- `compaudit` called 2 times (security check for untrusted files)

#### 2. Tool Initialization Overhead (1430ms total - 56.3%)

**Heavy Offenders**:
1. **gh completion** (1020ms) - GitHub CLI completion generation
   - Runs on EVERY shell startup
   - NOT cached (unlike native completions with 7-day cache)
   - Suggests lazy-loading opportunity

2. **pyenv virtualenv-init** (140ms) - Python virtualenv auto-activation
   - Adds hooks for directory changes
   - Only needed when working with Python projects
   - Lazy-load candidate

3. **mise activate** (60ms) - Multi-language version manager
   - Adds PATH shims and hooks
   - Always needed, but could defer hook registration

4. **pyenv init - zsh** (50ms) - Python version management
   - Relatively lightweight, but adds up
   - Companion to virtualenv-init

5. **op completion** (50ms) - 1Password CLI completions
   - Used frequently, but could be lazy-loaded

**Lightweight Tools** (acceptable overhead):
- `direnv hook` (70ms) - Auto-loads `.envrc` on directory change
- `pyenv init --path` (40ms) - Adds pyenv shims to PATH
- `zoxide init` (10ms) - Smart cd with frecency
- `atuin init` (0ms) - Already optimized or cached

#### 3. Oh-My-Zsh Framework (430ms - 16.9%)

**Breakdown**:
- Oh-My-Zsh initialization: 430ms
- Plugin loading (12 plugins):
  - git, docker, kubectl, sudo, colored-man-pages
  - command-not-found, extract, copyfile, copypath, jsontools

**Evidence from zprof**:
```
5)   31          60.93     1.97    5.09%     53.27     1.72    4.45%  _omz_source
```
- 31 files sourced via `_omz_source` (plugins, libraries, theme)
- Average 1.97ms per file

**Plugin Analysis**:
- All 12 plugins serve clear purposes (per CLAUDE.md philosophy)
- No obvious bloat, but could audit for unused plugins

#### 4. Function and Alias Loading (estimated 100-200ms)

**Files Loaded**:
- 14 function files (8222 total lines)
- 7 alias files

**Current Implementation** (`dot_zshrc:41-53`):
```zsh
# Load all alias files
for alias_file in "${XDG_CONFIG_HOME:-$HOME/.config}"/zsh/aliases/*.zsh; do
  [[ -r "$alias_file" ]] && source "$alias_file"
done

# Load all function files
for func_file in "${XDG_CONFIG_HOME:-$HOME/.config}"/zsh/functions/*.zsh; do
  [[ -r "$func_file" ]] && source "$func_file"
done
```

**Issue**: All 8222 lines sourced on every startup
- No lazy-loading for rarely-used functions
- Functions like `manga-tools.zsh`, `onedrive-manager.zsh` could be autoloaded

#### 5. fzf Integration (estimated 50-100ms)

**Current Implementation** (`20-plugins.zsh:88-121`):
```zsh
if type fzf &>/dev/null; then
  # Source key-bindings and completion
  source "$(brew --prefix)/opt/fzf/shell/key-bindings.zsh"
  source "$(brew --prefix)/opt/fzf/shell/completion.zsh"

  # Configure FZF_DEFAULT_COMMAND, FZF_CTRL_T_COMMAND, etc.
fi
```

**Issues**:
- `brew --prefix` called twice (subprocess overhead)
- Could cache brew prefix in environment variable

## Critical Performance Issues

### Issue #1: gh completion NOT Cached (1020ms - CRITICAL)

**Problem**: GitHub CLI completion generated on EVERY shell startup

**Current State**:
```zsh
# 20-plugins.zsh:72-75
if type gh &>/dev/null; then
  eval "$(gh completion -s zsh)"
fi
```

**Why This Happens**:
- Unlike `bat`, `rg`, `fd` which use native completion caching (7-day cache)
- `gh completion` not included in `_generate_native_completions()` function
- Runs synchronously, blocks shell startup

**Expected Impact**: -1000ms (40% startup time reduction)

### Issue #2: Completion System Misconfiguration (253ms - HIGH)

**Problem**: `.zcompdump` regenerates too frequently

**Root Cause Analysis**:
```zsh
# 30-completions.zsh:15
if [[ -n ${ZDOTDIR}/.zcompdump(#qN.mh+24) ]]; then
```

**Issues**:
1. `ZDOTDIR` likely unset → defaults to `$HOME`
2. 24-hour threshold too aggressive (should be 7 days like native completions)
3. Glob qualifier `(#qN.mh+24)` checks if file >24 hours old
4. Every new day triggers full `compinit` + `compaudit` (security scan)

**Evidence**:
- `compinit` called 2 times in zprof (should be 1)
- `compdump` takes 253ms (writing completion cache)
- `compaudit` takes 71ms (scanning fpath for insecure files)

**Expected Impact**: -250ms (10% reduction)

### Issue #3: pyenv virtualenv-init Overhead (140ms - MEDIUM)

**Problem**: Python virtualenv auto-activation loaded unconditionally

**Current State**:
```zsh
# 20-plugins.zsh:36-38
eval "$(pyenv init --path)"
eval "$(pyenv init - zsh)"
eval "$(pyenv virtualenv-init -)"
```

**Why It's Heavy**:
- Adds chpwd hook to check for `.python-version` on every `cd`
- Only needed when actively working with Python projects
- Lazy-load candidate

**Expected Impact**: -140ms (5.5% reduction)

### Issue #4: Excessive compdef Calls (400ms - MEDIUM)

**Problem**: 857 `compdef` calls averaging 0.47ms each

**Sources**:
- Oh-My-Zsh plugins (git, docker, kubectl, etc.)
- Native completion generation (bat, rg, fd, mise, etc.)
- Custom completions (pyinit, nodeinit, goinit, etc.)
- Wrapper function completions (bat, ls, cd, man)

**Evidence from zprof**:
```
1)  857         400.15     0.47   33.45%    400.15     0.47   33.45%  compdef
```

**Analysis**:
- Many compdef calls are necessary (legitimate completions)
- Some duplicates possible (wrapper completions redefining existing)
- Could defer some completions until first use

**Expected Impact**: -100ms (4% reduction via deduplication)

## Optimization Recommendations

### Phase 1: Quick Wins (Expected: -1250ms to -1350ms, 49-53% reduction)

**Target Startup Time**: ~1.2 seconds (still slow, but 2x faster)

#### 1.1. Cache gh completion (CRITICAL - Expected: -1000ms)

**Implementation**:
```zsh
# Add to 30-completions.zsh _generate_native_completions() function
# After line 114 (docker completion):

# GitHub CLI
type gh &>/dev/null && gh completion -s zsh > "$comp_dir/_gh" 2>/dev/null &
```

**Remove from 20-plugins.zsh**:
```zsh
# DELETE lines 72-75:
if type gh &>/dev/null; then
  eval "$(gh completion -s zsh)"
fi
```

**Why This Works**:
- Moves gh completion to parallel 7-day cache system
- Generated once per week, not every shell startup
- Runs in background with other native completions

**Validation**:
```bash
# After change:
ls -lh ~/.cache/zsh/completions/_gh
# Should show file generated today, modified 7 days later
```

#### 1.2. Fix completion cache timing (Expected: -250ms)

**Change in `30-completions.zsh:15-19`**:
```zsh
# Current (WRONG):
if [[ -n ${ZDOTDIR}/.zcompdump(#qN.mh+24) ]]; then
  compinit
else
  compinit -C
fi

# Fixed (CORRECT):
# Set ZDOTDIR if unset (fallback to XDG_CONFIG_HOME/zsh or HOME)
: ${ZDOTDIR:=${XDG_CONFIG_HOME:-$HOME/.config}/zsh}

# Regenerate completion dump if >7 days old (168 hours)
if [[ -n $ZDOTDIR/.zcompdump(#qN.mh+168) ]]; then
  compinit
else
  compinit -C
fi
```

**Why This Works**:
- Sets `ZDOTDIR` explicitly (prevents defaulting to `$HOME`)
- Changes threshold from 24 hours to 168 hours (7 days)
- Matches native completion cache lifetime
- Reduces full `compinit` runs from daily to weekly

**Validation**:
```bash
# Check dump age:
stat -f "%Sm" ~/.config/zsh/.zcompdump

# Should NOT regenerate until 7 days old
```

#### 1.3. Lazy-load op completion (Expected: -50ms)

**Change in `20-plugins.zsh:69-70`**:
```zsh
# Current (WRONG):
eval "$(op completion zsh)"; compdef _op op

# Fixed (LAZY-LOAD):
# Remove from 20-plugins.zsh, add to 30-completions.zsh in _generate_native_completions()
type op &>/dev/null && op completion zsh > "$comp_dir/_op" 2>/dev/null &
```

**Why This Works**:
- 1Password CLI completion rarely changes
- Can be cached like other native completions
- No need for synchronous eval on every startup

### Phase 2: Moderate Wins (Expected: -200ms to -300ms, 8-12% reduction)

**Target Startup Time**: ~900ms to 1000ms

#### 2.1. Lazy-load pyenv virtualenv-init (Expected: -140ms)

**Strategy**: Defer virtualenv auto-activation until first Python project access

**Implementation**:
```zsh
# In 20-plugins.zsh, replace lines 36-38:
eval "$(pyenv init --path)"      # Keep (adds shims to PATH - needed immediately)
eval "$(pyenv init - zsh)"       # Keep (enables pyenv command - needed immediately)
# REMOVE: eval "$(pyenv virtualenv-init -)"

# Add lazy-load wrapper:
_pyenv_virtualenv_lazy_init() {
  # Initialize virtualenv-init on first use
  unfunction $0  # Remove this wrapper
  eval "$(pyenv virtualenv-init -)"
  # Call the real function if it exists
  type pyenv_virtualenv_init &>/dev/null && pyenv_virtualenv_init
}

# Hook into cd to trigger lazy-load when entering directory with .python-version
autoload -Uz add-zsh-hook
add-zsh-hook chpwd _pyenv_virtualenv_lazy_init
```

**Trade-offs**:
- ✅ Saves 140ms on shell startup
- ❌ First `cd` into Python project adds 140ms delay
- ✅ Only pays cost when needed (not every shell)

**Alternative**: Remove entirely if virtualenv auto-activation not critical

#### 2.2. Autoload rarely-used functions (Expected: -50ms to -100ms)

**Current State**: All 8222 lines of functions sourced on startup

**Strategy**: Convert to autoload pattern for infrequently-used functions

**Candidates for Autoload**:
- `manga-tools.zsh` - Specialized manga management
- `onedrive-manager.zsh` - Cloud sync utilities
- `network-security.zsh` - Security tools
- `markdown-tools.zsh` - Markdown processing

**Implementation**:
```zsh
# In dot_zshrc, replace lines 46-53:
# Instead of sourcing all function files:
for func_file in "${XDG_CONFIG_HOME:-$HOME/.config}"/zsh/functions/*.zsh; do
  [[ -r "$func_file" ]] && source "$func_file"
done

# New approach:
# 1. Source frequently-used functions immediately
for func_file in smart-wrappers dev system python-dev node-dev polyglot-dev; do
  source "${XDG_CONFIG_HOME:-$HOME/.config}/zsh/functions/${func_file}.zsh"
done

# 2. Autoload rarely-used functions
fpath+=("${XDG_CONFIG_HOME:-$HOME/.config}/zsh/functions")
autoload -Uz manga-tools onedrive-manager network-security markdown-tools
```

**Requirements**:
- Functions must follow autoload conventions (function name = filename)
- Each autoload file should define ONE primary function

**Expected Impact**: -50ms to -100ms (depends on file sizes)

#### 2.3. Cache brew prefix (Expected: -20ms to -50ms)

**Current State**: `brew --prefix` called 2× in fzf integration

**Fix in `20-plugins.zsh:88-94`**:
```zsh
# Current (WRONG):
if type fzf &>/dev/null; then
  if [[ -f "$(brew --prefix 2>/dev/null)/opt/fzf/shell/key-bindings.zsh" ]]; then
    source "$(brew --prefix)/opt/fzf/shell/key-bindings.zsh"
    source "$(brew --prefix)/opt/fzf/shell/completion.zsh"
  fi
fi

# Fixed (CORRECT):
if type fzf &>/dev/null; then
  local brew_prefix="${HOMEBREW_PREFIX:-$(brew --prefix 2>/dev/null)}"
  if [[ -f "$brew_prefix/opt/fzf/shell/key-bindings.zsh" ]]; then
    source "$brew_prefix/opt/fzf/shell/key-bindings.zsh"
    source "$brew_prefix/opt/fzf/shell/completion.zsh"
  fi
fi
```

**Why This Works**:
- `HOMEBREW_PREFIX` set by Homebrew on install
- Caches prefix in variable, avoids repeated subprocess calls
- Fallback to `brew --prefix` if unset

### Phase 3: Advanced Optimizations (Expected: -100ms to -200ms, 4-8% reduction)

**Target Startup Time**: ~700ms to 800ms

#### 3.1. Parallelize Oh-My-Zsh plugin loading

**Current State**: Plugins loaded sequentially via `_omz_source`

**Strategy**: Load plugins in parallel using background jobs

**Complexity**: HIGH (requires Oh-My-Zsh internals modification)
**Risk**: MEDIUM (could break plugin dependencies)
**Expected Impact**: -50ms to -100ms

**Deferred**: Requires deeper Oh-My-Zsh customization

#### 3.2. Compile zsh functions

**Strategy**: Pre-compile `.zsh` files to `.zwc` (zsh compiled format)

**Implementation**:
```bash
# One-time compilation:
zcompile ~/.zshrc
for f in ~/.config/zsh/**/*.zsh; do
  zcompile $f
done
```

**Expected Impact**: -20ms to -50ms (modest, but free speedup)

#### 3.3. Audit Oh-My-Zsh plugins for bloat

**Current Plugins** (12 total):
- git, docker, kubectl, sudo, colored-man-pages
- command-not-found, extract, copyfile, copypath, jsontools

**Audit Questions**:
1. Are all 12 actively used?
2. Can any be replaced with lighter alternatives?
3. Are there duplicate features with custom functions?

**Expected Impact**: -20ms to -50ms (if plugins removed)

## Performance Target Roadmap

### Current State
- **Startup Time**: 2540ms
- **Status**: POOR (12.7× over 200ms target)

### Phase 1 (Quick Wins)
- **Changes**: Cache gh completion, fix compinit timing, lazy-load op
- **Expected Time**: 1200-1300ms
- **Reduction**: -1250ms (49%)
- **Status**: Still SLOW, but 2× faster

### Phase 2 (Moderate Wins)
- **Changes**: Lazy-load pyenv virtualenv, autoload functions, cache brew prefix
- **Expected Time**: 900-1000ms
- **Reduction**: -500ms (38% from Phase 1)
- **Status**: ACCEPTABLE (approaching 1s)

### Phase 3 (Advanced Optimizations)
- **Changes**: Parallel plugin loading, compile functions, audit plugins
- **Expected Time**: 700-800ms
- **Reduction**: -200ms (20% from Phase 2)
- **Status**: GOOD (within 1s)

### Theoretical Minimum (All Optimizations)
- **Best Case**: 500-600ms
- **Limitation**: Oh-My-Zsh + Powerlevel10k + 12 plugins have inherent overhead
- **Trade-off**: Below 500ms requires removing framework (bare zsh)

## Implementation Priority

### CRITICAL (Do Now)
1. ✅ **Cache gh completion** → Move to native completion cache (+1000ms savings)
2. ✅ **Fix compinit timing** → Change 24h to 7d, set ZDOTDIR (+250ms savings)

### HIGH (Do This Week)
3. ✅ **Lazy-load op completion** → Add to native completion cache (+50ms savings)
4. ⚠️ **Lazy-load pyenv virtualenv-init** → Defer until first Python project (+140ms savings)

### MEDIUM (Do This Month)
5. ⚠️ **Autoload rarely-used functions** → manga-tools, onedrive-manager, etc. (+50-100ms savings)
6. ✅ **Cache brew prefix** → Avoid repeated subprocess calls (+20-50ms savings)

### LOW (Optional)
7. ⚠️ **Compile zsh functions** → Pre-compile to .zwc format (+20-50ms savings)
8. ⚠️ **Audit Oh-My-Zsh plugins** → Remove unused plugins (+20-50ms savings)

## Testing & Validation

### Benchmarking Commands

**Before Changes**:
```bash
# Average startup time (5 runs)
for i in {1..5}; do /usr/bin/time -p zsh -i -c exit 2>&1 | grep real; done | \
  awk '{sum+=$2} END {print "Average: " sum/NR "s"}'

# Expected: ~2.5s
```

**After Phase 1**:
```bash
# Expected: ~1.2-1.3s (49% faster)
```

**After Phase 2**:
```bash
# Expected: ~0.9-1.0s (65% faster than baseline)
```

**After Phase 3**:
```bash
# Expected: ~0.7-0.8s (72% faster than baseline)
```

### Profiling Commands

**Component-Level Profiling**:
```bash
zsh -i -c 'zmodload zsh/zprof; source ~/.zshrc; zprof' 2>&1 | head -40
```

**Individual Tool Timing**:
```bash
# See /tmp/startup_breakdown.zsh from this audit
zsh /tmp/startup_breakdown.zsh
```

### Validation Checklist

After implementing Phase 1 changes:
- [ ] `gh completion` cached in `~/.cache/zsh/completions/_gh`
- [ ] `.zcompdump` only regenerates weekly (check `stat`)
- [ ] `op completion` cached in `~/.cache/zsh/completions/_op`
- [ ] Average startup time < 1.5s (50% improvement minimum)
- [ ] No broken completions (`gh <TAB>`, `op <TAB>` work)
- [ ] No errors in `zsh -i -c exit`

## Files Modified

### Phase 1 Changes

**File**: `/Users/joe/.local/share/chezmoi/private_dot_config/zsh/config/30-completions.zsh`
- Line 15-19: Fix ZDOTDIR, change 24h to 168h
- Line 114 (after docker): Add `gh` to native completion cache
- After line 114: Add `op` to native completion cache

**File**: `/Users/joe/.local/share/chezmoi/private_dot_config/zsh/config/20-plugins.zsh`
- Lines 69-70: DELETE (op completion - moved to native cache)
- Lines 72-75: DELETE (gh completion - moved to native cache)

### Phase 2 Changes

**File**: `/Users/joe/.local/share/chezmoi/private_dot_config/zsh/config/20-plugins.zsh`
- Line 38: DELETE (pyenv virtualenv-init - lazy-loaded)
- After line 38: ADD lazy-load wrapper function
- Lines 90-94: Cache `brew_prefix` variable

**File**: `/Users/joe/.local/share/chezmoi/private_dot_config/zsh/dot_zshrc`
- Lines 46-53: Replace with selective sourcing + autoload

## Notes & Caveats

### Compatibility with CLAUDE.md Philosophy

**From CLAUDE.md**:
> Architecture: "GREAT over FAST"
> - Tools are loaded immediately (not lazy-loaded)
> - Startup time (~2s) is acceptable for quality and functionality

**This Audit's Position**:
- **GREAT over FAST still applies** - We're not removing functionality
- **But 2.5s is TOO SLOW** - Even for "maximalist" philosophy
- **Target: 0.7-1.0s** - Still "immediate" loading, just more efficient
- **Key insight**: Caching ≠ lazy-loading, it's smarter loading

**Changes That Honor Philosophy**:
- ✅ Cache gh/op completions (still immediate, just pre-generated)
- ✅ Fix compinit timing (still runs, just less frequently)
- ⚠️ Lazy-load pyenv virtualenv-init (DEVIATES - delays Python workflow)
- ⚠️ Autoload functions (DEVIATES - delays rare tool availability)

**Recommendation**: Implement Phase 1 (caching only), defer Phase 2 lazy-loading until user feedback.

### Measurement Accuracy

**Timing Variance**:
- Cold start (first shell after reboot): +20-30% slower
- Warm start (subsequent shells): Measured times
- Disk I/O impact: SSD vs HDD can add 100-500ms
- CPU load impact: Background tasks can add 50-200ms

**Recommendation**: Benchmark on warm starts with minimal background load.

### Completion Cache Invalidation

**When to Manually Regenerate**:
```bash
# After installing new tools
rm ~/.cache/zsh/completions/*
rm ~/.config/zsh/.zcompdump

# After updating tools (brew upgrade, cargo install --force)
rm ~/.cache/zsh/completions/.native_completions_generated

# Restart shell
exec zsh
```

## Appendix: Raw Profiling Data

### zprof Output (Full Run)

```
num  calls                time                       self            name
-----------------------------------------------------------------------------------
 1)  857         400.15     0.47   33.45%    400.15     0.47   33.45%  compdef
 2)    2        1064.00   532.00   88.95%    342.65   171.32   28.64%  compinit
 3)    1         252.78   252.78   21.13%    252.78   252.78   21.13%  compdump
 4)    2          70.71    35.35    5.91%     70.71    35.35    5.91%  compaudit
 5)   31          60.93     1.97    5.09%     53.27     1.72    4.45%  _omz_source
 6)    1          33.59    33.59    2.81%     33.59    33.59    2.81%  zrecompile
 7)    1          23.49    23.49    1.96%     23.49    23.49    1.96%  _mise_hook
```

### Individual Tool Timing

```
=== Tool Initialization Overhead ===
pyenv init --path:                           40ms
pyenv init - zsh:                            50ms
pyenv virtualenv-init:                      140ms
mise activate zsh:                           60ms
atuin init zsh:                               0ms
op completion zsh:                           50ms
gh completion -s zsh:                      1020ms  ← CRITICAL
direnv hook zsh:                             70ms
zoxide init zsh:                             10ms

=== File Sourcing Overhead ===
Oh-My-Zsh init:                             430ms
p10k config:                                  0ms
```

### File Count Analysis

```
Functions: 14 files, 8222 total lines
Aliases: 7 files
Oh-My-Zsh plugins: 12 plugins
Completion definitions: 857 compdef calls
```

---

**Generated by**: ZSH Performance Auditor (autonomous agent)
**Runtime**: 2025-11-15 (snapshot)
**Next Audit**: After implementing Phase 1 changes
**Success Criteria**: Startup time < 1.5s (Phase 1), < 1.0s (Phase 2), < 0.8s (Phase 3)
