import { useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Markdown from './Markdown';
import { apiErrorMessage } from '../../utils/catalog';
import './content.css';

let tempId = 0;
const newKey = () => `new-${Date.now()}-${tempId++}`;

const toDraft = (page) => ({
  title: page?.title || '',
  subtitle: page?.subtitle || '',
  sections: (page?.sections || []).map((s) => ({ ...s, key: s.id || newKey() })),
});

const confirm = (options) => {
  const isDark = document.body.classList.contains('dark-mode');
  return Swal.fire({
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    background: isDark ? '#1a1d2b' : '#fff',
    color: isDark ? '#e8eaf6' : '#1f2544',
    ...options,
  });
};

/**
 * Full-screen editor for an information page (admins only). Edits title, subtitle and Markdown sections:
 * add, edit with live preview, reorder and delete sections, then save to the database or reset to default.
 */
const ContentEditor = ({ show, onHide, page, isCustom, onSave, onReset }) => {
  const [draft, setDraft] = useState(() => toDraft(page));
  const [openKey, setOpenKey] = useState(null);
  const [previewKeys, setPreviewKeys] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const update = (changes) => {
    setDraft((d) => ({ ...d, ...changes }));
    setDirty(true);
  };
  const updateSection = (key, changes) =>
    update({ sections: draft.sections.map((s) => (s.key === key ? { ...s, ...changes } : s)) });

  const move = (index, delta) => {
    const next = [...draft.sections];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ sections: next });
  };

  const addSection = () => {
    const key = newKey();
    update({ sections: [...draft.sections, { key, id: '', title: 'New section', body: 'Write the text here. **Bold**, lists with `-`, and [links](https://example.com) are supported.' }] });
    setOpenKey(key);
    setTimeout(() => document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  };

  const removeSection = async (section) => {
    const res = await confirm({ title: 'Delete this section?', text: `"${section.title}" will be removed when you save.`, icon: 'warning', confirmButtonText: 'Delete section' });
    if (res.isConfirmed) update({ sections: draft.sections.filter((s) => s.key !== section.key) });
  };

  const close = async () => {
    if (dirty) {
      const res = await confirm({ title: 'Discard changes?', text: 'Your unsaved edits will be lost.', icon: 'question', confirmButtonText: 'Discard' });
      if (!res.isConfirmed) return;
    }
    onHide();
  };

  const save = async () => {
    if (!draft.title.trim()) {
      toast.error('The page title is required.');
      return;
    }
    const untitled = draft.sections.find((s) => !s.title.trim());
    if (untitled) {
      setOpenKey(untitled.key);
      toast.error('Every section needs a title.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: draft.title.trim(),
        subtitle: draft.subtitle.trim(),
        sections: draft.sections.map(({ id, title, body }) => ({ id, title: title.trim(), body: body || '' })),
      });
      toast.success('Page saved. Everyone now sees the new version.');
      setDirty(false);
      onHide();
    } catch (error) {
      toast.error(`Could not save the page: ${apiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    const res = await confirm({
      title: 'Delete your saved version?',
      text: 'The page goes back to the original default text for everyone. This cannot be undone.',
      icon: 'warning',
      confirmButtonText: 'Delete and reset',
    });
    if (!res.isConfirmed) return;
    setSaving(true);
    try {
      await onReset();
      toast.success('Saved version deleted. The default text is shown again.');
      setDirty(false);
      onHide();
    } catch (error) {
      toast.error(`Could not reset the page: ${apiErrorMessage(error)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={close} fullscreen className="qf-editor" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <i className="bi bi-pencil-square" /> Edit page
          {dirty && <span className="qf-editor-dirty">Unsaved changes</span>}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="qf-editor-inner">
          <div className="qf-editor-card">
            <Form.Group className="mb-3">
              <Form.Label>Page title</Form.Label>
              <Form.Control value={draft.title} maxLength={200} onChange={(e) => update({ title: e.target.value })} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Subtitle <span className="text-muted small">(optional)</span></Form.Label>
              <Form.Control value={draft.subtitle} maxLength={500} onChange={(e) => update({ subtitle: e.target.value })} />
            </Form.Group>
          </div>

          <div className="qf-editor-help">
            <i className="bi bi-lightbulb" />
            <span>
              Section text uses Markdown: <code>**bold**</code>, <code>*italic*</code>, lists with <code>-</code>,
              sub-headings with <code>###</code>, links <code>[text](https://…)</code>, code with <code>```</code>.
              Write <code>{'{{SUPPORT_EMAIL}}'}</code> to show the QFlow contact address.
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Sections <span className="text-muted small">({draft.sections.length})</span></h5>
            <Button size="sm" onClick={addSection}><i className="bi bi-plus-lg me-1" /> Add section</Button>
          </div>

          {draft.sections.length === 0 && (
            <div className="qf-editor-empty">This page has no sections. Click <strong>Add section</strong> to write one.</div>
          )}

          {draft.sections.map((section, index) => {
            const open = openKey === section.key;
            const preview = previewKeys[section.key];
            return (
              <div key={section.key} id={`section-${section.key}`} className={`qf-editor-section ${open ? 'is-open' : ''}`}>
                <div className="qf-editor-section-head">
                  <button type="button" className="qf-editor-toggle" onClick={() => setOpenKey(open ? null : section.key)} aria-expanded={open}>
                    <span className="qf-editor-num">{index + 1}</span>
                    <span className="qf-editor-section-title">{section.title || <em>Untitled section</em>}</span>
                    <i className={`bi ${open ? 'bi-chevron-up' : 'bi-chevron-down'}`} />
                  </button>
                  <div className="qf-editor-tools">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up"><i className="bi bi-arrow-up" /></button>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === draft.sections.length - 1} aria-label="Move down"><i className="bi bi-arrow-down" /></button>
                    <button type="button" className="is-danger" onClick={() => removeSection(section)} aria-label="Delete section"><i className="bi bi-trash3" /></button>
                  </div>
                </div>

                {open && (
                  <div className="qf-editor-section-body">
                    <Form.Group className="mb-2">
                      <Form.Label className="small">Section title</Form.Label>
                      <Form.Control value={section.title} maxLength={200} onChange={(e) => updateSection(section.key, { title: e.target.value })} />
                    </Form.Group>
                    <div className="qf-editor-tabs" role="tablist">
                      <button type="button" className={!preview ? 'is-active' : ''} onClick={() => setPreviewKeys((p) => ({ ...p, [section.key]: false }))}>Write</button>
                      <button type="button" className={preview ? 'is-active' : ''} onClick={() => setPreviewKeys((p) => ({ ...p, [section.key]: true }))}>Preview</button>
                    </div>
                    {preview ? (
                      <div className="qf-editor-preview"><Markdown>{section.body}</Markdown></div>
                    ) : (
                      <Form.Control
                        as="textarea"
                        rows={10}
                        className="qf-editor-textarea"
                        value={section.body}
                        maxLength={50000}
                        onChange={(e) => updateSection(section.key, { body: e.target.value })}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Modal.Body>

      <Modal.Footer className="qf-editor-footer">
        {isCustom && (
          <Button variant="outline-danger" onClick={reset} disabled={saving} className="me-auto">
            <i className="bi bi-arrow-counterclockwise me-1" /> Delete saved version
          </Button>
        )}
        <Button variant="outline-secondary" onClick={close} disabled={saving}>Cancel</Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Spinner size="sm" animation="border" className="me-2" /> : <i className="bi bi-cloud-check me-1" />}
          Save page
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContentEditor;
