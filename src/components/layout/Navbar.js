import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiSearch, FiPlusCircle, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">◈</span>
          <span className="navbar__logo-text">Campus<strong>Find</strong></span>
        </Link>

        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <Link to="/items"    className={`navbar__link ${isActive('/items')    ? 'active' : ''}`}>Browse</Link>
          {isAuthenticated && (
            <Link to="/my-items" className={`navbar__link ${isActive('/my-items') ? 'active' : ''}`}>My Items</Link>
          )}
        </div>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <>
              <Link to="/report" className="navbar__btn navbar__btn--primary">
                <FiPlusCircle size={15} /> Report Item
              </Link>
              <div className="navbar__user">
                <span className="navbar__user-avatar">{user?.username?.[0]?.toUpperCase()}</span>
                <span className="navbar__user-name">{user?.username}</span>
              </div>
              <button className="navbar__icon-btn" onClick={handleLogout} title="Logout">
                <FiLogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar__btn navbar__btn--ghost">Log in</Link>
              <Link to="/register" className="navbar__btn navbar__btn--primary">Sign up</Link>
            </>
          )}
          <button className="navbar__hamburger" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
