// src/components/canvas/WorkflowCanvas.tsx
import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { useSimulationStore } from '@/store/simulationStore';
import { buildNodeTypes } from '@/domain/nodeRegistry';
import type { NodeType } from '@/types/workflow';

// IMPORTANT: defined outside component to keep object reference stable
const nodeTypes = buildNodeTypes();

export function WorkflowCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
  } = useWorkflowStore();

  const activeNodeId = useSimulationStore((s) => s.activeNodeId);

  // Highlight the active simulation node with a class
  const nodesWithSimState = useMemo(() =>
    nodes.map((n) => ({
      ...n,
      className: n.id === activeNodeId ? 'simulation-active' : '',
    })),
    [nodes, activeNodeId]
  );

  // Drop handler — user drags a node type from sidebar onto canvas
  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/node-type') as NodeType;
      if (!type) return;

      const bounds = (event.target as HTMLElement)
        .closest('.react-flow')
        ?.getBoundingClientRect();
      if (!bounds) return;

      // Convert screen coords to flow coords
      addNode(type, {
        x: event.clientX - bounds.left - 90,
        y: event.clientY - bounds.top - 30,
      });
    },
    [addNode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  return (
    <div className="h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        nodes={nodesWithSimState}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          animated: false,
          style: { strokeWidth: 2, stroke: '#94a3b8' },
        }}
        connectionLineStyle={{ strokeWidth: 2, stroke: '#6366f1' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              start: '#10b981',
              task: '#3b82f6',
              approval: '#f59e0b',
              automated: '#8b5cf6',
              end: '#64748b',
            };
            return colors[node.type ?? ''] ?? '#94a3b8';
          }}
          className="!border-gray-200"
        />
      </ReactFlow>
    </div>
  );
}