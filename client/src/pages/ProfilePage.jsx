import React, { useState, useEffect } from 'react';
import { User, Award, CheckCircle2, Flame, Calendar, Code, ChevronRight } from 'lucide-react';
import { userApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import Card from '../components/ui/Card';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import Spinner from '../components/ui/Spinner';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [progress, setProgress] = useState(null);
  const [activity, setActivity] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        setLoading(true);
        const [progRes, actRes, solvedRes] = await Promise.all([
          userApi.getProgress(),
          userApi.getActivity(),
          userApi.getSolvedProblems()
        ]);
        setProgress(progRes.data.data);
        setActivity(actRes.data.data);
        setSolvedProblems(solvedRes.data.data.problems);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  const solved = progress?.solved || { Easy: 0, Medium: 0, Hard: 0, Total: 0 };
  const available = progress?.available || { Easy: 0, Medium: 0, Hard: 0, Total: 0 };

  return (
    <div className="space-y-6">
      {/* User Hero Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.username}`}
          alt={user?.displayName || user?.username}
          className="w-24 h-24 rounded-2xl border-2 border-indigo-100 shadow-sm"
        />
        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{user?.displayName || user?.username}</h1>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700">
              {user?.role}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5">@{user?.username} • {user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 mt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Joined {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Current Streak: {activity?.currentStreak || 0} days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Longest Streak: {activity?.longestStreak || 0} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Solved Stats & Topic breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Difficulty Breakdown */}
        <Card title="Solved Statistics" subtitle="Breakdown by problem difficulty">
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800">Easy</span>
                <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">{solved.Easy}</p>
              </div>
              <span className="text-xs text-emerald-600 font-medium">out of {available.Easy}</span>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-800">Medium</span>
                <p className="text-2xl font-extrabold text-amber-900 mt-0.5">{solved.Medium}</p>
              </div>
              <span className="text-xs text-amber-600 font-medium">out of {available.Medium}</span>
            </div>

            <div className="p-4 bg-rose-50/70 rounded-xl border border-rose-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-800">Hard</span>
                <p className="text-2xl font-extrabold text-rose-900 mt-0.5">{solved.Hard}</p>
              </div>
              <span className="text-xs text-rose-600 font-medium">out of {available.Hard}</span>
            </div>
          </div>
        </Card>

        {/* Solved Problems List */}
        <Card
          className="md:col-span-2"
          title={`Solved Problems (${solvedProblems.length})`}
          subtitle="All algorithmic challenges solved with verified accepted verdict"
        >
          {solvedProblems.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No problems solved yet. Start practicing on the problem explorer!
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto -mr-2 pr-2">
              {solvedProblems.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-slate-800 hover:text-indigo-600 transition-colors">
                      {item.problem?.title || 'Unknown Problem'}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <DifficultyBadge difficulty={item.problem?.difficulty} />
                      <span className="text-xs text-slate-400">
                        Solved on {new Date(item.solvedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {item.bestSubmission && (
                    <div className="text-right text-xs font-mono text-slate-500">
                      <div>{item.bestSubmission.runtime} ms</div>
                      <div className="text-slate-400 capitalize">{item.bestSubmission.language}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
