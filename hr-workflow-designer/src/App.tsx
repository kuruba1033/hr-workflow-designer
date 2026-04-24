// src/App.tsx
import { ReactFlowProvider } from '@xyflow/react';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import { NodePalette } from '@/components/ui/NodePalette';
import { NodeConfigPanel } from '@/components/panels/NodeConfigPanel';
import { SimulationPanel } from '@/components/simulation/SimulationPanel';

export default function App() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans">

        {/* Left sidebar — node palette */}
        <aside className="flex w-52 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h1 className="text-sm font-semibold text-gray-800">HR Workflow Designer</h1>
            <p className="text-[10px] text-gray-400">Drag nodes to canvas</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NodePalette />
          </div>
        </aside>

        {/* Center — canvas */}
        <main className="flex-1 overflow-hidden">
          <WorkflowCanvas />
        </main>

        {/* Right sidebar — config + simulation */}
        <aside className="flex w-64 flex-shrink-0 flex-col border-l border-gray-200 bg-white">
          <div className="flex-1 overflow-hidden border-b border-gray-100">
            <NodeConfigPanel />
          </div>
          <div className="h-64 overflow-hidden">
            <SimulationPanel />
          </div>
        </aside>

      </div>
    </ReactFlowProvider>
  );
}