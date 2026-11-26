import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import ContentEditor from './ContentEditor';
import './content.css';

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

/**
 * Shown only to admins on an editable information page: edit button, whether the page is customised,
 * who changed it last, and the editor itself.
 */
const AdminContentBar = ({ label, content }) => {
  const { role, token } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  if (!token || role !== 'ADMIN') return null;

  const { page, isCustom, save, reset, loading } = content;
  return (
    <>
      <div className="qf-admin-bar">
        <div className="qf-admin-bar-info">
          <span className="qf-admin-bar-badge"><i className="bi bi-shield-lock" /> Admin</span>
          <span>
            <strong>{label}</strong>{' '}
            {isCustom
              ? <>· edited{page.updatedByName ? ` by ${page.updatedByName}` : ''}{page.updatedAt ? ` on ${formatDate(page.updatedAt)}` : ''}</>
              : '· showing the default text'}
          </span>
        </div>
        <Button size="sm" onClick={() => setEditing(true)} disabled={loading}>
          <i className="bi bi-pencil-square me-1" /> Edit page
        </Button>
      </div>
      {editing && (
        <ContentEditor
          show={editing}
          onHide={() => setEditing(false)}
          page={page}
          isCustom={isCustom}
          onSave={save}
          onReset={reset}
        />
      )}
    </>
  );
};

export default AdminContentBar;
