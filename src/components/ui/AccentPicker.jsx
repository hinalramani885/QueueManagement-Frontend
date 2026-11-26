import { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ACCENTS, getAccent, setAccent } from '../../utils/accent';
import './AccentPicker.css';

/** Navbar button to pick the app's accent colour theme (saved on this device). */
const AccentPicker = () => {
  const [current, setCurrent] = useState(getAccent);

  useEffect(() => {
    const sync = (e) => setCurrent(e.detail);
    window.addEventListener('qflow-accent', sync);
    return () => window.removeEventListener('qflow-accent', sync);
  }, []);

  const active = ACCENTS.find((a) => a.id === current) || ACCENTS[0];

  return (
    <Dropdown align="end" className="qf-accent">
      <Dropdown.Toggle as="button" type="button" className="qf-accent-toggle" aria-label="Choose colour theme">
        <span className="qf-accent-dot" style={{ background: active.swatch }} />
        <i className="bi bi-palette2" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="qf-accent-menu">
        <div className="qf-accent-title">Colour theme</div>
        <div className="qf-accent-grid">
          {ACCENTS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`qf-accent-option ${a.id === current ? 'is-active' : ''}`}
              onClick={() => { setAccent(a.id); setCurrent(a.id); }}
              aria-pressed={a.id === current}
            >
              <span className="qf-accent-swatch" style={{ background: a.swatch }}>
                {a.id === current && <i className="bi bi-check-lg" />}
              </span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AccentPicker;
