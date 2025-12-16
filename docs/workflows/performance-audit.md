# Performance Optimization Workflow

Analyze shell performance, identify bottlenecks, and generate optimization recommendations.

## Metadata

```yaml
workflow: performance-optimization
agents:
  - zsh-performance-auditor
  - dotfiles-maintainer
execution: sequential
estimated_time: 35s
priority: medium
```

## Purpose

Conduct comprehensive performance analysis of shell startup time, identify slow components, and provide actionable optimization plan with expected improvements.

## Workflow Steps

### Phase 1: Performance Profiling (25s)

**Agent 1: zsh-performance-auditor**
- Run startup time benchmarks (10 iterations)
- Enable zprof module for component profiling
- Measure individual plugin overhead
- Benchmark completion system (compinit)
- Analyze PATH lookup performance
- Measure source file overhead
- Profile function definition costs

**Output**: Detailed performance breakdown with bottlenecks

### Phase 2: System Health Context (8s)

**Agent 2: dotfiles-maintainer**
- Check current tool versions
- Identify outdated packages
- Detect orphaned configurations
- Validate active plugins
- Check .zcompdump freshness

**Output**: Configuration context for optimization

### Phase 3: Recommendation Generation (2s)

Combine performance data with system context:
- Prioritize optimizations by impact
- Calculate expected time savings
- Generate phased optimization plan
- Provide specific fix commands

## Execution

### Via Workflow Launcher
```bash
# Run performance audit
workflow performance

# Or explicitly
workflow performance-optimization
```

### Via Slash Command
```bash
# In Claude Code
/agent zsh-performance-auditor
```

### Scheduled Audit
```bash
# Monthly performance check
# Add to crontab
0 9 1 * * /usr/local/bin/workflow performance > ~/.cache/monthly-perf.log 2>&1
```

## Expected Output

### Terminal Output (Live)
```
🔄 Running performance optimization workflow...

Phase 1: Profiling shell startup... (25s)
  ├─ Benchmarking startup time (10 runs)... ✓ avg: 165ms
  ├─ Profiling with zprof...                ✓ top: compinit (45ms)
  ├─ Measuring plugin overhead...           ✓ 12 plugins (35ms)
  ├─ Analyzing completion system...         ✓ .zcompdump 14 days old
  └─ Checking PATH performance...           ✓ 47 entries, 6 duplicates

Phase 2: Gathering system context... (8s)
  ├─ Checking tool versions...              ✓ 2 outdated
  ├─ Scanning for orphans...                ✓ 1 found
  └─ Validating plugins...                  ✓ 2 unused

Phase 3: Generating recommendations... ✓ (1.8s)

✅ Performance audit complete (35.2s total)

📊 Current: 165ms | Target: 95ms | Potential savings: -70ms

Optimization plan generated: ~/.cache/performance-optimization-plan.md
```

### Optimization Plan Report

```markdown
# Performance Optimization Plan
Generated: 2025-10-31 15:00:00
Current Startup: 165ms | Target: 95ms

## 🎯 Executive Summary

**Current Performance**: ⚠️ Acceptable (165ms)
**Target Performance**: Excellent (<100ms)
**Optimization Potential**: -70ms (42% improvement)
**Complexity**: Low (mostly config changes)

Recommended approach: 3-phase optimization with quick wins first.

---

## 📊 Performance Breakdown

### Current Startup Components

| Component                     | Time   | % Total | Priority |
|-------------------------------|--------|---------|----------|
| compinit (completion)         | 45ms   | 27.3%   | 🔴 High  |
| oh-my-zsh initialization      | 35ms   | 21.2%   | 🟡 Med   |
| fzf keybindings               | 18ms   | 10.9%   | 🟢 Low   |
| gh completion                 | 12ms   | 7.3%    | 🟡 Med   |
| powerlevel10k prompt          | 10ms   | 6.1%    | ✅ Good  |
| direnv hook                   | 9ms    | 5.5%    | 🟢 Low   |
| zsh-autosuggestions           | 8ms    | 4.8%    | 🟢 Low   |
| custom functions              | 7ms    | 4.2%    | 🟢 Low   |
| mise activation               | 6ms    | 3.6%    | 🟢 Low   |
| zoxide init                   | 5ms    | 3.0%    | ✅ Good  |
| Other                         | 10ms   | 6.1%    | -        |

**Total**: 165ms

---

## 🚀 Optimization Phases

### Phase 1: Quick Wins (Expected: -45ms, 10 minutes)

**1.1: Enable compinit Caching** (-30ms)
```bash
# Edit: ~/.config/zsh/config/30-completions.zsh
# Change line 15:
# FROM: compinit
# TO:   compinit -C

# Regenerate dump:
rm ~/.zcompdump && zsh -i -c 'compinit'
```

**Rationale**: compinit -C skips security check, trusting cached dump.
**Risk**: Low (dump auto-regenerates daily via cron)
**Expected**: 45ms → 15ms (-30ms)

**1.2: Deduplicate PATH** (-5ms)
```bash
# Edit: ~/.config/zsh/config/00-environment.zsh
# Add at the end:
typeset -U path  # Remove duplicate PATH entries

# Verify:
echo $PATH | tr ':' '\n' | sort | uniq -d  # Should be empty
```

**Rationale**: Shorter PATH = faster command lookups
**Risk**: None
**Expected**: PATH lookups faster by ~5ms

**1.3: Update .zcompdump** (-10ms)
```bash
# .zcompdump is 14 days old
rm ~/.zcompdump && zsh -i -c 'compinit'
```

**Rationale**: Fresh dump = faster loading
**Risk**: None
**Expected**: Faster completion init

**Phase 1 Total**: -45ms | New startup: 120ms

---

### Phase 2: Plugin Optimization (Expected: -15ms, 20 minutes)

**2.1: Disable Unused Plugins** (-10ms)
```bash
# Edit: ~/.config/zsh/config/10-omz.zsh
# Current plugins (12):
# git, docker, kubectl, sudo, extract, web-search, copypath, copyfile,
# copybuffer, dirhistory, jsontools, systemadmin

# Audit usage (check history):
history | awk '{print $2}' | sort | uniq -c | sort -rn

# Likely unused:
- web-search (never used)
- jsontools (we have jq)
- systemadmin (macOS-specific, rarely used)

# Remove from plugins array
plugins=(git docker kubectl sudo extract copypath copyfile copybuffer dirhistory)
```

**Expected**: 35ms → 25ms (-10ms)

**2.2: Lazy-load gh completion** (-5ms)
```bash
# Edit: ~/.config/zsh/config/20-plugins.zsh
# Change:
# FROM: eval "$(gh completion -s zsh)"
# TO:
gh() {
  unfunction gh
  eval "$(command gh completion -s zsh)"
  gh "$@"
}
```

**Expected**: gh completion only loads on first use

**Phase 2 Total**: -15ms | New startup: 105ms

---

### Phase 3: Advanced Optimizations (Expected: -10ms, 30 minutes)

**3.1: Lazy-load mise/pyenv** (-5ms)
```bash
# Edit: ~/.config/zsh/config/20-plugins.zsh
# Defer activation via direnv
# Add to .envrc in project dirs:
# eval "$(mise activate zsh)"
```

**3.2: Autoload Rarely-Used Functions** (-3ms)
```bash
# Instead of sourcing all functions at startup,
# autoload them on first use

# Edit: ~/.config/zsh/config/00-environment.zsh
fpath=(~/.config/zsh/functions $fpath)
autoload -Uz mktemp-cd watchfile urlencode urldecode

# Remove these from functions/dev.zsh to avoid double-loading
```

**3.3: Optimize Custom Function Loading** (-2ms)
```bash
# Combine small function files
cat functions/system.zsh functions/git-utils.zsh > functions/combined.zsh

# Update .zshrc to source combined file
```

**Phase 3 Total**: -10ms | New startup: 95ms ✅

---

## 📈 Expected Results

### Before Optimization
```
Startup Time: 165ms
Status: ⚠️ Acceptable
Performance Tier: Good
```

### After Phase 1 (Quick Wins)
```
Startup Time: 120ms (-45ms, -27%)
Status: ✅ Good
Performance Tier: Good+
Effort: 10 minutes
```

### After Phase 2 (Plugin Optimization)
```
Startup Time: 105ms (-60ms, -36%)
Status: ✅ Excellent
Performance Tier: Excellent
Effort: +20 minutes (30 total)
```

### After Phase 3 (Advanced)
```
Startup Time: 95ms (-70ms, -42%)
Status: ✅ Excellent
Performance Tier: Excellent+
Effort: +30 minutes (60 total)
```

---

## 🎯 Recommended Approach

**Start with Phase 1** (biggest impact, lowest effort):
1. Enable compinit -C
2. Deduplicate PATH
3. Regenerate .zcompdump

**Then benchmark**:
```bash
# Benchmark after Phase 1
time zsh -i -c exit  # Should be ~120ms

# If satisfied, stop here
# If want more, continue to Phase 2
```

**Phase 2 if needed**:
- Disable unused plugins
- Lazy-load gh completion

**Phase 3 optional**:
- Advanced techniques for marginal gains
- Only if targeting < 100ms

---

## 🔧 Implementation Commands

### Phase 1 (Copy/Paste)
```bash
# 1. Enable compinit caching
sed -i '' 's/^compinit$/compinit -C/' ~/.config/zsh/config/30-completions.zsh

# 2. Deduplicate PATH
echo '\n# Remove duplicate PATH entries\ntypeset -U path' >> ~/.config/zsh/config/00-environment.zsh

# 3. Regenerate dump
rm ~/.zcompdump && zsh -i -c 'compinit'

# 4. Restart shell and benchmark
exec zsh
time zsh -i -c exit  # Should see improvement
```

---

## 📊 Historical Performance

### Trend Analysis
```
Oct 29: 145ms (baseline)
Oct 30: 158ms (+13ms) - Added fzf integration
Oct 31: 165ms (+20ms) - Added more plugins
Nov 01: 95ms (-70ms)  - ← Target after optimization
```

**Conclusion**: Optimizations will restore to better than baseline.

---

## ⚠️ Potential Risks

### compinit -C
- **Risk**: Skips security check on completion files
- **Mitigation**: Regenerate dump weekly via cron
- **Severity**: Low

### Lazy-loading
- **Risk**: First use of lazy-loaded tools slightly slower
- **Mitigation**: Only lazy-load infrequent tools
- **Severity**: Very Low

### Plugin removal
- **Risk**: Lose functionality of removed plugins
- **Mitigation**: Only remove genuinely unused plugins
- **Severity**: Low (easy to re-enable)

---

## 🎓 Best Practices for Long-Term Performance

1. **Monitor regularly**: Run performance audit monthly
2. **Audit plugins**: Remove unused plugins immediately
3. **Update completion dump**: Weekly via cron
4. **Profile new additions**: Benchmark before/after adding plugins
5. **Lazy-load when possible**: Heavy tools (nvm, rbenv) via direnv

---

## 📅 Next Steps

1. Review optimization plan
2. Decide which phases to implement
3. Run Phase 1 optimizations (10 min)
4. Benchmark and verify improvement
5. Schedule next performance audit (1 month)

---

Generated by: zsh-performance-auditor v1.0.0 + dotfiles-maintainer v1.0.0
Report ID: perf-optimization-20251031-150000
```

## Success Criteria

- ✅ Identifies all major performance bottlenecks
- ✅ Provides phased optimization plan
- ✅ Includes specific fix commands (copy/paste ready)
- ✅ Calculates expected time savings
- ✅ Prioritizes by effort vs impact
- ✅ Completes audit in < 40 seconds

## Best Practices

### When to Run
- **Monthly**: Regular performance checkup
- **After major changes**: Added plugins, changed config
- **When startup feels slow**: Subjective slowness
- **After tool updates**: New mise/brew versions

### Optimization Strategy
1. **Always start with Phase 1** (quick wins)
2. **Benchmark after each phase** (verify improvements)
3. **Stop when satisfied** (don't over-optimize)
4. **Monitor over time** (prevent regression)

## Integration Points

- **zsh-performance-auditor**: Core profiling
- **dotfiles-maintainer**: System context
- **Monitoring**: Track historical performance
- **Alerts**: Notify on regression

---

**Status**: Production Ready
**Last Updated**: 2025-10-31
**Workflow ID**: performance-optimization-v1
