import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import ItemForm from '../components/items/ItemForm';
import toast from 'react-hot-toast';
import './FormPage.css';

export default function ReportItemPage() {
  const navigate      = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await itemsAPI.create(data);
      toast.success('Item reported successfully!');
      navigate(`/items/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page container">
      <div className="form-page__header fade-up">
        <span className="form-page__label">New Report</span>
        <h1 className="form-page__title">Report an Item</h1>
        <p className="form-page__sub">
          Fill in as many details as possible to help identify the item.
        </p>
      </div>
      <div className="form-page__card fade-up-1">
        <ItemForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
