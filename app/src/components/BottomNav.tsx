export type TabKey = 'dashboard' | 'medication' | 'history' | 'settings';

type BottomNavProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

const tabs: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'dashboard', label: 'Home', emoji: '🏠' },
  { key: 'medication', label: 'Dose', emoji: '💊' },
  { key: 'history', label: 'History', emoji: '📋' },
  { key: 'settings', label: 'Settings', emoji: '⚙️' }
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Primary tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onTabChange(tab.key)}
          type="button"
          aria-current={activeTab === tab.key ? 'page' : undefined}
        >
          <span aria-hidden>{tab.emoji}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
