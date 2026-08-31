import { Hero } from "@/components/landing/hero";
import { PillarsStrip } from "@/components/landing/pillars-strip";
import { ProblemaOportunidade } from "@/components/landing/problema-oportunidade";
import { ComoFunciona } from "@/components/landing/como-funciona";
import { SimuladorCombinacao } from "@/components/landing/simulador-combinacao";
import { MercadoOportunidade } from "@/components/landing/mercado-oportunidade";
import { ModeloNegocio } from "@/components/landing/modelo-negocio";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PillarsStrip />
      <ProblemaOportunidade />
      <ComoFunciona />
      <SimuladorCombinacao />
      <MercadoOportunidade />
      <ModeloNegocio />
    </main>
  );
}
