# Notion Property Type Reference

**Purpose**: Prevent property format errors when creating/updating Notion pages

**Last Updated**: 2025-11-14 (validated against production Agent Session Notes schema)

---

## The Problem

Notion properties have **strict type requirements** that aren't obvious from the API:

**Common Errors**:
```
❌ "Related project": ["https://..."]  → expects string, got array
❌ "Token usage": "120000"             → expects number, got string
❌ "Archived": true                    → expects "__YES__", got boolean
```

**Root cause**: SQLite schema shows `TEXT` for relations (JSON arrays), but API expects JSON-encoded string.

---

## Property Type Guide

### 1. Relation Fields (CRITICAL)

**Schema shows**:
```sql
"Related project" TEXT, -- JSON array of page URLs
```

**Correct format**:
```javascript
// Single relation
"Related project": "[\"https://www.notion.so/2abbb74829e38183ba3bc517ddbc9b97\"]"

// Multiple relations
"Related tasks": "[\"https://notion.so/task1\",\"https://notion.so/task2\"]"

// Empty relation (optional)
"Related project": "[]"
```

**Pattern**: Always `JSON.stringify([...urls...])` the array, even for single values.

### 2. Number Fields

**Schema shows**:
```sql
"Token usage" FLOAT
"Compact events" FLOAT
```

**Correct format**:
```javascript
"Token usage": 120535        // ✅ Number (no quotes)
"Compact events": 0          // ✅ Number
"Compact events": null       // ✅ Null defaults to 0
```

**Wrong**:
```javascript
"Token usage": "120000"      // ❌ String rejected
```

### 3. Checkbox Fields

**Schema shows**:
```sql
"Archived" TEXT, -- "__YES__" = true, "__NO__" = false, NULL defaults to false
```

**Correct format**:
```javascript
"Archived": "__YES__"        // ✅ Checked
"Archived": "__NO__"         // ✅ Unchecked
// Or omit entirely (defaults to false)
```

**Wrong**:
```javascript
"Archived": true             // ❌ Boolean rejected
"Archived": "true"           // ❌ String "true" rejected
```

### 4. Select Fields (Single Choice)

**Schema shows**:
```sql
"Session type" TEXT, -- one of ["Research", "Implementation", "Analysis", "Handoff"]
"Agent" TEXT, -- one of ["Agent A", "Agent B", "Multi-agent", "User"]
```

**Correct format**:
```javascript
"Session type": "Handoff"    // ✅ Exact match (case-sensitive)
"Agent": "Agent A"           // ✅ Exact match with space
```

**Wrong**:
```javascript
"Session type": "handoff"    // ❌ Wrong case
"Agent": "AgentA"            // ❌ Missing space
"Session type": "Other"      // ❌ Not in options list
```

**Rule**: Must match option name exactly, including case and spaces.

### 5. Date Fields

**Schema shows**:
```sql
"date:Date:start" TEXT, -- ISO-8601 date or datetime string
"date:Date:end" TEXT, -- ISO-8601 date or datetime string, can be empty
"date:Date:is_datetime" INTEGER, -- 1 if datetime, 0 if date
```

**Correct format**:
```javascript
// Date only (no time)
"date:Date:start": "2025-11-14"
"date:Date:is_datetime": 0

// Datetime (with time)
"date:Date:start": "2025-11-14T22:30:00Z"
"date:Date:is_datetime": 1

// Date range
"date:Date:start": "2025-11-14"
"date:Date:end": "2025-11-21"
"date:Date:is_datetime": 0
```

**Rule**: Always use expanded properties (`date:<name>:start`), never shorthand.

### 6. URL Fields

**Schema shows**:
```sql
"External references" TEXT
"Git commits" TEXT
```

**Correct format**:
```javascript
"External references": "https://example.com"         // ✅ Plain string
"Git commits": "https://github.com/user/repo/..."    // ✅ Full URL
```

**Rule**: Plain string, no special encoding.

### 7. Text Fields (Rich Text)

**Schema shows**:
```sql
"Key findings" TEXT
"Decisions made" TEXT
"Next steps" TEXT
```

**Correct format**:
```javascript
// Single line
"Key findings": "Discovered X"

// Multiline (use \n)
"Next steps": "1. Do this\n2. Do that\n3. Finally this"

// Empty (optional)
"Key findings": ""
```

**Rule**: Plain string, `\n` for newlines.

### 8. Title Fields

**Schema shows**:
```sql
"Session title" TEXT  -- type: title
```

**Correct format**:
```javascript
"Session title": "Tab Completion System Architecture"    // ✅ Plain string
```

**Rule**: Every page must have exactly one title property set.

---

## Validation Workflow

**Before creating any Notion page**:

### Step 1: Fetch Schema
```javascript
const config = Read("~/.config/claude/notion-agent-workspace.json");
const db = mcp__notion__notion-fetch(config.databases.agent_session_notes.database_id);

// Look for <sqlite-table> in response
// Identify property types: TEXT (relation/select/text), FLOAT (number), etc.
```

### Step 2: Format Properties
```javascript
const properties = {
  "Session title": "...",                           // title (required)
  "Session type": "Handoff",                        // select
  "Agent": "Agent A",                               // select
  "date:Date:start": "2025-11-14",                  // date (expanded)
  "date:Date:is_datetime": 0,                       // date flag
  "Related project": "[\"https://notion.so/...\"]", // relation (JSON string!)
  "Token usage": 120000,                            // number (no quotes)
  "Archived": "__NO__",                             // checkbox
  "Key findings": "Summary here"                    // text
};
```

### Step 3: Validate Before Sending
```javascript
// Check required fields
if (!properties["Session title"]) throw "Missing title";

// Check select options match
const validSessionTypes = ["Research", "Implementation", "Analysis", "Handoff"];
if (!validSessionTypes.includes(properties["Session type"])) {
  throw `Invalid Session type: ${properties["Session type"]}`;
}

// Check relation format (must be JSON string)
if (properties["Related project"] && !properties["Related project"].startsWith("[")) {
  throw "Related project must be JSON array string";
}

// Check numbers are numbers
if (typeof properties["Token usage"] === "string") {
  throw "Token usage must be number, not string";
}
```

---

## Common Error Messages

### "invalid_union"
**Meaning**: Property value type doesn't match schema

**Fix**: Check if using wrong format (array vs string, string vs number)

### "invalid_type: expected string, received array"
**Meaning**: Relation field got actual array instead of JSON string

**Fix**: `JSON.stringify(array)` the relation value

### "invalid_enum_value"
**Meaning**: Select field value not in options list

**Fix**: Check exact spelling/case against schema options

---

## Production Example (Validated)

```javascript
// From Agent Session Notes schema
mcp__notion__notion-create-pages({
  parent: {data_source_id: "441b8ad1-33a6-4c16-8ba5-2969c5612e37"},
  pages: [{
    properties: {
      // Required
      "Session title": "Tab Completion Architecture",

      // Select fields (exact match)
      "Session type": "Implementation",
      "Agent": "Agent A",

      // Date (expanded format)
      "date:Date:start": "2025-11-14",
      "date:Date:is_datetime": 0,

      // Relation (JSON string!)
      "Related project": "[\"https://www.notion.so/2abbb74829e38183ba3bc517ddbc9b97\"]",

      // Numbers (no quotes)
      "Token usage": 121535,
      "Compact events": 0,

      // Text fields
      "Key findings": "Fixed completion loading\nAdded lazy-load pattern",
      "Next steps": "1. Test\n2. Deploy\n3. Document",
      "Git commits": "https://github.com/user/repo/commit/abc123",
      "External references": "https://docs.example.com"
    },
    content: "# Session Context\n\nDetailed notes here..."
  }]
});
```

**This format validated** against production schema and succeeds.

---

## Future: Auto-Validation

**Proposed**: Add schema validator to notion-manager:

```javascript
function validateProperties(db_id, properties) {
  const schema = mcp__notion__notion-fetch(db_id);

  for (const [key, value] of Object.entries(properties)) {
    const field = schema.properties[key];

    switch (field.type) {
      case "relation":
        if (typeof value !== "string" || !value.startsWith("[")) {
          throw `${key} must be JSON array string, got: ${typeof value}`;
        }
        break;
      case "number":
        if (typeof value !== "number" && value !== null) {
          throw `${key} must be number, got: ${typeof value}`;
        }
        break;
      case "select":
        if (!field.options.includes(value)) {
          throw `${key} must be one of: ${field.options.join(", ")}`;
        }
        break;
      // etc...
    }
  }
}
```

**Benefit**: Catch errors before API call, save round-trips.

---

**Last Verified**: 2025-11-14 against Agent Session Notes database
**Schema URL**: https://www.notion.so/469b8281369f4b4490fb056145a5596c
