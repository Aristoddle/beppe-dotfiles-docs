---
layout: doc
title: Observability Guide
---

# Observability Guide

Self-hosted observability for three demo applications, powered by OpenTelemetry, ClickHouse Cloud, HyperDX, and Grafana. Every page view, click, console log, network request, and DOM interaction is captured, stored, and queryable.

**Live data right now:**

| Service | Spans | Traces | Sessions |
|---------|------:|-------:|---------:|
| `beppe-dotfiles-docs` | 3,319+ | 1,261 | 7,827 |
| `servicelink-voice-ai` | 150 | 30 | -- |
| `rcs-poc` | 137 | 40 | -- |

## What Gets Tracked

### Auto-Instrumented Signals

These fire automatically via the `@hyperdx/browser` SDK with zero application code:

| Signal | What It Captures |
|--------|-----------------|
| **Session Replay** | Full DOM recording via rrweb -- every mouse movement, scroll, click, and page mutation is reconstructed frame-by-frame |
| **Console Capture** | `console.log`, `console.warn`, `console.error` emitted as structured OTEL log records with severity levels |
| **Network Requests** | Every XHR and `fetch` call including request/response headers, status codes, timing, and body size |
| **Web Vitals** | Core Web Vitals -- Cumulative Layout Shift (CLS), Largest Contentful Paint (LCP), First Input Delay (FID) |
| **User Clicks** | Click events with target element selector, text content, and coordinates |
| **Mouse Events** | Hover patterns and movement trajectories (recorded in session replay) |
| **Route Changes** | SPA navigation events with `from` and `to` paths, emitted as spans on every VitePress page transition |

### Custom Events

These are explicitly instrumented in the VitePress theme (`analytics.ts`):

| Event Name | Payload | When It Fires |
|------------|---------|---------------|
| `Page-View` | `{ page, timestamp }` | Every route change and initial load |
| `Scroll-Depth` | `{ page, depth }` | When user scrolls past 25%, 50%, 75%, 100% thresholds |
| `Code-Copy` | `{ language, page }` | Click on VitePress copy button or manual `Ctrl+C` from a code block |
| `Sidebar-Click` | `{ section, item }` | Click on any sidebar navigation link |
| `Time-On-Page` | `{ page, seconds }` | Fires on route change with time spent on the previous page |
| `Outbound-Click` | `{ url, text }` | Click on any external link (`href` starting with `http`) |
| `User-Login` | `{ method, userEmail }` | Sign in via the `/login` form |
| `User-Logout` | `{}` | Sign out |
| `Search-Query` | `{ query, resultCount }` | Search bar usage |

## Architecture

```
Browser (@hyperdx/browser SDK)
    |
    |  OTLP/HTTP (traces, logs, session replay)
    v
collector.exos-demo.com ──── Cloudflare Tunnel ──── OTEL Collector (Azure VM)
                                                          |
                                                          v
                                                    ClickHouse Cloud
                                                    (managed storage)
                                                     /           \
                                                    v             v
                                    observe.exos-demo.com    grafana.exos-demo.com
                                    (HyperDX - replay,       (Grafana - 8 dashboards,
                                     logs, traces)            alerts, SQL)
```

**Key design decisions:**

- **No public IP.** The Azure VM sits behind Cloudflare Tunnel. HTTPS termination and certificate management is handled entirely by Cloudflare.
- **No self-hosted ClickHouse.** Storage is ClickHouse Cloud (managed). The OTEL Collector writes directly to it. Both HyperDX and Grafana read from it.
- **No backend for the docs site.** The browser SDK sends telemetry directly to the collector. The login page writes to `localStorage` and attaches identity via `setGlobalAttributes` -- there is no server-side auth.

## Reference Tools

| Question | Tool | URL |
|----------|------|-----|
| Watch a user's full session | HyperDX Session Replay | [observe.exos-demo.com](https://observe.exos-demo.com) |
| See error rates and latency | Grafana Dashboards | [grafana.exos-demo.com](https://grafana.exos-demo.com) |
| Build a custom SQL query | ClickHouse SQL Console | ClickHouse Cloud console |
| Browse all demo projects | Portal | [exos-demo.com](https://exos-demo.com) |

**Grafana credentials:** `admin` / `clickstack-demo-2024`

### When to Use What

**Start with HyperDX** when you want to understand what a specific user did. Session replay shows you the literal screen recording. The log explorer shows every console message. The trace view shows the OTEL timeline.

**Switch to Grafana** when you want aggregate answers: error rate trends, p95 latency, conversion funnels, cohort comparisons. The 8 pre-built dashboards cover the PostHog-equivalent analytics use cases.

**Go to ClickHouse SQL** when neither tool answers your question. Every span, log, and session record is a row in a ClickHouse table. Write arbitrary SQL against `otel_traces`, `otel_logs`, and `otel_sessions`.

## Key User Flows

### Flow 1: New Visitor Discovery

A visitor lands on the site, browses 2-3 pages, and leaves. Anonymous, short session, no login.

**Signals that fire:** `documentFetch` span on landing, `Page-View` on each navigation, `Scroll-Depth` if they scroll, `Time-On-Page` on exit.

```sql
-- Find short anonymous sessions (under 60 seconds, only documentFetch events)
SELECT
    TraceId AS session_id,
    min(Timestamp) AS arrived,
    max(Timestamp) AS left,
    dateDiff('second', min(Timestamp), max(Timestamp)) AS duration_sec,
    count(*) AS event_count,
    groupArray(SpanName) AS events
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND ResourceAttributes['userId'] = ''
    AND Timestamp > now() - INTERVAL 7 DAY
GROUP BY session_id
HAVING duration_sec < 60
ORDER BY arrived DESC
LIMIT 25
```

### Flow 2: Onboarding Funnel

The ideal path: Home, then Quickstart, then Setup, then Tools. This funnel shows where users drop off.

**Signals that fire:** `Page-View` at each step with the page path. `Scroll-Depth` indicates engagement depth on each page.

```sql
-- Funnel: Home → Quickstart → Setup → Tools
-- Shows how many sessions reach each step
WITH sessions AS (
    SELECT
        TraceId AS session_id,
        groupArray(SpanAttributes['component.page']) AS pages
    FROM otel_traces
    WHERE ServiceName = 'beppe-dotfiles-docs'
        AND SpanName = 'Page-View'
        AND Timestamp > now() - INTERVAL 30 DAY
    GROUP BY session_id
)
SELECT
    count(*) AS total_sessions,
    countIf(has(pages, '/')) AS step1_home,
    countIf(has(pages, '/') AND has(pages, '/QUICKSTART')) AS step2_quickstart,
    countIf(has(pages, '/') AND has(pages, '/QUICKSTART') AND has(pages, '/SETUP')) AS step3_setup,
    countIf(has(pages, '/') AND has(pages, '/QUICKSTART') AND has(pages, '/SETUP') AND has(pages, '/TOOLS')) AS step4_tools
FROM sessions
```

### Flow 3: Deep Technical Research

Engaged reader behavior: Architecture page, then Agents, then Platform Differences. Deep scrolling, long dwell time, possibly copies code snippets.

**Signals that fire:** `Scroll-Depth` at 75%+ thresholds, `Time-On-Page` with high seconds values, `Code-Copy` events, `Sidebar-Click` for navigation pattern.

```sql
-- Find deeply engaged sessions: 75%+ scroll depth AND 5+ minutes total
SELECT
    t.TraceId AS session_id,
    ResourceAttributes['userId'] AS user_id,
    min(t.Timestamp) AS session_start,
    dateDiff('minute', min(t.Timestamp), max(t.Timestamp)) AS duration_min,
    groupUniqArray(SpanAttributes['component.page']) AS pages_visited,
    count(*) AS total_events,
    countIf(SpanName = 'Code-Copy') AS code_copies,
    max(toUInt32OrZero(SpanAttributes['component.depth'])) AS max_scroll_pct
FROM otel_traces t
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND Timestamp > now() - INTERVAL 30 DAY
GROUP BY session_id, user_id
HAVING duration_min >= 5
    AND max_scroll_pct >= 75
ORDER BY duration_min DESC
LIMIT 25
```

### Flow 4: Identity Flow (Login)

Anonymous browsing, then login via `/login`, then continued browsing with identity attached. Demonstrates the before/after identity split.

**Signals that fire:** `User-Login` event marks the transition. All spans before login have `userId = ''`. All spans after have `userId = 'user-...'`.

```sql
-- Find sessions that contain a login event, show before/after split
SELECT
    TraceId AS session_id,
    SpanName AS event,
    Timestamp,
    ResourceAttributes['userId'] AS user_id,
    ResourceAttributes['userEmail'] AS email,
    SpanAttributes['component.page'] AS page,
    if(ResourceAttributes['userId'] = '', 'anonymous', 'identified') AS identity_state
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND TraceId IN (
        SELECT DISTINCT TraceId
        FROM otel_traces
        WHERE SpanName = 'User-Login'
            AND ServiceName = 'beppe-dotfiles-docs'
            AND Timestamp > now() - INTERVAL 30 DAY
    )
ORDER BY Timestamp ASC
LIMIT 100
```

### Flow 5: Error Recovery

User hits a broken page or 404, sees a `console.error`, navigates back, and finds the correct page.

**Signals that fire:** `console.error` captured as an OTEL log record. Network request span with 4xx/5xx status. Subsequent navigation spans showing recovery.

```sql
-- Sessions with console errors followed by successful navigation
WITH error_sessions AS (
    SELECT DISTINCT TraceId AS session_id
    FROM otel_logs
    WHERE ServiceName = 'beppe-dotfiles-docs'
        AND SeverityText = 'ERROR'
        AND Timestamp > now() - INTERVAL 30 DAY
)
SELECT
    t.TraceId AS session_id,
    t.SpanName AS event,
    t.Timestamp,
    SpanAttributes['component.page'] AS page,
    SpanAttributes['http.status_code'] AS status_code,
    ResourceAttributes['userId'] AS user_id
FROM otel_traces t
INNER JOIN error_sessions e ON t.TraceId = e.session_id
WHERE t.ServiceName = 'beppe-dotfiles-docs'
ORDER BY t.TraceId, t.Timestamp ASC
LIMIT 200
```

### Flow 6: Multi-Service Trace (Voice AI)

Synthetic call trace for the ServiceLink Voice AI demo: SIP connect, LiveKit session, EXOS lookup, calendar check, call complete.

**Signals that fire:** Cross-span trace with `servicelink-voice-ai` as the service name. Each phase is a separate span linked by `TraceId`.

```sql
-- Reconstruct a full voice call trace across spans
SELECT
    TraceId,
    SpanId,
    ParentSpanId,
    SpanName,
    SpanKind,
    Duration / 1e6 AS duration_ms,
    StatusCode,
    SpanAttributes['rpc.method'] AS rpc_method,
    SpanAttributes['call.phase'] AS call_phase,
    Timestamp
FROM otel_traces
WHERE ServiceName = 'servicelink-voice-ai'
    AND Timestamp > now() - INTERVAL 30 DAY
ORDER BY TraceId, Timestamp ASC
LIMIT 100
```

```sql
-- Call duration distribution
SELECT
    TraceId,
    min(Timestamp) AS call_start,
    max(Timestamp) AS call_end,
    dateDiff('second', min(Timestamp), max(Timestamp)) AS call_duration_sec,
    count(*) AS span_count,
    groupArray(SpanName) AS phases
FROM otel_traces
WHERE ServiceName = 'servicelink-voice-ai'
    AND Timestamp > now() - INTERVAL 30 DAY
GROUP BY TraceId
ORDER BY call_duration_sec DESC
```

### Flow 7: RCS Message Flow

Synthetic RCS messaging trace: webhook receive, card render, user reply, EXOS update.

**Signals that fire:** Spans with `rcs-poc` service name. Each message flow is a trace with multiple spans.

```sql
-- RCS message flow reconstruction
SELECT
    TraceId,
    SpanName,
    Duration / 1e6 AS duration_ms,
    SpanAttributes['message.type'] AS message_type,
    SpanAttributes['card.type'] AS card_type,
    Timestamp
FROM otel_traces
WHERE ServiceName = 'rcs-poc'
    AND Timestamp > now() - INTERVAL 30 DAY
ORDER BY TraceId, Timestamp ASC
LIMIT 100
```

```sql
-- Card type distribution and user response times
SELECT
    SpanAttributes['card.type'] AS card_type,
    count(*) AS messages,
    avg(Duration) / 1e6 AS avg_duration_ms,
    quantile(0.95)(Duration) / 1e6 AS p95_duration_ms
FROM otel_traces
WHERE ServiceName = 'rcs-poc'
    AND SpanAttributes['card.type'] != ''
    AND Timestamp > now() - INTERVAL 30 DAY
GROUP BY card_type
ORDER BY messages DESC
```

## Mining Sessions Organically

Step-by-step guide for exploring real user behavior without a specific question in mind.

**1. Start in HyperDX.** Open [observe.exos-demo.com](https://observe.exos-demo.com) and go to the Session Replay list.

**2. Filter by service.** Set `ServiceName = beppe-dotfiles-docs` to focus on one application at a time.

**3. Sort by duration.** Long sessions indicate engaged users. Short sessions indicate bounce. Both are interesting for different reasons.

**4. Watch a replay.** Click into any session. You will see the literal DOM recording -- every page they visited, every scroll, every click. This is the fastest path to understanding real behavior.

**5. Check the event timeline.** Below the replay, the trace view shows every OTEL span in chronological order: page views, network requests, custom events, console logs.

**6. Cross-reference in logs.** Switch to the Log Explorer tab. Filter by the same `TraceId`. You will see every `console.log/warn/error` from that session, with full stack traces for errors.

**7. Go deeper with SQL.** Copy the `TraceId` from any interesting session. Open the ClickHouse SQL console or a Grafana Explore panel. Query `otel_traces WHERE TraceId = '...'` to see the raw span data.

**8. Find similar sessions.** Use SQL to find other sessions that visited the same pages, hit the same errors, or came from the same device:

```sql
-- Find sessions that visited the same page as a known interesting session
SELECT
    TraceId AS session_id,
    ResourceAttributes['userId'] AS user_id,
    min(Timestamp) AS session_start,
    dateDiff('second', min(Timestamp), max(Timestamp)) AS duration_sec,
    count(*) AS event_count
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND SpanName = 'Page-View'
    AND SpanAttributes['component.page'] = '/ARCHITECTURE'  -- change this
    AND Timestamp > now() - INTERVAL 7 DAY
GROUP BY session_id, user_id
ORDER BY duration_sec DESC
LIMIT 20
```

## Grafana Dashboard Reference

All dashboards are at [grafana.exos-demo.com](https://grafana.exos-demo.com) (`admin` / `clickstack-demo-2024`).

### 1. Session Explorer

Session list with metadata: duration, page count, user identity, device. Each row deep-links to the HyperDX replay for that session.

### 2. Event Stream

Real-time feed of custom events (`Page-View`, `Code-Copy`, `Scroll-Depth`, etc.) across all services. Useful for watching live activity during a demo.

### 3. Funnels

Conversion funnel visualization: Home to Setup to Login. Shows drop-off rate at each step and the total conversion percentage.

### 4. User Cohorts

Anonymous vs. identified user breakdown. Retention analysis showing return visits over 7/14/30 day windows.

### 5. Performance

Core Web Vitals dashboard: p50/p95/p99 for LCP, FID, CLS. Slowest pages by load time. Network request latency distribution.

### 6. Errors and Diagnostics

Console error aggregation by page and message. Error rate trends over time. Correlation between errors and user drop-off.

### 7. Multi-Service Overview

Cross-application comparison: `beppe-dotfiles-docs` vs. `servicelink-voice-ai` vs. `rcs-poc`. Span counts, error rates, and latency side by side.

### 8. ClickHouse Health

Infrastructure monitoring: query latency, ingestion rate, storage usage, active connections. Ensures the observability pipeline itself is healthy.

## General-Purpose Queries

### Sessions per page (last 24 hours)

```sql
SELECT
    SpanAttributes['location.pathname'] AS page,
    count(DISTINCT TraceId) AS sessions
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND Timestamp > now() - INTERVAL 1 DAY
GROUP BY page
ORDER BY sessions DESC
LIMIT 20
```

### Session duration distribution

```sql
SELECT
    TraceId AS session_id,
    ResourceAttributes['userId'] AS user_id,
    min(Timestamp) AS session_start,
    max(Timestamp) AS session_end,
    dateDiff('second', min(Timestamp), max(Timestamp)) AS duration_sec
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND Timestamp > now() - INTERVAL 7 DAY
GROUP BY session_id, user_id
HAVING duration_sec > 0
ORDER BY duration_sec DESC
LIMIT 50
```

### Identified users

```sql
SELECT
    ResourceAttributes['userId'] AS user_id,
    ResourceAttributes['userEmail'] AS email,
    ResourceAttributes['userName'] AS name,
    min(Timestamp) AS first_seen,
    max(Timestamp) AS last_seen,
    count(*) AS events
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND ResourceAttributes['userId'] != ''
GROUP BY user_id, email, name
ORDER BY first_seen DESC
```

### Anonymous vs. identified breakdown

```sql
SELECT
    if(ResourceAttributes['userId'] = '', 'anonymous', 'identified') AS user_type,
    count(DISTINCT TraceId) AS sessions,
    count(*) AS total_events
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND Timestamp > now() - INTERVAL 7 DAY
GROUP BY user_type
```

### Console errors by page

```sql
SELECT
    Body AS message,
    ResourceAttributes['location.pathname'] AS page,
    SeverityText AS level,
    count(*) AS occurrences
FROM otel_logs
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND SeverityText IN ('ERROR', 'WARN')
    AND Timestamp > now() - INTERVAL 7 DAY
GROUP BY message, page, level
ORDER BY occurrences DESC
```

### Slowest network requests

```sql
SELECT
    SpanAttributes['http.url'] AS url,
    SpanAttributes['http.method'] AS method,
    avg(Duration) / 1e6 AS avg_ms,
    quantile(0.95)(Duration) / 1e6 AS p95_ms,
    count(*) AS requests
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
    AND SpanAttributes['http.url'] != ''
    AND Timestamp > now() - INTERVAL 7 DAY
GROUP BY url, method
ORDER BY p95_ms DESC
LIMIT 20
```

### Cross-service span counts

```sql
SELECT
    ServiceName,
    count(*) AS total_spans,
    count(DISTINCT TraceId) AS unique_traces,
    min(Timestamp) AS earliest,
    max(Timestamp) AS latest
FROM otel_traces
WHERE Timestamp > now() - INTERVAL 30 DAY
GROUP BY ServiceName
ORDER BY total_spans DESC
```

## Integration Code

The full integration is in the VitePress theme. No backend, no database provisioning, no server-side code.

### SDK Initialization

```typescript
// docs/.vitepress/theme/index.ts
import('@hyperdx/browser').then((HyperDX) => {
  HyperDX.default.init({
    apiKey: '<your-key>',
    service: 'beppe-dotfiles-docs',
    url: 'https://collector.exos-demo.com',
    consoleCapture: true,
    advancedNetworkCapture: true,
    disableReplay: false,
    maskAllText: false,       // public docs site, nothing sensitive
    maskAllInputs: false,
  })
})
```

### Custom Event Tracking

```typescript
// docs/.vitepress/theme/analytics.ts
import HyperDX from '@hyperdx/browser'

export function trackPageView(page: string) {
  HyperDX.default.addAction('Page-View', {
    page,
    timestamp: new Date().toISOString(),
  })
}

export function trackScrollDepth(page: string, depth: number) {
  HyperDX.default.addAction('Scroll-Depth', {
    page,
    depth: String(depth),
  })
}

export function trackCodeCopy(language: string, page: string) {
  HyperDX.default.addAction('Code-Copy', { language, page })
}

export function trackSidebarClick(section: string, item: string) {
  HyperDX.default.addAction('Sidebar-Click', { section, item })
}

export function trackTimeOnPage(page: string, seconds: number) {
  HyperDX.default.addAction('Time-On-Page', {
    page,
    seconds: String(seconds),
  })
}

export function trackOutboundClick(url: string, text: string) {
  HyperDX.default.addAction('Outbound-Click', { url, text })
}
```

### Identity Attachment (Login Page)

```typescript
// On sign in:
HyperDX.default.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
})
HyperDX.default.addAction('User-Login', {
  method: 'docs-login-form',
  userEmail: user.email,
})

// On sign out:
HyperDX.default.setGlobalAttributes({
  userId: '',
  userEmail: '',
  userName: '',
})
HyperDX.default.addAction('User-Logout', {})
```

All spans emitted after `setGlobalAttributes` carry the `userId`, `userEmail`, and `userName` resource attributes. Spans emitted before login have these fields empty. This is what makes the identity flow queryable -- you can `JOIN` on `TraceId` and see the exact moment identity was attached.

## Demo Walkthrough

For a live demo with a CTO audience:

1. **Open this site** in a fresh incognito window. Browse Home, Architecture, Tools.
2. **Open the browser console.** Type `console.log('hello from the docs')`. This gets captured.
3. **Go to [Sign In](/login).** Enter a name and email. This fires `User-Login` and attaches identity.
4. **Browse more pages.** Every page view now carries your `userId`.
5. **Open [HyperDX](https://observe.exos-demo.com).** Find your session in the replay list. Watch it back. Show the console log captured. Show the identity attached mid-session.
6. **Open [Grafana](https://grafana.exos-demo.com).** Show the Session Explorer dashboard. Click into the Funnels dashboard. Show the real-time Event Stream.
7. **Open the SQL console.** Run the "Identity Flow" query from above. Show the anonymous-to-identified transition in raw data.
8. **The takeaway:** Full PostHog-equivalent analytics running on open-source infrastructure, with every data point queryable in SQL, and session replay that shows exactly what the user experienced.
