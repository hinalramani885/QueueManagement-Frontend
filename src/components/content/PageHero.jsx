import './content.css';

/** Animated header used by the information pages. */
const PageHero = ({ icon, eyebrow, title, subtitle, children }) => (
  <header className="qf-hero">
    <div className="qf-hero-orbs" aria-hidden="true">
      <span /><span /><span />
    </div>
    {eyebrow && (
      <span className="qf-hero-eyebrow">
        {icon && <i className={`bi ${icon}`} />} {eyebrow}
      </span>
    )}
    <h1 className="qf-hero-title">{title}</h1>
    {subtitle && <p className="qf-hero-subtitle">{subtitle}</p>}
    {children}
  </header>
);

export default PageHero;
