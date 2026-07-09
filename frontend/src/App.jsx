import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MyReports from './pages/member/MyReports';
import ReportForm from './pages/member/ReportForm';
import DashboardV2 from './pages/manager/DashboardV2';
import Projects from './pages/manager/Projects';
import ReportReviews from './pages/manager/ReportReviews';
import Assistant from './pages/manager/Assistant';
import PrivateRoute from './routes/PrivateRoute';
import RoleRoute from './routes/RoleRoute';
import Layout from './components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Member routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/reports/new" element={<ReportForm />} />
          <Route path="/reports/edit/:id" element={<ReportForm />} />
        </Route>

        {/* Manager routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute roles={['manager']} />}>
            <Route path="/dashboard" element={<DashboardV2 />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/report-reviews" element={<ReportReviews />} />
            <Route path="/report-reviews/:id" element={<ReportReviews />} />
            <Route path="/assistant" element={<Assistant />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Layout>
    </BrowserRouter>
  );
}
