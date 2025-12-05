"use client";

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
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }

        .modal-box {
          background: #fff;
          padding: 24px;
          border-radius: 12px;
          width: 340px;
          max-width: 90%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          animation: pop 0.2s ease-out;
        }

        .modal-title {
          margin: 0 0 10px 0;
          font-size: 20px;
          font-weight: bold;
          text-align: center;
        }

        .modal-message {
          margin: 0 0 20px;
          font-size: 15px;
          text-align: center;
        }

        .modal-buttons {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .modal-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        }

        .modal-btn.cancel {
          background: #ddd;
        }

        .modal-btn.confirm {
          background: #c70000;
          color: #fff;
        }

        @keyframes pop {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
