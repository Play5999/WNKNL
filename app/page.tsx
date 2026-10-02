"use client";

import { useMemo, useState } from "react";

type Language = "nl" | "pap" | "en";

type NumberPlay = {
  number: string;
  stake: string;
  manual: boolean;
};

type PlayRow = {
  id: number;
  four: NumberPlay;
  three: NumberPlay;
  two: NumberPlay;
};

const emptyPlay = (): NumberPlay => ({
  number: "",
  stake: "",
  manual: false,
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
      "Vul je nummers en inzet in euro per nummer in. Bekijk daarna je speeloverzicht.",
    playNow: "Speel nu",
    yourNumbers: "Jouw nummers",
    numberHelp:
      "Vul een 4-cijferig nummer in. De laatste 3 en 2 cijfers worden automatisch voorgesteld.",
    four: "4 cijfers",
    three: "3 cijfers",
    two: "2 cijfers",
    number: "Nummer",
    stake: "Inzet",
    addRow: "+ Rij toevoegen",
    overview: "Mijn speeloverzicht",
    noNumbers: "Nog geen volledig ingevulde nummers met inzet.",
    game: "Spel",
    total: "Totaal",
    continue: "Verder",
    latestResults: "Laatste uitslagen",
    first: "1e prijs",
    second: "2e prijs",
    third: "3e prijs",
    rulesTitle: "Hoe werkt het?",
    rulesIntro:
      "Hier leggen we uit hoe je speelt, wanneer een nummer wint en hoe de prijs wordt berekend.",
    chooseTitle: "Kies je nummers",
    chooseText:
      "Je kunt 4-, 3- en 2-cijferige nummers spelen. Je bepaalt zelf de inzet per nummer.",
    winTitle: "Controleer de uitslag",
    winText:
      "Na de trekking vergelijken we jouw gespeelde nummers met de officiële uitslag.",
    prizeTitle: "Bekijk je winst",
    prizeText:
      "Bij een winnend nummer wordt het gewonnen bedrag op basis van je inzet berekend en in je account getoond.",
    prizeTable: "Prijzentabel",
    prizeNote:
      "De definitieve uitbetalingsbedragen worden hier toegevoegd zodra de prijzentabel is vastgelegd.",
    remove: "Rij verwijderen",
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
      "Yena bo number i bo apuesta na euro pa kada number. Wak bo resúmen despues.",
    playNow: "Hunga awor",
    yourNumbers: "Bo numbernan",
    numberHelp:
      "Yena un number di 4 sifra. E último 3 i 2 sifranan ta wordu sugerí automátikamente.",
    four: "4 sifra",
    three: "3 sifra",
    two: "2 sifra",
    number: "Number",
    stake: "Apuesta",
    addRow: "+ Añadi un liña",
    overview: "Resúmen di bo wega",
    noNumbers: "No tin number kompletá ku apuesta ainda.",
    game: "Wega",
    total: "Total",
    continue: "Sigui",
    latestResults: "Último resultadonan",
    first: "1er premio",
    second: "2do premio",
    third: "3er premio",
    rulesTitle: "Kon e ta funshoná?",
    rulesIntro:
      "Aki nos ta splika kon pa hunga, kon bo ta gana i kon e premio ta wordu kalkulá.",
    chooseTitle: "Skohé bo numbernan",
    chooseText:
      "Bo por hunga number di 4, 3 òf 2 sifra. Bo ta skohe bo apuesta pa kada number.",
    winTitle: "Wak e resultado",
    winText:
      "Despues di e sorteo nos ta kompará bo numbernan ku e resultado ofisial.",
    prizeTitle: "Wak bo premio",
    prizeText:
      "Si bo number gana, e montante ganá ta wordu kalkulá segun bo apuesta.",
    prizeTable: "Tabla di premio",
    prizeNote:
      "E montantenan definitivo di premio lo wordu agregá despues ku e tabla ta definitivo.",
    remove: "Kita liña",
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
      "Enter your numbers and stake in euros for each number, then review your selection.",
    playNow: "Play now",
    yourNumbers: "Your numbers",
    numberHelp:
      "Enter a 4-digit number. The last 3 and 2 digits are automatically suggested.",
    four: "4 digits",
    three: "3 digits",
    two: "2 digits",
    number: "Number",
    stake: "Stake",
    addRow: "+ Add row",
    overview: "My play overview",
    noNumbers: "No complete numbers with a stake yet.",
    game: "Game",
    total: "Total",
    continue: "Continue",
    latestResults: "Latest results",
    first: "1st prize",
    second: "2nd prize",
    third: "3rd prize",
    rulesTitle: "How does it work?",
    rulesIntro:
      "Here we explain how to play, how a number wins and how winnings are calculated.",
    chooseTitle: "Choose your numbers",
    chooseText:
      "You can play 4-, 3- and 2-digit numbers and choose the stake for each number.",
    winTitle: "Check the result",
    winText:
      "After the draw, your played numbers are compared with the official result.",
    prizeTitle: "View your winnings",
    prizeText:
      "When a number wins, your winnings are calculated from your stake and shown in your account.",
    prizeTable: "Prize table",
    prizeNote:
      "The final payout amounts will be added here once the prize table has been finalized.",
    remove: "Remove row",
  },
};

let nextId = 2;

export default function Home() {
  const [language, setLanguage] = useState<Language>("nl");

  const [rows, setRows] = useState<PlayRow[]>([
    {
      id: 1,
      four: emptyPlay(),
      three: emptyPlay(),
      two: emptyPlay(),
    },
  ]);

  const t = translations[language];

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
    setRows((current) => {
      if (current.length === 1) {
        return [
          {
            id: current[0].id,
            four: emptyPlay(),
            three: emptyPlay(),
            two: emptyPlay(),
          },
        ];
      }

      return current.filter((row) => row.id !== id);
    });
  }

  function updateNumber(
    rowId: number,
    type: "four" | "three" | "two",
    value: string
  ) {
    const maxLength =
      type === "four" ? 4 : type === "three" ? 3 : 2;

    const clean = value.replace(/\D/g, "").slice(0, maxLength);

    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) return row;

        if (type === "four") {
          let three = row.three;
          let two = row.two;

          if (!three.manual) {
            three = {
              ...three,
              number: clean.length === 4 ? clean.slice(-3) : "",
            };
          }

          if (!two.manual) {
            two = {
              ...two,
              number: clean.length === 4 ? clean.slice(-2) : "",
            };
          }

          return {
            ...row,
            four: {
              ...row.four,
              number: clean,
            },
            three,
            two,
          };
        }

        return {
          ...row,
          [type]: {
            ...row[type],
            number: clean,
            manual: true,
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

    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [type]: {
                ...row[type],
                stake: clean,
              },
            }
          : row
      )
    );
  }

  function amount(value: string) {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const selected = useMemo(() => {
    const result: {
      digits: number;
      number: string;
      stake: number;
    }[] = [];

    rows.forEach((row) => {
      if (row.four.number.length === 4 && amount(row.four.stake) > 0) {
        result.push({
          digits: 4,
          number: row.four.number,
          stake: amount(row.four.stake),
        });
      }

      if (row.three.number.length === 3 && amount(row.three.stake) > 0) {
        result.push({
          digits: 3,
          number: row.three.number,
          stake: amount(row.three.stake),
        });
      }

      if (row.two.number.length === 2 && amount(row.two.stake) > 0) {
        result.push({
          digits: 2,
          number: row.two.number,
          stake: amount(row.two.stake),
        });
      }
    });

    return result;
  }, [rows]);

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
        <a className="logo" href="#">
          <span className="star">★</span>

          <div>
            <strong>WEGI NUMBER KÒRSOU</strong>
            <small>WNKNL</small>
          </div>
        </a>

        <nav>
          <a href="#spelen">{t.play}</a>
          <a href="#uitslagen">{t.results}</a>
          <a href="#uitleg">{t.how}</a>
          <button className="accountLink">{t.account}</button>

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
              <p>{t.numberHelp}</p>
            </div>
          </div>

          <div className="playTable">
            <div className="playHead">
              <GameHeading
                title={t.four}
                number={t.number}
                stake={t.stake}
              />

              <GameHeading
                title={t.three}
                number={t.number}
                stake={t.stake}
              />

              <GameHeading
                title={t.two}
                number={t.number}
                stake={t.stake}
              />

              <span />
            </div>

            {rows.map((row, index) => (
              <div className="playRow" key={row.id}>
                <PlayInput
                  label={t.four}
                  digits={4}
                  number={row.four.number}
                  stake={row.four.stake}
                  onNumber={(value) =>
                    updateNumber(row.id, "four", value)
                  }
                  onStake={(value) =>
                    updateStake(row.id, "four", value)
                  }
                />

                <PlayInput
                  label={t.three}
                  digits={3}
                  number={row.three.number}
                  stake={row.three.stake}
                  suggested={
                    row.four.number.length === 4 &&
                    !row.three.manual
                  }
                  onNumber={(value) =>
                    updateNumber(row.id, "three", value)
                  }
                  onStake={(value) =>
                    updateStake(row.id, "three", value)
                  }
                />

                <PlayInput
                  label={t.two}
                  digits={2}
                  number={row.two.number}
                  stake={row.two.stake}
                  suggested={
                    row.four.number.length === 4 &&
                    !row.two.manual
                  }
                  onNumber={(value) =>
                    updateNumber(row.id, "two", value)
                  }
                  onStake={(value) =>
                    updateStake(row.id, "two", value)
                  }
                />

                <button
                  className="removeRow"
                  onClick={() => removeRow(row.id)}
                  aria-label={`${t.remove} ${index + 1}`}
                  title={t.remove}
                >
                  ×
                </button>
              </div>
            ))}

            <div className="addRowWrapper">
              <button className="addRow" onClick={addRow}>
                {t.addRow}
              </button>
            </div>
          </div>
        </section>

        <section className="panel overviewPanel">
          <div className="overviewHeader">
            <div>
              <span className="eyebrow">{t.overview}</span>
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

              {selected.map((play, index) => (
                <div className="summaryRow" key={index}>
                  <span>{play.digits} {language === "pap" ? "sifra" : language === "en" ? "digits" : "cijfers"}</span>
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

        <section className="resultsSection" id="uitslagen">
          <div className="sectionTitle">
            <span className="eyebrow">{t.results}</span>
            <h2>{t.latestResults}</h2>
          </div>

          <div className="resultsGrid">
            <ResultCard title={t.first} />
            <ResultCard title={t.second} />
            <ResultCard title={t.third} />
          </div>
        </section>

        <section className="rulesSection" id="uitleg">
          <div className="sectionTitle">
            <span className="eyebrow">{t.how}</span>
            <h2>{t.rulesTitle}</h2>
            <p>{t.rulesIntro}</p>
          </div>

          <div className="rulesGrid">
            <article>
              <span>01</span>
              <h3>{t.chooseTitle}</h3>
              <p>{t.chooseText}</p>
            </article>

            <article>
              <span>02</span>
              <h3>{t.winTitle}</h3>
              <p>{t.winText}</p>
            </article>

            <article>
              <span>03</span>
              <h3>{t.prizeTitle}</h3>
              <p>{t.prizeText}</p>
            </article>
          </div>

          <div className="prizePanel">
            <div>
              <span className="eyebrow">{t.prizeTable}</span>
              <h2>{t.prizeTable}</h2>
            </div>

            <p>{t.prizeNote}</p>
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

function GameHeading({
  title,
  number,
  stake,
}: {
  title: string;
  number: string;
  stake: string;
}) {
  return (
    <div className="gameHeading">
      <strong>{title}</strong>

      <div>
        <span>{number}</span>
        <span>{stake} €</span>
      </div>
    </div>
  );
}

function PlayInput({
  label,
  digits,
  number,
  stake,
  suggested = false,
  onNumber,
  onStake,
}: {
  label: string;
  digits: number;
  number: string;
  stake: string;
  suggested?: boolean;
  onNumber: (value: string) => void;
  onStake: (value: string) => void;
}) {
  return (
    <div className="playGroup">
      <span className="mobileLabel">{label}</span>

      <div className="numberAndStake">
        <input
          className={suggested ? "suggested" : ""}
          type="text"
          inputMode="numeric"
          maxLength={digits}
          placeholder={"0".repeat(digits)}
          value={number}
          onChange={(event) =>
            onNumber(event.target.value)
          }
        />

        <div className="moneyInput">
          <span>€</span>

          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={stake}
            onChange={(event) =>
              onStake(event.target.value)
            }
          />
        </div>
      </div>
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
      <span>{title}</span>

      <strong>
        <i>—</i>
        <i>—</i>
        <i>—</i>
        <i>—</i>
      </strong>

      <small>Nog geen uitslag</small>
    </article>
  );
}
