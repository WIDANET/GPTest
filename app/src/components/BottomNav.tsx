export type TabKey = 'dashboard' | 'medication' | 'history' | 'settings';

type BottomNavProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

const tabs: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'dashboard', label: 'Início', emoji: '🏠' },
  { key: 'medication', label: 'Cadastro', emoji: '➕' },
  { key: 'history', label: 'Histórico', emoji: '📋' },
  { key: 'settings', label: 'Ajustes', emoji: '⚙️' }
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Abas principais">
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
