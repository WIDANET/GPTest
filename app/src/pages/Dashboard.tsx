import { useState } from 'react';
import type { Medication, MedicationLog } from '../types';

type DashboardProps = {
  medications: Medication[];
  logs: MedicationLog[];
  onQuickLog: (medicationId: string) => void;
  onManualLog: (medicationId: string, date: string, time?: string) => void;
  todayKey: string;
};

type ManualDraft = {
  date: string;
  time: string;
};

const toDateKeyFromDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toLocalDateKey = (isoDate: string) => toDateKeyFromDate(new Date(isoDate));

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString('pt-BR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

const calculateCompletedDays = (medicationId: string, logs: MedicationLog[]) => {
  const daySet = new Set(
    logs.filter((log) => log.medicationId === medicationId).map((log) => toLocalDateKey(log.timestamp))
  );

  return daySet.size;
};

const getCurrentStreak = (medicationId: string, logs: MedicationLog[], todayKey: string) => {
  const days = new Set(
    logs.filter((log) => log.medicationId === medicationId).map((log) => toLocalDateKey(log.timestamp))
  );

  let streak = 0;
  const cursor = new Date(`${todayKey}T12:00:00`);

  while (days.has(toDateKeyFromDate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export function Dashboard({ medications, logs, onQuickLog, onManualLog, todayKey }: DashboardProps) {
  const [manualDrafts, setManualDrafts] = useState<Record<string, ManualDraft>>({});

  const updateManualDraft = (medicationId: string, patch: Partial<ManualDraft>) => {
    setManualDrafts((current) => ({
      ...current,
      [medicationId]: {
        date: current[medicationId]?.date ?? todayKey,
        time: current[medicationId]?.time ?? '12:00',
        ...patch
      }
    }));
  };

  if (medications.length === 0) {
    return (
      <section className="empty-state">
        <h2>Nenhum medicamento cadastrado</h2>
        <p>Abra a aba de cadastro para adicionar seu primeiro medicamento.</p>
      </section>
    );
  }

  return (
    <section className="stack-lg">
      <h2 className="section-title">Hoje</h2>
      <div className="card-grid">
        {medications.map((medication) => {
          const completedDays = calculateCompletedDays(medication.id, logs);
          const loggedToday = logs.some(
            (log) => log.medicationId === medication.id && toLocalDateKey(log.timestamp) === todayKey
          );
          const latest = logs.find((log) => log.medicationId === medication.id);
          const streak = getCurrentStreak(medication.id, logs, todayKey);
          const draft = manualDrafts[medication.id] ?? { date: todayKey, time: '12:00' };

          return (
            <article key={medication.id} className="med-card">
              <div className="stack-sm">
                <h3>{medication.name}</h3>
                <p className="meta-text">{medication.dosage} • {medication.frequency}</p>
                <p className="meta-text">Horário/plano: {medication.schedule}</p>
              </div>

              <div className="status-grid">
                <p>
                  <strong>{completedDays}</strong> de <strong>{medication.goalDays}</strong> dias concluídos
                </p>
                <p>
                  Hoje:{' '}
                  <span className={loggedToday ? 'status-ok' : 'status-pending'}>
                    {loggedToday ? 'Registrado' : 'Pendente'}
                  </span>
                </p>
                <p>Sequência atual: {streak} dia{streak === 1 ? '' : 's'}</p>
                <p>Último registro: {latest ? formatDateTime(latest.timestamp) : 'Ainda sem registro'}</p>
              </div>

              <button className="log-button" type="button" onClick={() => onQuickLog(medication.id)}>
                Registrar agora
              </button>

              <div className="manual-log-grid">
                <p className="manual-title">Esqueceu de bater? Registre manualmente:</p>
                <div className="manual-fields">
                  <label>
                    Data
                    <input
                      type="date"
                      max={todayKey}
                      value={draft.date}
                      onChange={(event) => updateManualDraft(medication.id, { date: event.target.value })}
                    />
                  </label>
                  <label>
                    Hora
                    <input
                      type="time"
                      value={draft.time}
                      onChange={(event) => updateManualDraft(medication.id, { time: event.target.value })}
                    />
                  </label>
                </div>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => onManualLog(medication.id, draft.date, draft.time)}
                >
                  Registrar batida manual
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
