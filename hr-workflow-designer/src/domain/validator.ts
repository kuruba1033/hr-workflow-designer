// src/domain/validator.ts
import type { Workflow, ValidationResult, ValidationError } from '@/types/workflow';

export function validateWorkflow(workflow: Workflow): ValidationResult {
  const errors: ValidationError[] = [];
  const { nodes, edges } = workflow;

  // Rule 1: exactly one start node
  const startNodes = nodes.filter((n) => n.type === 'start');
  if (startNodes.length === 0)
    errors.push({ type: 'missing_start', message: 'Workflow must have a Start node.' });
  if (startNodes.length > 1)
    errors.push({ type: 'missing_start', message: 'Workflow can only have one Start node.' });

  // Rule 2: at least one end node
  const endNodes = nodes.filter((n) => n.type === 'end');
  if (endNodes.length === 0)
    errors.push({ type: 'missing_end', message: 'Workflow must have at least one End node.' });

  // Rule 3: no orphan nodes (unconnected, unless it's the only node)
  if (nodes.length > 1) {
    const connectedIds = new Set([
      ...edges.map((e) => e.source),
      ...edges.map((e) => e.target),
    ]);
    nodes.forEach((node) => {
      if (!connectedIds.has(node.id)) {
        errors.push({
          nodeId: node.id,
          type: 'orphan_node',
          message: `Node "${node.data.label}" is not connected to any edge.`,
        });
      }
    });
  }

  // Rule 4: cycle detection (DFS)
  if (hasCycle(nodes.map((n) => n.id), edges)) {
    errors.push({ type: 'cycle', message: 'Workflow contains a cycle.' });
  }

  return { valid: errors.length === 0, errors };
}

function hasCycle(
  nodeIds: string[],
  edges: { source: string; target: string }[]
): boolean {
  const adj: Record<string, string[]> = {};
  nodeIds.forEach((id) => (adj[id] = []));
  edges.forEach(({ source, target }) => adj[source]?.push(target));

  const visited = new Set<string>();
  const stack = new Set<string>();

  function dfs(id: string): boolean {
    visited.add(id);
    stack.add(id);
    for (const neighbor of adj[id] ?? []) {
      if (!visited.has(neighbor) && dfs(neighbor)) return true;
      if (stack.has(neighbor)) return true;
    }
    stack.delete(id);
    return false;
  }

  return nodeIds.some((id) => !visited.has(id) && dfs(id));
}