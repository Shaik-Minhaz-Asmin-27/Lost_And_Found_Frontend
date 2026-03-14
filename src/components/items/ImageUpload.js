import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiX, FiLoader } from 'react-icons/fi';
import './ImageUpload.css';

const MAX_SIZE_MB    = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUpload({ value, onChange }) {
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState('');
  const inputRef                  = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); return; }
    if (file.size > MAX_SIZE_BYTES) { setError(`Image must be smaller than ${MAX_SIZE_MB} MB.`); return; }

    setError('');
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const res  = await fetch('/api/upload/image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
      } else {
        setError(data.message || 'Upload failed. Please try again.');
      }
    } catch {
      setError('Upload failed. Check your connection.');
    } finally {
      setUploading(false);
    }
  };

  const handleFile   = (e) => upload(e.target.files[0]);
  const handleDrop   = (e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files[0]); };
  const handleRemove = () => { onChange(''); if (inputRef.current) inputRef.current.value = ''; setError(''); };

  if (value) {
    return (
      <div className="img-upload img-upload--preview">
        <img src={value} alt="Item" className="img-upload__preview" />
        <button type="button" className="img-upload__remove" onClick={handleRemove} title="Remove image">
          <FiX size={16} />
        </button>
        <span className="img-upload__preview-label">Click × to remove / change</span>
      </div>
    );
  }

  return (
    <div
      className={`img-upload ${dragging ? 'img-upload--drag' : ''} ${uploading ? 'img-upload--loading' : ''}`}
      onClick={() => !uploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {uploading ? (
        <div className="img-upload__inner">
          <FiLoader size={28} className="img-upload__spinner" />
          <p className="img-upload__text">Uploading…</p>
        </div>
      ) : (
        <div className="img-upload__inner">
          <FiUploadCloud size={32} className="img-upload__icon" />
          <p className="img-upload__text"><strong>Click to upload</strong> or drag &amp; drop</p>
          <p className="img-upload__hint">JPG, PNG, WEBP — max {MAX_SIZE_MB} MB</p>
          {error && <p className="img-upload__error">{error}</p>}
        </div>
      )}
    </div>
  );
}