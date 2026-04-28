import React from 'react';

export interface ManualMedicationOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface ManualLogFormProps {
  medications: ManualMedicationOption[];
  onSubmitManualLog: (payload: { medicationId: string; takenAt: string; manual: true }) => Promise<void> | void;
  disabled?: boolean;
}

const toDateTimeLocal = (date: Date) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 16);
};

export function ManualLogForm({ medications, onSubmitManualLog, disabled = false }: ManualLogFormProps) {
  const activeMedicationOptions = React.useMemo(
    () => medications.filter((medication) => medication.isActive),
    [medications],
  );

  const [medicationId, setMedicationId] = React.useState(activeMedicationOptions[0]?.id ?? '');
  const [takenAt, setTakenAt] = React.useState(toDateTimeLocal(new Date()));
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!activeMedicationOptions.some((option) => option.id === medicationId)) {
      setMedicationId(activeMedicationOptions[0]?.id ?? '');
    }
  }, [activeMedicationOptions, medicationId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!medicationId || !takenAt || isSubmitting || disabled) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitManualLog({
        medicationId,
        takenAt: new Date(takenAt).toISOString(),
        manual: true,
      });
      setTakenAt(toDateTimeLocal(new Date()));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
      <h3 style={{ margin: 0 }}>Manual entry</h3>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>Medication</span>
        <select
          value={medicationId}
          onChange={(event) => setMedicationId(event.target.value)}
          disabled={disabled || isSubmitting || activeMedicationOptions.length === 0}
          required
        >
          {activeMedicationOptions.length === 0 ? <option value="">No active medications</option> : null}
          {activeMedicationOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>

      <label style={{ display: 'grid', gap: '0.25rem' }}>
        <span>Date and time</span>
        <input
          type="datetime-local"
          value={takenAt}
          onChange={(event) => setTakenAt(event.target.value)}
          disabled={disabled || isSubmitting}
          required
        />
      </label>

      <button
        type="submit"
        disabled={disabled || isSubmitting || !medicationId || !takenAt}
        style={{
          border: '1px solid #64748b',
          borderRadius: '0.5rem',
          padding: '0.6rem 0.85rem',
          background: '#0f172a',
          color: '#fff',
          fontWeight: 600,
        }}
      >
        {isSubmitting ? 'Saving…' : 'Save manual log'}
      </button>
    </form>
  );
}

export default ManualLogForm;
