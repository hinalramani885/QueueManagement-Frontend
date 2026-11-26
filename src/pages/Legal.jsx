import { Accordion, Col, Container, Row, Spinner } from 'react-bootstrap';
import useContentPage from '../hooks/useContentPage';
import Markdown from '../components/content/Markdown';
import PageHero from '../components/content/PageHero';
import AdminContentBar from '../components/content/AdminContentBar';
import './Legal.css';

const lastUpdated = (page) => {
  if (!page?.updatedAt) return null;
  const d = new Date(page.updatedAt);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { dateStyle: 'long' });
};

/** One legal document (privacy policy or terms) as an accordion of its sections. */
const LegalDocument = ({ content, icon }) => {
  const { page, loading } = content;
  const updated = lastUpdated(page);
  return (
    <section className="legal-doc reveal">
      <div className="legal-doc-header">
        <span className="legal-doc-icon"><i className={`bi ${icon}`} /></span>
        <div>
          <h2 className="legal-doc-title">{page.title}</h2>
          {page.subtitle && <p className="legal-doc-subtitle">{page.subtitle}</p>}
        </div>
        {loading && <Spinner animation="border" size="sm" className="ms-auto" />}
      </div>
      <Accordion flush className="legal-accordion" defaultActiveKey={page.sections[0]?.id}>
        {page.sections.map((section, i) => (
          <Accordion.Item eventKey={section.id || String(i)} key={section.id || i}>
            <Accordion.Header>
              <span className="legal-num">{i + 1}</span> {section.title}
            </Accordion.Header>
            <Accordion.Body>
              <Markdown>{section.body}</Markdown>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      {updated && <p className="legal-updated"><i className="bi bi-clock-history" /> Last updated {updated}</p>}
    </section>
  );
};

/** Privacy policy and terms of service – both editable by admins and stored in the database. */
const Legal = () => {
  const privacy = useContentPage('privacy-policy');
  const terms = useContentPage('terms-of-service');

  return (
    <div className="legal-page">
      <Container className="py-5">
        <PageHero icon="bi-shield-check" eyebrow="Your data, your rights" title="Legal Information"
          subtitle="Our Privacy Policy and Terms of Service, in plain language." />

        <AdminContentBar label="Privacy Policy" content={privacy} />
        <AdminContentBar label="Terms of Service" content={terms} />

        <Row className="g-4">
          <Col lg={6}><LegalDocument content={privacy} icon="bi-shield-lock" /></Col>
          <Col lg={6}><LegalDocument content={terms} icon="bi-file-earmark-text" /></Col>
        </Row>

        <p className="text-center mt-5 text-muted small">© {new Date().getFullYear()} QFlow. All rights reserved.</p>
      </Container>
    </div>
  );
};

export default Legal;
