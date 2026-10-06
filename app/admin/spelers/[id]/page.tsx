import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";

function money(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function paymentLabel(status?: string | null) {
  if (status === "approved") return "Goedgekeurd";
  if (status === "rejected") return "Afgekeurd";
  return "Wacht op controle";
}

export default async function AdminPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!adminProfile?.is_admin) redirect("/account");

  const { data: player } = await supabase
    .from("profiles")
    .select("id, account_number, full_name, email, payout_link, is_admin, created_at")
    .eq("id", id)
    .single();

  if (!player) redirect("/admin");

  const { data: orderData } = await supabase
    .from("orders")
    .select(`
      id, draw_date, payment_reference, total_amount, payment_status,
      winnings, payout_status, approved_at, paid_out_at, created_at
    `)
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const orders = orderData ?? [];
  const approvedOrders = orders.filter((order) => order.payment_status === "approved");
  const totalSpent = approvedOrders.reduce((t, o) => t + Number(o.total_amount || 0), 0);
  const totalWon = approvedOrders.reduce((t, o) => t + Number(o.winnings || 0), 0);
  const outstanding = approvedOrders
    .filter((o) => o.payout_status === "pending" && Number(o.winnings || 0) > 0)
    .reduce((t, o) => t + Number(o.winnings || 0), 0);
  const paidOut = approvedOrders
    .filter((o) => o.payout_status === "paid" && Number(o.winnings || 0) > 0)
    .reduce((t, o) => t + Number(o.winnings || 0), 0);

  return (
    <main>
      <div className="siteContainer standardPage">
        <section className="pageHero">
          <span className="heroTag">SPELERSBEHEER</span>
          <h1>
            {player.full_name || "Speler"}{" "}
            <span>#{player.account_number ?? "—"}</span>
          </h1>
          <p>
            Bekijk accountgegevens, uitbetaallink, inzet, winst
            en volledige tickethistorie.
          </p>
        </section>

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>PROFIEL</small>
            <h2>Accountgegevens</h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "14px",
          }}>
            <div className="accountInfoCard">
              <small>ACCOUNTNUMMER</small>
              <strong>{player.account_number ?? "—"}</strong>
            </div>
            <div className="accountInfoCard">
              <small>NAAM</small>
              <strong>{player.full_name || "Naam onbekend"}</strong>
            </div>
            <div className="accountInfoCard">
              <small>E-MAIL</small>
              <strong>{player.email || "—"}</strong>
            </div>
            <div className="accountInfoCard">
              <small>ACCOUNT AANGEMAAKT</small>
              <strong>{formatDate(player.created_at)}</strong>
            </div>
          </div>

          <div className="accountInfoCard" style={{ marginTop: "14px" }}>
            <small>UITBETAALLINK</small>
            {player.payout_link ? (
              <>
                <strong style={{
                  display: "block", marginTop: "6px", wordBreak: "break-all"
                }}>
                  {player.payout_link}
                </strong>
                <a
                  href={player.payout_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primaryButton"
                  style={{ display: "inline-block", marginTop: "12px" }}
                >
                  Open uitbetaallink →
                </a>
              </>
            ) : (
              <strong style={{
                display: "block", marginTop: "6px", color: "#c2410c"
              }}>
                Nog niet ingesteld
              </strong>
            )}
          </div>
        </section>

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>FINANCIEEL</small>
            <h2>Spelersoverzicht</h2>
          </div>

          <div className="adminStatsGrid">
            <div className="adminStatCard">
              <small>TOTAAL INGEZET</small><strong>{money(totalSpent)}</strong>
            </div>
            <div className="adminStatCard">
              <small>TOTAAL GEWONNEN</small><strong>{money(totalWon)}</strong>
            </div>
            <div className="adminStatCard">
              <small>NOG UIT TE BETALEN</small><strong>{money(outstanding)}</strong>
            </div>
            <div className="adminStatCard">
              <small>UITBETAALD</small><strong>{money(paidOut)}</strong>
            </div>
            <div className="adminStatCard">
              <small>LOTEN</small><strong>{orders.length}</strong>
            </div>
            <div className="adminStatCard">
              <small>GOEDGEKEURD</small><strong>{approvedOrders.length}</strong>
            </div>
          </div>
        </section>

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>LOTEN</small>
            <h2>Speelgeschiedenis</h2>
          </div>

          {orders.length === 0 ? (
            <div className="emptyState">Deze speler heeft nog geen loten.</div>
          ) : (
            <div className="tableWrapper">
              <table className="siteTable">
                <thead>
                  <tr>
                    <th>Referentie</th><th>Trekking</th><th>Inzet</th>
                    <th>Betaling</th><th>Gewonnen</th><th>Uitbetaling</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td><strong>{order.payment_reference || "—"}</strong></td>
                      <td>{formatDate(order.draw_date)}</td>
                      <td>{money(Number(order.total_amount || 0))}</td>
                      <td>{paymentLabel(order.payment_status)}</td>
                      <td><strong>{money(Number(order.winnings || 0))}</strong></td>
                      <td>
                        {Number(order.winnings || 0) <= 0
                          ? "—"
                          : order.payout_status === "paid"
                          ? "Uitbetaald"
                          : "Openstaand"}
                      </td>
                      <td>
                        <Link href={`/admin/orders/${order.id}`} className="primaryButton">
                          Bekijk →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div style={{
          display: "flex", gap: "10px", flexWrap: "wrap", margin: "24px 0"
        }}>
          <Link href="/admin" className="accountButton adminBackButton">
            ← Terug naar admin
          </Link>
          <Link href="/admin/winnaars" className="primaryButton">
            Naar winnaars →
          </Link>
        </div>
      </div>
    </main>
  );
}
