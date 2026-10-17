export default function StatusBadge({ status }) {
  const tone = status?.toLowerCase().replaceAll(' ', '-') || 'neutral';
  return <span className={`badge badge-${tone}`}><span className="badge-dot" />{status || 'Unassigned'}</span>;
}
