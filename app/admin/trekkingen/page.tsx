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

function getTodayAmsterdam() {
  const parts =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Amsterdam",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

  const year =
    parts.find(
      (part) => part.type === "year"
    )?.value ?? "";

  const month =
    parts.find(
      (part) => part.type === "month"
    )?.value ?? "";

  const day =
    parts.find(
      (part) => part.type === "day"
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

export default async function DrawPage({
  searchParams,
}: {
  searchParams: Promise<{
    success?: string;
    winners?: string;
    payout?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;

  const supabase = await createClient();

  // =========================================================
  // LOGIN + ADMIN
  // =========================================================

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

  const today = getTodayAmsterdam();

  // =========================================================
  // RECENTE TREKKINGEN
  // =========================================================

  const { data: draws } =
    await supabase
      .from("draws")
      .select(`
        id,
        draw_date,
        first_prize,
        second_prize,
        third_prize,
        status,
        created_at
      `)
      .order("draw_date", {
        ascending: false,
      })
      .limit(10);

  // =========================================================
  // TREKKING VERWERKEN
  // =========================================================

  async function processDraw(
    formData: FormData
  ) {
    "use server";

    const supabase =
      await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    const drawDate = String(
      formData.get("draw_date") || ""
    );

    const firstPrize = String(
      formData.get("first_prize") || ""
    )
      .replace(/\D/g, "")
      .slice(0, 4);

    const secondPrize = String(
      formData.get("second_prize") || ""
    )
      .replace(/\D/g, "")
      .slice(0, 4);

    const thirdPrize = String(
      formData.get("third_prize") || ""
    )
      .replace(/\D/g, "")
      .slice(0, 4);

    if (
      !drawDate ||
      firstPrize.length !== 4 ||
      secondPrize.length !== 4 ||
      thirdPrize.length !== 4
    ) {
      redirect(
        "/admin/trekkingen?error=Controleer+de+datum+en+de+drie+trekkingsnummers"
      );
    }

    const {
      data,
      error,
    } = await supabase.rpc(
      "process_draw",
      {
        p_draw_date: drawDate,
        p_first_prize: firstPrize,
        p_second_prize: secondPrize,
        p_third_prize: thirdPrize,
      }
    );

    if (error) {
      redirect(
        `/admin/trekkingen?error=${encodeURIComponent(
          error.message
        )}`
      );
    }

    const result =
      Array.isArray(data)
        ? data[0]
        : data;

    const winners =
      Number(
        result?.winning_orders || 0
      );

    const payout =
      Number(
        result?.total_payout || 0
      );

    redirect(
      `/admin/trekkingen?success=1&winners=${winners}&payout=${payout}`
    );
  }

  return (
    <main>
      <div className="siteContainer standardPage">

        <section className="pageHero">

          <span className="heroTag">
            ADMIN · TREKKING
          </span>

          <h1>
            Trekking{" "}
            <span>verwerken</span>
          </h1>

          <p>
            Voer de drie winnende
            4-cijferige nummers in. Het
            systeem controleert daarna
            automatisch alle goedgekeurde
            deelnames.
          </p>

        </section>


        {params.success === "1" && (

          <section className="standardSection">

            <div className="infoNotice">

              <strong>
                Trekking succesvol verwerkt
              </strong>

              <br />
              <br />

              Winnende tickets:{" "}
              <strong>
                {Number(
                  params.winners || 0
                )}
              </strong>

              <br />

              Totaal uit te betalen:{" "}

              <strong>
                {money(
                  Number(
                    params.payout || 0
                  )
                )}
              </strong>

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
            TREKKING INVOEREN
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              NIEUWE TREKKING
            </small>

            <h2>
              Winnende nummers invoeren
            </h2>

            <p>
              Controleer de nummers goed.
              Een gepubliceerde trekking
              kan niet nogmaals worden
              verwerkt.
            </p>

          </div>


          <form action={processDraw}>

            <div className="accountGrid">

              <div className="accountInfoCard">

                <small>
                  TREKKINGSDATUM
                </small>

                <input
                  type="date"
                  name="draw_date"
                  defaultValue={today}
                  required
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "13px",
                    border:
                      "1px solid #d8dee9",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                />

              </div>


              <div className="accountInfoCard">

                <small>
                  1E PRIJS
                </small>

                <input
                  type="text"
                  name="first_prize"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  placeholder="7734"
                  required
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "13px",
                    border:
                      "1px solid #d8dee9",
                    borderRadius: "8px",
                    fontSize: "22px",
                    fontWeight: 800,
                    letterSpacing: "4px",
                  }}
                />

              </div>


              <div className="accountInfoCard">

                <small>
                  2E PRIJS
                </small>

                <input
                  type="text"
                  name="second_prize"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  placeholder="2189"
                  required
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "13px",
                    border:
                      "1px solid #d8dee9",
                    borderRadius: "8px",
                    fontSize: "22px",
                    fontWeight: 800,
                    letterSpacing: "4px",
                  }}
                />

              </div>

            </div>


            <div
              style={{
                marginTop: "15px",
                maxWidth: "360px",
              }}
            >

              <div className="accountInfoCard">

                <small>
                  3E PRIJS
                </small>

                <input
                  type="text"
                  name="third_prize"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  placeholder="5567"
                  required
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    padding: "13px",
                    border:
                      "1px solid #d8dee9",
                    borderRadius: "8px",
                    fontSize: "22px",
                    fontWeight: 800,
                    letterSpacing: "4px",
                  }}
                />

              </div>

            </div>


            <div
              className="infoNotice"
              style={{
                marginTop: "20px",
              }}
            >

              <strong>
                Let op
              </strong>

              <br />
              <br />

              Alleen goedgekeurde
              betalingen voor deze
              trekkingsdatum worden
              gecontroleerd.

            </div>


            <div
              style={{
                marginTop: "20px",
              }}
            >

              <button
                type="submit"
                className="primaryButton"
              >
                Trekking verwerken →
              </button>

            </div>

          </form>

        </section>


        {/* =================================================
            EERDERE TREKKINGEN
        ================================================= */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">

            <small>
              HISTORIE
            </small>

            <h2>
              Recente trekkingen
            </h2>

          </div>


          {!draws ||
          draws.length === 0 ? (

            <div className="emptyState">
              Nog geen trekkingen.
            </div>

          ) : (

            <div className="tableWrapper">

              <table className="siteTable">

                <thead>
                  <tr>
                    <th>Datum</th>
                    <th>1e</th>
                    <th>2e</th>
                    <th>3e</th>
                    <th>Status</th>
                  </tr>
                </thead>


                <tbody>

                  {draws.map((draw) => (

                    <tr key={draw.id}>

                      <td>
                        {draw.draw_date}
                      </td>

                      <td>
                        <strong>
                          {draw.first_prize}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {draw.second_prize}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {draw.third_prize}
                        </strong>
                      </td>

                      <td>
                        {draw.status ===
                        "published"
                          ? "Verwerkt"
                          : "In behandeling"}
                      </td>

                    </tr>

                  ))}

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
