import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "WNKNL | Wegi Number Kòrsou",
  description: "Wegi Number Kòrsou Nederland",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>
        <header className="siteHeader">
          <div className="siteContainer headerInner">
            <Link href="/" className="brand">
              <span className="brandStar">★</span>

              <div>
                <strong>WEGI NUMBER KÒRSOU</strong>
                <small>WNKNL</small>
              </div>
            </Link>

            <nav className="mainNav">
              <Link href="/#spelen">Spelen</Link>
              <Link href="/#uitslagen">Uitslagen</Link>
              <Link href="/hoe-werkt-het">
                Hoe werkt het?
              </Link>

              <button className="accountButton">
                Mijn account
              </button>

              <select
                className="languageSelect"
                defaultValue="NL"
                aria-label="Taal"
              >
                <option>NL</option>
                <option>PAP</option>
                <option>EN</option>
              </select>
            </nav>
          </div>
        </header>

        {children}

        <footer className="siteFooter">
          <div className="siteContainer footerInner">
            <strong>
              <span>★</span> WEGI NUMBER KÒRSOU
            </strong>

            <span>WNKNL · 2026</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
