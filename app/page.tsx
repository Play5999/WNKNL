"use client";

import { useMemo, useState } from "react";

type NumberPlay = {
  number: string;
  stake: string;
  manuallyChanged: boolean;
};

type PlayRow = {
  id: number;
  four: NumberPlay;
  three: NumberPlay;
  two: NumberPlay;
};

let nextId = 2;

const emptyPlay = (): NumberPlay => ({
  number: "",
  stake: "",
  manuallyChanged: false,
});

export default function Home() {
  const [rows, setRows] = useState<PlayRow[]>([
    {
      id: 1,
      four: emptyPlay(),
      three: emptyPlay(),
      two: emptyPlay(),
    },
  ]);

  function addRow() {
    setRows((current) => [
      ...current,
      {
        id: nextId++,
        four: emptyPlay(),
        three: emptyPlay(),
        two: emptyPlay(),
      },
    ]);
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function updateNumber(
    rowId: number,
    type: "four" | "three" | "two",
    value: string
  ) {
    const maxLength =
      type === "four" ? 4 :
      type === "three" ? 3 : 2;

    const cleanValue = value.replace(/\D/g, "").slice(0, maxLength);

    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        if (type === "four") {
          const updatedFour = {
            ...row.four,
            number: cleanValue,
          };

          let updatedThree = row.three;
          let updatedTwo = row.two;

          if (cleanValue.length === 4) {
            if (!row.three.manuallyChanged) {
              updatedThree = {
                ...row.three,
                number: cleanValue.slice(-3),
              };
            }

            if (!row.two.manuallyChanged) {
              updatedTwo = {
                ...row.two,
                number: cleanValue.slice(-2),
              };
            }
          } else {
            if (!row.three.manuallyChanged) {
              updatedThree = {
                ...row.three,
                number: "",
              };
            }

            if (!row.two.manuallyChanged) {
              updatedTwo = {
                ...row.two,
                number: "",
              };
            }
          }

          return {
            ...row,
            four: updatedFour,
            three: updatedThree,
            two: updatedTwo,
          };
        }

        return {
          ...row,
          [type]: {
            ...row[type],
            number: cleanValue,
            manuallyChanged: true,
          },
        };
      })
    );
  }

  function updateStake(
    rowId: number,
    type: "four" | "three" | "two",
    value: string
  ) {
    const cleanValue = value
      .replace(/[^0-9,.]/g, "")
      .replace(".", ",");

    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [type]: {
                ...row[type],
                stake: cleanValue,
              },
            }
          : row
      )
    );
  }

  function stakeToNumber(value: string) {
    const number = Number(value.replace(",", "."));
    return Number.isFinite(number) ? number : 0;
  }

  const total = useMemo(() => {
    return rows.reduce(
      (grandTotal, row) =>
        grandTotal +
        stakeToNumber(row.four.stake) +
        stakeToNumber(row.three.stake) +
        stakeToNumber(row.two.stake),
      0
    );
  }, [rows]);

  const playedNumbers = useMemo(() => {
    return rows.reduce((count, row) => {
      let amount = count;

      if (
        row.four.number.length === 4 &&
        stakeToNumber(row.four.stake) > 0
      ) {
        amount++;
      }

      if (
        row.three.number.length === 3 &&
        stakeToNumber(row.three.stake) > 0
      ) {
        amount++;
      }

      if (
        row.two.number.length === 2 &&
        stakeToNumber(row.two.stake) > 0
      ) {
        amount++;
      }

      return amount;
    }, 0);
  }, [rows]);

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

        <button className="accountButton">
          Mijn account
        </button>
      </header>

      <section className="hero">
        <div className="heroText">
          <span className="badge">
            DAGELIJKSE TREKKING
          </span>

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

          <h2>
            Speel mee met de volgende trekking
          </h2>

          <p>
            Vul je nummer en inzet in. Bij een 4-cijferig
            nummer worden de laatste 3 en 2 cijfers automatisch
            voorgesteld.
          </p>
        </div>

        <div className="playLayout">
          <div className="playCard">
            <div className="playCardHeader">
              <div>
                <span className="smallLabel">
                  VANDAAG
                </span>

                <h3>Jouw nummers</h3>
              </div>

              <div className="drawStatus">
                <span className="statusDot"></span>
                Inzetten open
              </div>
            </div>

            <div className="playTable">
              <div className="playTableHeader">
                <div>4 CIJFERS</div>
                <div>3 CIJFERS</div>
                <div>2 CIJFERS</div>
                <div></div>
              </div>

              {rows.map((row) => (
                <div className="completePlayRow" key={row.id}>
                  <NumberWithStake
                    digits={4}
                    number={row.four.number}
                    stake={row.four.stake}
                    suggested={false}
                    onNumberChange={(value) =>
                      updateNumber(row.id, "four", value)
                    }
                    onStakeChange={(value) =>
                      updateStake(row.id, "four", value)
                    }
                  />

                  <NumberWithStake
                    digits={3}
                    number={row.three.number}
                    stake={row.three.stake}
                    suggested={
                      row.four.number.length === 4 &&
                      !row.three.manuallyChanged
                    }
                    onNumberChange={(value) =>
                      updateNumber(row.id, "three", value)
                    }
                    onStakeChange={(value) =>
                      updateStake(row.id, "three", value)
                    }
                  />

                  <NumberWithStake
                    digits={2}
                    number={row.two.number}
                    stake={row.two.stake}
                    suggested={
                      row.four.number.length === 4 &&
                      !row.two.manuallyChanged
                    }
                    onNumberChange={(value) =>
                      updateNumber(row.id, "two", value)
                    }
                    onStakeChange={(value) =>
                      updateStake(row.id, "two", value)
                    }
                  />

                  <button
                    className="deleteRowButton"
                    onClick={() => removeRow(row.id)}
                    aria-label="Rij verwijderen"
                    title="Rij verwijderen"
                  >
                    ×
                  </button>
                </div>
              ))}

              <div className="addRowArea">
                <button
                  className="addRowButton"
                  onClick={addRow}
                >
                  + Rij toevoegen
                </button>
              </div>
            </div>
          </div>

          <aside className="summaryCard">
            <span className="smallLabel">
              OVERZICHT
            </span>

            <h3>Jouw deelname</h3>

            <div className="summaryLine">
              <span>Gespeelde nummers</span>
              <strong>{playedNumbers}</strong>
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
            Kies je nummers, bepaal je inzet en controleer
            na de trekking of jouw nummer gewonnen heeft.
          </p>
        </div>

        <div className="steps">
          <div>
            <b>01</b>
            <h3>Kies je nummer</h3>
            <p>
              Kies één of meerdere 4-, 3- of
              2-cijferige nummers.
            </p>
          </div>

          <div>
            <b>02</b>
            <h3>Kies je inzet</h3>
            <p>
              Elk nummer heeft zijn eigen inzet.
              Je totale inzet wordt automatisch berekend.
            </p>
          </div>

          <div>
            <b>03</b>
            <h3>Bekijk de uitslag</h3>
            <p>
              Na de trekking worden jouw nummers
              met de uitslag vergeleken.
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

function NumberWithStake({
  digits,
  number,
  stake,
  suggested,
  onNumberChange,
  onStakeChange,
}: {
  digits: number;
  number: string;
  stake: string;
  suggested: boolean;
  onNumberChange: (value: string) => void;
  onStakeChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="numberStakeRow">
        <input
          className={`numberInput ${
            suggested ? "suggestedNumber" : ""
          }`}
          type="text"
          inputMode="numeric"
          maxLength={digits}
          placeholder={"0".repeat(digits)}
          value={number}
          onChange={(event) =>
            onNumberChange(event.target.value)
          }
        />

        <div className="stakeInput">
          <span>€</span>

          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={stake}
            onChange={(event) =>
              onStakeChange(event.target.value)
            }
          />
        </div>
      </div>

      {suggested && (
        <span className="suggestedLabel">
          Suggestie
        </span>
      )}
    </div>
  );
}
