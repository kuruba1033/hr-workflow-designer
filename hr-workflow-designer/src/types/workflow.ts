// src/types/workflow.ts

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

// ─── Node configs ────────────────────────────────────────────────────

export interface StartConfig {
  triggerType: 'manual' | 'scheduled' | 'event';
  cronExpression?: string;
  eventName?: string;
}

export interface TaskConfig {
  label: string;
  assignee: string;
  dueInDays: number;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

export interface ApprovalConfig {
  label: string;
  approvers: string[];
  approvalType: 'any' | 'all';
  timeoutDays: number;
  onTimeout: 'reject' | 'escalate';
}

export interface AutomatedConfig {
  label: string;
  actionId: string;
  params?: Record<string, unknown>;
}

export interface EndConfig {
  outcome: 'completed' | 'cancelled' | 'rejected';
  notifyInitiator: boolean;
}

export type NodeConfig =
  | StartConfig
  | TaskConfig
  | ApprovalConfig
  | AutomatedConfig
  | EndConfig;

// ─── Workflow graph types ────────────────────────────────────────────

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  config: NodeConfig;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
  className?: string;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  animated?: boolean;
  style?: React.CSSProperties;
}

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

// ─── Validation ──────────────────────────────────────────────────────

export type ValidationErrorType =
  | 'missing_start'
  | 'missing_end'
  | 'orphan_node'
  | 'cycle'
  | 'invalid_config';

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  nodeId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ─── Simulation ──────────────────────────────────────────────────────

export interface SimulationRequest {
  workflow: Workflow;
}

export type SimulationStepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface SimulationStep {
  nodeId: string;
  nodeLabel: string;
  status: SimulationStepStatus;
  message: string;
  durationMs: number;
  timestamp: string;
}

export interface SimulationResult {
  success: boolean;
  steps: SimulationStep[];
  errors: string[];
  totalDurationMs: number;
}

export type SimulationStatus = 'idle' | 'validating' | 'running' | 'completed' | 'error';

// ─── Automation actions ──────────────────────────────────────────────

export interface AutomationParam {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
  defaultValue?: unknown;
  placeholder?: string;
}

export interface AutomationAction {
  id: string;
  name: string;
  description: string;
  params: AutomationParam[];
}
