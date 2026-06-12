import { ModalShell } from './ModalShell';

type WinnerModalProps = {
  winnerName: string;
  eliminationMode: boolean;
  canRemove: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onRemoveWinner: () => void;
  onRemoveAndSpinAgain: () => void;
};

export function WinnerModal({
  winnerName,
  eliminationMode,
  canRemove,
  onClose,
  onSpinAgain,
  onRemoveWinner,
  onRemoveAndSpinAgain,
}: WinnerModalProps) {
  return (
    <ModalShell className="winner-modal" ariaLabelledBy="winner-title" onDismiss={onClose}>
      <p className="eyebrow">Winner</p>
      <h2 id="winner-title">{winnerName}</h2>
      <div className="modal-actions">
        <button type="button" className="secondary" onClick={onClose}>
          Close
        </button>
        <button type="button" className="primary" onClick={onSpinAgain}>
          Spin again
        </button>
        {canRemove ? (
          <button type="button" className="secondary" onClick={onRemoveWinner}>
            Remove winner
          </button>
        ) : null}
        {eliminationMode && canRemove ? (
          <button type="button" className="primary" onClick={onRemoveAndSpinAgain}>
            Remove and spin again
          </button>
        ) : null}
      </div>
    </ModalShell>
  );
}
