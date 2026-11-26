import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SUPPORT_EMAIL } from '../../config';
import './content.css';

/** Code block with a copy button (used for fenced ``` blocks). */
const CodeBlock = ({ children }) => {
  const [copied, setCopied] = useState(false);
  const text = String(children).replace(/\n$/, '');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard not available */
    }
  };
  return (
    <div className="qf-md-code">
      <pre><code>{text}</code></pre>
      <button type="button" className="qf-md-copy" onClick={copy} aria-label="Copy code">
        <i className={`bi ${copied ? 'bi-check2' : 'bi-clipboard'}`} />
      </button>
    </div>
  );
};

const components = {
  // In-app links stay in the single-page app; external links open in a new tab
  a: ({ href = '', children }) => {
    if (href.startsWith('/')) return <Link to={href}>{children}</Link>;
    const external = /^https?:\/\//i.test(href);
    return (
      <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
        {children}
      </a>
    );
  },
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const text = String(children);
    // fenced blocks contain a newline (or a language class); inline code does not
    if (className || text.includes('\n')) return <CodeBlock>{text}</CodeBlock>;
    return <code className="qf-md-inline">{children}</code>;
  },
  table: ({ children }) => (
    <div className="qf-md-table">
      <table>{children}</table>
    </div>
  ),
};

/**
 * Renders page content written in Markdown (bold, lists, links, tables, code).
 * Raw HTML is not rendered, so text saved by admins cannot inject scripts.
 * {{SUPPORT_EMAIL}} is replaced with the QFlow contact address.
 */
const Markdown = ({ children, className = '' }) => (
  <div className={`qf-md ${className}`}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {String(children || '').replaceAll('{{SUPPORT_EMAIL}}', SUPPORT_EMAIL)}
    </ReactMarkdown>
  </div>
);

export default Markdown;
