import type { Medication, MedicationLog } from '../types';

type DashboardProps = {
  medications: Medication[];
  logs: MedicationLog[];
  onQuickLog: (medicationId: string) => void;
  todayKey: string;
};

const toDateKey = (isoDate: string) => new Date(isoDate).toISOString().slice(0, 10);

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

const calculateCompletedDays = (medicationId: string, logs: MedicationLog[]) => {
  const daySet = new Set(
    logs.filter((log) => log.medicationId === medicationId).map((log) => toDateKey(log.timestamp))
  );

  return daySet.size;
};

const getCurrentStreak = (medicationId: string, logs: MedicationLog[], todayKey: string) => {
  const days = new Set(
    logs.filter((log) => log.medicationId === medicationId).map((log) => toDateKey(log.timestamp))
  );

  let streak = 0;
  let cursor = new Date(`${todayKey}T00:00:00.000Z`);

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
};

export function Dashboard({ medications, logs, onQuickLog, todayKey }: DashboardProps) {
  if (medications.length === 0) {
    return (
      <section className="empty-state">
        <h2>No medications yet</h2>
        <p>Add your first medication in the Add tab to start logging.</p>
      </section>
    );
  }

  return (
    <section className="stack-lg">
      <h2 className="section-title">Today</h2>
      <div className="card-grid">
        {medications.map((medication) => {
          const completedDays = calculateCompletedDays(medication.id, logs);
          const loggedToday = logs.some(
            (log) => log.medicationId === medication.id && toDateKey(log.timestamp) === todayKey
          );
          const latest = logs.find((log) => log.medicationId === medication.id);
          const streak = getCurrentStreak(medication.id, logs, todayKey);

          return (
            <article key={medication.id} className="med-card">
              <div className="stack-sm">
                <h3>{medication.name}</h3>
                <p className="meta-text">{medication.dosage} • {medication.frequency}</p>
                <p className="meta-text">Schedule: {medication.schedule}</p>
              </div>

              <div className="status-grid">
                <p>
                  <strong>{completedDays}</strong> out of <strong>{medication.goalDays}</strong> days completed
                </p>
                <p>
                  Today: <span className={loggedToday ? 'status-ok' : 'status-pending'}>{loggedToday ? 'Logged' : 'Pending'}</span>
                </p>
                <p>Streak: {streak} day{streak === 1 ? '' : 's'}</p>
                <p>Last log: {latest ? formatDateTime(latest.timestamp) : 'None yet'}</p>
              </div>

              <button className="log-button" type="button" onClick={() => onQuickLog(medication.id)}>
                Log dose now
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
