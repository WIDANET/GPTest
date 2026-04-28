import React from 'react';

export interface Medication {
  id: string;
  name: string;
  isActive: boolean;
}

export type LogStatus = 'taken' | 'missed';

export interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string | null;
  scheduledAt?: string | null;
  manual: boolean;
  status: LogStatus;
  createdAt: string;
}

interface HistoryProps {
  medications: Medication[];
  logs: MedicationLog[];
  onUpdateLog: (logId: string, patch: Partial<MedicationLog>) => void;
  onDeleteLog: (logId: string) => void;
  onRecalculateMetrics?: () => void;
}

const badgeStyles: Record<'taken' | 'missed' | 'manual', React.CSSProperties> = {
  taken: { background: '#dcfce7', color: '#166534' },
  missed: { background: '#fee2e2', color: '#991b1b' },
  manual: { background: '#dbeafe', color: '#1d4ed8' },
};

const toDateTimeLocal = (dateIso: string) => {
  const date = new Date(dateIso);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString();
};

const getDisplayStatus = (log: MedicationLog): 'taken' | 'missed' | 'manual' => {
  if (log.manual) {
    return 'manual';
  }

  return log.status === 'missed' ? 'missed' : 'taken';
};

export function History({ medications, logs, onUpdateLog, onDeleteLog, onRecalculateMetrics }: HistoryProps) {
  const [editingLogId, setEditingLogId] = React.useState<string | null>(null);

  const sortedLogs = React.useMemo(
    () => [...logs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [logs],
  );

  const calendarMap = React.useMemo(() => {
    const map = new Map<string, MedicationLog[]>();

    for (const log of sortedLogs) {
      const key = new Date(log.takenAt ?? log.createdAt).toISOString().slice(0, 10);
      const existing = map.get(key) ?? [];
      existing.push(log);
      map.set(key, existing);
    }

    return [...map.entries()];
  }, [sortedLogs]);

  const resolveMedicationName = (medicationId: string) =>
    medications.find((medication) => medication.id === medicationId)?.name ?? 'Unknown medication';

  const handleSaveEdit = (event: React.FormEvent<HTMLFormElement>, log: MedicationLog) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const status = String(formData.get('status')) as LogStatus;
    const manual = formData.get('manual') === 'on';
    const takenAtRaw = String(formData.get('takenAt'));

    onUpdateLog(log.id, {
      manual,
      status,
      takenAt: takenAtRaw ? new Date(takenAtRaw).toISOString() : null,
    });
    onRecalculateMetrics?.();
    setEditingLogId(null);
  };

  const handleDelete = (logId: string) => {
    onDeleteLog(logId);
    onRecalculateMetrics?.();
  };

  return (
    <section style={{ display: 'grid', gap: '1rem' }}>
      <h2 style={{ margin: 0 }}>History</h2>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {sortedLogs.map((log) => {
          const displayStatus = getDisplayStatus(log);

          return (
            <article
              key={log.id}
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                display: 'grid',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <strong>{resolveMedicationName(log.medicationId)}</strong>
                <span
                  style={{
                    ...badgeStyles[displayStatus],
                    borderRadius: '999px',
                    padding: '0.2rem 0.65rem',
                    textTransform: 'capitalize',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {displayStatus}
                </span>
              </div>

              {editingLogId === log.id ? (
                <form onSubmit={(event) => handleSaveEdit(event, log)} style={{ display: 'grid', gap: '0.6rem' }}>
                  <label>
                    Date/time
                    <input name="takenAt" type="datetime-local" defaultValue={log.takenAt ? toDateTimeLocal(log.takenAt) : ''} />
                  </label>
                  <label>
                    Status
                    <select name="status" defaultValue={log.status}>
                      <option value="taken">taken</option>
                      <option value="missed">missed</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <input name="manual" type="checkbox" defaultChecked={log.manual} />
                    Manual entry
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditingLogId(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>Taken at: {formatDateTime(log.takenAt)}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingLogId(log.id)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(log.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>

      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
        <h3 style={{ marginTop: 0 }}>Calendar view</h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {calendarMap.map(([date, dayLogs]) => (
            <div key={date} style={{ border: '1px dashed #cbd5e1', borderRadius: '0.5rem', padding: '0.5rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>{date}</div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                {dayLogs.map((log) => {
                  const status = getDisplayStatus(log);
                  return (
                    <li key={log.id} style={{ color: (badgeStyles[status].color as string) ?? '#0f172a' }}>
                      {resolveMedicationName(log.medicationId)} — {status}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default History;
