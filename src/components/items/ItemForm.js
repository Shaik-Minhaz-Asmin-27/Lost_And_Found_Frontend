import React, { useState, useEffect } from 'react';
import { itemsAPI } from '../../services/api';
import ImageUpload from './ImageUpload';
import { FiMapPin, FiCalendar, FiTag, FiType, FiAlignLeft } from 'react-icons/fi';
import './ItemForm.css';

const ITEM_TYPES = ['LOST', 'FOUND'];

export default function ItemForm({ initialData, onSubmit, loading }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'LOST',
    category: '',
    location: '',
    imageUrl: '',
    dateOccurred: '',
    ...initialData,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    itemsAPI.getCategories()
      .then(res => setCategories(res.data))
      .catch(() => {});
  }, []);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title    = 'Title is required';
    if (!form.type)            e.type     = 'Type is required';
    if (!form.category.trim()) e.category = 'Category is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (!payload.dateOccurred) delete payload.dateOccurred;
    onSubmit(payload);
  };

  return (
    <form className="item-form" onSubmit={handleSubmit} noValidate>

      {/* Type Toggle */}
      <div className="item-form__group">
        <label className="item-form__label"><FiTag size={13} /> Item Type *</label>
        <div className="item-form__toggle">
          {ITEM_TYPES.map(t => (
            <button
              type="button"
              key={t}
              className={`item-form__toggle-btn item-form__toggle-btn--${t.toLowerCase()} ${form.type === t ? 'active' : ''}`}
              onClick={() => setForm(f => ({ ...f, type: t }))}
            >
              {t === 'LOST' ? '🔍 I Lost Something' : '📦 I Found Something'}
            </button>
          ))}
        </div>
        {errors.type && <span className="item-form__error">{errors.type}</span>}
      </div>

      {/* Title */}
      <div className="item-form__group">
        <label className="item-form__label"><FiType size={13} /> Title *</label>
        <input
          className={`item-form__input ${errors.title ? 'error' : ''}`}
          type="text"
          value={form.title}
          onChange={set('title')}
          placeholder="e.g. Blue Adidas backpack"
          maxLength={150}
        />
        {errors.title && <span className="item-form__error">{errors.title}</span>}
      </div>

      {/* Category */}
      <div className="item-form__group">
        <label className="item-form__label"><FiTag size={13} /> Category *</label>
        <input
          className={`item-form__input ${errors.category ? 'error' : ''}`}
          type="text"
          value={form.category}
          onChange={set('category')}
          placeholder="e.g. Bags, Electronics, ID Cards…"
          list="categories-list"
          maxLength={100}
        />
        <datalist id="categories-list">
          {categories.map(c => <option key={c} value={c} />)}
        </datalist>
        {errors.category && <span className="item-form__error">{errors.category}</span>}
      </div>

      {/* Description */}
      <div className="item-form__group">
        <label className="item-form__label"><FiAlignLeft size={13} /> Description</label>
        <textarea
          className="item-form__textarea"
          value={form.description}
          onChange={set('description')}
          placeholder="Describe the item in detail — color, brand, distinguishing features…"
          rows={4}
          maxLength={2000}
        />
      </div>

      {/* Location + Date row */}
      <div className="item-form__row">
        <div className="item-form__group">
          <label className="item-form__label"><FiMapPin size={13} /> Location</label>
          <input
            className="item-form__input"
            type="text"
            value={form.location}
            onChange={set('location')}
            placeholder="e.g. Library Block B"
            maxLength={150}
          />
        </div>
        <div className="item-form__group">
          <label className="item-form__label"><FiCalendar size={13} /> Date Occurred</label>
          <input
            className="item-form__input"
            type="datetime-local"
            value={form.dateOccurred}
            onChange={set('dateOccurred')}
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="item-form__group">
        <label className="item-form__label">📷 Photo of Item</label>
        <ImageUpload
          value={form.imageUrl}
          onChange={(url) => setForm(f => ({ ...f, imageUrl: url }))}
        />
      </div>

      <button type="submit" className="item-form__submit" disabled={loading}>
        {loading ? <span className="spinner" /> : (initialData ? 'Save Changes' : 'Submit Report')}
      </button>
    </form>
  );
}