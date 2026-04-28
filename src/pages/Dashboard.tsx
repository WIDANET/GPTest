import React from 'react';
import QuickLogButton from '../components/QuickLogButton';
import ManualLogForm from '../components/ManualLogForm';
import History, { Medication, MedicationLog } from './History';

interface Metrics {
  totalTaken: number;
  totalManual: number;
  totalMissed: number;
  adherenceRate: number;
}

const initialMedications: Medication[] = [
  { id: 'med-1', name: 'Vitamin D', isActive: true },
  { id: 'med-2', name: 'Blood pressure med', isActive: true },
  { id: 'med-3', name: 'Inactive sample', isActive: false },
];

const initialLogs: MedicationLog[] = [
  {
    id: 'log-1',
    medicationId: 'med-1',
    takenAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    manual: false,
    status: 'taken',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'log-2',
    medicationId: 'med-2',
    takenAt: null,
    manual: false,
    status: 'missed',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
  },
];

const deriveMetrics = (logs: MedicationLog[]): Metrics => {
  const totalTaken = logs.filter((log) => log.status === 'taken').length;
  const totalManual = logs.filter((log) => log.manual).length;
  const totalMissed = logs.filter((log) => log.status === 'missed').length;
  const denominator = totalTaken + totalMissed;

  return {
    totalTaken,
    totalManual,
    totalMissed,
    adherenceRate: denominator > 0 ? Math.round((totalTaken / denominator) * 100) : 0,
  };
};

const generateId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `log-${Math.random().toString(16).slice(2)}`;

export function Dashboard() {
  const [medications] = React.useState<Medication[]>(initialMedications);
  const [logs, setLogs] = React.useState<MedicationLog[]>(initialLogs);
  const [metrics, setMetrics] = React.useState<Metrics>(() => deriveMetrics(initialLogs));
  const [snackbar, setSnackbar] = React.useState<string | null>(null);

  const activeMedications = React.useMemo(
    () => medications.filter((medication) => medication.isActive),
    [medications],
  );

  const showSnackbar = (message: string) => {
    setSnackbar(message);
  };

  React.useEffect(() => {
    if (!snackbar) {
      return;
    }

    const timeoutId = window.setTimeout(() => setSnackbar(null), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [snackbar]);

  const recalculateMetrics = React.useCallback((nextLogs: MedicationLog[]) => {
    setMetrics(deriveMetrics(nextLogs));
  }, []);

  const appendLog = (newLog: MedicationLog, toastMessage: string) => {
    setLogs((currentLogs) => {
      const nextLogs = [newLog, ...currentLogs];
      recalculateMetrics(nextLogs);
      return nextLogs;
    });
    showSnackbar(toastMessage);
  };

  const handleTakeNow = async (medicationId: string) => {
    const now = new Date().toISOString();
    appendLog(
      {
        id: generateId(),
        medicationId,
        takenAt: now,
        manual: false,
        status: 'taken',
        createdAt: now,
      },
      'Dose logged as taken now.',
    );
  };

  const handleManualSubmit = async (payload: { medicationId: string; takenAt: string; manual: true }) => {
    appendLog(
      {
        id: generateId(),
        medicationId: payload.medicationId,
        takenAt: payload.takenAt,
        manual: true,
        status: 'taken',
        createdAt: new Date().toISOString(),
      },
      'Manual dose saved.',
    );
  };

  const handleUpdateLog = (logId: string, patch: Partial<MedicationLog>) => {
    setLogs((currentLogs) => {
      const nextLogs = currentLogs.map((log) => (log.id === logId ? { ...log, ...patch } : log));
      recalculateMetrics(nextLogs);
      return nextLogs;
    });
    showSnackbar('Log updated. Metrics refreshed.');
  };

  const handleDeleteLog = (logId: string) => {
    setLogs((currentLogs) => {
      const nextLogs = currentLogs.filter((log) => log.id !== logId);
      recalculateMetrics(nextLogs);
      return nextLogs;
    });
    showSnackbar('Log deleted. Metrics refreshed.');
  };

  const getLatestStateByMedication = (medicationId: string) => {
    const latestLog = logs
      .filter((log) => log.medicationId === medicationId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    if (!latestLog) {
      return 'No entries yet';
    }

    if (latestLog.manual) {
      return `Manual entry at ${new Date(latestLog.takenAt ?? latestLog.createdAt).toLocaleString()}`;
    }

    if (latestLog.status === 'missed') {
      return 'Last entry marked missed';
    }

    return `Taken ${new Date(latestLog.takenAt ?? latestLog.createdAt).toLocaleString()}`;
  };

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: '1rem', display: 'grid', gap: '1rem' }}>
      <h1 style={{ marginBottom: 0 }}>Medication Dashboard</h1>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <article style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
          <strong>Taken</strong>
          <div>{metrics.totalTaken}</div>
        </article>
        <article style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
          <strong>Missed</strong>
          <div>{metrics.totalMissed}</div>
        </article>
        <article style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
          <strong>Manual</strong>
          <div>{metrics.totalManual}</div>
        </article>
        <article style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem' }}>
          <strong>Adherence</strong>
          <div>{metrics.adherenceRate}%</div>
        </article>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          <h2 style={{ marginBottom: 0 }}>Quick log active medications</h2>
          {activeMedications.map((medication) => (
            <article
              key={medication.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                display: 'grid',
                gap: '0.4rem',
              }}
            >
              <strong>{medication.name}</strong>
              <small>{getLatestStateByMedication(medication.id)}</small>
              <QuickLogButton medication={medication} onTakeNow={handleTakeNow} />
            </article>
          ))}
        </div>

        <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.8rem', height: 'fit-content' }}>
          <ManualLogForm medications={medications} onSubmitManualLog={handleManualSubmit} />
        </div>
      </section>

      <History
        medications={medications}
        logs={logs}
        onUpdateLog={handleUpdateLog}
        onDeleteLog={handleDeleteLog}
        onRecalculateMetrics={() => recalculateMetrics(logs)}
      />

      {snackbar ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '1rem',
            background: '#0f172a',
            color: '#ffffff',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.35)',
          }}
        >
          {snackbar}
        </div>
      ) : null}
    </main>
  );
}

export default Dashboard;
