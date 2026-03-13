---
layout: doc
title: ClickStack Observability Demo
---

# ClickStack Observability Demo

This site is instrumented with [ClickStack](https://clickhouse.com/docs/use-cases/observability/clickstack) (formerly HyperDX), ClickHouse's open-source observability platform. Every page view, click, console log, and network request is captured as OpenTelemetry telemetry.

## What's Being Captured

| Signal | Description |
|--------|-------------|
| **Session Replay** | Full DOM recording of every user session |
| **Console Logs** | `console.log/warn/error` captured as structured logs |
| **Network Requests** | XHR/Fetch with headers and response bodies |
| **User Identity** | Attached via login page (`userId` + `userEmail`) |
| **Custom Events** | `User-Login`, `User-Logout` actions |
| **Page Navigation** | Route changes tracked as spans |

## Architecture

```
Browser SDK (@hyperdx/browser)
    │
    ├─ Session Replay ──────► ClickStack Cloud
    ├─ Console Capture ─────► (OTLP/HTTP)
    ├─ Network Capture ─────► stored in ClickHouse
    └─ Custom Events ──────►
                                    │
                              ClickStack UI
                              ├─ Session Replay
                              ├─ Log Explorer
                              ├─ Trace Viewer
                              ├─ Dashboards
                              └─ SQL Console ◄── this is the killer feature
```

## Demo SQL Queries

Open the ClickStack SQL Console and try these:

### Sessions per page

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

### Users who logged in

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

### Session duration distribution

```sql
SELECT
  TraceId AS session,
  ResourceAttributes['userId'] AS user_id,
  min(Timestamp) AS session_start,
  max(Timestamp) AS session_end,
  dateDiff('second', min(Timestamp), max(Timestamp)) AS duration_seconds
FROM otel_traces
WHERE ServiceName = 'beppe-dotfiles-docs'
  AND Timestamp > now() - INTERVAL 7 DAY
GROUP BY session, user_id
HAVING duration_seconds > 0
ORDER BY duration_seconds DESC
LIMIT 50
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

### Network request latency (slowest endpoints)

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

### Anonymous vs identified sessions

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

## Demo Walkthrough

1. **Open this site** in a fresh browser tab
2. **Browse a few pages** — Architecture, Tools, Agents
3. **Open the browser console** and type `console.log('hello from the docs')`
4. **Go to [Sign In](/login)** and enter a name/email
5. **Browse more pages** — now your activity is tagged with your identity
6. **Open ClickStack dashboard** and:
   - Find your session in Session Replay — watch the DOM recording
   - Check the Log Explorer — see your `console.log` captured
   - Open the SQL Console — run the queries above
   - Show how `userId` appears on events AFTER login but not before
7. **The punchline**: anonymous session → login → identified session, all queryable in SQL

## Integration Code

The entire integration is ~30 lines in the VitePress theme:

```typescript
// docs/.vitepress/theme/index.ts
import HyperDX from '@hyperdx/browser'

HyperDX.init({
  apiKey: 'YOUR_KEY',
  service: 'beppe-dotfiles-docs',
  consoleCapture: true,
  advancedNetworkCapture: true,
})

// On login:
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
})
```

No backend required. No database to provision. The SQL console queries ClickHouse tables that ClickStack creates automatically from the OTLP telemetry stream.
