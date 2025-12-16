# Baseline Audit - Testing & Organization

**Date**: 2025-11-01
**Purpose**: Document current state before implementing comprehensive test suite

---

## Test Results (Phase 0 Validation)

### Existing Test Suite: **0/32 PASSING** ❌

**Total Tests**: 32 tests across 3 files
- `python_dev.bats`: 8 tests (0 passing)
- `node_dev.bats`: 8 tests (0 passing)
- `polyglot_dev.bats`: 16 tests (0 passing)

### Root Cause: File Rename Issue

**Problem**: Tests reference old filenames that no longer exist.

**Test Files Reference**:
```bash
load_function "python-dev.zsh"  # File doesn't exist
load_function "node-dev.zsh"    # File doesn't exist
load_function "polyglot-dev.zsh" # File doesn't exist
```

**Actual Filenames in Source**:
```bash
private_dot_config/zsh/functions/
├── dev.zsh              ✅ Exists
├── git-utils.zsh        ✅ Exists
├── node-dev.zsh         ✅ Exists
├── polyglot-dev.zsh     ✅ Exists
├── python-dev.zsh       ✅ Exists
├── smart-wrappers.zsh   ✅ Exists
└── system.zsh           ✅ Exists
```

**Resolution**: Files exist with correct names. The issue is the test files are in `tests/` (git root), but `load_function()` looks in `private_dot_config/zsh/functions/` relative to `$ORIGINAL_DIR`.

Need to verify test_helper.bash path resolution.

---

## Chezmoi Deployment Audit

### Status Output
```bash
$ chezmoi status
 R macos.sh
 A scripts
 A scripts/detect-tools.sh
 A scripts/install-cli-tools.sh
 A scripts/install-dev-tools.sh
 A scripts/install-shell-tools.sh
 A tests
 A tests/node_dev.bats
 A tests/polyglot_dev.bats
 A tests/python_dev.bats
 A tests/test_helper.bash
```

**Issue**: Meta files showing as "A" (added/untracked) by chezmoi.
- `tests/` directory (test suite) - should NOT deploy to ~/
- `scripts/` directory (installer utils) - should NOT deploy to ~/
- These are git-tracked but not dotfiles

**Impact**: Confusing status output, unclear what chezmoi will do with these files.

### Managed Files Check
Running: `chezmoi managed | grep -E "\.md$|tests|scripts|bootstrap"`

**Expected**: No .md, tests/, or scripts/ files should be deployed to home directory.

---

## Code Inventory

### Shell Functions (43 functions across 7 files)

| File | Functions | LOC | Tests | Coverage |
|------|-----------|-----|-------|----------|
| **polyglot-dev.zsh** | 7 | ~500 | 16 (broken) | 0% |
| **node-dev.zsh** | 5 | ~300 | 8 (broken) | 0% |
| **python-dev.zsh** | 6 | ~350 | 8 (broken) | 0% |
| **smart-wrappers.zsh** | 4 | 150 | 0 | 0% |
| **system.zsh** | 6 | 200 | 0 | 0% |
| **git-utils.zsh** | 7 | 250 | 0 | 0% |
| **dev.zsh** | 8 | 300 | 0 | 0% |
| **TOTAL** | **43** | ~2,050 | 32 (0 working) | **0%** |

### Bootstrap Scripts (5 files, 1,601 lines)

| File | LOC | Purpose | Tests | Coverage |
|------|-----|---------|-------|----------|
| **install.sh** | 204 | One-line installer entry point | 0 | 0% |
| **bootstrap-tools.sh** | 389 | Main orchestrator | 0 | 0% |
| **scripts/detect-tools.sh** | 251 | Tool detection | 0 | 0% |
| **scripts/install-shell-tools.sh** | 163 | Oh-My-Zsh installer | 0 | 0% |
| **scripts/install-cli-tools.sh** | 307 | Modern CLI tools | 0 | 0% |
| **scripts/install-dev-tools.sh** | 337 | Developer tools | 0 | 0% |
| **TOTAL** | **1,651** | | **0** | **0%** |

---

## Key Findings

### ✅ Strengths
1. **Good test infrastructure exists**: test_helper.bash with mocking, assertions, setup/teardown
2. **32 tests written**: Good foundation, just need fixing
3. **BATS 1.12.0 installed**: Modern version with tagging support
4. **Clear separation**: Functions organized by category

### ❌ Critical Issues
1. **Zero working tests**: All 32 tests broken due to path resolution
2. **No bootstrap script tests**: 1,651 lines of critical code untested
3. **Confusing chezmoi state**: Meta files showing as untracked
4. **No documentation**: No tests/README.md or testing guide

### ⚠️  Risks
1. **Bootstrap scripts untested**: High risk of breaking user installations
2. **Refactoring dangerous**: No safety net for changes
3. **New contributors**: Can't verify their changes work
4. **CI not integrated**: No automated testing on push

---

## Coverage Calculation

**Testable Units**: 43 functions + ~15 script entry points = ~58 units

**Tests Written**: 32 tests
**Tests Passing**: 0 tests

**Actual Coverage**: 0% (all tests broken)
**Potential Coverage**: 55% (if tests were fixed)
**Target Coverage**: >80%

**Gap to Close**:
- Fix 32 existing tests → 55% coverage
- Add 90 bootstrap tests → 70% coverage
- Add 40 function tests → 85% coverage
- Add 18 integration tests → 90% coverage

---

## Next Steps (Phase 1)

1. **Update .chezmoiignore** to exclude:
   - tests/
   - scripts/
   - docs/
   - bootstrap-tools.sh
   - install.sh
   - *.md (root level)
   - LICENSE

2. **Verify chezmoi status is clean** after .chezmoiignore update

3. **Move to Phase 2**: Fix broken tests

---

## Appendix: Test Helper Analysis

**File**: `tests/test_helper.bash`

**Key Functions**:
- `setup()`: Creates temp dir, sets $HOME, $XDG_CONFIG_HOME
- `teardown()`: Cleans up temp dir
- `load_function()`: Sources function file from `$ORIGINAL_DIR/private_dot_config/zsh/functions`
- `mock_command()`: Creates mock executable in temp dir
- `assert_*()`: Various assertions (file_exists, dir_exists, output_contains)

**Path Resolution**:
```bash
source_dir="${ORIGINAL_DIR}/private_dot_config/zsh/functions"
```

Where `ORIGINAL_DIR` is set to `$(pwd)` before cd to temp dir.

**Hypothesis**: Tests run from `tests/` directory, so `ORIGINAL_DIR` = `/Users/joe/.local/share/chezmoi/tests`, not the repo root.

**Fix Needed**: Update `load_function()` to use correct base path, or run tests from repo root.

---

**Status**: Baseline audit complete. Ready for Phase 1 (Clean chezmoi state).
