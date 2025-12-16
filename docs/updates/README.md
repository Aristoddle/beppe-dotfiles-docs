# Tool Update Reports

This directory contains weekly reports from the `dependency-updater-agent`.

## Report Format

Each week, the agent generates a report with:
- Available updates for installed tools
- Breaking change warnings
- Security updates (high priority)
- Migration steps for breaking changes

## Usage

Reports are named `YYYY-MM-DD.md` (e.g., `2025-11-02.md`)

## Latest manual build note
- 2025-11-18: Core toolchain build (`2025-11-18-core-toolchain.md`)

## Latest digest
- See `LATEST.md` for current snapshot

## Other dated reports
- Security fixes: `SECURITY_FIXES_2025-11-15.md`
- zsh performance audit: `ZSH_PERFORMANCE_AUDIT_2025-11-15.md`

### Update Priority Levels

- **P0 Critical**: Security fixes - update immediately
- **P1 High**: Breaking changes - review and plan
- **P2 Medium**: New features - update when convenient
- **P3 Low**: Patches - safe to batch

## Workflow

1. Review weekly report
2. Check breaking changes (if any)
3. Run suggested update commands
4. Test functionality
5. Rollback if issues (instructions provided)

## Archive

Older reports track update history and help identify problematic tools.
