// Documentation.jsx – content from the database (admin-editable) or the built-in default
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import useContentPage from '../hooks/useContentPage';
import Markdown from '../components/content/Markdown';
import PageHero from '../components/content/PageHero';
import AdminContentBar from '../components/content/AdminContentBar';
import './Documentation.css';

const Documentation = () => {
  const content = useContentPage('documentation');
  const { page } = content;
  const sections = page.sections;
  const [activeId, setActiveId] = useState(sections[0]?.id || '');
  const [query, setQuery] = useState('');

  // Scroll spy: highlight the section currently on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveId(entry.target.id)),
      { rootMargin: '-90px 0px -60% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
    setActiveId(id);
  };

  const q = query.trim().toLowerCase();
  const visible = q
    ? sections.filter((s) => s.title.toLowerCase().includes(q) || s.body.toLowerCase().includes(q))
    : sections;

  return (
    <div className="documentation-page">
      <Container className="py-5">
        <PageHero icon="bi-journal-code" eyebrow="Developer & user guide" title={page.title} subtitle={page.subtitle} />
        <AdminContentBar label="Documentation" content={content} />

        <div className="doc-grid">
          <aside className="doc-sidebar">
            <div className="toc-card sticky-toc">
              <div className="toc-search">
                <i className="bi bi-search" />
                <input placeholder="Search the docs" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search the documentation" />
              </div>
              <h5 className="toc-title">Contents</h5>
              <nav className="toc-list" aria-label="Table of contents">
                {visible.map((s) => (
                  <button key={s.id} type="button" onClick={() => scrollToSection(s.id)}
                    className={`toc-item ${activeId === s.id ? 'active' : ''}`}>
                    <span className="toc-num">{sections.indexOf(s) + 1}</span> {s.title}
                  </button>
                ))}
                {visible.length === 0 && <p className="text-muted small px-2 mb-0">No section matches “{query}”.</p>}
              </nav>
            </div>
          </aside>

          <main className="doc-main">
            {visible.map((s) => (
              <section key={s.id} id={s.id} className="doc-section reveal">
                <div className="doc-card">
                  <h2><span className="doc-num">{sections.indexOf(s) + 1}</span> {s.title}</h2>
                  <Markdown>{s.body}</Markdown>
                </div>
              </section>
            ))}
          </main>
        </div>
      </Container>
    </div>
  );
};

export default Documentation;
