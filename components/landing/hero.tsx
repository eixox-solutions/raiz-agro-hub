import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, Leaf, Lightbulb, Handshake, Droplet, TrendingUp, CloudSun } from "lucide-react";

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-16 lg:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-baseline gap-1.5 mb-6">
            <span className="font-heading text-4xl font-extrabold text-primary tracking-tight">Raiz</span>
            <span className="w-3 h-3 rounded-full bg-accent -translate-y-2" />
          </div>
          <p className="text-sm font-heading font-bold text-primary tracking-[0.2em] -mt-4 mb-6">
            — AGRO HUB —
          </p>

          <h1 className="font-heading text-4xl sm:text-5xl text-primary mb-5 leading-tight">
            O jeito fácil de achar{" "}
            <span className="text-accent-dark">quem resolve o seu problema</span> no campo
          </h1>

          <p className="text-lg text-text-muted max-w-xl mb-8 leading-relaxed">
            Você conta o problema da sua fazenda. A gente te mostra, de graça, quem já tem a solução:
            empresas de tecnologia do agro, prontas para te ajudar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              href="/#combinacao"
              className="flex items-center justify-center gap-2 bg-accent text-primary font-heading font-semibold px-6 py-3.5 rounded-full"
            >
              <Sparkles size={18} />
              Ver Como Funciona
            </Link>
            <Link
              href="/cadastro/produtor"
              className="flex items-center justify-center gap-2 border border-border-light text-primary font-heading font-semibold px-6 py-3.5 rounded-full"
            >
              Contar meu Problema Agora
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white border border-border-light rounded-full px-4 py-2 text-sm font-semibold text-primary">
              <Leaf size={16} className="text-accent" />
              Conexão que gera valor
            </div>
            <div className="flex items-center gap-2 bg-white border border-border-light rounded-full px-4 py-2 text-sm font-semibold text-primary">
              <Lightbulb size={16} className="text-accent" />
              Inovação que transforma
            </div>
            <div className="flex items-center gap-2 bg-white border border-border-light rounded-full px-4 py-2 text-sm font-semibold text-primary">
              <Handshake size={16} className="text-accent" />
              Parcerias que fortalecem o agro
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl">
            <Image
              src="/images/hero.jpg"
              alt="Produtor rural utilizando Raiz Agro Hub no campo"
              width={800}
              height={480}
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="w-full h-[320px] sm:h-[400px] lg:h-[480px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-primary/30" />
          </div>

          <div className="hidden sm:flex absolute top-5 left-5 items-center gap-3 bg-white/95 backdrop-blur rounded-lg shadow-lg px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
              <Droplet size={18} />
            </div>
            <div className="leading-tight">
              <span className="block font-heading font-extrabold text-primary">32%</span>
              <span className="block text-[11px] font-semibold text-text-muted">Matéria orgânica / Umidade</span>
            </div>
          </div>

          <div className="hidden sm:flex absolute top-5 right-5 items-center gap-3 bg-white/95 backdrop-blur rounded-lg shadow-lg px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent-dark flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div className="leading-tight">
              <span className="block font-heading font-extrabold text-primary">0,72</span>
              <span className="block text-[11px] font-semibold text-text-muted">NDVI Normal</span>
            </div>
          </div>

          <div className="hidden sm:flex absolute bottom-5 left-5 items-center gap-3 bg-white/95 backdrop-blur rounded-lg shadow-lg px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-earth-gold/10 text-earth-gold flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div className="leading-tight">
              <span className="block font-heading font-extrabold text-primary">+18%</span>
              <span className="block text-[11px] font-semibold text-text-muted">
                Produtividade vs. safra anterior
              </span>
            </div>
          </div>

          <div className="hidden sm:flex absolute bottom-5 right-5 items-center gap-3 bg-white/95 backdrop-blur rounded-lg shadow-lg px-4 py-3">
            <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent flex items-center justify-center">
              <CloudSun size={18} />
            </div>
            <div className="leading-tight">
              <span className="block font-heading font-extrabold text-primary">24°C</span>
              <span className="block text-[11px] font-semibold text-text-muted">Clima e Telemetria</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
