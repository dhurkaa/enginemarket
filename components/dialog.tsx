"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A modal on the native <dialog>: showModal() makes the rest of the page inert (the focus stays inside),
 * Escape closes it, and on close the focus goes back to the control that opened it.
 */
export function Dialog({
  open,
  onClose,
  labelledBy,
  describedBy,
  children,
  testId,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  testId?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement as HTMLElement | null;
      d.showModal();
      // the first field, else the first control, takes the focus
      const first = d.querySelector<HTMLElement>("input:not([tabindex='-1']), select, textarea, button");
      first?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dlg"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      data-testid={testId}
      onClose={() => {
        onClose();
        const back = opener.current;
        opener.current = null;
        if (back && document.contains(back)) requestAnimationFrame(() => back.focus());
      }}
      onClick={(e) => {
        // a click on the backdrop (the dialog element itself, outside its content) closes it
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      {children}
    </dialog>
  );
}

export function CloseButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="dlg__close" type="button" aria-label={label} onClick={onClick}>
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}
