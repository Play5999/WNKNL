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

function getTodayAmsterdam() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function prizeLabel(position?: number | null) {
  if (position === 1) return "1e prijs";
  if (position === 2) return "2e prijs";
  if (position === 3) return "3e prijs";

  return "Prijs";
}

function numberTypeLabel(type: number) {
  if (type === 4) return "4 cijfers";
  if (type === 3) return "3 cijfers";
  return "2 cijfers";
}

function paymentStatus(status: string) {
  if (status === "approved") {
    return {
      label: "Goedgekeurd",
      color: "#15803d",
      background: "#dcfce7",
    };
  }

  if (status === "rejected") {
    return {
      label: "Afgekeurd",
      color: "#b91c1c",
      background: "#fee2e2",
    };
  }

  return {
    label: "Wacht op controle",
    color: "#c2410c",
    background: "#ffedd5",
  };
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // =========================================================
  // PROFIEL
  // =========================================================

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      account_number,
      full_name,
      email,
      is_admin,
      payout_link
    `)
    .eq("id", user.id)
    .single();

  // =========================================================
  // BESTELLINGEN
  // =========================================================

  const { data: orderData } = await supabase
    .from("orders")
    .select(`
      id,
      draw_date,
      payment_reference,
      total_amount,
      payment_status,
      winnings,
      payout_status,
      paid_out_at,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  const orders = orderData ?? [];

  // =========================================================
  // ALLE NUMMERS VAN DEZE TICKETS
  // =========================================================

  const orderIds = orders.map((order) => order.id);

  let entries: any[] = [];

  if (orderIds.length > 0) {
    const { data: entryData } = await supabase
      .from("entries")
      .select(`
        id,
        order_id,
        number_type,
        played_number,
        stake,
        winnings,
        prize_position,
        matched_draw_number,
        created_at
      `)
      .in("order_id", orderIds)
      .order("created_at", {
        ascending: true,
      });

    entries = entryData ?? [];
  }

  // =========================================================
  // OVERZICHT
  // =========================================================

  const today = getTodayAmsterdam();

  const approvedOrders = orders.filter(
    (order) => order.payment_status === "approved"
  );

  const totalSpent = approvedOrders.reduce(
    (total, order) =>
      total + Number(order.total_amount || 0),
    0
  );

  const todaySpent = approvedOrders
    .filter((order) => order.draw_date === today)
    .reduce(
      (total, order) =>
        total + Number(order.total_amount || 0),
      0
    );

  const totalWon = approvedOrders.reduce(
    (total, order) =>
      total + Number(order.winnings || 0),
    0
  );

  const todayWon = approvedOrders
    .filter((order) => order.draw_date === today)
    .reduce(
      (total, order) =>
        total + Number(order.winnings || 0),
      0
    );

  // =========================================================
  // NAAM
  // =========================================================

  const googleName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "";

  const displayName =
    profile?.full_name ||
    googleName ||
    "Naam niet beschikbaar";

  const displayEmail =
    profile?.email ||
    user.email ||
    "—";

  // =========================================================
  // UITBETAALLINK OPSLAAN
  // =========================================================

  async function savePayoutLink(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const payoutLink = String(
      formData.get("payout_link") || ""
    ).trim();

    if (
      payoutLink &&
      !payoutLink.startsWith("https://")
    ) {
      redirect(
        "/account?error=De+uitbetaallink+moet+beginnen+met+https%3A%2F%2F"
      );
    }

    const { error } = await supabase.rpc(
      "set_my_payout_link",
      {
        p_payout_link: payoutLink,
      }
    );

    if (error) {
      redirect(
        `/account?error=${encodeURIComponent(
          error.message
        )}`
      );
    }

    revalidatePath("/account");

    redirect("/account?saved=1");
  }

  return (
    <main>
      <div className="siteContainer standardPage">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="pageHero">

          <span className="heroTag">
            MIJN ACCOUNT
          </span>

          <h1>
            Welkom{" "}
            <span>{displayName}</span>
          </h1>

          <p>
            Bekijk je gegevens, inzet, gewonnen
            bedragen en je gespeelde loten.
          </p>

        </section>

        {/* =================================================
            VANDAAG + TOTAAL
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              MIJN OVERZICHT
            </small>

            <h2>
              Inzet & winst
            </h2>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >

            {/* VANDAAG */}

            <div className="accountInfoCard">

              <small>VANDAAG</small>

              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  marginTop: "18px",
                }}
              >

                <div>

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 900,
                      color: "var(--muted)",
                    }}
                  >
                    INGEZET
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "27px",
                      marginTop: "4px",
                    }}
                  >
                    {money(todaySpent)}
                  </strong>

                </div>

                <div>

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 900,
                      color: "var(--muted)",
                    }}
                  >
                    GEWONNEN
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "27px",
                      marginTop: "4px",
                    }}
                  >
                    {money(todayWon)}
                  </strong>

                </div>

              </div>

            </div>

            {/* TOTAAL */}

            <div className="accountInfoCard">

              <small>TOTAAL</small>

              <div
                style={{
                  display: "grid",
                  gap: "20px",
                  marginTop: "18px",
                }}
              >

                <div>

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 900,
                      color: "var(--muted)",
                    }}
                  >
                    TOTAAL INGEZET
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "27px",
                      marginTop: "4px",
                    }}
                  >
                    {money(totalSpent)}
                  </strong>

                </div>

                <div>

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 900,
                      color: "var(--muted)",
                    }}
                  >
                    TOTAAL GEWONNEN
                  </span>

                  <strong
                    style={{
                      display: "block",
                      fontSize: "27px",
                      marginTop: "4px",
                    }}
                  >
                    {money(totalWon)}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            MIJN GEGEVENS
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>ACCOUNT</small>

            <h2>
              Mijn gegevens
            </h2>

          </div>

          <div className="accountGrid">

            <div className="accountInfoCard">

              <small>
                NAAM EN ACHTERNAAM
              </small>

              <strong>
                {displayName}
              </strong>

            </div>

            <div className="accountInfoCard">

              <small>
                E-MAILADRES
              </small>

              <strong>
                {displayEmail}
              </strong>

            </div>

            <div className="accountInfoCard">

              <small>
                ACCOUNTNUMMER
              </small>

              <strong>
                {profile?.account_number ?? "—"}
              </strong>

            </div>

            <div className="accountInfoCard">

              <small>
                ACCOUNTTYPE
              </small>

              <strong>
                {profile?.is_admin
                  ? "Beheerder"
                  : "Speler"}
              </strong>

            </div>

          </div>

          <div
            style={{
              marginTop: "18px",
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <Link
              href="/#spelen"
              className="yellowButton"
            >
              Nieuwe nummers spelen →
            </Link>

            {profile?.is_admin && (
              <Link
                href="/admin"
                className="accountButton adminBackButton"
              >
                Admin openen →
              </Link>
            )}

          </div>

        </section>

        {/* =================================================
            UITBETAALLINK
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              UITBETALING
            </small>

            <h2>
              Mijn uitbetaallink
            </h2>

            <p>
              Plak hier de persoonlijke link waarop
              je een gewonnen bedrag wilt ontvangen.
            </p>

          </div>

          {params.saved === "1" && (

            <div
              style={{
                padding: "14px 16px",
                marginBottom: "18px",
                borderRadius: "8px",
                background: "#dcfce7",
                color: "#15803d",
                fontWeight: 800,
              }}
            >
              ✓ Uitbetaallink opgeslagen.
            </div>

          )}

          {params.error && (

            <div className="loginError">
              {params.error}
            </div>

          )}

          <form action={savePayoutLink}>

            <div
              className="accountInfoCard"
              style={{
                maxWidth: "750px",
              }}
            >

              <small>
                PERSOONLIJKE UITBETAALLINK
              </small>

              <input
                type="url"
                name="payout_link"
                defaultValue={
                  profile?.payout_link || ""
                }
                placeholder="https://..."
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "14px",
                  border: "1px solid #d8dee9",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: "13px",
                  color: "var(--muted)",
                }}
              >
                Je kunt deze link later altijd
                wijzigen.
              </p>

            </div>

            <button
              type="submit"
              className="primaryButton"
              style={{
                marginTop: "14px",
              }}
            >
              Uitbetaallink opslaan →
            </button>

          </form>

        </section>

        {/* =================================================
            MIJN LOTEN
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              MIJN LOTEN
            </small>

            <h2>
              Mijn deelnames
            </h2>

            <p>
              Bekijk per ticket je gespeelde nummers,
              inzet en eventuele winst.
            </p>

          </div>

          {orders.length === 0 ? (

            <div className="emptyState">
              Je hebt nog geen loten gekocht.
            </div>

          ) : (

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >

              {orders.map((order) => {

                const status = paymentStatus(
                  order.payment_status
                );

                const orderEntries = entries.filter(
                  (entry) =>
                    entry.order_id === order.id
                );

                const winningEntries =
                  orderEntries.filter(
                    (entry) =>
                      Number(entry.winnings || 0) > 0
                  );

                const winnings = Number(
                  order.winnings || 0
                );

                return (
                  <div
                    key={order.id}
                    className="accountInfoCard"
                  >

                    {/* TICKET HEADER */}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "20px",
                        flexWrap: "wrap",
                      }}
                    >

                      <div>

                        <small>
                          TICKET
                        </small>

                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "18px",
                          }}
                        >
                          {order.payment_reference || "—"}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: "5px",
                            color: "var(--muted)",
                          }}
                        >
                          Trekking:{" "}
                          {formatDate(order.draw_date)}
                        </span>

                      </div>

                      <div>

                        <small>
                          INZET
                        </small>

                        <strong
                          style={{
                            display: "block",
                            marginTop: "5px",
                            fontSize: "20px",
                          }}
                        >
                          {money(
                            Number(
                              order.total_amount || 0
                            )
                          )}
                        </strong>

                      </div>

                    </div>

                    {/* BETAALSTATUS */}

                    <div
                      style={{
                        marginTop: "15px",
                      }}
                    >

                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 11px",
                          borderRadius: "999px",
                          background: status.background,
                          color: status.color,
                          fontWeight: 900,
                          fontSize: "12px",
                        }}
                      >
                        {status.label}
                      </span>

                    </div>

                    {/* ALLE GESPEELDE NUMMERS */}

                    <div
                      style={{
                        marginTop: "20px",
                      }}
                    >

                      <small>
                        GESPEELDE NUMMERS
                      </small>

                      {orderEntries.length === 0 ? (

                        <p>
                          Geen nummers gevonden.
                        </p>

                      ) : (

                        <div
                          className="tableWrapper"
                          style={{
                            marginTop: "10px",
                          }}
                        >

                          <table className="siteTable">

                            <thead>
                              <tr>
                                <th>Nummer</th>
                                <th>Type</th>
                                <th>Inzet</th>
                                <th>Resultaat</th>
                              </tr>
                            </thead>

                            <tbody>

                              {orderEntries.map((entry) => {

                                const entryWinnings =
                                  Number(
                                    entry.winnings || 0
                                  );

                                return (
                                  <tr key={entry.id}>

                                    <td>
                                      <strong>
                                        {entry.played_number}
                                      </strong>
                                    </td>

                                    <td>
                                      {numberTypeLabel(
                                        Number(
                                          entry.number_type
                                        )
                                      )}
                                    </td>

                                    <td>
                                      {money(
                                        Number(
                                          entry.stake || 0
                                        )
                                      )}
                                    </td>

                                    <td>

                                      {entryWinnings > 0 ? (

                                        <strong
                                          style={{
                                            color: "#15803d",
                                          }}
                                        >
                                          🏆{" "}
                                          {money(
                                            entryWinnings
                                          )}
                                        </strong>

                                      ) : order.payment_status ===
                                        "approved" ? (

                                        <span>
                                          Geen winst
                                        </span>

                                      ) : (

                                        <span>
                                          —
                                        </span>

                                      )}

                                    </td>

                                  </tr>
                                );
                              })}

                            </tbody>

                          </table>

                        </div>

                      )}

                    </div>

                    {/* WINST */}

                    {winnings > 0 && (

                      <div
                        style={{
                          marginTop: "18px",
                          padding: "16px",
                          borderRadius: "10px",
                          background: "#fff8d9",
                        }}
                      >

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <small>🏆 WINNEND LOT</small>

                            <h3 style={{ margin: "5px 0 0" }}>
                              Je hebt {money(winnings)} gewonnen
                            </h3>
                          </div>

                          {order.payout_status === "paid" ? (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "7px 12px",
                                borderRadius: "999px",
                                background: "#dcfce7",
                                color: "#15803d",
                                fontWeight: 900,
                                whiteSpace: "nowrap",
                              }}
                            >
                              ✓ Uitbetaald
                            </span>
                          ) : (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "7px 12px",
                                borderRadius: "999px",
                                background: "#ffedd5",
                                color: "#c2410c",
                                fontWeight: 900,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Wacht op uitbetaling
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(190px, 1fr))",
                            gap: "10px",
                            marginTop: "14px",
                          }}
                        >
                          {winningEntries.map((entry) => (
                            <div
                              key={entry.id}
                              style={{
                                padding: "12px",
                                borderRadius: "8px",
                                background: "rgba(255,255,255,0.55)",
                                border: "1px solid rgba(0,0,0,0.08)",
                              }}
                            >
                              <strong
                                style={{
                                  display: "block",
                                  fontSize: "17px",
                                  marginBottom: "5px",
                                }}
                              >
                                Nummer {entry.played_number}
                              </strong>

                              <span
                                style={{
                                  display: "block",
                                  fontSize: "13px",
                                  color: "var(--muted)",
                                  marginBottom: "7px",
                                }}
                              >
                                {numberTypeLabel(Number(entry.number_type))} ·{" "}
                                {prizeLabel(entry.prize_position)}
                              </span>

                              {entry.matched_draw_number && (
                                <div
                                  style={{
                                    fontSize: "14px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Trekking:{" "}
                                  <strong>{entry.matched_draw_number}</strong>
                                </div>
                              )}

                              <div
                                style={{
                                  fontSize: "14px",
                                  marginBottom: "4px",
                                }}
                              >
                                Inzet: {money(Number(entry.stake || 0))}
                              </div>

                              <div style={{ fontSize: "14px" }}>
                                Gewonnen:{" "}
                                <strong>
                                  {money(Number(entry.winnings || 0))}
                                </strong>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>

                    )}

                    <div
                      style={{
                        marginTop: "18px",
                      }}
                    >

                      <Link
                        href={`/betalen/${order.id}`}
                        className="primaryButton"
                      >
                        Bekijk volledig lot →
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}
