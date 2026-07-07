import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ role }) {
  const { user } = useAuth();
  return user?.role === role ? <Outlet /> : <Navigate to="/my-reports" replace />;
}
