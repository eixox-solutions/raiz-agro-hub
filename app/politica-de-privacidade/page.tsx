import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Raiz Agro Hub",
  description:
    "Como o Raiz Agro Hub coleta, usa e protege os dados pessoais de produtores rurais e empresas cadastrados na plataforma.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-sm text-text-muted mb-6 inline-block">
        ← Voltar para o site
      </Link>
      <h1 className="font-heading text-3xl text-primary mb-6">
        Política de Privacidade
      </h1>

      <div className="prose prose-sm max-w-none text-text-muted space-y-6">
        <p>
          Esta Política de Privacidade descreve como o <strong>Raiz Agro
          Hub</strong> coleta, usa e protege os dados pessoais de quem se
          cadastra na plataforma, em conformidade com a Lei Geral de
          Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD).
        </p>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            1. Quais dados coletamos
          </h2>
          <p>
            Ao se cadastrar como produtor rural ou empresa, coletamos os
            dados fornecidos voluntariamente no formulário: nome,
            telefone, e-mail, município/UF, e informações sobre o
            problema relatado ou a solução oferecida. Também coletamos
            dados de navegação por meio de cookies, conforme descrito no
            item 4.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            2. Para que usamos seus dados
          </h2>
          <p>
            Usamos os dados exclusivamente para viabilizar o matchmaking
            entre produtores rurais e empresas/AgTechs cadastradas na
            plataforma, permitir o contato entre as partes interessadas
            e melhorar a experiência de uso do site.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            3. Com quem compartilhamos
          </h2>
          <p>
            Os dados de contato de um cadastro só são exibidos à outra
            parte quando há um match relevante entre produtor e empresa.
            Não vendemos nem compartilhamos seus dados com terceiros para
            fins de marketing.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            4. Cookies e ferramentas de análise
          </h2>
          <p>
            Utilizamos cookies para entender como o site é utilizado e
            melhorar a experiência de navegação. Esses cookies só são
            carregados após seu consentimento, dado através do banner
            exibido na primeira visita. Você pode recusar o uso de
            cookies não essenciais a qualquer momento.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            5. Seus direitos
          </h2>
          <p>
            Você pode solicitar a qualquer momento a confirmação,
            correção, anonimização ou exclusão dos seus dados pessoais,
            entrando em contato pelo e-mail{" "}
            <a
              href="mailto:comercial@kerossolucoes.com.br"
              className="text-accent hover:underline"
            >
              comercial@kerossolucoes.com.br
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-lg text-primary mt-8 mb-2">
            6. Contato
          </h2>
          <p>
            Dúvidas sobre esta política podem ser enviadas para{" "}
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
