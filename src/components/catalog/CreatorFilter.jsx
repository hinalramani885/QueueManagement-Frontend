import { CREATOR_FILTERS } from '../../utils/catalog';
import './CatalogTables.css';

/** All / Admin / Provider segmented filter. */
const CreatorFilter = ({ value, onChange, counts }) => (
  <div className="qf-segment" role="radiogroup" aria-label="Filter by creator">
    {CREATOR_FILTERS.map((f) => (
      <button
        key={f.value}
        type="button"
        role="radio"
        aria-checked={value === f.value}
        className={`qf-segment-btn ${value === f.value ? 'is-active' : ''}`}
        onClick={() => onChange(f.value)}
      >
        {f.label}
        {counts && <span className="qf-segment-count">{counts[f.value] ?? 0}</span>}
      </button>
    ))}
  </div>
);

export default CreatorFilter;
