import type { TabKey } from '../types';

interface TabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}

const allTabs: TabKey[] = ['workspace', 'reviews', 'compare'];
const devTabs: TabKey[] = ['setup'];

const tabs: TabKey[] = allTabs.concat(import.meta.env.DEV ? devTabs : []);

export function Tabs({ activeTab, onChange }: TabsProps) {
  return (
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
  );
}
