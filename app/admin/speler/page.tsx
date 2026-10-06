import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

function money(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function AdminPlayersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!adminProfile?.is_admin) redirect("/account");

  const { data: playersData } = await supabase
    .from("profiles")
    .select("id, account_number, full_name, email, payout_link, created_at")
    .eq("is_admin", false)
    .order("created_at", { ascending: false });

  const players = playersData ?? [];
  const playerIds = players.map((player) => player.id);

  let orders: any[] = [];

  if (playerIds.length > 0) {
    const { data: orderData } = await supabase
      .from("orders")
      .select("user_id, total_amount, winnings, payment_status")
      .in("user_id", playerIds);

    orders = orderData ?? [];
  }

  function totals(userId: string) {
    const approved = orders.filter(
      (order) =>
        order.user_id === userId &&
        order.payment_status === "approved"
    );

    return {
      spent: approved.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      ),
      won: approved.reduce(
        (sum, order) => sum + Number(order.winnings || 0),
        0
      ),
    };
  }

  return (
    <main>
      <div className="siteContainer standardPage">
        <section className="pageHero">
          <span className="heroTag">ADMIN · SPELERS</span>
          <h1>
            Alle <span>profielen</span>
          </h1>
          <p>
            Bekijk alle spelers, hun totale inzet, winst en uitbetaallink.
          </p>
        </section>

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
              <small>SPELERSOVERZICHT</small>
              <h2>{players.length} profielen</h2>
            </div>

            <Link href="/admin" className="accountButton">
              ← Terug naar admin
            </Link>
          </div>

          {players.length === 0 ? (
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
                  {players.map((player) => {
                    const playerTotals = totals(player.id);

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
                          <strong>{money(playerTotals.spent)}</strong>
                        </td>
                        <td>
                          <strong>{money(playerTotals.won)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
