import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { OrganizationJsonLd } from "@/components/json-ld";

const SITE_URL = "https://www.raizagrohub.com.br";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-outfit",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Raiz Agro Hub | Conectando agronegócio, inovação e oportunidades",
  description:
    "Conte seu problema no campo e a gente te mostra, de graça, quem já tem a solução.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "Raiz Agro Hub",
    title: "Raiz Agro Hub | Conectando agronegócio, inovação e oportunidades",
    description:
      "Conte seu problema no campo e a gente te mostra, de graça, quem já tem a solução.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Raiz Agro Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raiz Agro Hub | Conectando agronegócio, inovação e oportunidades",
    description:
      "Conte seu problema no campo e a gente te mostra, de graça, quem já tem a solução.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${jakarta.variable}`}>
      <body className="font-body">
        <OrganizationJsonLd />
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
