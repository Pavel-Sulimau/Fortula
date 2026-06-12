import { ModalShell } from './ModalShell';

type ConfirmModalProps = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <ModalShell ariaLabelledBy="confirm-title" onDismiss={onCancel}>
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div className="modal-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="primary" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
