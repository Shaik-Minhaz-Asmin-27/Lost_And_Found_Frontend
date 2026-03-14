import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ItemForm from '../components/items/ItemForm';
import toast from 'react-hot-toast';
import './FormPage.css';

export default function EditItemPage() {
  const { id }    = useParams();
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    itemsAPI.getById(id)
      .then(res => {
        const d = res.data;
        // Only owner can edit
        if (user?.userId !== d.reportedBy?.id) {
          toast.error('You are not allowed to edit this item.');
          navigate(`/items/${id}`);
          return;
        }
        setItem({
          ...d,
          dateOccurred: d.dateOccurred
            ? d.dateOccurred.slice(0, 16) // format for datetime-local
            : '',
        });
      })
      .catch(() => { toast.error('Item not found.'); navigate('/items'); })
      .finally(() => setFetching(false));
  }, [id, user, navigate]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await itemsAPI.update(id, data);
      toast.success('Item updated!');
      navigate(`/items/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="form-page container">
      <div className="form-page__skeleton" />
    </div>
  );

  if (!item) return null;

  return (
    <div className="form-page container">
      <div className="form-page__header fade-up">
        <span className="form-page__label">Edit Report</span>
        <h1 className="form-page__title">Update Item Details</h1>
        <p className="form-page__sub">
          Update the information below to keep your report accurate.
        </p>
      </div>
      <div className="form-page__card fade-up-1">
        <ItemForm initialData={item} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
