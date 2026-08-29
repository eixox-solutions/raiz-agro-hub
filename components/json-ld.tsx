const SITE_URL = "https://www.raizagrohub.com.br";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Raiz Agro Hub",
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description:
      "Plataforma de matchmaking entre produtores rurais, AgTechs e empresas do agronegócio.",
    email: "comercial@kerossolucoes.com.br",
    areaServed: "BR",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
