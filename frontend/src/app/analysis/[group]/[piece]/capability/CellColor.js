//lógica de cores das células da tabela

import styles from "./capability.module.css";

export function cellColor(val) {
  if (val == null) return "";
  const n = parseFloat(val);
  if (n >= 1.33) return styles.cellGreen;
  if (n >= 1.0)  return styles.cellYellow;
  return styles.cellRed;
}

export function xmedColor(val, tol) {
  if (val == null || tol == null) return "";
  return Math.abs(parseFloat(val)) > Math.abs(parseFloat(tol)) * 0.5
    ? styles.cellYellow
    : styles.cellGreen;
}  
 
 