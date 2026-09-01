"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/#proposito", label: "O Problema" },
  { href: "/#como-funciona", label: "Como Funciona" },
  { href: "/#combinacao", label: "Como Encontramos a Solução" },
  { href: "/#mercado", label: "Mercado" },
  { href: "/#modelo", label: "Diferenciais" },
];

const MENU_MOBILE_ID = "menu-mobile";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const primeiroLinkMobileRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuAberto) {
      primeiroLinkMobileRef.current?.focus();
    }

    function handleKeyDown(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setMenuAberto(false);
        menuToggleRef.current?.focus();
      }
    }

    if (menuAberto) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [menuAberto]);

  function fecharMenu() {
    setMenuAberto(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border-light transition-shadow ${
        scrolled ? "shadow-sm py-2.5" : "py-3.5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5">
          <span className="font-heading text-xl font-extrabold text-primary tracking-tight">Raiz</span>
          <span className="w-2 h-2 rounded-full bg-accent -translate-y-1.5" />
          <span className="text-xs font-heading font-bold text-primary tracking-[0.15em] ml-1 hidden sm:inline">
            — AGRO HUB —
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-semibold text-text-muted hover:text-accent-dark transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cadastro/empresa"
            className="hidden sm:inline-block text-sm font-heading font-semibold text-primary border border-border-light px-4 py-2 rounded-full"
          >
            Sou Empresa
          </Link>
          <Link
            href="/cadastro/produtor"
            className="hidden sm:inline-block text-sm font-heading font-semibold text-primary bg-accent px-4 py-2 rounded-full"
          >
            Quero fazer parte
          </Link>
          <button
            ref={menuToggleRef}
            type="button"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            aria-controls={MENU_MOBILE_ID}
            onClick={() => setMenuAberto((v) => !v)}
            className="lg:hidden text-primary"
          >
            {menuAberto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {menuAberto && (
        <nav
          id={MENU_MOBILE_ID}
          className="lg:hidden max-w-6xl mx-auto px-4 pt-4 pb-2 flex flex-col gap-4 border-t border-border-light mt-3"
        >
          {LINKS.map(({ href, label }, i) => (
            <Link
              key={href}
              href={href}
              ref={i === 0 ? primeiroLinkMobileRef : undefined}
              onClick={fecharMenu}
              className="text-sm font-semibold text-text-muted"
            >
              {label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/cadastro/empresa"
              onClick={fecharMenu}
              className="text-sm text-center font-heading font-semibold text-primary border border-border-light px-4 py-2.5 rounded-full"
            >
              Sou Empresa
            </Link>
            <Link
              href="/cadastro/produtor"
              onClick={fecharMenu}
              className="text-sm text-center font-heading font-semibold text-primary bg-accent px-4 py-2.5 rounded-full"
            >
              Quero fazer parte
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
