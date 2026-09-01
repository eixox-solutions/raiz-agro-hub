"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export type CampoDetalhe = { rotulo: string; valor: string };

export function DetalhesModal({
  titulo,
  campos,
  aberto,
  onClose,
}: {
  titulo: string;
  campos: CampoDetalhe[];
  aberto: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="rounded-lg border border-border-light p-0 backdrop:bg-primary/40 max-w-lg w-full"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg text-primary">{titulo}</h3>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="text-text-muted hover:text-primary"
          >
            <X size={20} />
          </button>
        </div>
        <dl className="space-y-3">
          {campos.map((campo) => (
            <div key={campo.rotulo}>
              <dt className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                {campo.rotulo}
              </dt>
              <dd className="text-sm text-primary mt-0.5">{campo.valor || "—"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  );
}
