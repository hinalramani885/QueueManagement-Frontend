// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, NavDropdown, Badge, Collapse } from 'react-bootstrap';
import { logout } from '../redux/authSlice';
import WebSocketService from '../services/websocketService';
import { FaSearch, FaQrcode } from 'react-icons/fa';
import "./Navbar.css";
import QRScannerModal from './QRScannerModal';
import { toggleDarkMode } from '../redux/authSlice';
import { toast } from "react-toastify";
import { messaging, getToken } from '../firebase';
import axiosInstance from '../utils/axiosInstance';
import { backendUrl } from '../config';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, role, name, profileImageUrl } = useSelector((state) => state.auth);
  const { connected } = useSelector((state) => state.queue);

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const isAuthenticated = !!token;
  const { preferences } = useSelector((state) => state.auth);


  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

const handleLogout = async () => {
  try {
    // Get current FCM token and remove it (only when push notifications are configured and allowed)
    const currentToken = messaging && Notification.permission === 'granted'
      ? await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY })
      : null;
    if (currentToken) {
      await axiosInstance.delete(`/user/fcm-token?token=${encodeURIComponent(currentToken)}`);
    }
  } catch (error) {
    console.error('Failed to remove FCM token:', error);
  } finally {
    WebSocketService.disconnect();
    dispatch(logout());
    navigate('/');
    toast.info("You have been logged out.");
  }
};

const getInitials = (fullName) =>
    fullName
      ? fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      : '';

  const getFallbackImage = () => {
    const initials = getInitials(name);
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><rect width="100%" height="100%" fill="%234f46e5"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" dy=".3em">${initials}</text></svg>`;
  };

  // Construct full URL – only prepend backend if it's an uploaded image (starts with /uploads/)
  const fullProfileImageUrl = profileImageUrl
    ? (profileImageUrl.startsWith("/uploads/") ? backendUrl(profileImageUrl) : profileImageUrl)
    : null;

  return (
    <>
      <nav className={`ql-navbar navbar navbar-expand-lg sticky-top ${scrolled ? 'scrolled' : ''}`}>
        <div className="container-fluid px-3 px-lg-4">
          {/* QFlow brand: logo mark + name */}
          <Link to="/" className="navbar-brand d-flex align-items-center qf-brand" aria-label="QFlow home">
            <span className="qf-brand-mark">
              <img src="/qflow-mark.png" alt="" width="46" height="35" />
            </span>
            <span className="qf-brand-text">Q<span>Flow</span></span>
            {isAuthenticated && connected && (
              <Badge bg="success" className="ms-2 ql-live-badge" pill>
                <span className="ql-live-dot"></span>
                Live
              </Badge>
            )}
          </Link>

          {/* Mobile Toggle with Animation */}
          <button
            className={`ql-toggler navbar-toggler border-0 ${open ? 'open' : ''}`}
            type="button"
            aria-controls="navbar-content"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
          >
            <span className="ql-toggler-icon ql-toggler-icon-top"></span>
            <span className="ql-toggler-icon ql-toggler-icon-middle"></span>
            <span className="ql-toggler-icon ql-toggler-icon-bottom"></span>
          </button>

          {/* Collapsible Content */}
          <Collapse in={open}>
            <div className="ql-navbar-collapse navbar-collapse mt-3 mt-lg-0" id="navbar-content">
              <div className="d-flex flex-column flex-lg-row gap-2 align-items-lg-center ms-lg-auto">
                {!isAuthenticated ? (
                  <>
                    <Button className="ql-nav-btn" onClick={() => navigate('/login')}>
                      <i className="bi bi-box-arrow-in-right me-2"></i>Login
                    </Button>
                    <Button className="ql-nav-btn-outline" onClick={() => navigate('/register')}>
                      <i className="bi bi-person-plus me-2"></i>Sign Up
                    </Button>
                    <Button className="ql-nav-btn-warning" onClick={() => navigate('/pricing')}>
                      <i className="bi bi-star me-2"></i>Be an Admin
                    </Button>
                    <Button className="ql-nav-btn-provider" onClick={() => navigate('/become-provider')}>
                      <i className="bi bi-briefcase me-2"></i>Be a Provider
                    </Button>
                  </>
                ) : (
                  <>
                    <Button className="ql-nav-btn-outline" onClick={() => navigate('/places')}>
                      <i className="bi bi-buildings me-2"></i>Places
                    </Button>

                    {/* 🆕 Add the new search button here */}
                    <Button
                      onClick={() => navigate('/search')}
                      className="ql-nav-btn-outline"
                    >
                      <FaSearch className="me-1" />
                      Advanced Search
                    </Button>

                    <Button
                      onClick={() => setShowScanner(true)}
                      className="ql-nav-btn-outline"
                    >
                      <FaQrcode className="me-1" />
                      Scan QR
                    </Button>

                    {/* Corrected Favorites button using Bootstrap Icons */}
                    <Button
                      className="ql-nav-btn-outline"
                      onClick={() => navigate('/favorites')}
                    >
                      <i className="bi bi-heart-fill me-2 "></i>
                      Favorites
                    </Button>

                    {role === 'ADMIN' && (
                      <>
                        <Button className="ql-nav-btn-outline" onClick={() => navigate('/admin/dashboard')}>
                          <i className="bi bi-speedometer2 me-2"></i>My Dashboard
                        </Button>
                        <Button className="ql-nav-btn-info" onClick={() => navigate('/admin/places')}>
                          <i className="bi bi-gear me-2"></i>Manage Places
                        </Button>
                        <Button className="ql-nav-btn-info" onClick={() => navigate('/provider-pricing')}>
                          <i className="bi bi-person-plus me-2"></i>Make Providers
                        </Button>
                      </>
                    )}

                    {role === 'PROVIDER' && (
                      <Button className="ql-nav-btn-outline" onClick={() => navigate('/provider/queues')}>
                        <i className="bi bi-list-check me-2"></i>My Queues
                      </Button>
                    )}

                    {role === 'USER' && (
                      <Button className="ql-nav-btn-outline" onClick={() => navigate('/user/dashboard')}>
                        <i className="bi bi-speedometer2 me-2"></i>My Dashboard
                      </Button>
                    )}

                    {/* Improved Profile Dropdown */}
                    <NavDropdown
                      title={
                        <div className="d-flex align-items-center ql-profile-trigger-container">
                          <div className="ql-profile-avatar-wrapper me-2">
                           <img
                              src={fullProfileImageUrl ? `${fullProfileImageUrl}?t=${Date.now()}` : getFallbackImage()}
                              onError={(e) => { e.target.src = getFallbackImage(); }}
                              alt="Profile"
                              className="rounded-circle ql-profile-avatar-img"
                            />
                          </div>
                          <span className="ql-profile-name-text d-none d-lg-block">{name}</span>
                        </div>
                      }
                      id="user-dropdown"
                      align="end"
                      className="ql-profile-dropdown-btn"
                    >
                      <div className="ql-dropdown-header px-4 py-3">
                        <h6 className="mb-0 text-dark">{name}</h6>
                        <small className="text-muted text-uppercase">{role}</small>
                      </div>
                      <NavDropdown.Divider className="my-0 ql-dropdown-divider" />
                      <NavDropdown.Item onClick={() => navigate('/profile')} className="ql-dropdown-item">
                        <i className="bi bi-person-circle me-2"></i>
                        Profile
                      </NavDropdown.Item>

                      <NavDropdown.Item onClick={() => dispatch(toggleDarkMode())} className="ql-dropdown-item">
                        <i className="bi bi-moon-stars me-2"></i>
                        {preferences.darkMode ? 'Light Mode' : 'Dark Mode'}
                      </NavDropdown.Item>
                      {/* Settings link removed – no route yet */}
                      <NavDropdown.Divider className="ql-dropdown-divider" />
                      <NavDropdown.Item onClick={handleLogout} className="ql-dropdown-item">
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </NavDropdown.Item>


                    </NavDropdown>
                  </>
                )}
              </div>
            </div>
          </Collapse>
        </div>
      </nav>

      {/* Spacer so content is never hidden */}
     
      <QRScannerModal show={showScanner} onHide={() => setShowScanner(false)} />
    </>
  );
};

export default Navbar;