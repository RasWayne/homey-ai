'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
}

export function Tabs({ tabs, defaultTabId, onChange }: TabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState(defaultTabId ?? tabs[0]?.id ?? '');

  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900',
          )}
          onClick={() => {
            setActiveTab(tab.id);
            onChange?.(tab.id);
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
