"use client";

import { Loader2 } from "lucide-react";
import styles from "./LoadingOverlay.module.css";

export default function LoadingOverlay({ text = "Gerando imagem..." }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <Loader2 className={styles.spinner} size={42} />
        <span>{text}</span>
      </div>
    </div>
  );
}  
 
 
