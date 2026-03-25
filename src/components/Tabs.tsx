import { TAB_KEYS } from '../config';
import type { TabKey } from '../types';

interface TabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

export function Tabs({ activeTab, onChange }: TabsProps) {
  return (
    <div className="tabs">
      {TAB_KEYS.map((tab) => (
        <button
          key={tab}
          className={`tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onChange(tab)}
          type="button"
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
