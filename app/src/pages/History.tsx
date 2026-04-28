import type { Medication, MedicationLog } from '../types';

type HistoryProps = {
  medications: Medication[];
  logs: MedicationLog[];
};

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

export function History({ medications, logs }: HistoryProps) {
  if (logs.length === 0) {
    return (
      <section className="empty-state">
        <h2>Ainda não há histórico</h2>
        <p>Quando você registrar uma dose, ela aparecerá aqui com data e hora.</p>
      </section>
    );
  }

  const medicationsById = new Map(medications.map((medication) => [medication.id, medication]));

  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <section className="stack-lg">
      <h2 className="section-title">Histórico de registros</h2>
      <ul className="history-list">
        {sortedLogs.map((log) => (
          <li key={log.id} className="history-item">
            <strong>{medicationsById.get(log.medicationId)?.name ?? 'Medicamento não encontrado'}</strong>
            <span>{formatDate(log.timestamp)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
