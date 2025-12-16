# Pre-Commit Validation Workflow

Validate code and documentation quality before committing changes to git.

## Metadata

```yaml
workflow: pre-commit-validation
agents:
  - test-validator
  - doc-synchronizer
execution: parallel
estimated_time: 20s
priority: critical
gate: true  # Block commit on failure
```

## Purpose

Ensure code quality and documentation accuracy before committing changes. Run comprehensive tests and doc validation in parallel to catch issues early.

## Workflow Steps

### Phase 1: Parallel Validation (15s)

Launch both validators simultaneously:

**Agent 1: test-validator**
- Extract all documented test cases
- Run system.zsh function tests
- Run git-utils.zsh function tests
- Run dev.zsh function tests
- Validate smart wrapper pipe detection
- Check tool availability fallbacks
- Verify edge case handling

**Agent 2: doc-synchronizer**
- Compare function signatures vs docs
- Test all documented examples
- Validate file path references
- Check tool references in TOOLS.md
- Scan for broken links (internal)
- Detect stale version numbers
- Find placeholder text (TODO, FIXME)

### Phase 2: Result Analysis (3s)

Determine commit gate decision:
- **PASS**: All tests pass, docs accurate → Allow commit
- **FAIL**: Any test fails or critical doc issue → Block commit
- **WARN**: Tests pass, minor doc issues → Allow with warning

### Phase 3: Report & Action (2s)

Generate validation report and take action:
- Display pass/fail summary
- List any failures with fix suggestions
- Exit with appropriate code (0 = pass, 1 = fail)
- Update git commit message with validation badge

## Execution

### Via Git Pre-Commit Hook

**Setup (one-time)**:
```bash
# Create hook directory
mkdir -p ~/.config/git/hooks

# Create pre-commit hook
cat > ~/.config/git/hooks/pre-commit << 'EOF'
#!/bin/zsh
# Pre-commit validation workflow

echo "🔄 Running pre-commit validation..."

# Run workflow
if ! workflow pre-commit --quiet; then
  echo "❌ Pre-commit validation failed!"
  echo "Fix issues or use: git commit --no-verify"
  exit 1
fi

echo "✅ Validation passed"
exit 0
EOF

# Make executable
chmod +x ~/.config/git/hooks/pre-commit

# Configure git to use hooks
git config --global core.hooksPath ~/.config/git/hooks
```

### Via Workflow Launcher
```bash
# Run manually before committing
workflow pre-commit

# Or explicitly
workflow pre-commit-validation
```

### Via Slash Command
```bash
# In Claude Code
/agent test-validator, doc-synchronizer
```

## Expected Output

### Terminal Output (Success)
```
🔄 Running pre-commit validation...

Launching validators in parallel:
  ├─ test-validator...     ✓ (12.3s) - 87/87 tests passed
  └─ doc-synchronizer...   ✓ (10.1s) - 0 issues found

Analyzing results... ✓ (1.2s)

✅ Pre-commit validation PASSED (14.1s total)

📊 Summary:
  Tests:        87/87 passed (100%)
  Doc Issues:   0
  Gate Status:  OPEN ✅

Safe to commit!
```

### Terminal Output (Failure)
```
🔄 Running pre-commit validation...

Launching validators in parallel:
  ├─ test-validator...     ✗ (13.5s) - 85/87 tests passed
  └─ doc-synchronizer...   ⚠  (9.8s) - 2 warnings

Analyzing results... ✓ (1.1s)

❌ Pre-commit validation FAILED (15.2s total)

📊 Summary:
  Tests:        85/87 passed (97.7%)
  Failed Tests: 2
  Doc Issues:   2 (warnings)
  Gate Status:  BLOCKED ❌

🔴 Test Failures (2)

F-001: bat pipe detection
  File: functions/smart-wrappers.zsh:15
  Test: Piped output should be plain
  Fix:  Update pipe detection logic

F-002: port invalid input
  File: functions/system.zsh:42
  Test: Invalid port should show error
  Fix:  Add input validation

⚠️ Doc Warnings (2)

W-001: Broken link in README.md
  Link: [Setup Guide](docs/SETUP.md)
  Fix:  Create file or remove link

W-002: Stale example
  File: README.md:125
  Fix:  Update path reference

🔧 To commit anyway: git commit --no-verify
🔧 To fix and retry: Fix issues above, then git add & commit again

---

Detailed reports:
  Tests: ~/.cache/test-validation-report.md
  Docs:  ~/.cache/doc-sync-report.md
```

## Gate Behavior

### Block Commit When:
- ❌ Any test fails
- ❌ Broken internal links in docs
- ❌ Example commands don't work
- ❌ Function signatures don't match docs

### Allow with Warning When:
- ⚠️ Minor doc issues (stale versions)
- ⚠️ Optional tests skipped (missing tools)
- ⚠️ External links broken (network issue)

### Always Allow:
- ✅ All tests pass
- ✅ All docs synchronized
- ✅ No critical issues

## Bypass Options

### Temporary Bypass
```bash
# Skip validation for one commit
git commit --no-verify -m "WIP: Work in progress"

# Use sparingly! Only for:
- Work-in-progress commits
- Emergency fixes
- Non-code changes (images, etc.)
```

### Permanent Bypass
```bash
# Disable hook globally (NOT RECOMMENDED)
git config --global core.hooksPath ""

# Or remove hook
rm ~/.config/git/hooks/pre-commit
```

## Validation Report

### Full Report Structure

```markdown
# Pre-Commit Validation Report
Generated: 2025-10-31 14:45:30
Commit: feat: Add smart bat wrapper

## 🎯 Gate Decision: PASS ✅

All validation checks passed. Safe to commit.

---

## ✅ Test Validation (87/87 passed)

### System Utilities - All Passed
✓ mkcd: creates and enters directory
✓ mkcd: handles nested paths
✓ port: identifies process on port
✓ backup: creates timestamped backup
✓ extract: handles .tar.gz files
✓ path: lists PATH entries
✓ reload: restarts shell

### Git Utilities - All Passed
✓ git-undo: reverts last commit
✓ git-amend: amends without changing message
✓ git-root: navigates to repo root
✓ git-ignore: adds pattern to .gitignore

### Development Utilities - All Passed
✓ serve: starts on default port
✓ retry: succeeds on first try
✓ json: pretty-prints JSON
✓ timestamp: outputs ISO format

**Coverage**: 23/23 functions tested (100%)
**Pass Rate**: 100%

---

## ✅ Documentation Validation (0 issues)

### File References - All Valid
✓ All path references exist
✓ All tool references valid
✓ No broken internal links

### Examples - All Working
✓ All README examples tested
✓ All function examples work
✓ Version numbers current

### Structure - Consistent
✓ All required sections present
✓ Cross-references accurate
✓ No placeholder text

**Health Score**: 100/100

---

## 📊 Commit Metadata

**Modified Files**: 3
  - functions/smart-wrappers.zsh
  - README.md
  - docs/TOOLS.md

**Lines Changed**: +47, -12

**Validation Time**: 14.1s
**Gate Status**: OPEN ✅

---

## 🚀 Ready to Commit

```bash
git commit -m "feat: Add smart bat wrapper with pipe detection

- Implements context-aware bat wrapper
- Detects terminal vs piped output
- Falls back to plain mode when piped
- Adds comprehensive test coverage

✓ Validated: 87/87 tests passed, 0 doc issues"
```

---

Generated by: test-validator v1.0.0 + doc-synchronizer v1.0.0
Report ID: pre-commit-20251031-144530
```

## Success Criteria

- ✅ Catches test failures before commit
- ✅ Detects doc/code drift before commit
- ✅ Completes in < 20 seconds
- ✅ Clear pass/fail indication
- ✅ Actionable fix suggestions
- ✅ Bypass option available for WIP commits

## Best Practices

### When to Bypass
```bash
# ✅ Good reasons to bypass:
- git commit --no-verify -m "WIP: Experimenting with idea"
- git commit --no-verify -m "docs: Fix typo" (trivial change)
- git commit --no-verify -m "chore: Add .gitignore entry"

# ❌ Bad reasons to bypass:
- "Tests are failing but I'll fix later" (NO!)
- "Don't have time to fix docs" (NO!)
- "This is just a small change" (run validation anyway!)
```

### Commit Message Enhancement
```bash
# Validation adds metadata to commit messages

# Before:
feat: Add retry function

# After (auto-enhanced):
feat: Add retry function

- Implements retry with configurable attempts
- Adds delay between retries
- Includes comprehensive test coverage

✓ Pre-commit validation passed
✓ Tests: 87/87 (100%)
✓ Docs: 0 issues
```

## Integration Points

- **test-validator**: Run all function tests
- **doc-synchronizer**: Validate documentation
- **Git hooks**: Block commits on failure
- **CI/CD**: Complement with GitHub Actions

## Historical Tracking

### Success Rate Monitoring
```bash
# Track validation results
echo "$(date +%Y-%m-%d) | PASS | 87/87 tests" >> ~/.cache/pre-commit-history.log

# Analyze trends
tail -50 ~/.cache/pre-commit-history.log | grep FAIL | wc -l
# Goal: < 5% failure rate
```

---

**Status**: Production Ready
**Last Updated**: 2025-10-31
**Workflow ID**: pre-commit-v1
