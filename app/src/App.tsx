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
  { key: 'dashboard', label: 'Início' },
  { key: 'medication', label: 'Cadastrar medicamento' },
  { key: 'history', label: 'Histórico' },
  { key: 'settings', label: 'Configurações' }
];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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

    const timeoutId = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    document.title = `MedTrack • ${TABS.find((tab) => tab.key === activeTab)?.label ?? 'Início'}`;
  }, [activeTab]);

  const addMedication = (payload: Omit<Medication, 'id' | 'createdAt'>) => {
    const medication: Medication = {
      ...payload,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    setMedications((current) => [medication, ...current]);
    setToastMessage('Medicamento cadastrado com sucesso.');
    setActiveTab('dashboard');
  };

  const createLog = (medicationId: string, timestamp: string) => {
    const newLog: MedicationLog = {
      id: generateId(),
      medicationId,
      timestamp
    };

    setLogs((currentLogs) => [newLog, ...currentLogs]);
  };

  const logMedicationNow = (medicationId: string) => {
    createLog(medicationId, new Date().toISOString());
    setToastMessage('Dose registrada agora.');
  };

  const logMedicationManual = (medicationId: string, date: string, time?: string) => {
    const safeTime = time && time.trim() ? time : '12:00';
    const parsed = new Date(`${date}T${safeTime}`);
    const now = new Date();

    if (Number.isNaN(parsed.getTime()) || parsed.getTime() > now.getTime()) {
      setToastMessage('Data/hora manual inválida.');
      return;
    }

    createLog(medicationId, parsed.toISOString());
    setToastMessage('Batida manual registrada.');
  };

  const resetAllData = () => {
    setMedications([]);
    setLogs([]);
    setToastMessage('Todos os dados foram removidos.');
  };

  const todayKey = formatDateKey(new Date());

  const content = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            medications={medications}
            logs={logs}
            onQuickLog={logMedicationNow}
            onManualLog={logMedicationManual}
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
            onManualLog={logMedicationManual}
            todayKey={todayKey}
          />
        );
    }
  }, [activeTab, medications, logs, todayKey]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>MedTrack</h1>
        <p>Controle diário de medicamentos sem complicação.</p>
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
