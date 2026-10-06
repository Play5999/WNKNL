import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "../../lib/supabase/server";

function money(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    draw_saved?: string;
    draw_deleted?: string;
    draw_error?: string;
  }>;
}) {
  const params = await searchParams;
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
  // TREKKING VANDAAG - CURAÇAO DATUM
  // =========================================================

  const drawToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Curacao",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const { data: currentDraw } = await supabase
    .from("draws")
    .select("id, draw_date, first_prize, second_prize, third_prize, status")
    .eq("draw_date", drawToday)
    .maybeSingle();

  async function saveDraw(formData: FormData) {
    "use server";

    const serverSupabase = await createClient();

    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      redirect("/login");
    }

    const { data: actionProfile } = await serverSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", actionUser.id)
      .single();

    if (!actionProfile?.is_admin) {
      redirect("/account");
    }

    const drawDate = String(formData.get("draw_date") || "");
    const firstPrize = String(formData.get("first_prize") || "").trim();
    const secondPrize = String(formData.get("second_prize") || "").trim();
    const thirdPrize = String(formData.get("third_prize") || "").trim();

    const validNumber = /^\d{4}$/;

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(drawDate) ||
      !validNumber.test(firstPrize) ||
      !validNumber.test(secondPrize) ||
      !validNumber.test(thirdPrize)
    ) {
      redirect("/admin?draw_error=Vul+voor+alle+drie+de+prijzen+precies+4+cijfers+in.");
    }

    const { error } = await serverSupabase.rpc("process_draw", {
      p_draw_date: drawDate,
      p_first_prize: firstPrize,
      p_second_prize: secondPrize,
      p_third_prize: thirdPrize,
    });

    if (error) {
      redirect(`/admin?draw_error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/");
    revalidatePath("/uitslagen");
    revalidatePath("/admin");
    revalidatePath("/admin/trekkingen");
    revalidatePath("/admin/winnaars");
    revalidatePath("/account");

    redirect("/admin?draw_saved=1");
  }

  async function deleteDraw(formData: FormData) {
    "use server";

    const serverSupabase = await createClient();

    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) {
      redirect("/login");
    }

    const { data: actionProfile } = await serverSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", actionUser.id)
      .single();

    if (!actionProfile?.is_admin) {
      redirect("/account");
    }

    const drawDate = String(formData.get("draw_date") || "");

    const { error } = await serverSupabase.rpc("delete_draw", {
      p_draw_date: drawDate,
    });

    if (error) {
      redirect(`/admin?draw_error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath("/");
    revalidatePath("/uitslagen");
    revalidatePath("/admin");
    revalidatePath("/admin/trekkingen");
    revalidatePath("/admin/winnaars");
    revalidatePath("/account");

    redirect("/admin?draw_deleted=1");
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
  // SPELERSTOTALEN
  // =========================================================

  function playerTotals(userId: string) {
    const playerOrders = orders.filter(
      (order) =>
        order.user_id === userId &&
        order.payment_status === "approved"
    );

    return {
      totalSpent: playerOrders.reduce(
        (total, order) =>
          total + Number(order.total_amount || 0),
        0
      ),
      totalWon: playerOrders.reduce(
        (total, order) =>
          total + Number(order.winnings || 0),
        0
      ),
    };
  }

  const recentPlayers = (players ?? []).slice(0, 5);

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
          <div
            className="sectionHeading noCardHeading"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <small>DAGELIJKSE TREKKING</small>
              <h2 style={{ marginBottom: "6px" }}>
                Winnende nummers invoeren
              </h2>
              <p style={{ marginBottom: 0 }}>
                Speeldag {drawToday} · Curaçao-datum
              </p>
            </div>

            <Link
              href="/admin/trekkingen"
              className="accountButton"
            >
              Trekkinghistorie →
            </Link>
          </div>

          {params.draw_saved === "1" && (
            <div
              style={{
                padding: "13px 15px",
                marginBottom: "14px",
                borderRadius: "8px",
                background: "#dcfce7",
                color: "#15803d",
                fontWeight: 800,
              }}
            >
              ✓ Trekking opgeslagen en winnaars opnieuw berekend.
            </div>
          )}

          {params.draw_deleted === "1" && (
            <div
              style={{
                padding: "13px 15px",
                marginBottom: "14px",
                borderRadius: "8px",
                background: "#fff8d9",
                color: "#7c5b00",
                fontWeight: 800,
              }}
            >
              Trekking verwijderd. De bijbehorende winstberekening is teruggedraaid.
            </div>
          )}

          {params.draw_error && (
            <div className="loginError" style={{ marginBottom: "14px" }}>
              {params.draw_error}
            </div>
          )}

          <form action={saveDraw}>
            <input
              type="hidden"
              name="draw_date"
              value={drawToday}
            />

            <div
              className="accountInfoCard"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "14px",
                alignItems: "end",
              }}
            >
              {[
                ["first_prize", "1e prijs", currentDraw?.first_prize || ""],
                ["second_prize", "2e prijs", currentDraw?.second_prize || ""],
                ["third_prize", "3e prijs", currentDraw?.third_prize || ""],
              ].map(([name, label, value]) => (
                <label
                  key={name}
                  style={{
                    display: "grid",
                    gap: "7px",
                    fontWeight: 800,
                  }}
                >
                  <span>{label}</span>
                  <input
                    name={name}
                    defaultValue={value}
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                    maxLength={4}
                    minLength={4}
                    placeholder="0000"
                    required
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "13px 14px",
                      border: "1px solid #d8dee9",
                      borderRadius: "8px",
                      fontSize: "22px",
                      fontWeight: 900,
                      letterSpacing: "5px",
                    }}
                  />
                </label>
              ))}

              <button
                type="submit"
                className="primaryButton"
                style={{
                  minHeight: "50px",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                {currentDraw
                  ? "Wijzig & opnieuw verwerken"
                  : "Uitslag opslaan"}
              </button>
            </div>
          </form>

          {currentDraw && (
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  color: "#15803d",
                  fontWeight: 800,
                }}
              >
                ✓ Uitslag gepubliceerd:{" "}
                {currentDraw.first_prize} ·{" "}
                {currentDraw.second_prize} ·{" "}
                {currentDraw.third_prize}
              </span>

              <form action={deleteDraw}>
                <input
                  type="hidden"
                  name="draw_date"
                  value={drawToday}
                />
                <button
                  type="submit"
                  style={{
                    border: "1px solid #dc2626",
                    background: "#fff",
                    color: "#b91c1c",
                    borderRadius: "8px",
                    padding: "10px 13px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Trekking verwijderen
                </button>
              </form>
            </div>
          )}
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
          <div
            className="sectionHeading noCardHeading"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <small>SPELERS</small>
              <h2>Laatste profielen</h2>
              <p>
                De 5 meest recente spelers. Klik op een naam voor het volledige profiel.
              </p>
            </div>

            <Link
              href="/admin/spelers"
              className="accountButton"
            >
              Alle profielen bekijken →
            </Link>
          </div>

          {recentPlayers.length === 0 ? (
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
                    <th>Totale inzet</th>
                    <th>Totale winst</th>
                  </tr>
                </thead>

                <tbody>
                  {recentPlayers.map((player) => {
                    const totals = playerTotals(player.id);

                    return (
                      <tr key={player.id}>
                        <td>
                          <strong>{player.account_number ?? "—"}</strong>
                        </td>

                        <td>
                          <Link
                            href={`/admin/spelers/${player.id}`}
                            style={{
                              fontWeight: 900,
                              textDecoration: "underline",
                              textUnderlineOffset: "3px",
                            }}
                          >
                            {player.full_name || "Naam onbekend"} →
                          </Link>
                        </td>

                        <td>{player.email || "—"}</td>

                        <td>
                          {player.payout_link ? (
                            <span style={{ color: "#15803d", fontWeight: 900 }}>
                              ✓ Ja
                            </span>
                          ) : (
                            <span style={{ color: "#b91c1c", fontWeight: 900 }}>
                              ✕ Nee
                            </span>
                          )}
                        </td>

                        <td>
                          <strong>{money(totals.totalSpent)}</strong>
                        </td>

                        <td>
                          <strong>{money(totals.totalWon)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: "16px" }}>
            <Link
              href="/admin/spelers"
              className="primaryButton"
            >
              Alle profielen bekijken →
            </Link>
          </div>
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
