import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

function money(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminPage() {
  const supabase = await createClient();

  // =========================================================
  // INGelogde gebruiker
  // =========================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // ADMIN CONTROLEREN
  // =========================================================

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

  // =========================================================
  // ALLE BESTELLINGEN
  // =========================================================

  const { data: allOrders } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      draw_date,
      payment_reference,
      total_amount,
      payment_status,
      winnings,
      payout_status,
      approved_at,
      paid_out_at,
      created_at
    `)
    .order("created_at", {
      ascending: false,
    });

  const orders = allOrders ?? [];

  // =========================================================
  // OPENSTAANDE BETALINGEN
  // =========================================================

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

  // =========================================================
  // SPELERS
  // =========================================================

  const { data: players } = await supabase
    .from("profiles")
    .select("id, account_number, full_name, email, payout_link, created_at, is_admin")
    .eq("is_admin", false)
    .order("created_at", { ascending: false });

  // =========================================================
  // DATUM VANDAAG
  // =========================================================

  const today = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Europe/Amsterdam",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).format(new Date());

  function isToday(date?: string | null) {
    if (!date) {
      return false;
    }

    const formatted =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Europe/Amsterdam",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).format(new Date(date));

    return formatted === today;
  }

  // =========================================================
  // INKOMSTEN
  // =========================================================

  const approvedOrders = orders.filter(
    (order) =>
      order.payment_status === "approved"
  );

  const totalIncome =
    approvedOrders.reduce(
      (total, order) =>
        total +
        Number(order.total_amount || 0),
      0
    );

  const todayIncome =
    approvedOrders
      .filter((order) =>
        isToday(
          order.approved_at ||
            order.created_at
        )
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.total_amount || 0),
        0
      );

  // =========================================================
  // UITBETAALDE WINSTEN
  // =========================================================

  const paidOrders = orders.filter(
    (order) =>
      order.payout_status === "paid" &&
      Number(order.winnings || 0) > 0
  );

  const totalPaidOut =
    paidOrders.reduce(
      (total, order) =>
        total +
        Number(order.winnings || 0),
      0
    );

  const todayPaidOut =
    paidOrders
      .filter((order) =>
        isToday(order.paid_out_at)
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.winnings || 0),
        0
      );

  // =========================================================
  // NOG UIT TE BETALEN
  // =========================================================

  const unpaidWinningOrders =
    orders.filter(
      (order) =>
        order.payout_status ===
          "pending" &&
        Number(order.winnings || 0) > 0
    );

  const totalOutstandingPayout =
    unpaidWinningOrders.reduce(
      (total, order) =>
        total +
        Number(order.winnings || 0),
      0
    );

  const todayOutstandingPayout =
    unpaidWinningOrders
      .filter(
        (order) =>
          order.draw_date === today
      )
      .reduce(
        (total, order) =>
          total +
          Number(order.winnings || 0),
        0
      );

  // =========================================================
  // NETTO RESULTAAT
  // =========================================================

  const totalNetResult =
    totalIncome -
    totalPaidOut -
    totalOutstandingPayout;

  const todayNetResult =
    todayIncome -
    todayPaidOut -
    todayOutstandingPayout;

  // =========================================================
  // DASHBOARD CIJFERS
  // =========================================================

  const pendingCount =
    pendingOrders?.length ?? 0;

  const pendingPaymentAmount =
    pendingOrders?.reduce(
      (total, order) =>
        total +
        Number(order.total_amount || 0),
      0
    ) ?? 0;

  const approvedCount =
    approvedOrders.length;

  const playerCount =
    players?.length ?? 0;

  const winnersToPay =
    unpaidWinningOrders.length;

  // =========================================================
  // PAGINA
  // =========================================================

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
            Beheer spelers, betalingen,
            trekkingen, winnaars en
            uitbetalingen.
          </p>

        </section>


        {/* =================================================
            TREKKING VAN VANDAAG
        ================================================= */}

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>DAGELIJKSE TREKKING</small>
            <h2>Winnende nummers invoeren</h2>
            <p>
              Voer de uitslag van vandaag in. Het systeem berekent daarna
              automatisch de winnaars en gewonnen bedragen.
            </p>
          </div>

          <div
            className="accountInfoCard"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <strong style={{ display: "block", fontSize: "1.15rem" }}>
                Trekking verwerken
              </strong>
              <span>
                1e, 2e en 3e prijs invoeren
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/admin/trekkingen"
                className="primaryButton"
              >
                Winnende nummers invoeren →
              </Link>

              <Link
                href="/uitslagen"
                className="accountButton"
              >
                Trekkinghistorie
              </Link>
            </div>
          </div>
        </section>


        {/* =================================================
            FINANCIEEL OVERZICHT
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              FINANCIEEL OVERZICHT
            </small>

            <h2>
              Inkomsten & uitgaven
            </h2>

            <p>
              Goedgekeurde inzet wordt als
              inkomsten gerekend. Gewonnen
              bedragen blijven openstaan
              totdat ze zijn uitbetaald.
            </p>

          </div>


          <div className="tableWrapper">

            <table className="siteTable">

              <thead>
                <tr>
                  <th>Onderdeel</th>
                  <th>Vandaag</th>
                  <th>Sinds start</th>
                </tr>
              </thead>


              <tbody>

                <tr>
                  <td>
                    <strong>
                      Inkomsten uit inzet
                    </strong>
                  </td>

                  <td>
                    <strong>
                      {money(todayIncome)}
                    </strong>
                  </td>

                  <td>
                    <strong>
                      {money(totalIncome)}
                    </strong>
                  </td>
                </tr>


                <tr>
                  <td>
                    Uitbetaald aan winnaars
                  </td>

                  <td>
                    {money(todayPaidOut)}
                  </td>

                  <td>
                    {money(totalPaidOut)}
                  </td>
                </tr>


                <tr>
                  <td>
                    Nog uit te betalen
                  </td>

                  <td>
                    {money(
                      todayOutstandingPayout
                    )}
                  </td>

                  <td>
                    {money(
                      totalOutstandingPayout
                    )}
                  </td>
                </tr>


                <tr>
                  <td>
                    <strong>
                      Netto resultaat
                    </strong>
                  </td>

                  <td>
                    <strong>
                      {money(todayNetResult)}
                    </strong>
                  </td>

                  <td>
                    <strong>
                      {money(totalNetResult)}
                    </strong>
                  </td>
                </tr>

              </tbody>

            </table>

          </div>


          <div className="infoNotice">

            <strong>
              Netto resultaat
            </strong>{" "}
            = goedgekeurde inzet minus
            uitbetaalde prijzen minus
            prijzen die nog uitbetaald
            moeten worden.

          </div>

        </section>


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>DASHBOARD</small>

            <h2>Overzicht</h2>

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
                NOG TE CONTROLEREN
              </small>

              <strong>
                {money(
                  pendingPaymentAmount
                )}
              </strong>

            </div>


            <div className="adminStatCard">

              <small>
                WINNAARS TE BETALEN
              </small>

              <strong>
                {winnersToPay}
              </strong>

            </div>


            <div className="adminStatCard">

              <small>
                NOG UIT TE BETALEN
              </small>

              <strong>
                {money(
                  totalOutstandingPayout
                )}
              </strong>

            </div>


            <div className="adminStatCard">

              <small>
                GOEDGEKEURDE BESTELLINGEN
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
              Controleer of het juiste
              bedrag met de juiste
              betaalreferentie is
              ontvangen.
            </p>

          </div>


          {!pendingOrders ||
          pendingOrders.length === 0 ? (

            <div className="emptyState">
              Er zijn momenteel geen
              openstaande betalingen.
            </div>

          ) : (

            <div className="adminOrderList">

              {pendingOrders.map(
                (order) => {

                  const profileData =
                    Array.isArray(
                      order.profiles
                    )
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
                            "Geen referentie"}
                        </strong>

                        <span>
                          Account{" "}
                          {profileData
                            ?.account_number ??
                            "—"}
                        </span>

                      </div>


                      <div className="adminOrderAmount">

                        <small>
                          BEDRAG
                        </small>

                        <strong>
                          {money(
                            Number(
                              order.total_amount ||
                                0
                            )
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
                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            SPELERS
        ================================================= */}

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>SPELERS</small>
            <h2>Alle profielen</h2>
            <p>
              Bekijk alle spelersaccounts en open een profiel
              voor de volledige speel- en betaalhistorie.
            </p>
          </div>

          {!players || players.length === 0 ? (
            <div className="emptyState">
              Er zijn nog geen spelersaccounts.
            </div>
          ) : (
            <div className="tableWrapper">
              <table className="siteTable">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Naam</th>
                    <th>E-mail</th>
                    <th>Uitbetaallink</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td><strong>{player.account_number ?? "—"}</strong></td>
                      <td>{player.full_name || "Naam onbekend"}</td>
                      <td>{player.email || "—"}</td>
                      <td>
                        {player.payout_link ? (
                          <span style={{ color: "#15803d", fontWeight: 800 }}>
                            ✓ Ingesteld
                          </span>
                        ) : (
                          <span style={{ color: "#c2410c", fontWeight: 800 }}>
                            Ontbreekt
                          </span>
                        )}
                      </td>
                      <td>
                        <Link
                          href={`/admin/spelers/${player.id}`}
                          className="primaryButton"
                        >
                          Bekijk profiel →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>


        {/* =================================================
            BEHEER
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>BEHEER</small>

            <h2>Administratie</h2>

          </div>


          <div className="adminMenuGrid">

            <div className="adminMenuCard">

              <span>01</span>

              <h3>Betalingen</h3>

              <p>
                Controleer betalingen en
                keur deelnames goed of af.
              </p>

            </div>


            {/* =============================================
                TREKKINGEN - NU KLIKBAAR
            ============================================= */}

            <Link
              href="/admin/trekkingen"
              className="adminMenuCard"
            >

              <span>02</span>

              <h3>Trekkingen</h3>

              <p>
                Voer de eerste, tweede en
                derde prijs in en laat het
                systeem automatisch alle
                winnaars berekenen.
              </p>

            </Link>


            <div className="adminMenuCard">

              <span>03</span>

              <h3>Winnaars</h3>

              <p>
                Bekijk de automatisch
                berekende winnaars en
                gewonnen bedragen.
              </p>

            </div>


            <div className="adminMenuCard">

              <span>04</span>

              <h3>Uitbetalingen</h3>

              <p>
                Bekijk welke winnaars nog
                betaald moeten worden en
                registreer de uitbetaling.
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
