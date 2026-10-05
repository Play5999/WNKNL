import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase/server";

function money(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function prizeLabel(position: number | null) {
  if (position === 1) {
    return "1e prijs";
  }

  if (position === 2) {
    return "2e prijs";
  }

  if (position === 3) {
    return "3e prijs";
  }

  return "—";
}

function numberTypeLabel(type: number) {
  if (type === 4) {
    return "4 cijfers";
  }

  if (type === 3) {
    return "3 cijfers";
  }

  return "2 cijfers";
}

export default async function WinnersPage({
  searchParams,
}: {
  searchParams: Promise<{
    paid?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase =
    await createClient();

  // =========================================================
  // LOGIN
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

  const { data: adminProfile } =
    await supabase
      .from("profiles")
      .select(`
        id,
        is_admin
      `)
      .eq("id", user.id)
      .single();

  if (!adminProfile?.is_admin) {
    redirect("/account");
  }

  // =========================================================
  // ALLE WINNENDE TICKETS
  // =========================================================

  const { data: winningOrdersData } =
    await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        draw_date,
        payment_reference,
        total_amount,
        winnings,
        payout_status,
        paid_out_at,
        created_at,
        profiles (
          account_number,
          full_name,
          email,
          payout_link
        )
      `)
      .eq("payment_status", "approved")
      .gt("winnings", 0)
      .order("created_at", {
        ascending: false,
      });

  const winningOrders =
    winningOrdersData ?? [];

  // =========================================================
  // OPENSTAANDE WINNAARS
  // =========================================================

  const pendingWinners =
    winningOrders.filter(
      (order) =>
        order.payout_status ===
        "pending"
    );

  const paidWinners =
    winningOrders.filter(
      (order) =>
        order.payout_status ===
        "paid"
    );

  const totalPending =
    pendingWinners.reduce(
      (total, order) =>
        total +
        Number(
          order.winnings || 0
        ),
      0
    );

  const totalPaid =
    paidWinners.reduce(
      (total, order) =>
        total +
        Number(
          order.winnings || 0
        ),
      0
    );

  // =========================================================
  // ENTRIES VAN WINNENDE TICKETS
  // =========================================================

  const winningOrderIds =
    winningOrders.map(
      (order) => order.id
    );

  let entries: any[] = [];

  if (
    winningOrderIds.length > 0
  ) {
    const { data } =
      await supabase
        .from("entries")
        .select(`
          id,
          order_id,
          number_type,
          played_number,
          stake,
          winnings,
          prize_position,
          matched_draw_number
        `)
        .in(
          "order_id",
          winningOrderIds
        )
        .gt("winnings", 0)
        .order("created_at", {
          ascending: true,
        });

    entries = data ?? [];
  }

  // =========================================================
  // UITBETALING MARKEREN
  // =========================================================

  async function markAsPaid(
    formData: FormData
  ) {
    "use server";

    const supabase =
      await createClient();

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: admin } =
      await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!admin?.is_admin) {
      redirect("/account");
    }

    const orderId =
      String(
        formData.get(
          "order_id"
        ) || ""
      );

    if (!orderId) {
      redirect(
        "/admin/winnaars?error=Geen+ticket+gevonden"
      );
    }

    // Eerst controleren of het ticket
    // daadwerkelijk een openstaande winnaar is.

    const { data: order } =
      await supabase
        .from("orders")
        .select(`
          id,
          winnings,
          payout_status
        `)
        .eq("id", orderId)
        .eq(
          "payment_status",
          "approved"
        )
        .single();

    if (
      !order ||
      Number(
        order.winnings || 0
      ) <= 0
    ) {
      redirect(
        "/admin/winnaars?error=Dit+ticket+heeft+geen+geldige+winst"
      );
    }

    if (
      order.payout_status ===
      "paid"
    ) {
      redirect(
        "/admin/winnaars?error=Deze+prijs+is+al+uitbetaald"
      );
    }

    const { error } =
      await supabase
        .from("orders")
        .update({
          payout_status:
            "paid",
          paid_out_at:
            new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq(
          "payout_status",
          "pending"
        );

    if (error) {
      redirect(
        `/admin/winnaars?error=${encodeURIComponent(
          error.message
        )}`
      );
    }

    revalidatePath(
      "/admin/winnaars"
    );

    revalidatePath(
      "/admin"
    );

    revalidatePath(
      "/account"
    );

    redirect(
      "/admin/winnaars?paid=1"
    );
  }

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
            ADMIN · WINNAARS
          </span>

          <h1>
            Winnaars &{" "}
            <span>
              uitbetalingen
            </span>
          </h1>

          <p>
            Bekijk wie heeft
            gewonnen, hoeveel er
            uitbetaald moet worden
            en registreer de
            uitbetaling.
          </p>

        </section>

        {/* =================================================
            MELDINGEN
        ================================================= */}

        {params.paid ===
          "1" && (

          <section className="standardSection">

            <div
              style={{
                padding:
                  "15px 18px",
                borderRadius:
                  "10px",
                background:
                  "#dcfce7",
                color:
                  "#15803d",
                fontWeight:
                  800,
              }}
            >
              Uitbetaling is
              geregistreerd.
            </div>

          </section>

        )}

        {params.error && (

          <section className="standardSection">

            <div className="loginError">
              {params.error}
            </div>

          </section>

        )}

        {/* =================================================
            OVERZICHT
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              UITBETALINGEN
            </small>

            <h2>
              Overzicht
            </h2>

          </div>

          <div className="adminStatsGrid">

            <div className="adminStatCard">

              <small>
                WINNAARS TE BETALEN
              </small>

              <strong>
                {
                  pendingWinners.length
                }
              </strong>

            </div>

            <div className="adminStatCard">

              <small>
                NOG UIT TE BETALEN
              </small>

              <strong>
                {money(
                  totalPending
                )}
              </strong>

            </div>

            <div className="adminStatCard">

              <small>
                UITBETAALDE WINNAARS
              </small>

              <strong>
                {
                  paidWinners.length
                }
              </strong>

            </div>

            <div className="adminStatCard">

              <small>
                TOTAAL UITBETAALD
              </small>

              <strong>
                {money(
                  totalPaid
                )}
              </strong>

            </div>

          </div>

        </section>

        {/* =================================================
            OPENSTAANDE WINNAARS
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              ACTIE NODIG
            </small>

            <h2>
              Winnaars te betalen
            </h2>

            <p>
              Controleer de speler,
              het gewonnen bedrag en
              de uitbetaallink voordat
              je de uitbetaling als
              voltooid registreert.
            </p>

          </div>

          {pendingWinners.length ===
          0 ? (

            <div className="emptyState">

              Er zijn momenteel
              geen winnaars die nog
              betaald moeten worden.

            </div>

          ) : (

            <div
              style={{
                display:
                  "grid",
                gap: "20px",
              }}
            >

              {pendingWinners.map(
                (order) => {
                  const profile =
                    Array.isArray(
                      order.profiles
                    )
                      ? order
                          .profiles[0]
                      : order.profiles;

                  const orderEntries =
                    entries.filter(
                      (entry) =>
                        entry.order_id ===
                        order.id
                    );

                  return (
                    <div
                      className="accountInfoCard"
                      key={
                        order.id
                      }
                    >

                      {/* SPELER */}

                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                          gap:
                            "20px",
                          flexWrap:
                            "wrap",
                        }}
                      >

                        <div>

                          <small>
                            WINNAAR
                          </small>

                          <h3
                            style={{
                              margin:
                                "6px 0 4px",
                            }}
                          >
                            {profile
                              ?.full_name ||
                              "Naam onbekend"}
                          </h3>

                          <div>
                            {profile
                              ?.email ||
                              "Geen e-mail"}
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",
                            }}
                          >
                            Account{" "}
                            {profile
                              ?.account_number ??
                              "—"}
                          </div>

                        </div>

                        <div>

                          <small>
                            GEWONNEN
                          </small>

                          <strong
                            style={{
                              display:
                                "block",
                              marginTop:
                                "5px",
                              fontSize:
                                "28px",
                            }}
                          >
                            {money(
                              Number(
                                order
                                  .winnings ||
                                  0
                              )
                            )}
                          </strong>

                        </div>

                      </div>

                      {/* TICKET */}

                      <div
                        style={{
                          marginTop:
                            "18px",
                          paddingTop:
                            "18px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >

                        <small>
                          TICKET
                        </small>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "5px",
                          }}
                        >
                          {order
                            .payment_reference ||
                            "—"}
                        </strong>

                        <span>
                          Trekking:{" "}
                          {
                            order.draw_date
                          }
                        </span>

                      </div>

                      {/* WINNENDE NUMMERS */}

                      <div
                        style={{
                          marginTop:
                            "20px",
                        }}
                      >

                        <small>
                          WINNENDE NUMMERS
                        </small>

                        {orderEntries.length ===
                        0 ? (

                          <p>
                            Geen
                            winnende
                            nummers
                            gevonden.
                          </p>

                        ) : (

                          <div
                            className="tableWrapper"
                            style={{
                              marginTop:
                                "10px",
                            }}
                          >

                            <table className="siteTable">

                              <thead>
                                <tr>
                                  <th>
                                    Nummer
                                  </th>
                                  <th>
                                    Type
                                  </th>
                                  <th>
                                    Prijs
                                  </th>
                                  <th>
                                    Inzet
                                  </th>
                                  <th>
                                    Winst
                                  </th>
                                </tr>
                              </thead>

                              <tbody>

                                {orderEntries.map(
                                  (
                                    entry
                                  ) => (

                                    <tr
                                      key={
                                        entry.id
                                      }
                                    >

                                      <td>
                                        <strong>
                                          {
                                            entry.played_number
                                          }
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
                                        {prizeLabel(
                                          entry.prize_position
                                        )}
                                      </td>

                                      <td>
                                        {money(
                                          Number(
                                            entry.stake ||
                                              0
                                          )
                                        )}
                                      </td>

                                      <td>
                                        <strong>
                                          {money(
                                            Number(
                                              entry.winnings ||
                                                0
                                            )
                                          )}
                                        </strong>
                                      </td>

                                    </tr>

                                  )
                                )}

                              </tbody>

                            </table>

                          </div>

                        )}

                      </div>

                      {/* UITBETALING */}

                      <div
                        style={{
                          marginTop:
                            "22px",
                          paddingTop:
                            "20px",
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >

                        <small>
                          UITBETALING
                        </small>

                        {profile
                          ?.payout_link ? (

                          <div
                            style={{
                              marginTop:
                                "10px",
                              display:
                                "flex",
                              gap:
                                "10px",
                              flexWrap:
                                "wrap",
                              alignItems:
                                "center",
                            }}
                          >

                            <a
                              href={
                                profile.payout_link
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="yellowButton"
                            >
                              Open uitbetaallink ↗
                            </a>

                            <span
                              style={{
                                fontSize:
                                  "13px",
                                color:
                                  "var(--muted)",
                              }}
                            >
                              Betaal{" "}
                              <strong>
                                {money(
                                  Number(
                                    order
                                      .winnings ||
                                      0
                                  )
                                )}
                              </strong>
                            </span>

                          </div>

                        ) : (

                          <div
                            style={{
                              marginTop:
                                "10px",
                              padding:
                                "12px 14px",
                              borderRadius:
                                "8px",
                              background:
                                "#ffedd5",
                              color:
                                "#c2410c",
                              fontWeight:
                                800,
                            }}
                          >
                            Deze speler
                            heeft nog
                            geen
                            uitbetaallink
                            ingevuld.
                          </div>

                        )}

                        <form
                          action={
                            markAsPaid
                          }
                          style={{
                            marginTop:
                              "15px",
                          }}
                        >

                          <input
                            type="hidden"
                            name="order_id"
                            value={
                              order.id
                            }
                          />

                          <button
                            type="submit"
                            className="primaryButton"
                          >
                            Markeer{" "}
                            {money(
                              Number(
                                order
                                  .winnings ||
                                  0
                              )
                            )}{" "}
                            als uitbetaald ✓
                          </button>

                        </form>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* =================================================
            UITBETALINGSHISTORIE
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              HISTORIE
            </small>

            <h2>
              Uitbetaalde winnaars
            </h2>

          </div>

          {paidWinners.length ===
          0 ? (

            <div className="emptyState">
              Er zijn nog geen
              uitbetalingen
              geregistreerd.
            </div>

          ) : (

            <div className="tableWrapper">

              <table className="siteTable">

                <thead>
                  <tr>
                    <th>Speler</th>
                    <th>Ticket</th>
                    <th>Trekking</th>
                    <th>Gewonnen</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>

                  {paidWinners.map(
                    (order) => {
                      const profile =
                        Array.isArray(
                          order.profiles
                        )
                          ? order
                              .profiles[0]
                          : order
                              .profiles;

                      return (
                        <tr
                          key={
                            order.id
                          }
                        >

                          <td>
                            <strong>
                              {profile
                                ?.full_name ||
                                "Onbekend"}
                            </strong>

                            <br />

                            <small>
                              {profile
                                ?.email ||
                                ""}
                            </small>
                          </td>

                          <td>
                            {order
                              .payment_reference}
                          </td>

                          <td>
                            {
                              order.draw_date
                            }
                          </td>

                          <td>
                            <strong>
                              {money(
                                Number(
                                  order
                                    .winnings ||
                                    0
                                )
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              style={{
                                padding:
                                  "6px 10px",
                                borderRadius:
                                  "999px",
                                background:
                                  "#dcfce7",
                                color:
                                  "#15803d",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  900,
                              }}
                            >
                              Uitbetaald
                            </span>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        <div className="adminBack">

          <Link
            href="/admin"
            className="accountButton adminBackButton"
          >
            ← Terug naar admin
          </Link>

        </div>

      </div>
    </main>
  );
}
