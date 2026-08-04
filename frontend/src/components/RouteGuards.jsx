import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // If no auth token is found, redirect user to the login screen
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Render sub-route components
  return <Outlet />;
};

export const AdminRoute = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Check auth
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Restrict to admins only. Redirect normal users to standard dashboard
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};
