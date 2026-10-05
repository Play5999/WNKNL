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

function paymentStatus(status: string) {
  if (status === "approved") {
    return "Goedgekeurd";
  }

  if (status === "rejected") {
    return "Afgewezen";
  }

  return "Wacht op controle";
}

export default async function AccountPage() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }


  // =========================================================
  // PROFIEL
  // =========================================================

  const { data: profile } =
    await supabase
      .from("profiles")
      .select(`
        account_number,
        full_name,
        email,
        is_admin
      `)
      .eq("id", user.id)
      .single();


  // =========================================================
  // BESTELLINGEN VAN DEZE SPELER
  // =========================================================

  const { data: orders } =
    await supabase
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
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });


  return (
    <main>

      <div className="siteContainer standardPage">

        <section className="pageHero">

          <span className="heroTag">
            MIJN ACCOUNT
          </span>

          <h1>
            Welkom bij{" "}
            <span>WNKNL</span>
          </h1>

          <p>
            Bekijk je account,
            deelnames, betalingen en
            gewonnen bedragen.
          </p>

        </section>


        {/* ===============================================
            ACCOUNT
        =============================================== */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              ACCOUNT
            </small>

            <h2>
              Mijn gegevens
            </h2>

          </div>


          <div className="accountGrid">

            <div className="accountInfoCard">

              <small>
                ACCOUNTNUMMER
              </small>

              <strong>
                {profile?.account_number ??
                  "—"}
              </strong>

            </div>


            <div className="accountInfoCard">

              <small>
                E-MAIL
              </small>

              <strong>
                {profile?.email ??
                  user.email ??
                  "—"}
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


        {/* ===============================================
            MIJN LOTEN
        =============================================== */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              MIJN LOTEN
            </small>

            <h2>
              Mijn deelnames
            </h2>

            <p>
              Hier zie je je gekochte
              nummers en de status van
              iedere betaling.
            </p>

          </div>


          {!orders ||
          orders.length === 0 ? (

            <div className="emptyState">

              Je hebt nog geen loten
              gekocht.

            </div>

          ) : (

            <div className="adminOrderList">

              {orders.map(
                (order) => (

                  <div
                    className="adminOrderCard"
                    key={order.id}
                  >

                    <div className="adminOrderMain">

                      <small>
                        TICKETNUMMER
                      </small>

                      <strong>
                        {order.payment_reference}
                      </strong>

                      <span>
                        Trekking:{" "}
                        {order.draw_date}
                      </span>

                    </div>


                    <div className="adminOrderAmount">

                      <small>
                        INZET
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

                      <small
                        style={{
                          display: "block",
                          marginBottom:
                            "8px",
                          color:
                            "var(--muted)",
                          fontWeight: 900,
                        }}
                      >
                        {paymentStatus(
                          order.payment_status
                        )}
                      </small>


                      <Link
                        href={`/betalen/${order.id}`}
                        className="primaryButton"
                      >
                        Bekijk lot →
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}
