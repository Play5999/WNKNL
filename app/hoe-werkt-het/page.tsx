{/* HOE WERKT DE TREKKING */}
<section className="standardSection">
  <div className="sectionHeading noCardHeading">
    <small>DE TREKKING</small>
    <h2>Drie winnende nummers per trekking</h2>

    <p>
      Bij iedere trekking worden drie 4-cijferige nummers
      bekendgemaakt: de 1e, 2e en 3e prijs.
    </p>
  </div>

  <div className="drawExplanation">
    <article className="drawPrizeCard">
      <span className="prizePosition">1e PRIJS</span>
      <strong>7734</strong>
      <p>Hoogste uitbetaling</p>
    </article>

    <article className="drawPrizeCard">
      <span className="prizePosition">2e PRIJS</span>
      <strong>2861</strong>
      <p>50% van de uitbetaling van de 1e prijs</p>
    </article>

    <article className="drawPrizeCard">
      <span className="prizePosition">3e PRIJS</span>
      <strong>9452</strong>
      <p>50% van de uitbetaling van de 2e prijs</p>
    </article>
  </div>
</section>


{/* HOE WIN JE */}
<section className="standardSection">
  <div className="sectionHeading noCardHeading">
    <small>HOE WIN JE?</small>
    <h2>Je nummer wordt met de trekking vergeleken</h2>

    <p>
      Stel dat het nummer 7734 als 1e prijs wordt getrokken.
      Dan wordt gekeken welk spel jij hebt gespeeld.
    </p>
  </div>

  <div className="matchGrid">
    <article className="matchCard">
      <small>4 CIJFERS</small>
      <strong>7734</strong>
      <p>
        Alle vier de cijfers moeten exact overeenkomen.
      </p>
    </article>

    <article className="matchCard">
      <small>3 CIJFERS</small>
      <strong>734</strong>
      <p>
        De laatste drie cijfers moeten overeenkomen.
      </p>
    </article>

    <article className="matchCard">
      <small>2 CIJFERS</small>
      <strong>34</strong>
      <p>
        De laatste twee cijfers moeten overeenkomen.
      </p>
    </article>
  </div>
</section>


{/* PRIJZENTABEL */}
<section className="standardSection">
  <div className="sectionHeading noCardHeading">
    <small>UITBETALING</small>
    <h2>Hoeveel kun je winnen?</h2>

    <p>
      Onderstaande bedragen gelden per €1 inzet.
      Hoe hoger je inzet, hoe hoger de mogelijke uitbetaling.
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
            <strong>4 cijfers</strong>
            <small>Exacte 4 cijfers</small>
          </td>
          <td><strong>€4.000</strong></td>
          <td>€2.000</td>
          <td>€1.000</td>
        </tr>

        <tr>
          <td>
            <strong>3 cijfers</strong>
            <small>Laatste 3 cijfers</small>
          </td>
          <td><strong>€400</strong></td>
          <td>€200</td>
          <td>€100</td>
        </tr>

        <tr>
          <td>
            <strong>2 cijfers</strong>
            <small>Laatste 2 cijfers</small>
          </td>
          <td><strong>€40</strong></td>
          <td>€20</td>
          <td>€10</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div className="infoNotice">
    <strong>Let op:</strong> de bedragen hierboven zijn per €1 inzet.
    De 2e prijs betaalt de helft van de 1e prijs en de 3e prijs
    betaalt de helft van de 2e prijs.
  </div>
</section>


{/* REKENVOORBEELD */}
<section className="standardSection">
  <div className="sectionHeading noCardHeading">
    <small>REKENVOORBEELD</small>
    <h2>Meer inzetten = hogere mogelijke uitbetaling</h2>

    <p>
      De uitbetaling wordt berekend door je inzet te
      vermenigvuldigen met het bedrag uit de prijzentabel.
    </p>
  </div>

  <div className="examplePayoutGrid">
    <article className="payoutExampleCard">
      <span>4 cijfers · €5 inzet</span>
      <h3>1e prijs</h3>

      <div className="payoutCalculation">
        €5 × €4.000
      </div>

      <strong>€20.000</strong>
    </article>

    <article className="payoutExampleCard">
      <span>4 cijfers · €5 inzet</span>
      <h3>2e prijs</h3>

      <div className="payoutCalculation">
        €5 × €2.000
      </div>

      <strong>€10.000</strong>
    </article>

    <article className="payoutExampleCard">
      <span>4 cijfers · €5 inzet</span>
      <h3>3e prijs</h3>

      <div className="payoutCalculation">
        €5 × €1.000
      </div>

      <strong>€5.000</strong>
    </article>
  </div>
</section>
