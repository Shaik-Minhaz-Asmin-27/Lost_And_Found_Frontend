import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [form, setForm]       = useState({ usernameOrEmail: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.usernameOrEmail.trim()) e.usernameOrEmail = 'Username or email is required';
    if (!form.password)               e.password        = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <div className="auth-card fade-up">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">◈ CampusFind</Link>
          <h1 className="auth-card__title">Welcome back</h1>
          <p className="auth-card__sub">Sign in to your account to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__group">
            <label className="auth-form__label">
              <FiMail size={13} /> Username or Email
            </label>
            <input
              className={`auth-form__input ${errors.usernameOrEmail ? 'error' : ''}`}
              type="text"
              value={form.usernameOrEmail}
              onChange={set('usernameOrEmail')}
              placeholder="john_doe or john@campus.edu"
              autoComplete="username"
            />
            {errors.usernameOrEmail && <span className="auth-form__error">{errors.usernameOrEmail}</span>}
          </div>

          <div className="auth-form__group">
            <label className="auth-form__label">
              <FiLock size={13} /> Password
            </label>
            <div className="auth-form__pw-wrap">
              <input
                className={`auth-form__input ${errors.password ? 'error' : ''}`}
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-form__pw-toggle"
                onClick={() => setShowPw(s => !s)}
                tabIndex={-1}
              >
                {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            {errors.password && <span className="auth-form__error">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-card__switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-card__switch-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
