import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Search, Code2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { submissionsApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import VerdictBadge from '../components/ui/VerdictBadge';
import Pagination from '../components/ui/Pagination';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export default function SubmissionsPage() {
  const { user } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [verdict, setVerdict] = useState('');
  const [language, setLanguage] = useState('');
  const [mineOnly, setMineOnly] = useState(true);

  // Selected submission modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchSubmissions = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        verdict: verdict || undefined,
        language: language || undefined,
        mine: mineOnly ? true : undefined
      };
      const res = await submissionsApi.getAll(params);
      setSubmissions(res.data.data.submissions);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(1);
  }, [verdict, language, mineOnly]);

  const handleOpenDetail = async (subId) => {
    try {
      setModalLoading(true);
      const res = await submissionsApi.getById(subId);
      setSelectedSub(res.data.data.submission);
    } catch (err) {
      console.error('Failed to get submission detail:', err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submission History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review your past code submissions, evaluate execution performance, and analyze verdicts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Verdict Filter */}
          <select
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">All Verdicts</option>
            <option value="Accepted">Accepted</option>
            <option value="Wrong Answer">Wrong Answer</option>
            <option value="Time Limit Exceeded">Time Limit Exceeded</option>
            <option value="Memory Limit Exceeded">Memory Limit Exceeded</option>
            <option value="Compilation Error">Compilation Error</option>
            <option value="Runtime Error">Runtime Error</option>
          </select>

          {/* Language Filter */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">All Languages</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
        </div>

        {/* Mine only toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-medium">
            <input
              type="checkbox"
              checked={mineOnly}
              onChange={(e) => setMineOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            My Submissions Only
          </label>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" text="Loading submissions..." />
          </div>
        ) : submissions.length === 0 ? (
          <EmptyState
            icon={History}
            title="No submissions found"
            description="No submissions matching your selected filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Problem</th>
                  <th className="py-3.5 px-4 w-32">Verdict</th>
                  <th className="py-3.5 px-4 w-28">Language</th>
                  <th className="py-3.5 px-4 w-24 text-right">Runtime</th>
                  <th className="py-3.5 px-4 w-28 text-right">Memory</th>
                  <th className="py-3.5 px-4 w-40 text-right">Submitted</th>
                  <th className="py-3.5 px-4 w-24 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <Link
                        to={`/problems/${sub.problemId?.slug || ''}`}
                        className="hover:text-indigo-600 transition-colors"
                      >
                        {sub.problemId?.title || 'Unknown Problem'}
                      </Link>
                      {!mineOnly && sub.userId && (
                        <span className="block text-xs text-slate-400">
                          by {sub.userId.displayName || sub.userId.username}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <VerdictBadge verdict={sub.verdict} />
                    </td>
                    <td className="py-3.5 px-4 capitalize font-mono text-xs text-slate-600">
                      {sub.language}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                      {sub.runtime !== undefined ? `${sub.runtime} ms` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600">
                      {sub.memory !== undefined ? `${Math.round(sub.memory)} KB` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(sub._id)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && submissions.length > 0 && (
          <div className="border-t border-slate-100 px-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => fetchSubmissions(p)}
            />
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      <Modal
        isOpen={Boolean(selectedSub)}
        onClose={() => setSelectedSub(null)}
        title={`Submission Details`}
        maxWidth="max-w-3xl"
      >
        {selectedSub && (
          <div className="space-y-5">
            {/* Summary metrics header */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Verdict:</span>
                <VerdictBadge verdict={selectedSub.verdict} className="text-sm mt-0.5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Language:</span>
                <span className="font-semibold text-sm text-slate-800 capitalize">
                  {selectedSub.language}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Runtime:</span>
                <span className="font-mono text-sm text-slate-800">
                  {selectedSub.runtime || 0} ms
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Memory:</span>
                <span className="font-mono text-sm text-slate-800">
                  {selectedSub.memory || 0} KB
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Passed:</span>
                <span className="font-semibold text-sm text-slate-800">
                  {selectedSub.testsPassed} / {selectedSub.totalTests}
                </span>
              </div>
            </div>

            {/* Error Message if any */}
            {selectedSub.error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-mono whitespace-pre-wrap">
                {selectedSub.error}
              </div>
            )}

            {/* Source Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Submitted Source Code
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(selectedSub.sourceCode)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Copy Code
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto max-h-80">
                <code>{selectedSub.sourceCode}</code>
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
