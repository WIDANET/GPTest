export function MedicationForm() {
  return (
    <section>
      <h2>Log Medication</h2>
      <form className="form-grid">
        <label>
          Medication
          <input type="text" placeholder="e.g., Metformin" />
        </label>
        <label>
          Dosage
          <input type="text" placeholder="500 mg" />
        </label>
        <label>
          Time taken
          <input type="time" />
        </label>
        <button type="submit">Save dose</button>
      </form>
    </section>
  );
}
