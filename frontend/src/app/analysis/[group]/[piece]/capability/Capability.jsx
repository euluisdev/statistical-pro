"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import styles from "./capability.module.css";
import { uid, clamp } from "./Helpers";
import CanvasPage, { CANVAS_W, CANVAS_H } from "./CanvasPage";
import ConfigModal from "./ConfigModal";
import { Camera, Grid3x3, LockKeyhole, LockKeyholeOpen, Settings } from "lucide-react";
/* import { useSaveCapabilityToJob } from "@/app/hooks/useSaveCapabilityToJob"; */

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CapabilityPage() {
  const { group, piece } = useParams();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [pages, setPages] = useState([]);
  const [activePage, setActivePage] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);

  //num pages
  const [savedModalSelections, setSavedModalSelections] = useState(null);
  const [savedModalNumPages, setSavedModalNumPages] = useState(null);

/* const { triggerSave } = useSaveCapabilityToJob(pages, CanvasPage); */

  //here eu carrego layout salvo do backend ao montar
  useEffect(() => {
    fetch(`${API}/pieces/${group}/${piece}/capability-layout`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) return;
        if (d.pages) setPages(d.pages);
        if (d.locked != null) setLocked(d.locked);
        //restaura estado do modal se foi salvo com o layout
        if (d.modalSelections) setSavedModalSelections(d.modalSelections);
        if (d.modalNumPages) setSavedModalNumPages(d.modalNumPages);
      })
      .catch(() => { });
  }, [group, piece]);

  //here persisto layout + estado do modal no backend -debounced 800ms
  const saveTimer = useRef(null);
  const persistLayout = useCallback((newPages, newLocked, modalSelections, modalNumPages) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`${API}/pieces/${group}/${piece}/capability-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pages: newPages,
          locked: newLocked,
          modalSelections,  // estado bruto do modal para restaurar depois
          modalNumPages,
        }),
      }).catch(() => { });
    }, 800);
  }, [group, piece]);

  //diff inteligente ao aplicar o modal 
  //ponto/eixo que já existia na same page - preserva posição - x, y, connector X/Y
  //ponto/eixo moved of page - remove da antiga and adiciona in the new -position default
  //ponto/eixo new - add with position default
  //ponto/eixo removed -some do canvas
  //page new - canvas vazio sem img
  //page removida - descarta
  //img das pages sempre preservadas
  const handleApply = useCallback(({ numPages, selections, rawSelections }) => {
    //save estate bruto do modal
    setSavedModalSelections(rawSelections);
    setSavedModalNumPages(numPages);

    setPages((prevPages) => {
      const newPages = Array.from({ length: numPages }, (_, pi) => {
        const existingPage = prevPages[pi] ?? {};

        const cards = selections
          .filter((s) => s.axes.some((a) => a.pageIdx === pi))
          .map((s) => {
            const axesForThisPage = s.axes.filter((a) => a.pageIdx === pi);

            //procura card existente nesta page com o mesmo ponto
            const existingCard = existingPage.cards?.find((c) => c.point === s.pointId);

            //se o card já estava aqui, verifica se os eixos são os mesmos
            //se mudou de page, existingCard será undefined - position default
            const sameAxes = existingCard
              ? axesForThisPage.every((a) =>
                existingCard.axes.some((ea) => ea.axis === a.axis)
              )
              : false;

            const spreadX = 40 + (selections.indexOf(s) % 4) * 270;
            const spreadY = 40 + Math.floor(selections.indexOf(s) / 4) * 140;

            return {
              //here eu reservo o id se já existia
              id: existingCard?.id ?? uid(),
              point: s.pointId,
              axes: axesForThisPage,
              //here I reservo posição apenas se o card já estava nesta page
              x: (existingCard && sameAxes) ? existingCard.x : spreadX,
              y: (existingCard && sameAxes) ? existingCard.y : spreadY,
              connectorX: (existingCard && sameAxes) ? existingCard.connectorX : (spreadX + 130),
              connectorY: (existingCard && sameAxes) ? existingCard.connectorY : (spreadY - 40),
            };
          });

        return {
          cards,
          //sempre preservo a imagem de fundo da page se já existia
          bgImage: existingPage.bgImage ?? null,
        };
      });

      persistLayout(newPages, locked, rawSelections, numPages);
      return newPages;
    });

    setActivePage(0);
  }, [locked, persistLayout]);

  //drag handlers com useCallback
  const handleCardDrag = useCallback((cardId, nx, ny) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, pi) => {
        if (pi !== activePage) return pg;
        return {
          ...pg,
          cards: pg.cards.map((c) =>
            c.id === cardId
              ? { ...c, x: clamp(nx, 0, CANVAS_W - 260), y: clamp(ny, 0, CANVAS_H - 80) }
              : c
          ),
        };
      });
      persistLayout(next, locked, savedModalSelections, savedModalNumPages);
      return next;
    });
  }, [locked, activePage, persistLayout, savedModalSelections, savedModalNumPages]);

  const handleConnectorDrag = useCallback((cardId, nx, ny) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, pi) => {
        if (pi !== activePage) return pg;
        return {
          ...pg,
          cards: pg.cards.map((c) =>
            c.id === cardId
              ? { ...c, connectorX: clamp(nx, 0, CANVAS_W), connectorY: clamp(ny, 0, CANVAS_H) }
              : c
          ),
        };
      });
      persistLayout(next, locked, savedModalSelections, savedModalNumPages);
      return next;
    });
  }, [locked, activePage, persistLayout, savedModalSelections, savedModalNumPages]);

  const handleImageDrop = useCallback((pageIdx, dataUrl) => {
    if (locked) return;
    setPages((prev) => {
      const next = prev.map((pg, i) =>
        i === pageIdx ? { ...pg, bgImage: dataUrl } : pg
      );
      persistLayout(next, locked, savedModalSelections, savedModalNumPages);
      return next;
    });
  }, [locked, persistLayout, savedModalSelections, savedModalNumPages]);

  //cadeado
  const toggleLock = useCallback(() => {
    const next = !locked;
    setLocked(next);
    persistLayout(pages, next, savedModalSelections, savedModalNumPages);
  }, [locked, pages, persistLayout, savedModalSelections, savedModalNumPages]);

  //select card
  const handleSelectCard = useCallback((id) => setSelectedCard(id), []);

  const currentPage = pages[activePage];

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>

        {/*toolbar */}
        <div className={styles.toolbar}>
          <button
            onClick={() => router.push(`/analysis/${group}/${piece}`)}
            className={styles.btnMenu}
            title={"Go to analysis"}
          >
            <Grid3x3 size={30} />
          </button>

          <div className={styles.toolbarCenter}>
            <span className={styles.toolbarTitle}>CAPABILITY REPORT</span>
            <span className={styles.toolbarSub}>{group} / {piece}</span>
          </div>

{/*           <button onClick={() => triggerSave(group, piece)}>
            Salvar Capability
          </button> */}

          <div className={styles.toolbarRight}>
            <button
              className={`${styles.btnMenu} ${locked ? styles.lockBtnLocked : styles.lockBtnOpen}`}
              onClick={toggleLock}
              title={locked
                ? "Relatório travado — clique para editar"
                : "Clique para travar o relatório"}
            >
              {locked ? <LockKeyhole size={30} /> : <LockKeyholeOpen size={30} />}
            </button>

            <button className={styles.btnMenu} title="Create Report" onClick={() => setModalOpen(true)}>
              <Settings size={30} />
            </button>
          </div>
        </div>

        {/*abas da page*/}
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
              <label className={styles.btnMenu}
                title="Import Image">
                <Camera size={30} />
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
              onSelectCard={handleSelectCard}
            />

            {!locked && (
              <div className={styles.canvasHint}>
                💡 Arraste as tabelas e os pontos de conexão (•) para posicioná-los.
                Arraste uma imagem da peça para a página.
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/*modal — recebe estado anterior para restaurar*/}
      {modalOpen && (
        <ConfigModal
          group={group}
          piece={piece}
          totalPages={pages.length || 1}
          previousSelections={savedModalSelections}
          previousNumPages={savedModalNumPages}
          onClose={() => setModalOpen(false)}
          onApply={handleApply}
        />
      )}
    </div>
  );
}

