"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";

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

type Draw = {
  id: string;
  draw_date: string;
  first_prize: string;
  second_prize: string;
  third_prize: string;
  status: string;
};

type SaleStatus = {
  isOpen: boolean;
  isSunday: boolean;
  curacaoDate: string;
  curacaoTime: string;
  drawTime: string;
  closeTime: string;
  target: number;
  targetType: "draw" | "open";
};

let nextId = 10;

function newPlay(): Play {
  return {
    id: nextId++,
    number: "",
    stake: "",
  };
}

function getCuracaoParts(date = new Date()) {
  const formatter =
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Curacao",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

  const parts =
    formatter.formatToParts(date);

  const get = (type: string) =>
    parts.find(
      (part) => part.type === type
    )?.value || "";

  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
    second: Number(get("second")),
  };
}

function curacaoTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
) {
  /*
    Curaçao gebruikt UTC-4 en heeft geen
    zomertijd. We maken daarom een echte
    UTC timestamp door 4 uur op te tellen.
  */
  return Date.UTC(
    year,
    month - 1,
    day,
    hour + 4,
    minute,
    0
  );
}

function getSaleStatus(
  now = new Date()
): SaleStatus {
  const parts = getCuracaoParts(now);

  const isSunday =
    parts.weekday === "Sun";

  const drawHour =
    isSunday ? 17 : 21;

  const drawMinute =
    isSunday ? 30 : 0;

  const closeHour =
    isSunday ? 16 : 20;

  const closeMinute =
    isSunday ? 30 : 0;

  const minutesNow =
    parts.hour * 60 +
    parts.minute;

  const openMinute = 1;

  const closeMinuteOfDay =
    closeHour * 60 +
    closeMinute;

  const isOpen =
    minutesNow >= openMinute &&
    minutesNow <
      closeMinuteOfDay;

  const drawTarget =
    curacaoTimestamp(
      parts.year,
      parts.month,
      parts.day,
      drawHour,
      drawMinute
    );

  let target = drawTarget;
  let targetType:
    | "draw"
    | "open" = "draw";

  if (!isOpen) {
    /*
      Tussen sluiting en middernacht:
      countdown tot 00:01 van de
      volgende Curaçao-dag.
    */

    const todayMidnight =
      curacaoTimestamp(
        parts.year,
        parts.month,
        parts.day,
        0,
        0
      );

    target =
      todayMidnight +
      24 * 60 * 60 * 1000 +
      60 * 1000;

    targetType = "open";
  }

  return {
    isOpen,
    isSunday,
    curacaoDate:
      `${parts.year}-${String(
        parts.month
      ).padStart(2, "0")}-${String(
        parts.day
      ).padStart(2, "0")}`,
    curacaoTime:
      `${String(parts.hour).padStart(
        2,
        "0"
      )}:${String(
        parts.minute
      ).padStart(2, "0")}`,
    drawTime: isSunday
      ? "17:30"
      : "21:00",
    closeTime: isSunday
      ? "16:30"
      : "20:00",
    target,
    targetType,
  };
}

function formatCountdown(
  milliseconds: number
) {
  const safe = Math.max(
    0,
    milliseconds
  );

  const totalSeconds =
    Math.floor(safe / 1000);

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const seconds =
    totalSeconds % 60;

  return {
    hours: String(hours).padStart(
      2,
      "0"
    ),
    minutes: String(
      minutes
    ).padStart(2, "0"),
    seconds: String(
      seconds
    ).padStart(2, "0"),
  };
}

function formatDrawDate(
  date: string
) {
  const [year, month, day] =
    date.split("-");

  return `${day}-${month}-${year}`;
}

export default function Home() {
  const router = useRouter();

  const [games, setGames] =
    useState<Games>({
      4: [newPlay()],
      3: [newPlay()],
      2: [newPlay()],
    });

  const [submitting, setSubmitting] =
    useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState("");

  const [
    latestDraw,
    setLatestDraw,
  ] = useState<Draw | null>(null);

  const [
    drawLoading,
    setDrawLoading,
  ] = useState(true);

  const [now, setNow] =
    useState(() => new Date());

  // =========================================================
  // LIVE KLOK
  // =========================================================

  useEffect(() => {
    const timer = window.setInterval(
      () => {
        setNow(new Date());
      },
      1000
    );

    return () =>
      window.clearInterval(timer);
  }, []);

  const saleStatus =
    useMemo(
      () => getSaleStatus(now),
      [now]
    );

  const countdown =
    useMemo(
      () =>
        formatCountdown(
          saleStatus.target -
            now.getTime()
        ),
      [saleStatus, now]
    );

  // =========================================================
  // LAATSTE GEPUBLICEERDE TREKKING
  // =========================================================

  useEffect(() => {
    async function loadLatestDraw() {
      const supabase =
        createClient();

      const { data, error } =
        await supabase
          .from("draws")
          .select(`
            id,
            draw_date,
            first_prize,
            second_prize,
            third_prize,
            status
          `)
          .eq(
            "status",
            "published"
          )
          .order("draw_date", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (error) {
        console.error(
          "Uitslag laden mislukt:",
          error
        );

        setLatestDraw(null);
      } else {
        setLatestDraw(
          data as Draw | null
        );
      }

      setDrawLoading(false);
    }

    loadLatestDraw();
  }, []);

  // =========================================================
  // NUMMER TOEVOEGEN
  // =========================================================

  function addNumber(
    type: GameType
  ) {
    if (!saleStatus.isOpen) {
      return;
    }

    setGames((current) => ({
      ...current,
      [type]: [
        ...current[type],
        newPlay(),
      ],
    }));
  }

  // =========================================================
  // NUMMER VERWIJDEREN
  // =========================================================

  function removeNumber(
    type: GameType,
    id: number
  ) {
    if (!saleStatus.isOpen) {
      return;
    }

    setGames((current) => {
      const updated: Games = {
        4: current[4].map(
          (item) => ({
            ...item,
          })
        ),
        3: current[3].map(
          (item) => ({
            ...item,
          })
        ),
        2: current[2].map(
          (item) => ({
            ...item,
          })
        ),
      };

      if (type === 4) {
        updated[3] =
          updated[3].filter(
            (item) =>
              item.suggestedFrom !==
              id
          );

        updated[2] =
          updated[2].filter(
            (item) =>
              item.suggestedFrom !==
              id
          );
      }

      updated[type] =
        updated[type].filter(
          (item) =>
            item.id !== id
        );

      if (
        updated[type].length === 0
      ) {
        updated[type] = [
          newPlay(),
        ];
      }

      return updated;
    });
  }

  // =========================================================
  // NUMMER WIJZIGEN
  // =========================================================

  function updateNumber(
    type: GameType,
    id: number,
    value: string
  ) {
    if (!saleStatus.isOpen) {
      return;
    }

    const clean = value
      .replace(/\D/g, "")
      .slice(0, type);

    setGames((current) => {
      const updated: Games = {
        4: current[4].map(
          (item) => ({
            ...item,
          })
        ),
        3: current[3].map(
          (item) => ({
            ...item,
          })
        ),
        2: current[2].map(
          (item) => ({
            ...item,
          })
        ),
      };

      const item =
        updated[type].find(
          (entry) =>
            entry.id === id
        );

      if (!item) {
        return current;
      }

      item.number = clean;

      if (
        type === 3 ||
        type === 2
      ) {
        item.suggestedFrom =
          undefined;

        return updated;
      }

      ([3, 2] as const).forEach(
        (targetType) => {
          const existingSuggestion =
            updated[
              targetType
            ].find(
              (entry) =>
                entry.suggestedFrom ===
                id
            );

          if (
            clean.length !== 4
          ) {
            if (
              existingSuggestion
            ) {
              existingSuggestion.number =
                "";
            }

            return;
          }

          const suggestion =
            clean.slice(
              -targetType
            );

          if (
            existingSuggestion
          ) {
            existingSuggestion.number =
              suggestion;

            return;
          }

          const emptyRow =
            updated[
              targetType
            ].find(
              (entry) =>
                entry.number ===
                  "" &&
                entry.stake ===
                  "" &&
                entry.suggestedFrom ===
                  undefined
            );

          if (emptyRow) {
            emptyRow.number =
              suggestion;

            emptyRow.suggestedFrom =
              id;

            return;
          }

          updated[
            targetType
          ].push({
            id: nextId++,
            number: suggestion,
            stake: "",
            suggestedFrom: id,
          });
        }
      );

      return updated;
    });
  }

  // =========================================================
  // INZET
  // =========================================================

  function updateStake(
    type: GameType,
    id: number,
    value: string
  ) {
    if (!saleStatus.isOpen) {
      return;
    }

    const clean = value
      .replace(
        /[^0-9,.]/g,
        ""
      )
      .replace(".", ",");

    setGames((current) => ({
      ...current,

      [type]:
        current[type].map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  stake: clean,
                }
              : item
        ),
    }));
  }

  function toAmount(
    value: string
  ) {
    const amount = Number(
      value.replace(",", ".")
    );

    return Number.isFinite(
      amount
    )
      ? amount
      : 0;
  }

  // =========================================================
  // GESELECTEERDE NUMMERS
  // =========================================================

  const selected =
    useMemo(() => {
      return (
        [4, 3, 2] as GameType[]
      ).flatMap((type) =>
        games[type]
          .filter(
            (item) =>
              item.number.length ===
                type &&
              toAmount(
                item.stake
              ) > 0
          )
          .map((item) => ({
            ...item,
            type,
          }))
      );
    }, [games]);

  const total =
    selected.reduce(
      (sum, item) =>
        sum +
        toAmount(
          item.stake
        ),
      0
    );

  // =========================================================
  // BESTELLING
  // =========================================================

  async function handleContinue() {
    if (
      selected.length === 0 ||
      submitting
    ) {
      return;
    }

    /*
      Frontend controle.

      De echte beveiliging zit ook
      in Supabase create_order().
    */

    const currentSale =
      getSaleStatus(
        new Date()
      );

    if (
      !currentSale.isOpen
    ) {
      setSubmitError(
        currentSale.isSunday
          ? "De verkoop voor vandaag is gesloten. Op zondag sluit de verkoop om 16:30 Curaçao-tijd."
          : "De verkoop voor vandaag is gesloten. De verkoop sluit om 20:00 Curaçao-tijd."
      );

      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const supabase =
        createClient();

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setSubmitting(false);
        router.push("/login");
        return;
      }

      const entries =
        selected.map(
          (item) => ({
            number_type:
              item.type,
            played_number:
              item.number,
            stake: toAmount(
              item.stake
            ),
          })
        );

      const {
        data,
        error,
      } = await supabase.rpc(
        "create_order",
        {
          p_entries: entries,
        }
      );

      if (error) {
        throw error;
      }

      const order =
        Array.isArray(data)
          ? data[0]
          : data;

      if (
        !order?.order_id
      ) {
        throw new Error(
          "De bestelling kon niet worden aangemaakt."
        );
      }

      router.push(
        `/betalen/${order.order_id}`
      );
    } catch (error) {
      console.error(error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Er ging iets mis. Probeer het opnieuw."
      );

      setSubmitting(false);
    }
  }

  // =========================================================
  // PAGINA
  // =========================================================

  return (
    <main>
      <div className="siteContainer pageContent">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">

          <div className="heroContent">

            <span className="heroTag">
              WEGI NUMBER KÒRSOU
            </span>

            <h1>
              Kies jouw nummers.
              <span>
                Speel mee.
              </span>
            </h1>

            <p>
              Kies zelf je 4-, 3-
              of 2-cijferige nummers
              en bepaal je inzet per
              nummer.
            </p>

            <a
              href="#spelen"
              className="yellowButton"
            >
              Speel nu →
            </a>

          </div>

          <div className="heroNumbers">
            <span>1</span>
            <span>2</span>

            <span className="yellowNumber">
              3
            </span>

            <span>4</span>
          </div>

        </section>

        {/* =================================================
            TREKKING + COUNTDOWN
        ================================================= */}

        <section
          className="contentCard"
          style={{
            marginBottom: "24px",
          }}
        >

          <div className="sectionHeading">

            <small>
              VOLGENDE TREKKING
            </small>

            <h2>
              {saleStatus.isSunday
                ? "Zondag om 17:30"
                : "Vandaag om 21:00"}
            </h2>

            <p>
              Alle tijden zijn
              Curaçao-tijd.
            </p>

          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "18px",
            }}
          >

            {/* COUNTDOWN */}

            <div
              className="accountInfoCard"
              style={{
                textAlign: "center",
              }}
            >

              <small>
                {saleStatus.targetType ===
                "draw"
                  ? "TREKKING OVER"
                  : "VERKOOP OPENT OVER"}
              </small>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "center",
                  alignItems:
                    "center",
                  gap: "8px",
                  marginTop: "15px",
                }}
              >

                <CountdownNumber
                  value={
                    countdown.hours
                  }
                  label="UUR"
                />

                <strong
                  style={{
                    fontSize: "27px",
                  }}
                >
                  :
                </strong>

                <CountdownNumber
                  value={
                    countdown.minutes
                  }
                  label="MIN"
                />

                <strong
                  style={{
                    fontSize: "27px",
                  }}
                >
                  :
                </strong>

                <CountdownNumber
                  value={
                    countdown.seconds
                  }
                  label="SEC"
                />

              </div>

            </div>

            {/* STATUS */}

            <div className="accountInfoCard">

              <small>
                VERKOOPSTATUS
              </small>

              {saleStatus.isOpen ? (
                <>
                  <div
                    style={{
                      marginTop: "12px",
                      display:
                        "inline-block",
                      padding:
                        "7px 12px",
                      borderRadius:
                        "999px",
                      background:
                        "#dcfce7",
                      color:
                        "#15803d",
                      fontWeight: 900,
                    }}
                  >
                    ● Spelen geopend
                  </div>

                  <p
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    Je kunt vandaag
                    spelen tot{" "}
                    <strong>
                      {
                        saleStatus.closeTime
                      }
                    </strong>{" "}
                    Curaçao-tijd.
                  </p>

                  <p>
                    De trekking is om{" "}
                    <strong>
                      {
                        saleStatus.drawTime
                      }
                    </strong>
                    .
                  </p>
                </>
              ) : (
                <>
                  <div
                    style={{
                      marginTop: "12px",
                      display:
                        "inline-block",
                      padding:
                        "7px 12px",
                      borderRadius:
                        "999px",
                      background:
                        "#fee2e2",
                      color:
                        "#b91c1c",
                      fontWeight: 900,
                    }}
                  >
                    ● Verkoop gesloten
                  </div>

                  <p>
                    De verkoop voor
                    vandaag is
                    gesloten.
                  </p>

                  <p
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    Nieuwe nummers
                    spelen kan weer
                    vanaf{" "}
                    <strong>
                      00:01
                    </strong>{" "}
                    Curaçao-tijd.
                  </p>
                </>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            LAATSTE UITSLAG
        ================================================= */}

        <section
          className="resultsSection"
          id="uitslagen"
        >

          <div className="sectionHeading noCardHeading">

            <small>
              UITSLAGEN
            </small>

            <h2>
              Laatste trekking
            </h2>

            {latestDraw && (
              <p>
                Uitslag van{" "}
                <strong>
                  {formatDrawDate(
                    latestDraw.draw_date
                  )}
                </strong>
              </p>
            )}

          </div>

          {drawLoading ? (
            <div className="emptyState">
              Uitslag laden...
            </div>
          ) : latestDraw ? (
            <div className="resultsGrid">

              <ResultCard
                title="1e prijs"
                number={
                  latestDraw.first_prize
                }
              />

              <ResultCard
                title="2e prijs"
                number={
                  latestDraw.second_prize
                }
              />

              <ResultCard
                title="3e prijs"
                number={
                  latestDraw.third_prize
                }
              />

            </div>
          ) : (
            <div className="emptyState">
              Er is nog geen
              gepubliceerde uitslag.
            </div>
          )}

        </section>

        {/* =================================================
            SPELEN
        ================================================= */}

        <section
          className="contentCard"
          id="spelen"
        >

          <div className="sectionHeading">

            <small>SPELEN</small>

            <h2>
              Jouw nummers
            </h2>

            <p>
              Vul je nummers en
              inzet in. Bij een
              4-cijferig nummer
              worden de laatste 3
              en 2 cijfers
              automatisch
              voorgesteld.
            </p>

          </div>

          {!saleStatus.isOpen && (
            <div
              style={{
                padding: "16px",
                marginBottom: "20px",
                borderRadius: "10px",
                background: "#fee2e2",
                color: "#991b1b",
              }}
            >
              <strong>
                Verkoop gesloten
              </strong>

              <p
                style={{
                  margin:
                    "5px 0 0",
                }}
              >
                Je kunt vanaf
                00:01
                Curaçao-tijd weer
                nummers spelen.
              </p>
            </div>
          )}

          <div
            style={{
              opacity:
                saleStatus.isOpen
                  ? 1
                  : 0.5,
              pointerEvents:
                saleStatus.isOpen
                  ? "auto"
                  : "none",
            }}
          >

            <div className="gameColumns">

              <GameColumn
                title="4 cijfers"
                type={4}
                games={games[4]}
                disabled={
                  !saleStatus.isOpen
                }
                onAdd={() =>
                  addNumber(4)
                }
                onRemove={(id) =>
                  removeNumber(
                    4,
                    id
                  )
                }
                onNumber={(
                  id,
                  value
                ) =>
                  updateNumber(
                    4,
                    id,
                    value
                  )
                }
                onStake={(
                  id,
                  value
                ) =>
                  updateStake(
                    4,
                    id,
                    value
                  )
                }
              />

              <GameColumn
                title="3 cijfers"
                type={3}
                games={games[3]}
                disabled={
                  !saleStatus.isOpen
                }
                onAdd={() =>
                  addNumber(3)
                }
                onRemove={(id) =>
                  removeNumber(
                    3,
                    id
                  )
                }
                onNumber={(
                  id,
                  value
                ) =>
                  updateNumber(
                    3,
                    id,
                    value
                  )
                }
                onStake={(
                  id,
                  value
                ) =>
                  updateStake(
                    3,
                    id,
                    value
                  )
                }
              />

              <GameColumn
                title="2 cijfers"
                type={2}
                games={games[2]}
                disabled={
                  !saleStatus.isOpen
                }
                onAdd={() =>
                  addNumber(2)
                }
                onRemove={(id) =>
                  removeNumber(
                    2,
                    id
                  )
                }
                onNumber={(
                  id,
                  value
                ) =>
                  updateNumber(
                    2,
                    id,
                    value
                  )
                }
                onStake={(
                  id,
                  value
                ) =>
                  updateStake(
                    2,
                    id,
                    value
                  )
                }
              />

            </div>

          </div>

        </section>

        {/* =================================================
            OVERZICHT
        ================================================= */}

        <section className="contentCard overviewCard">

          <div className="overviewHeader">

            <div>
              <small>
                OVERZICHT
              </small>

              <h2>
                Jouw deelname
              </h2>
            </div>

            <div className="totalStake">

              <span>
                Totale inzet
              </span>

              <strong>
                €{" "}
                {total.toLocaleString(
                  "nl-NL",
                  {
                    minimumFractionDigits:
                      2,
                    maximumFractionDigits:
                      2,
                  }
                )}
              </strong>

            </div>

          </div>

          {selected.length ===
          0 ? (
            <div className="emptyState">
              Nog geen volledig
              ingevulde nummers met
              inzet.
            </div>
          ) : (
            <div className="summaryList">

              {selected.map(
                (item) => (
                  <div
                    className="summaryRow"
                    key={`${item.type}-${item.id}`}
                  >

                    <span>
                      {item.type} cijfers
                    </span>

                    <strong>
                      {item.number}
                    </strong>

                    <span>
                      €{" "}
                      {toAmount(
                        item.stake
                      ).toLocaleString(
                        "nl-NL",
                        {
                          minimumFractionDigits:
                            2,
                          maximumFractionDigits:
                            2,
                        }
                      )}
                    </span>

                  </div>
                )
              )}

            </div>
          )}

          {submitError && (
            <div
              className="loginError"
              style={{
                marginTop: "15px",
              }}
            >
              {submitError}
            </div>
          )}

          <div className="continueArea">

            <button
              type="button"
              className="primaryButton"
              disabled={
                selected.length ===
                  0 ||
                submitting ||
                !saleStatus.isOpen
              }
              onClick={
                handleContinue
              }
            >
              {!saleStatus.isOpen
                ? "Verkoop gesloten"
                : submitting
                ? "Bestelling maken..."
                : "Verder →"}
            </button>

          </div>

        </section>

      </div>
    </main>
  );
}

// ===========================================================
// GAME COLUMN
// ===========================================================

function GameColumn({
  title,
  type,
  games,
  disabled,
  onAdd,
  onRemove,
  onNumber,
  onStake,
}: {
  title: string;
  type: GameType;
  games: Play[];
  disabled: boolean;
  onAdd: () => void;
  onRemove: (
    id: number
  ) => void;
  onNumber: (
    id: number,
    value: string
  ) => void;
  onStake: (
    id: number,
    value: string
  ) => void;
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

        {games.map(
          (item) => (
            <div
              className="numberRow"
              key={item.id}
            >

              <input
                className={
                  item.suggestedFrom
                    ? "numberInput suggestedInput"
                    : "numberInput"
                }
                type="text"
                inputMode="numeric"
                maxLength={type}
                placeholder={
                  "0".repeat(type)
                }
                value={
                  item.number
                }
                disabled={
                  disabled
                }
                onChange={(
                  event
                ) =>
                  onNumber(
                    item.id,
                    event.target
                      .value
                  )
                }
              />

              <div className="stakeInput">

                <span>€</span>

                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={
                    item.stake
                  }
                  disabled={
                    disabled
                  }
                  onChange={(
                    event
                  ) =>
                    onStake(
                      item.id,
                      event.target
                        .value
                    )
                  }
                />

              </div>

              <button
                type="button"
                className="deleteButton"
                disabled={
                  disabled
                }
                onClick={() =>
                  onRemove(
                    item.id
                  )
                }
                aria-label="Nummer verwijderen"
              >
                ×
              </button>

            </div>
          )
        )}

      </div>

      <button
        type="button"
        className="addButton"
        disabled={disabled}
        onClick={onAdd}
      >
        + Nummer
      </button>

    </div>
  );
}

// ===========================================================
// RESULTAAT
// ===========================================================

function ResultCard({
  title,
  number,
}: {
  title: string;
  number: string;
}) {
  const digits =
    String(number)
      .padStart(4, "0")
      .slice(-4)
      .split("");

  return (
    <article className="resultCard">

      <small>{title}</small>

      <div className="resultNumbers">

        {digits.map(
          (digit, index) => (
            <span
              key={index}
            >
              {digit}
            </span>
          )
        )}

      </div>

      <p>
        Officiële gepubliceerde
        uitslag
      </p>

    </article>
  );
}

// ===========================================================
// COUNTDOWN
// ===========================================================

function CountdownNumber({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <strong
        style={{
          display: "block",
          fontSize: "30px",
          lineHeight: 1,
        }}
      >
        {value}
      </strong>

      <small
        style={{
          display: "block",
          marginTop: "6px",
        }}
      >
        {label}
      </small>
    </div>
  );
}
 
