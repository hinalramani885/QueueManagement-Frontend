import { useCallback, useEffect, useState } from 'react';
import { contentService } from '../services/contentService';
import defaultContent from '../content/defaultContent.json';

/**
 * Loads an editable information page. Uses the admin's saved version from the database when there is one,
 * otherwise the built-in default text (the API answers 404 for pages that were never customised).
 *
 * @returns {{ page, isCustom, loading, error, save, reset, reload }}
 */
const useContentPage = (slug) => {
  const fallback = defaultContent[slug];
  const [page, setPage] = useState(fallback);
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await contentService.get(slug);
      setPage(data);
      setIsCustom(true);
    } catch (err) {
      if (err?.response?.status !== 404) setError(err);
      setPage(defaultContent[slug]);
      setIsCustom(false);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  /** Saves the page (admin only) and shows the stored version. */
  const save = useCallback(async (next) => {
    const { data } = await contentService.save(slug, next);
    setPage(data);
    setIsCustom(true);
    return data;
  }, [slug]);

  /** Deletes the saved version (admin only), so the default text is shown again. */
  const reset = useCallback(async () => {
    await contentService.remove(slug);
    setPage(defaultContent[slug]);
    setIsCustom(false);
  }, [slug]);

  return { page, isCustom, loading, error, save, reset, reload: load, defaults: fallback };
};

export default useContentPage;
