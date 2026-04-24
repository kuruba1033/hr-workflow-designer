// src/domain/serializer.ts
import type { Workflow } from '@/types/workflow';

export function serializeWorkflow(workflow: Workflow): string {
  return JSON.stringify(workflow, null, 2);
}

export function deserializeWorkflow(json: string): Workflow {
  const parsed = JSON.parse(json);
  // In production: run Zod schema validation here
  return parsed as Workflow;
}