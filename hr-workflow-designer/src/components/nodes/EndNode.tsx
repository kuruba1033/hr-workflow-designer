// src/components/nodes/EndNode.tsx
import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { EndConfig } from '@/types/workflow';

const outcomeIcon: Record<string, string> = {
  completed: '✓',
  cancelled: '✕',
  rejected: '✗',
};

export const EndNode = memo((props: NodeProps) => {
  const config = props.data.config as EndConfig;

  return (
    <BaseNode
      {...props}
      headerColor="bg-slate-500"
      icon="⏹"
      showSourceHandle={false}   // end has no outgoing edges
    >
      <div className="flex flex-col gap-0.5">
        {config?.outcome && (
          <span>
            {outcomeIcon[config.outcome] ?? ''} {config.outcome}
          </span>
        )}
        {config?.notifyInitiator && (
          <span>📧 Notify initiator</span>
        )}
      </div>
    </BaseNode>
  );
});

EndNode.displayName = 'EndNode';
