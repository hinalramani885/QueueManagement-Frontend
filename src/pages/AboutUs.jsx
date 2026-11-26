// src/pages/AboutUs.jsx – content from the database (admin-editable) or the built-in default
import { Container } from 'react-bootstrap';
import useContentPage from '../hooks/useContentPage';
import Markdown from '../components/content/Markdown';
import PageHero from '../components/content/PageHero';
import AdminContentBar from '../components/content/AdminContentBar';
import './AboutUs.css';

const ICONS = ['bi-rocket-takeoff', 'bi-stars', 'bi-cpu', 'bi-heart', 'bi-flag', 'bi-lightning-charge', 'bi-people', 'bi-shield-check'];

const AboutUs = () => {
  const content = useContentPage('about-us');
  const { page } = content;
  const last = page.sections.length - 1;

  return (
    <div className="about-us-page">
      <Container className="py-5">
        <PageHero icon="bi-people" eyebrow="Our story" title={page.title} subtitle={page.subtitle} />
        <AdminContentBar label="About Us" content={content} />

        <div className="about-sections">
          {page.sections.map((section, i) => (
            <section
              key={section.id || i}
              id={section.id}
              className={`about-block reveal ${i === 0 ? 'about-block--lead' : ''} ${i === last && last > 0 ? 'about-block--cta' : ''}`}
            >
              <span className="about-block-icon"><i className={`bi ${ICONS[i % ICONS.length]}`} /></span>
              <h2 className="about-block-title">{section.title}</h2>
              <Markdown>{section.body}</Markdown>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default AboutUs;
