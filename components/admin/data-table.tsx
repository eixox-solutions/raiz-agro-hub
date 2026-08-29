export function DataTable({
  colunas,
  linhas,
  mensagemVazia,
}: {
  colunas: string[];
  linhas: Array<Array<string | number>>;
  mensagemVazia: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-border-light">
            {colunas.map((coluna) => (
              <th key={coluna} className="py-2 pr-4 font-medium text-text-muted">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} className="py-4 text-text-light">
                {mensagemVazia}
              </td>
            </tr>
          ) : (
            linhas.map((linha, i) => (
              <tr key={i} className="border-b border-border-light">
                {linha.map((valor, j) => (
                  <td key={j} className="py-2 pr-4">
                    {valor}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
