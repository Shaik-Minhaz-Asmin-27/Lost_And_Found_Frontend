import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/items/ItemCard';
import { FiSearch, FiArrowRight, FiPackage, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './HomePage.css';

export default function HomePage() {
  const [stats, setStats]       = useState(null);
  const [recent, setRecent]     = useState([]);
  const [search, setSearch]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    itemsAPI.getStats().then(r => setStats(r.data)).catch(() => {});
    itemsAPI.getAll({ size: 6, sortBy: 'dateReported', sortDir: 'desc' })
      .then(r => setRecent(r.data.content || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/items?keyword=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="home">
      {/* Hero */}
      <section className="home__hero">
        <div className="home__hero-bg" />
        <div className="container home__hero-inner">
          <div className="home__hero-content fade-up">
            <span className="home__hero-label">Smart Campus System</span>
            <h1 className="home__hero-title">
              Lost something<br />
              <span className="home__hero-accent">on campus?</span>
            </h1>
            <p className="home__hero-sub">
              Report lost items, browse found items, and reunite with your belongings — all in one place.
            </p>
            <form className="home__search" onSubmit={handleSearch}>
              <FiSearch className="home__search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by item name, category, location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="home__search-input"
              />
              <button type="submit" className="home__search-btn">Search</button>
            </form>
            <div className="home__hero-actions">
              <Link to="/report" className="home__cta home__cta--primary">Report Item</Link>
              <Link to="/items"  className="home__cta home__cta--ghost">Browse All <FiArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="home__stats container fade-up-1">
          <div className="home__stat">
            <FiAlertCircle size={22} className="home__stat-icon home__stat-icon--lost" />
            <div>
              <div className="home__stat-value">{stats.totalLost}</div>
              <div className="home__stat-label">Lost Items</div>
            </div>
          </div>
          <div className="home__stat">
            <FiPackage size={22} className="home__stat-icon home__stat-icon--found" />
            <div>
              <div className="home__stat-value">{stats.totalFound}</div>
              <div className="home__stat-label">Found Items</div>
            </div>
          </div>
          <div className="home__stat">
            <FiCheckCircle size={22} className="home__stat-icon home__stat-icon--claimed" />
            <div>
              <div className="home__stat-value">{stats.totalClaimed}</div>
              <div className="home__stat-label">Reunited</div>
            </div>
          </div>
          <div className="home__stat">
            <FiPackage size={22} className="home__stat-icon" />
            <div>
              <div className="home__stat-value">{stats.totalItems}</div>
              <div className="home__stat-label">Total Reports</div>
            </div>
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section className="home__recent container">
        <div className="home__section-header fade-up-2">
          <h2 className="home__section-title">Recent Reports</h2>
          <Link to="/items" className="home__section-link">View all <FiArrowRight size={14} /></Link>
        </div>
        {recent.length > 0 ? (
          <div className="home__grid fade-up-3">
            {recent.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
        ) : (
          <p className="home__empty">No items reported yet. Be the first!</p>
        )}
      </section>

      {/* How it works */}
      <section className="home__how container fade-up-4">
        <h2 className="home__section-title">How It Works</h2>
        <div className="home__steps">
          {[
            { n: '01', t: 'Report', d: 'Lost something? Report it with details and location. Found something? Post it here.' },
            { n: '02', t: 'Search', d: 'Browse all reports filtered by type, category, or keyword to find your item.' },
            { n: '03', t: 'Claim',  d: 'Spot your item? Claim it and connect with the finder to arrange return.' },
          ].map(s => (
            <div className="home__step" key={s.n}>
              <span className="home__step-n">{s.n}</span>
              <h3 className="home__step-title">{s.t}</h3>
              <p className="home__step-desc">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
