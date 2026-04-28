export function Dashboard() {
  return (
    <section>
      <h2>Today</h2>
      <div className="card-grid">
        <article className="card">
          <h3>Upcoming dose</h3>
          <p>Vitamin D • 8:00 PM</p>
        </article>
        <article className="card">
          <h3>Adherence</h3>
          <p>92% this week</p>
        </article>
      </div>
    </section>
  );
}
