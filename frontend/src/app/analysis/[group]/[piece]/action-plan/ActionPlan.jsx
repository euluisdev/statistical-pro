"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./actionplan.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//semanas exibidas na tabela
const WEEKS = ["05", "06", "07", "08", "09", "10", "11", "12", "13", "14"];

const ACTION_TYPES = [
  { value: "Não definida", label: "Não definida" },
  { value: "X", label: "X — Ação programada" },
  { value: "R", label: "R — Ação reprogramada" },
  { value: "NOK", label: "NOK — Ação não efetiva" },
];

const WEEK_VALUES = ["", "X", "NOK", "R"];

const fmt = (v) => v == null ? "—" : parseFloat(v).toFixed(2).replace(".", ",");

function cpkColor(val, colorHint) {
  if (colorHint === "green") return "#22bb44";
  if (colorHint === "red") return "#cc2222";
  if (val == null) return "transparent";
  const n = parseFloat(val);
  if (n >= 1.33) return "#22bb44";
  if (n >= 1.0) return "#f0b800";
  return "#cc2222";
}

//action Plan Modal
function ActionPlanModal({ group, piece, plan, onClose, onSaved }) {
  const isEdit = !!plan;

  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("CPK");
  const [filterVal, setFilterVal] = useState("All");
  const [onlyCalc, setOnlyCalc] = useState(true);

  // Form state
  const [selectedPts, setSelectedPts] = useState(
    isEdit ? plan.rows.map(r => r.point_id) : []
  );
  const [actionType, setActionType] = useState(isEdit ? plan.action_type : "Não definida");
  const [actionText, setActionText] = useState(isEdit ? plan.action_text : "");
  const [respName, setRespName] = useState(isEdit ? plan.responsible_name : "");
  const [respDept, setRespDept] = useState(isEdit ? plan.responsible_dept : "");
  const [deadlineDate, setDeadlineDate] = useState(isEdit ? plan.deadline_date : "");
  const [deadlineYear, setDeadlineYear] = useState(isEdit ? plan.deadline_year : "");
  const [deadlineWeek, setDeadlineWeek] = useState(isEdit ? plan.deadline_week : "");
  const [status, setStatus] = useState(isEdit ? plan.status : "");
  const [analysis, setAnalysis] = useState(isEdit ? plan.analysis : "Parts");
  const [weekStatuses, setWeekStatuses] = useState(
    isEdit ? plan.week_statuses : WEEKS.map(w => ({ week: w, value: "" }))
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/pieces/${group}/${piece}/action-plan-points`)
      .then(r => r.json())
      .then(d => { setPoints(d.points || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [group, piece]);

  const togglePoint = (id) =>
    setSelectedPts(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const moveSelected = () => {/*points already shown selected inline */ };

  const setWeekVal = (week, value) =>
    setWeekStatuses(prev =>
      prev.map(ws => ws.week === week ? { ...ws, value } : ws)
    );

  // Filter points
  const filteredPoints = points.filter(pt => {
    if (filterType === "CPK" && filterVal !== "All") {
      const cpk = pt.cpk ?? 0;
      if (filterVal === "< 1.00" && cpk >= 1.00) return false;
      if (filterVal === "1.00-1.33" && (cpk < 1.00 || cpk >= 1.33)) return false;
      if (filterVal === ">= 1.33" && cpk < 1.33) return false;
    }
    return true;
  });

  const handleSave = async () => {
    if (selectedPts.length === 0) {
      alert("Selecione pelo menos um ponto.");
      return;
    }
    setSaving(true);
    try {
      const body = {
        points: selectedPts,
        action_type: actionType,
        action_text: actionText,
        responsible_name: respName,
        responsible_dept: respDept,
        deadline_date: deadlineDate,
        deadline_year: deadlineYear,
        deadline_week: deadlineWeek,
        status,
        analysis,
        week_statuses: weekStatuses,
      };

      const url = isEdit
        ? `${API}/pieces/${group}/${piece}/action-plans/${plan.seq}`
        : `${API}/pieces/${group}/${piece}/action-plans`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      onSaved(data.plan);
      onClose();
    } catch (e) {
      alert(`Erro ao salvar: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/*header */}
        <div className={styles.modalHeader}>
          <h3>AutoSigma | Action Plan {isEdit ? `(SEQ ${plan.seq})` : "— Novo"}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>

          {/*col LT: action*/}
          <div className={styles.modalLeft}>
            <fieldset className={styles.fieldset}>
              <legend>Ação</legend>

              <div className={styles.row}>
                <label>Número da Ação</label>
                <div className={styles.seqDisplay}>
                  {isEdit ? String(plan.seq).padStart(3, "0") : "Auto"}
                </div>
              </div>

              {/*tipo of the action */}
              <div className={styles.radioGroup}>
                {ACTION_TYPES.map(at => (
                  <label key={at.value} className={styles.radioLabel}>
                    <input type="radio" name="actionType"
                      value={at.value}
                      checked={actionType === at.value}
                      onChange={() => setActionType(at.value)}
                    />
                    {at.label}
                  </label>
                ))}
              </div>

              {/*filter points */}
              <div className={styles.row}>
                <span className={styles.sectionLabel}>Filtro</span>
                <select className={styles.sel} value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option>CPK</option><option>CP</option>
                </select>
                <select className={styles.sel} value={filterVal} onChange={e => setFilterVal(e.target.value)}>
                  <option>All</option>
                  <option>&lt; 1.00</option>
                  <option>1.00-1.33</option>
                  <option>&gt;= 1.33</option>
                </select>
              </div>

              <label className={styles.checkLabel}>
                <input type="checkbox" checked={onlyCalc} onChange={e => setOnlyCalc(e.target.checked)} />
                Somente pontos cálculo
              </label>

              {/*lista de pontos */}
              <div className={styles.pointsSection}>
                <div className={styles.pointsList}>
                  {loading ? (
                    <div className={styles.loadingMsg}>Carregando…</div>
                  ) : (
                    filteredPoints.map(pt => (
                      <div
                        key={pt.id}
                        className={`${styles.pointItem} ${selectedPts.includes(pt.id) ? styles.pointItemSel : ""}`}
                        onClick={() => togglePoint(pt.id)}
                      >
                        {pt.label}_{pt.axis}
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.selectedPoints}>
                  <div className={styles.selectedHeader}>Pontos da Ação</div>
                  {selectedPts.map(id => (
                    <div key={id} className={styles.selectedItem}>
                      {id}
                      <span className={styles.removeBtn} onClick={() => togglePoint(id)}>×</span>
                    </div>
                  ))}
                  {selectedPts.length === 0 && (
                    <div className={styles.emptyMsg}>Nenhum ponto selecionado</div>
                  )}
                </div>
              </div>

              <button className={styles.removeAllBtn}
                onClick={() => setSelectedPts([])}>
                Remover todos
              </button>
            </fieldset>

            {/*responsabilidade */}
            <fieldset className={styles.fieldset}>
              <legend>Responsabilidade</legend>
              <div className={styles.row}>
                <label>Nome</label>
                <input className={styles.inp} value={respName}
                  onChange={e => setRespName(e.target.value)}
                  placeholder="Nome do responsável" />
              </div>
              <div className={styles.row}>
                <label>Departamento</label>
                <input className={styles.inp} value={respDept}
                  onChange={e => setRespDept(e.target.value)}
                  placeholder="Departamento" />
              </div>
            </fieldset>
          </div>

          {/*col RT histórico + execução + prazo*/}
          <div className={styles.modalRight}>

            {/* Histórico / semanas */}
            <fieldset className={styles.fieldset}>
              <legend>Histórico — Semanas</legend>
              <div className={styles.weeksGrid}>
                {weekStatuses.map(ws => (
                  <div key={ws.week} className={styles.weekCell}>
                    <span className={styles.weekLabel}>{ws.week}</span>
                    <select
                      className={`${styles.weekSel} ${ws.value ? styles[`week_${ws.value}`] : ""}`}
                      value={ws.value}
                      onChange={e => setWeekVal(ws.week, e.target.value)}
                    >
                      {WEEK_VALUES.map(v => (
                        <option key={v} value={v}>{v || "—"}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </fieldset>

            {/*action de execução */}
            <fieldset className={styles.fieldset}>
              <legend>Ação de execução</legend>
              <textarea
                className={styles.textarea}
                value={actionText}
                onChange={e => setActionText(e.target.value)}
                placeholder="Descreva a ação de execução…"
                rows={4}
              />
            </fieldset>

            {/* status + análise*/}
            <div className={styles.rowGap}>
              <fieldset className={styles.fieldset} style={{ flex: 1 }}>
                <legend>Status</legend>
                <input className={styles.inp} value={status}
                  onChange={e => setStatus(e.target.value)}
                  placeholder="Status" />
              </fieldset>
              <fieldset className={styles.fieldset} style={{ flex: 1 }}>
                <legend>Análise</legend>
                <select className={styles.sel} value={analysis}
                  onChange={e => setAnalysis(e.target.value)}>
                  <option>Parts</option>
                  <option>Process</option>
                  <option>Machine</option>
                  <option>Man</option>
                  <option>Method</option>
                  <option>Environment</option>
                </select>
              </fieldset>
            </div>

            {/*prazo */}
            <fieldset className={styles.fieldset}>
              <legend>Prazo</legend>
              <div className={styles.row}>
                <label>Data</label>
                <input type="date" className={styles.inp} value={deadlineDate}
                  onChange={e => setDeadlineDate(e.target.value)} />
              </div>
              <div className={styles.row}>
                <label>Ano</label>
                <input className={styles.inp} value={deadlineYear}
                  onChange={e => setDeadlineYear(e.target.value)} placeholder="2026" />
                <label style={{ marginLeft: 8 }}>Semana</label>
                <input className={styles.inp} value={deadlineWeek}
                  onChange={e => setDeadlineWeek(e.target.value)} placeholder="09" />
              </div>
            </fieldset>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? "Gravando…" : isEdit ? "Atualizar" : "Gravar"}
          </button>
        </div>
      </div>
    </div>
  );
}

//action plan table row
function PlanTableRows({ plan, onEdit, onDelete, currentWeek }) {
  const rowCount = plan.rows.length;

  return (
    <>
      {plan.rows.map((row, ri) => (
        <tr key={`${plan.seq}-${ri}`} className={ri % 2 === 0 ? styles.trEven : styles.trOdd}>
          {ri === 0 && (
            <td rowSpan={rowCount} className={styles.tdSeq}>
              <div className={styles.seqCell}>
                <span>{String(plan.seq).padStart(3, "0")}</span>
                <div className={styles.rowActions}>
                  <button className={styles.editRowBtn} onClick={() => onEdit(plan)}
                    title="Editar">✏</button>
                  <button className={styles.delRowBtn} onClick={() => onDelete(plan.seq)}
                    title="Excluir">🗑</button>
                </div>
              </div>
            </td>
          )}
          <td className={styles.td}>{row.label}</td>
          <td className={styles.td}>{row.axis}</td>
          <td className={styles.td}>{fmt(row.lse)}</td>
          <td className={styles.td}>{fmt(row.lie)}</td>
          <td className={styles.tdSymbol}>{row.symbol}</td>
          <td className={styles.td}>{fmt(row.xmed)}</td>
          <td className={styles.td}>{fmt(row.cp)}</td>
          <td className={`${styles.td} ${styles.tdCpk}`}
            style={{ background: cpkColor(row.cpk, null), color: row.cpk != null ? "white" : "inherit" }}>
            {fmt(row.cpk)}
          </td>
          <td className={styles.td}>{fmt(row.range)}</td>

          {ri === 0 && (
            <>
              {/*desviation + root cause */}
              <td rowSpan={rowCount} className={styles.tdVertical}>
                <span className={styles.verticalText}>{plan.action_type}</span>
              </td>
              <td rowSpan={rowCount} className={styles.tdVertical}>
                <span className={styles.verticalText}>{plan.analysis}</span>
              </td>
              {/*action Plan */}
              <td rowSpan={rowCount} className={styles.tdAction}>
                {plan.action_text}
              </td>
              {/*responsible */}
              <td rowSpan={rowCount} className={styles.tdResp}>
                {plan.responsible_name}
                {plan.responsible_dept ? ` (${plan.responsible_dept})` : ""}
              </td>
              {/*data */}
              <td rowSpan={rowCount} className={styles.tdDate}>
                {plan.deadline_date || ""}
              </td>
              {/*weeks*/}
              {WEEKS.map(w => {
                const ws = plan.week_statuses?.find(x => x.week === w);
                const val = ws?.value || "";
                const isCurrent = w === currentWeek;
                return (
                  <td key={w} rowSpan={rowCount}
                    className={`${styles.tdWeek} ${isCurrent ? styles.tdWeekCurrent : ""}`}
                    style={{
                      background: val === "X" ? "#aad4f5"
                        : val === "NOK" ? "#ffaaaa"
                          : val === "R" ? "#ffe099"
                            : "transparent"
                    }}>
                    {val}
                  </td>
                );
              })}
              {/*status*/}
              <td rowSpan={rowCount} className={styles.tdStatus}>
                {plan.status}
              </td>
            </>
          )}
        </tr>
      ))}
    </>
  );
}

//main page
export default function ActionPlanPage() {
  const { group, piece } = useParams();
  const router = useRouter();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null); // null = novo

  //semana atual para destacar coluna
  const currentWeek = String(new Date().getWeek?.() ?? "09").padStart(2, "0");

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/pieces/${group}/${piece}/action-plans`);
      const d = await res.json();
      setPlans(d.plans || []);
    } catch { setPlans([]); }
    finally { setLoading(false); }
  }, [group, piece]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleSaved = (plan) => {
    setPlans(prev => {
      const exists = prev.findIndex(p => p.seq === plan.seq);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = plan;
        return next;
      }
      return [...prev, plan].sort((a, b) => a.seq - b.seq);
    });
  };

  const handleDelete = async (seq) => {
    if (!confirm(`Excluir plano SEQ ${seq}?`)) return;
    await fetch(`${API}/pieces/${group}/${piece}/action-plans/${seq}`, { method: "DELETE" });
    setPlans(prev => prev.filter(p => p.seq !== seq));
  };

  const openNew = () => { setEditingPlan(null); setModalOpen(true); };
  const openEdit = (plan) => { setEditingPlan(plan); setModalOpen(true); };

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>

        {/*toolbar */}
        <div className={styles.toolbar}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>← Voltar</button>
          <div className={styles.toolbarCenter}>
            <span className={styles.toolbarTitle}>ACTION PLAN</span>
            <span className={styles.toolbarSub}>{group} | {piece}</span>
          </div>
          <button className={styles.newBtn} onClick={openNew}>
            New
          </button>
        </div>

        {/*table */}
        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loadingState}>Carregando planos…</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  {/*cabeçalho*/}
                  <th colSpan={15} className={styles.thPiece}>
                    {piece} | ACTION PLAN
                  </th>
                  <th colSpan={WEEKS.length + 1} className={styles.thSemana}>SEMANA</th>
                </tr>
                <tr>
                  <th className={styles.th}>SEQ</th>
                  <th className={styles.th}>LABEL</th>
                  <th className={styles.th}>AXIS</th>
                  <th className={styles.th}>LSE</th>
                  <th className={styles.th}>LIE</th>
                  <th className={styles.th}>SYMBOL</th>
                  <th className={styles.th}>XMED</th>
                  <th className={styles.th}>CP</th>
                  <th className={styles.th}>CPK</th>
                  <th className={styles.th}>RANGE</th>
                  <th className={`${styles.th} ${styles.thVertical}`}>
                    <span className={styles.verticalText}>RISK - Desviation</span>
                  </th>
                  <th className={`${styles.th} ${styles.thVertical}`}>
                    <span className={styles.verticalText}>RISK - Root Cause</span>
                  </th>
                  <th className={styles.th}>ACTION PLAN</th>
                  <th className={styles.th}>RESPONSIBLE</th>
                  <th className={styles.th}>DATA</th>
                  {WEEKS.map(w => (
                    <th key={w}
                      className={`${styles.th} ${styles.thWeek} ${w === currentWeek ? styles.thWeekCurrent : ""}`}>
                      {w}
                    </th>
                  ))}
                  <th className={styles.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={15 + WEEKS.length + 1} className={styles.emptyTable}>
                      Nenhum plano de ação criado. Clique em <strong> New</strong>.
                    </td>
                  </tr>
                ) : (
                  plans.map(plan => (
                    <PlanTableRows
                      key={plan.seq}
                      plan={plan}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      currentWeek={currentWeek}
                    />
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/*legend */}
        <div className={styles.legend}>
          X — Ação programada &nbsp;|&nbsp; NOK — Ação não efetiva &nbsp;|&nbsp; R — Ação reprogramada
        </div>
      </div>

      {modalOpen && (
        <ActionPlanModal
          group={group}
          piece={piece}
          plan={editingPlan}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}


