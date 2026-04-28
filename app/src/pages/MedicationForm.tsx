import { useState, type FormEvent } from 'react';
import type { Medication } from '../types';

type MedicationFormProps = {
  onCreateMedication: (payload: Omit<Medication, 'id' | 'createdAt'>) => void;
};

const initialForm = {
  name: '',
  dosage: '',
  frequency: '',
  schedule: '',
  goalDays: '30'
};

export function MedicationForm({ onCreateMedication }: MedicationFormProps) {
  const [form, setForm] = useState(initialForm);

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const goalDaysNumber = Number(form.goalDays);
    if (!form.name.trim() || goalDaysNumber < 1) {
      return;
    }

    onCreateMedication({
      name: form.name.trim(),
      dosage: form.dosage.trim() || 'Not specified',
      frequency: form.frequency.trim() || 'Not specified',
      schedule: form.schedule.trim() || 'Not specified',
      goalDays: goalDaysNumber
    });

    setForm(initialForm);
  };

  return (
    <section className="stack-lg">
      <h2 className="section-title">Add Medication</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="e.g., Metformin"
            required
          />
        </label>
        <label>
          Dosage
          <input
            type="text"
            value={form.dosage}
            onChange={(event) => updateField('dosage', event.target.value)}
            placeholder="e.g., 500 mg"
          />
        </label>
        <label>
          Frequency
          <input
            type="text"
            value={form.frequency}
            onChange={(event) => updateField('frequency', event.target.value)}
            placeholder="e.g., Once daily"
          />
        </label>
        <label>
          Schedule
          <input
            type="text"
            value={form.schedule}
            onChange={(event) => updateField('schedule', event.target.value)}
            placeholder="e.g., After breakfast"
          />
        </label>
        <label>
          Goal (days)
          <input
            type="number"
            min={1}
            value={form.goalDays}
            onChange={(event) => updateField('goalDays', event.target.value)}
            required
          />
        </label>

        <button type="submit" className="primary-button">Save medication</button>
      </form>
    </section>
  );
}
