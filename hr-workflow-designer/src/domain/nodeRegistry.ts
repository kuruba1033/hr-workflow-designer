// // src/domain/nodeRegistry.ts
// import type { NodeType, NodeConfig } from '@/types/workflow';
// import type { ComponentType } from 'react';
// import type { NodeProps } from '@xyflow/react';

// export interface NodeRegistryEntry {
//   type: NodeType;
//   label: string;
//   color: string;             // Tailwind bg class for sidebar + node header
//   icon: string;              // emoji or SVG key
//   defaultConfig: NodeConfig;
//   component: ComponentType<NodeProps>;  // lazy-loaded below
//   configFields: ConfigFieldDef[];      // drives the form panel
// }

// export interface ConfigFieldDef {
//   key: string;
//   label: string;
//   type: 'text' | 'select' | 'number' | 'boolean' | 'multi-select' | 'textarea';
//   options?: { label: string; value: string }[];
//   required?: boolean;
//   placeholder?: string;
// }

// // Populated after components are created — see next step
// export const nodeRegistry: Record<NodeType, NodeRegistryEntry> = {} as any;

// export function registerNode(entry: NodeRegistryEntry) {
//   nodeRegistry[entry.type] = entry;
// }

// export function getNodeEntry(type: NodeType): NodeRegistryEntry {
//   const entry = nodeRegistry[type];
//   if (!entry) throw new Error(`No registry entry for node type: ${type}`);
//   return entry;
// }

// src/domain/nodeRegistry.ts  (full version — replaces the stub from earlier)
import type { NodeType, NodeConfig } from '@/types/workflow';
import type { ComponentType } from 'react';
import type { NodeProps } from '@xyflow/react';
import { StartNode }    from '@/components/nodes/StartNode';
import { EndNode }      from '@/components/nodes/EndNode';
import { TaskNode }     from '@/components/nodes/TaskNode';
import { ApprovalNode } from '@/components/nodes/ApprovalNode';
import { AutomatedNode } from '@/components/nodes/AutomatedNode';

export interface ConfigFieldDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'boolean' | 'multi-text' | 'textarea';
  options?: { label: string; value: string }[];
  required?: boolean;
  placeholder?: string;
  dependsOn?: { key: string; value: string };  // conditional visibility
}

export interface NodeRegistryEntry {
  type: NodeType;
  label: string;
  description: string;
  headerColor: string;
  icon: string;
  defaultConfig: NodeConfig;
  component: ComponentType<NodeProps>;
  configFields: ConfigFieldDef[];
}

const registry: Record<NodeType, NodeRegistryEntry> = {
  start: {
    type: 'start',
    label: 'Start',
    description: 'Entry point of the workflow',
    headerColor: 'bg-emerald-500',
    icon: '▶',
    component: StartNode,
    defaultConfig: { triggerType: 'manual' },
    configFields: [
      {
        key: 'triggerType',
        label: 'Trigger type',
        type: 'select',
        required: true,
        options: [
          { label: 'Manual', value: 'manual' },
          { label: 'Scheduled', value: 'scheduled' },
          { label: 'Event-based', value: 'event' },
        ],
      },
      {
        key: 'cronExpression',
        label: 'Cron expression',
        type: 'text',
        placeholder: '0 9 * * 1',
        dependsOn: { key: 'triggerType', value: 'scheduled' },
      },
      {
        key: 'eventName',
        label: 'Event name',
        type: 'text',
        placeholder: 'employee.hired',
        dependsOn: { key: 'triggerType', value: 'event' },
      },
    ],
  },

  task: {
    type: 'task',
    label: 'Task',
    description: 'A human-assigned task with a deadline',
    headerColor: 'bg-blue-500',
    icon: '✓',
    component: TaskNode,
    defaultConfig: {
      label: 'New Task',
      assignee: '',
      dueInDays: 3,
      priority: 'medium',
    },
    configFields: [
      { key: 'label', label: 'Task name', type: 'text', required: true },
      { key: 'assignee', label: 'Assignee (email)', type: 'text', required: true, placeholder: 'user@company.com' },
      { key: 'priority', label: 'Priority', type: 'select', required: true,
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
      { key: 'dueInDays', label: 'Due in (days)', type: 'number', required: true },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional task details...' },
    ],
  },

  approval: {
    type: 'approval',
    label: 'Approval',
    description: 'Requires sign-off from one or more approvers',
    headerColor: 'bg-amber-500',
    icon: '✦',
    component: ApprovalNode,
    defaultConfig: {
      label: 'Approval',
      approvers: [],
      approvalType: 'any',
      timeoutDays: 5,
      onTimeout: 'escalate',
    },
    configFields: [
      { key: 'label', label: 'Step name', type: 'text', required: true },
      { key: 'approvers', label: 'Approvers (one per line)', type: 'multi-text', required: true },
      { key: 'approvalType', label: 'Approval rule', type: 'select', required: true,
        options: [
          { label: 'Any approver', value: 'any' },
          { label: 'All approvers', value: 'all' },
        ],
      },
      { key: 'timeoutDays', label: 'Timeout (days)', type: 'number', required: true },
      { key: 'onTimeout', label: 'On timeout', type: 'select', required: true,
        options: [
          { label: 'Reject', value: 'reject' },
          { label: 'Escalate', value: 'escalate' },
        ],
      },
    ],
  },

  automated: {
    type: 'automated',
    label: 'Automated Step',
    description: 'Executes an integration or automation action',
    headerColor: 'bg-violet-500',
    icon: '⚡',
    component: AutomatedNode,
    defaultConfig: {
      label: 'Automated Step',
      actionId: '',
      params: {},
    },
    configFields: [
      { key: 'label', label: 'Step name', type: 'text', required: true },
      // actionId is a dynamic select populated from GET /automations
      // handled specially in NodeConfigPanel — not a static field
    ],
  },

  end: {
    type: 'end',
    label: 'End',
    description: 'Terminal state of the workflow',
    headerColor: 'bg-slate-500',
    icon: '⏹',
    component: EndNode,
    defaultConfig: {
      outcome: 'completed',
      notifyInitiator: true,
    },
    configFields: [
      { key: 'outcome', label: 'Outcome', type: 'select', required: true,
        options: [
          { label: 'Completed', value: 'completed' },
          { label: 'Cancelled', value: 'cancelled' },
          { label: 'Rejected', value: 'rejected' },
        ],
      },
      { key: 'notifyInitiator', label: 'Notify initiator', type: 'boolean' },
    ],
  },
};

// Public API
export function getNodeEntry(type: NodeType): NodeRegistryEntry {
  const entry = registry[type];
  if (!entry) throw new Error(`No registry entry for node type: ${type}`);
  return entry;
}

export function getAllNodeEntries(): NodeRegistryEntry[] {
  return Object.values(registry);
}

// React Flow requires this map format
export function buildNodeTypes(): Record<string, ComponentType<NodeProps>> {
  return Object.fromEntries(
    Object.entries(registry).map(([type, entry]) => [type, entry.component])
  );
}