// src/components/ui/NodePalette.tsx
import { getAllNodeEntries } from '@/domain/nodeRegistry';
import { clsx } from 'clsx';

export function NodePalette() {
  const entries = getAllNodeEntries();

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('application/node-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="flex flex-col gap-1 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
        Nodes
      </p>
      {entries.map((entry) => (
        <div
          key={entry.type}
          draggable
          onDragStart={(e) => onDragStart(e, entry.type)}
          className={clsx(
            'flex cursor-grab items-center gap-2 rounded-lg px-3 py-2',
            'border border-transparent hover:border-gray-200 hover:bg-gray-50',
            'select-none active:cursor-grabbing'
          )}
        >
          <div className={clsx('flex h-7 w-7 items-center justify-center rounded-md text-sm text-white', entry.headerColor)}>
            {entry.icon}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">{entry.label}</p>
            <p className="text-[10px] text-gray-400 leading-tight">{entry.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}