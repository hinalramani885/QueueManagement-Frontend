// src/pages/HowToUse.jsx – content from the database (admin-editable) or the built-in default
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import useContentPage from '../hooks/useContentPage';
import Markdown from '../components/content/Markdown';
import PageHero from '../components/content/PageHero';
import AdminContentBar from '../components/content/AdminContentBar';
import './HowToUse.css';

const iconFor = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('provider')) return 'bi-person-workspace';
  if (t.includes('admin')) return 'bi-shield-lock';
  if (t.includes('tip')) return 'bi-lightbulb';
  if (t.includes('user')) return 'bi-person';
  return 'bi-bookmark';
};

const HowToUse = () => {
  const content = useContentPage('how-to-use');
  const { page } = content;
  const [activeId, setActiveId] = useState(null);
  const active = page.sections.find((s) => s.id === activeId) || page.sections[0];

  return (
    <div className="how-to-use-page">
      <Container className="py-5">
        <PageHero icon="bi-compass" eyebrow="Guide" title={page.title} subtitle={page.subtitle} />
        <AdminContentBar label="How to Use" content={content} />

        <div className="howto-tabs" role="tablist" aria-label="Guide sections">
          {page.sections.map((s) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active?.id === s.id}
              className={`howto-tab ${active?.id === s.id ? 'is-active' : ''}`}
              onClick={() => setActiveId(s.id)}
            >
              <i className={`bi ${iconFor(s.title)}`} /> {s.title}
            </button>
          ))}
        </div>

        {active && (
          <section key={active.id} className="howto-panel" role="tabpanel">
            <h2 className="howto-panel-title"><i className={`bi ${iconFor(active.title)}`} /> {active.title}</h2>
            <Markdown>{active.body}</Markdown>
          </section>
        )}
      </Container>
    </div>
  );
};

export default HowToUse;
