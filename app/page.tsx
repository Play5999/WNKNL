"use client";

import { useMemo, useState } from "react";

type GameType = 4 | 3 | 2;

type Play = {
  id: number;
  number: string;
  stake: string;
  suggestedFrom?: number;
};

type Games = {
  4: Play[];
  3: Play[];
  2: Play[];
};

let nextId = 10;

function newPlay(): Play {
  return {
    id: nextId++,
    number: "",
    stake: "",
  };
}

export default function Home() {
  const [games, setGames] = useState<Games>({
    4: [newPlay()],
    3: [newPlay()],
    2: [newPlay()],
  });

  function addNumber(type: GameType) {
    setGames((current) => ({
      ...current,
      [type]: [...current[type], newPlay()],
    }));
  }

  function removeNumber(type: GameType, id: number) {
    setGames((current) => {
      const updated: Games = {
        4: current[4].map((item) => ({ ...item })),
        3: current[3].map((item) => ({ ...item })),
        2: current[2].map((item) => ({ ...item })),
      };

      /*
        Als een 4-cijfernummer verwijderd wordt,
        verwijderen we ook de automatisch gekoppelde
        suggesties, zolang die nog automatisch zijn.
      */
      if (type === 4) {
        updated[3] = updated[3].filter(
          (item) => item.suggestedFrom !== id
        );

        updated[2] = updated[2].filter(
          (item) => item.suggestedFrom !== id
        );
      }

      updated[type] = updated[type].filter(
        (item) => item.id !== id
      );

      if (updated[type].length === 0) {
        updated[type] = [newPlay()];
      }

      return updated;
    });
  }

  function updateNumber(
    type: GameType,
    id: number,
    value: string
  ) {
    const clean = value
      .replace(/\D/g, "")
      .slice(0, type);

    setGames((current) => {
      const updated: Games = {
        4: current[4].map((item) => ({ ...item })),
        3: current[3].map((item) => ({ ...item })),
        2: current[2].map((item) => ({ ...item })),
      };

      const item = updated[type].find(
        (entry) => entry.id === id
      );

      if (!item) {
        return current;
      }

      item.number = clean;

      /*
        Als je zelf een 3- of 2-cijfernummer aanpast,
        is het vanaf dat moment geen automatische
        suggestie meer.
      */
      if (type === 3 || type === 2) {
        item.suggestedFrom = undefined;
        return updated;
      }

      /*
        Hier verwerken we een 4-cijfernummer.
      */
      ([3, 2] as const).forEach((targetType) => {
        const existingSuggestion =
          updated[targetType].find(
            (entry) => entry.suggestedFrom === id
          );

        /*
          Als het 4-cijfernummer nog niet compleet is,
          maken we de gekoppelde suggestie leeg.
        */
        if (clean.length !== 4) {
          if (existingSuggestion) {
            existingSuggestion.number = "";
          }

          return;
        }

        const suggestion = clean.slice(-targetType);

        /*
          Bestaat de automatische suggestie al?
          Dan wordt hij LIVE bijgewerkt.

          1234 -> 234 / 34
          1245 -> 245 / 45
        */
        if (existingSuggestion) {
          existingSuggestion.number = suggestion;
          return;
        }

        /*
          Gebruik eerst een volledig lege regel.
        */
        const emptyRow = updated[targetType].find(
          (entry) =>
            entry.number === "" &&
            entry.stake === "" &&
            entry.suggestedFrom === undefined
        );

        if (emptyRow) {
          emptyRow.number = suggestion;
          emptyRow.suggestedFrom = id;
          return;
        }

        /*
          Anders maken we automatisch een nieuwe regel.
        */
        updated[targetType].push({
          id: nextId++,
          number: suggestion,
          stake: "",
          suggestedFrom: id,
        });
      });

      return updated;
    });
  }

  function updateStake(
    type: GameType,
    id: number,
    value: string
  ) {
    const clean = value
      .replace(/[^0-9,.]/g, "")
      .replace(".", ",");

    setGames((current) => ({
      ...current,
      [type]: current[type].map((item) =>
        item.id === id
          ? {
              ...item,
              stake: clean,
            }
          : item
      ),
    }));
  }

  function toAmount(value: string) {
    const amount = Number(
      value.replace(",", ".")
    );

    return Number.isFinite(amount)
      ? amount
      : 0;
  }

  const selected = useMemo(() => {
    return ([4, 3, 2] as GameType[]).flatMap(
      (type) =>
        games[type]
          .filter(
            (item) =>
              item.number.length === type &&
              toAmount(item.stake) > 0
          )
          .map((item) => ({
            ...item,
            type,
          }))
    );
  }, [games]);

  const total = selected.reduce(
    (sum, item) => sum + toAmount(item.stake),
    0
  );

  return (
    <main>
      <div className="siteContainer pageContent">
        <section className="hero">
          <div className="heroContent">
            <span className="heroTag">
              WEGI NUMBER KÒRSOU
            </span>

            <h1>
              Kies jouw nummers.
              <span>Speel mee.</span>
            </h1>

            <p>
              Kies zelf je 4-, 3- of 2-cijferige nummers
              en bepaal je inzet per nummer.
            </p>

            <a href="#spelen" className="yellowButton">
              Speel nu →
            </a>
          </div>

          <div className="heroNumbers">
            <span>1</span>
            <span>2</span>
            <span className="yellowNumber">3</span>
            <span>4</span>
          </div>
        </section>

        <section className="contentCard" id="spelen">
          <div className="sectionHeading">
            <small>SPELEN</small>
            <h2>Jouw nummers</h2>

            <p>
              Vul je nummers en inzet in. Bij een
              4-cijferig nummer worden de laatste
              3 en 2 cijfers automatisch voorgesteld.
            </p>
          </div>

          <div className="gameColumns">
            <GameColumn
              title="4 cijfers"
              type={4}
              games={games[4]}
              onAdd={() => addNumber(4)}
              onRemove={(id) => removeNumber(4, id)}
              onNumber={(id, value) =>
                updateNumber(4, id, value)
              }
              onStake={(id, value) =>
                updateStake(4, id, value)
              }
            />

            <GameColumn
              title="3 cijfers"
              type={3}
              games={games[3]}
              onAdd={() => addNumber(3)}
              onRemove={(id) => removeNumber(3, id)}
              onNumber={(id, value) =>
                updateNumber(3, id, value)
              }
              onStake={(id, value) =>
                updateStake(3, id, value)
              }
            />

            <GameColumn
              title="2 cijfers"
              type={2}
              games={games[2]}
              onAdd={() => addNumber(2)}
              onRemove={(id) => removeNumber(2, id)}
              onNumber={(id, value) =>
                updateNumber(2, id, value)
              }
              onStake={(id, value) =>
                updateStake(2, id, value)
              }
            />
          </div>
        </section>

        <section className="contentCard overviewCard">
          <div className="overviewHeader">
            <div>
              <small>OVERZICHT</small>
              <h2>Jouw deelname</h2>
            </div>

            <div className="totalStake">
              <span>Totale inzet</span>

              <strong>
                €{" "}
                {total.toLocaleString("nl-NL", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>
          </div>

          {selected.length === 0 ? (
            <div className="emptyState">
              Nog geen volledig ingevulde nummers met inzet.
            </div>
          ) : (
            <div className="summaryList">
              {selected.map((item) => (
                <div
                  className="summaryRow"
                  key={`${item.type}-${item.id}`}
                >
                  <span>{item.type} cijfers</span>
                  <strong>{item.number}</strong>

                  <span>
                    €{" "}
                    {toAmount(item.stake).toLocaleString(
                      "nl-NL",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="continueArea">
            <button
              className="primaryButton"
              disabled={selected.length === 0}
            >
              Verder →
            </button>
          </div>
        </section>

        <section
          className="resultsSection"
          id="uitslagen"
        >
          <div className="sectionHeading noCardHeading">
            <small>UITSLAGEN</small>
            <h2>Laatste trekking</h2>
          </div>

          <div className="resultsGrid">
            <ResultCard title="1e prijs" />
            <ResultCard title="2e prijs" />
            <ResultCard title="3e prijs" />
          </div>
        </section>
      </div>
    </main>
  );
}

function GameColumn({
  title,
  type,
  games,
  onAdd,
  onRemove,
  onNumber,
  onStake,
}: {
  title: string;
  type: GameType;
  games: Play[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onNumber: (id: number, value: string) => void;
  onStake: (id: number, value: string) => void;
}) {
  return (
    <div className="gameColumn">
      <h3>{title}</h3>

      <div className="inputLabels">
        <span>Nummer</span>
        <span>Inzet</span>
        <span />
      </div>

      <div className="numberRows">
        {games.map((item) => (
          <div className="numberRow" key={item.id}>
            <input
              className={
                item.suggestedFrom
                  ? "numberInput suggestedInput"
                  : "numberInput"
              }
              type="text"
              inputMode="numeric"
              maxLength={type}
              placeholder={"0".repeat(type)}
              value={item.number}
              onChange={(event) =>
                onNumber(item.id, event.target.value)
              }
            />

            <div className="stakeInput">
              <span>€</span>

              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={item.stake}
                onChange={(event) =>
                  onStake(item.id, event.target.value)
                }
              />
            </div>

            <button
              className="deleteButton"
              onClick={() => onRemove(item.id)}
              aria-label="Nummer verwijderen"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button className="addButton" onClick={onAdd}>
        + Nummer
      </button>
    </div>
  );
}

function ResultCard({
  title,
}: {
  title: string;
}) {
  return (
    <article className="resultCard">
      <small>{title}</small>

      <div className="resultNumbers">
        <span>—</span>
        <span>—</span>
        <span>—</span>
        <span>—</span>
      </div>

      <p>Nog geen uitslag</p>
    </article>
  );
}
