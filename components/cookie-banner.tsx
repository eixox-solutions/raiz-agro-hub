"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

const CONSENT_KEY = "raiz-cookie-consent";
const CLARITY_ID = "y6k3rd89ay";

export function CookieBanner() {
  const [consent, setConsent] = useState<"accepted" | "rejected" | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setConsent(stored);
    } else {
      setVisible(true);
    }
  }, []);

  function decide(value: "accepted" | "rejected") {
    window.localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    setVisible(false);
  }

  return (
    <>
      {consent === "accepted" && (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      )}

      {visible && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-primary text-white px-4 py-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-white/90">
              Usamos cookies para melhorar sua experiência e entender como o
              site é usado. Veja nossa{" "}
              <Link
                href="/politica-de-privacidade"
                className="underline hover:text-accent-light"
              >
                Política de Privacidade
              </Link>
              .
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => decide("rejected")}
                className="text-sm font-medium px-4 py-2 rounded-full border border-white/40 hover:bg-white/10"
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                className="text-sm font-heading font-semibold px-4 py-2 rounded-full bg-accent text-primary hover:bg-accent-light"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
