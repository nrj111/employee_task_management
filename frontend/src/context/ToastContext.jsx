import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';

const ToastContext = createContext(() => {});
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const notify = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setItems(list => [...list, { id, message, type }]);
    window.setTimeout(() => setItems(list => list.filter(item => item.id !== id)), 4200);
  }, []);
  return <ToastContext.Provider value={notify}>{children}<div className="toast-stack" aria-live="polite">{items.map(item => <div className={`toast toast-${item.type}`} key={item.id}>{item.type === 'error' ? <CircleAlert size={18} /> : <CheckCircle2 size={18} />}<span>{item.message}</span><button aria-label="Dismiss" onClick={() => setItems(list => list.filter(x => x.id !== item.id))}><X size={15} /></button></div>)}</div></ToastContext.Provider>;
}
export const useToast = () => useContext(ToastContext);
