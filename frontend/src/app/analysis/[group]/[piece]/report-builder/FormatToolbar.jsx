import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Square, Underline } from "lucide-react";
import styles from "./reportbuilder.module.css";

export default function FormatToolbar({ element, onUpdate }) {
  const isTextSelected = element && element.type === "text";

  return (
    <div className={styles.formatToolbar}>
      <select
        value={isTextSelected ? element.fontSize : 13}
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
        <Bold size={13} />
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
        <Italic size={13} />
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
        <Underline size={13} />
      </button>

      <button
        onClick={() => isTextSelected && onUpdate(element.id, { textAlign: "left" })}
        className={styles.formatButton}
        disabled={!isTextSelected}
        style={{
          backgroundColor: isTextSelected && element.textAlign === "left" ? "#4299e1" : "#edf2f7",
          color: isTextSelected && element.textAlign === "left" ? "white" : "#4a5568",
          opacity: isTextSelected ? 1 : 0.5,
          cursor: isTextSelected ? "pointer" : "not-allowed"
        }}
      >
        <AlignLeft size={13} />
      </button>

      <button
        onClick={() => isTextSelected && onUpdate(element.id, { textAlign: "center" })}
        className={styles.formatButton}
        disabled={!isTextSelected}
        style={{
          backgroundColor: isTextSelected && element.textAlign === "center" ? "#4299e1" : "#edf2f7",
          color: isTextSelected && element.textAlign === "center" ? "white" : "#4a5568",
          opacity: isTextSelected ? 1 : 0.5,
          cursor: isTextSelected ? "pointer" : "not-allowed"
        }}
      >
        <AlignCenter size={13} />
      </button>

      <button
        onClick={() => isTextSelected && onUpdate(element.id, { textAlign: "right" })}
        className={styles.formatButton}
        disabled={!isTextSelected}
        style={{
          backgroundColor: isTextSelected && element.textAlign === "right" ? "#4299e1" : "#edf2f7",
          color: isTextSelected && element.textAlign === "right" ? "white" : "#4a5568",
          opacity: isTextSelected ? 1 : 0.5,
          cursor: isTextSelected ? "pointer" : "not-allowed"
        }}
      >
        <AlignRight size={13} />
      </button>

      {/*background color*/}
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          onClick={() => { }} //visual, o input fica embaixo
          className={styles.formatButton}
          disabled={!isTextSelected}
          style={{
            backgroundColor: isTextSelected && element.backgroundColor && element.backgroundColor !== "transparent"
              ? element.backgroundColor
              : "#edf2f7",
            color: isTextSelected && element.backgroundColor && element.backgroundColor !== "transparent"
              ? "#fff"
              : "#4a5568",
            opacity: isTextSelected ? 1 : 0.5,
            cursor: isTextSelected ? "pointer" : "not-allowed",
            border: "1px solid #cbd5e0",
          }}
          title="Cor de fundo"
        >
          <Square size={13} />
        </button>

        {/*color picker invisível por cima do botão*/}
        <input
          type="color"
          value={isTextSelected && element.backgroundColor && element.backgroundColor !== "transparent"
            ? element.backgroundColor
            : "#ffffff"}
          onChange={(e) => {
            if (isTextSelected) {
              const newColor = e.target.value;
              onUpdate(element.id, {
                backgroundColor: newColor === "#ffffff" ? "transparent" : newColor
              });
            }
          }}
          className={styles.colorPicker}
          disabled={!isTextSelected}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: isTextSelected ? "pointer" : "not-allowed",
          }}
        />
      </div>

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