import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
}

export default function Modal({
  title,
  onClose,
  children,
  actions,
}: ModalProps) {
  return (
    <div
      className="modal-bg open"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-ttl">
          {title}
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
        <div className="modal-actions">{actions}</div>
      </div>
    </div>
  );
}
