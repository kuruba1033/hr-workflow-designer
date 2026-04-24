// src/api/automations.ts
import { mockGet } from './client';
import { MOCK_ACTIONS } from './mockData';
import type { AutomationAction } from '@/types/workflow';

export async function getAutomations(): Promise<AutomationAction[]> {
  return mockGet(MOCK_ACTIONS);
}