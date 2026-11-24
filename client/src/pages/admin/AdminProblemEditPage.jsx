import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, Code, CheckCircle2, ShieldAlert } from 'lucide-react';
import api from '../../lib/axios';
import { adminApi } from '../../lib/api';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function AdminProblemEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    difficulty: 'Easy',
    tags: '',
    description: '',
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    starterTemplates: {
      javascript: 'function solve() {\n  // your code\n}\n',
      python: 'def solve():\n    pass\n',
      java: 'class Solution {\n    public void solve() {}\n}\n',
      cpp: 'class Solution {\npublic:\n    void solve() {}\n};\n'
    }
  });

  const [activeTemplateLang, setActiveTemplateLang] = useState('javascript');

  // Test cases state
  const [testCases, setTestCases] = useState([]);
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcOutput, setNewTcOutput] = useState('');
  const [newTcPublic, setNewTcPublic] = useState(true);

  useEffect(() => {
    if (isEditing) {
      async function loadProblem() {
        try {
          setLoading(true);
          const res = await api.get(`/admin/problems/${id}`);
          const p = res.data.data.problem;
          setFormData({
            title: p.title || '',
            slug: p.slug || '',
            difficulty: p.difficulty || 'Easy',
            tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
            description: p.description || '',
            timeLimitMs: p.timeLimitMs || 2000,
            memoryLimitKb: p.memoryLimitKb || 256000,
            starterTemplates: p.starterTemplates || {}
          });
          setTestCases(p.testCases || []);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load problem');
        } finally {
          setLoading(false);
        }
      }
      loadProblem();
    }
  }, [id, isEditing]);

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug.toLowerCase().trim(),
        difficulty: formData.difficulty,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        description: formData.description,
        timeLimitMs: parseInt(formData.timeLimitMs, 10),
        memoryLimitKb: parseInt(formData.memoryLimitKb, 10),
        starterTemplates: formData.starterTemplates
      };

      if (isEditing) {
        await api.patch(`/admin/problems/${id}`, payload);
        setSuccess('Problem updated successfully');
      } else {
        const res = await api.post('/admin/problems', payload);
        navigate(`/admin/problems/${res.data.data.problem._id}/edit`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTestCase = async () => {
    if (!newTcInput.trim() || !newTcOutput.trim()) {
      setError('Test case input and expected output cannot be empty');
      return;
    }
    setError('');

    if (!isEditing) {
      // Just store in local state until problem is created
      setTestCases([
        ...testCases,
        {
          _id: `temp_${Date.now()}`,
          input: newTcInput,
          expectedOutput: newTcOutput,
          isPublic: newTcPublic,
          order: testCases.length + 1
        }
      ]);
      setNewTcInput('');
      setNewTcOutput('');
      return;
    }

    try {
      const res = await api.post(`/admin/problems/${id}/test-cases`, {
        input: newTcInput,
        expectedOutput: newTcOutput,
        isPublic: newTcPublic,
        order: testCases.length + 1
      });
      setTestCases([...testCases, res.data.data.testCase]);
      setNewTcInput('');
      setNewTcOutput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add testcase');
    }
  };

  const handleDeleteTestCase = async (tcId) => {
    if (!confirm('Are you sure you want to remove this test case?')) return;
    try {
      if (isEditing && !tcId.startsWith('temp_')) {
        await api.delete(`/admin/test-cases/${tcId}`);
      }
      setTestCases(testCases.filter((tc) => tc._id !== tcId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete testcase');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Spinner size="lg" text="Loading problem editor..." />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/problems"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Problems
        </Link>
        <Button variant="primary" onClick={handleSaveProblem} isLoading={saving}>
          <Save className="w-4 h-4 mr-1.5" />
          {isEditing ? 'Save Changes' : 'Create Problem'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSaveProblem} className="space-y-6">
        {/* Core Details Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Problem Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Problem Title"
                placeholder="e.g. Reverse Linked List"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Unique Slug"
                placeholder="e.g. reverse-linked-list"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <Input
                label="Time Limit (ms)"
                type="number"
                value={formData.timeLimitMs}
                onChange={(e) => setFormData({ ...formData, timeLimitMs: e.target.value })}
              />
            </div>

            <div>
              <Input
                label="Memory Limit (KB)"
                type="number"
                value={formData.memoryLimitKb}
                onChange={(e) => setFormData({ ...formData, memoryLimitKb: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Input
              label="Topic Tags (comma-separated)"
              placeholder="Arrays, Two Pointers, Dynamic Programming"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
              Description (Markdown format)
            </label>
            <textarea
              rows={8}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the problem, input format, output format, examples and constraints..."
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Starter Templates Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Starter Code Templates</h2>
            <div className="flex items-center gap-1">
              {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveTemplateLang(lang)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    activeTemplateLang === lang
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={7}
            value={formData.starterTemplates[activeTemplateLang] || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                starterTemplates: {
                  ...formData.starterTemplates,
                  [activeTemplateLang]: e.target.value
                }
              })
            }
            className="w-full p-3 font-mono text-xs bg-slate-900 text-slate-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Test Cases Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Test Cases Evaluation Suite ({testCases.length})
          </h2>

          {/* Test cases list */}
          <div className="space-y-2">
            {testCases.map((tc, idx) => (
              <div
                key={tc._id || idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-400">#{idx + 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      tc.isPublic
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {tc.isPublic ? 'Public' : 'Private'}
                  </span>
                  <div className="font-mono text-slate-700 truncate max-w-xs">
                    In: <span className="text-slate-900">{tc.input}</span> | Out:{' '}
                    <span className="text-slate-900">{tc.expectedOutput}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteTestCase(tc._id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new testcase form */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Add Test Case
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Input (stdin):
                </label>
                <textarea
                  rows={2}
                  value={newTcInput}
                  onChange={(e) => setNewTcInput(e.target.value)}
                  placeholder="e.g. [2,7,11,15]\n9"
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Expected Output (stdout):
                </label>
                <textarea
                  rows={2}
                  value={newTcOutput}
                  onChange={(e) => setNewTcOutput(e.target.value)}
                  placeholder="e.g. [0,1]"
                  className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTcPublic}
                  onChange={(e) => setNewTcPublic(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Public Sample Test (visible to users in workspace)</span>
              </label>

              <Button type="button" variant="secondary" size="sm" onClick={handleAddTestCase}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Test Case
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
