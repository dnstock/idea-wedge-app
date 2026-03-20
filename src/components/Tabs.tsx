import type { TabKey } from '../types';

interface TabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  onReset: () => void;
}

const tabs: TabKey[] = ['workspace', 'reviews', 'compare', 'setup'];

export function Tabs({ activeTab, onChange, onReset }: TabsProps) {
  return (
    <div className="tabs-grid">
      <div className="tabs">
        {tabs.map((tab) => (
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
      <button className="button iridescent-button" onClick={onReset} type="button">
        New Idea
      </button>
    </div>
  );
}
