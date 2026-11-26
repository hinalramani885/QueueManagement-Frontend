import { creatorRole } from '../../utils/catalog';
import './CatalogTables.css';

/** Shows who created a place or service: name plus an Admin / Provider pill. */
const CreatorBadge = ({ item, compact = false }) => {
  const role = creatorRole(item);
  const label = role === 'PROVIDER' ? 'Provider' : 'Admin';
  return (
    <span className={`qf-creator ${compact ? 'qf-creator--compact' : ''}`}>
      <span className={`qf-creator-role qf-creator-role--${role.toLowerCase()}`}>
        <i className={`bi ${role === 'PROVIDER' ? 'bi-person-badge' : 'bi-shield-check'}`} /> {label}
      </span>
      {!compact && item?.createdByName && <span className="qf-creator-name">{item.createdByName}</span>}
    </span>
  );
};

export default CreatorBadge;
