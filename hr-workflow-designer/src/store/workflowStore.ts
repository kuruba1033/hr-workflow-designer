// src/store/workflowStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import { nanoid } from 'nanoid';
import type { WorkflowNode, WorkflowEdge, NodeType, NodeConfig } from '@/types/workflow';
import { getNodeEntry } from '@/domain/nodeRegistry';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;

  // React Flow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Custom actions
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNodeConfig: (nodeId: string, config: Partial<NodeConfig>) => void;
  selectNode: (nodeId: string | null) => void;
  deleteNode: (nodeId: string) => void;
  clearWorkflow: () => void;
  getSelectedNode: () => WorkflowNode | null;
}

export const useWorkflowStore = create<WorkflowState>()(
  immer((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,

    onNodesChange: (changes) =>
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes) as WorkflowNode[];
      }),

    onEdgesChange: (changes) =>
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges) as WorkflowEdge[];
      }),

    onConnect: (connection) =>
      set((state) => {
        state.edges = addEdge(
          { ...connection, id: nanoid(), animated: false },
          state.edges
        ) as WorkflowEdge[];
      }),

    addNode: (type, position) => {
      const entry = getNodeEntry(type);
      const node: WorkflowNode = {
        id: nanoid(),
        type,
        position,
        data: {
          label: entry.label,
          config: { ...entry.defaultConfig },
        },
      };
      set((state) => { state.nodes.push(node); });
    },

    updateNodeConfig: (nodeId, config) =>
      set((state) => {
        const node = state.nodes.find((n: WorkflowNode) => n.id === nodeId);
        if (node) {
          node.data.config = { ...node.data.config, ...config } as NodeConfig;
        }
      }),

    selectNode: (nodeId) => set((state) => { state.selectedNodeId = nodeId; }),

    deleteNode: (nodeId) =>
      set((state) => {
        state.nodes = state.nodes.filter((n: WorkflowNode) => n.id !== nodeId);
        state.edges = state.edges.filter(
          (e: WorkflowEdge) => e.source !== nodeId && e.target !== nodeId
        );
        if (state.selectedNodeId === nodeId) state.selectedNodeId = null;
      }),

    clearWorkflow: () =>
      set((state) => { state.nodes = []; state.edges = []; state.selectedNodeId = null; }),

    getSelectedNode: () => {
      const { nodes, selectedNodeId } = get();
      return nodes.find((n) => n.id === selectedNodeId) ?? null;
    },
  }))
);