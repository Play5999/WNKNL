"use client";

import { useEffect, useMemo, useState } from "react";
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

function getCuracaoParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
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

  const parts = formatter.formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value || "";

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

function curacaoMoment(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
) {
  // Curaçao is UTC-4 throughout the year.
  return new Date(Date.UTC(year, month - 1, day, hour + 4, minute, 0));
}

function getSchedule(now = new Date()) {
  const p = getCuracaoParts(now);
  const sunday = p.weekday === "Sun";

  const drawHour = sunday ? 17 : 21;
  const drawMinute = sunday ? 30 : 0;
  const closeHour = sunday ? 16 : 20;
  const closeMinute = sunday ? 30 : 0;

  const nowMinutes = p.hour * 60 + p.minute;
  const closeMinutes = closeHour * 60 + closeMinute;
  const isOpen = nowMinutes >= 1 && nowMinutes < closeMinutes;

  const drawMoment = curacaoMoment(
    p.year,
    p.month,
    p.day,
    drawHour,
    drawMinute
  );

  const closeMoment = curacaoMoment(
    p.year,
    p.month,
    p.day,
    closeHour,
    closeMinute
  );

  const todayMidnight = curacaoMoment(
    p.year,
    p.month,
    p.day,
    0,
    0
  );

  const nextOpenMoment = new Date(
    todayMidnight.getTime() + 24 * 60 * 60 * 1000 + 60 * 1000
  );

  return {
    sunday,
    isOpen,
    drawMoment,
    closeMoment,
    nextOpenMoment,
    drawCuracao: sunday ? "17:30" : "21:00",
    closeCuracao: sunday ? "16:30" : "20:00",
  };
}

function formatNlTime(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

function formatNlDate(date: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    timeZone: "Europe/Amsterdam",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatCountdown(ms: number) {
  const secondsTotal = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(secondsTotal / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function formatDrawDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

let nextId = 10;

function newPlay(): Play {
  return {
    id: nextId++,
    number: "",
    stake: "",
  };
}

export default function Home() {
  const router = useRouter();

  const [games, setGames] = useState<Games>({
    4: [newPlay()],
    3: [newPlay()],
    2: [newPlay()],
  });

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [latestDraw, setLatestDraw] =
    useState<Draw | null>(null);

  const [drawLoading, setDrawLoading] =
    useState(true);

  const [now, setNow] =
    useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadLatestDraw() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("draws")
        .select(
          "id, draw_date, first_prize, second_prize, third_prize, status"
        )
        .eq("status", "published")
        .order("draw_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Uitslag laden mislukt:", error);
        setLatestDraw(null);
      } else {
        setLatestDraw(data as Draw | null);
      }

      setDrawLoading(false);
    }

    loadLatestDraw();
  }, []);

  const schedule = useMemo(() => getSchedule(now), [now]);

  const countdownTarget = schedule.isOpen
    ? schedule.drawMoment
    : schedule.nextOpenMoment;

  const countdown = formatCountdown(
    countdownTarget.getTime() - now.getTime()
  );


  function addNumber(type: GameType) {
    setGames((current) => ({
      ...current,
      [type]: [...current[type], newPlay()],
    }));
  }

  function removeNumber(
    type: GameType,
    id: number
  ) {
    setGames((current) => {
      const updated: Games = {
        4: current[4].map((item) => ({
          ...item,
        })),
        3: current[3].map((item) => ({
          ...item,
        })),
        2: current[2].map((item) => ({
          ...item,
        })),
      };

      if (type === 4) {
        updated[3] = updated[3].filter(
          (item) =>
            item.suggestedFrom !== id
        );

        updated[2] = updated[2].filter(
          (item) =>
            item.suggestedFrom !== id
        );
      }

      updated[type] =
        updated[type].filter(
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
        4: current[4].map((item) => ({
          ...item,
        })),
        3: current[3].map((item) => ({
          ...item,
        })),
        2: current[2].map((item) => ({
          ...item,
        })),
      };

      const item =
        updated[type].find(
          (entry) => entry.id === id
        );

      if (!item) {
        return current;
      }

      item.number = clean;

      if (type === 3 || type === 2) {
        item.suggestedFrom = undefined;
        return updated;
      }

      ([3, 2] as const).forEach(
        (targetType) => {
          const existingSuggestion =
            updated[targetType].find(
              (entry) =>
                entry.suggestedFrom === id
            );

          if (clean.length !== 4) {
            if (existingSuggestion) {
              existingSuggestion.number = "";
            }

            return;
          }

          const suggestion =
            clean.slice(-targetType);

          if (existingSuggestion) {
            existingSuggestion.number =
              suggestion;

            return;
          }

          const emptyRow =
            updated[targetType].find(
              (entry) =>
                entry.number === "" &&
                entry.stake === "" &&
                entry.suggestedFrom ===
                  undefined
            );

          if (emptyRow) {
            emptyRow.number = suggestion;
            emptyRow.suggestedFrom = id;

            return;
          }

          updated[targetType].push({
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

      [type]: current[type].map(
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

  function toAmount(value: string) {
    const amount = Number(
      value.replace(",", ".")
    );

    return Number.isFinite(amount)
      ? amount
      : 0;
  }

  const selected = useMemo(() => {
    return (
      [4, 3, 2] as GameType[]
    ).flatMap((type) =>
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
    (sum, item) =>
      sum + toAmount(item.stake),
    0
  );

  async function handleContinue() {
    if (
      selected.length === 0 ||
      submitting
    ) {
      return;
    }

    const currentSchedule = getSchedule(new Date());

    if (!currentSchedule.isOpen) {
      setSubmitError(
        "De verkoop voor vandaag is gesloten. Je kunt vanaf 00:01 Curaçao-tijd weer spelen."
      );
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        setSubmitting(false);

        router.push("/login");
        return;
      }

      const entries = selected.map(
        (item) => ({
          number_type: item.type,
          played_number: item.number,
          stake: toAmount(item.stake),
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

      if (!order?.order_id) {
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

  return (
    <main>
      <div className="siteContainer pageContent">

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.65fr) minmax(280px, 0.85fr)",
            gap: "14px",
            marginBottom: "18px",
          }}
          className="homeTopGrid"
        >
          <article
            className="contentCard"
            style={{ padding: "18px 20px", margin: 0 }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "14px",
              }}
            >
              <div>
                <small style={{ fontWeight: 900, color: "#0057b8" }}>
                  LAATSTE TREKKING
                  {latestDraw ? ` · ${formatDrawDate(latestDraw.draw_date)}` : ""}
                </small>
              </div>

              <a
                href="/uitslagen"
                style={{
                  fontWeight: 800,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Alle uitslagen →
              </a>
            </div>

            {drawLoading ? (
              <div className="emptyState">Uitslag laden...</div>
            ) : latestDraw ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "10px",
                }}
              >
                <CompactResult title="1e prijs" number={latestDraw.first_prize} />
                <CompactResult title="2e prijs" number={latestDraw.second_prize} />
                <CompactResult title="3e prijs" number={latestDraw.third_prize} />
              </div>
            ) : (
              <div className="emptyState">
                Er is nog geen gepubliceerde uitslag.
              </div>
            )}
          </article>

          <article
            className="contentCard"
            style={{ padding: "18px 20px", margin: 0 }}
          >
            <small style={{ fontWeight: 900, color: "#0057b8" }}>
              VOLGENDE TREKKING
            </small>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >
              <strong style={{ fontSize: "25px", lineHeight: 1 }}>
                {schedule.isOpen ? `Nog ${countdown}` : `Open over ${countdown}`}
              </strong>

              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: "999px",
                  fontWeight: 900,
                  fontSize: "13px",
                  background: schedule.isOpen ? "#dcfce7" : "#fee2e2",
                  color: schedule.isOpen ? "#15803d" : "#b91c1c",
                }}
              >
                {schedule.isOpen ? "● Spelen geopend" : "● Verkoop gesloten"}
              </span>
            </div>

            <div style={{ marginTop: "13px", fontSize: "14px", lineHeight: 1.55 }}>
              <div>
                Trekking:{" "}
                <strong>{formatNlTime(schedule.drawMoment)} NL-tijd</strong>
                {" · "}
                {formatNlDate(schedule.drawMoment)}
              </div>

              <div>
                Verkoop sluit:{" "}
                <strong>{formatNlTime(schedule.closeMoment)} NL-tijd</strong>
              </div>

              <div style={{ marginTop: "4px", opacity: 0.72, fontSize: "12px" }}>
                Curaçao: trekking {schedule.drawCuracao} · sluit{" "}
                {schedule.closeCuracao}
              </div>
            </div>
          </article>
        </section>

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
              Kies zelf je 4-, 3- of
              2-cijferige nummers en bepaal
              je inzet per nummer.
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


        <section
          className="contentCard"
          id="spelen"
        >

          <div className="sectionHeading">

            <small>SPELEN</small>

            <h2>Jouw nummers</h2>

            <p>
              Vul je nummers en inzet in.
              Bij een 4-cijferig nummer
              worden de laatste 3 en 2
              cijfers automatisch
              voorgesteld.
            </p>

          </div>


          <div className="gameColumns">

            <GameColumn
              title="4 cijfers"
              type={4}
              games={games[4]}
              onAdd={() =>
                addNumber(4)
              }
              onRemove={(id) =>
                removeNumber(4, id)
              }
              onNumber={(id, value) =>
                updateNumber(
                  4,
                  id,
                  value
                )
              }
              onStake={(id, value) =>
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
              onAdd={() =>
                addNumber(3)
              }
              onRemove={(id) =>
                removeNumber(3, id)
              }
              onNumber={(id, value) =>
                updateNumber(
                  3,
                  id,
                  value
                )
              }
              onStake={(id, value) =>
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
              onAdd={() =>
                addNumber(2)
              }
              onRemove={(id) =>
                removeNumber(2, id)
              }
              onNumber={(id, value) =>
                updateNumber(
                  2,
                  id,
                  value
                )
              }
              onStake={(id, value) =>
                updateStake(
                  2,
                  id,
                  value
                )
              }
            />

          </div>

        </section>


        <section className="contentCard overviewCard">

          <div className="overviewHeader">

            <div>
              <small>OVERZICHT</small>

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
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </strong>

            </div>

          </div>


          {selected.length === 0 ? (

            <div className="emptyState">
              Nog geen volledig ingevulde
              nummers met inzet.
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
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
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
                selected.length === 0 ||
                submitting ||
                !schedule.isOpen
              }
              onClick={handleContinue}
            >
              {!schedule.isOpen
                ? "Verkoop gesloten"
                : submitting
                ? "Bestelling maken..."
                : "Verder →"}
            </button>

          </div>

        </section>




        <style jsx>{`
          @media (max-width: 820px) {
            .homeTopGrid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
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

        {games.map((item) => (

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
              value={item.number}
              onChange={(event) =>
                onNumber(
                  item.id,
                  event.target.value
                )
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
                  onStake(
                    item.id,
                    event.target.value
                  )
                }
              />

            </div>


            <button
              type="button"
              className="deleteButton"
              onClick={() =>
                onRemove(item.id)
              }
              aria-label="Nummer verwijderen"
            >
              ×
            </button>

          </div>

        ))}

      </div>


      <button
        type="button"
        className="addButton"
        onClick={onAdd}
      >
        + Nummer
      </button>

    </div>
  );
}


function CompactResult({
  title,
  number,
}: {
  title: string;
  number: string;
}) {
  const digits = String(number)
    .padStart(4, "0")
    .slice(-4)
    .split("");

  return (
    <div>
      <small
        style={{
          display: "block",
          marginBottom: "7px",
          fontWeight: 900,
          color: "#0057b8",
        }}
      >
        {title}
      </small>

      <div
        style={{
          display: "flex",
          gap: "4px",
          flexWrap: "nowrap",
        }}
      >
        {digits.map((digit, index) => (
          <span
            key={index}
            style={{
              width: "30px",
              height: "36px",
              display: "grid",
              placeItems: "center",
              borderRadius: "6px",
              background: "#063b87",
              color: "#ffd500",
              fontWeight: 900,
              fontSize: "17px",
            }}
          >
            {digit}
          </span>
        ))}
      </div>
    </div>
  );
}
