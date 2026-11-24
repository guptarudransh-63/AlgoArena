import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { io } from 'socket.io-client';
import {
  Play,
  Send,
  RotateCcw,
  Copy,
  Check,
  Code2,
  FileText,
  Clock,
  HelpCircle,
  BookOpen,
  Terminal,
  Maximize2,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { problemsApi, submissionsApi } from '../lib/api';
import DifficultyBadge from '../components/ui/DifficultyBadge';
import VerdictBadge from '../components/ui/VerdictBadge';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

export default function ProblemWorkspacePage() {
  const { slug } = useParams();

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftTab, setLeftTab] = useState('description'); // 'description' | 'editorial' | 'submissions'
  const [submissionsHistory, setSubmissionsHistory] = useState([]);

  // Editor states
  const [language, setLanguage] = useState('javascript');
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(14);
  const [sourceCode, setSourceCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Bottom Console / Test Panel states
  const [activeConsoleTab, setActiveConsoleTab] = useState('testcase'); // 'testcase' | 'result'
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [pollingStatus, setPollingStatus] = useState(null);

  const socketRef = useRef(null);

  // 1. Fetch Problem Data
  useEffect(() => {
    async function fetchProblem() {
      try {
        setLoading(true);
        const res = await problemsApi.getBySlug(slug);
        const prob = res.data.data.problem;
        setProblem(prob);

        // Set initial starter template or draft from localStorage
        const savedDraft = localStorage.getItem(`algoarena_draft_${slug}_${language}`);
        if (savedDraft) {
          setSourceCode(savedDraft);
        } else if (prob.starterTemplates && prob.starterTemplates[language]) {
          setSourceCode(prob.starterTemplates[language]);
        } else {
          setSourceCode('// Write your solution here\n');
        }

        // Initialize custom input with first sample test case
        if (prob.sampleTestCases && prob.sampleTestCases.length > 0) {
          setCustomInput(prob.sampleTestCases[0].input);
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProblem();
  }, [slug]);

  // 2. Fetch User Submissions History when Tab is Selected
  useEffect(() => {
    if (leftTab === 'submissions' && problem?._id) {
      submissionsApi
        .getMyForProblem(problem._id)
        .then((res) => setSubmissionsHistory(res.data.data.submissions))
        .catch(console.error);
    }
  }, [leftTab, problem?._id]);

  // 3. Switch Language & Load Draft
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const savedDraft = localStorage.getItem(`algoarena_draft_${slug}_${newLang}`);
    if (savedDraft) {
      setSourceCode(savedDraft);
    } else if (problem?.starterTemplates && problem.starterTemplates[newLang]) {
      setSourceCode(problem.starterTemplates[newLang]);
    } else {
      setSourceCode('// Write your solution here\n');
    }
  };

  // 4. Code Change & Draft Persistence
  const handleCodeChange = (value) => {
    const val = value || '';
    setSourceCode(val);
    localStorage.setItem(`algoarena_draft_${slug}_${language}`, val);
  };

  // 5. Reset Code to Starter Template
  const handleResetCode = () => {
    if (confirm('Reset code to default starter template? Current changes will be overwritten.')) {
      const template = problem?.starterTemplates?.[language] || '';
      setSourceCode(template);
      localStorage.setItem(`algoarena_draft_${slug}_${language}`, template);
    }
  };

  // 6. Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 7. Socket.IO connection for live status
  useEffect(() => {
    const socket = io('/', { path: '/socket.io' });
    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, []);

  // 8. Handle Run (Executes against sample tests or custom input)
  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setActiveConsoleTab('result');
    setRunResult(null);
    setSubmitResult(null);

    try {
      const payload = {
        language,
        sourceCode,
        customInput: useCustomInput ? customInput : undefined
      };
      const res = await submissionsApi.run(problem._id, payload);
      setRunResult(res.data.data);
    } catch (err) {
      setRunResult({
        verdict: 'Error',
        error: err.response?.data?.message || 'Failed to run code'
      });
    } finally {
      setIsRunning(false);
    }
  };

  // 9. Handle Submit (Asynchronous full evaluation through queue & worker)
  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setActiveConsoleTab('result');
    setRunResult(null);
    setSubmitResult(null);
    setPollingStatus('queued');

    try {
      const payload = {
        language,
        sourceCode
      };
      const res = await submissionsApi.submit(problem._id, payload);
      const submissionId = res.data.data.submissionId;

      // Join socket room
      socketRef.current?.emit('subscribe:submission', submissionId);

      // Listen for socket update
      const onStatus = (data) => {
        if (data.submissionId === submissionId) {
          setPollingStatus(data.status);
          if (data.status === 'completed' || data.status === 'failed') {
            fetchFinalSubmission(submissionId);
          }
        }
      };
      socketRef.current?.on('submission:status', onStatus);

      // Polling fallback every 800ms
      const interval = setInterval(async () => {
        try {
          const statusRes = await submissionsApi.getStatus(submissionId);
          const sub = statusRes.data.data.submission;
          setPollingStatus(sub.status);
          if (sub.status === 'completed' || sub.status === 'failed') {
            clearInterval(interval);
            socketRef.current?.off('submission:status', onStatus);
            fetchFinalSubmission(submissionId);
          }
        } catch {
          clearInterval(interval);
          setIsSubmitting(false);
        }
      }, 800);
    } catch (err) {
      setSubmitResult({
        verdict: 'Error',
        error: err.response?.data?.message || 'Failed to submit solution'
      });
      setIsSubmitting(false);
    }
  };

  const fetchFinalSubmission = async (id) => {
    try {
      const res = await submissionsApi.getById(id);
      setSubmitResult(res.data.data.submission);
      // Refresh submissions history tab
      submissionsApi
        .getMyForProblem(problem._id)
        .then((r) => setSubmissionsHistory(r.data.data.submissions))
        .catch(console.error);
    } catch (err) {
      console.error('Failed to get final submission:', err);
    } finally {
      setIsSubmitting(false);
      setPollingStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Spinner size="lg" text="Loading coding workspace..." />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-slate-800">Problem not found</h2>
        <Link to="/problems" className="mt-4 inline-block text-indigo-600 hover:underline">
          ← Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col -mx-4 -my-8 sm:-mx-6 lg:-mx-8">
      {/* Top Workspace Bar */}
      <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/problems"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Problems
          </Link>
          <span className="text-slate-300">|</span>
          <span className="font-semibold text-sm text-slate-900">{problem.title}</span>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRun}
            isLoading={isRunning}
            disabled={isSubmitting}
            className="px-3"
          >
            <Play className="w-3.5 h-3.5 mr-1 text-slate-600 fill-slate-600" />
            Run
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            disabled={isRunning}
            className="px-4"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Workspace Split Panels */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-100">
        {/* Left Panel: Problem Statement / Editorial / Submissions */}
        <div className="w-full lg:w-1/2 flex flex-col bg-white border-r border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => setLeftTab('description')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                leftTab === 'description'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Description
            </button>
            <button
              onClick={() => setLeftTab('editorial')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                leftTab === 'editorial'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Editorial & Hints
            </button>
            <button
              onClick={() => setLeftTab('submissions')}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                leftTab === 'submissions'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Submissions
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {leftTab === 'description' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{problem.title}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    {problem.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Markdown Description */}
                <div className="prose prose-slate prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {problem.description}
                  </ReactMarkdown>
                </div>

                {/* Examples */}
                {problem.examples && problem.examples.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-slate-900">Examples</h3>
                    {problem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 font-mono text-xs space-y-1.5"
                      >
                        <p className="font-semibold text-slate-700">Example {idx + 1}:</p>
                        <div>
                          <span className="text-slate-400">Input: </span>
                          <span className="text-slate-900 whitespace-pre-wrap">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Output: </span>
                          <span className="text-slate-900 whitespace-pre-wrap">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="font-sans text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                            <span className="font-semibold">Explanation: </span>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 mb-2">Constraints:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 font-mono">
                      {problem.constraints.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {leftTab === 'editorial' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hints & Strategy</h3>
                  {problem.hints && problem.hints.length > 0 ? (
                    <div className="space-y-3 mt-3">
                      {problem.hints.map((hint, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2.5"
                        >
                          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{hint}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">No hints added for this problem.</p>
                  )}
                </div>

                {problem.editorial && (
                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-2">Editorial</h3>
                    <div className="prose prose-slate prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {problem.editorial}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {leftTab === 'submissions' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Your Past Submissions</h3>
                {submissionsHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No submissions recorded yet for this problem.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {submissionsHistory.map((sub) => (
                      <div key={sub._id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <VerdictBadge verdict={sub.verdict} />
                          <span className="text-slate-400 capitalize">{sub.language}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-500 font-mono">
                          {sub.runtime !== undefined && <span>{sub.runtime} ms</span>}
                          <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Code Editor + Testcase/Result Drawer */}
        <div className="w-full lg:w-1/2 flex flex-col bg-white overflow-hidden">
          {/* Editor Header Bar */}
          <div className="h-10 bg-slate-900 px-4 flex items-center justify-between text-xs text-slate-300 shrink-0">
            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-slate-800 text-white font-medium px-2.5 py-1 rounded-md border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="python">Python 3</option>
                <option value="java">Java (OpenJDK)</option>
                <option value="cpp">C++ (GCC)</option>
              </select>
            </div>

            {/* Editor Utilities */}
            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value)}
                className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-700"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
              </select>

              {/* Font size */}
              <div className="flex items-center gap-1 text-[11px]">
                <span>Font:</span>
                <button
                  onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded"
                >
                  -
                </button>
                <span>{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded"
                >
                  +
                </button>
              </div>

              {/* Copy Code */}
              <button
                onClick={handleCopyCode}
                title="Copy Code"
                className="p-1 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Reset Code */}
              <button
                onClick={handleResetCode}
                title="Reset to Template"
                className="p-1 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[300px]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme={editorTheme}
              value={sourceCode}
              onChange={handleCodeChange}
              options={{
                fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: "'Fira Code', 'Courier New', monospace",
                lineNumbers: 'on',
                tabSize: 2,
                automaticLayout: true
              }}
            />
          </div>

          {/* Bottom Console Drawer */}
          <div className="h-60 border-t border-slate-200 flex flex-col bg-slate-50 shrink-0">
            {/* Console Drawer Tabs */}
            <div className="flex items-center justify-between px-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConsoleTab('testcase')}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                    activeConsoleTab === 'testcase'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setActiveConsoleTab('result')}
                  className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                    activeConsoleTab === 'result'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Execution Result
                </button>
              </div>

              {/* Custom Input Toggle */}
              {activeConsoleTab === 'testcase' && (
                <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomInput}
                    onChange={(e) => setUseCustomInput(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Custom Testcase</span>
                </label>
              )}
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs font-mono">
              {activeConsoleTab === 'testcase' && (
                <div className="space-y-3">
                  {useCustomInput ? (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Input (sent via stdin):
                      </label>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        rows={5}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Enter custom standard input..."
                      />
                    </div>
                  ) : (
                    <div>
                      {/* Case selector pills */}
                      <div className="flex items-center gap-1.5 mb-2">
                        {problem.sampleTestCases?.map((tc, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTestCaseIndex(idx)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                              selectedTestCaseIndex === idx
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            }`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Selected testcase details */}
                      {problem.sampleTestCases?.[selectedTestCaseIndex] && (
                        <div className="space-y-2">
                          <div>
                            <span className="text-[11px] text-slate-500 block">Input:</span>
                            <div className="bg-white p-2 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap">
                              {problem.sampleTestCases[selectedTestCaseIndex].input}
                            </div>
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-500 block">Expected Output:</span>
                            <div className="bg-white p-2 rounded border border-slate-200 text-slate-800 whitespace-pre-wrap">
                              {problem.sampleTestCases[selectedTestCaseIndex].expectedOutput}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeConsoleTab === 'result' && (
                <div>
                  {isRunning || isSubmitting ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2">
                      <Spinner size="md" />
                      <span className="text-xs text-slate-500 font-sans">
                        {pollingStatus ? `Status: ${pollingStatus}...` : 'Evaluating code on judge...'}
                      </span>
                    </div>
                  ) : runResult ? (
                    /* Sample Run Result */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <VerdictBadge verdict={runResult.verdict} />
                          <span className="text-xs text-slate-500 font-sans">
                            (Sample Test Run)
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-sans">
                          Runtime: {runResult.runtime || 0} ms • Memory: {runResult.memory || 0} KB
                        </div>
                      </div>

                      {/* Test results detail */}
                      {runResult.results && (
                        <div className="space-y-2 mt-2">
                          {runResult.results.map((r, i) => (
                            <div
                              key={i}
                              className={`p-2.5 rounded-lg border text-xs ${
                                r.passed
                                  ? 'bg-emerald-50/50 border-emerald-200'
                                  : 'bg-rose-50/50 border-rose-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 font-semibold font-sans mb-1">
                                {r.passed ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                )}
                                <span className={r.passed ? 'text-emerald-700' : 'text-rose-700'}>
                                  Test Case {i + 1}: {r.passed ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                              {r.input && (
                                <div>
                                  <span className="text-slate-400">Input: </span>
                                  <span className="text-slate-800">{r.input}</span>
                                </div>
                              )}
                              {r.actualOutput !== undefined && (
                                <div>
                                  <span className="text-slate-400">Output: </span>
                                  <span className="text-slate-800">{r.actualOutput}</span>
                                </div>
                              )}
                              {r.expectedOutput !== undefined && (
                                <div>
                                  <span className="text-slate-400">Expected: </span>
                                  <span className="text-slate-800">{r.expectedOutput}</span>
                                </div>
                              )}
                              {r.stderr && (
                                <div className="text-rose-600 mt-1 whitespace-pre-wrap">
                                  {r.stderr}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : submitResult ? (
                    /* Official Submission Result */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <VerdictBadge verdict={submitResult.verdict} />
                          <span className="text-xs text-slate-500 font-sans">
                            {submitResult.testsPassed} / {submitResult.totalTests} test cases passed
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-sans">
                          Runtime: {submitResult.runtime || 0} ms • Memory:{' '}
                          {submitResult.memory || 0} KB
                        </div>
                      </div>

                      {submitResult.verdict === 'Accepted' ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-sans">
                          🎉 Solution accepted! Progress recorded on your profile.
                        </div>
                      ) : (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-sans">
                          <p className="font-semibold">
                            {submitResult.verdict}: {submitResult.error || 'Test suite evaluation failed'}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400 font-sans text-xs">
                      Click "Run" to test with samples, or "Submit" to evaluate all test cases.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
