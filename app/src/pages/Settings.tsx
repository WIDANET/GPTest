export function Settings() {
  return (
    <section>
      <h2>Settings</h2>
      <div className="card-grid">
        <article className="card">
          <h3>Reminders</h3>
          <p>Enable push reminders when notifications are granted.</p>
        </article>
        <article className="card">
          <h3>Offline mode</h3>
          <p>Recent activity is cached to keep the app usable offline.</p>
        </article>
      </div>
    </section>
  );
}
