"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type GameType = "4" | "3" | "2";

const payoutMultipliers: Record<GameType, number | null> = {
  "4": null,
  "3": null,
  "2": null,
};

export default function HowItWorksPage() {
  const [game, setGame] = useState<GameType>("4");
  const [stake, setStake] = useState("1");

  const possiblePayout = useMemo(() => {
    const cleanStake = Number(stake.replace(",", "."));
    const multiplier = payoutMultipliers[game];

    if (
      !Number.isFinite(cleanStake) ||
      cleanStake <= 0 ||
      multiplier === null
    ) {
      return null;
    }

    return cleanStake * multiplier;
  }, [game, stake]);

  function euro(value: number) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  return (
    <main>
      {/* HEADER */}
      <header className="topbar">
        <Link className="logo" href="/">
          <span className="star">★</span>

          <div>
            <strong>WEGI NUMBER KÒRSOU</strong>
            <small>WNKNL</small>
          </div>
        </Link>

        <nav>
          <Link href="/#spelen">Spelen</Link>
          <Link href="/#uitslagen">Uitslagen</Link>

          <Link className="activeNav" href="/hoe-werkt-het">
            Hoe werkt het?
          </Link>

          <button className="accountLink">
            Mijn account
          </button>

          <select
            className="language"
            defaultValue="nl"
            aria-label="Taal"
          >
            <option value="pap">PAP</option>
            <option value="nl">NL</option>
            <option value="en">EN</option>
          </select>
        </nav>
      </header>

      <div className="howPage">
        {/* HERO */}
        <section className="howHero">
          <span className="tag">SPELREGELS</span>

          <h1>
            Hoe werkt
            <span>Wegi Number Kòrsou?</span>
          </h1>

          <p>
            Kies jouw nummer, bepaal zelf je inzet en controleer
            na de trekking of jouw nummer overeenkomt met de uitslag.
          </p>

          <Link className="yellowButton" href="/#spelen">
            Speel nu →
          </Link>
        </section>

        {/* STAPPEN */}
        <section className="howSection">
          <div className="howTitle">
            <span className="eyebrow">ZO SPEEL JE</span>
            <h2>Spelen in vier stappen</h2>
          </div>

          <div className="howSteps">
            <article>
              <b>01</b>
              <h3>Kies je spel</h3>
              <p>
                Kies of je met een 4-, 3- of 2-cijferig
                nummer wilt spelen.
              </p>
            </article>

            <article>
              <b>02</b>
              <h3>Kies je nummer</h3>
              <p>
                Vul het nummer in waarmee je wilt deelnemen.
                Je kunt meerdere nummers spelen.
              </p>
            </article>

            <article>
              <b>03</b>
              <h3>Bepaal je inzet</h3>
              <p>
                Ieder nummer heeft zijn eigen inzet. Je bepaalt
                zelf hoeveel je per nummer wilt spelen.
              </p>
            </article>

            <article>
              <b>04</b>
              <h3>Bekijk de uitslag</h3>
              <p>
                Na de trekking worden jouw gespeelde nummers
                met de uitslag vergeleken.
              </p>
            </article>
          </div>
        </section>

        {/* VOORBEELD */}
        <section className="howSection">
          <div className="howTitle">
            <span className="eyebrow">VOORBEELD</span>

            <h2>Wanneer heb je een nummer goed?</h2>

            <p>
              Stel dat het getrokken 4-cijferige nummer{" "}
              <strong>7734</strong> is.
            </p>
          </div>

          <div className="examplePanel">
            <div className="exampleDraw">
              <span>7</span>
              <span>7</span>
              <span>3</span>
              <span>4</span>
            </div>

            <div className="exampleMatches">
              <article>
                <small>4 CIJFERS</small>
                <strong>7734</strong>
                <p>
                  Het volledige 4-cijferige nummer komt overeen.
                </p>
              </article>

              <article>
                <small>3 CIJFERS</small>
                <strong>734</strong>
                <p>
                  De laatste drie cijfers komen overeen.
                </p>
              </article>

              <article>
                <small>2 CIJFERS</small>
                <strong>34</strong>
                <p>
                  De laatste twee cijfers komen overeen.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* PRIJZEN */}
        <section className="howSection">
          <div className="howTitle">
            <span className="eyebrow">PRIJZEN</span>

            <h2>Hoeveel kun je winnen?</h2>

            <p>
              Je uitbetaling hangt af van het soort nummer,
              de juiste combinatie en de hoogte van je inzet.
            </p>
          </div>

          <div className="payoutTableWrapper">
            <table className="payoutTable">
              <thead>
                <tr>
                  <th>Spel</th>
                  <th>Wat moet goed zijn?</th>
                  <th>Voorbeeld</th>
                  <th>Inzet</th>
                  <th>Uitbetaling</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <strong>4 cijfers</strong>
                  </td>
                  <td>Volledige nummer</td>
                  <td className="exampleNumber">7734</td>
                  <td>€ 1,00</td>
                  <td>
                    <span className="pending">
                      Nog in te vullen
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>3 cijfers</strong>
                  </td>
                  <td>Laatste 3 cijfers</td>
                  <td className="exampleNumber">734</td>
                  <td>€ 1,00</td>
                  <td>
                    <span className="pending">
                      Nog in te vullen
                    </span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>2 cijfers</strong>
                  </td>
                  <td>Laatste 2 cijfers</td>
                  <td className="exampleNumber">34</td>
                  <td>€ 1,00</td>
                  <td>
                    <span className="pending">
                      Nog in te vullen
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="yellowNotice">
            De definitieve uitbetalingsbedragen worden hier
            toegevoegd zodra we de definitieve prijzentabel
            hebben vastgelegd.
          </div>
        </section>

        {/* CALCULATOR */}
        <section className="calculator">
          <div className="calculatorIntro">
            <span className="calculatorEyebrow">
              WINSTCALCULATOR
            </span>

            <h2>
              Bereken hoeveel je
              <span>kunt winnen</span>
            </h2>

            <p>
              Kies hoeveel cijfers je speelt en vul je inzet in.
              De calculator laat daarna de mogelijke uitbetaling zien.
            </p>
          </div>

          <div className="calculatorBox">
            <label>
              <span>Welk spel?</span>

              <select
                value={game}
                onChange={(event) =>
                  setGame(event.target.value as GameType)
                }
              >
                <option value="4">4 cijfers</option>
                <option value="3">3 cijfers</option>
                <option value="2">2 cijfers</option>
              </select>
            </label>

            <label>
              <span>Jouw inzet</span>

              <div className="calcMoney">
                <b>€</b>

                <input
                  type="text"
                  inputMode="decimal"
                  value={stake}
                  onChange={(event) =>
                    setStake(
                      event.target.value.replace(
                        /[^0-9,.]/g,
                        ""
                      )
                    )
                  }
                />
              </div>
            </label>

            <div className="calcResult">
              <small>MOGELIJKE UITBETALING</small>

              <strong>
                {possiblePayout === null
                  ? "—"
                  : euro(possiblePayout)}
              </strong>

              <p>
                Definitieve prijzentabel nog niet gekoppeld.
              </p>
            </div>
          </div>
        </section>

        {/* TERUG */}
        <section className="playCTA">
          <div>
            <span className="eyebrow">
              KLAAR OM TE SPELEN?
            </span>

            <h2>Kies jouw nummers</h2>

            <p>
              Ga terug naar de speelpagina en vul je nummers in.
            </p>
          </div>

          <Link className="yellowButton" href="/#spelen">
            Naar spelen →
          </Link>
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
