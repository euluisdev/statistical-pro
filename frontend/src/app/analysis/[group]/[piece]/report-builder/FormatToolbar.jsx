import { Bold, Italic, Underline } from "lucide-react";
import styles from "./reportbuilder.module.css";

export default function FormatToolbar({ element, onUpdate }) {
  const isTextSelected = element && element.type === "text";

  return (
    <div className={styles.formatToolbar}>
      <select
        value={isTextSelected ? element.fontSize : 16}
        onChange={(e) => isTextSelected && onUpdate(element.id, { fontSize: Number(e.target.value) })}
        className={styles.fontSizeSelect}
        disabled={!isTextSelected}
        style={{ opacity: isTextSelected ? 1 : 0.5 }}
      >
        {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
          <option key={size} value={size}>{size}px</option>
        ))}
      </select>

      <button
        onClick={() => isTextSelected && onUpdate(element.id, {
          fontWeight: element.fontWeight === "bold" ? "normal" : "bold"
        })}
        className={styles.formatButton}
        disabled={!isTextSelected}
        style={{
          backgroundColor: isTextSelected && element.fontWeight === "bold" ? "#4299e1" : "#edf2f7",
          color: isTextSelected && element.fontWeight === "bold" ? "white" : "#4a5568",
          opacity: isTextSelected ? 1 : 0.5,
          cursor: isTextSelected ? "pointer" : "not-allowed"
        }}
      >
        <Bold size={16} />
      </button>

      <button
        onClick={() => isTextSelected && onUpdate(element.id, {
          fontStyle: element.fontStyle === "italic" ? "normal" : "italic"
        })}
        className={styles.formatButton}
        disabled={!isTextSelected}
        style={{
          backgroundColor: isTextSelected && element.fontStyle === "italic" ? "#4299e1" : "#edf2f7",
          color: isTextSelected && element.fontStyle === "italic" ? "white" : "#4a5568",
          opacity: isTextSelected ? 1 : 0.5,
          cursor: isTextSelected ? "pointer" : "not-allowed"
        }}
      >
        <Italic size={16} />
      </button>

      <button
        onClick={() => isTextSelected && onUpdate(element.id, {
          textDecoration: element.textDecoration === "underline" ? "none" : "underline"
        })}
        className={styles.formatButton}
        disabled={!isTextSelected}
        style={{
          backgroundColor: isTextSelected && element.textDecoration === "underline" ? "#4299e1" : "#edf2f7",
          color: isTextSelected && element.textDecoration === "underline" ? "white" : "#4a5568",
          opacity: isTextSelected ? 1 : 0.5,
          cursor: isTextSelected ? "pointer" : "not-allowed"
        }}
      >
        <Underline size={16} />
      </button>

      <input
        type="color"
        value={isTextSelected ? element.color : "#000000"}
        onChange={(e) => isTextSelected && onUpdate(element.id, { color: e.target.value })}
        className={styles.colorPicker}
        disabled={!isTextSelected}
        style={{ 
          opacity: isTextSelected ? 1 : 0.5,
          cursor: isTextSelected ? "pointer" : "not-allowed"
        }}
      />
    </div>
  );
}