type SettingsProps = {
  onResetAllData: () => void;
};

export function Settings({ onResetAllData }: SettingsProps) {
  return (
    <section className="stack-lg">
      <h2 className="section-title">Settings</h2>
      <article className="card">
        <h3>Offline support</h3>
        <p>The app keeps your saved medications and logs available when offline.</p>
      </article>

      <article className="card stack-sm">
        <h3>Data</h3>
        <p>Clear all medications and logs from this device.</p>
        <button type="button" className="danger-button" onClick={onResetAllData}>
          Reset all data
        </button>
      </article>
    </section>
  );
}
