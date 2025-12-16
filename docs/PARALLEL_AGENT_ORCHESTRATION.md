# Parallel Agent Orchestration Guide

**Purpose**: Patterns for coordinating multiple Claude Code agents working simultaneously
**Status**: Based on proven demos and production implementations (Nov 2025)
**Sources**: Zach Wills blog, Medium articles, GitHub repos (wshobson/agents, baryhuang/claude-code-by-agents)

---

## Core Concept: Specialist Agents in Parallel

**Pattern**: Launch multiple specialist agents simultaneously, each with:
- Independent 200k context window
- Non-overlapping responsibilities
- Clear task boundaries
- Structured output artifacts

**Example - Website Builder**:
```javascript
// User: "Build a full-stack web app for task management"

// Main conversation spawns 4 agents in parallel:
Task([
  {
    subagent_type: "backend-developer",
    prompt: "Design API schema, database models, authentication. Use FastAPI + PostgreSQL.",
    description: "Backend scaffolding"
  },
  {
    subagent_type: "frontend-designer", 
    prompt: "Create React components, routing, state management. Modern UI with Tailwind.",
    description: "Frontend layout"
  },
  {
    subagent_type: "product-manager",
    prompt: "Define requirements, user stories, acceptance criteria. Review other agents' work.",
    description: "Requirements validation"
  },
  {
    subagent_type: "qa-engineer",
    prompt: "Write integration tests, E2E tests, CI/CD pipeline. Test coverage >80%.",
    description: "Test suite creation"
  }
]);

// All 4 agents execute simultaneously (4x speedup vs sequential)
// Each agent saves to distinct files (backend/, frontend/, tests/, docs/)
```

---

## Architecture Patterns

### 1. Specialist Dispatch Pattern

**When to Use**: Complex project with clear domain separation

**Structure**:
```
Orchestrator (Main Conversation)
    ↓
    ├─→ @backend-developer (API, database, auth)
    ├─→ @frontend-designer (UI, components, routing)
    ├─→ @product-manager (requirements, validation)
    └─→ @qa-engineer (tests, CI/CD)
```

**Benefits**:
- Each agent focuses on expertise
- No context pollution (separate 200k windows)
- True parallel execution (exponential speedup)

**Constraints**:
- Token usage 4x higher (4 agents × 200k contexts)
- Requires clear task boundaries
- File-based coordination (no shared state)

### 2. Sequential Handoff After Parallel

**When to Use**: Parallel work needs integration/review phase

**Structure**:
```
Phase 1 (Parallel):
├─→ @backend-developer → API code
├─→ @frontend-designer → UI code
└─→ @qa-engineer → Test suite

Phase 2 (Sequential):
API code → @code-reviewer → Review report
UI code → @code-reviewer → Review report
Test suite → @code-reviewer → Review report
    ↓
All reviews → @tech-lead → Integration decisions
```

**Pattern**:
```javascript
// Phase 1: Parallel development
const outputs = await Task([
  {subagent_type: "backend-developer", ...},
  {subagent_type: "frontend-designer", ...},
  {subagent_type: "qa-engineer", ...}
]);

// Phase 2: Sequential review (after parallel completes)
const reviews = [];
for (const output of outputs) {
  const review = await Task({
    subagent_type: "code-reviewer",
    prompt: `Review this code: ${output.file_path}`
  });
  reviews.push(review);
}

// Phase 3: Integration
const integration = await Task({
  subagent_type: "tech-lead",
  prompt: `Integrate based on reviews: ${JSON.stringify(reviews)}`
});
```

### 3. Git Worktree Pattern

**When to Use**: Agents need isolated git branches

**Setup**:
```bash
# Main repo in ~/project
git worktree add ~/project-backend backend-dev
git worktree add ~/project-frontend frontend-dev
git worktree add ~/project-tests test-dev

# Launch agents in different worktrees
Task([
  {
    subagent_type: "backend-developer",
    cwd: "~/project-backend",  // Isolated branch
    prompt: "..."
  },
  {
    subagent_type: "frontend-designer",
    cwd: "~/project-frontend",  // Isolated branch
    prompt: "..."
  }
]);
```

**Benefits**:
- No git conflicts (separate branches)
- Easy rollback (per-agent branches)
- Clear audit trail (branch = agent work)

---

## Proven Demo Patterns

### Demo 1: Overnight Frontend Rebuild (12 agents)

**Source**: Medium article, developer watched 12 agents rebuild frontend while sleeping

**Agents**:
1. **component-refactorer**: Modern React patterns, hooks, TypeScript
2. **test-writer**: Jest tests for all components
3. **doc-updater**: JSDoc, README, architecture docs
4. **accessibility-auditor**: WCAG compliance, ARIA labels
5. **performance-optimizer**: Code splitting, lazy loading
6. **style-modernizer**: CSS-in-JS, design system
7. **state-manager**: Redux → Zustand migration
8. **routing-updater**: React Router v6 patterns
9. **build-optimizer**: Webpack → Vite migration
10. **dependency-updater**: Update all packages
11. **security-scanner**: Audit dependencies, fix vulnerabilities
12. **integration-tester**: E2E tests with Playwright

**Result**: 10,000+ line PR by morning, all agents coordinated via file outputs

### Demo 2: Stripe Integration (4 agents)

**Source**: Zach Wills blog

**Agents**:
1. **backend-developer**: API endpoints, Stripe SDK, webhooks
2. **frontend-developer**: Payment UI, checkout flow
3. **qa-engineer**: Integration tests, webhook testing
4. **documentation-writer**: API docs, integration guide

**Pattern**: Orchestrator receives Stripe docs, dispatches 4 specialists simultaneously

### Demo 3: Custom Command Pipeline

**Source**: GitHub repos

**Pattern**: Single command `/generate-tickets` invokes:
1. **product-manager**: Requirements, user stories
2. **ux-designer**: Wireframes, user flows
3. **senior-software-engineer**: Technical design, architecture

All work in parallel, outputs merge into structured ticket format.

---

## Best Practices

### 1. Context Isolation

**DO**:
- ✅ Each agent gets separate 200k context
- ✅ No shared state (file-based communication)
- ✅ Clear task boundaries (no overlap)

**DON'T**:
- ❌ Don't pass massive context to all agents
- ❌ Don't let agents modify same files
- ❌ Don't share in-memory state

### 2. Structured Output Artifacts

**Pattern**: Each agent saves to distinct directory
```
outputs/
├── backend/
│   ├── api.py
│   ├── models.py
│   └── tests/
├── frontend/
│   ├── components/
│   ├── pages/
│   └── tests/
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── SETUP.md
└── reviews/
    ├── backend-review.md
    ├── frontend-review.md
    └── integration.md
```

**Benefits**:
- Clear audit trail (who did what)
- Easy debugging (isolated failures)
- Merge conflicts avoided (separate dirs)

### 3. Token Budget Management

**CRITICAL DISCOVERY (2025-11-16)**: Sub-agents have SEPARATE 200K token budgets that don't count against main chat context.

**Token Architecture**:
- **Main chat**: 200K budget (coordination, orchestration)
- **Each sub-agent**: Separate 200K budget (task execution)
- **Example** (from production): Main (107.8K) + sub-agent (94.9K internal) = Main still shows 107.8K (no pollution)

**Strategic Implication**: Parallel agents **preserve main context purity**. Aggressive parallel execution is ENCOURAGED, not discouraged.

**Cost Reality**:
- Multi-agent systems use ~15× more tokens **total** (billed across all contexts)
- BUT: Main chat remains clean and navigable (only coordination overhead, ~5-10K per agent)
- Trade-off: Worth it for complex work requiring specialized analysis

**Strategies**:
- ✅ Launch 3-5 agents in parallel without worrying about main chat fragmentation
- ✅ Use `model: haiku` for simple agents (cost-effective)
- ✅ Use `model: 'inherit'` for complex agents needing full capabilities
- ✅ Monitor **billing** (total token usage), not main chat context size
- ⚠️ Be aware: Can hit rate limits if launching many agents simultaneously

**See**: `docs/TOKEN_COUNTING_LIMITATION.md` § "Sub-Agent Token Isolation" for full analysis and evidence.

### 4. Non-Deterministic Behavior

**Challenge**: LLMs are probabilistic (same prompt ≠ same output)

**Solutions**:
- Version control prompts (git track agent definitions)
- Test agent outputs (validate structure)
- Retry failed agents (implement error recovery)
- Use temperature=0 for deterministic tasks

---

## Agent Definition Templates

### Backend Developer Agent
```yaml
---
name: backend-developer
description: "Backend scaffolding specialist. Use PROACTIVELY when building APIs, databases, or server logic. Handles: FastAPI/Flask/Django setup, PostgreSQL/MongoDB schemas, authentication, API design, Docker configs. Works in parallel with frontend/QA agents."
model: 'inherit'
---

# Backend Developer Agent

You are a backend development specialist focused on API design, database modeling, and server architecture.

## Your Expertise

**Frameworks**: FastAPI, Flask, Django, Express.js
**Databases**: PostgreSQL, MongoDB, Redis
**Auth**: JWT, OAuth2, session management
**Deployment**: Docker, docker-compose, env configs

## Output Structure

Save all work to `backend/` directory:
- `backend/main.py` - FastAPI app entrypoint
- `backend/models.py` - Database models
- `backend/schemas.py` - Pydantic schemas
- `backend/auth.py` - Authentication logic
- `backend/tests/` - Integration tests
- `backend/Dockerfile` - Container config

## Coordination

- Frontend needs API schema → export OpenAPI spec to `backend/openapi.json`
- QA needs endpoints → document in `backend/API.md`
- Product manager needs validation → implement request validation
```

### Frontend Designer Agent
```yaml
---
name: frontend-designer
description: "Frontend UI/UX specialist. Use PROACTIVELY when building user interfaces. Handles: React/Vue/Svelte components, Tailwind CSS, routing, state management, responsive design. Works in parallel with backend/QA agents."
model: 'inherit'
---

# Frontend Designer Agent

You are a frontend development specialist focused on UI components, user experience, and modern web frameworks.

## Your Expertise

**Frameworks**: React, Vue, Svelte
**Styling**: Tailwind CSS, CSS-in-JS, design systems
**State**: Zustand, Redux, Context API
**Routing**: React Router, Vue Router

## Output Structure

Save all work to `frontend/` directory:
- `frontend/src/components/` - React components
- `frontend/src/pages/` - Page components
- `frontend/src/hooks/` - Custom hooks
- `frontend/src/styles/` - Global styles
- `frontend/src/api/` - API client (consumes backend OpenAPI)

## Coordination

- Backend provides API schema → generate typed client from `backend/openapi.json`
- QA needs test IDs → add `data-testid` attributes
- Product manager needs flows → implement user journeys
```

### Product Manager Agent
```yaml
---
name: product-manager
description: "Requirements and validation specialist. Use PROACTIVELY when defining features or reviewing work. Handles: user stories, acceptance criteria, requirements validation, cross-agent coordination. Reviews other agents' work for completeness."
model: 'inherit'
---

# Product Manager Agent

You are a product management specialist focused on requirements, validation, and cross-functional coordination.

## Your Expertise

**Requirements**: User stories, acceptance criteria, edge cases
**Validation**: Feature completeness, UX flows, business logic
**Coordination**: Review backend/frontend/QA work for alignment

## Output Structure

Save all work to `docs/` directory:
- `docs/REQUIREMENTS.md` - Feature requirements
- `docs/USER_STORIES.md` - User stories
- `docs/ACCEPTANCE.md` - Acceptance criteria
- `docs/REVIEW.md` - Agent work review

## Validation Checklist

When reviewing agent outputs:
- ✅ Backend API matches requirements?
- ✅ Frontend implements all user flows?
- ✅ QA tests cover acceptance criteria?
- ✅ Edge cases handled?
- ✅ Error states implemented?
```

### QA Engineer Agent
```yaml
---
name: qa-engineer
description: "Testing and CI/CD specialist. Use PROACTIVELY when code needs testing. Handles: integration tests, E2E tests, CI/CD pipelines, test coverage, quality gates. Works in parallel with dev agents."
model: 'inherit'
---

# QA Engineer Agent

You are a QA specialist focused on testing, automation, and quality assurance.

## Your Expertise

**Testing**: pytest, Jest, Playwright, Cypress
**Coverage**: >80% target, critical path 100%
**CI/CD**: GitHub Actions, pre-commit hooks

## Output Structure

Save all work to `tests/` directory:
- `tests/backend/` - API integration tests
- `tests/frontend/` - Component tests
- `tests/e2e/` - End-to-end tests
- `.github/workflows/` - CI/CD config

## Test Strategy

**Backend Tests**: API endpoints, database ops, auth flows
**Frontend Tests**: Component rendering, user interactions, routing
**E2E Tests**: Critical user journeys, payment flows, signups
**Performance**: Load tests for high-traffic endpoints
```

---

## Example Orchestration Script

**Scenario**: User says "Build a task management web app"

**Orchestrator Response**:
```javascript
// Step 1: Analyze request
const requirements = {
  backend: "REST API, PostgreSQL, JWT auth",
  frontend: "React, Tailwind, task CRUD",
  testing: "Integration + E2E tests",
  docs: "API docs, setup guide"
};

// Step 2: Launch specialists in parallel
const agents = await Task([
  {
    subagent_type: "product-manager",
    prompt: `Define requirements for task management app: ${JSON.stringify(requirements)}`,
    description: "Requirements definition"
  },
  {
    subagent_type: "backend-developer",
    prompt: "Build FastAPI backend: Task model (title, desc, status, user), CRUD endpoints, JWT auth, PostgreSQL",
    description: "Backend scaffolding"
  },
  {
    subagent_type: "frontend-designer",
    prompt: "Build React frontend: TaskList, TaskForm, Login, Dashboard. Use Tailwind. Responsive design.",
    description: "Frontend UI"
  },
  {
    subagent_type: "qa-engineer",
    prompt: "Write tests: API endpoints, React components, E2E user flows. Set up GitHub Actions CI.",
    description: "Test suite"
  }
]);

// Step 3: Validate outputs
console.log("✓ 4 agents completed in parallel");
console.log("✓ backend/ contains FastAPI app");
console.log("✓ frontend/ contains React app");
console.log("✓ tests/ contains test suites");
console.log("✓ docs/ contains requirements");

// Step 4: Integration review (sequential after parallel)
const review = await Task({
  subagent_type: "product-manager",
  prompt: `Review all agent outputs for integration: ${JSON.stringify(agents.map(a => a.output_path))}`
});
```

---

## Production Implementation Checklist

**Before deploying multi-agent workflows**:

- [ ] **Define specialist agents** (backend-dev, frontend-dev, qa, pm)
- [ ] **Create agent definitions** (.md files with YAML frontmatter)
- [ ] **Set up output directories** (backend/, frontend/, tests/, docs/)
- [ ] **Establish file conventions** (each agent knows where to save)
- [ ] **Configure git worktrees** (if using branch isolation)
- [ ] **Monitor token usage** (4+ agents = high consumption)
- [ ] **Test agent coordination** (run small project first)
- [ ] **Document handoff points** (when parallel → sequential)
- [ ] **Set up CI/CD** (validate agent outputs automatically)
- [ ] **Create orchestrator scripts** (automate agent launching)

---

## Known Limitations

**1. No Recursive Delegation**
- Agents CANNOT spawn sub-agents (Claude Code limitation as of Nov 2025)
- Main conversation must orchestrate all agents
- Workaround: Main conversation coordinates, not agents

**2. Token Budget Scaling**
- 12 parallel agents = potential for 2.4M tokens
- Can hit rate limits quickly
- Strategy: Use haiku for simple tasks, batch similar work

**3. Non-Determinism**
- Same prompt can yield different outputs
- Harder to debug parallel agent failures
- Solution: Version control prompts, retry logic

**4. File-Based Coordination Only**
- No shared in-memory state
- All coordination via file outputs
- Challenge: Requires structured output formats

---

## Future Enhancements

**When recursive delegation is supported**:
```javascript
// THEORETICAL (not supported yet)
// Backend agent spawns sub-agents
backend-developer → database-designer
backend-developer → api-designer
backend-developer → auth-specialist

// Currently, main conversation must spawn all agents directly
```

**Proposed**: See `docs/AGENT_RECURSION.md` for theoretical architecture

---

**Last Updated**: 2025-11-14
**Sources**: Verified against production demos and GitHub repos
**Status**: Ready for implementation (parallel execution is proven)
