import { Plus, Layers, Copy, Trash2 } from "lucide-react";
import styles from "./reportbuilder.module.css";

export default function PagesSidebar({ 
  pages, 
  currentPageIndex, 
  currentJobId,
  API,
  onPageSelect,
  onAddPage,
  onDuplicatePage,
  onDeletePage 
}) {
  return (
    <div className={styles.pagesSidebar}>
      <div className={styles.pagesHeader}>
        <h3 className={styles.pagesTitle}>
          <Layers size={16} style={{ verticalAlign: "middle", marginRight: "0.3rem" }} />
          Páginas
        </h3>
        <button onClick={onAddPage} className={styles.addPageButton}>
          <Plus size={16} />
        </button>
      </div>

      <div className={styles.pagesContent}>
        {pages.map((page, index) => (
          <div
            key={page.id}
            onClick={() => onPageSelect(index)}
            className={styles.pageItem}
            style={{
              border: currentPageIndex === index ? "2px solid #4299e1" : "1px solid #e2e8f0",
              backgroundColor: currentPageIndex === index ? "#ebf8ff" : "white"
            }}
          >
            <div className={styles.pagePreview}>
              <div className={styles.pagePreviewContent}>
                {page.elements.map((el) => (
                  <div
                    key={el.id}
                    className={styles.pagePreviewElement}
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: el.type === "text" ? `${el.height}px` : "auto",
                      backgroundColor: el.type === "text" ? "#e2e8f0" : "transparent"
                    }}
                  >
                    {el.type === "image" && (
                      <img
                        src={`${API}/static/jobs/${currentJobId}/${el.chart.group}/${el.chart.filename}`}
                        alt=""
                        style={{ width: "100%", height: "auto" }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    {el.type === "external-image" && (
                      <img
                        src={el.src}
                        alt=""
                        style={{ width: "100%", height: "auto" }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.pageInfo}>
              <span className={styles.pageNumber}>Página {index + 1}</span>
              <div className={styles.pageActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicatePage(index);
                  }}
                  className={styles.pageActionButton}
                  style={{ backgroundColor: "#edf2f7" }}
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(index);
                  }}
                  className={styles.pageActionButton}
                  style={{ backgroundColor: "#fed7d7" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
