# BATS Test Helper Guide - Modernized 2025

**Status**: Production-ready
**Last Updated**: November 25, 2025
**Architecture**: Modular helper system with specialized utilities

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Core Test Helper](#core-test-helper)
5. [Mock Helper](#mock-helper)
6. [Fixture Helper](#fixture-helper)
7. [Platform Helper](#platform-helper)
8. [Assertion Helper](#assertion-helper)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)
11. [Troubleshooting](#troubleshooting)

---

## Overview

This test helper infrastructure provides a **modern, modular approach** to writing BATS tests for our dotfiles project. It follows 2025 best practices from the BATS ecosystem and provides specialized utilities for common testing patterns.

### Key Features

- **Modular Design**: Core + specialized helpers (mocking, fixtures, platform, assertions)
- **Cross-Platform**: Works on macOS, Linux, and WSL
- **DRY**: Reusable helpers eliminate test code duplication
- **Type-Safe**: Specialized assertions for strings, numbers, files, JSON, etc.
- **Well-Documented**: Clear function names, extensive comments, examples

### Philosophy

Following [CLAUDE.md](../CLAUDE.md) testing principles:

- **DRY**: Helpers for common patterns
- **Defensive**: Handle edge cases gracefully
- **Cross-platform**: Test on all supported systems
- **Self-documenting**: Clear naming and comments

### References

- [BATS Core Documentation](https://bats-core.readthedocs.io/en/stable/writing-tests.html)
- [bats-support](https://github.com/bats-core/bats-support) - Supporting library patterns
- [bats-assert](https://github.com/bats-core/bats-assert) - Assertion library patterns
- [bats-file](https://github.com/bats-core/bats-file) - File system assertions

---

## Architecture

### File Structure

```
tests/
├── test_helper.bash           # Core setup/teardown, basic assertions
├── helpers/
│   ├── mock_helper.bash       # Advanced mocking and stubbing
│   ├── fixture_helper.bash    # Test data management
│   ├── platform_helper.bash   # Cross-platform utilities
│   └── assertion_helper.bash  # Enhanced assertions
├── fixtures/                  # Immutable test data
├── examples/
│   └── modern_helpers_demo.bats  # Comprehensive examples
└── unit/                      # Actual test suites
```

### Module Responsibilities

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| **test_helper.bash** | Core infrastructure | `setup()`, `teardown()`, basic assertions |
| **mock_helper.bash** | Command mocking | `create_tracked_mock()`, `assert_mock_call_count()` |
| **fixture_helper.bash** | Test data | `load_fixture()`, `create_git_fixture()` |
| **platform_helper.bash** | Platform detection | `get_platform()`, `skip_unless_macos()` |
| **assertion_helper.bash** | Enhanced assertions | `assert_string_starts_with()`, `assert_json_value()` |

### Auto-Loading

The core `test_helper.bash` automatically loads all helper modules:

```bash
load_helper_module "platform_helper"
load_helper_module "mock_helper"
load_helper_module "fixture_helper"
load_helper_module "assertion_helper"
```

You get all helpers by simply loading the core:

```bash
load ../test_helper
```

---

## Quick Start

### Basic Test Template

```bash
#!/usr/bin/env bats

load ../test_helper

@test "my feature works" {
  # Setup is automatic (creates TEST_TEMP_DIR, etc.)

  # Create test data
  create_test_file "config.txt" "key=value"

  # Run your code
  run my_command config.txt

  # Assert results
  assert_success
  assert_output_contains "Success"

  # Cleanup is automatic (teardown removes TEST_TEMP_DIR)
}
```

### Running Tests

```bash
# Run all tests
bats tests/

# Run specific test file
bats tests/unit/my_test.bats

# Run with verbose output
bats --verbose tests/unit/my_test.bats

# Run demo to see all helpers in action
bats tests/examples/modern_helpers_demo.bats
```

---

## Core Test Helper

**File**: `tests/test_helper.bash`

### Setup and Teardown

Automatically runs before/after each test:

```bash
setup() {
  # Creates:
  # - TEST_TEMP_DIR: Isolated temporary directory
  # - XDG_CONFIG_HOME, XDG_CACHE_HOME, XDG_DATA_HOME
  # - TEST_BIN_DIR: For mock commands
  # - ORIGINAL_DIR: Path to chezmoi source root
}

teardown() {
  # Cleans:
  # - Removes TEST_TEMP_DIR and all contents
  # - Restores original PATH
}
```

### Environment Variables

Available in all tests:

```bash
TEST_TEMP_DIR       # Isolated temp directory (cleaned after test)
TEST_BIN_DIR        # For mock executables
ORIGINAL_DIR        # Path to ~/.local/share/chezmoi
REAL_HOME           # Original HOME before test override
XDG_CONFIG_HOME     # Test XDG config directory
XDG_CACHE_HOME      # Test XDG cache directory
XDG_DATA_HOME       # Test XDG data directory
```

### Function Loading

```bash
# Load single zsh function for testing
load_function "smart-wrappers.zsh"

# Load multiple functions
load_functions "smart-wrappers.zsh" "git-utils.zsh"
```

### Basic Assertions

#### File System

```bash
assert_file_exists "path/to/file"
assert_dir_exists "path/to/dir"
refute_file_exists "path/to/file"
refute_dir_exists "path/to/dir"
assert_file_executable "script.sh"
assert_file_contains "file.txt" "expected content"
refute_file_contains "file.txt" "unexpected content"
assert_file_empty "file.txt"
```

#### Output

```bash
assert_output_contains "substring"
refute_output_contains "substring"
assert_output_equals "exact match"
assert_output_matches "regex.*pattern"
assert_output_empty
assert_line_count 5
assert_line 0 "first line contains this"
```

#### Status

```bash
assert_success                  # status == 0
assert_failure                  # status != 0
assert_status 127              # status == specific value
```

### File Creation

```bash
# Single-line file
create_test_file "path/to/file.txt" "content"

# Multi-line file
create_test_file_multiline "file.txt" "line1" "line2" "line3"

# Empty file
touch_test_file "file.txt"

# Create directory structure
create_test_dirs "dir1/subdir1" "dir2/subdir2"
```

### Basic Mocking

```bash
# Simple mock
mock_command "git" "mocked output" 0

# Mock with argument capture
mock_command_with_args "git"
assert_mock_called "git" "commit -m"

# Remove mock
unmock_command "git"
```

### Utility Functions

```bash
# Test skipping
skip_test "reason"
skip_if_command_missing "jq" "jq not installed"
skip_on_platform "darwin" "Not supported on macOS"

# Debugging
debug_print "debug message"
print_test_env
is_ci  # Returns true if running in CI
```

---

## Mock Helper

**File**: `tests/helpers/mock_helper.bash`

Advanced mocking and stubbing for testing bash functions and external commands.

### Philosophy

- **"Don't mock what you don't own"** - Wrap external commands in your own libraries
- **Verify interactions** - Not just return values, but how commands were called
- **Track everything** - Call counts, arguments, sequences

### Tracked Mocks

Track all invocations with detailed logging:

```bash
# Create tracked mock
create_tracked_mock "curl"

# Set responses for specific invocations
set_mock_response "curl" 1 "First response" 0
set_mock_response "curl" 2 "Second response" 0

# Make calls
curl https://example.com/1
curl https://example.com/2

# Verify calls
assert_mock_call_count "curl" 2
assert_mock_called_at_least "curl" 1
assert_mock_never_called "unused_command"

# Verify specific invocation arguments
assert_mock_invocation_args "curl" 1 "example.com"

# Debug: Print all invocations
print_mock_invocations "curl"
```

### Conditional Mocks

Different behavior based on arguments:

```bash
# Create conditional mock
create_conditional_mock "git"

# Add conditions (pattern matching)
add_mock_condition "git" "commit" "Committed!" 0
add_mock_condition "git" "push" "Pushed!" 0
add_mock_condition "git" "pull" "Already up to date" 0

# Use naturally
git commit -m "test"    # Returns: "Committed!"
git push origin main    # Returns: "Pushed!"
git pull                # Returns: "Already up to date"
```

### Function Mocking

Mock bash functions (not external commands):

```bash
# Simple function mock
mock_function "my_function" "mocked output" 0

# Function mock with argument capture
mock_function_with_args "my_function" "output"

# Call function
my_function arg1 arg2

# Verify
assert_mock_called "my_function" "arg1"

# Cleanup
restore_all_functions
```

### Spy Functions

Call the real command but track invocations:

```bash
# Create spy (calls real command)
create_spy "curl"

# Use normally - real curl is called
curl https://example.com

# But invocations are logged
assert_spy_called_with "curl" "example.com"
```

### Cleanup

```bash
# Clean up all mocks (automatic in teardown)
cleanup_all_mocks
```

---

## Fixture Helper

**File**: `tests/helpers/fixture_helper.bash`

Manage test data and fixtures.

### Philosophy

- **Fixtures are immutable** - Stored in `tests/fixtures/`, never modified
- **Test data is mutable** - Created in `TEST_TEMP_DIR`, modified during tests
- **Clean separation** - Clear distinction between source and workspace

### Fixture Loading

```bash
# Load single fixture (copies to test workspace)
fixture_path=$(load_fixture "sample.json")

# Get fixture path without copying
fixture_path=$(get_fixture_path "sample.json")

# Read fixture content
content=$(read_fixture "sample.txt")

# Load multiple fixtures
load_fixtures "file1.txt" "file2.json" "file3.sh"
```

### Directory Fixtures

```bash
# Load entire fixture directory
project_dir=$(load_fixture_dir "sample_project")

# Create directory structure
project=$(create_fixture_structure "myapp" "src" "tests" "docs")
# Creates: TEST_TEMP_DIR/myapp/{src,tests,docs}
```

### Common Fixtures

#### Git Repository

```bash
repo_dir=$(create_git_fixture "my_repo")
# Creates initialized git repo with initial commit
cd "$repo_dir"
git log  # Works!
```

#### Chezmoi Source

```bash
chezmoi_source=$(create_chezmoi_fixture)
# Creates: .local/share/chezmoi with proper structure
```

#### Configuration Files

```bash
config=$(create_config_fixture "app.conf" "key1=value1" "key2=value2")
```

### Temporary Data

```bash
# Temporary directory
temp_dir=$(create_temp_dir "my_test_dir")

# Temporary file with content
temp_file=$(create_temp_file "content here")

# File from template (with substitutions)
temp_file=$(create_temp_file_from_template "template.txt" \
  "NAME=Joe" "VERSION=1.0")
```

### JSON Fixtures

```bash
# Create JSON fixture (validated with jq if available)
json_file=$(create_json_fixture "config.json" '{"key":"value"}')

# Read JSON value
value=$(get_json_fixture_value "config.json" ".database.host")
```

### Environment Fixtures

```bash
# Create .env file
env_file=$(create_env_fixture "test.env" "VAR1=value1" "VAR2=value2")

# Load environment variables
load_env_fixture "test.env"
```

### Executable Fixtures

```bash
# Load executable and add to PATH
load_executable_fixture "test_script.sh"

# Now callable directly
test_script.sh --flag
```

### Snapshot Testing

Compare output against golden files:

```bash
# Assert output matches golden file
run my_command
assert_output_matches_golden "expected_output.txt"

# Update golden file (use with caution!)
run my_command
update_golden_file "expected_output.txt"
```

### Fixture Validation

```bash
# Verify fixture exists
assert_fixture_exists "sample.txt"

# List all fixtures
list_fixtures
```

---

## Platform Helper

**File**: `tests/helpers/platform_helper.bash`

Cross-platform testing utilities.

### Platform Detection

```bash
# Get platform: "darwin", "linux", "wsl", or "unknown"
platform=$(get_platform)

# Boolean checks
if is_macos; then ...; fi
if is_linux; then ...; fi
if is_wsl; then ...; fi
if is_unix; then ...; fi

# Get OS version
version=$(get_os_version)

# Get Linux distribution (ubuntu, debian, arch, etc.)
distro=$(get_linux_distro)
```

### Architecture Detection

```bash
# Get architecture: "x86_64", "arm64", or "unknown"
arch=$(get_architecture)

# Boolean checks
if is_arm; then ...; fi
if is_x86_64; then ...; fi
```

### Test Skipping

```bash
# Skip unless on specific platform
skip_unless_macos "Feature only works on macOS"
skip_unless_linux "Linux-only test"
skip_unless_wsl "WSL-specific test"

# Skip on specific platform
skip_on_macos "Not supported on macOS"
skip_on_linux "Causes issues on Linux"

# Skip unless architecture
skip_unless_arm "Requires ARM processor"
skip_unless_x86_64 "Requires x86_64"
```

### Platform-Specific Commands

Commands that differ across platforms:

```bash
# File modification time
mod_time=$(platform_stat_mtime "file.txt")

# File size
size=$(platform_stat_size "file.txt")

# Absolute path (handles macOS lack of readlink -f)
abs_path=$(platform_readlink "file.txt")

# In-place sed (handles macOS sed -i syntax)
platform_sed_inplace "s/old/new/g" "file.txt"

# CPU cores
cores=$(get_cpu_cores)
```

### Feature Detection

```bash
# Check command availability
if has_command "jq"; then ...; fi

# Terminal detection
if is_terminal; then ...; fi

# Color support
if supports_color; then ...; fi

# Memory check (in MB)
if has_sufficient_memory 1024; then ...; fi
```

### Package Manager Detection

```bash
# Get package manager: "brew", "apt", "yum", "pacman", "unknown"
pkg_manager=$(get_package_manager)

# Homebrew check
if has_homebrew; then ...; fi
```

### Path Handling

```bash
# Convert to native path format (handles WSL)
native_path=$(to_native_path "/mnt/c/Users")

# Check path accessibility (handles WSL quirks)
if is_path_accessible "/path/to/file"; then ...; fi
```

### Environment Info

```bash
# Print comprehensive platform info (debugging)
print_platform_info

# Export platform variables
export_platform_vars
# Creates: TEST_PLATFORM, TEST_ARCHITECTURE, TEST_OS_VERSION, TEST_PKG_MANAGER
```

### Platform-Specific Workarounds

```bash
# Sleep with fractional seconds (macOS workaround)
platform_sleep 1.5

# Create temp directory with platform-specific template
temp_dir=$(platform_mktemp_dir)
```

---

## Assertion Helper

**File**: `tests/helpers/assertion_helper.bash`

Enhanced assertions beyond basic test_helper.

### String Assertions

```bash
assert_string_starts_with "Hello World" "Hello"
assert_string_ends_with "Hello World" "World"
assert_string_length "Hello" 5
assert_string_not_empty "$var"
assert_string_equal_ignore_case "Hello" "hello"
```

### Numeric Assertions

```bash
assert_number_equal 42 42
assert_number_greater_than 10 5
assert_number_less_than 5 10
assert_number_in_range 5 1 10
```

### File Comparison

```bash
# Files are byte-for-byte identical
assert_files_equal "file1.txt" "file2.txt"

# File size
assert_file_size "file.txt" 1024

# File age comparison
assert_file_newer "new.txt" "old.txt"

# File permissions
assert_file_permission "script.sh" "755"
```

### Directory Assertions

```bash
# Directory is empty
assert_dir_empty "/path/to/dir"

# Directory contains item
assert_dir_contains "/path/to/dir" "file.txt"

# Directory item count
assert_dir_item_count "/path/to/dir" 5
```

### Array Assertions

```bash
my_array=("apple" "banana" "cherry")

assert_array_contains "banana" "${my_array[@]}"
assert_array_length 3 "${my_array[@]}"
```

### JSON Assertions

Requires `jq`:

```bash
json='{"name":"test","age":30}'

assert_valid_json "$json"
assert_json_has_key "$json" ".name"
assert_json_value "$json" ".name" "test"
assert_json_value "$json" ".age" "30"
```

### Environment Variable Assertions

```bash
assert_env_var_set "HOME"
assert_env_var_equals "USER" "testuser"
assert_env_var_contains "PATH" "/usr/bin"
```

### Output Assertions

```bash
# Specific line contains text
assert_line_contains 0 "expected text"

# Output matches all patterns
assert_output_matches_all "pattern1" "pattern2" "pattern3"

# Output matches any pattern
assert_output_matches_any "pattern1" "pattern2" "pattern3"
```

### Timing Assertions

```bash
# Command must complete within N seconds
assert_completes_within 5 slow_command arg1 arg2
```

### Symlink Assertions

```bash
assert_symlink_to "link" "target"
```

### Combined Assertions

Convenience functions combining multiple checks:

```bash
# File exists + content + permissions
assert_file_complete "/path/to/file" "content" "644"

# Command success + output
assert_command_output_success "expected output"
```

---

## Best Practices

### Test Organization

```bash
#!/usr/bin/env bats
# ============================================================================
# Test Suite Name - Brief Description
# ============================================================================
# Detailed description of what this test suite covers
#
# Testing strategy:
# - What scenarios are covered
# - What edge cases are tested
# - Platform-specific considerations

load ../test_helper

# ============================================================================
# Test Group 1
# ============================================================================

@test "descriptive test name" {
  # Arrange
  create_test_file "input.txt" "data"

  # Act
  run my_command input.txt

  # Assert
  assert_success
  assert_output_contains "expected"
}
```

### Naming Conventions

- **Test files**: `*_test.bats` (e.g., `git_utils_test.bats`)
- **Test names**: Descriptive, action-focused
  - Good: `"git: wrapper preserves flags"`
  - Bad: `"test git"`

### Platform-Aware Testing

```bash
@test "feature works on all platforms" {
  # Skip on specific platforms if needed
  skip_on_platform "darwin" "Known issue on macOS (#123)"

  # Use platform-specific commands
  local size=$(platform_stat_size "file.txt")

  # Platform-aware assertions
  if is_macos; then
    assert_output_contains "macOS-specific"
  else
    assert_output_contains "Linux-specific"
  fi
}
```

### Mocking Strategy

```bash
@test "command with external dependencies" {
  # Mock external commands you don't own
  create_conditional_mock "curl"
  add_mock_condition "curl" "api.example.com" '{"status":"ok"}' 0

  # Run your code
  run my_function_that_uses_curl

  # Verify interactions
  assert_mock_called_at_least "curl" 1
  assert_success
}
```

### Fixture Management

```bash
@test "complex test scenario" {
  # Use fixtures for complex test data
  local project=$(load_fixture_dir "sample_project")

  # Create dynamic test data
  create_test_file "${project}/config.yml" "env: test"

  # Run test
  cd "$project"
  run my_command

  # Verify
  assert_success
}
```

### Error Messages

Good assertions provide helpful output on failure:

```bash
# Bad: No context on failure
[[ -f "file.txt" ]]

# Good: Clear error message
assert_file_exists "file.txt"
# Output on failure: "Expected file does not exist: file.txt"
```

### Test Isolation

```bash
@test "tests are isolated" {
  # Each test gets:
  # - Fresh TEST_TEMP_DIR
  # - Clean environment
  # - No state from previous tests

  # Don't rely on test order
  # Don't use global state
  # Clean up is automatic
}
```

### Performance Considerations

```bash
@test "fast tests" {
  # Avoid slow operations in setup() - runs before EVERY test
  # Use fixtures instead of generating data
  # Mock slow commands (network, disk I/O)

  # Time-sensitive tests
  assert_completes_within 2 my_fast_command
}
```

---

## Migration Guide

### From Old to New Helpers

#### Before (Old Style)

```bash
@test "old style test" {
  # Manual setup
  local temp=$(mktemp -d)
  cd "$temp"

  # Manual file creation
  echo "content" > file.txt

  # Manual mock
  cat > git << 'EOF'
#!/bin/bash
echo "mocked"
EOF
  chmod +x git
  export PATH=".:$PATH"

  # Test
  run my_command
  [[ "$status" -eq 0 ]] || fail "Command failed"
  [[ "$output" == *"expected"* ]] || fail "Output wrong"

  # Manual cleanup
  cd -
  rm -rf "$temp"
}
```

#### After (New Style)

```bash
@test "new style test" {
  # Automatic setup via test_helper

  # Helper functions
  create_test_file "file.txt" "content"

  # Modern mocking
  mock_command "git" "mocked" 0

  # Test
  run my_command

  # Clear assertions with good error messages
  assert_success
  assert_output_contains "expected"

  # Automatic cleanup
}
```

### Migration Checklist

- [ ] Replace manual temp dir creation with `TEST_TEMP_DIR`
- [ ] Replace `echo > file` with `create_test_file`
- [ ] Replace manual mocks with `mock_command` or `create_tracked_mock`
- [ ] Replace `[[ "$status" -eq 0 ]]` with `assert_success`
- [ ] Replace `[[ "$output" == *"text"* ]]` with `assert_output_contains`
- [ ] Replace manual cleanup with automatic `teardown()`
- [ ] Add platform detection if test has platform-specific logic
- [ ] Use fixtures for complex test data

---

## Troubleshooting

### Common Issues

#### Issue: Tests fail in CI but pass locally

```bash
# Solution: Platform differences
@test "platform-aware test" {
  # Check platform
  local platform=$(get_platform)
  echo "Running on: $platform" >&2

  # Use platform-specific logic
  if is_macos; then
    # macOS-specific test
  else
    # Linux-specific test
  fi
}
```

#### Issue: Mock not being called

```bash
# Solution: Check PATH
@test "debug mock" {
  mock_command "git" "mocked" 0

  # Debug: Check what 'git' resolves to
  run which git
  echo "Git path: $output" >&2

  # Ensure TEST_BIN_DIR is first in PATH
  echo "PATH: $PATH" >&2
}
```

#### Issue: Fixture not found

```bash
# Solution: Use absolute paths and verify
@test "fixture loading" {
  # Check fixtures directory
  local fixtures_dir=$(get_fixtures_dir)
  echo "Fixtures: $fixtures_dir" >&2

  # List available fixtures
  list_fixtures

  # Verify before loading
  assert_fixture_exists "sample.txt"
  load_fixture "sample.txt"
}
```

#### Issue: Test creates files outside TEST_TEMP_DIR

```bash
# Solution: Always use TEST_TEMP_DIR
@test "proper isolation" {
  # Bad: Creates in real home
  echo "test" > ~/file.txt

  # Good: Uses test workspace
  echo "test" > "${TEST_TEMP_DIR}/file.txt"

  # Better: Use helper
  create_test_file "file.txt" "test"
}
```

### Debugging Tips

```bash
@test "debugging test failures" {
  # 1. Print environment
  print_test_env
  print_platform_info

  # 2. Debug assertions
  debug_print "Variable value: $my_var"

  # 3. Inspect mock calls
  print_mock_invocations "command_name"

  # 4. Check file contents on failure
  run cat file.txt
  echo "File contents: $output" >&2

  # 5. Use BATS verbose mode
  # bats --verbose tests/unit/my_test.bats
}
```

### Getting Help

1. **Check examples**: `tests/examples/modern_helpers_demo.bats`
2. **Read helper source**: Functions are well-documented
3. **Run demo test**: `bats tests/examples/modern_helpers_demo.bats`
4. **Check existing tests**: `tests/unit/*.bats` for patterns

---

## Advanced Topics

### Custom Helper Modules

Create your own helper module:

```bash
# tests/helpers/my_custom_helper.bash
#!/usr/bin/env bash

my_custom_assertion() {
  local expected="$1"
  # Implementation
}
```

It will be auto-loaded by `test_helper.bash`.

### Parallel Testing

```bash
# Run tests in parallel (faster CI)
bats --jobs 4 tests/

# Note: Each test is already isolated via setup/teardown
```

### Test Data Generators

```bash
# tests/helpers/generator_helper.bash
generate_large_file() {
  local size_mb="$1"
  dd if=/dev/zero of="large_file.dat" bs=1M count="$size_mb" 2>/dev/null
}
```

### Integration Testing

```bash
@test "full integration test" {
  # Use all helpers together
  local platform=$(get_platform)
  local project=$(create_git_fixture "app")

  create_conditional_mock "npm"
  add_mock_condition "npm" "install" "Dependencies installed" 0

  cd "$project"
  run npm install

  assert_success
  assert_mock_call_count "npm" 1
}
```

---

## Summary

### Quick Reference

| Task | Function | Helper |
|------|----------|--------|
| Create file | `create_test_file` | core |
| Mock command | `mock_command` | core |
| Track mock calls | `create_tracked_mock` | mock |
| Load fixture | `load_fixture` | fixture |
| Platform detection | `get_platform` | platform |
| Skip on macOS | `skip_on_macos` | platform |
| Assert string | `assert_string_starts_with` | assertion |
| Assert JSON | `assert_json_value` | assertion |

### Helper Module Summary

- **Core** (`test_helper.bash`): Essential infrastructure, basic assertions
- **Mock** (`mock_helper.bash`): Advanced mocking, tracking, spies
- **Fixture** (`fixture_helper.bash`): Test data, fixtures, snapshots
- **Platform** (`platform_helper.bash`): Cross-platform, OS detection
- **Assertion** (`assertion_helper.bash`): Type-specific assertions

### Next Steps

1. **Study examples**: Run `bats tests/examples/modern_helpers_demo.bats`
2. **Migrate tests**: Convert old tests to use new helpers
3. **Write new tests**: Use helper functions from the start
4. **Share patterns**: Document new patterns as they emerge

---

**Documentation Version**: 1.0.0
**Modernization Date**: November 25, 2025
**Compatibility**: BATS 1.x, macOS 12+, Linux (all distros), WSL 2

For questions or improvements, see `CLAUDE.md` for project guidelines.
