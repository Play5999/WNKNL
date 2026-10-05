import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../../lib/supabase/server";

function money(value: number) {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function statusText(status: string) {
  if (status === "approved") {
    return "Goedgekeurd";
  }

  if (status === "rejected") {
    return "Afgewezen";
  }

  return "Wacht op controle";
}

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

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
      .select("is_admin")
      .eq("id", user.id)
      .single();

  if (!adminProfile?.is_admin) {
    redirect("/account");
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
      winnings,
      payout_status,
      approved_at,
      created_at
    `)
    .eq("id", id)
    .single();

  if (orderError || !order) {
    notFound();
  }

  // =========================================================
  // SPELER
  // =========================================================

  const { data: player } =
    await supabase
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

  const { data: entries } =
    await supabase
      .from("entries")
      .select(`
        id,
        number_type,
        played_number,
        stake,
        winnings
      `)
      .eq("order_id", order.id)
      .order("number_type", {
        ascending: false,
      })
      .order("id", {
        ascending: true,
      });

  // =========================================================
  // GOEDKEUREN
  // =========================================================

  async function approveOrder() {
    "use server";

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
      redirect("/account");
    }

    const { error } =
      await supabase
        .from("orders")
        .update({
          payment_status: "approved",
          approved_at:
            new Date().toISOString(),
          approved_by: user.id,
        })
        .eq("id", id)
        .eq(
          "payment_status",
          "pending"
        );

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath(
      `/admin/orders/${id}`
    );
    revalidatePath("/account");

    redirect(
      `/admin/orders/${id}`
    );
  }

  // =========================================================
  // AFWIJZEN
  // =========================================================

  async function rejectOrder() {
    "use server";

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
      redirect("/account");
    }

    const { error } =
      await supabase
        .from("orders")
        .update({
          payment_status: "rejected",
          approved_at: null,
          approved_by: null,
        })
        .eq("id", id)
        .eq(
          "payment_status",
          "pending"
        );

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/admin");
    revalidatePath(
      `/admin/orders/${id}`
    );
    revalidatePath("/account");

    redirect(
      `/admin/orders/${id}`
    );
  }

  return (
    <main>
      <div className="siteContainer standardPage">

        <section className="pageHero">

          <span className="heroTag">
            BESTELLING
          </span>

          <h1>
            Controleer{" "}
            <span>betaling</span>
          </h1>

          <p>
            Controleer het bedrag,
            ticketnummer en de gespeelde
            nummers voordat je de betaling
            goedkeurt.
          </p>

        </section>


        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              SPELER
            </small>

            <h2>
              Bestelling
            </h2>

          </div>


          <div className="accountGrid">

            <div className="accountInfoCard">
              <small>
                ACCOUNTNUMMER
              </small>

              <strong>
                {player?.account_number ??
                  "—"}
              </strong>
            </div>


            <div className="accountInfoCard">
              <small>
                TICKETNUMMER
              </small>

              <strong>
                {order.payment_reference}
              </strong>
            </div>


            <div className="accountInfoCard">
              <small>
                TOTAALBEDRAG
              </small>

              <strong>
                {money(
                  Number(
                    order.total_amount || 0
                  )
                )}
              </strong>
            </div>

          </div>


          <div
            style={{
              marginTop: "20px",
            }}
          >
            <div className="accountInfoCard">

              <small>
                STATUS
              </small>

              <strong>
                {statusText(
                  order.payment_status
                )}
              </strong>

            </div>
          </div>

        </section>


        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              DEELNAME
            </small>

            <h2>
              Gespeelde nummers
            </h2>

          </div>


          {!entries ||
          entries.length === 0 ? (

            <div className="emptyState">
              Geen gespeelde nummers
              gevonden.
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

        </section>


        {order.payment_status ===
          "pending" && (

          <section className="standardSection">

            <div className="sectionHeading noCardHeading">

              <small>
                BETALING CONTROLEREN
              </small>

              <h2>
                Klopt de betaling?
              </h2>

              <p>
                Controleer in bunq of exact{" "}
                <strong>
                  {money(
                    Number(
                      order.total_amount ||
                        0
                    )
                  )}
                </strong>{" "}
                is ontvangen met
                betaalreferentie{" "}
                <strong>
                  {order.payment_reference}
                </strong>.
              </p>

            </div>


            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >

              <form action={approveOrder}>

                <button
                  type="submit"
                  className="primaryButton"
                >
                  Betaling goedkeuren
                </button>

              </form>


              <form action={rejectOrder}>

                <button
                  type="submit"
                  className="accountButton adminBackButton"
                >
                  Betaling afwijzen
                </button>

              </form>

            </div>

          </section>

        )}


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
