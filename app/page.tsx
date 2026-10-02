"use client";

import { useMemo, useState } from "react";

type GameType = "4" | "3" | "2";

export default function HowItWorks() {
  const [game, setGame] = useState<GameType>("4");
  const [stake, setStake] = useState("1");

  /*
    Deze multipliers vervangen we door de definitieve
    officiële WNKNL-prijzentabel.
  */
  const multipliers: Record<GameType, number | null> = {
    "4": null,
    "3": null,
    "2": null,
  };

  const calculatedPrize = useMemo(() => {
    const amount = Number(stake.replace(",", "."));
    const multiplier = multipliers[game];

    if (!Number.isFinite(amount) || amount <= 0 || multiplier === null) {
      return null;
    }

    return amount * multiplier;
  }, [game, stake]);

  function euro(value: number) {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

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
          <a href="/#spelen">Spelen</a>
          <a href="/#uitslagen">Uitslagen</a>
          <a href="/hoe-werkt-het">Hoe werkt het?</a>

          <button className="accountLink">
            Mijn account
          </button>

          <select className="language" defaultValue="nl">
            <option value="pap">PAP</option>
            <option value="nl">NL</option>
            <option value="en">EN</option>
          </select>
        </nav>
      </header>

      <div className="page rulesPage">
        <section className="rulesHero">
          <span className="tag">SPELREGELS</span>

          <h1>
            Hoe werkt
            <span>Wegi Number Kòrsou?</span>
          </h1>

          <p>
            Kies je nummer, bepaal zelf je inzet en controleer
            na de trekking of jouw nummer overeenkomt met de uitslag.
          </p>
        </section>

        <section className="rulesIntro">
          <span className="eyebrow">ZO SPEEL JE</span>
          <h2>Spelen in vier stappen</h2>

          <div className="ruleSteps">
            <article>
              <b>01</b>
              <h3>Kies je spel</h3>
              <p>
                Kies of je met een 4-, 3- of 2-cijferig nummer
                wilt spelen.
              </p>
            </article>

            <article>
              <b>02</b>
              <h3>Kies je nummer</h3>
              <p>
                Vul zelf het nummer in waarmee je wilt deelnemen.
                Je kunt meerdere nummers spelen.
              </p>
            </article>

            <article>
              <b>03</b>
              <h3>Bepaal je inzet</h3>
              <p>
                Ieder nummer heeft zijn eigen inzet. Daardoor kun
                je per nummer zelf bepalen hoeveel je wilt inzetten.
              </p>
            </article>

            <article>
              <b>04</b>
              <h3>Bekijk de uitslag</h3>
              <p>
                Na de trekking worden jouw gespeelde nummers met
                de gepubliceerde uitslag vergeleken.
              </p>
            </article>
          </div>
        </section>

        <section className="matchSection">
          <div className="sectionTitle">
            <span className="eyebrow">VOORBEELD</span>
            <h2>Wanneer heb je een nummer goed?</h2>

            <p>
              Stel dat het getrokken 4-cijferige nummer
              <strong> 7734 </strong>
              is.
            </p>
          </div>

          <div className="drawExample">
            <div className="drawNumber">
              <span>7</span>
              <span>7</span>
              <span>3</span>
              <span>4</span>
            </div>

            <div className="matchExamples">
              <article>
                <span className="matchBadge">4 CIJFERS</span>
                <strong>7734</strong>
                <p>
                  Het volledige 4-cijferige nummer komt overeen.
                </p>
              </article>

              <article>
                <span className="matchBadge">3 CIJFERS</span>
                <strong>734</strong>
                <p>
                  De laatste drie cijfers komen overeen.
                </p>
              </article>

              <article>
                <span className="matchBadge">2 CIJFERS</span>
                <strong>34</strong>
                <p>
                  De laatste twee cijfers komen overeen.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="prizesSection">
          <div className="sectionTitle">
            <span className="eyebrow">PRIJZEN</span>
            <h2>Hoeveel kun je winnen?</h2>

            <p>
              De hoogte van de uitbetaling hangt af van het soort
              nummer, de uitslag en je inzet.
            </p>
          </div>

          <div className="prizeTableWrapper">
            <table className="prizeTable">
              <thead>
                <tr>
                  <th>Spel</th>
                  <th>Wat moet goed zijn?</th>
                  <th>Voorbeeld</th>
                  <th>Uitbetaling</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <strong>4 cijfers</strong>
                  </td>
                  <td>Volledige 4 cijfers</td>
                  <td>7734</td>
                  <td className="pendingPrize">
                    Wordt ingevuld
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>3 cijfers</strong>
                  </td>
                  <td>Laatste 3 cijfers</td>
                  <td>734</td>
                  <td className="pendingPrize">
                    Wordt ingevuld
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>2 cijfers</strong>
                  </td>
                  <td>Laatste 2 cijfers</td>
                  <td>34</td>
                  <td className="pendingPrize">
                    Wordt ingevuld
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="prizeWarning">
            De definitieve bedragen worden hier gepubliceerd zodra
            de prijzentabel voor WNKNL definitief is vastgelegd.
          </p>
        </section>

        <section className="calculatorSection">
          <div className="calculatorText">
            <span className="eyebrow">CALCULATOR</span>

            <h2>Bereken je mogelijke uitbetaling</h2>

            <p>
              Kies het spel en vul je inzet in. Zodra de definitieve
              prijzentabel is gekoppeld, berekent WNKNL hier
              automatisch de mogelijke uitbetaling.
            </p>
          </div>

          <div className="calculatorCard">
            <label>
              Spel

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
              Jouw inzet

              <div className="calculatorMoney">
                <span>€</span>

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

            <div className="calculatorResult">
              <span>Mogelijke uitbetaling</span>

              <strong>
                {calculatedPrize === null
                  ? "—"
                  : euro(calculatedPrize)}
              </strong>

              <small>
                Definitieve prijzentabel nog niet gekoppeld
              </small>
            </div>
          </div>
        </section>

        <section className="backToPlay">
          <div>
            <span className="eyebrow">KLAAR OM TE SPELEN?</span>
            <h2>Kies jouw nummers</h2>
          </div>

          <a className="yellowButton" href="/#spelen">
            Naar spelen →
          </a>
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
