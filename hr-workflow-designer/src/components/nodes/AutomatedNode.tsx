// src/components/nodes/AutomatedNode.tsx
import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { AutomatedConfig } from '@/types/workflow';

export const AutomatedNode = memo((props: NodeProps) => {
  const config = props.data.config as AutomatedConfig;

  return (
    <BaseNode {...props} headerColor="bg-violet-500" icon="⚡">
      {config?.actionId && (
        <span className="font-mono text-[10px] bg-gray-50 px-1 py-0.5 rounded">
          {config.actionId}
        </span>
      )}
    </BaseNode>
  );
});
AutomatedNode.displayName = 'AutomatedNode';