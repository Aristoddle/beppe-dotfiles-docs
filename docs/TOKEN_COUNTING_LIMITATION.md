# Token Counting Limitation - AI Self-Awareness Constraint

**Discovery Date**: 2025-11-16
**Issue**: AI cannot reliably self-count tokens, leading to bad decisions when systems rely on token estimates
**Status**: Architectural constraint, not a bug
**Impact**: 3 agents using unreliable estimation patterns

---

## The Problem

**User Discovery (2025-11-16):**
- AI claimed: "30-39% token usage"
- GUI reality: Auto-compact threshold already triggered (likely >80%)
- Error magnitude: ~2x off (claimed 60k-78k, actual >160k)

**Root Cause:**
AI cannot accurately predict or self-count token usage. Token counts are only visible REACTIVELY via system warnings (e.g., `<system_warning>Token usage: 54242/200000; 145758 remaining</system_warning>`), not PREDICTIVELY before actions.

---

## Why This Limitation Exists

**How Token Counting Works:**

1. **System warnings appear AFTER tool calls:**
   ```xml
   <system_warning>Token usage: 54242/200000; 145758 remaining</system_warning>
   ```
   - AI can READ this number
   - AI can RECORD this number for later reference
   - But warnings appear POST-ACTION, not PRE-DECISION

2. **AI cannot introspect its own context:**
   - Context includes: files read, tool schemas, system prompts, conversation history
   - AI has no API to query "how many tokens am I currently using?"
   - Estimation via file sizes misses tool schemas, encoding overhead, system context

3. **Encoding is complex and variable:**
   - 1 token ≈ 4 characters is a ROUGH heuristic
   - Code vs prose encodes differently
   - Unicode, special characters, structured data all vary

**Example Failure:**
```bash
# Agent estimates token usage
chars=$(wc -c < file.md)
tokens=$((chars / 4))  # Estimates 25,000 tokens

# Reality: file + tool schemas + system prompts + history = 80,000 tokens
# AI claims "30% budget used" when actually 40% used
```

---

## CRITICAL DISCOVERY: Sub-Agent Token Isolation (2025-11-16)

**Foundational Architecture Insight:**

Sub-agents launched via Task tool have **SEPARATE 200K token budgets** that DO NOT count against the main chat context.

**Evidence:**

From user's research comparing multiple sessions:
- **work-continuity-orchestrator** internal usage: 94.9K tokens
- **Main chat** GUI display after same work: 107.8K tokens used
- **Conclusion**: Sub-agent's 94.9K tokens did NOT pollute main conversation context

**Token Economics:**

```
Regular Chat:
├─ 200K total budget
└─ All work counts against this limit

Multi-Agent System (with 3 parallel agents):
├─ Main chat: 200K budget (coordinates agents)
├─ Agent A: 200K budget (separate context)
├─ Agent B: 200K budget (separate context)
└─ Agent C: 200K budget (separate context)
= Effective capacity: 800K tokens across system
```

**Real-World Cost:**

User observation: Multi-agent systems use **~15× more tokens** than regular chats for same work.

Example:
- Regular chat: 10K tokens to complete task
- Multi-agent (3 agents): 150K tokens total (50K per agent)
- BUT: Main chat only shows 10-20K (agent overhead, not agent work)

**Strategic Implications:**

1. **Aggressive Agent Usage**: Don't be conservative with agents - they don't fragment main context
2. **Parallel Work Scales**: Launch 3-5 agents in parallel without worrying about main chat pollution
3. **Main Chat Stays Clean**: Use main conversation for high-level coordination, delegate heavy work to agents
4. **Deep Analysis is Free**: Sequential thinking in sub-agents doesn't consume main chat budget
5. **Token Warnings are Local**: A system warning in main chat reflects ONLY main context, not sub-agent usage

**Updated Operating Principles:**

```markdown
# OLD (conservative, based on misunderstanding)
"Avoid agents when token budget > 50% to prevent fragmentation"

# NEW (aggressive, based on isolation architecture)
"Prefer agents for heavy work - they preserve main chat context purity"
```

**Affected Systems:**

- ✅ `work-continuity-orchestrator.md` - Can use more aggressive parallel agent strategies
- ✅ `sequential-thinking-auditor.md` - Deep analysis doesn't pollute main chat
- ✅ Agent decision-making patterns - Be MORE aggressive with agent usage
- ✅ Documentation - Update all references to "token budget concerns" with agents

**Full Details:**

See user's research in session summary (2025-11-16): "Sub-agents have SEPARATE 200K token budgets"

---

## Current Misuse in Codebase

**3 Agents Using Unreliable Patterns:**

### 1. sequential-thinking-auditor.md (Lines 91-93)

**Current (BAD):**
```markdown
- Estimate token / time impact:
  - Use prior session data (if available) for typical cost per thought
  - Flag risk when token budget is already > 70% used
```

**Problem:** "Estimate" implies prediction. If AI hasn't seen a recent warning, estimate will be wrong.

**Fix:**
```markdown
- Check latest system warning for current token usage:
  - If last warning showed > 70% usage → Flag risk
  - If no recent warning → Prefer action (autonomous operation principle)
  - NEVER estimate via file sizes (unreliable, see docs/TOKEN_COUNTING_LIMITATION.md)
```

### 2. work-continuity-orchestrator.md (Lines 82-84)

**Current (BAD):**
```markdown
**Token budget**:
- Internal context tracking (if available)
- Or estimate: `wc -c` on key files
```

**Problem:** `wc -c` on files doesn't account for tool schemas, system prompts, conversation context.

**Fix:**
```markdown
**Token budget**:
- Read latest system warning (appears after tool calls)
- If no recent warning: Assume healthy, proceed with work
- NEVER estimate via `wc -c` (see docs/TOKEN_COUNTING_LIMITATION.md)
- Note: Token counts are reactive (visible after actions), not predictive
```

### 3. content-pruner.md (Lines 115-147)

**Current (BAD):**
```bash
# Rough token estimate (1 token ≈ 4 chars)
chars=$(wc -c < "$file")
tokens=$((chars / 4))
total_tokens=$((total_tokens + tokens))
echo "Total estimated tokens: $total_tokens"
```

**Problem:** Estimates total token budget from file sizes, ignores context overhead.

**Fix:**
```bash
# Token Budget Analysis (from system warnings only)
# NOTE: AI cannot reliably estimate tokens. This analysis uses:
# 1. Latest system warning token count (if available)
# 2. Relative file sizes (NOT absolute token counts)
# 3. Priority ordering by file size (largest first for pruning)

# Check if we have recent token warning
if [[ -f /tmp/last_token_warning.txt ]]; then
  current_tokens=$(cat /tmp/last_token_warning.txt)
  echo "Current token usage (from last warning): $current_tokens / 200000"
else
  echo "No recent token warning - cannot determine current usage"
fi

# File size analysis (relative priority, NOT token estimation)
echo ""
echo "Largest files (pruning priority order):"
for file in docs/*.md agents/*.md skills/*/SKILL.md skills/*.md; do
  [ -f "$file" ] || continue
  size=$(wc -c < "$file")
  echo "$size bytes - $file"
done | sort -rn | head -20

echo ""
echo "⚠️  Note: File sizes are for RELATIVE prioritization only"
echo "Do NOT estimate absolute token counts (AI self-counting is unreliable)"
```

---

## How to Operate With This Constraint

**DO (Reliable Patterns):**

1. **Read system warnings when available:**
   ```markdown
   # After a tool call, check for warning
   <system_warning>Token usage: 54242/200000; 145758 remaining</system_warning>
   
   # Use this number for decisions
   if (54242 > 140000) {
     // > 70% budget used, consider pruning
   }
   ```

2. **Record warnings for later reference:**
   ```markdown
   # In session notes
   Token usage: 123,509 / 200,000 (62% used, 38% remaining)
   ```

3. **Prefer action over inaction when uncertain:**
   ```markdown
   # If no recent warning and task is critical
   // Proceed with work (autonomous operation principle)
   // Don't block on missing token data
   ```

4. **Use historical data for ROUGH planning:**
   ```markdown
   # From past sessions: Sequential thinking averages 5k tokens per session
   # Use as guideline, not hard limit
   ```

**DON'T (Unreliable Patterns):**

1. **❌ Estimate tokens from file sizes:**
   ```bash
   # BAD: Misses tool schemas, system prompts, encoding variance
   tokens=$(($(wc -c < file.md) / 4))
   ```

2. **❌ Make hard decisions based on estimates:**
   ```markdown
   # BAD: Skipping work based on unreliable data
   if estimated_tokens > 140000:
     skip_sequential_thinking()
   ```

3. **❌ Claim specific percentages without recent warning:**
   ```markdown
   # BAD: Claimed 30-39% when actually >80%
   "Token usage: ~35% (estimated)"
   ```

4. **❌ Try to introspect current context size:**
   ```markdown
   # BAD: No API exists for this
   current_tokens = get_my_current_token_count()  // Doesn't exist
   ```

---

## Architecture Changes Required

**Phase 1: Documentation (CURRENT)**
- ✅ Create this doc (TOKEN_COUNTING_LIMITATION.md)
- 🔄 Update CLAUDE.md with brief section + link
- 🔄 Update 3 affected agents (sequential-thinking-auditor, work-continuity-orchestrator, content-pruner)

**Phase 2: Warning Capture Pattern (FUTURE)**
- Create helper: `record_last_token_warning()` (bash function)
- After key tool calls, check for warnings and cache to /tmp
- Agents read cached value instead of estimating

**Phase 3: Decision Logic Refactor (FUTURE)**
- Replace: "If estimate > 70%" → "If last warning > 70%"
- Replace: "Estimate and decide" → "Proceed unless warning indicates risk"
- Add fallback: "If no recent warning, prefer action"

---

## Example Session Notes Update

**Before (unreliable):**
```markdown
Token budget: ~60k estimated (30% of 200k limit)
Status: Healthy, plenty of room
```

**After (reliable):**
```markdown
Token budget: Unknown (no recent system warning)
Last known: 123,509 / 200,000 (from 2025-11-15 session note)
Decision: Proceeding with work (autonomous operation principle)
```

---

## User Guidance

**When you see AI claim token percentages, ask:**
1. "What system warning are you reading from?"
2. "Did you estimate this or see a warning?"
3. If estimated: Treat as UNRELIABLE

**If AI skips work due to token budget:**
1. Check actual GUI token count
2. If < 70%: Override AI's caution, request action
3. If > 80%: AI was right to be cautious (even if estimate was wrong)

---

## Related Documentation

- **Autonomous Operation Principles**: CLAUDE.md (prefer action over inaction)
- **Agent Coordination**: docs/PARALLEL_AGENT_ORCHESTRATION.md
- **Session Continuity**: sessions/dotfiles/SESSION_STATE.md (token tracking examples)

---

**Status**: Documented
**Last Updated**: 2025-11-16
**Discoverer**: User (via GUI vs AI claim comparison)
**Impact**: 3 agents need updates (sequential-thinking-auditor, work-continuity-orchestrator, content-pruner)
