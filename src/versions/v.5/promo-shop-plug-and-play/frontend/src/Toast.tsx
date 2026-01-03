import React, { useEffect } from "react";

export type ToastState = null | {
  kind: "ok" | "err";
  title: string;
  message?: string;
};

export default function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(onClose, 3500);
    return () => window.clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="toast-wrap" aria-live="polite" role="status">
      <div className={`toast ${toast.kind}`}>
        <div className="icon" aria-hidden="true">
          {toast.kind === "ok" ? "✓" : "!"}
        </div>
        <div>
          <p className="title">{toast.title}</p>
          {toast.message ? <p className="body">{toast.message}</p> : null}
        </div>
        <button className="x" onClick={onClose} aria-label="Close">✕</button>
      </div>
    </div>
  );
}
