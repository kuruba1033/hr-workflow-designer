// src/api/simulation.ts
import type { SimulationRequest, SimulationResult, SimulationStep } from '@/types/workflow';

export async function postSimulate(request: SimulationRequest): Promise<SimulationResult> {
  // Topological sort → execute each node in order
  const { nodes, edges } = request.workflow;
  const adj: Record<string, string[]> = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach((e) => adj[e.source]?.push(e.target));

  // Kahn's algorithm for topological order
  const inDegree: Record<string, number> = {};
  nodes.forEach((n) => (inDegree[n.id] = 0));
  edges.forEach((e) => { inDegree[e.target] = (inDegree[e.target] ?? 0) + 1; });

  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  const order: string[] = [];

  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const neighbor of adj[id]) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  // Simulate each step with a fake delay
  const steps: SimulationStep[] = [];
  let totalDuration = 0;

  for (const nodeId of order) {
    const node = nodes.find((n) => n.id === nodeId)!;
    const duration = 200 + Math.random() * 800;
    totalDuration += duration;

    await new Promise((r) => setTimeout(r, duration / 10)); // real pause for UX

    steps.push({
      nodeId,
      nodeLabel: node.data.label,
      status: 'completed',
      message: getStepMessage(node.type, node.data.label),
      durationMs: Math.round(duration),
      timestamp: new Date().toISOString(),
    });
  }

  return { success: true, steps, errors: [], totalDurationMs: Math.round(totalDuration) };
}

function getStepMessage(type: string, label: string): string {
  const messages: Record<string, string> = {
    start: `Workflow triggered via "${label}"`,
    task: `Task "${label}" assigned and queued`,
    approval: `Approval request sent for "${label}"`,
    automated: `Automation "${label}" executed successfully`,
    end: `Workflow reached end state: "${label}"`,
  };
  return messages[type] ?? `Step "${label}" completed`;
}