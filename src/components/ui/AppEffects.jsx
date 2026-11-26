import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { applyAccent, getAccent } from '../../utils/accent';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * App-wide visual layer:
 *  - soft animated pastel background ("aurora")
 *  - reading progress bar at the top
 *  - scroll-reveal animation for cards and `.reveal` elements
 *  - ripple on button press and a light spotlight that follows the pointer over cards
 *  - applies the saved accent colour theme
 */
const AppEffects = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);

  // Accent colour theme saved on this device
  useEffect(() => {
    applyAccent(getAccent());
  }, []);

  // Reading progress
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname]);

  // Scroll reveal: cards and .reveal elements fade/slide in when they enter the screen
  useEffect(() => {
    if (!('IntersectionObserver' in window) || reducedMotion()) return undefined;
    const SELECTOR = '.app-main .reveal, .app-main .card:not(.no-reveal)';
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      }),
      { rootMargin: '0px 0px -40px 0px', threshold: 0.05 },
    );
    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el, i) => {
        if (el.dataset.revealBound || el.closest('.modal')) return;
        el.dataset.revealBound = '1';
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('is-revealed'); // already visible: no flash
          return;
        }
        el.style.setProperty('--reveal-delay', `${Math.min(i % 6, 5) * 60}ms`);
        el.classList.add('reveal-pending');
        observer.observe(el);
      });
    };
    scan();
    const mutations = new MutationObserver(() => window.requestAnimationFrame(scan));
    const main = document.querySelector('.app-main');
    if (main) mutations.observe(main, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [location.pathname]);

  // Ripple on press + pointer spotlight on cards (event delegation, one listener each)
  useEffect(() => {
    if (reducedMotion()) return undefined;
    const onDown = (e) => {
      const btn = e.target.closest?.('.btn, .ql-nav-btn, .ql-nav-btn-outline, .ql-nav-btn-warning, .ql-nav-btn-info, .ql-nav-btn-provider, .pc-buy');
      if (!btn || btn.disabled) return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const ripple = document.createElement('span');
      ripple.className = 'qf-ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      if (getComputedStyle(btn).position === 'static') btn.style.position = 'relative';
      btn.classList.add('qf-ripple-host');
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    };
    const onMove = (e) => {
      const card = e.target.closest?.('.card, .qf-glass');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
    };
    document.addEventListener('pointerdown', onDown);
    const fine = window.matchMedia?.('(pointer: fine)').matches;
    if (fine) document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onDown);
      if (fine) document.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <>
      <div className="qf-aurora" aria-hidden="true">
        <span className="qf-aurora-blob qf-aurora-blob--1" />
        <span className="qf-aurora-blob qf-aurora-blob--2" />
        <span className="qf-aurora-blob qf-aurora-blob--3" />
        <span className="qf-aurora-blob qf-aurora-blob--4" />
      </div>
      <div className="qf-progress" style={{ transform: `scaleX(${progress / 100})` }} aria-hidden="true" />
    </>
  );
};

export default AppEffects;
