type SettingsProps = {
  onResetAllData: () => void;
};

export function Settings({ onResetAllData }: SettingsProps) {
  return (
    <section className="stack-lg">
      <h2 className="section-title">Configurações</h2>
      <article className="card">
        <h3>Modo offline</h3>
        <p>O aplicativo mantém os dados salvos no aparelho para funcionar sem internet.</p>
      </article>

      <article className="card stack-sm">
        <h3>Dados</h3>
        <p>Apague todos os medicamentos e registros salvos neste dispositivo.</p>
        <button type="button" className="danger-button" onClick={onResetAllData}>
          Limpar todos os dados
        </button>
      </article>
    </section>
  );
}
