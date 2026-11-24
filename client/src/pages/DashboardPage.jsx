import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Flame,
  Zap,
  Target,
  ArrowUpRight,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { userApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/ui/Card';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import VerdictBadge from '../components/ui/VerdictBadge';
import Spinner from '../components/ui/Spinner';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState(null);
  const [activity, setActivity] = useState(null);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const [progRes, actRes, subRes] = await Promise.all([
          userApi.getProgress(),
          userApi.getActivity(),
          userApi.getSubmissions({ limit: 5 })
        ]);
        setProgress(progRes.data.data);
        setActivity(actRes.data.data);
        setRecentSubmissions(subRes.data.data.submissions);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const solved = progress?.solved || { Easy: 0, Medium: 0, Hard: 0, Total: 0 };
  const available = progress?.available || { Easy: 0, Medium: 0, Hard: 0, Total: 0 };

  const pieData = [
    { name: 'Easy', value: solved.Easy || 0, color: '#22c55e' },
    { name: 'Medium', value: solved.Medium || 0, color: '#eab308' },
    { name: 'Hard', value: solved.Hard || 0, color: '#ef4444' }
  ].filter((d) => d.value > 0);

  // If none solved yet, show a subtle placeholder ring
  const displayPieData =
    pieData.length > 0 ? pieData : [{ name: 'Unsolved', value: 1, color: '#e2e8f0' }];

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.displayName || user?.username}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your problem-solving progress and sharpen your algorithmic skills.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            Practice Problems
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Solved Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Solved
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">{solved.Total}</span>
              <span className="text-sm font-medium text-slate-400">/ {available.Total}</span>
            </div>
            <p className="text-xs text-indigo-600 font-medium mt-1">
              {available.Total > 0
                ? `${Math.round((solved.Total / available.Total) * 100)}% completion`
                : 'No problems'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Day Streak
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {activity?.currentStreak || 0}
              </span>
              <span className="text-sm font-medium text-slate-400">days</span>
            </div>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Best: {activity?.longestStreak || 0} days
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Acceptance Rate
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {progress?.acceptanceRate || 0}
              </span>
              <span className="text-lg font-bold text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {progress?.acceptedSubmissions || 0} / {progress?.totalSubmissions || 0} submissions
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Active Days */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Days
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {activity?.totalActiveDays || 0}
              </span>
              <span className="text-sm font-medium text-slate-400">days</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Practiced on platform</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Breakdown & Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Breakdown with Recharts Ring */}
        <Card title="Difficulty Breakdown" subtitle="Solved problems categorized by difficulty">
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={pieData.length > 1 ? 4 : 0}
                    dataKey="value"
                  >
                    {displayPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-800">{solved.Total}</span>
                <span className="text-[11px] font-medium text-slate-400">Solved</span>
              </div>
            </div>

            {/* Difficulty bars */}
            <div className="w-full space-y-3 mt-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600">Easy</span>
                  <span className="text-slate-600">
                    {solved.Easy} / {available.Easy}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${available.Easy ? Math.min(100, (solved.Easy / available.Easy) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-600">Medium</span>
                  <span className="text-slate-600">
                    {solved.Medium} / {available.Medium}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${available.Medium ? Math.min(100, (solved.Medium / available.Medium) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-600">Hard</span>
                  <span className="text-slate-600">
                    {solved.Hard} / {available.Hard}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-rose-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${available.Hard ? Math.min(100, (solved.Hard / available.Hard) * 100) : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Topic-wise Progress */}
        <Card
          className="lg:col-span-2"
          title="Progress by Topic"
          subtitle="Your mastery across algorithm categories"
        >
          {progress?.topicStats && progress.topicStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {progress.topicStats.map((topic) => (
                <div
                  key={topic.tag}
                  className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                    <span>{topic.tag}</span>
                    <span className="text-slate-500">
                      {topic.solved} / {topic.total} ({topic.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 py-8 text-center">No topic data available yet.</p>
          )}
        </Card>
      </div>

      {/* Bottom Grid: Recent Submissions & Recommended Next */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <Card
          title="Recent Submissions"
          subtitle="Your latest evaluation outcomes"
          headerAction={
            <Link
              to="/submissions"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center"
            >
              View all <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          }
        >
          {recentSubmissions && recentSubmissions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentSubmissions.map((sub) => (
                <div
                  key={sub._id}
                  className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col">
                    <Link
                      to={`/problems/${sub.problemId?.slug || ''}`}
                      className="font-semibold text-sm text-slate-800 hover:text-indigo-600 transition-colors"
                    >
                      {sub.problemId?.title || 'Problem'}
                    </Link>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {sub.language} • {new Date(sub.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <VerdictBadge verdict={sub.verdict} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-400">You haven't submitted any solutions yet.</p>
              <Link
                to="/problems"
                className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:underline"
              >
                Solve your first problem →
              </Link>
            </div>
          )}
        </Card>

        {/* Recommended Next Problems */}
        <Card
          title="Recommended Next Problems"
          subtitle="Selected algorithms to expand your skills"
        >
          {progress?.recommended && progress.recommended.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {progress.recommended.map((prob) => (
                <Link
                  key={prob._id}
                  to={`/problems/${prob.slug}`}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/60 -mx-5 px-5 transition-colors first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-slate-800">{prob.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <DifficultyBadge difficulty={prob.difficulty} />
                      <span className="text-xs text-slate-400">
                        {prob.tags?.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-emerald-600 font-semibold">🎉 Outstanding!</p>
              <p className="text-xs text-slate-400 mt-1">
                You've solved all published problems in AlgoArena!
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
