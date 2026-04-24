// src/components/nodes/ApprovalNode.tsx
import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import type { ApprovalConfig } from '@/types/workflow';

export const ApprovalNode = memo((props: NodeProps) => {
  const config = props.data.config as ApprovalConfig;

  return (
    <BaseNode {...props} headerColor="bg-amber-500" icon="✦">
      <div className="flex flex-col gap-0.5">
        {config?.approvers?.length > 0 && (
          <span>
            {config.approvers.length} approver{config.approvers.length > 1 ? 's' : ''}
            {' '}({config.approvalType})
          </span>
        )}
        {config?.timeoutDays && (
          <span>⏱ {config.timeoutDays}d timeout → {config.onTimeout}</span>
        )}
      </div>
    </BaseNode>
  );
});
ApprovalNode.displayName = 'ApprovalNode';