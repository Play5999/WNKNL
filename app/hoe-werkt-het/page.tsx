"use client";

import { useState } from "react";

type GameType = 4 | 3 | 2;
type PrizePosition = 1 | 2 | 3;

const payouts: Record<
  GameType,
  Record<PrizePosition, number>
> = {
  4: {
    1: 4000,
    2: 2000,
    3: 1000,
  },

  3: {
    1: 400,
    2: 200,
    3: 100,
  },

  2: {
    1: 40,
    2: 20,
    3: 10,
  },
};

export default function HowItWorksPage() {
  const [calcType, setCalcType] =
    useState<GameType>(4);

  const [calcPrize, setCalcPrize] =
    useState<PrizePosition>(1);

  const [calcStake, setCalcStake] =
    useState("1");

  const stake =
    Number(calcStake.replace(",", ".")) || 0;

  const payoutPerEuro =
    payouts[calcType][calcPrize];

  const totalPayout =
    stake * payoutPerEuro;

  return (
    <main>
      <div className="siteContainer standardPage">

        {/* =========================
            HERO
        ========================== */}

        <section className="pageHero">
          <span className="heroTag">
            SPELREGELS
          </span>

          <h1>
            Hoe werkt{" "}
            <span>Wegi Number Kòrsou?</span>
          </h1>

          <p>
            Kies jouw nummers, bepaal zelf je inzet
            en controleer na de trekking of jouw
            nummers overeenkomen met de uitslag.
          </p>
        </section>


        {/* =========================
            HOE SPEEL JE?
        ========================== */}

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>ZO SPEEL JE</small>

            <h2>Spelen in vier stappen</h2>

            <p>
              Je kiest zelf welke nummers je wilt
              spelen en hoeveel je per nummer wilt
              inzetten.
            </p>
          </div>

          <div className="rulesGrid">

            <article className="ruleCard">
              <span className="stepNumber">
                01
              </span>

              <h3>Kies je spel</h3>

              <p>
                Kies of je een 4-, 3- of
                2-cijferig nummer wilt spelen.
              </p>
            </article>


            <article className="ruleCard">
              <span className="stepNumber">
                02
              </span>

              <h3>Kies je nummer</h3>

              <p>
                Vul zelf het nummer in waarmee je
                wilt deelnemen. Je kunt meerdere
                nummers tegelijk spelen.
              </p>
            </article>


            <article className="ruleCard">
              <span className="stepNumber">
                03
              </span>

              <h3>Bepaal je inzet</h3>

              <p>
                Ieder nummer heeft zijn eigen inzet.
                Je bepaalt dus zelf hoeveel je per
                nummer wilt inzetten.
              </p>
            </article>


            <article className="ruleCard">
              <span className="stepNumber">
                04
              </span>

              <h3>Bekijk de uitslag</h3>

              <p>
                Na de trekking worden jouw gespeelde
                nummers automatisch met de uitslag
                vergeleken.
              </p>
            </article>

          </div>
        </section>


        {/* =========================
            4 / 3 / 2 CIJFERS
        ========================== */}

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>JOUW NUMMERS</small>

            <h2>
              Je kunt op 4, 3 of 2 cijfers spelen
            </h2>

            <p>
              Bij een 4-cijferige trekking worden
              ook de laatste drie en laatste twee
              cijfers gebruikt voor de 3- en
              2-cijferige spellen.
            </p>
          </div>

          <div className="matchGrid">

            <article className="matchCard">
              <small>4 CIJFERS</small>

              <strong>7734</strong>

              <p>
                Alle vier de cijfers moeten exact
                overeenkomen met het getrokken
                nummer.
              </p>
            </article>


            <article className="matchCard">
              <small>3 CIJFERS</small>

              <strong>734</strong>

              <p>
                De laatste drie cijfers moeten
                overeenkomen.
              </p>
            </article>


            <article className="matchCard">
              <small>2 CIJFERS</small>

              <strong>34</strong>

              <p>
                De laatste twee cijfers moeten
                overeenkomen.
              </p>
            </article>

          </div>
        </section>


        {/* =========================
            TREKKINGEN
        ========================== */}

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>DE TREKKING</small>

            <h2>
              Iedere trekking heeft drie
              prijsnummers
            </h2>

            <p>
              Er worden een 1e, 2e en 3e
              prijsnummer bekendgemaakt. De hoogte
              van de uitbetaling hangt af van de
              positie waarop jouw nummer wordt
              getrokken.
            </p>
          </div>

          <div className="drawExplanation">

            <article className="drawPrizeCard">
              <span className="prizePosition">
                1e PRIJS
              </span>

              <strong>7734</strong>

              <p>
                De eerste prijs heeft de hoogste
                uitbetaling.
              </p>
            </article>


            <article className="drawPrizeCard">
              <span className="prizePosition">
                2e PRIJS
              </span>

              <strong>2861</strong>

              <p>
                De uitbetaling is de helft van de
                uitbetaling van de 1e prijs.
              </p>
            </article>


            <article className="drawPrizeCard">
              <span className="prizePosition">
                3e PRIJS
              </span>

              <strong>9452</strong>

              <p>
                De uitbetaling is opnieuw de helft:
                50% van de uitbetaling van de
                2e prijs.
              </p>
            </article>

          </div>
        </section>


        {/* =========================
            PRIJZENTABEL
        ========================== */}

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>UITBETALING</small>

            <h2>Hoeveel kun je winnen?</h2>

            <p>
              De onderstaande bedragen zijn de
              mogelijke uitbetaling per €1 inzet.
            </p>
          </div>

          <div className="tableWrapper">

            <table className="siteTable payoutTable">

              <thead>
                <tr>
                  <th>Spel</th>
                  <th>1e prijs</th>
                  <th>2e prijs</th>
                  <th>3e prijs</th>
                </tr>
              </thead>

              <tbody>

                <tr>
                  <td>
                    <strong>
                      4 cijfers
                    </strong>

                    <small>
                      Exacte 4 cijfers
                    </small>
                  </td>

                  <td>
                    <strong>
                      €4.000
                    </strong>
                  </td>

                  <td>
                    €2.000
                  </td>

                  <td>
                    €1.000
                  </td>
                </tr>


                <tr>
                  <td>
                    <strong>
                      3 cijfers
                    </strong>

                    <small>
                      Laatste 3 cijfers
                    </small>
                  </td>

                  <td>
                    <strong>
                      €400
                    </strong>
                  </td>

                  <td>
                    €200
                  </td>

                  <td>
                    €100
                  </td>
                </tr>


                <tr>
                  <td>
                    <strong>
                      2 cijfers
                    </strong>

                    <small>
                      Laatste 2 cijfers
                    </small>
                  </td>

                  <td>
                    <strong>
                      €40
                    </strong>
                  </td>

                  <td>
                    €20
                  </td>

                  <td>
                    €10
                  </td>
                </tr>

              </tbody>
            </table>
          </div>


          <div className="infoNotice">
            <strong>Voorbeeld:</strong>{" "}
            speel je €1 op vier cijfers en valt
            jouw nummer op de 1e prijs, dan is de
            mogelijke uitbetaling €4.000. Valt
            hetzelfde nummer op de 2e prijs, dan is
            dit €2.000. Bij de 3e prijs is dit
            €1.000.
          </div>
        </section>


        {/* =========================
            VOORBEELD MET €5
        ========================== */}

        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>REKENVOORBEELD</small>

            <h2>
              Meer inzetten betekent een hogere
              mogelijke uitbetaling
            </h2>

            <p>
              De uitbetaling per €1 wordt
              vermenigvuldigd met jouw inzet.
            </p>
          </div>

          <div className="examplePayoutGrid">

            <article className="payoutExampleCard">
              <span>
                4 cijfers · €5 inzet
              </span>

              <h3>1e prijs</h3>

              <div className="payoutCalculation">
                €5 × €4.000
              </div>

              <strong>
                €20.000
              </strong>
            </article>


            <article className="payoutExampleCard">
              <span>
                4 cijfers · €5 inzet
              </span>

              <h3>2e prijs</h3>

              <div className="payoutCalculation">
                €5 × €2.000
              </div>

              <strong>
                €10.000
              </strong>
            </article>


            <article className="payoutExampleCard">
              <span>
                4 cijfers · €5 inzet
              </span>

              <h3>3e prijs</h3>

              <div className="payoutCalculation">
                €5 × €1.000
              </div>

              <strong>
                €5.000
              </strong>
            </article>

          </div>
        </section>


        {/* =========================
            WERKENDE CALCULATOR
        ========================== */}

        <section className="standardSection">

          <div className="sectionHeading noCardHeading">
            <small>WINSTCALCULATOR</small>

            <h2>
              Bereken je mogelijke uitbetaling
            </h2>

            <p>
              Kies hoeveel cijfers je speelt,
              bij welke prijs jouw nummer valt en
              hoeveel je inzet.
            </p>
          </div>


          <div className="calculatorForm">

            {/* SPEL */}
            <div className="calculatorField">
              <label htmlFor="calcType">
                Ik speel
              </label>

              <select
                id="calcType"
                value={calcType}
                onChange={(event) =>
                  setCalcType(
                    Number(
                      event.target.value
                    ) as GameType
                  )
                }
              >
                <option value={4}>
                  4 cijfers
                </option>

                <option value={3}>
                  3 cijfers
                </option>

                <option value={2}>
                  2 cijfers
                </option>
              </select>
            </div>


            {/* PRIJS */}
            <div className="calculatorField">
              <label htmlFor="calcPrize">
                Mijn nummer valt op
              </label>

              <select
                id="calcPrize"
                value={calcPrize}
                onChange={(event) =>
                  setCalcPrize(
                    Number(
                      event.target.value
                    ) as PrizePosition
                  )
                }
              >
                <option value={1}>
                  1e prijs
                </option>

                <option value={2}>
                  2e prijs
                </option>

                <option value={3}>
                  3e prijs
                </option>
              </select>
            </div>


            {/* INZET */}
            <div className="calculatorField">
              <label htmlFor="calcStake">
                Mijn inzet
              </label>

              <div className="calculatorMoneyInput">
                <span>€</span>

                <input
                  id="calcStake"
                  type="text"
                  inputMode="decimal"
                  value={calcStake}
                  onChange={(event) => {
                    const clean =
                      event.target.value
                        .replace(
                          /[^0-9,.]/g,
                          ""
                        )
                        .replace(".", ",");

                    setCalcStake(clean);
                  }}
                />
              </div>
            </div>

          </div>


          {/* RESULTAAT */}

          <div className="calculatorResult">

            <div>
              <small>
                JOUW KEUZE
              </small>

              <strong>
                {calcType} cijfers ·{" "}
                {calcPrize === 1
                  ? "1e"
                  : calcPrize === 2
                  ? "2e"
                  : "3e"}{" "}
                prijs
              </strong>
            </div>


            <div className="calculatorFormula">

              <span>
                €{" "}
                {stake.toLocaleString(
                  "nl-NL",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </span>

              <b>×</b>

              <span>
                €{" "}
                {payoutPerEuro.toLocaleString(
                  "nl-NL"
                )}
              </span>

            </div>


            <div className="calculatorWinning">

              <small>
                MOGELIJKE UITBETALING
              </small>

              <strong>
                €{" "}
                {totalPayout.toLocaleString(
                  "nl-NL",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>

            </div>

          </div>

        </section>


        {/* =========================
            CTA
        ========================== */}

        <section className="rulesCTA">

          <div>
            <small>
              KLAAR OM TE SPELEN?
            </small>

            <h2>
              Kies jouw nummers
            </h2>

            <p>
              Ga terug naar de speelpagina en vul
              jouw nummers en inzet in.
            </p>
          </div>

          <a
            className="yellowButton"
            href="/#spelen"
          >
            Naar spelen →
          </a>

        </section>

      </div>
    </main>
  );
}
