import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login       from './pages/auth/Login';
import Register    from './pages/auth/Register';
import MyReports   from './pages/member/MyReports';
import ReportForm  from './pages/member/ReportForm';
import Dashboard   from './pages/manager/Dashboard';
import TeamReports from './pages/manager/TeamReports';
import Projects    from './pages/manager/Projects';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute    from './routes/RoleRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Member routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/my-reports"       element={<MyReports />} />
          <Route path="/reports/new"      element={<ReportForm />} />
          <Route path="/reports/edit/:id" element={<ReportForm />} />
        </Route>

        {/* Manager routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute role="manager" />}>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/team-reports" element={<TeamReports />} />
            <Route path="/projects"     element={<Projects />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
