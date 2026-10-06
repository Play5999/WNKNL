import { redirect, notFound } from "next/navigation";
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
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export default async function AdminPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const { data: player } = await supabase
    .from("profiles")
    .select("id, account_number, full_name, email, payout_link, created_at, is_admin")
    .eq("id", id)
    .single();

  if (!player || player.is_admin) notFound();

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
      created_at
    `)
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  const orders = orderData ?? [];
  const approved = orders.filter(
    (order) => order.payment_status === "approved"
  );

  const totalSpent = approved.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  const totalWon = approved.reduce(
    (sum, order) => sum + Number(order.winnings || 0),
    0
  );

  return (
    <main>
      <div className="siteContainer standardPage">
        <section className="pageHero">
          <span className="heroTag">SPELERSprofiel</span>
          <h1>
            {player.full_name || "Naam onbekend"}
          </h1>
          <p>
            Account {player.account_number ?? "—"}
          </p>
        </section>

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>PROFIEL</small>
            <h2>Spelergegevens</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "14px",
            }}
          >
            <div className="accountInfoCard">
              <small>NAAM</small>
              <strong>{player.full_name || "Naam onbekend"}</strong>
            </div>

            <div className="accountInfoCard">
              <small>E-MAIL</small>
              <strong>{player.email || "—"}</strong>
            </div>

            <div className="accountInfoCard">
              <small>UITBETAALLINK</small>
              <strong
                style={{
                  color: player.payout_link ? "#15803d" : "#b91c1c",
                }}
              >
                {player.payout_link ? "✓ Ja" : "✕ Nee"}
              </strong>
            </div>

            <div className="accountInfoCard">
              <small>TOTALE INZET</small>
              <strong>{money(totalSpent)}</strong>
            </div>

            <div className="accountInfoCard">
              <small>TOTALE WINST</small>
              <strong>{money(totalWon)}</strong>
            </div>
          </div>

          {player.payout_link && (
            <div style={{ marginTop: "14px" }}>
              <a
                href={player.payout_link}
                target="_blank"
                rel="noopener noreferrer"
                className="primaryButton"
              >
                Uitbetaallink openen →
              </a>
            </div>
          )}
        </section>

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>GESCHIEDENIS</small>
            <h2>Tickets</h2>
          </div>

          {orders.length === 0 ? (
            <div className="emptyState">
              Deze speler heeft nog geen tickets.
            </div>
          ) : (
            <div className="tableWrapper">
              <table className="siteTable">
                <thead>
                  <tr>
                    <th>Trekking</th>
                    <th>Referentie</th>
                    <th>Status</th>
                    <th>Inzet</th>
                    <th>Winst</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{formatDate(order.draw_date)}</td>
                      <td>
                        <strong>{order.payment_reference || "—"}</strong>
                      </td>
                      <td>{order.payment_status}</td>
                      <td>{money(Number(order.total_amount || 0))}</td>
                      <td>
                        <strong>{money(Number(order.winnings || 0))}</strong>
                      </td>
                      <td>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="accountButton"
                        >
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

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            margin: "22px 0",
          }}
        >
          <Link href="/admin/spelers" className="primaryButton">
            ← Alle profielen
          </Link>

          <Link href="/admin" className="accountButton">
            Admin
          </Link>
        </div>
      </div>
    </main>
  );
}
