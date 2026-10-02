"use client";

import { useMemo, useState } from "react";

type Play = {
  id: number;
  type: 2 | 3 | 4;
  number: string;
  stake: string;
};

export default function Home() {
  const [plays, setPlays] = useState<Play[]>([
    { id: 1, type: 4, number: "", stake: "" },
    { id: 2, type: 3, number: "", stake: "" },
    { id: 3, type: 2, number: "", stake: "" },
  ]);

  const total = useMemo(() => {
    return plays.reduce((sum, play) => {
      const amount = Number(play.stake.replace(",", "."));
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [plays]);

  function updatePlay(id: number, field: "number" | "stake", value: string) {
    setPlays((current) =>
      current.map((play) => {
        if (play.id !== id) return play;

        if (field === "number") {
          value = value.replace(/\D/g, "").slice(0, play.type);
        }

        return { ...play, [field]: value };
      })
    );
  }

  function addPlay(type: 2 | 3 | 4) {
    setPlays((current) => [
      ...current,
      {
        id: Date.now(),
        type,
        number: "",
        stake: "",
      },
    ]);
  }

  return (
    <main>
      <header className="siteHeader">
        <a className="brand" href="#">
          <div className="brandMark">W</div>

          <div>
            <strong>WNKNL</strong>
            <span>Wegi Number Kòrsou</span>
          </div>
        </a>

        <nav className="desktopNav">
          <a href="#">Home</a>
          <a href="#spelen">Spelen</a>
          <a href="#uitslagen">Uitslagen</a>
          <a href="#uitleg">Hoe werkt het?</a>
        </nav>

        <button className="accountButton">Mijn account</button>
      </header>

      <section className="hero">
        <div className="heroText">
          <span className="badge">DAGELIJKSE TREKKING</span>

          <h1>
            Kies jouw nummer.
            <br />
            <span>Speel mee.</span>
          </h1>

          <p>
            Speel jouw eigen 2-, 3- of 4-cijferige nummers.
            Jij kiest het nummer én je inzet.
          </p>

          <div className="heroButtons">
            <a className="primaryButton" href="#spelen">
              Speel nu
            </a>

            <a className="secondaryButton" href="#uitleg">
              Hoe werkt het?
            </a>
          </div>
        </div>

        <div className="heroNumbers">
          <span>1</span>
          <span>9</span>
          <span>3</span>
          <span>4</span>
        </div>
      </section>

      <section className="playArea" id="spelen">
        <div className="sectionHeading">
          <span>JOUW NUMMERS</span>
          <h2>Speel mee met de volgende trekking</h2>
          <p>
            Kies zelf je nummers en bepaal per nummer hoeveel je wilt inzetten.
          </p>
        </div>

        <div className="playLayout">
          <div className="playCard">
            <div className="playCardHeader">
              <div>
                <span className="smallLabel">VANDAAG</span>
                <h3>Jouw nummers</h3>
              </div>

              <div className="drawStatus">
                <span className="statusDot"></span>
                Inzetten open
              </div>
            </div>

            <div className="columnLabels">
              <span>Nummer</span>
              <span>Jouw keuze</span>
              <span>Inzet</span>
            </div>

            <div className="plays">
              {plays.map((play) => (
                <div className="playRow" key={play.id}>
                  <div className="numberType">
                    <strong>{play.type}</strong>
                    <div>
                      <b>{play.type} cijfers</b>
                      <small>Exact nummer</small>
                    </div>
                  </div>

                  <input
                    className="numberInput"
                    type="text"
                    inputMode="numeric"
                    value={play.number}
                    maxLength={play.type}
                    placeholder={"0".repeat(play.type)}
                    onChange={(event) =>
                      updatePlay(play.id, "number", event.target.value)
                    }
                  />

                  <div className="stakeInput">
                    <span>€</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={play.stake}
                      placeholder="0,00"
                      onChange={(event) =>
                        updatePlay(play.id, "stake", event.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="addNumbers">
              <span>Nummer toevoegen:</span>

              <div>
                <button onClick={() => addPlay(4)}>+ 4 cijfers</button>
                <button onClick={() => addPlay(3)}>+ 3 cijfers</button>
                <button onClick={() => addPlay(2)}>+ 2 cijfers</button>
              </div>
            </div>
          </div>

          <aside className="summaryCard">
            <span className="smallLabel">OVERZICHT</span>
            <h3>Jouw deelname</h3>

            <div className="summaryLine">
              <span>Aantal nummers</span>
              <strong>
                {
                  plays.filter(
                    (play) =>
                      play.number.length === play.type &&
                      Number(play.stake.replace(",", ".")) > 0
                  ).length
                }
              </strong>
            </div>

            <div className="summaryLine">
              <span>Trekking</span>
              <strong>Vandaag</strong>
            </div>

            <div className="summaryTotal">
              <span>Totaal</span>
              <strong>
                €{" "}
                {total.toLocaleString("nl-NL", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            <button className="continueButton">
              Verder
              <span>→</span>
            </button>

            <p className="loginNote">
              Je logt in voordat je jouw deelname bevestigt.
            </p>
          </aside>
        </div>
      </section>

      <section className="resultsSection" id="uitslagen">
        <div className="sectionHeading">
          <span>UITSLAGEN</span>
          <h2>Laatste trekking</h2>
        </div>

        <div className="resultCards">
          <div className="resultCard">
            <span>1e prijs</span>
            <div>— — — —</div>
          </div>

          <div className="resultCard">
            <span>2e prijs</span>
            <div>— — — —</div>
          </div>

          <div className="resultCard">
            <span>3e prijs</span>
            <div>— — — —</div>
          </div>
        </div>
      </section>

      <section className="howSection" id="uitleg">
        <div className="sectionHeading">
          <span>HOE WERKT HET?</span>
          <h2>Spelen in drie stappen</h2>
        </div>

        <div className="steps">
          <div>
            <b>01</b>
            <h3>Kies je nummer</h3>
            <p>Speel een 2-, 3- of 4-cijferig nummer.</p>
          </div>

          <div>
            <b>02</b>
            <h3>Bepaal je inzet</h3>
            <p>Je kiest zelf hoeveel je per nummer wilt inzetten.</p>
          </div>

          <div>
            <b>03</b>
            <h3>Bekijk de uitslag</h3>
            <p>Na de trekking zie je de uitslag in je account.</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="brand footerBrand">
          <div className="brandMark">W</div>
          <div>
            <strong>WNKNL</strong>
            <span>Wegi Number Kòrsou</span>
          </div>
        </div>

        <p>© 2026 WNKNL</p>
      </footer>
    </main>
  );
}
