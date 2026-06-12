import { useEffect, useRef, type ReactNode } from 'react';

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type ModalShellProps = {
  ariaLabelledBy: string;
  onDismiss: () => void;
  children: ReactNode;
  className?: string;
};

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

export function ModalShell({
  ariaLabelledBy,
  onDismiss,
  children,
  className,
}: ModalShellProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) {
      return;
    }
    const modalElement = modal;

    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const initialFocusable = getFocusableElements(modalElement);
    (initialFocusable[0] ?? modalElement).focus();

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        onDismiss();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusables = getFocusableElements(modalElement);
      if (focusables.length === 0) {
        event.preventDefault();
        modalElement.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!modalElement.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && (active === first || active === modal)) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (previousFocus && document.contains(previousFocus)) {
        previousFocus.focus();
      }
    };
  }, [onDismiss]);

  return (
    <div className="modal-backdrop" role="presentation" onClick={onDismiss}>
      <div
        ref={modalRef}
        className={className ? `modal-card ${className}` : 'modal-card'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaLabelledBy}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
