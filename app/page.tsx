"use client";

import { useMemo, useState } from "react";

type Language = "nl" | "pap" | "en";
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

const createPlay = (): Play => ({
  id: nextId++,
  number: "",
  stake: "",
});

const translations = {
  nl: {
    play: "Spelen",
    results: "Uitslagen",
    how: "Hoe werkt het?",
    account: "Mijn account",
    tag: "WEGI NUMBER KÒRSOU",
    title1: "Kies jouw nummers.",
    title2: "Speel mee.",
    subtitle:
      "Kies zelf je 4-, 3- of 2-cijferige nummers en bepaal je inzet per nummer.",
    playNow: "Speel nu",
    yourNumbers: "Jouw nummers",
    help:
      "Vul je nummers en inzet in. Bij een 4-cijferig nummer worden de laatste 3 en 2 cijfers automatisch voorgesteld.",
    four: "4 cijfers",
    three: "3 cijfers",
    two: "2 cijfers",
    number: "Nummer",
    stake: "Inzet",
    add: "+ Nummer",
    overview: "Mijn speeloverzicht",
    noNumbers: "Nog geen volledig ingevulde nummers met inzet.",
    game: "Spel",
    total: "Totaal",
    continue: "Verder",
    latestResults: "Laatste uitslagen",
    first: "1e prijs",
    second: "2e prijs",
    third: "3e prijs",
    noResult: "Nog geen uitslag",
  },

  pap: {
    play: "Hunga",
    results: "Resultado",
    how: "Kon e ta funshoná?",
    account: "Mi kuenta",
    tag: "WEGI NUMBER KÒRSOU",
    title1: "Skohé bo numbernan.",
    title2: "Hunga ku nos.",
    subtitle:
      "Skohé bo number di 4, 3 òf 2 sifra i determiná bo apuesta pa kada number.",
    playNow: "Hunga awor",
    yourNumbers: "Bo numbernan",
    help:
      "Yena bo number i apuesta. Ora bo yena 4 sifra, e último 3 i 2 sifranan ta wordu sugerí.",
    four: "4 sifra",
    three: "3 sifra",
    two: "2 sifra",
    number: "Number",
    stake: "Apuesta",
    add: "+ Number",
    overview: "Resúmen di bo wega",
    noNumbers: "No tin number kompletá ku apuesta ainda.",
    game: "Wega",
    total: "Total",
    continue: "Sigui",
    latestResults: "Último resultadonan",
    first: "1er premio",
    second: "2do premio",
    third: "3er premio",
    noResult: "No tin resultado ainda",
  },

  en: {
    play: "Play",
    results: "Results",
    how: "How does it work?",
    account: "My account",
    tag: "WEGI NUMBER KÒRSOU",
    title1: "Choose your numbers.",
    title2: "Play along.",
    subtitle:
      "Choose your own 4-, 3- or 2-digit numbers and set the stake for each number.",
    playNow: "Play now",
    yourNumbers: "Your numbers",
    help:
      "Enter your numbers and stake. A 4-digit number automatically suggests its last 3 and 2 digits.",
    four: "4 digits",
    three: "3 digits",
    two: "2 digits",
    number: "Number",
    stake: "Stake",
    add: "+ Number",
    overview: "My play overview",
    noNumbers: "No complete numbers with a stake yet.",
    game: "Game",
    total: "Total",
    continue: "Continue",
    latestResults: "Latest results",
    first: "1st prize",
    second: "2nd prize",
    third: "3rd prize",
    noResult: "No result yet",
  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("nl");

  const [games, setGames] = useState<Games>({
    4: [createPlay()],
    3: [createPlay()],
    2: [createPlay()],
  });

  const t = translations[language];

  function addNumber(type: GameType) {
    setGames((current) => ({
      ...current,
      [type]: [...current[type], createPlay()],
    }));
  }

  function removeNumber(type: GameType, id: number) {
    setGames((current) => {
      const group = current[type];

      if (group.length === 1) {
        return {
          ...current,
          [type]: [
            {
              ...group[0],
              number: "",
              stake: "",
              suggestedFrom: undefined,
            },
          ],
        };
      }

      return {
        ...current,
        [type]: group.filter((play) => play.id !== id),
      };
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
        4: current[4].map((p) => ({ ...p })),
        3: current[3].map((p) => ({ ...p })),
        2: current[2].map((p) => ({ ...p })),
      };

      const play = updated[type].find((p) => p.id === id);

      if (!play) return current;

      play.number = clean;

      /*
       * Bij 4 cijfers:
       * zoek per groep naar een bestaande suggestie van
       * dit nummer. Bestaat die niet, gebruik dan eerst
       * een lege regel. Anders maken we een nieuwe regel.
       */
      if (type === 4) {
        updateSuggestion(updated, 3, id, clean);
        updateSuggestion(updated, 2, id, clean);
      } else {
        // Zodra gebruiker zelf wijzigt, is het geen
        // automatische suggestie meer.
        play.suggestedFrom = undefined;
      }

      return updated;
    });
  }

  function updateSuggestion(
    games: Games,
    type: 3 | 2,
    sourceId: number,
    fourDigitValue: string
  ) {
    const suggestion =
      fourDigitValue.length === 4
        ? fourDigitValue.slice(-type)
        : "";

    const existing = games[type].find(
      (play) => play.suggestedFrom === sourceId
    );

    if (existing) {
      existing.number = suggestion;

      if (!suggestion && !existing.stake) {
        existing.suggestedFrom = undefined;
      }

      return;
    }

    if (!suggestion) return;

    const empty = games[type].find(
      (play) =>
        play.number === "" &&
        play.stake === "" &&
        play.suggestedFrom === undefined
    );

    if (empty) {
      empty.number = suggestion;
      empty.suggestedFrom = sourceId;
      return;
    }

    games[type].push({
      id: nextId++,
      number: suggestion,
      stake: "",
      suggestedFrom: sourceId,
    });
  }

  function updateStake(
    type: GameType,
    id: number,
    value: string
  ) {
    let clean = value.replace(/[^0-9,.]/g, "");

    const separator = clean.search(/[,.]/);

    if (separator >= 0) {
      const before = clean
        .slice(0, separator)
        .replace(/[,.]/g, "");

      const after = clean
        .slice(separator + 1)
        .replace(/[,.]/g, "")
        .slice(0, 2);

      clean = `${before},${after}`;
    }

    setGames((current) => ({
      ...current,
      [type]: current[type].map((play) =>
        play.id === id
          ? { ...play, stake: clean }
          : play
      ),
    }));
  }

  function amount(value: string) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const selected = useMemo(() => {
    const result: {
      id: number;
      digits: GameType;
      number: string;
      stake: number;
    }[] = [];

    ([4, 3, 2] as GameType[]).forEach((type) => {
      games[type].forEach((play) => {
        if (
          play.number.length === type &&
          amount(play.stake) > 0
        ) {
          result.push({
            id: play.id,
            digits: type,
            number: play.number,
            stake: amount(play.stake),
          });
        }
      });
    });

    return result;
  }, [games]);

  const total = selected.reduce(
    (sum, play) => sum + play.stake,
    0
  );

  const euro = (value: number) =>
    new Intl.NumberFormat(
      language === "en" ? "en-IE" : "nl-NL",
      {
        style: "currency",
        currency: "EUR",
      }
    ).format(value);

  return (
    <main>
      <header className="topbar">
        <a className="logo" href="/">
          <span className="star">★</span>

          <div>
            <strong>WEGI NUMBER KÒRSOU</strong>
            <small>WNKNL</small>
          </div>
        </a>

        <nav>
          <a href="#spelen">{t.play}</a>
          <a href="#uitslagen">{t.results}</a>

          {/* Dit wordt onze aparte spelregelpagina */}
          <a href="/hoe-werkt-het">{t.how}</a>

          <button className="accountLink">
            {t.account}
          </button>

          <select
            className="language"
            value={language}
            onChange={(event) =>
              setLanguage(event.target.value as Language)
            }
            aria-label="Taal"
          >
            <option value="pap">PAP</option>
            <option value="nl">NL</option>
            <option value="en">EN</option>
          </select>
        </nav>
      </header>

      <div className="page">
        <section className="hero">
          <div className="heroCopy">
            <span className="tag">{t.tag}</span>

            <h1>
              {t.title1}
              <span>{t.title2}</span>
            </h1>

            <p>{t.subtitle}</p>

            <a href="#spelen" className="yellowButton">
              {t.playNow} →
            </a>
          </div>

          <div className="flagNumbers" aria-hidden="true">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
        </section>

        <section className="panel" id="spelen">
          <div className="panelHeading">
            <div>
              <span className="eyebrow">{t.play}</span>
              <h2>{t.yourNumbers}</h2>
              <p>{t.help}</p>
            </div>
          </div>

          <div className="independentGames">
            <GameColumn
              type={4}
              title={t.four}
              numberLabel={t.number}
              stakeLabel={t.stake}
              addLabel={t.add}
              plays={games[4]}
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
              type={3}
              title={t.three}
              numberLabel={t.number}
              stakeLabel={t.stake}
              addLabel={t.add}
              plays={games[3]}
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
              type={2}
              title={t.two}
              numberLabel={t.number}
              stakeLabel={t.stake}
              addLabel={t.add}
              plays={games[2]}
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

        <section className="panel overviewPanel">
          <div className="overviewHeader">
            <div>
              <span className="eyebrow">
                {t.overview}
              </span>
              <h2>{t.overview}</h2>
            </div>

            <div className="bigTotal">
              <small>{t.total}</small>
              <strong>{euro(total)}</strong>
            </div>
          </div>

          {selected.length === 0 ? (
            <div className="emptyState">
              {t.noNumbers}
            </div>
          ) : (
            <div className="summaryTable">
              <div className="summaryHead">
                <span>{t.game}</span>
                <span>{t.number}</span>
                <span>{t.stake}</span>
              </div>

              {selected.map((play) => (
                <div
                  className="summaryRow"
                  key={`${play.digits}-${play.id}`}
                >
                  <span>
                    {play.digits}{" "}
                    {language === "pap"
                      ? "sifra"
                      : language === "en"
                      ? "digits"
                      : "cijfers"}
                  </span>

                  <strong>{play.number}</strong>

                  <span>{euro(play.stake)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="checkoutRow">
            <button
              className="checkoutButton"
              disabled={selected.length === 0}
            >
              {t.continue} →
            </button>
          </div>
        </section>

        <section
          className="resultsSection"
          id="uitslagen"
        >
          <div className="sectionTitle">
            <span className="eyebrow">
              {t.results}
            </span>
            <h2>{t.latestResults}</h2>
          </div>

          <div className="resultsGrid">
            <ResultCard
              title={t.first}
              noResult={t.noResult}
            />
            <ResultCard
              title={t.second}
              noResult={t.noResult}
            />
            <ResultCard
              title={t.third}
              noResult={t.noResult}
            />
          </div>
        </section>
      </div>

      <footer>
        <strong>
          <span>★</span> WEGI NUMBER KÒRSOU
        </strong>

        <span>WNKNL · 2026</span>
      </footer>
    </main>
  );
}

function GameColumn({
  type,
  title,
  numberLabel,
  stakeLabel,
  addLabel,
  plays,
  onAdd,
  onRemove,
  onNumber,
  onStake,
}: {
  type: GameType;
  title: string;
  numberLabel: string;
  stakeLabel: string;
  addLabel: string;
  plays: Play[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onNumber: (id: number, value: string) => void;
  onStake: (id: number, value: string) => void;
}) {
  return (
    <div className="gameColumn">
      <h3>{title}</h3>

      <div className="columnLabels">
        <span>{numberLabel}</span>
        <span>{stakeLabel} €</span>
        <span />
      </div>

      <div className="columnRows">
        {plays.map((play) => (
          <div className="columnEntry" key={play.id}>
            <input
              className={
                play.suggestedFrom
                  ? "suggested"
                  : ""
              }
              type="text"
              inputMode="numeric"
              maxLength={type}
              placeholder={"0".repeat(type)}
              value={play.number}
              onChange={(event) =>
                onNumber(play.id, event.target.value)
              }
            />

            <div className="moneyInput">
              <span>€</span>

              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={play.stake}
                onChange={(event) =>
                  onStake(play.id, event.target.value)
                }
              />
            </div>

            <button
              className="removeNumber"
              onClick={() => onRemove(play.id)}
              aria-label="Nummer verwijderen"
              title="Nummer verwijderen"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        className="columnAddButton"
        onClick={onAdd}
      >
        {addLabel}
      </button>
    </div>
  );
}

function ResultCard({
  title,
  noResult,
}: {
  title: string;
  noResult: string;
}) {
  return (
    <article className="resultCard">
      <span>{title}</span>

      <strong>
        <i>—</i>
        <i>—</i>
        <i>—</i>
        <i>—</i>
      </strong>

      <small>{noResult}</small>
    </article>
  );
}
