import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Check,
  RotateCcw,
  Bot,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { ResumeData } from '../types/resume';
import {
  ATSReadinessResult,
  ResumeSuggestion,
  ChatMessage,
} from '../types/resumeBuddy';
import {
  evaluateResumeATSDeterministically,
  generateLocalImprovementSuggestions,
} from '../utils/atsEvaluator';

interface ResumeBuddyProps {
  resumeData: ResumeData;
  onResumeChange: (updated: ResumeData) => void;
  activeTemplate: string;
}

export const ResumeBuddy: React.FC<ResumeBuddyProps> = ({
  resumeData,
  onResumeChange,
}) => {
  // Panel state
  const [isOpen, setIsOpen] = useState(false);

  // Backend status
  const [isGeminiConfigured, setIsGeminiConfigured] = useState<boolean | null>(null);

  // Active status
  const [isAnalyzingATS, setIsAnalyzingATS] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Suggestions state
  const [staleWarningId, setStaleWarningId] = useState<string | null>(null);

  // Chat State with exact friendly greeting
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'buddy',
      text: "Hi, I'm Resume Buddy! How can I help you improve your resume today?",
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Close handler: closes chatbot panel immediately without clearing resume data or history
  const handleCloseBuddy = () => {
    setIsOpen(false);
  };

  // Check backend Gemini status on mount
  useEffect(() => {
    fetch('/api/resume-buddy/status')
      .then((res) => res.json())
      .then((data) => {
        if (isMountedRef.current) {
          setIsGeminiConfigured(!!data.configured);
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setIsGeminiConfigured(false);
        }
      });
  }, []);

  // Scroll to bottom of chat on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isAnalyzingATS, isLoadingSuggestions, isSendingChat]);

  // Helper for ATS qualitative badge
  const getScoreBadge = (score: number) => {
    if (score >= 85) return { label: 'Excellent ATS Readiness', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (score >= 70) return { label: 'Good ATS Foundation', color: 'text-blue-700 bg-blue-50 border-blue-300' };
    if (score >= 50) return { label: 'Needs Optimization', color: 'text-amber-700 bg-amber-50 border-amber-300' };
    return { label: 'Significant Improvements Needed', color: 'text-red-700 bg-red-50 border-red-300' };
  };

  // --- 1. Action: Analyze ATS Readiness ---
  const handleAnalyzeATS = async () => {
    if (isAnalyzingATS) return;

    // Add user message to conversation
    const userMsg: ChatMessage = {
      id: `user-ats-${Date.now()}`,
      sender: 'user',
      text: 'Analyze ATS Readiness',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsAnalyzingATS(true);

    try {
      const response = await fetch('/api/resume-buddy/ats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData }),
      });

      let result: ATSReadinessResult;
      if (response.ok) {
        const data = await response.json();
        if (data.useLocalFallback || !data.overallScore) {
          result = evaluateResumeATSDeterministically(resumeData);
          if (data.configHelp) result.configHelp = data.configHelp;
        } else {
          result = data;
        }
      } else {
        result = evaluateResumeATSDeterministically(resumeData);
      }

      if (isMountedRef.current) {
        const buddyMsg: ChatMessage = {
          id: `ats-${Date.now()}`,
          sender: 'buddy',
          text: `📊 Here is your ATS Readiness evaluation based on your current resume data:\n\n**Overall Score: ${result.overallScore}/100** — *${getScoreBadge(result.overallScore).label}*`,
          atsResult: result,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, buddyMsg]);
      }
    } catch (e) {
      if (isMountedRef.current) {
        const result = evaluateResumeATSDeterministically(resumeData);
        const buddyMsg: ChatMessage = {
          id: `ats-${Date.now()}`,
          sender: 'buddy',
          text: `📊 Here is your ATS Readiness evaluation based on your current resume data:\n\n**Overall Score: ${result.overallScore}/100** — *${getScoreBadge(result.overallScore).label}*`,
          atsResult: result,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, buddyMsg]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsAnalyzingATS(false);
      }
    }
  };

  // --- 2. Action: Improve My Resume ---
  const handleImproveResume = async () => {
    if (isLoadingSuggestions) return;

    const userMsg: ChatMessage = {
      id: `user-imp-${Date.now()}`,
      sender: 'user',
      text: 'Improve My Resume',
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoadingSuggestions(true);
    setStaleWarningId(null);

    try {
      const response = await fetch('/api/resume-buddy/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData }),
      });

      let items: ResumeSuggestion[];
      if (response.ok) {
        const data = await response.json();
        if (data.useLocalFallback || !data.suggestions || data.suggestions.length === 0) {
          items = generateLocalImprovementSuggestions(resumeData);
        } else {
          items = data.suggestions;
        }
      } else {
        items = generateLocalImprovementSuggestions(resumeData);
      }

      if (isMountedRef.current) {
        const buddyMsg: ChatMessage = {
          id: `sug-${Date.now()}`,
          sender: 'buddy',
          text: `✨ I've analyzed your resume and generated ${items.length} concrete bullet improvements with quantifiable metrics. Review the rewrites below and click **Apply to Resume** to update your content:`,
          suggestions: items,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, buddyMsg]);
      }
    } catch (e) {
      if (isMountedRef.current) {
        const items = generateLocalImprovementSuggestions(resumeData);
        const buddyMsg: ChatMessage = {
          id: `sug-${Date.now()}`,
          sender: 'buddy',
          text: `✨ I've analyzed your resume and generated ${items.length} concrete bullet improvements with quantifiable metrics. Review the rewrites below and click **Apply to Resume** to update your content:`,
          suggestions: items,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, buddyMsg]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoadingSuggestions(false);
      }
    }
  };

  // Helper to get current text of an item to check for staleness
  const getCurrentTextForSuggestion = (suggestion: ResumeSuggestion): string | null => {
    if (suggestion.section === 'summary') {
      return (resumeData.summary || '').trim();
    }
    if (suggestion.section === 'experience' && suggestion.itemId) {
      const exp = (resumeData.experience || []).find((e) => e.id === suggestion.itemId);
      if (!exp) return null;
      if (typeof suggestion.bulletIndex === 'number' && exp.highlights) {
        return (exp.highlights[suggestion.bulletIndex] || '').trim();
      }
    }
    if (suggestion.section === 'projects' && suggestion.itemId) {
      const proj = (resumeData.projects || []).find((p) => p.id === suggestion.itemId);
      if (!proj) return null;
      if (suggestion.field === 'bullet' && typeof suggestion.bulletIndex === 'number' && proj.highlights) {
        return (proj.highlights[suggestion.bulletIndex] || '').trim();
      }
      return (proj.description || '').trim();
    }
    return null;
  };

  // Apply suggestion directly to active resumeData
  const handleApplySuggestion = (suggestion: ResumeSuggestion, force = false) => {
    const currentText = getCurrentTextForSuggestion(suggestion);

    if (!force && currentText !== null && currentText !== suggestion.originalText.trim()) {
      setStaleWarningId(suggestion.id);
      return;
    }

    const updated = JSON.parse(JSON.stringify(resumeData)) as ResumeData;

    if (suggestion.section === 'summary') {
      updated.summary = suggestion.suggestedText;
    } else if (suggestion.section === 'experience' && suggestion.itemId) {
      const expIdx = (updated.experience || []).findIndex((e) => e.id === suggestion.itemId);
      if (expIdx !== -1) {
        if (typeof suggestion.bulletIndex === 'number') {
          if (!updated.experience[expIdx].highlights) updated.experience[expIdx].highlights = [];
          updated.experience[expIdx].highlights[suggestion.bulletIndex] = suggestion.suggestedText;
        }
      }
    } else if (suggestion.section === 'projects' && suggestion.itemId) {
      const projIdx = (updated.projects || []).findIndex((p) => p.id === suggestion.itemId);
      if (projIdx !== -1) {
        if (suggestion.field === 'bullet' && typeof suggestion.bulletIndex === 'number') {
          if (!updated.projects[projIdx].highlights) updated.projects[projIdx].highlights = [];
          updated.projects[projIdx].highlights[suggestion.bulletIndex] = suggestion.suggestedText;
        } else {
          updated.projects[projIdx].description = suggestion.suggestedText;
        }
      }
    }

    onResumeChange(updated);
    setStaleWarningId(null);

    // Update in message suggestions
    setMessages((prev) =>
      prev.map((msg) =>
        msg.suggestions
          ? {
              ...msg,
              suggestions: msg.suggestions.map((s) =>
                s.id === suggestion.id ? { ...s, applied: true } : s
              ),
            }
          : msg
      )
    );
  };

  // Revert/Undo suggestion
  const handleUndoSuggestion = (suggestion: ResumeSuggestion) => {
    const updated = JSON.parse(JSON.stringify(resumeData)) as ResumeData;

    if (suggestion.section === 'summary') {
      updated.summary = suggestion.originalText;
    } else if (suggestion.section === 'experience' && suggestion.itemId) {
      const expIdx = (updated.experience || []).findIndex((e) => e.id === suggestion.itemId);
      if (expIdx !== -1 && typeof suggestion.bulletIndex === 'number' && updated.experience[expIdx].highlights) {
        updated.experience[expIdx].highlights[suggestion.bulletIndex] = suggestion.originalText;
      }
    } else if (suggestion.section === 'projects' && suggestion.itemId) {
      const projIdx = (updated.projects || []).findIndex((p) => p.id === suggestion.itemId);
      if (projIdx !== -1) {
        if (suggestion.field === 'bullet' && typeof suggestion.bulletIndex === 'number' && updated.projects[projIdx].highlights) {
          updated.projects[projIdx].highlights[suggestion.bulletIndex] = suggestion.originalText;
        } else {
          updated.projects[projIdx].description = suggestion.originalText;
        }
      }
    }

    onResumeChange(updated);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.suggestions
          ? {
              ...msg,
              suggestions: msg.suggestions.map((s) =>
                s.id === suggestion.id ? { ...s, applied: false } : s
              ),
            }
          : msg
      )
    );
  };

  // Dismiss suggestion
  const handleDismissSuggestion = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.suggestions
          ? {
              ...msg,
              suggestions: msg.suggestions.map((s) =>
                s.id === id ? { ...s, dismissed: true } : s
              ),
            }
          : msg
      )
    );
    if (staleWarningId === id) setStaleWarningId(null);
  };

  // --- 3. Action: Conversational Chat ---
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSendingChat(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/resume-buddy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          resumeData,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (isMountedRef.current) {
        const buddyMsg: ChatMessage = {
          id: `buddy-${Date.now()}`,
          sender: 'buddy',
          text: data.text || 'I could not process that request.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, buddyMsg]);
      }
    } catch {
      if (isMountedRef.current) {
        const buddyMsg: ChatMessage = {
          id: `buddy-${Date.now()}`,
          sender: 'buddy',
          text: `I noticed you're asking about "${query}".\n\n**Quick Resume Tip:**\n- Make sure every bullet in your experience starts with a strong action verb.\n- Quantify results with metrics (%, $, numbers) wherever possible.\n- Keep your formatting clean and standard so ATS parsers can easily extract your qualifications.\n\n*Tip: You can click **Analyze ATS Readiness** above to get an instant category-by-category breakdown!*`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, buddyMsg]);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSendingChat(false);
      }
    }
  };

  return (
    <>
      {/* Compact Circular Floating Robot Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
          }}
          className="no-print fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-teal-500/40 flex items-center justify-center group hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus:ring-4 focus:ring-teal-500/30"
          title="Open Resume Buddy"
          aria-label="Open Resume Buddy"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-7 h-7 text-teal-400 group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-400 border border-slate-900" />
          </div>
        </button>
      )}

      {/* Full Floating Chat Panel: Fully Visible, Responsive, No Viewport Overflow */}
      {isOpen && (
        <div
          className="no-print fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[460px] md:w-[480px] max-w-[calc(100vw-2rem)] h-[min(640px,calc(100dvh-2.5rem))] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{ boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.3)' }}
        >
          {/* Header: Exactly One Visible Close Button */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Resume Buddy</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-800 text-teal-300 border border-slate-700 shrink-0">
                    {isGeminiConfigured ? 'Gemini AI' : 'Assistant'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none mt-0.5 truncate">
                  AI-Powered Resume Coach & ATS Evaluator
                </p>
              </div>
            </div>

            {/* Exactly One Close Control in Header */}
            <button
              type="button"
              onClick={handleCloseBuddy}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-400 shrink-0 ml-2"
              title="Close Resume Buddy"
              aria-label="Close Resume Buddy"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Conversation Area (Scrolls Independently) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
            {/* 1. Welcome Greeting from Buddy */}
            <div className="flex gap-2.5 justify-start items-start">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-slate-800">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-xs p-3 text-xs leading-relaxed border border-slate-200 shadow-2xs max-w-[88%]">
                Hi, I'm Resume Buddy! How can I help you improve your resume today?
              </div>
            </div>

            {/* 2. Exactly One Set of Three Primary Action Cards */}
            <div className="bg-gradient-to-br from-slate-50 to-teal-50/30 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
              <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                What would you like to do?
              </p>
              <div className="grid grid-cols-1 gap-2">
                {/* Capability 1: Analyze ATS Readiness */}
                <button
                  type="button"
                  onClick={handleAnalyzeATS}
                  disabled={isAnalyzingATS}
                  className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all flex items-start gap-2.5 group cursor-pointer disabled:opacity-60"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-xs flex items-center justify-between">
                      <span>1. Analyze ATS Readiness</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Evaluate structure, skills, readability, and parsing without requiring a job description.
                    </div>
                  </div>
                </button>

                {/* Capability 2: Improve My Resume */}
                <button
                  type="button"
                  onClick={handleImproveResume}
                  disabled={isLoadingSuggestions}
                  className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all flex items-start gap-2.5 group cursor-pointer disabled:opacity-60"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-xs flex items-center justify-between">
                      <span>2. Improve My Resume</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Receive concrete, metric-driven bullet rewrites you can apply directly with one click.
                    </div>
                  </div>
                </button>

                {/* Capability 3: Ask Resume Buddy */}
                <button
                  type="button"
                  onClick={() => {
                    chatInputRef.current?.focus();
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-all flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-xs flex items-center justify-between">
                      <span>3. Ask Resume Buddy</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      Ask any question about your resume sections, tone, formatting, or career transitions.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Conversation Thread */}
            {messages.slice(1).map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start items-start'
                }`}
              >
                {msg.sender === 'buddy' && (
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs border border-slate-800">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs shadow-xs max-w-[85%]'
                      : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200 w-full max-w-[92%]'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.text}</div>

                  {/* Inline ATS Result Card */}
                  {msg.atsResult && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-slate-200">
                      {/* Overall score gauge */}
                      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-3.5 rounded-xl shadow-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                              ATS Readiness Score
                            </span>
                            <div className="flex items-baseline gap-1.5 mt-0.5">
                              <span className="text-2xl font-extrabold tracking-tight">
                                {msg.atsResult.overallScore}
                              </span>
                              <span className="text-slate-400 text-xs font-semibold">/ 100</span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              getScoreBadge(msg.atsResult.overallScore).color
                            }`}
                          >
                            {getScoreBadge(msg.atsResult.overallScore).label}
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              msg.atsResult.overallScore >= 80
                                ? 'bg-emerald-400'
                                : msg.atsResult.overallScore >= 60
                                ? 'bg-teal-400'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${msg.atsResult.overallScore}%` }}
                          />
                        </div>
                      </div>

                      {/* 5 Core Dimensions */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                          5 Core Dimensions
                        </span>
                        <div className="space-y-1.5">
                          {msg.atsResult.dimensions.map((dim, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-white border border-slate-200 rounded-lg space-y-1"
                            >
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span className="text-slate-800">{dim.name}</span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                      dim.status === 'good'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : dim.status === 'average'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {dim.status}
                                  </span>
                                  <span className="font-mono text-slate-600 font-bold text-[10px]">{dim.score}%</span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    dim.score >= 75
                                      ? 'bg-emerald-500'
                                      : dim.score >= 50
                                      ? 'bg-blue-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${dim.score}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-slate-600 leading-snug">{dim.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths & Action Plan */}
                      {msg.atsResult.keyStrengths && msg.atsResult.keyStrengths.length > 0 && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1 text-[11px] text-emerald-950">
                          <span className="font-bold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {msg.atsResult.keyStrengths.map((str, i) => (
                              <li key={i}>{str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.atsResult.prioritizedRecommendations && msg.atsResult.prioritizedRecommendations.length > 0 && (
                        <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1 text-[11px] text-indigo-950">
                          <span className="font-bold text-indigo-900 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-indigo-600" /> Action Plan
                          </span>
                          <ol className="list-decimal pl-4 space-y-0.5">
                            {msg.atsResult.prioritizedRecommendations.map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Inline Suggestions Cards with Apply & Dismiss */}
                  {msg.suggestions && (
                    <div className="mt-3 space-y-2.5 pt-3 border-t border-slate-200">
                      {msg.suggestions
                        .filter((s) => !s.dismissed)
                        .map((sug) => {
                          const isWarning = staleWarningId === sug.id;
                          return (
                            <div
                              key={sug.id}
                              className={`p-3 rounded-xl border transition-all ${
                                sug.applied
                                  ? 'bg-emerald-50/60 border-emerald-300'
                                  : isWarning
                                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-300/40'
                                  : 'bg-white border-slate-200 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                  {sug.section} • {sug.field}
                                </span>
                                {sug.applied && (
                                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Applied to Resume
                                  </span>
                                )}
                              </div>

                              {/* Diff View */}
                              <div className="space-y-1.5 mb-2 text-[11px]">
                                <div className="p-2 rounded bg-slate-50 border border-slate-200 text-slate-600">
                                  <span className="text-[9px] font-bold text-slate-400 block uppercase">Original</span>
                                  {sug.originalText}
                                </div>
                                <div className="p-2 rounded bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-medium">
                                  <span className="text-[9px] font-bold text-emerald-700 block uppercase">Suggested Rewrite</span>
                                  {sug.suggestedText}
                                </div>
                              </div>

                              <p className="text-[10px] text-slate-600 italic mb-2">
                                <strong>Why:</strong> {sug.reason}
                              </p>

                              {/* Staleness Warning */}
                              {isWarning && (
                                <div className="mb-2 p-2 rounded bg-amber-100/70 border border-amber-300 text-amber-900 text-[10px] space-y-1">
                                  <p className="font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                                    Resume text was modified since this suggestion was created.
                                  </p>
                                  <div className="flex gap-2 pt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleApplySuggestion(sug, true)}
                                      className="px-2 py-0.5 bg-amber-700 text-white rounded font-bold hover:bg-amber-800 cursor-pointer"
                                    >
                                      Overwrite Anyway
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setStaleWarningId(null)}
                                      className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
                                {!sug.applied ? (
                                  <button
                                    type="button"
                                    onClick={() => handleApplySuggestion(sug)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs text-[11px]"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Apply to Resume</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUndoSuggestion(sug)}
                                    className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Undo</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDismissSuggestion(sug.id)}
                                  className="px-2 py-1 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[11px]"
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* In-Flight Thinking Indicators */}
            {(isAnalyzingATS || isLoadingSuggestions || isSendingChat) && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-teal-400 flex items-center justify-center shrink-0 shadow-xs border border-slate-800">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 text-slate-600 rounded-2xl rounded-tl-xs p-3 text-xs flex items-center gap-2 border border-slate-200">
                  <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                  <span className="text-[11px]">
                    {isAnalyzingATS
                      ? 'Evaluating ATS Readiness...'
                      : isLoadingSuggestions
                      ? 'Generating bullet improvements...'
                      : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer: Composer Input (Always Visible) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Resume Buddy anything about your resume..."
                className="flex-1 text-xs px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                disabled={isSendingChat}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSendingChat}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-teal-400 rounded-lg disabled:opacity-40 transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-teal-400"
                title="Send Message"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1 text-[10px] text-slate-400 text-center">
              Resuvo • Resume Buddy
            </div>
          </div>
        </div>
      )}
    </>
  );
};
