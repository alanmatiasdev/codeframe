import type { ToastState } from '@/app/types/code-frame';

export function Toast({ toast }: Readonly<{ toast: ToastState }>) {
  return (
    <div className={`toast${toast ? ' show' : ''}${toast?.kind === 'error' ? ' toast-error' : ''}`} role="status" aria-live="polite">
      <span className="toast-dot" />
      <span>{toast?.message ?? 'Pronto.'}</span>
    </div>
  );
}
