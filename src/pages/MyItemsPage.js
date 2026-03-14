import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ItemCard from '../components/items/ItemCard';
import { FiPlusCircle, FiPackage, FiCheckSquare, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './MyItemsPage.css';

const TABS = [
  { key: 'reported', label: 'My Reports',      icon: <FiPackage size={15} /> },
  { key: 'claimed',  label: 'Claimed by Me',   icon: <FiCheckSquare size={15} /> },
];

export default function MyItemsPage() {
  const { user } = useAuth();
  const [tab, setTab]         = useState('reported');
  const [items, setItems]     = useState([]);
  const [page, setPage]       = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [pageNum, setPageNum] = useState(0);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = { page: pageNum, size: 9 };
    const call   = tab === 'reported'
      ? itemsAPI.getMyItems(params)
      : itemsAPI.getMyClaimedItems(params);

    call
      .then(res => {
        const d = res.data;
        setItems(d.content || []);
        setPage({ number: d.number, totalPages: d.totalPages, totalElements: d.totalElements });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab, pageNum]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const switchTab = (t) => { setTab(t); setPageNum(0); };

  return (
    <div className="my-items container">
      {/* Header */}
      <div className="my-items__header fade-up">
        <div>
          <h1 className="my-items__title">My Items</h1>
          <p className="my-items__sub">
            Welcome, <strong>{user?.username}</strong> — manage your reports and claims
          </p>
        </div>
        <Link to="/report" className="my-items__report-btn">
          <FiPlusCircle size={15} /> New Report
        </Link>
      </div>

      {/* Tabs */}
      <div className="my-items__tabs fade-up-1">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`my-items__tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => switchTab(t.key)}
          >
            {t.icon} {t.label}
            {tab === t.key && page.totalElements > 0 && (
              <span className="my-items__tab-count">{page.totalElements}</span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="my-items__skeleton-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="my-items__skeleton" />)}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="my-items__grid fade-up-2">
            {items.map(item => <ItemCard key={item.id} item={item} />)}
          </div>
          {page.totalPages > 1 && (
            <div className="my-items__pagination fade-up-3">
              <button
                className="my-items__page-btn"
                disabled={page.number === 0}
                onClick={() => setPageNum(n => n - 1)}
              >
                <FiChevronLeft size={16} /> Prev
              </button>
              <span className="my-items__page-info">
                {page.number + 1} / {page.totalPages}
              </span>
              <button
                className="my-items__page-btn"
                disabled={page.number >= page.totalPages - 1}
                onClick={() => setPageNum(n => n + 1)}
              >
                Next <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="my-items__empty fade-up-2">
          {tab === 'reported' ? (
            <>
              <FiPackage size={36} />
              <p>You haven't reported any items yet.</p>
              <Link to="/report" className="my-items__report-btn">
                <FiPlusCircle size={15} /> Report your first item
              </Link>
            </>
          ) : (
            <>
              <FiCheckSquare size={36} />
              <p>You haven't claimed any items yet.</p>
              <Link to="/items" className="my-items__report-btn">Browse found items</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
