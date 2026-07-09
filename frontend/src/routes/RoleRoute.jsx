import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ role, roles }) {
  const { user } = useAuth();
  const requiredRoles = roles || [role].filter(Boolean);
  const isAllowed = requiredRoles.includes(user?.role);
  return isAllowed ? <Outlet /> : <Navigate to="/my-reports" replace />;
}
