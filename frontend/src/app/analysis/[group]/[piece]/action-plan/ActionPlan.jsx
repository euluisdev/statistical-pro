"use client";

import styles from "./actionplan.module.css";
import { Grid3x3 } from "lucide-react";
import { useRouter } from "next/navigation";

/* semana atual automática */
function getCurrentWeek() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

export default function ActionPlan({ params }) {
  const { group, piece } = params;
  const router = useRouter();

  const currentWeek = getCurrentWeek();
  const startWeek = 5;
  const totalWeeks = 10;

  return (
    <div className={styles.pageContainer}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          ACTION PLAN – {group} – {piece}
        </h1>

        <button
          className={styles.backBtn}
          onClick={() => router.push(`/analysis/${group}/${piece}`)}
        >
          <Grid3x3 size={26} />
        </button>
      </div>

      {/* TABELA */}
      <div className={styles.table}>
        {/* HEADER DA TABELA */}
        <div className={styles.rowHeader}>
          <div>SEQ</div>
          <div>LABEL</div>
          <div>AXIS</div>
          <div>LSE</div>
          <div>LIE</div>
          <div>SYMBOL</div>
          <div>X̄</div>
          <div>CP</div>
          <div>CPK</div>
          <div>RANGE</div>
          <div className={styles.actionCol}>ACTION PLAN</div>
          <div>RESP.</div>

          {Array.from({ length: totalWeeks }, (_, i) => {
            const week = startWeek + i;
            return (
              <div
                key={week}
                className={week === currentWeek ? styles.weekActive : ""}
              >
                {week.toString().padStart(2, "0")}
              </div>
            );
          })}

          <div>STATUS</div>
        </div>

        {/* LINHA EXEMPLO (vazia, como na imagem) */}
        <div className={styles.row}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div className={styles.actionCol}></div>
          <div></div>

          {Array.from({ length: totalWeeks }, (_, i) => {
            const week = startWeek + i;
            return (
              <div
                key={week}
                className={week === currentWeek ? styles.weekActive : ""}
              ></div>
            );
          })}

          <div></div>
        </div>
      </div>
    </div>
  );
}