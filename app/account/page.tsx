import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function AccountPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } =
    await supabase
      .from("profiles")
      .select(
        "account_number, full_name, email, is_admin"
      )
      .eq("id", user.id)
      .single();

  if (!profile) {
    return (
      <main>
        <div className="siteContainer standardPage">

          <section className="standardSection">

            <div className="sectionHeading noCardHeading">
              <small>ACCOUNT</small>

              <h2>
                Account wordt aangemaakt
              </h2>

              <p>
                Je bent ingelogd, maar je
                WNKNL-profiel kon nog niet worden
                gevonden.
              </p>
            </div>

          </section>

        </div>
      </main>
    );
  }

  const accountNumber =
    String(
      profile.account_number
    ).padStart(5, "0");

  return (
    <main>
      <div className="siteContainer standardPage">

        <section className="pageHero">

          <span className="heroTag">
            MIJN ACCOUNT
          </span>

          <h1>
            Welkom{" "}
            <span>
              {profile.full_name || ""}
            </span>
          </h1>

          <p>
            Hier beheer je jouw WNKNL-account,
            deelnames, betalingen en gewonnen
            bedragen.
          </p>

        </section>


        <section className="standardSection">

          <div className="sectionHeading noCardHeading">
            <small>ACCOUNT</small>

            <h2>Jouw gegevens</h2>
          </div>


          <div className="accountGrid">

            <div className="accountInfoCard">
              <small>
                ACCOUNTNUMMER
              </small>

              <strong>
                {accountNumber}
              </strong>
            </div>


            <div className="accountInfoCard">
              <small>
                E-MAIL
              </small>

              <strong>
                {profile.email}
              </strong>
            </div>


            <div className="accountInfoCard">
              <small>
                ACCOUNTTYPE
              </small>

              <strong>
                {profile.is_admin
                  ? "Administrator"
                  : "Speler"}
              </strong>
            </div>

          </div>

        </section>


        <section className="standardSection">

          <div className="sectionHeading noCardHeading">
            <small>SPELEN</small>

            <h2>Nieuwe deelname</h2>

            <p>
              Kies nieuwe nummers en maak daarna
              één bestelling met een unieke
              betaalreferentie.
            </p>
          </div>


          <a
            href="/#spelen"
            className="yellowButton"
          >
            Nummers kiezen →
          </a>

        </section>


        <section className="standardSection">

          <div className="sectionHeading noCardHeading">
            <small>MIJN LOTEN</small>

            <h2>Jouw deelnames</h2>

            <p>
              Hier komen straks al jouw
              bestellingen, betaalstatussen en
              eventuele gewonnen bedragen.
            </p>
          </div>


          <div className="emptyState">
            Je hebt nog geen loten gekocht.
          </div>

        </section>


        {profile.is_admin && (
          <section className="standardSection">

            <div className="sectionHeading noCardHeading">
              <small>ADMINISTRATIE</small>

              <h2>Admin dashboard</h2>

              <p>
                Je bent ingelogd als
                administrator.
              </p>
            </div>


            <a
              href="/admin"
              className="primaryButton"
            >
              Open admin dashboard →
            </a>

          </section>
        )}

      </div>
    </main>
  );
}
