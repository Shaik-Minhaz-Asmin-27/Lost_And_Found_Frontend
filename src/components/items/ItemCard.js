import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiClock, FiUser } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import './ItemCard.css';

export default function ItemCard({ item }) {
  const timeAgo = formatDistanceToNow(new Date(item.dateReported), { addSuffix: true });

  return (
    <Link to={`/items/${item.id}`} className="item-card">
      <div className="item-card__image">
        {item.imageUrl
          ? <img src={item.imageUrl} alt={item.title} />
          : <div className="item-card__placeholder">{item.category?.[0]?.toUpperCase() || '?'}</div>
        }
        <div className="item-card__badges">
          <span className={`badge badge-${item.type?.toLowerCase()}`}>{item.type}</span>
          <span className={`badge badge-${item.status?.toLowerCase()}`}>{item.status}</span>
        </div>
      </div>
      <div className="item-card__body">
        <p className="item-card__category">{item.category}</p>
        <h3 className="item-card__title">{item.title}</h3>
        {item.description && (
          <p className="item-card__desc">{item.description}</p>
        )}
        <div className="item-card__meta">
          {item.location && (
            <span className="item-card__meta-item">
              <FiMapPin size={12} /> {item.location}
            </span>
          )}
          <span className="item-card__meta-item">
            <FiClock size={12} /> {timeAgo}
          </span>
        </div>
        <div className="item-card__footer">
          <span className="item-card__user">
            <FiUser size={12} /> {item.reportedBy?.username}
          </span>
        </div>
      </div>
    </Link>
  );
}
