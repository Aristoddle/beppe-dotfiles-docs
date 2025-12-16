# Sequential Thinking Randomization Strategy

**Purpose**: Break bias patterns and widen perspectives by alternating deep-thinking models

**Status**: Implemented 2025-11-14

---

## The Problem

Sequential thinking is token-intensive (8-15 thoughts, full context each iteration). Using only Claude Sonnet 4.5 creates:
- **Bias reinforcement**: Same model, same blind spots
- **Token pressure**: 200k limit shared with all operations
- **Perspective narrowing**: Single cognitive architecture

## The Solution

**50/50 Randomization** between:
- **Claude Sonnet 4.5** (sequential-thinking MCP)
- **GPT-5.1** (Codex with high reasoning effort)

### Architecture

```
User triggers sequential-thinking
    ↓
PreToolUse Hook (codex-delegation.sh)
    ↓
Random number (0 or 1)
    ↓
    ├─ 0 (even) → Claude executes normally
    │               └─ mcp__sequential-thinking__sequentialthinking
    │
    └─ 1 (odd) → Suggest Codex delegation
                  └─ User approves → mcp__codex-gpt5__codex with reasoning prompt
```

### Why This Works

**Cognitive Diversity**:
- Claude: Trained on different data, different reasoning patterns
- GPT-5.1: Alternative architecture, different blind spots
- **Result**: Catch what one model misses

**Token Economics**:

**Main chat sequential thinking**:
- Consumes main 200K budget
- Best for: Quick analysis (3-5 thoughts), already have context loaded

**Sub-agent sequential thinking** (Claude OR Codex via Task tool):
- Separate 200K budget per agent - preserves main context
- Deep analysis "free" from main chat perspective
- Best for: Complex analysis (10+ thoughts), architectural decisions

**When to Delegate**:
- ✅ Deep analysis (10+ thoughts) → Delegate to sub-agent (preserves main context)
- ✅ Quick analysis (3-5 thoughts) → Execute in main chat (already have context)
- ✅ Codex delegation adds: Separate OpenAI billing + cognitive diversity

**Result**: Can think deeper without fragmenting main conversation

**See**: `docs/TOKEN_COUNTING_LIMITATION.md` § "Sub-Agent Token Isolation"

**Bias Breaking**:
- 50/50 ensures neither model dominates
- Forces consideration of alternative approaches
- **Result**: More robust decision-making

## Implementation Details

### Hook Pattern (codex-delegation.sh)

```bash
# Pattern 4: Sequential Thinking Randomization
if [[ "$tool_name" == "mcp__sequential-thinking__sequentialthinking" ]]; then
  random_choice=$((RANDOM % 2))

  if [[ $random_choice -eq 1 ]]; then
    delegate_to_codex=true
    reason="Sequential thinking (perspective diversification)"
  fi
fi
```

### When Codex Selected

Hook suggests delegation with:
```
💡 Token Optimization: Sequential thinking (perspective diversification - GPT-5.1 vs Claude Sonnet 4.5)

Would you like to use Codex for this deep thinking task?
```

User approves → Claude constructs Codex MCP call with full context

### Codex Reasoning Configuration

`~/.codex/config.toml`:
```toml
model = "gpt-5.1"
model_reasoning_effort = "high"
```

**Note**: Codex doesn't have sequential-thinking MCP enabled (causes initialization hangs). Instead, uses native GPT-5.1 reasoning with high effort, which provides similar depth.

## Usage

**Automatic**: Just use sequential-thinking normally
```
User: "ultrathink - should we create chezmoi-workflow-agent?"
    ↓
50% chance → Claude thinks
50% chance → Hook suggests Codex delegation
```

**Manual Override**: User can explicitly request
```
"Use Codex to think about..."  → Always delegates
"Use Claude to think about..." → Never delegates
```

## Benefits Observed

**Theoretical** (not yet validated in production):
- Diverse perspectives → better decision quality
- Token distribution → can think more freely
- Bias detection → models catch each other's mistakes

## Limitations

**Context Passing**: Codex doesn't see full conversation history automatically. Claude must:
1. Summarize relevant context
2. Pass to Codex via MCP call
3. Integrate Codex's response

**Latency**: Codex MCP startup ~5 seconds (stdio transport)

**Cost**: GPT-5.1 reasoning is expensive (~$0.50-1.00 per complex thought session)

## Monitoring

Track in agents.md:
- When Codex used for sequential thinking
- Quality of results vs Claude
- Token savings realized
- Cost vs value assessment

## Future Enhancements

**Potential improvements**:
1. **Context-aware randomization**: Use Codex for visual/code tasks, Claude for reasoning
2. **Quality feedback loop**: Track which model performs better on which task types
3. **Ensemble mode**: Both models think, compare results, synthesize
4. **Cost optimization**: Use GPT-4o for cheaper thinking, GPT-5.1 only when needed

---

**Last Updated**: 2025-11-14
**Principle**: "Two brains are better than one, especially when they think differently"
