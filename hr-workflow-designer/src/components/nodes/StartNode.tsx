// src/components/nodes/StartNode.tsx
import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { StartConfig } from '@/types/workflow';

export const StartNode = memo((props: NodeProps) => {
  const config = props.data.config as StartConfig;

  return (
    <BaseNode
      {...props}
      headerColor="bg-emerald-500"
      icon="▶"
      showTargetHandle={false}   // start has no incoming edges
    >
      <span className="capitalize">{config?.triggerType ?? 'manual'} trigger</span>
    </BaseNode>
  );
});
StartNode.displayName = 'StartNode';