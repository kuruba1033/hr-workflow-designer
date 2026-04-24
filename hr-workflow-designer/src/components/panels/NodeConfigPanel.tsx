// src/components/panels/NodeConfigPanel.tsx
import { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { getNodeEntry } from '@/domain/nodeRegistry';
import { getAutomations } from '@/api/automations';
import type { AutomationAction, NodeConfig, AutomatedConfig } from '@/types/workflow';
import type { ConfigFieldDef } from '@/domain/nodeRegistry';
import { clsx } from 'clsx';

export function NodeConfigPanel() {
  const selectedNode = useWorkflowStore((s) => s.getSelectedNode());
  const updateNodeConfig = useWorkflowStore((s) => s.updateNodeConfig);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const [automations, setAutomations] = useState<AutomationAction[]>([]);

  useEffect(() => {
    getAutomations().then(setAutomations);
  }, []);

  if (!selectedNode) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-400">
          Select a node on the canvas to configure it
        </p>
      </div>
    );
  }

  const entry = getNodeEntry(selectedNode.type);
  const config = selectedNode.data.config as unknown as Record<string, unknown>;

  const handleChange = (key: string, value: unknown) => {
    updateNodeConfig(selectedNode.id, { [key]: value } as Partial<NodeConfig>);
  };

  // For automated nodes: derive dynamic param fields from selected action
  const selectedAction = automations.find(
    (a) => a.id === (config as unknown as AutomatedConfig).actionId
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Panel header */}
      <div className={clsx('flex items-center gap-2 px-4 py-3', entry.headerColor)}>
        <span>{entry.icon}</span>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white">{entry.label}</p>
          <p className="text-[10px] text-white/70">{entry.description}</p>
        </div>
        <button
          onClick={() => deleteNode(selectedNode.id)}
          className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
          title="Delete node"
        >
          ✕
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {entry.configFields.map((field) => (
          <ConfigField
            key={field.key}
            field={field}
            value={config[field.key]}
            watchedValues={config}
            onChange={(v) => handleChange(field.key, v)}
          />
        ))}

        {/* Automated node: dynamic action selector + param fields */}
        {selectedNode.type === 'automated' && (
          <AutomatedFields
            automations={automations}
            selectedAction={selectedAction}
            config={config as unknown as AutomatedConfig}
            onActionChange={(id) => {
              handleChange('actionId', id);
              handleChange('params', {}); // reset params on action change
            }}
            onParamChange={(key, value) =>
              handleChange('params', { ...((config as unknown as AutomatedConfig).params ?? {}), [key]: value })
            }
          />
        )}
      </div>
    </div>
  );
}

// ─── Generic field renderer ─────────────────────────────────────────

interface ConfigFieldProps {
  field: ConfigFieldDef;
  value: unknown;
  watchedValues: Record<string, unknown>;
  onChange: (value: unknown) => void;
}

function ConfigField({ field, value, watchedValues, onChange }: ConfigFieldProps) {
  // Conditional visibility
  if (field.dependsOn) {
    if (watchedValues[field.dependsOn.key] !== field.dependsOn.value) return null;
  }

  const inputClass =
    'w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm ' +
    'focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400';

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">
        {field.label}
        {field.required && <span className="ml-0.5 text-red-400">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          className={inputClass}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          className={clsx(inputClass, 'resize-none')}
          rows={3}
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          className={inputClass}
          value={(value as number) ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}

      {field.type === 'select' && (
        <select
          className={inputClass}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}

      {field.type === 'boolean' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-500"
            checked={(value as boolean) ?? false}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-xs text-gray-500">Enabled</span>
        </label>
      )}

      {field.type === 'multi-text' && (
        <MultiTextInput
          value={(value as string[]) ?? []}
          onChange={onChange}
          placeholder={field.placeholder ?? 'Add entry…'}
        />
      )}
    </div>
  );
}

// ─── Multi-text input (for approvers list) ──────────────────────────

function MultiTextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setDraft('');
    }
  };

  return (
    <div className="space-y-1.5">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-1 rounded bg-gray-50 px-2 py-1 text-xs">
          <span className="flex-1 text-gray-700">{item}</span>
          <button
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="text-gray-400 hover:text-red-400"
          >✕</button>
        </div>
      ))}
      <div className="flex gap-1">
        <input
          className="flex-1 rounded-md border border-gray-200 px-2 py-1 text-xs
                     focus:border-blue-400 focus:outline-none"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button
          onClick={add}
          className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Automated node: dynamic action + params ─────────────────────────

function AutomatedFields({
  automations,
  selectedAction,
  config,
  onActionChange,
  onParamChange,
}: {
  automations: AutomationAction[];
  selectedAction?: AutomationAction;
  config: AutomatedConfig;
  onActionChange: (id: string) => void;
  onParamChange: (key: string, value: unknown) => void;
}) {
  const inputClass =
    'w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-sm ' +
    'focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400';

  return (
    <>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">
          Action <span className="text-red-400">*</span>
        </label>
        <select
          className={inputClass}
          value={config.actionId ?? ''}
          onChange={(e) => onActionChange(e.target.value)}
        >
          <option value="">Select an action…</option>
          {automations.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {selectedAction && (
          <p className="text-[10px] text-gray-400">{selectedAction.description}</p>
        )}
      </div>

      {selectedAction?.params.map((param) => (
        <div key={param.key} className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">
            {param.label}
            {param.required && <span className="ml-0.5 text-red-400">*</span>}
          </label>

          {param.type === 'select' ? (
            <select
              className={inputClass}
              value={(config.params?.[param.key] as string) ?? ''}
              onChange={(e) => onParamChange(param.key, e.target.value)}
            >
              <option value="">Select…</option>
              {param.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : param.type === 'boolean' ? (
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={(config.params?.[param.key] as boolean) ?? param.defaultValue ?? false}
              onChange={(e) => onParamChange(param.key, e.target.checked)}
            />
          ) : (
            <input
              type={param.type === 'number' ? 'number' : 'text'}
              className={inputClass}
              value={(config.params?.[param.key] as string) ?? ''}
              onChange={(e) =>
                onParamChange(param.key, param.type === 'number' ? Number(e.target.value) : e.target.value)
              }
            />
          )}
        </div>
      ))}
    </>
  );
}