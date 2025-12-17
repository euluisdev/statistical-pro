export function SaveChartModal({ 
  show, 
  onClose, 
  onConfirm, 
  loading, 
  jobId, 
  group, 
  piece,
  chartType = "CG"
}) {
  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "12px",
        maxWidth: "500px",
        width: "90%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
      }}>
        <h3 style={{ marginBottom: "1rem", color: "#2d3748" }}>
          💾 Salvar Gráfico {chartType} no Job
        </h3>

        <p style={{ marginBottom: "1.5rem", color: "#4a5568", lineHeight: "1.6" }}>
          Deseja salvar este gráfico no Job atual?<br />
          <strong>Job ID:</strong> <code style={{
            backgroundColor: "#edf2f7",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.9em"
          }}>{jobId}</code><br />
          <strong>Grupo:</strong> {group}<br />
          <strong>Peça:</strong> {piece}<br />
          <strong>Tipo:</strong> {chartType}
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e0",
              backgroundColor: "white",
              color: "#4a5568",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.95rem"
            }}
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: loading ? "#a0aec0" : "#48bb78",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.95rem",
              fontWeight: "500"
            }}
          >
            {loading ? "⏳ Salvando..." : "✓ Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}  
 
 