import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function DrawNumber({ number }: { number: string }) {
  const digits = String(number).padStart(4, "0").slice(-4).split("");

  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {digits.map((digit, index) => (
        <span
          key={index}
          style={{
            width: "32px",
            height: "38px",
            display: "grid",
            placeItems: "center",
            borderRadius: "6px",
            background: "#063b87",
            color: "#ffd500",
            fontWeight: 900,
            fontSize: "17px",
          }}
        >
          {digit}
        </span>
      ))}
    </div>
  );
}

export default async function ResultsPage() {
  const supabase = await createClient();

  const { data: draws, error } = await supabase
    .from("draws")
    .select("id, draw_date, first_prize, second_prize, third_prize, status")
    .eq("status", "published")
    .order("draw_date", { ascending: false });

  return (
    <main>
      <div className="siteContainer standardPage">
        <section className="pageHero">
          <span className="heroTag">UITSLAGENARCHIEF</span>
          <h1>
            Alle <span>uitslagen</span>
          </h1>
          <p>Bekijk hier alle gepubliceerde trekkingen van WNKNL.</p>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "18px",
            }}
          >
            <Link href="/#spelen" className="yellowButton">
              ← Lot kopen
            </Link>

            <Link href="/account" className="primaryButton">
              Mijn account
            </Link>
          </div>
        </section>

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>ARCHIEF</small>
            <h2>Gepubliceerde trekkingen</h2>
          </div>

          {error ? (
            <div className="loginError">
              De uitslagen konden niet worden geladen.
            </div>
          ) : !draws || draws.length === 0 ? (
            <div className="emptyState">
              Er zijn nog geen gepubliceerde uitslagen.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {draws.map((draw) => (
                <article
                  key={draw.id}
                  className="contentCard"
                  style={{ padding: "18px 20px", margin: 0 }}
                >
                  <strong style={{ display: "block", marginBottom: "14px" }}>
                    Trekking · {formatDate(draw.draw_date)}
                  </strong>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <small>1e prijs</small>
                      <div style={{ marginTop: "7px" }}>
                        <DrawNumber number={draw.first_prize} />
                      </div>
                    </div>

                    <div>
                      <small>2e prijs</small>
                      <div style={{ marginTop: "7px" }}>
                        <DrawNumber number={draw.second_prize} />
                      </div>
                    </div>

                    <div>
                      <small>3e prijs</small>
                      <div style={{ marginTop: "7px" }}>
                        <DrawNumber number={draw.third_prize} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            margin: "24px 0",
          }}
        >
          <Link href="/#spelen" className="yellowButton">
            ← Terug naar spelen
          </Link>

          <Link href="/account" className="primaryButton">
            Mijn account
          </Link>
        </div>
      </div>
    </main>
  );
}
