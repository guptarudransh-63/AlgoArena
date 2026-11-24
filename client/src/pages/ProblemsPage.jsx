import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, CheckCircle2, Circle, Clock, ArrowUpDown, ChevronRight } from 'lucide-react';
import { problemsApi } from '../lib/api';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tag, setTag] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const topicTags = [
    'Arrays',
    'Strings',
    'Hashing',
    'Dynamic Programming',
    'Binary Search',
    'Two Pointers',
    'Sliding Window',
    'Stacks',
    'Mathematics'
  ];

  const fetchProblems = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        difficulty: difficulty || undefined,
        tag: tag || undefined,
        status: status || undefined,
        sortBy,
        sortOrder
      };
      const res = await problemsApi.getAll(params);
      setProblems(res.data.data.problems);
      setPagination(res.data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProblems(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, difficulty, tag, status, sortBy, sortOrder]);

  const handlePageChange = (newPage) => {
    fetchProblems(newPage);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Problem Explorer</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select a problem to write solutions in our Monaco-powered online code workspace.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problems by title or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Difficulty filter */}
          <div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 transition-colors"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="solved">Solved</option>
              <option value="attempted">Attempted</option>
              <option value="unsolved">Unsolved</option>
            </select>
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">Tags:</span>
          <button
            onClick={() => setTag('')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              tag === ''
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All
          </button>
          {topicTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? '' : t)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                tag === t
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex justify-center">
            <Spinner size="lg" text="Loading problems..." />
          </div>
        ) : problems.length === 0 ? (
          <EmptyState
            title="No problems found"
            description="No programming problems matched your current search filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setDifficulty('');
              setTag('');
              setStatus('');
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">Status</th>
                  <th className="py-3.5 px-4">Title</th>
                  <th className="py-3.5 px-4 w-28">Difficulty</th>
                  <th className="py-3.5 px-4 w-28 text-right">Acceptance</th>
                  <th className="py-3.5 px-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {problems.map((prob) => {
                  let statusIcon = <Circle className="w-4 h-4 text-slate-300" />;
                  if (prob.userStatus === 'solved') {
                    statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                  } else if (prob.userStatus === 'attempted') {
                    statusIcon = <Clock className="w-4 h-4 text-amber-500" />;
                  }

                  return (
                    <tr
                      key={prob._id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-4 text-center">{statusIcon}</td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/problems/${prob.slug}`}
                          className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors block"
                        >
                          {prob.title}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-1">
                          {prob.tags?.map((t) => (
                            <span
                              key={t}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <DifficultyBadge difficulty={prob.difficulty} />
                      </td>
                      <td className="py-4 px-4 text-right font-mono text-xs text-slate-600">
                        {prob.acceptanceRate ? `${prob.acceptanceRate}%` : '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link to={`/problems/${prob.slug}`}>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && problems.length > 0 && (
          <div className="border-t border-slate-100 px-4">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
