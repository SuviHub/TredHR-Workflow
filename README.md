# TredHR Workflow Designer

<p align="center">
  Build, validate, and simulate HR approval workflows with a modern visual canvas.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="React Flow" src="https://img.shields.io/badge/React%20Flow-11-FF0072" />
  <img alt="Zustand" src="https://img.shields.io/badge/Zustand-5-764ABC" />
</p>

---

## What This Project Does

This app is a mini workflow builder designed around a typical **leave approval process**.
You can:

- Add and connect workflow nodes on a visual canvas
- Configure each node through a dynamic config panel
- Validate graph rules before execution
- Run a simulated execution with branch handling
- Review step-by-step execution logs

The project is intentionally modular, so adding new node types is straightforward.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/52a11da6-8e7d-40ef-8271-f18bc9e65279" />


## Demo Flow Included

The app preloads a sample template called **Leave Approval Workflow**:

`Start -> Approval -> Condition (leaveDays > 5) -> [true: API Call -> Action] / [false: Action]`

This gives a realistic baseline for testing branching and node behavior.

## Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Graph UI:** React Flow
- **State Management:** Zustand
- **Architecture Style:** Registry-driven nodes + normalized graph state

## Quick Start

### Prerequisites

- Node.js 18+ (recommended LTS)
- npm 9+

### Installation

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

Open the local URL shown in terminal (typically `http://localhost:5173`).

## Available Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - run TypeScript build and production bundle
- `npm run typecheck` - run TypeScript type checking only
- `npm run preview` - preview production build locally

## Core Features

- **Visual Workflow Canvas**
  - Drag, place, and connect workflow nodes
  - Supports custom node renderers through registry mapping

- **Configurable Node Types**
  - `start`
  - `approval`
  - `condition`
  - `action`
  - `apiCall`

- **Validation Before Run**
  - Exactly one start node
  - Cycle detection
  - Disconnected-node detection
  - Per-node config validation

- **Execution Simulation**
  - Graph traversal from start node
  - Condition-based branching via `branchKey`
  - Structured execution logs with timestamps

- **Mock Backend API**
  - Simulated async calls for template load/save/run
  - Easy to replace with real backend integration

## Architecture Overview

### 1) State Management (`src/store/workflowStore.ts`)

State is split into:

- `workflow` (normalized graph state)
  - `nodeOrder`, `nodesById`
  - `edgeOrder`, `edgesById`
- `ui` (transient app state)
  - selection, validation, execution status, loading flags

This keeps graph updates predictable and avoids deep nested updates in components.

### 2) Node Registry (`src/nodes/registry.ts`)

Each node type is defined in one place with:

- component renderer
- default config factory
- config schema
- config validator
- execution handler

This registry pattern lets you add a node without modifying traversal logic.

### 3) Service Layer (`src/services/`)

- `workflowApi.ts` - async mock API operations
- `workflowValidation.ts` - graph and config validation
- `executionEngine.ts` - runtime traversal and execution

### 4) UI Composition (`src/components/`)

- `NodePalette` - create nodes
- `WorkflowCanvas` - design graph
- `ConfigPanel` - edit selected node config
- `TestWorkflowPanel` - run simulations and inspect results

## Workflow Execution Model

Execution behavior in `src/services/executionEngine.ts`:

1. Start from the single `start` node
2. Execute the current node via node registry
3. Determine next edge:
   - first outgoing edge by default
   - branch-specific edge for conditional nodes
4. Append execution log entry:
   - `{ nodeId, type, result, timestamp }`
5. Stop when no next edge exists, node missing, or cycle is detected

## Project Structure

```text
src/
  components/        # UI panels and canvas composition
  hooks/             # custom React hooks (flow integration helpers)
  nodes/             # node components + centralized node registry
  services/          # validation, execution engine, mock API
  store/             # Zustand workflow store
  styles/            # app styling
  types/             # shared TypeScript domain types
  utils/             # node factory + graph utilities
```

## Extending the Designer

To add a new node type:

1. Create node UI component in `src/nodes/`
2. Add node config type in `src/types/workflow.ts`
3. Register behavior in `src/nodes/registry.ts`
   - default config
   - schema
   - validation
   - execute handler
4. Add creation support in `src/utils/nodeFactory.ts`
5. Ensure it appears in `NodePalette`

Because execution and rendering use the registry, support flows end-to-end once registered.

## Future Improvements

- Persist workflows to a real backend/database
- Add workflow versioning and audit history
- Support role-based access and approvals
- Add unit tests for validation and execution services
- Export/import workflow JSON

## License

This project currently has no explicit license file.
If this will be shared publicly, add a `LICENSE` (MIT, Apache-2.0, etc.) based on your intended usage.
