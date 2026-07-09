import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getReviewQueueReports, updateReportReview } from '../../api/reportApi';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme';
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  MessageSquareText,
  Printer,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle
} from 'lucide-react';

const statusConfig = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  under_review: { label: 'Under Review', color: '#3b82f6', bg: '#dbeafe' },
  approved: { label: 'Approved', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: 'Rejected', color: '#dc2626', bg: '#fee2e2' },
  needs_revision: { label: 'Needs Revision', color: '#8b5cf6', bg: '#ede9fe' }
};

const priorityConfig = {
  low: { label: 'Low', color: '#16a34a', bg: '#dcfce7' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7' },
  high: { label: 'High', color: '#dc2626', bg: '#fee2e2' }
};

function StatusBadge({ value }) {
  const config = statusConfig[value] || statusConfig.pending;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, color: config.color, background: config.bg }}>
      {config.label}
    </span>
  );
}

function PriorityBadge({ value }) {
  const config = priorityConfig[value] || priorityConfig.medium;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.65rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 700, color: config.color, background: config.bg }}>
      {config.label}
    </span>
  );
}

function MetricCard({ label, value, icon, accent, dark }) {
  return (
    <div style={{ borderRadius: '18px', padding: '1rem', background: dark ? '#111827' : 'rgba(255,255,255,0.7)', border: `1px solid ${dark ? '#334155' : 'rgba(148,163,184,0.18)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
        <span style={{ fontSize: '0.9rem', color: dark ? '#cbd5e1' : '#64748b' }}>{label}</span>
        <span style={{ color: accent, display: 'inline-flex' }}>{icon}</span>
      </div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: dark ? '#f8fafc' : '#0f172a' }}>{value}</div>
    </div>
  );
}

export default function ReportReviews() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const { dark, toggle } = useTheme();
  const theme = getTheme(dark);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [feedbackForClient, setFeedbackForClient] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    const loadReports = async () => {
      try {
        const { data } = await getReviewQueueReports();
        setReports(data || []);
      } catch (error) {
        console.error(error);
        setActionMessage('Unable to load review queue.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  useEffect(() => {
    if (!id) {
      setSelectedReport(null);
      return;
    }

    const report = reports.find((item) => item._id === id);
    if (report) {
      setSelectedReport(report);
      setReviewNotes(report.reviewNotes || '');
      setInternalNotes(report.internalNotes || '');
      setFeedbackForClient(report.feedbackForClient || '');
    }
  }, [id, reports]);

  const filteredReports = useMemo(() => {
    const term = search.toLowerCase();
    const filtered = reports.filter((item) => {
      const matchesText = !term || [item.reportId, item.userId?.name, item.title, item.projectId?.name].filter(Boolean).join(' ').toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || (item.reviewStatus || 'pending') === statusFilter;
      const createdAt = new Date(item.createdAt);
      const matchesStart = !startDate || createdAt >= new Date(startDate);
      const matchesEnd = !endDate || createdAt <= new Date(endDate);
      return matchesText && matchesStatus && matchesStart && matchesEnd;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sorted;
  }, [reports, search, statusFilter, startDate, endDate, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));
  const pagedReports = filteredReports.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, startDate, endDate, sortBy]);

  const handleSaveNotes = async () => {
    if (!selectedReport) return;
    setSubmitting(true);
    try {
      const { data } = await updateReportReview(selectedReport._id, {
        reviewNotes,
        internalNotes,
        feedbackForClient
      });
      setSelectedReport(data);
      setReports((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setActionMessage('Review notes saved successfully.');
    } catch (error) {
      setActionMessage('Unable to save review notes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewAction = async (nextStatus, label) => {
    if (!selectedReport) return;
    if (!window.confirm(`Mark this report as ${label}?`)) return;
    setSubmitting(true);
    try {
      const { data } = await updateReportReview(selectedReport._id, {
        reviewStatus: nextStatus,
        reviewNotes,
        internalNotes,
        feedbackForClient
      });
      setSelectedReport(data);
      setReports((prev) => prev.map((item) => (item._id === data._id ? data : item)));
      setActionMessage(`Report marked as ${label}.`);
    } catch (error) {
      setActionMessage('Unable to update this report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!selectedReport) return;
    const content = [
      `Report: ${selectedReport.title}`,
      `Client: ${selectedReport.userId?.name || 'Unknown'}`,
      `Submitted: ${new Date(selectedReport.createdAt).toLocaleString()}`,
      `Status: ${selectedReport.reviewStatus || 'pending'}`,
      '',
      `Tasks completed:\n${selectedReport.tasksCompleted || 'N/A'}`,
      `Tasks planned:\n${selectedReport.tasksPlanned || 'N/A'}`,
      `Blockers:\n${selectedReport.blockers || 'N/A'}`,
      `Notes:\n${selectedReport.notes || 'N/A'}`
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedReport.reportId || 'report'}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handlePrint = () => window.print();

  return (
    <div style={{ minHeight: '100vh', background: theme.background, color: theme.text }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.7rem', borderRadius: '999px', background: theme.primarySoft, color: theme.primary, fontSize: '0.8rem', fontWeight: 700 }}>
              <ShieldCheck size={15} />
              Review Console
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.7rem' }}>Report Reviews</h1>
            <p style={{ color: theme.muted, marginTop: '0.35rem', maxWidth: '690px' }}>Review all submitted reports in one place, add feedback, and move them through the approval workflow.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', flexWrap: 'wrap' }}>
            <button className="animated-button" onClick={toggle} style={{ border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, background: dark ? '#0f172a' : '#ffffff', color: dark ? '#f8fafc' : '#0f172a', borderRadius: '999px', padding: '0.65rem 0.95rem', cursor: 'pointer', fontWeight: 700 }}>
              {dark ? '☀️ Light' : '🌙 Dark'}
            </button>
            <Link className="animated-link" to="/dashboard" style={{ border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, background: dark ? '#111827' : '#ffffff', color: dark ? '#f8fafc' : '#0f172a', borderRadius: '999px', padding: '0.65rem 0.95rem', fontWeight: 700 }}>Dashboard</Link>
            <button className="animated-button" onClick={logout} style={{ border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', borderRadius: '999px', padding: '0.65rem 0.95rem', cursor: 'pointer', fontWeight: 700 }}>Logout</button>
          </div>
        </div>

        {actionMessage ? (
          <div style={{ marginBottom: '1rem', borderRadius: '14px', padding: '0.8rem 1rem', background: theme.primarySoft, color: theme.primary, border: `1px solid ${theme.border}` }}>{actionMessage}</div>
        ) : null}

        {!id ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.2rem' }}>
              <MetricCard label="Total Reports" value={reports.length} icon={<FileText size={18} />} accent={theme.primary} dark={dark} />
              <MetricCard label="Pending Review" value={reports.filter((item) => (item.reviewStatus || 'pending') === 'pending').length} icon={<Clock3 size={18} />} accent="#f59e0b" dark={dark} />
              <MetricCard label="Under Review" value={reports.filter((item) => item.reviewStatus === 'under_review').length} icon={<AlertTriangle size={18} />} accent="#3b82f6" dark={dark} />
              <MetricCard label="Approved / Rejected" value={reports.filter((item) => ['approved', 'rejected'].includes(item.reviewStatus)).length} icon={<CheckCircle2 size={18} />} accent="#16a34a" dark={dark} />
            </div>

            <div style={{ borderRadius: '24px', padding: '1.2rem', background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 700 }}>Search</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', borderRadius: '12px', padding: '0.7rem 0.8rem', border: `1px solid ${theme.border}`, background: dark ? '#111827' : '#f8fafc' }}>
                    <Search size={16} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Client, title, or report ID" style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: theme.text }} />
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 700 }}>Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', borderRadius: '12px', padding: '0.7rem 0.8rem', border: `1px solid ${theme.border}`, background: dark ? '#111827' : '#f8fafc' }}>
                    <Filter size={16} />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        background: dark ? '#111827' : '#ffffff',
                        color: theme.text,
                        padding: '0.1rem 0',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      <option value="all">All</option>
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="needs_revision">Needs Revision</option>
                    </select>
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 700 }}>From Date</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', borderRadius: '12px', padding: '0.7rem 0.8rem', border: `1px solid ${theme.border}`, background: dark ? '#111827' : '#f8fafc' }}>
                    <CalendarRange size={16} />
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: theme.text }} />
                  </div>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 700 }}>To Date</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', borderRadius: '12px', padding: '0.7rem 0.8rem', border: `1px solid ${theme.border}`, background: dark ? '#111827' : '#f8fafc' }}>
                    <CalendarRange size={16} />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', color: theme.text }} />
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ color: theme.muted, fontSize: '0.9rem' }}>{filteredReports.length} reports match the current filters.</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ border: `1px solid ${theme.border}`, borderRadius: '12px', padding: '0.65rem 0.8rem', background: dark ? '#111827' : '#fff', color: theme.text }}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>

              {loading ? (
                <div style={{ padding: '1rem 0', color: theme.muted }}>Loading review queue…</div>
              ) : pagedReports.length ? (
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: theme.muted, fontSize: '0.85rem' }}>
                        <th style={{ padding: '0.8rem 0.6rem' }}>Report ID</th>
                        <th style={{ padding: '0.8rem 0.6rem' }}>Client</th>
                        <th style={{ padding: '0.8rem 0.6rem' }}>Employee</th>
                        <th style={{ padding: '0.8rem 0.6rem' }}>Title</th>
                        <th style={{ padding: '0.8rem 0.6rem' }}>Date</th>
                        <th style={{ padding: '0.8rem 0.6rem' }}>Status</th>
                        <th style={{ padding: '0.8rem 0.6rem' }}>Priority</th>
                        <th style={{ padding: '0.8rem 0.6rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedReports.map((item) => (
                        <tr key={item._id} style={{ borderTop: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '0.85rem 0.6rem', fontWeight: 700 }}>{item.reportId || item._id.slice(-6).toUpperCase()}</td>
                          <td style={{ padding: '0.85rem 0.6rem' }}>{item.userId?.name || 'Unknown client'}</td>
                          <td style={{ padding: '0.85rem 0.6rem' }}>{item.employeeName || '—'}</td>
                          <td style={{ padding: '0.85rem 0.6rem' }}>{item.title || 'Untitled report'}</td>
                          <td style={{ padding: '0.85rem 0.6rem' }}>{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '0.85rem 0.6rem' }}><StatusBadge value={item.reviewStatus || 'pending'} /></td>
                          <td style={{ padding: '0.85rem 0.6rem' }}><PriorityBadge value={item.priority || 'medium'} /></td>
                          <td style={{ padding: '0.85rem 0.6rem' }}>
                            <button onClick={() => navigate(`/report-reviews/${item._id}`)} style={{ border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', borderRadius: '10px', padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '1.25rem', textAlign: 'center', color: theme.muted }}>No reports match this view yet.</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ color: theme.muted, fontSize: '0.9rem' }}>Page {page} of {totalPages}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, background: dark ? '#111827' : '#ffffff', color: dark ? '#f8fafc' : '#0f172a', padding: '0.55rem 0.8rem', borderRadius: '999px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.7 : 1, fontWeight: 700 }}>Previous</button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, background: dark ? '#111827' : '#ffffff', color: dark ? '#f8fafc' : '#0f172a', padding: '0.55rem 0.8rem', borderRadius: '999px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.7 : 1, fontWeight: 700 }}>Next</button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <Link to="/report-reviews" style={{ color: theme.primary, fontWeight: 700 }}>← Back to review queue</Link>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.45rem' }}>{selectedReport?.title || 'Report review'}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleReviewAction('approved', 'approved')} disabled={submitting} style={{ border: 'none', background: '#16a34a', color: '#fff', padding: '0.65rem 0.9rem', borderRadius: '999px', cursor: 'pointer' }}>Approve</button>
                <button onClick={() => handleReviewAction('rejected', 'rejected')} disabled={submitting} style={{ border: 'none', background: '#dc2626', color: '#fff', padding: '0.65rem 0.9rem', borderRadius: '999px', cursor: 'pointer' }}>Reject</button>
                <button onClick={() => handleReviewAction('needs_revision', 'needs revision')} disabled={submitting} style={{ border: 'none', background: '#8b5cf6', color: '#fff', padding: '0.65rem 0.9rem', borderRadius: '999px', cursor: 'pointer' }}>Request Changes</button>
              </div>
            </div>

            <div style={{ position: 'sticky', top: '12px', zIndex: 10, display: 'flex', gap: '0.7rem', flexWrap: 'wrap', borderRadius: '16px', padding: '0.9rem', background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
              <button onClick={() => handleReviewAction('under_review', 'under review')} disabled={submitting} style={{ border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, background: dark ? '#111827' : '#ffffff', color: dark ? '#f8fafc' : '#0f172a', padding: '0.6rem 0.9rem', borderRadius: '999px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}><MessageSquareText size={15} /> Start Review</button>
              <button onClick={handleDownload} style={{ border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, background: dark ? '#111827' : '#ffffff', color: dark ? '#f8fafc' : '#0f172a', padding: '0.6rem 0.9rem', borderRadius: '999px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}><Download size={15} /> Download</button>
              <button onClick={handlePrint} style={{ border: `1px solid ${dark ? '#475569' : '#cbd5e1'}`, background: dark ? '#111827' : '#ffffff', color: dark ? '#f8fafc' : '#0f172a', padding: '0.6rem 0.9rem', borderRadius: '999px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}><Printer size={15} /> Print</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.8fr', gap: '1rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ borderRadius: '24px', padding: '1.1rem', background: `linear-gradient(135deg, ${theme.primarySoft}, ${theme.surface})`, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.45rem', color: theme.primary, fontWeight: 700 }}><Sparkles size={16} /> Executive summary</div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedReport?.title || 'Untitled report'}</h3>
                      <p style={{ color: theme.muted, marginTop: '0.35rem' }}>{selectedReport?.notes || 'No report summary provided.'}</p>
                    </div>
                    <StatusBadge value={selectedReport?.reviewStatus || 'pending'} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
                  <div style={{ borderRadius: '16px', padding: '0.9rem', background: theme.surface, border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.muted, fontSize: '0.82rem' }}>Client</div>
                    <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{selectedReport?.userId?.name || 'Unknown client'}</div>
                  </div>
                  <div style={{ borderRadius: '16px', padding: '0.9rem', background: theme.surface, border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.muted, fontSize: '0.82rem' }}>Submitted by</div>
                    <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{selectedReport?.employeeName || '—'}</div>
                  </div>
                  <div style={{ borderRadius: '16px', padding: '0.9rem', background: theme.surface, border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.muted, fontSize: '0.82rem' }}>Submission date</div>
                    <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>{selectedReport ? new Date(selectedReport.createdAt).toLocaleString() : '—'}</div>
                  </div>
                  <div style={{ borderRadius: '16px', padding: '0.9rem', background: theme.surface, border: `1px solid ${theme.border}` }}>
                    <div style={{ color: theme.muted, fontSize: '0.82rem' }}>Priority</div>
                    <div style={{ marginTop: '0.35rem' }}><PriorityBadge value={selectedReport?.priority || 'medium'} /></div>
                  </div>
                </div>

                <div style={{ borderRadius: '24px', padding: '1rem', background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.8rem' }}>Report content</h3>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    <div style={{ borderRadius: '16px', padding: '0.9rem', background: dark ? '#111827' : '#f8fafc' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Tasks completed</div>
                      <div style={{ color: theme.muted, whiteSpace: 'pre-wrap' }}>{selectedReport?.tasksCompleted || 'No tasks captured.'}</div>
                    </div>
                    <div style={{ borderRadius: '16px', padding: '0.9rem', background: dark ? '#111827' : '#f8fafc' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Tasks planned</div>
                      <div style={{ color: theme.muted, whiteSpace: 'pre-wrap' }}>{selectedReport?.tasksPlanned || 'No tasks planned.'}</div>
                    </div>
                    <div style={{ borderRadius: '16px', padding: '0.9rem', background: dark ? '#111827' : '#f8fafc' }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Blockers</div>
                      <div style={{ color: theme.muted, whiteSpace: 'pre-wrap' }}>{selectedReport?.blockers || 'None reported.'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ borderRadius: '24px', padding: '1rem', background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.75rem' }}>Review notes</h3>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.7rem' }}>
                    <span style={{ color: theme.muted, fontSize: '0.9rem' }}>Review Notes</span>
                    <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} rows={4} style={{ borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '0.7rem', background: dark ? '#111827' : '#fff', color: theme.text }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.7rem' }}>
                    <span style={{ color: theme.muted, fontSize: '0.9rem' }}>Internal Notes</span>
                    <textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={4} style={{ borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '0.7rem', background: dark ? '#111827' : '#fff', color: theme.text }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <span style={{ color: theme.muted, fontSize: '0.9rem' }}>Feedback for Client</span>
                    <textarea value={feedbackForClient} onChange={(e) => setFeedbackForClient(e.target.value)} rows={4} style={{ borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '0.7rem', background: dark ? '#111827' : '#fff', color: theme.text }} />
                  </label>
                  <button onClick={handleSaveNotes} disabled={submitting} style={{ marginTop: '0.8rem', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', padding: '0.65rem 0.9rem', borderRadius: '999px', cursor: 'pointer', fontWeight: 700 }}>Save notes</button>
                </div>

                <div style={{ borderRadius: '24px', padding: '1rem', background: theme.surface, border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: 800, marginBottom: '0.75rem' }}>Status timeline</h3>
                  <div style={{ display: 'grid', gap: '0.8rem' }}>
                    {(selectedReport?.timeline || []).length ? selectedReport.timeline.map((item, index) => (
                      <div key={index} style={{ borderRadius: '14px', padding: '0.8rem', background: dark ? '#111827' : '#f8fafc' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
                          <div style={{ fontWeight: 700 }}>{item.title}</div>
                          <div style={{ color: theme.muted, fontSize: '0.8rem' }}>{new Date(item.createdAt).toLocaleString()}</div>
                        </div>
                        <div style={{ color: theme.muted, marginTop: '0.25rem', fontSize: '0.9rem' }}>{item.detail}</div>
                        <div style={{ color: theme.muted, marginTop: '0.25rem', fontSize: '0.8rem' }}>By {item.actor || user?.name || 'Manager'}</div>
                      </div>
                    )) : (
                      <div style={{ color: theme.muted }}>Timeline will appear here as actions are recorded.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
