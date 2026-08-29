import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Raiz Agro Hub",
  description:
    "Termos e condições de uso da plataforma Raiz Agro Hub para produtores rurais e empresas.",
};

export default function TermosDeUsoPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-text-muted mb-6 inline-block">
        ← Voltar para o site
      </Link>
      <h1 className="font-heading text-3xl text-primary mb-6">
        Termos de Uso
      </h1>

      <div className="prose prose-sm max-w-none text-text-muted space-y-6">
        <p>
          Ao se cadastrar e utilizar o <strong>Raiz Agro Hub</strong>, você
          concorda com os termos descritos abaixo.
        </p>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            1. O que é o Raiz Agro Hub
          </h2>
          <p>
            O Raiz Agro Hub é uma plataforma gratuita de matchmaking que
            conecta produtores rurais a empresas e AgTechs do
            agronegócio, com base nos desafios relatados e nas soluções
            oferecidas por cada parte.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            2. Cadastro
          </h2>
          <p>
            Ao se cadastrar, você declara que as informações fornecidas
            são verdadeiras e que possui autorização para fornecê-las. O
            Raiz Agro Hub não se responsabiliza por informações
            incorretas ou desatualizadas inseridas pelo próprio usuário.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            3. Responsabilidade sobre os matches
          </h2>
          <p>
            O Raiz Agro Hub atua como intermediador de conexões,
            apresentando combinações relevantes entre produtores e
            empresas. A plataforma não garante a celebração de negócios
            entre as partes e não participa das negociações, contratos
            ou entregas realizadas entre produtor e empresa.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            4. Uso adequado
          </h2>
          <p>
            É proibido usar a plataforma para fins diferentes do
            matchmaking entre produtores e empresas do agronegócio,
            incluindo o envio de spam, conteúdo enganoso ou tentativas de
            burlar o funcionamento do sistema.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            5. Alterações nestes termos
          </h2>
          <p>
            Estes termos podem ser atualizados a qualquer momento. O uso
            contínuo da plataforma após uma atualização implica
            concordância com os novos termos.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            6. Contato
          </h2>
          <p>
            Dúvidas sobre estes termos podem ser enviadas para{" "}
            <a
              href="mailto:comercial@kerossolucoes.com.br"
              className="text-accent hover:underline"
            >
              comercial@kerossolucoes.com.br
            </a>
            .
          </p>
        </section>

        <p className="text-xs pt-6">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}.
        </p>
      </div>
    </main>
  );
}
