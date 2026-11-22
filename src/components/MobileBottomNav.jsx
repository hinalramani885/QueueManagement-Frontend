import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion as Motion } from 'framer-motion';
import QRScannerModal from './QRScannerModal';
import './MobileBottomNav.css';

// Tabs per role. "scan" is the raised centre button that opens the QR scanner.
const TABS = {
  guest: [
    { to: '/', icon: 'bi-house-door', activeIcon: 'bi-house-door-fill', label: 'Home', end: true },
    { to: '/places', icon: 'bi-buildings', activeIcon: 'bi-buildings-fill', label: 'Places' },
    { scan: true },
    { to: '/search', icon: 'bi-search', activeIcon: 'bi-search', label: 'Search' },
    { to: '/login', icon: 'bi-person-circle', activeIcon: 'bi-person-circle', label: 'Login' },
  ],
  USER: [
    { to: '/user/dashboard', icon: 'bi-grid-1x2', activeIcon: 'bi-grid-1x2-fill', label: 'Home' },
    { to: '/places', icon: 'bi-buildings', activeIcon: 'bi-buildings-fill', label: 'Places' },
    { scan: true },
    { to: '/favorites', icon: 'bi-heart', activeIcon: 'bi-heart-fill', label: 'Favorites' },
    { to: '/profile', icon: 'bi-person-circle', activeIcon: 'bi-person-circle', label: 'Profile' },
  ],
  PROVIDER: [
    { to: '/provider/queues', icon: 'bi-list-ol', activeIcon: 'bi-list-ol', label: 'Queues' },
    { to: '/places', icon: 'bi-buildings', activeIcon: 'bi-buildings-fill', label: 'Places' },
    { scan: true },
    { to: '/search', icon: 'bi-search', activeIcon: 'bi-search', label: 'Search' },
    { to: '/profile', icon: 'bi-person-circle', activeIcon: 'bi-person-circle', label: 'Profile' },
  ],
  ADMIN: [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', activeIcon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/places', icon: 'bi-buildings', activeIcon: 'bi-buildings-fill', label: 'Places' },
    { scan: true },
    { to: '/provider/queues', icon: 'bi-list-ol', activeIcon: 'bi-list-ol', label: 'Queues' },
    { to: '/profile', icon: 'bi-person-circle', activeIcon: 'bi-person-circle', label: 'Profile' },
  ],
};

/** App-style bottom tab bar, shown only on phones and small tablets (below Bootstrap's lg breakpoint). */
const MobileBottomNav = () => {
  const { token, role } = useSelector((state) => state.auth);
  const [showScanner, setShowScanner] = useState(false);
  const location = useLocation();
  const tabs = (token && TABS[role]) || TABS.guest;

  const isActive = (tab) =>
    tab.end ? location.pathname === tab.to : location.pathname === tab.to || location.pathname.startsWith(`${tab.to}/`);

  return (
    <>
      <nav className="ql-bottom-nav" aria-label="Main">
        {tabs.map((tab) =>
          tab.scan ? (
            <button key="scan" type="button" className="ql-bottom-scan" onClick={() => setShowScanner(true)} aria-label="Scan QR code">
              <span className="ql-bottom-scan-ring" />
              <i className="bi bi-qr-code-scan" />
            </button>
          ) : (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className="ql-bottom-item">
              {isActive(tab) && (
                <Motion.span
                  layoutId="ql-bottom-active"
                  className="ql-bottom-pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <i className={`bi ${isActive(tab) ? tab.activeIcon : tab.icon}`} />
              <span>{tab.label}</span>
            </NavLink>
          ),
        )}
      </nav>
      <QRScannerModal show={showScanner} onHide={() => setShowScanner(false)} />
    </>
  );
};

export default MobileBottomNav;
