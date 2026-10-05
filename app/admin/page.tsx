import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();

  // ---------------------------------------------------------
  // INGelogde gebruiker ophalen
  // ---------------------------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // ---------------------------------------------------------
  // Controleren of gebruiker admin is
  // ---------------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "account_number, full_name, email, is_admin"
    )
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_admin) {
    redirect("/account");
  }

  // ---------------------------------------------------------
  // Openstaande betalingen
  // ---------------------------------------------------------

  const { data: pendingOrders } =
    await supabase
      .from("orders")
      .select(`
        id,
        payment_reference,
        total_amount,
        payment_status,
        draw_date,
        created_at,
        user_id,
        profiles (
          account_number,
          full_name,
          email
        )
      `)
      .eq("payment_status", "pending")
      .order("created_at", {
        ascending: false,
      });

  // ---------------------------------------------------------
  // Goedgekeurde bestellingen
  // ---------------------------------------------------------

  const { data: approvedOrders } =
    await supabase
      .from("orders")
      .select("id")
      .eq("payment_status", "approved");

  // ---------------------------------------------------------
  // Alle spelers
  // ---------------------------------------------------------

  const { data: players } =
    await supabase
      .from("profiles")
      .select("id")
      .eq("is_admin", false);

  const pendingCount =
    pendingOrders?.length ?? 0;

  const approvedCount =
    approvedOrders?.length ?? 0;

  const playerCount =
    players?.length ?? 0;

  const pendingAmount =
    pendingOrders?.reduce(
      (total, order) =>
        total +
        Number(order.total_amount || 0),
      0
    ) ?? 0;

  return (
    <main>
      <div className="siteContainer standardPage">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="pageHero">

          <span className="heroTag">
            ADMINISTRATIE
          </span>

          <h1>
            WNKNL <span>Admin</span>
          </h1>

          <p>
            Beheer spelers, bestellingen,
            betalingen, trekkingen en
            uitbetalingen.
          </p>

        </section>


        {/* =================================================
            OVERZICHT
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>DASHBOARD</small>

            <h2>Overzicht</h2>

            <p>
              Actuele gegevens uit de
              WNKNL-database.
            </p>

          </div>


          <div className="adminStatsGrid">

            <div className="adminStatCard">

              <small>
                OPENSTAANDE BETALINGEN
              </small>

              <strong>
                {pendingCount}
              </strong>

            </div>


            <div className="adminStatCard">

              <small>
                OPENSTAAND BEDRAG
              </small>

              <strong>
                €
                {pendingAmount.toLocaleString(
                  "nl-NL",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>

            </div>


            <div className="adminStatCard">

              <small>
                GOEDGEKEURD
              </small>

              <strong>
                {approvedCount}
              </strong>

            </div>


            <div className="adminStatCard">

              <small>
                SPELERS
              </small>

              <strong>
                {playerCount}
              </strong>

            </div>

          </div>

        </section>


        {/* =================================================
            OPENSTAANDE BETALINGEN
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>BETALINGEN</small>

            <h2>
              Openstaande betalingen
            </h2>

            <p>
              Bestellingen die nog door een
              administrator gecontroleerd moeten
              worden.
            </p>

          </div>


          {!pendingOrders ||
          pendingOrders.length === 0 ? (

            <div className="emptyState">
              Er zijn momenteel geen openstaande
              betalingen.
            </div>

          ) : (

            <div className="adminOrderList">

              {pendingOrders.map((order) => {

                const profileData =
                  Array.isArray(order.profiles)
                    ? order.profiles[0]
                    : order.profiles;

                return (
                  <div
                    className="adminOrderCard"
                    key={order.id}
                  >

                    <div className="adminOrderMain">

                      <small>
                        BETAALREFERENTIE
                      </small>

                      <strong>
                        {order.payment_reference ||
                          "Nog geen referentie"}
                      </strong>

                      <span>
                        Account{" "}
                        {profileData?.account_number ??
                          "—"}
                      </span>

                    </div>


                    <div className="adminOrderAmount">

                      <small>BEDRAG</small>

                      <strong>
                        €
                        {Number(
                          order.total_amount || 0
                        ).toLocaleString(
                          "nl-NL",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </strong>

                    </div>


                    <div className="adminOrderActions">

                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="primaryButton"
                      >
                        Bekijk bestelling →
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>


        {/* =================================================
            ADMIN ONDERDELEN
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>BEHEER</small>

            <h2>
              Administratie
            </h2>

          </div>


          <div className="adminMenuGrid">

            <div className="adminMenuCard">

              <span>01</span>

              <h3>Betalingen</h3>

              <p>
                Controleer binnengekomen
                betalingen en keur deelnames
                goed of af.
              </p>

            </div>


            <div className="adminMenuCard">

              <span>02</span>

              <h3>Trekkingen</h3>

              <p>
                Voer de eerste, tweede en derde
                prijs van de trekking in.
              </p>

            </div>


            <div className="adminMenuCard">

              <span>03</span>

              <h3>Winnaars</h3>

              <p>
                Bekijk automatisch berekende
                winnaars en gewonnen bedragen.
              </p>

            </div>


            <div className="adminMenuCard">

              <span>04</span>

              <h3>Uitbetalingen</h3>

              <p>
                Bekijk openstaande
                uitbetalingen en registreer
                wanneer deze betaald zijn.
              </p>

            </div>

          </div>

        </section>


        <div className="adminBack">

          <Link
            href="/account"
            className="accountButton adminBackButton"
          >
            ← Terug naar mijn account
          </Link>

        </div>

      </div>
    </main>
  );
}
