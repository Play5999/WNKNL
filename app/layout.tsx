import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { createClient } from "../lib/supabase/server";

export const metadata: Metadata = {
  title: "WNKNL | Wegi Number Kòrsou",
  description: "Wegi Number Kòrsou Nederland",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    isAdmin = profile?.is_admin === true;
  }

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
              <Link href="/uitslagen">Uitslagen</Link>
              <Link href="/hoe-werkt-het">Hoe werkt het?</Link>

              <Link href="/account" className="accountButton">
                Mijn account
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="accountButton"
                  style={{
                    background: "#ffd500",
                    color: "#062b62",
                    borderColor: "#ffd500",
                  }}
                >
                  Admin
                </Link>
              )}

              <select
                className="languageSelect"
                defaultValue="NL"
                aria-label="Taal"
              >
                <option value="NL">NL</option>
                <option value="PAP">PAP</option>
                <option value="EN">EN</option>
              </select>
            </nav>
          </div>
        </header>

        {children}

        <footer className="siteFooter">
          <div className="siteContainer footerInner">
            <strong>
              <span>★</span>{" "}
              WEGI NUMBER KÒRSOU
            </strong>
            <span>WNKNL · 2026</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
