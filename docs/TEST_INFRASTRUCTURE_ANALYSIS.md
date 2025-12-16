# Test Infrastructure Analysis & Improvement Plan
**Date**: 2025-11-15
**Trigger**: User request for TDD improvements and parallel test execution

## Current State

### Test Coverage
- **Total**: 240 tests across 20 files
- **Status**: All passing (100% success rate)
- **Framework**: BATS (Bash Automated Testing System)

### Test Distribution
```
Integration (17 files, 219 tests):
  - deployment_test.bats (3)
  - shell_startup_test.bats (6) [NEW: Added P10k tests today]
  - ai_tools_test.bats (36)
  - dotfiles_* (91 tests across 10 files)
  - git_utils_test.bats (12)
  - install_test.bats (9)
  - smart_wrappers_test.bats (15)
  - system_utils_test.bats (4)
  - *_dev.bats (32 tests)

Unit (3 files, 21 tests):
  - dotfiles_list_test.bats (14)
  - python_dev.bats (8) [PARTIAL isolation]
  - utility_functions_test.bats (21)
```

## CRITICAL GAPS IDENTIFIED

### 1. Parallelization Impossible with Current Design
**Problem**: 17/20 test files modify shared state
- `cd` changes working directory globally
- `export` modifies environment globally  
- `git commit` modifies repo state
- `chezmoi apply` modifies deployed files

**Impact**: Only 3 files can run in parallel (12.5% speedup max)

**Root Cause**: Tests not isolated in subshells/temp environments

### 2. BATS Limitations for Zsh Testing
**Problem**: BATS is Bash-focused
- Zsh-specific features not testable (glob qualifiers, parameter expansion)
- Syntax differences require workarounds
- No native zsh test framework

**Example**:
```zsh
# This zsh code can't be properly tested in BATS:
files=(*.md(#qN.mh+24))  # Glob qualifiers
${(s.:.)PATH}            # Parameter expansion flags
```

### 3. No TDD Workflow Integration
**Problem**: Tests written AFTER code
- test-validator agent is PROTOTYPE only (line 474: "not yet executable")
- No agent drives test-first development
- No pre-commit hook enforcing test coverage

**Evidence**: Today's P10k fix followed this pattern:
1. Write fix
2. Test manually
3. Add tests retroactively
4. Commit

**Should be**:
1. Write failing test
2. Implement fix
3. Test passes
4. Commit

### 4. Test Execution Time Not Tracked
**Problem**: No baseline for "acceptable" test time
- Full suite currently takes ~27s (from bash output)
- No per-file timing metrics
- No alerting on slow tests

### 5. Notion Project Metadata Stale
**Problem**: Project page says "230/230 tests passing"
- Actually 240/240 (10 tests added, not updated)
- No automated sync
- Success metrics incomplete

## Proposed Solutions

### Phase 1: Immediate Wins (This Session)

#### 1.1. Enable BATS Parallel Execution
```bash
# Install GNU parallel (required for --jobs)
brew install parallel

# Create parallel test runner
cat > tests/run-parallel.sh <<'SCRIPT'
#!/bin/bash
# Parallel test execution with proper grouping

# Group 1: Pure unit tests (run in parallel)
bats --jobs 3 \
  tests/unit/dotfiles_list_test.bats \
  tests/unit/python_dev.bats \
  tests/unit/utility_functions_test.bats &
GROUP1=$!

# Group 2: Integration tests (run sequentially but parallel to Group 1)
bats tests/integration/*.bats &
GROUP2=$!

# Group 3: Dev workflow tests (run sequentially but parallel to others)
bats tests/workflows/*.bats &
GROUP3=$!

# Wait for all groups
wait $GROUP1 $GROUP2 $GROUP3
SCRIPT

chmod +x tests/run-parallel.sh
```

**Expected Speedup**: 27s → ~10s (3x improvement)

#### 1.2. Add Test Timing Metrics
```bash
# Wrapper to track execution time
time bats --formatter tap tests/**/*.bats | tee /tmp/test-results.tap
```

#### 1.3. Update Notion Project
- Correct test count: 240/240
- Add "Parallel execution" to success metrics
- Document TDD gap

### Phase 2: Test Isolation Refactoring (Next Session)

#### 2.1. Subshell Isolation Pattern
```bash
# Before (modifies global state):
@test "cd to directory" {
  cd /tmp/test
  [[ $PWD == "/tmp/test" ]]
}

# After (isolated):
@test "cd to directory" {
  (
    cd /tmp/test
    [[ $PWD == "/tmp/test" ]]
  )
  # PWD unchanged in parent shell
}
```

#### 2.2. Environment Isolation
```bash
# Before (modifies global env):
@test "export sets variable" {
  export TEST_VAR="value"
  [[ $TEST_VAR == "value" ]]
}

# After (isolated):
@test "export sets variable" {
  (
    export TEST_VAR="value"
    [[ $TEST_VAR == "value" ]]
  )
  # TEST_VAR not set in parent
}
```

#### 2.3. Filesystem Isolation
```bash
# Pattern: Each test gets unique temp dir
setup() {
  export TEST_TEMP_DIR="/tmp/bats-test-$$-${BATS_TEST_NUMBER}"
  mkdir -p "$TEST_TEMP_DIR"
  cd "$TEST_TEMP_DIR"
}

teardown() {
  cd /
  rm -rf "$TEST_TEMP_DIR"
}
```

**Target**: 80% of tests parallelizable (17/20 files)
**Expected Speedup**: 27s → ~5s (5-6x improvement)

### Phase 3: Zsh-Native Testing (Future)

#### 3.1. Add zunit Framework
```bash
# Install zunit (pure zsh testing)
brew tap zunit-zsh/zunit
brew install zunit

# Example test:
#!/usr/bin/env zunit

@test 'glob qualifiers work' {
  # Native zsh syntax, no BATS limitations
  files=(*.md(#qN.mh+24))
  assert $#files -gt 0
}
```

#### 3.2. Dual Test Suites
- BATS: Integration tests, cross-shell compatibility
- zunit: Zsh-specific features, performance-critical code

### Phase 4: TDD Agent Creation

#### 4.1. New Agent: `tdd-driver`
```yaml
---
name: tdd-driver
description: "Drives test-first development. Use PROACTIVELY when implementing features - writes failing tests BEFORE code, ensures tests pass, then commits. Enforces TDD workflow."
tools: Bash, Read, Write, Edit, Grep, Glob
model: 'inherit'
---

# TDD Driver Agent

## Workflow

1. **Understand requirement** from user request
2. **Write failing test** that describes expected behavior
3. **Run test** to confirm it fails (red)
4. **Implement minimal code** to make test pass
5. **Run test** to confirm it passes (green)
6. **Refactor** if needed (keeping tests green)
7. **Commit** with test + implementation together

## Example Flow

User: "Add a function to check if a port is in use"

Agent:
1. Create test file: tests/unit/port_check_test.bats
2. Write test:
   ```bash
   @test "port_in_use returns 0 when port occupied" {
     # Start server on port 8888
     python3 -m http.server 8888 &
     SERVER_PID=$!
     sleep 1
     
     # Test function
     run port_in_use 8888
     [ "$status" -eq 0 ]
     
     # Cleanup
     kill $SERVER_PID
   }
   ```
3. Run: `bats tests/unit/port_check_test.bats` → FAILS (function doesn't exist)
4. Implement in functions/network.zsh:
   ```zsh
   port_in_use() {
     lsof -i :"$1" &>/dev/null
   }
   ```
5. Run: `bats tests/unit/port_check_test.bats` → PASSES
6. Commit both test + implementation

## Success Criteria
- ✅ Test written BEFORE implementation
- ✅ Test fails initially (confirms it's testing something)
- ✅ Implementation makes test pass
- ✅ No commits without tests
```

#### 4.2. Pre-Commit Hook Integration
```bash
# .git/hooks/pre-commit
#!/bin/bash

# Run tests before commit
if ! bats tests/**/*.bats; then
  echo "❌ Tests failed. Commit blocked."
  exit 1
fi

# Check for untested new functions
NEW_FUNCTIONS=$(git diff --cached --diff-filter=A | grep -E "^[a-z_-]+\(\) \{")
if [[ -n "$NEW_FUNCTIONS" ]]; then
  echo "⚠️  New functions detected. Do they have tests?"
  echo "$NEW_FUNCTIONS"
  read -p "Continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi
```

## Implementation Priority

### HIGH (This Session)
1. ✅ Document gaps (this file)
2. 🔄 Enable BATS parallel execution
3. 🔄 Add timing metrics
4. 🔄 Update Notion project
5. 🔄 Create tdd-driver agent spec

### MEDIUM (Next Session)
6. Refactor top 10 test files for isolation
7. Implement parallel test runner
8. Add pre-commit hook
9. Create test coverage dashboard

### LOW (Future)
10. Add zunit for zsh-native tests
11. Migrate performance-critical tests to zunit
12. Full test suite parallelization (target: <5s)

## Success Metrics

### Before
- Test execution time: 27s
- Parallel files: 3/20 (15%)
- TDD workflow: Manual, inconsistent
- Coverage tracking: None

### After (Phase 1)
- Test execution time: <10s (3x faster)
- Parallel files: 3/20 (15%) [unchanged, but grouped efficiently]
- TDD workflow: Agent-driven, enforced
- Coverage tracking: Automated, tracked in Notion

### After (Phase 2)
- Test execution time: <5s (5-6x faster)
- Parallel files: 17/20 (85%)
- TDD workflow: Pre-commit enforced
- Coverage tracking: Real-time dashboard

## Related Work
- P10k instant prompt fix (today): Demonstrates need for TDD
  - Tests added AFTER fix (retroactive)
  - Should have been test-first
- test-validator agent: Currently PROTOTYPE only, needs implementation

---

**Status**: Analysis complete, implementation pending user approval
**Next Action**: Get user confirmation, then execute Phase 1
