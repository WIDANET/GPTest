import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { MedicationForm } from './pages/MedicationForm';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { BottomNav, type TabKey } from './components/BottomNav';
import { InstallBanner } from './components/InstallBanner';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'medication', label: 'Log Dose' },
  { key: 'history', label: 'History' },
  { key: 'settings', label: 'Settings' }
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  useEffect(() => {
    document.title = `MedTrack • ${TABS.find((tab) => tab.key === activeTab)?.label ?? 'Dashboard'}`;
  }, [activeTab]);

  const content = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'medication':
        return <MedicationForm />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  }, [activeTab]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>MedTrack</h1>
        <p>Medication support, even offline.</p>
      </header>

      <InstallBanner />

      <main className="app-main" aria-live="polite">
        {content}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
