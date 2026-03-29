import { AlignCenter, AlignLeft, AlignRight, Baseline, Bold, Italic, PaintBucket, Underline } from "lucide-react";
import styles from "./reportbuilder.module.css";

export default function FormatToolbar({ element, onUpdate }) {
  const isTextSelected = element && element.type === "text";

  //color current of the text (fallback security)
  const currentTextColor = isTextSelected ? (element.color || "#000000") : "#000000";

  //color current of the background
  const currentBgColor = isTextSelected && element.backgroundColor && element.backgroundColor !== "transparent"
    ? element.backgroundColor
    : "#ffffff";

  return (
    <div className={styles.formatToolbar}>
      <select
        value={isTextSelected ? element.fontSize : 18}
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
        <Bold size={18} />
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
        <Italic size={18} />
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
        <Underline size={18} />
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
        <AlignLeft size={18} />
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
        <AlignCenter size={18} />
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
        <AlignRight size={18} />
      </button>

      {/*color text*/}
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          className={styles.formatButton}
          disabled={!isTextSelected}
          style={{
            backgroundColor: "#edf2f7",
            color: currentTextColor,      
            opacity: isTextSelected ? 1 : 0.5,
            cursor: isTextSelected ? "pointer" : "not-allowed",
            border: "1px solid #cbd5e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Cor do texto"
        >
          <Baseline size={19} />
        </button>

        {/*color Picker invisível */}
        <input
          type="color"
          value={currentTextColor}
          onChange={(e) => isTextSelected && onUpdate(element.id, { color: e.target.value })}
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

      {/*backgrownd*/}
      <div style={{ position: "relative", display: "inline-block" }}>
        <button
          className={styles.formatButton}
          disabled={!isTextSelected}
          style={{
            backgroundColor: currentBgColor,           //fundo muda com a cor escolhida
            color: currentBgColor === "#ffffff" || currentBgColor === "transparent"
              ? "#4a5568"
              : "#fff",                               //texto do ícone fica branco se fundo escuro
            opacity: isTextSelected ? 1 : 0.5,
            cursor: isTextSelected ? "pointer" : "not-allowed",
            border: "1px solid #cbd5e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center", 
          }}
          title="Cor de fundo"
        >
          <PaintBucket size={19} />
        </button>

        <input
          type="color"
          value={currentBgColor === "transparent" ? "#ffffff" : currentBgColor}
          onChange={(e) => {
            if (isTextSelected) {
              const newColor = e.target.value;
              onUpdate(element.id, {
                backgroundColor: newColor === "#ffffff" ? "transparent" : newColor
              });
            }
          }}
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

    </div>
  );
}