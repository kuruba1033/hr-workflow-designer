// src/components/nodes/BaseNode.tsx
import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { clsx } from 'clsx';
import { useWorkflowStore } from '@/store/workflowStore';
import { useSimulationStore } from '@/store/simulationStore';
import type { WorkflowNode } from '@/types/workflow';

interface BaseNodeProps extends NodeProps {
  headerColor: string;     // Tailwind bg class
  icon: string;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  children?: React.ReactNode;
}

export const BaseNode = memo(({
  id,
  data,
  selected,
  headerColor,
  icon,
  showSourceHandle = true,
  showTargetHandle = true,
  children,
}: BaseNodeProps) => {
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const activeNodeId = useSimulationStore((s) => s.activeNodeId);

  const isActive = activeNodeId === id;
  const node = data as WorkflowNode['data'];

  return (
    <div
      onClick={() => selectNode(id)}
      className={clsx(
        'min-w-[180px] rounded-lg border bg-white shadow-sm transition-all',
        selected && 'ring-2 ring-blue-500 ring-offset-1',
        isActive && 'ring-2 ring-amber-400 ring-offset-1 shadow-amber-100 shadow-md',
        !selected && !isActive && 'border-gray-200 hover:border-gray-300',
      )}
    >
      {/* Header */}
      <div className={clsx('flex items-center gap-2 rounded-t-lg px-3 py-2', headerColor)}>
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-white truncate">{node.label}</span>
      </div>

      {/* Body */}
      {children && (
        <div className="px-3 py-2 text-xs text-gray-500">
          {children}
        </div>
      )}

      {/* Handles */}
      {showTargetHandle && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}
      {showSourceHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
        />
      )}
    </div>
  );
});

BaseNode.displayName = 'BaseNode';