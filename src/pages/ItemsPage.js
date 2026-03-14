import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemCard from '../components/items/ItemCard';
import { FiSearch, FiFilter, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './ItemsPage.css';

const STATUSES = ['', 'OPEN', 'CLAIMED', 'CLOSED'];
const TYPES    = ['', 'LOST', 'FOUND'];

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems]         = useState([]);
  const [allItems, setAllItems]   = useState([]);
  const [page, setPage]           = useState({ number: 0, totalPages: 0, totalElements: 0 });
  const [loading, setLoading]     = useState(true);
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const [filters, setFilters] = useState({
    keyword:  searchParams.get('keyword')  || '',
    type:     searchParams.get('type')     || '',
    status:   searchParams.get('status')   || 'OPEN',
    category: searchParams.get('category') || '',
    pageNum:  0,
  });

  // Load all item titles once for autocomplete
  useEffect(() => {
    itemsAPI.getAll({ size: 200, sortBy: 'dateReported', sortDir: 'desc' })
      .then(res => setAllItems(res.data.content || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    itemsAPI.getCategories().then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = {
      page: filters.pageNum,
      size: 12,
      sortBy: 'dateReported',
      sortDir: 'desc',
    };
    if (filters.keyword)  params.keyword  = filters.keyword;
    if (filters.type)     params.type     = filters.type;
    if (filters.status)   params.status   = filters.status;
    if (filters.category) params.category = filters.category;

    itemsAPI.getAll(params)
      .then(res => {
        const d = res.data;
        setItems(d.content || []);
        setPage({ number: d.number, totalPages: d.totalPages, totalElements: d.totalElements });
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setActiveSuggestion(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeywordChange = (e) => {
    const val = e.target.value;
    setFilters(f => ({ ...f, keyword: val, pageNum: 0 }));

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lower = val.toLowerCase();
    const matched = allItems
      .filter(item =>
        item.title.toLowerCase().includes(lower) ||
        (item.category && item.category.toLowerCase().includes(lower))
      )
      .map(item => ({ id: item.id, title: item.title, category: item.category, type: item.type }))
      .filter((item, index, self) =>
        index === self.findIndex(i => i.title === item.title)
      )
      .slice(0, 6);

    setSuggestions(matched);
    setShowSuggestions(matched.length > 0);
    setActiveSuggestion(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    setFilters(f => ({ ...f, keyword: suggestion.title, pageNum: 0 }));
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const setFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value, pageNum: 0 }));
  };

  const clearFilters = () => {
    setFilters({ keyword: '', type: '', status: 'OPEN', category: '', pageNum: 0 });
    setSearchParams({});
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const activeFilterCount = [filters.type, filters.category, filters.keyword]
    .filter(Boolean).length + (filters.status !== 'OPEN' ? 1 : 0);

  return (
    <div className="items-page container">
      <div className="items-page__header fade-up">
        <div>
          <h1 className="items-page__title">Browse Items</h1>
          <p className="items-page__sub">{page.totalElements} reports found</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="items-page__filters fade-up-1">

        {/* Search with Autocomplete */}
        <div className="items-page__search-wrap" ref={searchRef}>
          <FiSearch size={15} className="items-page__search-icon" />
          <input
            className="items-page__search"
            type="text"
            placeholder="Search items…"
            value={filters.keyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            autoComplete="off"
          />
          {filters.keyword && (
            <button className="items-page__clear-btn" onClick={() => {
              setFilter('keyword', '');
              setSuggestions([]);
              setShowSuggestions(false);
            }}>
              <FiX size={14} />
            </button>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="items-page__suggestions" ref={suggestionsRef}>
              {suggestions.map((s, i) => (
                <div
                  key={s.id}
                  className={`items-page__suggestion ${i === activeSuggestion ? 'active' : ''}`}
                  onMouseDown={() => handleSuggestionClick(s)}
                >
                  <FiSearch size={12} className="items-page__suggestion-icon" />
                  <div className="items-page__suggestion-text">
                    <span className="items-page__suggestion-title">{s.title}</span>
                    {s.category && (
                      <span className="items-page__suggestion-category">{s.category}</span>
                    )}
                  </div>
                  <span className={`items-page__suggestion-type ${s.type?.toLowerCase()}`}>
                    {s.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type */}
        <select className="items-page__select" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
          <option value="">All Types</option>
          {TYPES.filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Status */}
        <select className="items-page__select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Category */}
        <select className="items-page__select" value={filters.category} onChange={e => setFilter('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {activeFilterCount > 0 && (
          <button className="items-page__reset" onClick={clearFilters}>
            <FiX size={13} /> Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="items-page__skeleton-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="items-page__skeleton" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="items-page__grid fade-up-2">
          {items.map(item => <ItemCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="items-page__empty fade-up-2">
          <FiFilter size={32} />
          <p>No items match your filters.</p>
          <button className="items-page__reset" onClick={clearFilters}>Clear all filters</button>
        </div>
      )}

      {/* Pagination */}
      {page.totalPages > 1 && (
        <div className="items-page__pagination fade-up-3">
          <button
            className="items-page__page-btn"
            disabled={page.number === 0}
            onClick={() => setFilters(f => ({ ...f, pageNum: f.pageNum - 1 }))}
          >
            <FiChevronLeft size={16} /> Prev
          </button>
          <span className="items-page__page-info">
            Page {page.number + 1} of {page.totalPages}
          </span>
          <button
            className="items-page__page-btn"
            disabled={page.number >= page.totalPages - 1}
            onClick={() => setFilters(f => ({ ...f, pageNum: f.pageNum + 1 }))}
          >
            Next <FiChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}