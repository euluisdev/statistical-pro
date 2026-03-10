"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import styles from "./capability.module.css";
import { uid, clamp } from "./Helpers";
import CanvasPage, { CANVAS_W, CANVAS_H } from "./CanvasPage";
import ConfigModal from "./ConfigModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function CapabilityPage() {
  const { group, piece } = useParams();
  const router = useRouter();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [locked,       setLocked]       = useState(false);
  const [pages,        setPages]        = useState([]);
  const [activePage,   setActivePage]   = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);

  //carrega layout salvo do backend ao montar
  useEffect(() => {
    fetch(`${API}/pieces/${group}/${piece}/capability-layout`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.pages) { setPages(d.pages); setLocked(d.locked ?? false); }
      })
      .catch(() => {});
  }, [group, piece]);

  //persiste layout in the backend (debounced 800ms)
  const saveTimer = useRef(null);
  const persistLayout = useCallback((newPages, newLocked) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`${API}/pieces/${group}/${piece}/capability-layout`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ pages: newPages, locked: newLocked }),
      }).catch(() => {});
    }, 800);
  }, [group, piece]);

  //gera o relatório a partir das seleções do modal
  const handleApply = ({ numPages, selections }) => {
    const newPages = Array.from({ length: numPages }, (_, pi) => {
      const existingPage = pages[pi] ?? {};
      const cards = selections
        .filter((s) => s.axes.some((a) => a.pageIdx === pi))
        .map((s) => {
          const existing = existingPage.cards?.find((c) => c.point === s.pointId);
          const spreadX  = 40 + (selections.indexOf(s) % 4) * 270;
          const spreadY  = 40 + Math.floor(selections.indexOf(s) / 4) * 140;
          return {
            id:         existing?.id          ?? uid(),
            point:      s.pointId,
            axes:       s.axes.filter((a) => a.pageIdx === pi),
            x:          existing?.x           ?? spreadX,
            y:          existing?.y           ?? spreadY,
            connectorX: existing?.connectorX  ?? (spreadX + 130),
            connectorY: existing?.connectorY  ?? (spreadY - 40),
          };
        });
      return { cards, bgImage: existingPage.bgImage ?? null };
    });
    setPages(newPages);
    setActivePage(0);
    persistLayout(newPages, locked);
  };

  //drag handlers
  const handleCardDrag = useCallback((cardId, nx, ny) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, pi) => {
        if (pi !== activePage) return pg;
        return {
          ...pg, cards: pg.cards.map((c) =>
            c.id === cardId
              ? { ...c, x: clamp(nx, 0, CANVAS_W - 260), y: clamp(ny, 0, CANVAS_H - 80) }
              : c
          ),
        };
      });
      persistLayout(next, locked);
      return next;
    });
  });

  const handleConnectorDrag = useCallback((cardId, nx, ny) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, pi) => {
        if (pi !== activePage) return pg;
        return {
          ...pg, cards: pg.cards.map((c) =>
            c.id === cardId
              ? { ...c, connectorX: clamp(nx, 0, CANVAS_W), connectorY: clamp(ny, 0, CANVAS_H) }
              : c
          ),
        };
      });
      persistLayout(next, locked);
      return next;
    });
  });

  const handleImageDrop = useCallback((pageIdx, dataUrl) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, i) => i === pageIdx ? { ...pg, bgImage: dataUrl } : pg);
      persistLayout(next, locked);
      return next;
    });
  });

  //cadeado    #
  const toggleLock = () => {
    const next = !locked;
    setLocked(next);
    persistLayout(pages, next);
  };

  const currentPage = pages[activePage];

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>

        {/*toolbar */}
        <div className={styles.toolbar}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>← Voltar</button>

          <div className={styles.toolbarCenter}>
            <span className={styles.toolbarTitle}>CAPABILITY REPORT</span>
            <span className={styles.toolbarSub}>{group} / {piece}</span>
          </div>

          <div className={styles.toolbarRight}>
            <button
              className={`${styles.lockBtn} ${locked ? styles.lockBtnLocked : styles.lockBtnOpen}`}
              onClick={toggleLock}
              title={locked
                ? "Relatório travado — clique para editar"
                : "Clique para travar o relatório"}
            >
              {locked ? "🔒 Travado" : "🔓 Editando"}
            </button>

            <button className={styles.openBtn} onClick={() => setModalOpen(true)}>
              ⚙ Configurar
            </button>
          </div>
        </div>

        {/*páginas */}
        {pages.length > 0 && (
          <div className={styles.pageTabs}>
            {pages.map((_, i) => (
              <button
                key={i}
                className={`${styles.pageTab} ${i === activePage ? styles.pageTabActive : ""}`}
                onClick={() => setActivePage(i)}
              >
                Página {i + 1}
              </button>
            ))}
          </div>
        )}

        {/*canvas */}
        {pages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📊</div>
            <p>Clique em <strong>⚙ Configurar</strong> para montar o relatório</p>
          </div>
        ) : currentPage ? (
          <div className={styles.canvasWrapper}>
            {!locked && (
              <label className={styles.imgUploadBtn}
                title="Ou arraste uma imagem direto no canvas">
                🖼 Importar Imagem
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => handleImageDrop(activePage, ev.target.result);
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            )}

            <CanvasPage
              pageIndex={activePage}
              cards={currentPage.cards ?? []}
              locked={locked}
              bgImage={currentPage.bgImage}
              onDrop={handleImageDrop}
              onCardDrag={handleCardDrag}
              onConnectorDrag={handleConnectorDrag}
              selectedCardId={selectedCard}
              onSelectCard={setSelectedCard}
            />

            {!locked && (
              <div className={styles.canvasHint}>
                💡 Arraste as tabelas e os pontos de conexão (•) para posicioná-los.
                Arraste uma imagem da peça para o sistema.
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/*modal*/}
      {modalOpen && (
        <ConfigModal
          group={group}
          piece={piece}
          totalPages={pages.length || 1}
          onClose={() => setModalOpen(false)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}

export default memo(CapabilityPage);
 
 