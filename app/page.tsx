"use client";

import { useMemo, useState } from "react";

type Play = {
  id: number;
  number: string;
  stake: string;
};

type Plays = {
  4: Play[];
  3: Play[];
  2: Play[];
};

let nextId = 10;

export default function Home() {
  const [plays, setPlays] = useState<Plays>({
    4: [{ id: 1, number: "", stake: "" }],
    3: [{ id: 2, number: "", stake: "" }],
    2: [{ id: 3, number: "", stake: "" }],
  });

  function addNumber(type: 2 | 3 | 4, number = "") {
    setPlays((current) => ({
      ...current,
      [type]: [
        ...current[type],
        {
          id: nextId++,
          number,
          stake: "",
        },
      ],
    }));
  }

  function updatePlay(
    type: 2 | 3 | 4,
    id: number,
    field: "number" | "stake",
    value: string
  ) {
    setPlays((current) => ({
      ...current,
      [type]: current[type].map((play) => {
        if (play.id !== id) return play;

        if (field === "number") {
          value = value.replace(/\D/g, "").slice(0, type);
        }

        return {
          ...play,
          [field]: value,
        };
      }),
    }));
  }

  function numberAlreadyExists(type: 2 | 3, number: string) {
    return plays[type].some((play) => play.number === number);
  }

  const allPlays = [...plays[4], ...plays[3], ...plays[2]];

  const activePlays = allPlays.filter((play) => {
    const stake = Number(play.stake.replace(",", "."));
    return play.number !== "" && stake > 0;
  });

  const total = useMemo(() => {
    return allPlays.reduce((sum, play) => {
      const amount = Number(play.stake.replace(",", "."));
      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [plays]);

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
            Kies je nummers en bepaal zelf hoeveel je per nummer wilt inzetten.
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

            <div className="numberColumns">
              {/* 4 CIJFERS */}
              <div className="numberColumn">
                <div className="columnTitle">
                  <strong>4 CIJFERS</strong>
                </div>

                {plays[4].map((play) => {
                  const complete = play.number.length === 4;
                  const suggested3 = complete ? play.number.slice(-3) : "";
                  const suggested2 = complete ? play.number.slice(-2) : "";

                  return (
                    <div className="fourNumberBlock" key={play.id}>
                      <div className="numberStakeRow">
                        <input
                          className="numberInput"
                          value={play.number}
                          inputMode="numeric"
                          maxLength={4}
                          placeholder="0000"
                          onChange={(event) =>
                            updatePlay(
                              4,
                              play.id,
                              "number",
                              event.target.value
                            )
                          }
                        />

                        <div className="stakeInput">
                          <span>€</span>
                          <input
                            value={play.stake}
                            inputMode="decimal"
                            placeholder="0,00"
                            onChange={(event) =>
                              updatePlay(
                                4,
                                play.id,
                                "stake",
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {complete && (
                        <div className="mobileSuggestions">
                          <span>Suggesties:</span>
                          <button
                            disabled={numberAlreadyExists(3, suggested3)}
                            onClick={() => addNumber(3, suggested3)}
                          >
                            + Speel {suggested3}
                          </button>

                          <button
                            disabled={numberAlreadyExists(2, suggested2)}
                            onClick={() => addNumber(2, suggested2)}
                          >
                            + Speel {suggested2}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  className="addNumberButton"
                  onClick={() => addNumber(4)}
                >
                  + nummer
                </button>
              </div>

              {/* 3 CIJFERS */}
              <div className="numberColumn">
                <div className="columnTitle">
                  <strong>3 CIJFERS</strong>
                </div>

                {plays[3].map((play) => (
                  <div className="numberStakeRow" key={play.id}>
                    <input
                      className="numberInput"
                      value={play.number}
                      inputMode="numeric"
                      maxLength={3}
                      placeholder="000"
                      onChange={(event) =>
                        updatePlay(3, play.id, "number", event.target.value)
                      }
                    />

                    <div className="stakeInput">
                      <span>€</span>
                      <input
                        value={play.stake}
                        inputMode="decimal"
                        placeholder="0,00"
                        onChange={(event) =>
                          updatePlay(3, play.id, "stake", event.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}

                {plays[4].map((play) => {
                  if (play.number.length !== 4) return null;

                  const suggestion = play.number.slice(-3);

                  if (numberAlreadyExists(3, suggestion)) return null;

                  return (
                    <button
                      key={`suggest3-${play.id}`}
                      className="suggestionButton"
                      onClick={() => addNumber(3, suggestion)}
                    >
                      ↳ + Speel {suggestion}
                    </button>
                  );
                })}

                <button
                  className="addNumberButton"
                  onClick={() => addNumber(3)}
                >
                  + nummer
                </button>
              </div>

              {/* 2 CIJFERS */}
              <div className="numberColumn">
                <div className="columnTitle">
                  <strong>2 CIJFERS</strong>
                </div>

                {plays[2].map((play) => (
                  <div className="numberStakeRow" key={play.id}>
                    <input
                      className="numberInput"
                      value={play.number}
                      inputMode="numeric"
                      maxLength={2}
                      placeholder="00"
                      onChange={(event) =>
                        updatePlay(2, play.id, "number", event.target.value)
                      }
                    />

                    <div className="stakeInput">
                      <span>€</span>
                      <input
                        value={play.stake}
                        inputMode="decimal"
                        placeholder="0,00"
                        onChange={(event) =>
                          updatePlay(2, play.id, "stake", event.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}

                {plays[4].map((play) => {
                  if (play.number.length !== 4) return null;

                  const suggestion = play.number.slice(-2);

                  if (numberAlreadyExists(2, suggestion)) return null;

                  return (
                    <button
                      key={`suggest2-${play.id}`}
                      className="suggestionButton"
                      onClick={() => addNumber(2, suggestion)}
                    >
                      ↳ + Speel {suggestion}
                    </button>
                  );
                })}

                <button
                  className="addNumberButton"
                  onClick={() => addNumber(2)}
                >
                  + nummer
                </button>
              </div>
            </div>
          </div>

          <aside className="summaryCard">
            <span className="smallLabel">OVERZICHT</span>
            <h3>Jouw deelname</h3>

            <div className="summaryLine">
              <span>Gespeelde nummers</span>
              <strong>{activePlays.length}</strong>
            </div>

            <div className="summaryLine">
              <span>Trekking</span>
              <strong>Vandaag</strong>
            </div>

            <div className="summaryTotal">
              <span>Totale inzet</span>
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
          <h2>Zo speel je WNKNL</h2>
          <p>
            Kies je nummers, bepaal je inzet en controleer na de trekking
            of jouw nummer gewonnen heeft.
          </p>
        </div>

        <div className="steps">
          <div>
            <b>01</b>
            <h3>Kies je nummer</h3>
            <p>
              Kies één of meerdere 4-, 3- of 2-cijferige nummers.
            </p>
          </div>

          <div>
            <b>02</b>
            <h3>Kies je inzet</h3>
            <p>
              Elk nummer heeft zijn eigen inzet. Je totale inzet wordt
              automatisch voor je berekend.
            </p>
          </div>

          <div>
            <b>03</b>
            <h3>Controleer de uitslag</h3>
            <p>
              Na de trekking worden jouw gespeelde nummers vergeleken met
              de uitslag.
            </p>
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
