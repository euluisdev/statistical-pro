import { Bold, Italic, Underline } from "lucide-react";
import styles from "./reportbuilder.module.css";

export default function FormatToolbar({ element, onUpdate }) {
  if (!element || element.type !== "text") return null;

  return (
    <div className={styles.formatToolbar}>
      <select
        value={element.fontSize}
        onChange={(e) => onUpdate(element.id, { fontSize: Number(e.target.value) })}
        className={styles.fontSizeSelect}
      >
        {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
          <option key={size} value={size}>{size}px</option>
        ))}
      </select>

      <button
        onClick={() => onUpdate(element.id, {
          fontWeight: element.fontWeight === "bold" ? "normal" : "bold"
        })}
        className={styles.formatButton}
        style={{
          backgroundColor: element.fontWeight === "bold" ? "#4299e1" : "#edf2f7",
          color: element.fontWeight === "bold" ? "white" : "#4a5568"
        }}
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => onUpdate(element.id, {
          fontStyle: element.fontStyle === "italic" ? "normal" : "italic"
        })}
        className={styles.formatButton}
        style={{
          backgroundColor: element.fontStyle === "italic" ? "#4299e1" : "#edf2f7",
          color: element.fontStyle === "italic" ? "white" : "#4a5568"
        }}
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() => onUpdate(element.id, {
          textDecoration: element.textDecoration === "underline" ? "none" : "underline"
        })}
        className={styles.formatButton}
        style={{
          backgroundColor: element.textDecoration === "underline" ? "#4299e1" : "#edf2f7",
          color: element.textDecoration === "underline" ? "white" : "#4a5568"
        }}
      >
        <Underline size={16} />
      </button>

      <input
        type="color"
        value={element.color}
        onChange={(e) => onUpdate(element.id, { color: e.target.value })}
        className={styles.colorPicker}
      />
    </div>
  );
} 
