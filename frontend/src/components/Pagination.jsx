import { ChevronLeft, ChevronRight } from 'lucide-react';
export default function Pagination({ page, pages, total, limit, onChange }) {
  if (!pages) return null;
  const start = total ? (page - 1) * limit + 1 : 0; const end = Math.min(page * limit, total);
  return <div className="pagination"><span>Showing <strong>{start}–{end}</strong> of <strong>{total}</strong> results</span><div><button disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button><span className="page-counter">Page <b>{page}</b> of <b>{pages}</b></span><button disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div></div>;
}
