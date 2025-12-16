# Test-Driven Development (TDD) Workflow

**Status**: Production-Ready
**Last Updated**: 2025-11-25
**Framework**: BATS 1.12.0
**Current Coverage**: 142/142 tests passing (114 unit + 28 integration)

## Philosophy

**TDD Mantra**: RED → GREEN → REFACTOR

1. **RED**: Write a failing test that defines desired behavior
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Clean up code while keeping tests green

**Benefits**:
- Catches regressions immediately
- Forces clear API design upfront
- Documents behavior through tests
- Increases confidence in refactoring
- Reduces debugging time

## Quick Start

### 1. Write a Failing Test (RED)

```bash
# Create or edit test file
cd ~/.local/share/chezmoi
vim tests/unit/my_feature_test.bats

# Add failing test
@test "myfunction: handles empty input → shows usage" {
  load_function "my-feature.zsh"

  run myfunction

  [ "$status" -eq 1 ]
  assert_output_contains "Usage:"
}
```

### 2. Run the Test (Verify RED)

```bash
# Run just your new test
bats -f "myfunction" tests/unit/my_feature_test.bats

# Should FAIL with clear error message
```

### 3. Write Minimal Code (GREEN)

```bash
# Edit implementation
vim private_dot_config/zsh/functions/my-feature.zsh

# Add minimal code to pass test
myfunction() {
  if [[ $# -eq 0 ]]; then
    echo "Usage: myfunction <arg>" >&2
    return 1
  fi
  # ... rest of implementation
}
```

### 4. Deploy and Test (Verify GREEN)

```bash
# Deploy changes
chezmoi apply

# Run test again
bats -f "myfunction" tests/unit/my_feature_test.bats

# Should PASS
```

### 5. Refactor (Keep GREEN)

```bash
# Clean up code while keeping tests passing
# Run tests after each change
bats -f "myfunction" tests/unit/my_feature_test.bats
```

## Test Organization

### Directory Structure

```
tests/
├── unit/                    # Individual functions in isolation
│   ├── smart_wrappers_test.bats
│   ├── git_utils_test.bats
│   └── system_utils_test.bats
├── integration/             # Complete workflows end-to-end
│   ├── shell_startup_test.bats
│   └── mise_integration_test.bats
├── templates/               # NEW: Test templates
│   ├── unit_test_template.bats
│   ├── integration_test_template.bats
│   └── edge_case_test_template.bats
├── test_helper.bash         # Shared utilities
├── run-all.sh              # Run all tests
├── run-unit.sh             # Run unit tests only
├── run-integration.sh      # Run integration tests only
└── watch.sh                # Watch mode for TDD
```

### When to Use Unit vs Integration Tests

**Unit Tests** (`tests/unit/`):
- Test ONE function in isolation
- Mock external dependencies
- Fast execution (< 1ms per test)
- Example: `bat()` wrapper formats output correctly

**Integration Tests** (`tests/integration/`):
- Test complete workflows
- Use real environment
- Slower execution (100ms+ per test)
- Example: Shell startup loads all configs

**Rule of Thumb**: Write unit tests by default. Use integration tests for critical workflows.

## Running Tests

### Basic Commands

```bash
# Run ALL tests (recommended for commits)
cd ~/.local/share/chezmoi
./tests/run-all.sh

# Run unit tests only (fast feedback)
./tests/run-unit.sh

# Run integration tests only (slower)
./tests/run-integration.sh

# Watch mode for TDD (auto-rerun on file change)
./tests/watch.sh
```

### Advanced Commands

```bash
# Run specific test file
bats tests/unit/smart_wrappers_test.bats

# Run tests matching pattern
bats -f "bat" tests/unit/*.bats

# Verbose output (see test names)
bats -t tests/unit/smart_wrappers_test.bats

# Parallel execution (3-4x faster)
bats --jobs 4 tests/unit/*.bats

# TAP output (for CI integration)
bats --tap tests/unit/*.bats
```

### Test Runner Scripts

#### run-all.sh - Run All Tests

```bash
./tests/run-all.sh

# Features:
# - Runs unit tests first (fast feedback)
# - Then runs integration tests
# - Parallel execution when available
# - Clear pass/fail summary
```

#### run-unit.sh - Unit Tests Only

```bash
./tests/run-unit.sh

# Features:
# - Runs all unit tests
# - Parallel execution (3-4x speedup)
# - Fast feedback loop for TDD
```

#### run-integration.sh - Integration Tests Only

```bash
./tests/run-integration.sh

# Features:
# - Runs all integration tests
# - Sequential execution (avoid conflicts)
# - Validates complete workflows
```

#### watch.sh - Watch Mode

```bash
./tests/watch.sh [pattern]

# Examples:
./tests/watch.sh                    # Watch all tests
./tests/watch.sh smart_wrappers     # Watch specific test file
./tests/watch.sh "bat|ls"           # Watch tests matching pattern

# Features:
# - Auto-reruns tests when files change
# - Watches both source and test files
# - Clear screen between runs
# - Shows timestamp of each run
```

## Writing Tests

### Test Structure

Every test file follows this structure:

```bash
#!/usr/bin/env bats
# ============================================================================
# Tests for {Component Name}
# ============================================================================
# Coverage: {brief description}
# Priority: {P0|P1|P2} ({CRITICAL|HIGH|MEDIUM|LOW})

load ../test_helper

setup() {
  # Optional: Additional setup beyond test_helper
}

teardown() {
  # Optional: Additional teardown beyond test_helper
}

@test "{function}: {scenario} → {expected}" {
  # Arrange - Set up test environment
  load_function "source-file.zsh"
  mock_command "dependency" "output"

  # Act - Execute function
  run function_name args

  # Assert - Verify behavior
  [ "$status" -eq 0 ]
  assert_output_contains "expected"
}
```

### Test Naming Convention

**Pattern**: `"{function}: {scenario} → {expected}"`

**Examples**:
- `"bat: wraps batcat with syntax highlighting → colorized output"`
- `"bat: handles missing file → shows error message"`
- `"bat: piped output → disables paging"`
- `"git-root: in git repo → shows repo root path"`
- `"git-root: outside git repo → shows error message"`

**Benefits**:
- Clear documentation of behavior
- Easy filtering with `bats -f`
- Self-documenting test suite

### Test Templates

Use templates to maintain consistency:

```bash
# Copy template
cp tests/templates/unit_test_template.bats tests/unit/my_feature_test.bats

# Edit placeholders
vim tests/unit/my_feature_test.bats

# Replace:
# - {Component Name}
# - {source-file.zsh}
# - {function_name}
# - Test scenarios
```

### Test Helper Functions

All tests have access to `tests/test_helper.bash`:

#### Setup & Teardown

```bash
# Automatic for all tests:
setup()     # Creates temp dir, sets env vars
teardown()  # Cleans up temp dir
```

#### Loading Functions

```bash
load_function "smart-wrappers.zsh"  # Loads from private_dot_config/zsh/functions/
```

#### Mocking

```bash
mock_command "git" "mock output" 0    # Mock with exit code 0
mock_command "tool" "error" 1         # Mock with exit code 1
```

#### Assertions

```bash
# Exit status
[ "$status" -eq 0 ]          # Success
[ "$status" -eq 1 ]          # Failure

# Output checks
assert_output_contains "str"  # Output contains string
refute_output_contains "str"  # Output doesn't contain string
assert_output_equals "exact"  # Exact match

# File checks
assert_file_exists "path"     # File exists
refute_file_exists "path"     # File doesn't exist
assert_dir_exists "path"      # Directory exists
```

## TDD Workflow Examples

### Example 1: Adding a New Function

**Goal**: Add `mktemp-cd` function that creates temp dir and cd's into it

#### Step 1: Write Failing Test (RED)

```bash
# tests/unit/system_utils_test.bats
@test "mktemp-cd: creates temp dir and cd's into it → changes directory" {
  load_function "system-utils.zsh"

  # Store original dir
  local original_dir="$PWD"

  # Run function
  run mktemp-cd

  # Should succeed
  [ "$status" -eq 0 ]

  # Should be in different directory
  [ "$PWD" != "$original_dir" ]

  # Should be in /tmp (or similar)
  [[ "$PWD" == /tmp/* ]] || [[ "$PWD" == /var/* ]]
}
```

Run test (should FAIL):
```bash
bats -f "mktemp-cd" tests/unit/system_utils_test.bats
# ✗ mktemp-cd: creates temp dir and cd's into it → changes directory
#   (in test file tests/unit/system_utils_test.bats, line 45)
#     `run mktemp-cd' failed
#   bash: mktemp-cd: command not found
```

#### Step 2: Write Minimal Code (GREEN)

```bash
# private_dot_config/zsh/functions/system-utils.zsh
mktemp-cd() {
  local tmpdir=$(mktemp -d)
  cd "$tmpdir" || return 1
}
```

Deploy and run test:
```bash
chezmoi apply
bats -f "mktemp-cd" tests/unit/system_utils_test.bats
# ✓ mktemp-cd: creates temp dir and cd's into it → changes directory
```

#### Step 3: Add Edge Cases (More RED tests)

```bash
# tests/unit/system_utils_test.bats
@test "mktemp-cd: prints new directory path → shows temp path" {
  load_function "system-utils.zsh"

  run mktemp-cd

  [ "$status" -eq 0 ]
  assert_output_contains "/tmp/"
}

@test "mktemp-cd: handles mktemp failure → returns error" {
  load_function "system-utils.zsh"

  # Mock mktemp to fail
  mock_command "mktemp" "" 1

  run mktemp-cd

  [ "$status" -eq 1 ]
}
```

#### Step 4: Enhance Code (Keep GREEN)

```bash
# private_dot_config/zsh/functions/system-utils.zsh
mktemp-cd() {
  local tmpdir=$(mktemp -d) || {
    echo "Error: Failed to create temporary directory" >&2
    return 1
  }

  cd "$tmpdir" || {
    echo "Error: Failed to change to temporary directory" >&2
    return 1
  }

  echo "$tmpdir"
}
```

#### Step 5: Refactor (Keep GREEN)

```bash
# Add documentation
# private_dot_config/zsh/functions/system-utils.zsh

# mktemp-cd - Create temporary directory and cd into it
#
# Usage:
#   mktemp-cd
#
# Description:
#   Creates a temporary directory using mktemp and changes into it.
#   Prints the path to the temporary directory.
#
# Examples:
#   mktemp-cd                    # Create temp dir and cd into it
#   tmpdir=$(mktemp-cd)         # Store path and cd into it
#
# Returns:
#   0 on success, 1 on failure
mktemp-cd() {
  local tmpdir=$(mktemp -d) || {
    echo "Error: Failed to create temporary directory" >&2
    return 1
  }

  cd "$tmpdir" || {
    echo "Error: Failed to change to temporary directory" >&2
    return 1
  }

  echo "$tmpdir"
}
```

Run all tests to ensure nothing broke:
```bash
./tests/run-all.sh
# ✓ All tests pass
```

### Example 2: Fixing a Bug

**Bug**: `bat` wrapper doesn't detect piped input correctly

#### Step 1: Write Test for Bug (RED)

```bash
# tests/unit/smart_wrappers_test.bats
@test "bat: piped input → disables paging" {
  load_function "smart-wrappers.zsh"

  # Mock batcat
  mock_command "batcat" "" 0

  # Simulate piped input
  echo "test content" | run bat

  [ "$status" -eq 0 ]
  # Should NOT contain --paging flag (or should be --paging=never)
}
```

Run test (should FAIL):
```bash
bats -f "bat: piped" tests/unit/smart_wrappers_test.bats
# ✗ bat: piped input → disables paging
```

#### Step 2: Fix Bug (GREEN)

```bash
# private_dot_config/zsh/functions/smart-wrappers.zsh
bat() {
  local batcmd=$(command -v batcat 2>/dev/null || command -v bat 2>/dev/null)

  if [[ ! -x "$batcmd" ]]; then
    echo "Error: bat not installed" >&2
    return 1
  fi

  # Detect piped input
  if [[ ! -t 0 ]]; then
    # Piped input - disable paging
    command $batcmd --paging=never "$@"
  else
    # Normal usage - use defaults
    command $batcmd "$@"
  fi
}
```

Deploy and run test:
```bash
chezmoi apply
bats -f "bat: piped" tests/unit/smart_wrappers_test.bats
# ✓ bat: piped input → disables paging
```

#### Step 3: Run All Tests (Verify No Regressions)

```bash
./tests/run-all.sh
# ✓ All tests pass (142/142)
```

## CI/CD Integration

### Pre-Commit Hook

Automatically run tests before commits:

```bash
# Already installed at:
# ~/.local/share/chezmoi/.git/hooks/pre-commit

# Hook runs:
# 1. Unit tests (fast)
# 2. Integration tests (comprehensive)
# 3. Blocks commit if tests fail
```

To bypass (emergencies only):
```bash
git commit --no-verify -m "emergency fix"
```

### Pre-Push Hook

Automatically run tests before pushing:

```bash
# Already installed at:
# ~/.local/share/chezmoi/.git/hooks/pre-push

# Hook runs:
# 1. All tests (unit + integration)
# 2. Blocks push if tests fail
```

To bypass (emergencies only):
```bash
git push --no-verify
```

### GitHub Actions (Future)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install BATS
        run: brew install bats-core
      - name: Run Tests
        run: ./tests/run-all.sh
```

## Best Practices

### 1. Test First, Code Second

**Always write tests before implementation:**
- Forces you to think about API design
- Documents expected behavior
- Catches bugs immediately

### 2. One Assertion per Test (When Possible)

**Bad** (multiple concerns):
```bash
@test "bat: all features work" {
  # Tests syntax highlighting, paging, line numbers, etc.
  # Hard to debug when it fails
}
```

**Good** (focused):
```bash
@test "bat: syntax highlighting → colorized output" {
  # Tests ONE thing
}

@test "bat: paging → uses less by default" {
  # Tests ONE thing
}
```

### 3. Clear Test Names

**Bad**:
```bash
@test "test bat function"
```

**Good**:
```bash
@test "bat: missing file → shows error message"
```

### 4. Test Edge Cases

For every function, test:
- ✓ Happy path (normal usage)
- ✓ Empty input
- ✓ Invalid input
- ✓ Missing dependencies
- ✓ Error conditions
- ✓ Piped input/output

### 5. Mock External Dependencies

**Bad** (relies on real tools):
```bash
@test "function calls git" {
  run myfunction
  # Fails if git not installed
}
```

**Good** (mocked):
```bash
@test "function calls git" {
  mock_command "git" "mock output" 0
  run myfunction
  # Always works
}
```

### 6. Keep Tests Fast

**Guidelines**:
- Unit tests: < 10ms each
- Integration tests: < 500ms each
- Total suite: < 30 seconds

**Techniques**:
- Mock network calls
- Use temp dirs, not real HOME
- Parallel execution for independent tests

### 7. Test What Users See

**Bad** (implementation detail):
```bash
@test "bat: calls batcat with --style flag" {
  # Tests internal implementation
}
```

**Good** (observable behavior):
```bash
@test "bat: syntax highlighting → colorized output" {
  # Tests what users experience
}
```

## Troubleshooting

### Tests Pass Locally but Fail in CI

**Cause**: Environment differences (missing tools, different paths)

**Fix**:
1. Mock ALL external dependencies
2. Don't rely on system-specific paths
3. Use `command -v` to check tool availability

### Tests Fail with "Function file not found"

**Cause**: `load_function()` can't find source files

**Fix**:
```bash
# Ensure running from correct directory
cd ~/.local/share/chezmoi

# Or use absolute paths in test
```

### Tests Fail After chezmoi apply

**Cause**: Source and deployed files out of sync

**Fix**:
```bash
# Always edit source, not deployed files
chezmoi edit ~/.config/zsh/functions/file.zsh

# Then deploy
chezmoi apply
```

### Watch Mode Not Working

**Cause**: `fswatch` not installed

**Fix**:
```bash
brew install fswatch

# Or use manual mode:
while true; do
  clear
  ./tests/run-unit.sh
  sleep 5
done
```

## Common Patterns

### Testing Functions with Side Effects

```bash
@test "mkcd: creates directory and cd's into it" {
  load_function "system-utils.zsh"

  # Store original dir
  local original_dir="$PWD"

  # Create directory
  run mkcd test-dir

  # Verify it exists
  assert_dir_exists "test-dir"

  # Verify we changed directory
  [ "$PWD" != "$original_dir" ]
}
```

### Testing Error Messages

```bash
@test "function: invalid input → shows clear error" {
  load_function "my-feature.zsh"

  run myfunction --invalid-flag

  [ "$status" -eq 1 ]
  assert_output_contains "Error:"
  assert_output_contains "Usage:"
}
```

### Testing Conditional Behavior

```bash
@test "bat: terminal output → enables paging" {
  load_function "smart-wrappers.zsh"
  mock_command "batcat" "" 0

  # Simulate terminal (not piped)
  run bat file.txt

  # Should use paging
}

@test "bat: piped output → disables paging" {
  load_function "smart-wrappers.zsh"
  mock_command "batcat" "" 0

  # Simulate piped input
  echo "content" | run bat

  # Should NOT use paging
}
```

### Testing with Mocked Commands

```bash
@test "function: calls dependency correctly → passes args" {
  load_function "my-feature.zsh"

  # Mock dependency
  mock_command "git" "mock output" 0

  run myfunction arg1 arg2

  [ "$status" -eq 0 ]
  assert_output_contains "mock output"
}
```

## Resources

### Documentation

- [BATS Core Documentation](https://bats-core.readthedocs.io/)
- Test Suite README (see tests folder in private repo)
- Test Helper Functions (`tests/test_helper.bash`)

### Templates

- Unit Test Template (`tests/templates/unit_test_template.bats`)
- Integration Test Template (`tests/templates/integration_test_template.bats`)
- Edge Case Test Template (`tests/templates/edge_case_test_template.bats`)

### Examples

- Smart Wrappers Tests (`tests/unit/smart_wrappers_test.bats`) - 15 tests
- Git Utils Tests (`tests/unit/git_utils_test.bats`) - 12 tests
- Shell Startup Tests (`tests/integration/shell_startup_test.bats`) - 6 tests
- mise Integration Tests (`tests/integration/mise_integration_test.bats`) - 22 tests

## Quick Reference

### TDD Cycle

```bash
# 1. RED - Write failing test
vim tests/unit/my_test.bats
bats -f "mytest" tests/unit/my_test.bats  # Should FAIL

# 2. GREEN - Make test pass
vim private_dot_config/zsh/functions/my-feature.zsh
chezmoi apply
bats -f "mytest" tests/unit/my_test.bats  # Should PASS

# 3. REFACTOR - Clean up code
vim private_dot_config/zsh/functions/my-feature.zsh
bats -f "mytest" tests/unit/my_test.bats  # Should STILL PASS

# 4. VERIFY - Run all tests
./tests/run-all.sh                        # All tests PASS
```

### Common Commands

```bash
# Watch mode (TDD)
./tests/watch.sh

# Run specific test
bats -f "pattern" tests/unit/*.bats

# Run fast unit tests
./tests/run-unit.sh

# Run comprehensive suite
./tests/run-all.sh

# Deploy changes
chezmoi apply

# Commit (runs tests automatically)
git commit -m "feat: new feature"
```

### Test Structure

```bash
@test "{function}: {scenario} → {expected}" {
  # Arrange
  load_function "file.zsh"
  mock_command "tool" "output"

  # Act
  run function args

  # Assert
  [ "$status" -eq 0 ]
  assert_output_contains "expected"
}
```

## Summary

**TDD in 3 Steps**:
1. **RED**: Write failing test
2. **GREEN**: Make test pass
3. **REFACTOR**: Clean up code

**Key Tools**:
- `./tests/run-all.sh` - Run all tests
- `./tests/watch.sh` - Auto-rerun tests
- `bats -f "pattern"` - Run specific tests
- Pre-commit hooks - Auto-run before commits

**Benefits**:
- Catch bugs immediately
- Confident refactoring
- Self-documenting code
- Faster development (after initial investment)

**Next Steps**:
1. Try the TDD cycle with a small feature
2. Use watch mode (`./tests/watch.sh`) for fast feedback
3. Write tests for existing code (when bugs found)
4. Gradually increase coverage to 80%+

---

**Happy Testing! 🧪**
