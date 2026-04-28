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
      dosage: form.dosage.trim() || 'Não informado',
      frequency: form.frequency.trim() || 'Não informado',
      schedule: form.schedule.trim() || 'Não informado',
      goalDays: goalDaysNumber
    });

    setForm(initialForm);
  };

  return (
    <section className="stack-lg">
      <h2 className="section-title">Cadastrar medicamento</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Ex.: Metformina"
            required
          />
        </label>
        <label>
          Dosagem
          <input
            type="text"
            value={form.dosage}
            onChange={(event) => updateField('dosage', event.target.value)}
            placeholder="Ex.: 500 mg"
          />
        </label>
        <label>
          Frequência
          <input
            type="text"
            value={form.frequency}
            onChange={(event) => updateField('frequency', event.target.value)}
            placeholder="Ex.: 1x ao dia"
          />
        </label>
        <label>
          Rotina/horário
          <input
            type="text"
            value={form.schedule}
            onChange={(event) => updateField('schedule', event.target.value)}
            placeholder="Ex.: Após o café da manhã"
          />
        </label>
        <label>
          Meta (dias)
          <input
            type="number"
            min={1}
            value={form.goalDays}
            onChange={(event) => updateField('goalDays', event.target.value)}
            required
          />
        </label>

        <button type="submit" className="primary-button">Salvar medicamento</button>
      </form>
    </section>
  );
}
