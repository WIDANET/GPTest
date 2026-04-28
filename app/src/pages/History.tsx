import type { Medication, MedicationLog } from '../types';

type HistoryProps = {
  medications: Medication[];
  logs: MedicationLog[];
};

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

export function History({ medications, logs }: HistoryProps) {
  if (logs.length === 0) {
    return (
      <section className="empty-state">
        <h2>No history yet</h2>
        <p>When you log a dose, it will appear here with date and time.</p>
      </section>
    );
  }

  const medicationsById = new Map(medications.map((medication) => [medication.id, medication]));

  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <section className="stack-lg">
      <h2 className="section-title">Log History</h2>
      <ul className="history-list">
        {sortedLogs.map((log) => (
          <li key={log.id} className="history-item">
            <strong>{medicationsById.get(log.medicationId)?.name ?? 'Unknown medication'}</strong>
            <span>{formatDate(log.timestamp)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
