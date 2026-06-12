type DuplicateChoiceModalProps = {
  duplicateCount: number;
  totalCount: number;
  onKeep: () => void;
  onRemove: () => void;
  onCancel: () => void;
};

export function DuplicateChoiceModal({
  duplicateCount,
  totalCount,
  onKeep,
  onRemove,
  onCancel,
}: DuplicateChoiceModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicates-title"
      >
        <h2 id="duplicates-title">Duplicates detected</h2>
        <p>
          Found {duplicateCount} duplicate names in {totalCount} imported rows.
        </p>
        <p>Choose how this import should be handled.</p>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel import
          </button>
          <button type="button" className="secondary" onClick={onKeep}>
            Keep duplicates
          </button>
          <button type="button" className="primary" onClick={onRemove}>
            Remove duplicates
          </button>
        </div>
      </div>
    </div>
  );
}
