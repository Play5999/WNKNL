import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/server";

function money(value: number) {
  return value.toLocaleString(
    "nl-NL",
    {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

export default async function PaymentPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }


  // =========================================================
  // BESTELLING
  // =========================================================

  const {
    data: order,
    error: orderError,
  } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      draw_date,
      payment_reference,
      total_amount,
      payment_status,
      created_at
    `)
    .eq("id", id)
    .single();


  if (orderError || !order) {
    notFound();
  }


  // =========================================================
  // ACCOUNT
  // =========================================================

  const {
    data: profile,
  } = await supabase
    .from("profiles")
    .select(`
      account_number,
      full_name,
      email
    `)
    .eq("id", order.user_id)
    .single();


  // =========================================================
  // NUMMERS
  // =========================================================

  const {
    data: entries,
  } = await supabase
    .from("entries")
    .select(`
      id,
      number_type,
      played_number,
      stake
    `)
    .eq("order_id", order.id)
    .order("number_type", {
      ascending: false,
    })
    .order("id", {
      ascending: true,
    });


  const total =
    Number(order.total_amount || 0);

  const reference =
    order.payment_reference || "—";


  return (
    <main>

      <div className="siteContainer standardPage">

        <section className="pageHero">

          <span className="heroTag">
            BETALING
          </span>

          <h1>
            Controleer je{" "}
            <span>deelname</span>
          </h1>

          <p>
            Controleer je nummers en
            totaalbedrag voordat je de
            betaling uitvoert.
          </p>

        </section>


        <div className="paymentLayout">

          {/* ===============================================
              LINKERKANT
          =============================================== */}

          <section className="paymentCard">

            <div className="sectionHeading noCardHeading">

              <small>
                JOUW DEELNAME
              </small>

              <h2>
                Gekozen nummers
              </h2>

            </div>


            {!entries ||
            entries.length === 0 ? (

              <div className="emptyState">
                Geen nummers gevonden.
              </div>

            ) : (

              <div className="summaryList">

                {entries.map(
                  (entry) => (

                    <div
                      className="summaryRow"
                      key={entry.id}
                    >

                      <span>
                        {entry.number_type}{" "}
                        cijfers
                      </span>

                      <strong>
                        {entry.played_number}
                      </strong>

                      <span>
                        {money(
                          Number(
                            entry.stake || 0
                          )
                        )}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}


            <div className="paymentTotal">

              <span>
                Totale inzet
              </span>

              <strong>
                {money(total)}
              </strong>

            </div>


            <Link
              href="/#spelen"
              className="accountButton adminBackButton"
            >
              ← Terug naar spelen
            </Link>

          </section>


          {/* ===============================================
              RECHTERKANT
          =============================================== */}

          <section className="paymentCard">

            <div className="sectionHeading noCardHeading">

              <small>
                BETALING
              </small>

              <h2>
                Betaal je deelname
              </h2>

            </div>


            <div
              className="paymentStatusPending"
            >
              WACHT OP BETALING
            </div>


            <div className="paymentReferenceBox">

              <small>
                JOUW TICKETNUMMER /
                BETAALREFERENTIE
              </small>

              <strong>
                {reference}
              </strong>

            </div>


            <div className="paymentInstruction">

              <strong>
                Belangrijk
              </strong>

              <p>
                Maak exact{" "}
                <strong>
                  {money(total)}
                </strong>{" "}
                over.
              </p>

              <p>
                Vul bij de omschrijving
                van je betaling exact dit
                ticketnummer in:
              </p>

              <strong>
                {reference}
              </strong>

              <p>
                Zonder de juiste
                betaalreferentie kan de
                betaling niet correct aan
                jouw deelname gekoppeld
                worden.
              </p>

            </div>


            <div
              style={{
                marginTop: "18px",
              }}
            >

              <a
                href="https://bunq.me/EddyReady"
                target="_blank"
                rel="noopener noreferrer"
                className="bunqButton"
              >
                Betalen via bunq →
              </a>

            </div>


            <div
              className="infoNotice"
              style={{
                marginTop: "16px",
              }}
            >

              Nadat je hebt betaald wordt
              de betaling eerst
              gecontroleerd.

              <br />
              <br />

              Je deelname wordt pas
              goedgekeurd nadat de
              betaling is gecontroleerd.

            </div>


            <div
              style={{
                marginTop: "18px",
              }}
            >

              <small
                style={{
                  color:
                    "var(--muted)",
                }}
              >
                Accountnummer
              </small>

              <strong
                style={{
                  display: "block",
                  marginTop: "4px",
                  color:
                    "var(--navy)",
                }}
              >
                {profile?.account_number ??
                  "—"}
              </strong>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
}
