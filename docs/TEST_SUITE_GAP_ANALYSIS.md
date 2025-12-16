# Test Suite Gap Analysis
**Generated**: 2025-11-25
**Purpose**: Identify all testing gaps for TDD readiness
**Scope**: `~/.local/share/chezmoi/tests/` vs `~/.local/share/chezmoi/private_dot_config/zsh/`

---

## Executive Summary

### Coverage Statistics
- **Total source files**: 16 zsh function files (~9,195 LOC)
- **Total functions identified**: 147 functions
- **Functions with tests**: ~40 functions (27% coverage)
- **Test files**: 19 unit tests + 3 integration tests
- **Overall coverage**: **~27% function coverage**

### Quality Assessment
- **Existing test quality**: HIGH - Well-structured BATS tests with mocking, edge cases, pipe detection
- **Documentation**: EXCELLENT - Functions document their test cases inline
- **Test philosophy**: Strong (graceful degradation, pipe safety, tool availability checks)

### Critical Finding
**The codebase has excellent test infrastructure and philosophy, but significant coverage gaps remain.**

---

## Critical Gaps (P0)

### 1. Manga Tools (NO TESTS)
**File**: `private_dot_config/zsh/functions/manga-tools.zsh`
**Functions**: 9 functions, 0 tests
**Impact**: HIGH - Security-sensitive (VPN, torrents), complex workflows

**Missing Tests**:
- `nyaa-search()` - URL encoding security, API integration
- `manga-download-nyaa()` - Multi-step workflow (VPN check → search → download)
- `torrent-add()` - Transmission RPC integration
- `torrent-list()` / `torrent-status()` - Status parsing
- `torrent-status-rpc()` - HTTP API calls
- `manga-extract-volume()` - File extraction
- `cbz-validate()` - Image validation
- `transmission-remote()` - Homebrew path handling
- `torrent-safe()` - Safety checks before adding torrents

**Why Critical**:
- Security-sensitive operations (VPN, torrent management)
- External dependencies (Transmission, Nyaa API)
- Complex error paths (VPN not connected, transmission daemon down)
- File operations with potential data loss

**Recommended Priority**: P0 - Test before any modifications

---

### 2. Manga Evaluation (NO TESTS)
**File**: `private_dot_config/zsh/functions/manga-evaluation.zsh`
**Functions**: 12 functions, 0 tests
**Impact**: HIGH - AI integration, file processing, cost tracking

**Missing Tests**:
- `manga-visual-compare()` - Image processing, Codex API calls
- `manga-translation-compare()` - Multi-file comparison
- `manga-compare-en()` - EN-only comparison
- `manga-eval-costs()` - Cost calculation accuracy
- `_manga_require_codex()` - Codex availability check
- `_manga_run_codex()` - API error handling
- `_manga_validate_images()` - Image validation logic
- `_manga_validate_image_size()` - Size limits
- `_manga_check_image_type()` - File type detection
- `_manga_get_timeout_cmd()` - Platform-specific timeout
- `_manga_eval_log_cost()` - Cost logging
- `_manga_load_schema()` - JSON schema loading

**Why Critical**:
- AI API costs (incorrect logic = unexpected bills)
- File processing (potential data corruption)
- Platform-specific code (darwin/linux timeout commands)
- Complex error handling

**Recommended Priority**: P0 - Test cost calculations before any changes

---

### 3. OneDrive Manager (NO TESTS)
**File**: `private_dot_config/zsh/functions/onedrive-manager.zsh`
**Functions**: 7 functions, 0 tests
**Impact**: HIGH - Data loss risk (cloud vs local file management)

**Missing Tests**:
- `onedrive()` - CLI wrapper, error handling
- `onedrive-status()` - Pin status detection
- `onedrive-download()` - Recursive download logic
- `onedrive-free-space()` - Cloud-only conversion
- `onedrive-manga-archive()` - Manga-specific archiving
- `onedrive-list-cloud-only()` - File discovery
- `onedrive-help()` - Help text

**Why Critical**:
- **DATA LOSS RISK**: `onedrive-free-space()` can delete local files
- Complex state management (pinned vs cloud-only)
- Recursive operations on directories
- Platform-specific (macOS OneDrive CLI)

**Recommended Priority**: P0 - Test before any OneDrive operations

---

### 4. Network Security/VPN (NO TESTS)
**File**: `private_dot_config/zsh/functions/network-security.zsh`
**Functions**: 5 functions, 0 tests
**Impact**: HIGH - Security-critical (VPN, IP exposure)

**Missing Tests**:
- `vpn()` - Mullvad VPN control
- `vpn-check()` - Connection status verification
- `vpn-relay()` - Relay management
- `myip()` - IP address detection
- `leak-test()` - VPN leak detection

**Why Critical**:
- Security-sensitive (IP exposure if VPN fails)
- External dependencies (Mullvad CLI, leak testing sites)
- Error handling crucial for safety

**Recommended Priority**: P0 - Test VPN logic before any changes

---

### 5. Markdown Tools (NO TESTS)
**File**: `private_dot_config/zsh/functions/markdown-tools.zsh`
**Functions**: 1 function, 0 tests
**Impact**: MEDIUM - Used frequently, but low risk

**Missing Tests**:
- `glow()` - Markdown rendering with fallback to bat
  - Test: glow with installed tool
  - Test: glow with missing tool (falls back to bat)
  - Test: glow with piped output (plain mode)
  - Test: glow --help (passthrough)

**Why Critical**:
- High usage frequency (viewing docs)
- Pipe detection critical for scripts
- Fallback chain (glow → bat → error)

**Recommended Priority**: P1 - Test before modifying wrapper logic

---

### 6. AI Helpers (NO TESTS)
**File**: `private_dot_config/zsh/functions/ai-helpers.zsh`
**Functions**: 9 functions, 0 tests
**Impact**: HIGH - AI workflows, used daily

**Missing Tests**:
- `ai()` - Main AI command wrapper
- `ask()` - Interactive AI queries
- `gpt()` - GPT-specific wrapper
- `_aih_usage_ai()` / `_aih_usage_ask()` / `_aih_usage_gpt()` - Help text
- `_aih_contains_flag()` - Flag detection
- `_aih_read_stdin()` - Stdin handling
- `_aih_require_cli()` - CLI availability check

**Why Critical**:
- High usage frequency (daily AI interactions)
- Stdin/argument handling complexity
- CLI fallback logic

**Recommended Priority**: P1 - Test before any wrapper changes

---

## High Priority Gaps (P1)

### 7. Mise Transparent Wrappers (PARTIAL TESTS)
**File**: `private_dot_config/zsh/functions/mise-transparent-wrappers.zsh`
**Existing Tests**: Some tests exist (see `tests/README-mise-wrapper-testing.md`)
**Functions**: 2 wrappers with complex logic

**Missing Tests**:
- `npm()` wrapper:
  - ✓ Global install persistence (TESTED)
  - ✓ Global uninstall cleanup (TESTED)
  - ✗ Non-global passthrough (NOT TESTED)
  - ✗ Multiple packages at once (NOT TESTED)
  - ✗ Error handling when mise unavailable (NOT TESTED)
  - ✗ DEBUG_MISE_WRAPPER flag behavior (NOT TESTED)

- `pipx()` wrapper:
  - ✗ Install persistence (NOT TESTED)
  - ✗ Uninstall cleanup (NOT TESTED)
  - ✗ Non-install passthrough (NOT TESTED)
  - ✗ Error handling (NOT TESTED)

**Why High Priority**:
- Used on every `npm install -g` and `pipx install`
- Complex state management (mise config synchronization)
- Potential for breaking package management

**Recommended Priority**: P1 - Complete test coverage for all code paths

---

### 8. Dotfiles Helper (PARTIAL TESTS)
**File**: `private_dot_config/zsh/functions/dotfiles-helper.zsh`
**Existing Tests**: `dotfiles_auth_test.bats`, `dotfiles_doctor_test.bats`, etc.
**Functions**: 40+ functions

**Well-Tested**:
- ✓ `dotfiles auth` subcommands
- ✓ `dotfiles doctor`
- ✓ `dotfiles commit` (basic)
- ✓ `dotfiles edit`
- ✓ `dotfiles list`
- ✓ `dotfiles reload`

**Missing Tests**:
- `_dotfiles_arch()` - Architecture display
- `_dotfiles_ssh()` - SSH status
- `_dotfiles_sync()` - Sync workflow
- `_dotfiles_tool()` - Tool management
- `_dotfiles_atuin()` and all atuin subcommands:
  - `_dotfiles_atuin_status()`
  - `_dotfiles_atuin_login()`
  - `_dotfiles_atuin_sync()`
  - `_dotfiles_atuin_history()`
  - `_dotfiles_atuin_search()`
  - `_dotfiles_atuin_stats()`
  - `_dotfiles_atuin_help()`
- `_dotfiles_nvim()` and all neovim subcommands:
  - `_dotfiles_nvim_status()`
  - `_dotfiles_nvim_install()`
  - `_dotfiles_nvim_update()`
  - `_dotfiles_nvim_clean()`
  - `_dotfiles_nvim_fix()`
  - `_dotfiles_nvim_health()`
  - `_dotfiles_nvim_claude()`
  - `_dotfiles_nvim_copilot()`
  - `_dotfiles_nvim_help()`
- MCP integration functions:
  - `dotfiles_mcp_add()`
  - `dotfiles_mcp_remove()`
  - `dotfiles_mcp_status()`
  - `dotfiles_mcp_test()`

**Why High Priority**:
- `dotfiles` is the main user-facing command hub
- Atuin integration is new and untested
- Neovim management has many error paths
- MCP integration is complex

**Recommended Priority**: P1 - Test all command dispatch logic

---

### 9. Polyglot Dev Functions (PARTIAL TESTS)
**File**: `private_dot_config/zsh/functions/polyglot-dev.zsh`
**Existing Tests**: `polyglot_dev.bats` (basic tests exist)
**Functions**: 15+ language-specific init functions

**Existing Tests** (from `polyglot_dev.bats`):
- Some basic function existence checks

**Missing Tests**:
- `goinit()` - Go project initialization
- `rustinit()` - Rust project setup
- `jsnew()` - JavaScript project creation
- `rubyinit()` - Ruby project setup
- `javainit()` - Java project initialization
- `elixirinit()` - Elixir project setup
- All the `*info` and `*list` helpers:
  - `miseinfo()`, `miselist()`
  - `nodeinfo()`, `nodelist()`
  - `pyinfo()`, `pylist()`

**Why High Priority**:
- Used for new project creation (data creation risk)
- File system operations (mkdir, file writing)
- Tool availability checks needed

**Recommended Priority**: P1 - Test project creation logic

---

### 10. System Utilities (PARTIAL TESTS)
**File**: `private_dot_config/zsh/functions/system.zsh`
**Existing Tests**: `system_utils_test.bats` (only tests `mkcd()`)
**Functions**: 10+ utility functions

**Well-Tested**:
- ✓ `mkcd()` - FULLY TESTED

**Missing Tests**:
- `backup()` - File backup with timestamps
- `extract()` - Archive extraction (zip, tar, etc.)
- `port()` - Port process finder
- `retry()` - Retry command with backoff
- `serve()` - Simple HTTP server
- `which-all()` - Find all instances of command in PATH
- `which-source()` - Show where command was sourced from
- `path()` - PATH viewer/editor
- `reload()` - Shell reload
- `mktemp-cd()` - Create temp dir and cd into it

**Why High Priority**:
- `backup()` - File operations (data loss risk)
- `extract()` - Complex format detection
- `port()` - Cross-platform differences (lsof vs netstat)
- `retry()` - Complex error handling logic

**Recommended Priority**: P1 - Test file operations and cross-platform code

---

## Medium Priority Gaps (P2)

### 11. Node Dev Functions (PARTIAL TESTS)
**File**: `private_dot_config/zsh/functions/node-dev.zsh`
**Existing Tests**: `node_dev.bats` (basic tests)
**Functions**: 4 functions

**Missing Detailed Tests**:
- `nodeinfo()` - Node version info
- `nodelist()` - List node versions
- `nodeinit()` - Node project initialization
- `npmup()` - Update npm packages

**Why Medium Priority**:
- Covered by mise tests indirectly
- Lower risk than file operations
- Usage frequency moderate

**Recommended Priority**: P2 - Test after P0/P1 complete

---

### 12. Python Dev Functions (PARTIAL TESTS)
**File**: `private_dot_config/zsh/functions/python-dev.zsh`
**Existing Tests**: `python_dev.bats` (basic tests)
**Functions**: 6 functions

**Missing Detailed Tests**:
- `pyinfo()` - Python version info
- `pylist()` - List python versions
- `pyinit()` - Python project initialization
- `pynew()` - New Python project
- `venv()` - Virtual environment wrapper
- `pipup()` - Update pip packages

**Why Medium Priority**:
- Pyenv is stable and well-tested externally
- Lower risk operations
- Usage frequency moderate

**Recommended Priority**: P2 - Test after P0/P1 complete

---

### 13. Dev Utilities (PARTIAL TESTS)
**File**: `private_dot_config/zsh/functions/dev.zsh`
**Existing Tests**: `utility_functions_test.bats` (tests some functions)
**Functions**: 8+ utility functions

**Well-Tested**:
- ✓ `urlencode()` - FULLY TESTED
- ✓ `urldecode()` - FULLY TESTED
- ✓ `timestamp()` - FULLY TESTED
- ✓ `watchfile()` - BASIC TESTS

**Missing Tests**:
- `json()` - JSON formatting (dependency on jq)
- `fshow()` - Git show with fzf
- `fco()` - Git checkout with fzf
- `tree()` - Tree wrapper with eza fallback
- `corebuild-smoke()` - Core build smoke test

**Why Medium Priority**:
- Most are wrappers around stable tools
- Lower usage frequency
- Lower risk

**Recommended Priority**: P2 - Test after critical functions

---

## Low Priority / Edge Cases (P3)

### Platform-Specific Code (NO TESTS)
**Files**: `private_dot_config/zsh/os/*.zsh`
- `os/darwin.zsh` - macOS-specific functions
- `os/linux.zsh` - Linux-specific functions
- `os/wsh.zsh` - WSL-specific functions

**Why Low Priority**:
- Platform-specific (can't test all platforms in single CI run)
- Mostly aliases and simple wrappers
- Low risk

**Recommended Approach**: Manual testing on each platform

---

### Configuration Files (NO TESTS)
**Files**: `private_dot_config/zsh/config/*.zsh`
- Environment setup
- Plugin loading
- Completions
- Prompt configuration

**Why Low Priority**:
- Declarative configuration (low logic)
- Tested indirectly by shell startup
- Changes are rare

**Recommended Approach**: Integration tests (shell startup test exists)

---

### Aliases (NO TESTS)
**Files**: `private_dot_config/zsh/aliases/*.zsh`
- Simple command aliases
- No complex logic

**Why Low Priority**:
- Trivial logic (mostly `alias foo='bar'`)
- Low risk
- Tested implicitly by using them

**Recommended Approach**: Smoke tests only

---

## Test Structure Recommendations

### Recommended Test Organization

```
tests/
├── unit/                           # Function-level tests
│   ├── ai_helpers_test.bats       # NEW
│   ├── ai_tools_test.bats         # EXISTS
│   ├── dotfiles_*_test.bats       # EXISTS (expand coverage)
│   ├── git_utils_test.bats        # EXISTS
│   ├── manga_eval_test.bats       # NEW (P0)
│   ├── manga_tools_test.bats      # NEW (P0)
│   ├── markdown_tools_test.bats   # NEW (P1)
│   ├── mise_wrappers_test.bats    # EXISTS (expand coverage)
│   ├── network_security_test.bats # NEW (P0)
│   ├── node_dev_test.bats         # EXISTS (expand)
│   ├── onedrive_manager_test.bats # NEW (P0)
│   ├── polyglot_dev_test.bats     # EXISTS (expand)
│   ├── python_dev_test.bats       # EXISTS (expand)
│   ├── smart_wrappers_test.bats   # EXISTS
│   ├── system_utils_test.bats     # EXISTS (expand)
│   └── utility_functions_test.bats # EXISTS
│
├── integration/                    # Workflow tests
│   ├── deployment_test.bats       # EXISTS
│   ├── manga_workflow_test.bats   # NEW (P0)
│   ├── mise_integration_test.bats # EXISTS
│   ├── onedrive_workflow_test.bats # NEW (P0)
│   └── shell_startup_test.bats    # EXISTS
│
└── fixtures/                       # Test data
    ├── sample_manga_images/        # NEW (for manga tests)
    ├── sample_repos/               # EXISTS
    └── mock_configs/               # NEW (for config tests)
```

### Testing Patterns to Follow

**1. Graceful Degradation** (from existing tests):
```bash
@test "function: falls back when tool missing" {
  # Test with tool not in PATH
  run bash -c "export PATH=/usr/bin:/bin && source functions.zsh && myfunction"
  [ "$status" -eq 0 ]  # Should succeed with fallback
  assert_output_contains "using fallback"
}
```

**2. Pipe Detection** (from smart_wrappers_test.bats):
```bash
@test "function: detects piped output" {
  # [[ ! -t 1 ]] detection
  run bash -c "source functions.zsh && myfunction | cat"
  assert_output_contains "plain output"  # No ANSI codes
}
```

**3. Security/Injection** (from existing patterns):
```bash
@test "function: escapes special characters" {
  run myfunction "test \$variable ; echo pwned"
  [ ! -f "/tmp/pwned" ]  # Should not execute
}
```

**4. Error Paths** (from existing tests):
```bash
@test "function: handles missing dependencies" {
  # Mock missing dependency
  run myfunction
  [ "$status" -ne 0 ]
  assert_output_contains "Error: dependency not installed"
  assert_output_contains "Install: brew install dependency"
}
```

**5. Data Loss Prevention** (critical for OneDrive, backup):
```bash
@test "function: requires confirmation for destructive operations" {
  # Test without confirmation
  run myfunction --delete-local-files
  [ "$status" -ne 0 ]
  assert_output_contains "requires --force"
}
```

---

## TDD Readiness Assessment

### Current State: **NOT TDD-READY**

**Strengths**:
- ✅ Excellent test infrastructure (BATS)
- ✅ Strong testing philosophy (documented in CLAUDE.md)
- ✅ Good test patterns established
- ✅ Inline test documentation in source files

**Blockers for TDD**:
- ❌ 73% of functions have NO tests
- ❌ Critical functions (OneDrive, manga, VPN) completely untested
- ❌ Security-sensitive code (torrents, VPN) has no safety net
- ❌ Data loss risks (OneDrive, backup) not covered

### Path to TDD Readiness

**Phase 1: Critical Coverage (P0)** - 2-3 weeks
1. OneDrive manager (data loss risk)
2. Manga tools (security + external deps)
3. Manga evaluation (AI costs + file processing)
4. Network security/VPN (security-critical)
5. Markdown tools (high usage)
6. AI helpers (high usage)

**Phase 2: Core Functions (P1)** - 2-3 weeks
1. Complete mise wrapper coverage
2. Complete dotfiles helper coverage (atuin, neovim, MCP)
3. Polyglot dev initialization functions
4. System utilities (backup, extract, port)

**Phase 3: Polish (P2)** - 1-2 weeks
1. Node dev detailed tests
2. Python dev detailed tests
3. Dev utility completions

**Total Estimated Effort**: 6-8 weeks for full TDD readiness

---

## Prioritized Implementation Plan

### Week 1-2: Data Loss Prevention (P0)
```bash
# Create these test files first:
tests/unit/onedrive_manager_test.bats      # CRITICAL: Data loss risk
tests/unit/network_security_test.bats      # CRITICAL: Security risk
tests/unit/manga_tools_test.bats           # CRITICAL: Security + complexity
```

**Focus**:
- Test ALL error paths
- Test ALL destructive operations with safeguards
- Mock external dependencies (OneDrive CLI, Mullvad, Transmission)

---

### Week 3-4: AI & High-Usage Functions (P0)
```bash
tests/unit/manga_eval_test.bats            # CRITICAL: AI cost tracking
tests/unit/ai_helpers_test.bats            # HIGH USAGE: Daily workflows
tests/unit/markdown_tools_test.bats        # HIGH USAGE: Doc viewing
```

**Focus**:
- Mock AI API calls (Codex)
- Test cost calculation accuracy
- Test fallback chains

---

### Week 5-6: Core Infrastructure (P1)
```bash
# Expand existing test files:
tests/unit/mise_wrappers_test.bats         # Add missing code paths
tests/unit/dotfiles_commands_test.bats     # Add atuin/neovim/MCP tests
tests/unit/polyglot_dev_test.bats          # Add init function tests
tests/unit/system_utils_test.bats          # Add backup/extract/port tests
```

**Focus**:
- Complete all code path coverage
- Test error handling
- Test cross-platform differences

---

### Week 7-8: Polish & Integration (P2)
```bash
# Create comprehensive integration tests:
tests/integration/manga_workflow_test.bats
tests/integration/onedrive_workflow_test.bats
tests/integration/ai_workflow_test.bats
```

**Focus**:
- End-to-end workflow tests
- Multi-step operation tests
- Real-world usage patterns

---

## Key Metrics for TDD Readiness

### Definition of "TDD Ready"
A function is TDD-ready when:
1. ✅ Has tests for normal usage
2. ✅ Has tests for all error paths
3. ✅ Has tests for edge cases
4. ✅ Has tests for tool unavailability (fallbacks)
5. ✅ Has tests for piped output (if applicable)
6. ✅ Has tests for security concerns (injection, escaping)
7. ✅ Tests run in <1s per function

### Current Progress
| Category | Functions | Tested | Coverage | TDD Ready |
|----------|-----------|--------|----------|-----------|
| AI Tools | 15 | 15 | 100% | ✅ YES |
| Git Utils | 4 | 4 | 100% | ✅ YES |
| Smart Wrappers | 5 | 5 | 100% | ✅ YES |
| System Utils | 10 | 1 | 10% | ❌ NO |
| Dotfiles Helper | 40 | 15 | 38% | ❌ NO |
| Manga Tools | 9 | 0 | 0% | ❌ NO |
| Manga Eval | 12 | 0 | 0% | ❌ NO |
| OneDrive | 7 | 0 | 0% | ❌ NO |
| Network Security | 5 | 0 | 0% | ❌ NO |
| Markdown Tools | 1 | 0 | 0% | ❌ NO |
| AI Helpers | 9 | 0 | 0% | ❌ NO |
| Mise Wrappers | 2 | 1 | 50% | ❌ NO |
| Polyglot Dev | 15 | 2 | 13% | ❌ NO |
| Node Dev | 4 | 1 | 25% | ❌ NO |
| Python Dev | 6 | 1 | 17% | ❌ NO |
| Dev Utils | 8 | 4 | 50% | ❌ NO |

**Overall TDD Readiness**: 27% (40/147 functions fully tested)

---

## Conclusion

The dotfiles project has:
- ✅ Excellent test infrastructure and patterns
- ✅ Strong testing philosophy documented
- ✅ Good coverage for AI tools, git utils, and smart wrappers
- ❌ **Critical gaps in data-loss-risk functions (OneDrive, backup)**
- ❌ **Zero coverage for security-critical functions (VPN, torrents)**
- ❌ **No tests for AI cost-tracking functions**

### Immediate Action Items

**BEFORE making ANY changes to these files:**
1. `onedrive-manager.zsh` - Write tests (data loss risk)
2. `manga-tools.zsh` - Write tests (security risk)
3. `manga-evaluation.zsh` - Write tests (cost risk)
4. `network-security.zsh` - Write tests (privacy risk)

**Once P0 complete:**
- Systematically add tests for all dotfiles helper subcommands
- Complete mise wrapper test coverage
- Add integration tests for complex workflows

**Target**: Achieve 90%+ function coverage within 8 weeks for full TDD readiness.

---

**Last Updated**: 2025-11-25
**Next Review**: After P0 tests complete (Week 2)
