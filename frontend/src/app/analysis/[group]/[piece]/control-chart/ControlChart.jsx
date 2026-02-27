"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./controlchart.module.css";

export default function ControlChart({ params }) {
  const { group, piece } = params;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>

        <button className={styles.backBtn} onClick={() => router.push("/")}>
          ←
        </button>

        <button className={styles.openBtn} onClick={() => setOpen(true)}>
          Abrir
        </button>

        {/* Header */}
        <div className={styles.header}>
          <h1>CONTROL CHART</h1>
          <h2>{group} – {piece}</h2>
        </div>

        <div className={styles.divider}></div>

        {/* Parte superior */}
        <div className={styles.topSection}> 

          <div className={styles.leftBox}></div>

          <div className={styles.centerBox}></div>

          <div className={styles.rightPanel}>
            <div className={styles.infoRow}><span>CP</span><div></div></div>
            <div className={styles.infoRow}><span>AVERAGE</span><div></div></div>
            <div className={styles.infoRow}><span>LIE</span><div></div></div>
            <div className={styles.infoRow}><span>LIC</span><div></div></div>

            <div className={styles.infoRow}><span>CPK</span><div></div></div>
            <div className={styles.infoRow}><span>RANGE</span><div></div></div>
            <div className={styles.infoRow}><span>LSE</span><div></div></div>
            <div className={styles.infoRow}><span>LSC</span><div></div></div>
          </div>

        </div>

        {/* Gráfico inferior */}
        <div className={styles.bottomChart}></div>

      </div>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Modal</h3>
            <button onClick={() => setOpen(false)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
 
 