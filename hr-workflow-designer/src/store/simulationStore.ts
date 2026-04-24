// src/store/simulationStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { SimulationStep, SimulationStatus, ValidationError } from '@/types/workflow';

interface SimulationState {
  status: SimulationStatus;
  steps: SimulationStep[];
  validationErrors: ValidationError[];
  activeNodeId: string | null;

  // Actions
  setStatus: (status: SimulationStatus) => void;
  setSteps: (steps: SimulationStep[]) => void;
  setValidationErrors: (errors: ValidationError[]) => void;
  setActiveNodeId: (nodeId: string | null) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>()(
  immer((set) => ({
    status: 'idle',
    steps: [],
    validationErrors: [],
    activeNodeId: null,

    setStatus: (status) => set((state) => { state.status = status; }),
    setSteps: (steps) => set((state) => { state.steps = steps; }),
    setValidationErrors: (errors) => set((state) => { state.validationErrors = errors; }),
    setActiveNodeId: (nodeId) => set((state) => { state.activeNodeId = nodeId; }),

    reset: () => set((state) => {
      state.status = 'idle';
      state.steps = [];
      state.validationErrors = [];
      state.activeNodeId = null;
    }),
  }))
);
