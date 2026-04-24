// src/components/nodes/TaskNode.tsx
import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { TaskConfig } from '@/types/workflow';

export const TaskNode = memo((props: NodeProps) => {
  const config = props.data.config as TaskConfig;

  const priorityColor: Record<string, string> = {
    low: 'text-gray-400',
    medium: 'text-amber-500',
    high: 'text-red-500',
  };

  return (
    <BaseNode {...props} headerColor="bg-blue-500" icon="✓">
      <div className="flex flex-col gap-0.5">
        {config?.assignee && (
          <span>👤 {config.assignee}</span>
        )}
        {config?.dueInDays !== undefined && (
          <span>⏱ {config.dueInDays}d deadline</span>
        )}
        {config?.priority && (
          <span className={priorityColor[config.priority] ?? ''}>
            ● {config.priority}
          </span>
        )}
      </div>
    </BaseNode>
  );
});
TaskNode.displayName = 'TaskNode';