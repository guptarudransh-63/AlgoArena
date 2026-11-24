import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, X, Edit2, ShieldAlert, Activity, Search } from 'lucide-react';
import { adminApi } from '../../lib/api';
import DifficultyBadge from '../../components/ui/DifficultyBadge';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Spinner from '../../components/ui/Spinner';

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchAdminProblems = async (page = 1) => {
    try {
      setLoading(true);
      setActionError('');
      const res = await adminApi.createProblem ? await adminApi.getExecutionHealth().catch(() => {}) : null; // warmup
      const problemsRes = await (await import('../../lib/axios')).default.get('/admin/problems', {
        params: { page, limit: 15, search: search || undefined }
      });
      setProblems(problemsRes.data.data.problems);
      setPagination(problemsRes.data.data.pagination);
    } catch (err) {
      console.error('Failed to load admin problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdminProblems(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleTogglePublish = async (problemId) => {
    setActionError('');
    try {
      await adminApi.publishProblem(problemId);
      fetchAdminProblems(pagination.page);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update publication status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Problem Administration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Author problems, manage public & private test cases, and publish to the live platform.
          </p>
        </div>
        <Link to="/admin/problems/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" />
            Create Problem
          </Button>
        </Link>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Filter by title, slug or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" text="Loading administration records..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Problem</th>
                  <th className="py-3.5 px-4 w-28">Difficulty</th>
                  <th className="py-3.5 px-4 w-36 text-center">Test Cases</th>
                  <th className="py-3.5 px-4 w-28 text-center">Status</th>
                  <th className="py-3.5 px-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {problems.map((prob) => {
                  const stats = prob.testStats || { totalTests: 0, publicTests: 0, privateTests: 0 };
                  return (
                    <tr key={prob._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-900 block">{prob.title}</span>
                        <span className="text-xs text-slate-400 font-mono">/{prob.slug}</span>
                      </td>
                      <td className="py-4 px-4">
                        <DifficultyBadge difficulty={prob.difficulty} />
                      </td>
                      <td className="py-4 px-4 text-center text-xs">
                        <div className="inline-flex items-center gap-1.5 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
                            {stats.publicTests} pub
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                            {stats.privateTests} priv
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                            prob.isPublished
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {prob.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleTogglePublish(prob._id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                            prob.isPublished
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {prob.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link
                          to={`/admin/problems/${prob._id}/edit`}
                          className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div className="border-t border-slate-100 px-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(p) => fetchAdminProblems(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
