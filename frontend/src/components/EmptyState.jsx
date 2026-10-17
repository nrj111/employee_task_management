import { SearchX } from 'lucide-react';
export default function EmptyState({ title = 'Nothing here yet', message = 'Try changing your search or filters.' }) { return <div className="empty-state"><span className="empty-icon"><SearchX size={22} /></span><h3>{title}</h3><p>{message}</p></div>; }
