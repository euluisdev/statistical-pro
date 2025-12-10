import { Type } from "lucide-react";
import styles from "./reportbuilder.module.css";

export default function LibrarySidebar({ 
  currentJobId, 
  availableCharts, 
  loading, 
  onAddTextBox,
  onDragStart 
}) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}>📚 Biblioteca de Assets</h3>
        <p className={styles.sidebarSubtitle}>Job: {currentJobId?.slice(0, 8)}...</p>
      </div>

      <div className={styles.librarySection}>
        <button onClick={onAddTextBox} className={styles.addTextButton}>
          <Type size={16} />
          Nova Caixa de Texto
        </button>
      </div>

      <div className={styles.libraryContent}>
        <h4 className={styles.libraryTitle}>
          Imagens Salvas ({availableCharts.length})
        </h4>

        {loading ? (
          <p style={{ color: "#718096", fontSize: "0.85rem" }}>Carregando...</p>
        ) : availableCharts.length === 0 ? (
          <p style={{ color: "#a0aec0", fontSize: "0.8rem", lineHeight: "1.4" }}>
            Nenhuma imagem. Salve gráficos nas páginas de análise.
          </p>
        ) : (
          <div>
            {availableCharts.map((chart, idx) => (
              <div
                key={idx}
                draggable
                onDragStart={(e) => onDragStart(e, chart)}
                className={styles.chartItem}
              >
                📊 {chart.filename}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
