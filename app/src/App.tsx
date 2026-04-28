import { useEffect, useMemo, useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { MedicationForm } from './pages/MedicationForm';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { BottomNav, type TabKey } from './components/BottomNav';
import { InstallBanner } from './components/InstallBanner';
import { loadAppData, saveAppData } from './storage';
import type { Medication, MedicationLog } from './types';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'medication', label: 'Add Medication' },
  { key: 'history', label: 'History' },
  { key: 'settings', label: 'Settings' }
];

const formatDateKey = (isoDate: string) => new Date(isoDate).toISOString().slice(0, 10);

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(16).slice(2);

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initial = loadAppData();
    setMedications(initial.medications);
    setLogs(initial.logs);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    saveAppData({ medications, logs });
  }, [isHydrated, medications, logs]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => setToastMessage(null), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    document.title = `MedTrack • ${TABS.find((tab) => tab.key === activeTab)?.label ?? 'Dashboard'}`;
  }, [activeTab]);

  const addMedication = (payload: Omit<Medication, 'id' | 'createdAt'>) => {
    const medication: Medication = {
      ...payload,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    setMedications((current) => [medication, ...current]);
    setToastMessage('Medication added.');
    setActiveTab('dashboard');
  };

  const logMedicationNow = (medicationId: string) => {
    const newLog: MedicationLog = {
      id: generateId(),
      medicationId,
      timestamp: new Date().toISOString()
    };

    setLogs((currentLogs) => [newLog, ...currentLogs]);
    setToastMessage('Dose logged.');
  };

  const resetAllData = () => {
    setMedications([]);
    setLogs([]);
    setToastMessage('All medication data removed.');
  };

  const todayKey = formatDateKey(new Date().toISOString());

  const content = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            medications={medications}
            logs={logs}
            onQuickLog={logMedicationNow}
            todayKey={todayKey}
          />
        );
      case 'medication':
        return <MedicationForm onCreateMedication={addMedication} />;
      case 'history':
        return <History medications={medications} logs={logs} />;
      case 'settings':
        return <Settings onResetAllData={resetAllData} />;
      default:
        return (
          <Dashboard
            medications={medications}
            logs={logs}
            onQuickLog={logMedicationNow}
            todayKey={todayKey}
          />
        );
    }
  }, [activeTab, medications, logs, todayKey]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>MedTrack</h1>
        <p>Quick daily medication logging.</p>
      </header>

      <InstallBanner />

      <main className="app-main" aria-live="polite">
        {content}
      </main>

      {toastMessage ? <div className="toast">{toastMessage}</div> : null}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
