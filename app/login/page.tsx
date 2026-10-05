"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loginWithGoogle() {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: "google",

        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main>
      <div className="siteContainer standardPage">

        <section className="pageHero">
          <span className="heroTag">
            MIJN ACCOUNT
          </span>

          <h1>
            Inloggen bij <span>WNKNL</span>
          </h1>

          <p>
            Log in met je Google-account om
            nummers te kunnen spelen en je
            deelnames te bekijken.
          </p>
        </section>


        <section className="standardSection">

          <div className="sectionHeading noCardHeading">
            <small>INLOGGEN</small>

            <h2>Welkom bij WNKNL</h2>

            <p>
              Bij je eerste login wordt automatisch
              jouw persoonlijke WNKNL-account
              aangemaakt.
            </p>
          </div>


          <div className="loginBox">

            <button
              type="button"
              className="googleLoginButton"
              onClick={loginWithGoogle}
              disabled={loading}
            >
              {loading
                ? "Bezig met inloggen..."
                : "Doorgaan met Google"}
            </button>


            {error && (
              <div className="loginError">
                {error}
              </div>
            )}


            <p className="loginInfo">
              Je krijgt automatisch een uniek
              WNKNL-accountnummer.
            </p>

          </div>

        </section>

      </div>
    </main>
  );
}
