import { FileText, LoaderCircle, CheckCircle2 } from "lucide-react";
import styles from "./ExportProgressModal.module.css";

export default function ExportProgressModal({
  exporting,
  progress,
}) {
  if (!exporting) return null;

  const total = Number(progress?.total) || 0;
  const done = Number(progress?.done) || 0;

  const isMerging = progress?.status === "merging";
  const isDone = progress?.status === "done";

  const percentage =
    total > 0
      ? Math.min(Math.round((done / total) * 100), 100)
      : 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.iconWrapper}>
          {isDone ? (
            <CheckCircle2 size={30} />
          ) : (
            <LoaderCircle
              size={30}
              className={styles.spinner}
            />
          )}
        </div>

        <div className={styles.content}>
          <h2>
            {isMerging
              ? "Finalizando relatório"
              : "Gerando relatório"}
          </h2>

          <p className={styles.description}>
            {isMerging
              ? "Juntando as páginas do relatório..."
              : total > 0
                ? `Exportando página ${done} de ${total}`
                : "Preparando documento..."}
          </p>

          {!isMerging && (
            <div className={styles.progressArea}>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className={styles.progressInfo}>
                <span>{percentage}%</span>

                {total > 0 && (
                  <span>
                    {done}/{total}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className={styles.status}>
            <FileText size={15} />

            <span>
              {isMerging
                ? "Preparando arquivo final"
                : "Não feche esta janela enquanto o relatório é gerado"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}  
 
 
 