# HR Workflow Designer

A visual drag-and-drop workflow builder for HR processes. Design, validate, simulate, and export automation workflows using an intuitive node-based canvas.

---

## Features

- Drag and drop nodes onto a canvas to build workflows
- Connect nodes with edges to define execution flow
- Configure each node with a right-side panel
- Validate workflows for errors (missing start/end, orphan nodes, cycles)
- Simulate workflow execution step by step
- Export workflow as JSON

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Canvas / Flow | @xyflow/react (React Flow) v12 |
| State Management | Zustand v5 + Immer |
| Styling | Tailwind CSS v4 |
| Form Handling | React Hook Form + Zod |
| ID Generation | nanoid |

---

## Project Structure

```
src/
├── api/
│   ├── automations.ts     # GET /automations — fetch available actions
│   ├── simulation.ts      # POST /simulate — run workflow simulation
│   ├── client.ts          # Mock fetch client with simulated latency
│   └── mockData.ts        # Mock automation actions data
├── components/
│   ├── canvas/
│   │   └── WorkflowCanvas.tsx    # React Flow canvas with drag/drop
│   ├── nodes/
│   │   ├── BaseNode.tsx
│   │   ├── StartNode.tsx
│   │   ├── TaskNode.tsx
│   │   ├── ApprovalNode.tsx
│   │   ├── AutomatedNode.tsx
│   │   └── EndNode.tsx
│   ├── panels/
│   │   └── NodeConfigPanel.tsx   # Right panel — node config form
│   ├── simulation/
│   │   └── SimulationPanel.tsx   # Simulation controls + log
│   └── ui/
│       └── NodePalette.tsx       # Left sidebar — draggable node list
├── domain/
│   ├── nodeRegistry.ts    # Node type definitions and defaults
│   ├── validator.ts       # validateWorkflow() — 4 validation rules
│   └── serializer.ts      # serializeWorkflow() / deserializeWorkflow()
├── store/
│   ├── workflowStore.ts   # nodes, edges, selection state
│   └── simulationStore.ts # simulation status, steps, logs
├── types/
│   └── workflow.ts        # All TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

---

## Architecture Flow

```
User drags node from NodePalette
        ↓
WorkflowCanvas receives onDrop
        ↓
workflowStore.addNode() → state update
        ↓
ReactFlow re-renders canvas with new node
        ↓
User clicks node → workflowStore.selectNode()
        ↓
NodeConfigPanel shows config form
        ↓
User edits config → workflowStore.updateNodeConfig()
        ↓
User clicks Validate
        ↓
validateWorkflow() checks 4 rules → shows errors or success
        ↓
User clicks Simulate
        ↓
postSimulate() runs topological sort (Kahn's algorithm)
        ↓
Each node executes in order → simulationStore updates steps
        ↓
SimulationPanel shows live execution log
        ↓
User clicks Export JSON
        ↓
serializeWorkflow() → JSON copied to clipboard
```

---

## Node Types

| Node | Color | Purpose |
|---|---|---|
| **Start** | Green | Entry point — triggers the workflow |
| **Task** | Blue | Human-assigned task with assignee and due date |
| **Approval** | Orange | Requires sign-off from one or more approvers |
| **Automated Step** | Purple | Executes an integration or automation action |
| **End** | Grey | Terminal state — marks workflow completion |

---

## Mock API Endpoints

The app uses a mock API layer that simulates real backend calls with 400ms latency.  
To connect a real backend, replace the functions in `src/api/client.ts`.

### GET /automations
Returns available automation actions.

```json
[
  {
    "id": "send-email",
    "name": "Send Email",
    "description": "Send a notification email to specified recipients",
    "params": [
      { "key": "to", "label": "Recipient", "type": "string", "required": true },
      { "key": "subject", "label": "Subject", "type": "string", "required": true },
      { "key": "template", "label": "Template", "type": "select", "required": true,
        "options": ["onboarding", "reminder", "approval-request", "rejection"] }
    ]
  },
  {
    "id": "create-jira-ticket",
    "name": "Create Jira Ticket",
    "description": "Create a ticket in the configured Jira project",
    "params": [
      { "key": "projectKey", "label": "Project Key", "type": "string", "required": true },
      { "key": "issueType", "label": "Issue Type", "type": "select", "required": true,
        "options": ["Task", "Story", "Bug"] }
    ]
  },
  {
    "id": "slack-notify",
    "name": "Slack Notification",
    "description": "Post a message to a Slack channel",
    "params": [
      { "key": "channel", "label": "Channel", "type": "string", "required": true },
      { "key": "message", "label": "Message", "type": "string", "required": true }
    ]
  }
]
```

### POST /simulate
Accepts a workflow and returns step-by-step execution results.

**Request:**
```json
{
  "workflow": {
    "id": "workflow-1",
    "name": "Onboarding Flow",
    "nodes": [...],
    "edges": [...]
  }
}
```

**Response:**
```json
{
  "success": true,
  "steps": [
    {
      "nodeId": "abc123",
      "nodeLabel": "Start",
      "status": "completed",
      "message": "Workflow triggered via Start",
      "durationMs": 342,
      "timestamp": "2026-04-24T10:00:00.000Z"
    }
  ],
  "errors": [],
  "totalDurationMs": 1240
}
```

---

## Validation Rules

`validateWorkflow()` checks these 4 rules:

1. **Missing Start** — must have exactly one Start node
2. **Missing End** — must have at least one End node
3. **Orphan Nodes** — every node must be connected to at least one edge
4. **Cycle Detection** — workflow must be a DAG (no loops), uses DFS algorithm

---

## How to Run

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Start

```bash
# Clone the repository
git clone https://github.com/kuruba1033/hr-workflow-designer.git

# Go into the project folder
cd hr-workflow-designer

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Other Commands

```bash
npm run build      # Type check + production build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

---

## How to Use

1. **Drag** a node from the left sidebar onto the canvas
2. **Connect** nodes by dragging from the bottom handle of one node to the top of another
3. **Click** any node to configure it in the right panel
4. **Validate** your workflow using the ✓ Validate button
5. **Simulate** execution step-by-step using the ▶ Simulate button
6. **Export** the workflow as JSON using the { } Export JSON button

---

## License

MIT
