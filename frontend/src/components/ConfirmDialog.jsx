import { AlertTriangle } from 'lucide-react';
export default function ConfirmDialog({ title, message, onCancel, onConfirm, busy }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && onCancel()}><section className="confirm-dialog" role="dialog" aria-modal="true"><span className="confirm-icon"><AlertTriangle size={22} /></span><h2>{title}</h2><p>{message}</p><div className="dialog-actions"><button className="button button-soft" onClick={onCancel} disabled={busy}>Keep record</button><button className="button button-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button></div></section></div>;
}
