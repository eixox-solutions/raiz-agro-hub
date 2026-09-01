import Link from "next/link";

export function Paginacao({
  paginaAtual,
  totalPaginas,
  parametro,
}: {
  paginaAtual: number;
  totalPaginas: number;
  parametro: string;
}) {
  if (totalPaginas <= 1) return null;

  function hrefPara(pagina: number) {
    const params = new URLSearchParams();
    params.set(parametro, String(pagina));
    return `?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between mt-3 text-sm">
      <span className="text-text-muted">
        Página {paginaAtual} de {totalPaginas}
      </span>
      <div className="flex gap-2">
        <Link
          href={hrefPara(Math.max(1, paginaAtual - 1))}
          aria-disabled={paginaAtual <= 1}
          className={`px-3 py-1.5 rounded-md border border-border-light ${
            paginaAtual <= 1 ? "pointer-events-none opacity-40" : "hover:border-accent"
          }`}
        >
          Anterior
        </Link>
        <Link
          href={hrefPara(Math.min(totalPaginas, paginaAtual + 1))}
          aria-disabled={paginaAtual >= totalPaginas}
          className={`px-3 py-1.5 rounded-md border border-border-light ${
            paginaAtual >= totalPaginas ? "pointer-events-none opacity-40" : "hover:border-accent"
          }`}
        >
          Próxima
        </Link>
      </div>
    </div>
  );
}
