import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { itemsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import {
  FiMapPin, FiClock, FiUser, FiPhone, FiMail,
  FiEdit2, FiTrash2, FiArrowLeft, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';
import './ItemDetailPage.css';

const STATUS_OPTIONS = ['OPEN', 'CLAIMED', 'CLOSED'];

export default function ItemDetailPage() {
  const { id }          = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate        = useNavigate();

  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming]   = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  useEffect(() => {
    itemsAPI.getById(id)
      .then(r => setItem(r.data))
      .catch(() => { toast.error('Item not found'); navigate('/items'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="item-detail container">
      <div className="item-detail__skeleton" />
    </div>
  );

  if (!item) return null;

  const isOwner   = user?.userId === item.reportedBy?.id;
  const isClaimed = item.status !== 'OPEN';
  const timeAgo   = formatDistanceToNow(new Date(item.dateReported), { addSuffix: true });
  const dateStr   = format(new Date(item.dateReported), 'PPP');

  const handleClaim = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setClaiming(true);
    try {
      const res = await itemsAPI.claim(id);
      setItem(res.data);
      toast.success('Item claimed! Contact the reporter to arrange pickup.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not claim item.');
    } finally {
      setClaiming(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    setDeletingItem(true);
    try {
      await itemsAPI.delete(id);
      toast.success('Item deleted.');
      navigate('/my-items');
    } catch {
      toast.error('Could not delete item.');
      setDeletingItem(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusChanging(true);
    try {
      const res = await itemsAPI.updateStatus(id, newStatus);
      setItem(res.data);
      toast.success(`Status updated to ${newStatus}`);
    } catch {
      toast.error('Could not update status.');
    } finally {
      setStatusChanging(false);
    }
  };

  return (
    <div className="item-detail container">
      <button className="item-detail__back fade-up" onClick={() => navigate(-1)}>
        <FiArrowLeft size={15} /> Back
      </button>

      <div className="item-detail__layout fade-up-1">
        {/* Left — Image */}
        <div className="item-detail__image-col">
          <div className="item-detail__image">
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.title} />
              : <div className="item-detail__image-placeholder">
                  {item.category?.[0]?.toUpperCase() || '?'}
                </div>
            }
          </div>

          {/* Contact card (show if claimed or item owner) */}
          {(item.claimedBy || isOwner) && (
            <div className="item-detail__contact fade-up-2">
              <h3 className="item-detail__contact-title">
                {item.claimedBy ? 'Claimed by' : 'Reported by'}
              </h3>
              {(() => {
                const contact = item.claimedBy || item.reportedBy;
                return (
                  <>
                    <div className="item-detail__contact-row">
                      <FiUser size={13} />
                      <span>{contact.fullName || contact.username}</span>
                    </div>
                    {contact.email && (
                      <div className="item-detail__contact-row">
                        <FiMail size={13} />
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </div>
                    )}
                    {contact.phoneNumber && (
                      <div className="item-detail__contact-row">
                        <FiPhone size={13} />
                        <a href={`tel:${contact.phoneNumber}`}>{contact.phoneNumber}</a>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right — Details */}
        <div className="item-detail__info-col">
          <div className="item-detail__badges">
            <span className={`badge badge-${item.type?.toLowerCase()}`}>{item.type}</span>
            <span className={`badge badge-${item.status?.toLowerCase()}`}>{item.status}</span>
          </div>

          <p className="item-detail__category">{item.category}</p>
          <h1 className="item-detail__title">{item.title}</h1>

          {item.description && (
            <p className="item-detail__desc">{item.description}</p>
          )}

          <div className="item-detail__meta">
            {item.location && (
              <div className="item-detail__meta-row">
                <FiMapPin size={14} />
                <span>{item.location}</span>
              </div>
            )}
            <div className="item-detail__meta-row">
              <FiClock size={14} />
              <span>Reported {timeAgo} — {dateStr}</span>
            </div>
            {item.dateOccurred && (
              <div className="item-detail__meta-row">
                <FiAlertCircle size={14} />
                <span>Occurred: {format(new Date(item.dateOccurred), 'PPPp')}</span>
              </div>
            )}
            <div className="item-detail__meta-row">
              <FiUser size={14} />
              <span>Reported by <strong>{item.reportedBy?.username}</strong></span>
            </div>
          </div>

          {/* Divider */}
          <div className="item-detail__divider" />

          {/* Actions */}
          <div className="item-detail__actions">

            {/* Claim button — for non-owners on open items */}
            {!isOwner && !isClaimed && isAuthenticated && (
              <button
                className="item-detail__btn item-detail__btn--claim"
                onClick={handleClaim}
                disabled={claiming}
              >
                {claiming
                  ? <span className="spinner" />
                  : <><FiCheckCircle size={15} /> {item.type === 'FOUND' ? 'This is mine — Claim it' : 'I found this!'}</>
                }
              </button>
            )}

            {!isOwner && !isClaimed && !isAuthenticated && (
              <Link to="/login" className="item-detail__btn item-detail__btn--claim">
                <FiCheckCircle size={15} /> Sign in to claim
              </Link>
            )}

            {isClaimed && (
              <div className="item-detail__claimed-notice">
                <FiCheckCircle size={16} />
                This item has been {item.status?.toLowerCase()}
              </div>
            )}

            {/* Owner actions */}
            {isOwner && (
              <div className="item-detail__owner-actions">
                <div className="item-detail__status-row">
                  <span className="item-detail__status-label">Update Status:</span>
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      className={`item-detail__status-btn ${item.status === s ? 'active' : ''}`}
                      onClick={() => item.status !== s && handleStatusChange(s)}
                      disabled={statusChanging || item.status === s}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="item-detail__edit-row">
                  <Link to={`/items/${id}/edit`} className="item-detail__btn item-detail__btn--edit">
                    <FiEdit2 size={14} /> Edit
                  </Link>
                  <button
                    className="item-detail__btn item-detail__btn--delete"
                    onClick={handleDelete}
                    disabled={deletingItem}
                  >
                    {deletingItem ? <span className="spinner" /> : <><FiTrash2 size={14} /> Delete</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
