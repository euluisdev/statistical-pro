"use client";

import { useState, useEffect } from "react";
import { FolderPlus, Trash2, PlayCircle, Pause } from "lucide-react";

import ConfirmModal from "@/app/components/common/ConfirmModal";


export default function GroupManager({
  groups,
  onGroupCreated,
  onGroupDeleted,
  onGroupSelected,
  selectedGroup,
  onJobCreated,
  onJobFinished
}) {
  const [newGroup, setNewGroup] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);
  const [finishLoading, setFinishLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showFinishJobModal, setShowFinishJobModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);


  const API = process.env.NEXT_PUBLIC_API_URL;

  //update the currentJobId from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedJobId = localStorage.getItem("current_jobid");
      setCurrentJobId(storedJobId);
    }
  }, []);

  const createGroup = async () => {
    if (!newGroup.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${API}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroup }),
      });

      const data = await res.json();

      if (res.status === 201) {
        setNewGroup("");
        onGroupCreated(data.created);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      const res = await fetch(`${API}/groups/${selectedGroup}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onGroupDeleted();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createJobId = async () => {
    if (!selectedGroup) return;

    setJobLoading(true);

    try {
      const res = await fetch(`${API}/jobs/create?group=${selectedGroup}`, {
        method: "POST"
      });

      const data = await res.json();

      if (data.jobid) {
        localStorage.setItem("current_jobid", data.jobid);
        setCurrentJobId(data.jobid);

        if (onJobCreated) {
          onJobCreated(data.jobid);
        }
        alert("Job criado com sucesso!");
      }
    } catch (err) {
      console.error("Erro ao criar job:", err);
    } finally {
      setJobLoading(false);
      setShowCreateJobModal(false);
    }
  };

  const finishJob = async () => {
    if (!currentJobId) {
      alert("Nenhum job ativo para encerrar");
      setShowFinishJobModal(false);
      return;
    }

    setFinishLoading(true);

    try {
      const res = await fetch(`${API}/jobs/job/${currentJobId}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Erro ao encerrar job");
      }

      const data = await res.json();
      console.log("Job encerrado:", data);

      //delete from localStorage and update the state
      localStorage.removeItem("current_jobid");
      setCurrentJobId(null);

      if (onJobFinished) {
        onJobFinished();
      }

      alert("Job encerrado com sucesso!");

    } catch (err) {
      console.error("Erro ao encerrar job:", err);
      alert(`Erro ao encerrar job: ${err.message}`);
    } finally {
      setFinishLoading(false);
      setShowFinishJobModal(false);
    }
  };

  return (
    <>
      {/*create group*/}
      <div className="card">
        <h2>Novo Conjunto</h2>
        <div className="form">
          <input
            className="input-sm"
            type="text"
            placeholder="Nome do conjunto"
            value={newGroup}
            onChange={(e) => setNewGroup(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newGroup.trim()) {
                setShowCreateGroupModal(true);
              }
            }}
          />
          <button
            className="btn-sm btn-success"
            onClick={() => setShowCreateGroupModal(true)}
            disabled={loading || !newGroup.trim()}
          >
            <FolderPlus size={16} />
          </button>
        </div>
      </div>

      {/*select group*/}
      <div className="card">
        <h2>Conjunto</h2>
        <select
          className="input-sm"
          value={selectedGroup}
          onChange={(e) => onGroupSelected(e.target.value)}
        >
          <option value="">Selecione...</option>
          {groups.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {selectedGroup && (
          <p className="selected-text-sm">
            <b>{selectedGroup}</b>
          </p>
        )}

        <div className="actions-row">
          <button
            className="btnRow"
            disabled={!selectedGroup || currentJobId}
            onClick={() => setShowCreateJobModal(true)}
            title={currentJobId ? "Já existe um job ativo" : "Criar Job"}
          >
            <PlayCircle size={25} />
          </button>

          <button
            className="btnRow"
            disabled={!currentJobId}
            onClick={() => setShowFinishJobModal(true)}
            title={!currentJobId ? "Nenhum job ativo" : "Encerrar Job"}
          >
            <Pause size={25} />
          </button>


          <button
            className="btnRow"
            onClick={() => setShowDeleteGroupModal(true)}
            disabled={!selectedGroup}
            title="Apagar conjunto"
          >
            <Trash2 size={25} />
          </button>
        </div>
      </div>
      <ConfirmModal
        isOpen={showCreateJobModal}
        title={`Criar Job para ${selectedGroup}?`}
        message="Isso criará um identificador único (job_id) para gerar o relatório final."
        onCancel={() => setShowCreateJobModal(false)}
        onConfirm={createJobId}
      />

      <ConfirmModal
        isOpen={showFinishJobModal}
        title="Encerrar Job atual?"
        message={
          currentJobId
            ? `O job_id atual (${currentJobId}) será apagado. Deseja continuar?`
            : "Nenhum job ativo no momento."
        }
        onCancel={() => setShowFinishJobModal(false)}
        onConfirm={finishJob}
      />

      <ConfirmModal
        isOpen={showDeleteGroupModal}
        title="Apagar conjunto?"
        message={`Tem certeza que deseja apagar o conjunto "${selectedGroup}" e tudo dentro dele?`}
        onCancel={() => setShowDeleteGroupModal(false)}
        onConfirm={() => {
          deleteGroup();
          setShowDeleteGroupModal(false);
        }}
      />

      <ConfirmModal
        isOpen={showCreateGroupModal}
        title="Criar novo conjunto?"
        message={`Deseja criar o conjunto "${newGroup}"?`}
        onCancel={() => setShowCreateGroupModal(false)}
        onConfirm={async () => {
          await createGroup();
          setShowCreateGroupModal(false);
        }}
      />

    </>
  );
} 
