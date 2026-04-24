// src/components/simulation/SimulationPanel.tsx
import { useCallback } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useSimulationStore } from '@/store/simulationStore';
import { validateWorkflow } from '@/domain/validator';
import { serializeWorkflow } from '@/domain/serializer';
import { clsx as _clsx } from 'clsx';
import type { SimulationStep } from '@/types/workflow';

export function SimulationPanel() {
  const { nodes, edges } = useWorkflowStore();
  const {
    status, steps, validationErrors,
    setStatus, setSteps, setValidationErrors, setActiveNodeId, reset,
  } = useSimulationStore();

  const workflow = {
    id: 'preview',
    name: 'Workflow Preview',
    nodes,
    edges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleValidate = useCallback(() => {
    reset();
    setStatus('validating');
    const result = validateWorkflow(workflow);
    setValidationErrors(result.errors);
    setStatus(result.valid ? 'idle' : 'error');
  }, [workflow]);

  const handleSimulate = useCallback(async () => {
    reset();
    setStatus('validating');

    const validation = validateWorkflow(workflow);
    if (!validation.valid) {
      setValidationErrors(validation.errors);
      setStatus('error');
      return;
    }

    setStatus('running');
    try {
      // Stream steps one by one for visual feedback
      const orderedNodes = getTopologicalOrder(nodes, edges);
      const collectedSteps: SimulationStep[] = [];

      for (const nodeId of orderedNodes) {
        setActiveNodeId(nodeId);
        await new Promise((r) => setTimeout(r, 600)); // visual pause

        const node = nodes.find((n) => n.id === nodeId)!;
        const step: SimulationStep = {
          nodeId,
          nodeLabel: node.data.label,
          status: 'completed',
          message: getStepMessage(node.type, node.data.label),
          durationMs: Math.round(200 + Math.random() * 800),
          timestamp: new Date().toISOString(),
        };

        collectedSteps.push(step);
        setSteps([...collectedSteps]);
      }

      setActiveNodeId(null);
      setStatus('completed');
    } catch (err) {
      setStatus('error');
    }
  }, [workflow]);

  const handleSerialize = useCallback(() => {
    const json = serializeWorkflow(workflow);
    navigator.clipboard.writeText(json);
    alert('Workflow JSON copied to clipboard!');
  }, [workflow]);

  const isEmpty = nodes.length === 0;

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        Sandbox
      </p>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleValidate}
          disabled={isEmpty || status === 'running'}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm
                     font-medium text-gray-700 hover:bg-gray-50
                     disabled:cursor-not-allowed disabled:opacity-40"
        >
          ✓ Validate
        </button>
        <button
          onClick={handleSimulate}
          disabled={isEmpty || status === 'running'}
          className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium
                     text-white hover:bg-blue-600
                     disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === 'running' ? '⏳ Running…' : '▶ Simulate'}
        </button>
        <button
          onClick={handleSerialize}
          disabled={isEmpty}
          className="rounded-md border border-gray-200 px-3 py-2 text-sm
                     font-medium text-gray-600 hover:bg-gray-50
                     disabled:cursor-not-allowed disabled:opacity-40"
        >
          {'{ }'} Export JSON
        </button>
        {(status !== 'idle') && (
          <button
            onClick={reset}
            className="text-xs text-gray-400 hover:text-gray-600 text-left"
          >
            ↺ Reset
          </button>
        )}
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 space-y-1">
          <p className="text-xs font-semibold text-red-600">Validation failed</p>
          {validationErrors.map((err, i) => (
            <p key={i} className="text-xs text-red-500">• {err.message}</p>
          ))}
        </div>
      )}

      {/* Execution log */}
      {steps.length > 0 && (
        <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500">Execution log</p>
          {steps.map((step, i) => (
            <StepRow key={step.nodeId} step={step} index={i} />
          ))}
          {status === 'completed' && (
            <p className="mt-2 text-xs text-emerald-600 font-medium">
              ✓ Simulation completed
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StepRow({ step, index }: { step: SimulationStep; index: number }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-gray-50 px-2.5 py-2">
      <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center
                       rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-600">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 truncate">{step.nodeLabel}</p>
        <p className="text-[10px] text-gray-400">{step.message}</p>
      </div>
      <span className="flex-shrink-0 text-[10px] text-gray-300">{step.durationMs}ms</span>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getTopologicalOrder(
  nodes: { id: string }[],
  edges: { source: string; target: string }[]
): string[] {
  const adj: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  nodes.forEach((n) => { adj[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach((e) => {
    adj[e.source].push(e.target);
    inDegree[e.target]++;
  });
  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  const result: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    result.push(id);
    for (const nb of adj[id]) {
      if (--inDegree[nb] === 0) queue.push(nb);
    }
  }
  return result;
}

function getStepMessage(type: string, label: string): string {
  const msgs: Record<string, string> = {
    start: `Workflow triggered: ${label}`,
    task: `Task assigned: ${label}`,
    approval: `Approval requested: ${label}`,
    automated: `Automation executed: ${label}`,
    end: `Workflow ended: ${label}`,
  };
  return msgs[type] ?? `${label} completed`;
}