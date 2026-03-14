import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ItemsPage from './pages/ItemsPage';
import ItemDetailPage from './pages/ItemDetailPage';
import ReportItemPage from './pages/ReportItemPage';
import MyItemsPage from './pages/MyItemsPage';
import EditItemPage from './pages/EditItemPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loader"><span className="spinner" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/"            element={<HomePage />} />
          <Route path="/login"       element={<LoginPage />} />
          <Route path="/register"    element={<RegisterPage />} />
          <Route path="/items"       element={<ItemsPage />} />
          <Route path="/items/:id"   element={<ItemDetailPage />} />
          <Route path="/report"      element={<ProtectedRoute><ReportItemPage /></ProtectedRoute>} />
          <Route path="/my-items"    element={<ProtectedRoute><MyItemsPage /></ProtectedRoute>} />
          <Route path="/items/:id/edit" element={<ProtectedRoute><EditItemPage /></ProtectedRoute>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a2235',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#1a2235' } },
          error:   { iconTheme: { primary: '#f97316', secondary: '#1a2235' } },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
