const historyItems = [
  { medication: 'Metformin', time: '7:58 AM', status: 'Taken' },
  { medication: 'Omega 3', time: '12:06 PM', status: 'Taken' },
  { medication: 'Vitamin D', time: '8:10 PM', status: 'Taken' }
];

export function History() {
  return (
    <section>
      <h2>Recent History</h2>
      <ul className="history-list">
        {historyItems.map((item) => (
          <li key={`${item.medication}-${item.time}`} className="card">
            <strong>{item.medication}</strong>
            <span>{item.time}</span>
            <span>{item.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
