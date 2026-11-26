// Accent colour themes the user can pick from the navbar (stored per device).
export const ACCENTS = [
  { id: 'indigo', label: 'Indigo', swatch: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
  { id: 'ocean', label: 'Ocean', swatch: 'linear-gradient(135deg, #0ea5e9, #6366f1)' },
  { id: 'emerald', label: 'Emerald', swatch: 'linear-gradient(135deg, #10b981, #14b8a6)' },
  { id: 'sunset', label: 'Sunset', swatch: 'linear-gradient(135deg, #f97316, #ec4899)' },
  { id: 'rose', label: 'Rose', swatch: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
];

const KEY = 'qflow-accent';

export const getAccent = () => {
  try {
    const saved = localStorage.getItem(KEY);
    return ACCENTS.some((a) => a.id === saved) ? saved : 'indigo';
  } catch {
    return 'indigo';
  }
};

export const applyAccent = (id) => {
  document.documentElement.setAttribute('data-accent', id);
};

export const setAccent = (id) => {
  applyAccent(id);
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* storage unavailable: the choice lasts for this visit */
  }
  window.dispatchEvent(new CustomEvent('qflow-accent', { detail: id }));
};
