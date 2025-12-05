"use client";

import "./confirm-modal.css"

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>

        <div className="modal-buttons">
          <button className="modal-btn cancel" onClick={onCancel}>
            Cancelar
          </button>

          <button className="modal-btn confirm" onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>

      <style jsx>{`

      `}</style>
    </div>
  );
}
