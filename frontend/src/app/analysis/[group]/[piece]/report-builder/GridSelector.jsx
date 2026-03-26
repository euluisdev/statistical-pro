import { Grid } from "lucide-react";
import { GRID_LAYOUTS } from "./gridSnap";

export default function GridSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <Grid size={15} color="#4a5568" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          padding: "0.4rem 0.5rem",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          fontSize: "0.82rem",
          color: "#2d3748",
          background: "#fff",
          cursor: "pointer",
          outline: "none",
        }}
        title="Layout da grade — define onde as imagens se encaixam ao soltar"
      >
        {GRID_LAYOUTS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}