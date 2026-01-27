# Bickford Platform UI & Native App Screen Architecture

**Authoritative Build Specification**

## 1. Platform Overview

The Bickford web application is a **platform UI** that hosts multiple **first-class native applications**.

The platform consists of:

- A **Landing / App Directory** (`/platform`)
- A **Chat-style Execution Interface** (`/chat`)
- A collection of **Bickford Native Apps** (`/platform/[appId]`), each with:
  - Defined screens
  - Deterministic navigation
  - JSON-backed executable workflows
  - Visual + execution parity

All UI surfaces must be **directly derived from structured configuration**, not hardcoded logic.

---

## 2. Architecture Principles

### 2.1 Declarative Everything

**UI never performs logic directly.**

```
User Action → Dispatch Workflow → Platform Executes → UI Renders Result
```

### 2.2 Visual ↔ Execution Parity

For every screen:

| Layer     | Requirement          |
| --------- | -------------------- |
| Visual    | Fully navigable UI   |
| Data      | Structured JSON      |
| Execution | Workflow-backed      |
| Audit     | Deterministic replay |

If a screen exists visually, it **must be executable**.  
If a workflow exists, it **must be renderable**.

### 2.3 No Imperative Routing

Navigation is declarative:

```json
{
  "from": "trace-list",
  "to": "trace-detail",
  "trigger": "onRowClick"
}
```

---

## 3. Implementation Status

### ✅ Built (Now)

- **Platform Core Types** (`platform/ui/types.ts`)
- **Workflow Executor** (`platform/ui/workflows/executor.ts`)
- **Decision Trace Viewer App** (`apps/decision-trace-viewer/`)
- **Compression Dashboard App** (`apps/compression-dashboard/`)
- **Platform Manifest** (`platform/ui/manifest.json`)
- **Landing Page** (`app/platform/page.tsx`)
- **App Renderer** (`app/platform/[appId]/page.tsx`)

### 🚧 Next Phase

- **Component Library** (Timeline, Table, JSON Viewer, etc.)
- **Workflow Runtime Integration** (Connect to platform core)
- **Real-time Data Binding** (WebSocket updates)
- **Interactive Navigation** (Client-side routing)

---

## 4. File Structure

```
platform/
  ui/
    types.ts                    # Core type definitions
    manifest.json               # App registry
    workflows/
      executor.ts               # Workflow execution engine
    renderer/
      components/               # Reusable UI components
    schemas/                    # Data schemas

apps/
  decision-trace-viewer/
    app.json                    # App manifest
    screens/                    # Screen definitions (embedded in app.json)
    workflows/                  # Workflow definitions (embedded in app.json)

  compression-dashboard/
    app.json

  constitutional-ai-enforcer/
    app.json

app/
  platform/
    page.tsx                    # Landing page (app directory)
    [appId]/
      page.tsx                  # App renderer

docs/
  BUILD_SPEC.md                 # This file
  ARCHITECTURE.md               # Overall platform architecture
```

---

## 5. Usage Examples

### Creating a New Screen

```json
{
  "id": "new-screen",
  "type": "screen",
  "layout": "split",
  "components": [
    {
      "id": "data-table",
      "type": "table",
      "source": "workflow.fetchData",
      "onSelect": "showDetail"
    }
  ],
  "dataBindings": {
    "fetchData": {
      "type": "workflow",
      "source": "fetchTableData"
    }
  },
  "actions": {
    "showDetail": "openDetailView"
  }
}
```

### Creating a New Workflow

```json
{
  "id": "fetchTableData",
  "name": "Fetch Table Data",
  "steps": [
    {
      "type": "fetch",
      "resource": "decisionLedger",
      "params": {
        "limit": 100
      }
    },
    {
      "type": "transform",
      "transform": "data.map(d => ({ id: d.id, timestamp: d.metadata.timestamp }))"
    }
  ],
  "output": {
    "schema": "tableData",
    "target": "data-table"
  }
}
```

---

## 6. Development Workflow

### Adding a New Native App

1. Create `apps/your-app/app.json`
2. Define screens in `screens` object
3. Define workflows in `workflows` object
4. Register in `platform/ui/manifest.json`
5. Navigate to `/platform/your-app`

### Testing Workflows

Workflows are executed by `WorkflowExecutor` which integrates with platform core:

- Enforcement Engine
- Tamper-Evident Ledger
- Proof Generator
- Compression Engine

---

## 7. Next Steps

1. **Build Component Library** (Timeline, Table, JSON Viewer)
2. **Connect Workflow Runtime** (Integrate with platform core)
3. **Add Real-time Updates** (WebSocket for live data)
4. **Implement Navigation** (Client-side routing with workflow dispatch)
5. **Add Authentication** (User context in workflows)

---

## Summary

> Build a platform UI that renders native applications whose screens, navigation, and behaviors are fully defined by declarative JSON schemas and executable workflow scripts, ensuring visual execution parity and deterministic replay across the entire system.

**Status: Foundation Complete ✅**
**Next: Component Library + Runtime Integration 🚧**
