export default function Home() {
  return (
    <main>
      <header className="header">
        <div className="logo">
          <span>WNK</span>NL
        </div>

        <nav>
          <a href="#spelen">Spelen</a>
          <a href="#uitslagen">Uitslagen</a>
          <a href="#uitleg">Hoe werkt het?</a>
        </nav>

        <button className="loginButton">Inloggen</button>
      </header>

      <section className="hero">
        <div className="heroContent">
          <p className="eyebrow">WEGI NUMBER KÒRSOU • NEDERLAND</p>

          <h1>
            Kies je nummer.
            <br />
            <span>Speel mee.</span>
          </h1>

          <p className="intro">
            Kies zelf je 2-, 3- of 4-cijferige nummer en bepaal hoeveel
            je wilt inzetten.
          </p>

          <a className="playButton" href="#spelen">
            Speel nu
          </a>
        </div>
      </section>

      <section className="playSection" id="spelen">
        <div className="sectionTitle">
          <p>JOUW NUMMERS</p>
          <h2>Speel je nummer</h2>
          <span>
            Vul je nummers en inzet in. Je ziet direct het totaalbedrag.
          </span>
        </div>

        <div className="gameCard">
          <div className="gameRow">
            <div>
              <strong>4 cijfers</strong>
              <small>Exact nummer</small>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              placeholder="0000"
            />

            <div className="money">
              <span>€</span>
              <input type="number" min="0" step="0.50" placeholder="0,00" />
            </div>
          </div>

          <div className="gameRow">
            <div>
              <strong>3 cijfers</strong>
              <small>Exact nummer</small>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={3}
              placeholder="000"
            />

            <div className="money">
              <span>€</span>
              <input type="number" min="0" step="0.50" placeholder="0,00" />
            </div>
          </div>

          <div className="gameRow">
            <div>
              <strong>2 cijfers</strong>
              <small>Exact nummer</small>
            </div>

            <input
              type="text"
              inputMode="numeric"
              maxLength={2}
              placeholder="00"
            />

            <div className="money">
              <span>€</span>
              <input type="number" min="0" step="0.50" placeholder="0,00" />
            </div>
          </div>

          <button className="addButton">+ Nummer toevoegen</button>

          <div className="total">
            <span>Totaal</span>
            <strong>€ 0,00</strong>
          </div>

          <button className="continueButton">
            Inloggen om verder te gaan
          </button>
        </div>
      </section>
    </main>
  );
}
