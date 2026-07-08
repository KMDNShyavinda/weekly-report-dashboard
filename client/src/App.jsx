import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login       from './pages/auth/Login';
import Register    from './pages/auth/Register';
import MyReports   from './pages/member/MyReports';
import ReportForm  from './pages/member/ReportForm';
import DashboardV2 from './pages/manager/DashboardV2';
import TeamReports from './pages/manager/TeamReports';
import Projects    from './pages/manager/Projects';
import ReportReviews from './pages/manager/ReportReviews';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute    from './routes/RoleRoute';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
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

        {/* Manager/admin routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute roles={['manager', 'admin']} />}>
            <Route path="/dashboard"              element={<DashboardV2 />} />
            <Route path="/team-reports"           element={<TeamReports />} />
            <Route path="/projects"               element={<Projects />} />
          </Route>
          <Route element={<RoleRoute role="admin" />}>
            <Route path="/admin/report-reviews"   element={<ReportReviews />} />
            <Route path="/admin/report-reviews/:id" element={<ReportReviews />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}
