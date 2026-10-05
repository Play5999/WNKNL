export default function HowItWorksPage() {
  return (
    <main>
      <div className="siteContainer standardPage">

        {/* HERO */}
        <section className="pageHero">
          <span className="heroTag">SPELREGELS</span>

          <h1>
            Hoe werkt <span>Wegi Number Kòrsou?</span>
          </h1>

          <p>
            Kies jouw nummers, bepaal zelf je inzet en controleer
            na de trekking of jouw nummers overeenkomen met de uitslag.
          </p>
        </section>

        {/* SPELEN IN 4 STAPPEN */}
        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>ZO SPEEL JE</small>
            <h2>Spelen in vier stappen</h2>
            <p>
              Zelf je nummers kiezen en bepalen hoeveel je per nummer
              wilt inzetten.
            </p>
          </div>

          <div className="rulesGrid">
            <article className="ruleCard">
              <span className="stepNumber">01</span>

              <h3>Kies je spel</h3>

              <p>
                Kies of je een 4-, 3- of 2-cijferig nummer wilt spelen.
              </p>
            </article>

            <article className="ruleCard">
              <span className="stepNumber">02</span>

              <h3>Kies je nummer</h3>

              <p>
                Vul zelf het nummer in waarmee je wilt deelnemen.
                Je kunt meerdere nummers spelen.
              </p>
            </article>

            <article className="ruleCard">
              <span className="stepNumber">03</span>

              <h3>Bepaal je inzet</h3>

              <p>
                Ieder nummer heeft zijn eigen inzet. Je bepaalt dus
                zelf hoeveel je per nummer wilt inzetten.
              </p>
            </article>

            <article className="ruleCard">
              <span className="stepNumber">04</span>

              <h3>Bekijk de uitslag</h3>

              <p>
                Na de trekking worden jouw gespeelde nummers met de
                uitslag vergeleken.
              </p>
            </article>
          </div>
        </section>

        {/* VOORBEELD */}
        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>VOORBEELD</small>

            <h2>Wanneer heb je een nummer goed?</h2>

            <p>
              Stel dat het getrokken 4-cijferige nummer{" "}
              <strong>7734</strong> is.
            </p>
          </div>

          <div className="drawDisplay">
            <span>7</span>
            <span>7</span>
            <span>3</span>
            <span>4</span>
          </div>

          <div className="matchGrid">
            <article className="matchCard">
              <small>4 CIJFERS</small>

              <strong>7734</strong>

              <p>
                Het volledige 4-cijferige nummer komt overeen.
              </p>
            </article>

            <article className="matchCard">
              <small>3 CIJFERS</small>

              <strong>734</strong>

              <p>
                De laatste drie cijfers van het nummer komen overeen.
              </p>
            </article>

            <article className="matchCard">
              <small>2 CIJFERS</small>

              <strong>34</strong>

              <p>
                De laatste twee cijfers van het nummer komen overeen.
              </p>
            </article>
          </div>
        </section>

        {/* PRIJZENTABEL */}
        <section className="standardSection">
          <div className="sectionHeading noCardHeading">
            <small>PRIJZEN</small>

            <h2>Hoeveel kun je winnen?</h2>

            <p>
              De uitbetaling hangt af van het soort nummer,
              welke combinatie goed is en hoeveel je hebt ingezet.
            </p>
          </div>

          <div className="tableWrapper">
            <table className="siteTable">
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

                  <td>Volledige 4 cijfers</td>
                  <td>7734</td>
                  <td>€ 1,00</td>
                  <td>Nog in te vullen</td>
                </tr>

                <tr>
                  <td>
                    <strong>3 cijfers</strong>
                  </td>

                  <td>Laatste 3 cijfers</td>
                  <td>734</td>
                  <td>€ 1,00</td>
                  <td>Nog in te vullen</td>
                </tr>

                <tr>
                  <td>
                    <strong>2 cijfers</strong>
                  </td>

                  <td>Laatste 2 cijfers</td>
                  <td>34</td>
                  <td>€ 1,00</td>
                  <td>Nog in te vullen</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="infoNotice">
            De definitieve uitbetalingsbedragen voegen we toe zodra
            de volledige prijzentabel is vastgelegd.
          </div>
        </section>

        {/* WINST UITLEG */}
        <section className="standardSection payoutExplanation">
          <div>
            <div className="sectionHeading noCardHeading">
              <small>JOUW INZET</small>

              <h2>Je winst groeit mee met je inzet</h2>

              <p>
                Wanneer de uitbetaling per € 1 inzet bekend is,
                kan de website automatisch berekenen hoeveel jouw
                mogelijke uitbetaling is.
              </p>
            </div>

            <div className="calculationExample">
              <div>
                <span>Jouw inzet</span>
                <strong>€ 1,00</strong>
              </div>

              <span className="calculationArrow">×</span>

              <div>
                <span>Uitbetaling</span>
                <strong>prijzentabel</strong>
              </div>

              <span className="calculationArrow">=</span>

              <div className="calculationResult">
                <span>Jouw winst</span>
                <strong>automatisch</strong>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rulesCTA">
          <div>
            <small>KLAAR OM TE SPELEN?</small>

            <h2>Kies jouw nummers</h2>

            <p>
              Ga terug naar de speelpagina en vul je nummers en
              inzet in.
            </p>
          </div>

          <a className="yellowButton" href="/#spelen">
            Naar spelen →
          </a>
        </section>

      </div>
    </main>
  );
}
