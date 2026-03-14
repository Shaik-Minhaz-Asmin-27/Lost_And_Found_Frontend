import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiCreditCard, FiEye, FiEyeOff } from 'react-icons/fi';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({
    username: '', email: '', password: '', confirmPassword: '',
    fullName: '', phoneNumber: '', studentId: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState({});

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    setErrors(er => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim() || form.username.length < 3) e.username = 'Username must be at least 3 characters';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)     e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      toast.success('Account created! Welcome aboard.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg" />
      <div className="auth-card auth-card--wide fade-up">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">◈ CampusFind</Link>
          <h1 className="auth-card__title">Create your account</h1>
          <p className="auth-card__sub">Join your campus community</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__grid">

            {/* Username */}
            <div className="auth-form__group">
              <label className="auth-form__label"><FiUser size={13} /> Username *</label>
              <input
                className={`auth-form__input ${errors.username ? 'error' : ''}`}
                type="text"
                value={form.username}
                onChange={handleChange('username')}
                placeholder="john_doe"
                autoComplete="username"
              />
              {errors.username && <span className="auth-form__error">{errors.username}</span>}
            </div>

            {/* Full Name */}
            <div className="auth-form__group">
              <label className="auth-form__label"><FiUser size={13} /> Full Name</label>
              <input
                className="auth-form__input"
                type="text"
                value={form.fullName}
                onChange={handleChange('fullName')}
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="auth-form__group">
              <label className="auth-form__label"><FiMail size={13} /> Email *</label>
              <input
                className={`auth-form__input ${errors.email ? 'error' : ''}`}
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="john@campus.edu"
                autoComplete="email"
              />
              {errors.email && <span className="auth-form__error">{errors.email}</span>}
            </div>

            {/* Phone */}
            <div className="auth-form__group">
              <label className="auth-form__label"><FiPhone size={13} /> Phone</label>
              <input
                className="auth-form__input"
                type="text"
                value={form.phoneNumber}
                onChange={handleChange('phoneNumber')}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </div>

            {/* Student ID */}
            <div className="auth-form__group">
              <label className="auth-form__label"><FiCreditCard size={13} /> Student ID</label>
              <input
                className="auth-form__input"
                type="text"
                value={form.studentId}
                onChange={handleChange('studentId')}
                placeholder="S2024001"
              />
            </div>

          </div>

          <div className="auth-form__grid auth-form__grid--2">

            {/* Password */}
            <div className="auth-form__group">
              <label className="auth-form__label"><FiLock size={13} /> Password *</label>
              <div className="auth-form__pw-wrap">
                <input
                  className={`auth-form__input ${errors.password ? 'error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                />
                <button type="button" className="auth-form__pw-toggle" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                  {showPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                </button>
              </div>
              {errors.password && <span className="auth-form__error">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="auth-form__group">
              <label className="auth-form__label"><FiLock size={13} /> Confirm Password *</label>
              <div className="auth-form__pw-wrap">
                <input
                  className={`auth-form__input ${errors.confirmPassword ? 'error' : ''}`}
                  type={showPw ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirmPassword && <span className="auth-form__error">{errors.confirmPassword}</span>}
            </div>

          </div>

          <button type="submit" className="auth-form__submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-card__switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-card__switch-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
