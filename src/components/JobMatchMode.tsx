import React, { useState, useEffect } from 'react';
import { ResumeData } from '../types/resume';
import { JobMatchReport, JobSuggestion, MissingKeyword } from '../types/jobMatch';
import {
  analyzeJobMatch,
  SAMPLE_JOB_DESCRIPTIONS,
} from '../utils/jobMatchAnalyzer';
import {
  extractTextFromJobDescriptionFile,
  FileExtractionResult,
} from '../utils/fileTextExtractor';
import {
  Target,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Trash2,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plus,
  BookOpen,
  Briefcase,
  Layers,
  Award,
  Check,
  Info,
  Upload,
  FileText,
  FileUp,
  X,
  FileCheck,
} from 'lucide-react';

interface JobMatchModeProps {
  resumeData: ResumeData;
  onResumeChange: (updater: (prev: ResumeData) => ResumeData) => void;
  onNavigateSection: (sectionId: string) => void;
  className?: string;
}

export const JobMatchMode: React.FC<JobMatchModeProps> = ({
  resumeData,
  onResumeChange,
  onNavigateSection,
  className = '',
}) => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [report, setReport] = useState<JobMatchReport | null>(null);
  const [lastAnalyzedJd, setLastAnalyzedJd] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number | null>(null);

  // Two ways to supply a job description: 'paste' (direct text) or 'upload' (file selector)
  const [supplyMode, setSupplyMode] = useState<'paste' | 'upload'>('paste');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: 'txt' | 'docx' | 'pdf';
  } | null>(null);
  const [isExtractingFile, setIsExtractingFile] = useState<boolean>(false);
  const [fileExtractionSuccessMessage, setFileExtractionSuccessMessage] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Track timestamp of last analysis to detect if resume data changed since report was run
  const [lastAnalyzedResumeHash, setLastAnalyzedResumeHash] = useState<string>('');
  const [isReportOutdated, setIsReportOutdated] = useState<boolean>(false);

  // Filter for keywords
  const [keywordFilter, setKeywordFilter] = useState<'all' | 'technical' | 'tool' | 'domain' | 'qualification'>('all');

  // Modal / confirmation for safely adding missing skill
  const [skillToAdd, setSkillToAdd] = useState<string | null>(null);
  const [addedSkillsNotification, setAddedSkillsNotification] = useState<string | null>(null);

  // Calculate lightweight hash of resume content to detect edits
  const computeResumeHash = (data: ResumeData): string => {
    try {
      return JSON.stringify({
        t: data.personal.title,
        s: data.summary,
        sk: data.skillCategories.map((c) => c.skills.join(',')),
        p: data.projects.map((p) => p.name + p.techStack),
        e: data.experience.map((e) => e.role + e.company),
        ed: data.education.map((ed) => ed.degree),
      });
    } catch {
      return String(Date.now());
    }
  };

  // Check if current resume differs from when report was generated
  useEffect(() => {
    if (hasAnalyzed && report && lastAnalyzedResumeHash) {
      const currentHash = computeResumeHash(resumeData);
      setIsReportOutdated(currentHash !== lastAnalyzedResumeHash);
    }
  }, [resumeData, report, hasAnalyzed, lastAnalyzedResumeHash]);

  // Handle uploaded file extraction
  const handleProcessFile = async (file: File) => {
    if (!file) return;
    setIsExtractingFile(true);
    setErrorMessage(null);
    setFileExtractionSuccessMessage(null);

    try {
      const result: FileExtractionResult = await extractTextFromJobDescriptionFile(file);
      setIsExtractingFile(false);

      if (!result.success || !result.text) {
        setErrorMessage(result.error || 'Failed to extract text from the selected file.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Populate text area with extracted text so user can review and edit before analysis
      setJobDescription(result.text);
      setUploadedFile({
        name: result.fileName || file.name,
        size: result.fileSize || file.size,
        type: result.fileType || 'txt',
      });
      setSelectedSampleIndex(null);
      // Reset analysis so results do not appear automatically before user clicks Analyze
      setHasAnalyzed(false);
      setReport(null);
      setLastAnalyzedJd('');
      const wordCount = result.text.split(/\s+/).filter(Boolean).length;
      setFileExtractionSuccessMessage(
        `Successfully extracted ${wordCount} words from "${file.name}". You can review or edit the text below, then click "Analyze Job Match" to run analysis.`
      );
    } catch (err: any) {
      setIsExtractingFile(false);
      setErrorMessage(
        err?.message || 'An error occurred during file extraction. Please try pasting the text manually.'
      );
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileExtractionSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleRunAnalysis = (overrideJd?: string) => {
    const textToAnalyze = (overrideJd !== undefined ? overrideJd : jobDescription).trim();
    setErrorMessage(null);

    // Handle empty job descriptions with clear validation guidance
    if (!textToAnalyze) {
      setErrorMessage('Please enter or paste a job description, or select a Quick Sample above to analyze.');
      setReport(null);
      setHasAnalyzed(false);
      setLastAnalyzedJd('');
      return;
    }

    if (textToAnalyze.length < 30) {
      setErrorMessage('The job description is too short to analyze accurately. Please provide at least a few sentences describing the role requirements.');
      setReport(null);
      setHasAnalyzed(false);
      setLastAnalyzedJd('');
      return;
    }

    setIsAnalyzing(true);

    // Short timeout to provide smooth UI feedback
    setTimeout(() => {
      const result = analyzeJobMatch(textToAnalyze, resumeData);
      setIsAnalyzing(false);

      if (result.error) {
        setErrorMessage(result.error);
        setReport(null);
        setHasAnalyzed(false);
        setLastAnalyzedJd('');
      } else if (result.report) {
        setReport(result.report);
        setHasAnalyzed(true);
        setLastAnalyzedJd(textToAnalyze);
        setLastAnalyzedResumeHash(computeResumeHash(resumeData));
        setIsReportOutdated(false);
      }
    }, 250);
  };

  const handleLoadSample = (index: number) => {
    setSelectedSampleIndex(index);
    const sample = SAMPLE_JOB_DESCRIPTIONS[index];
    setJobDescription(sample.text);
    setUploadedFile(null);
    setFileExtractionSuccessMessage(null);
    setErrorMessage(null);
    // Strictly user-triggered: populate description field without auto-running analysis
    setHasAnalyzed(false);
    setReport(null);
    setLastAnalyzedJd('');
  };

  const handleClear = () => {
    setJobDescription('');
    setUploadedFile(null);
    setFileExtractionSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setReport(null);
    setHasAnalyzed(false);
    setLastAnalyzedJd('');
    setErrorMessage(null);
    setSelectedSampleIndex(null);
    setIsReportOutdated(false);
  };

  // Safe skill addition with user confirmation
  const handleConfirmAddSkill = (skill: string) => {
    onResumeChange((prev) => {
      const categories = [...prev.skillCategories];
      if (categories.length === 0) {
        categories.push({
          id: `cat-${Date.now()}`,
          name: 'Technical Skills',
          skills: [skill],
        });
      } else {
        // Try to add to first technical category or primary category
        const targetCategory = categories[0];
        if (!targetCategory.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
          targetCategory.skills = [...targetCategory.skills, skill];
        }
      }
      return { ...prev, skillCategories: categories };
    });

    setAddedSkillsNotification(`Added "${skill}" to Technical Skills in your resume.`);
    setSkillToAdd(null);
    setTimeout(() => setAddedSkillsNotification(null), 4000);
  };

  const filteredMatched = (hasAnalyzed && report) ? report.matchedKeywords.filter((k) =>
    keywordFilter === 'all' ? true : k.category === keywordFilter
  ) : [];

  const filteredMissing = (hasAnalyzed && report) ? report.missingKeywords.filter((k) =>
    keywordFilter === 'all' ? true : k.category === keywordFilter
  ) : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Job Match
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                  Keyword Alignment
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Paste any job description to evaluate keyword alignment, discover matched terms, and get safe tailoring suggestions.
              </p>
            </div>
          </div>

          {hasAnalyzed && report && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear & Start Over</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast for Safe Modifications */}
      {addedSkillsNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{addedSkillsNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigateSection('skills')}
            className="text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
          >
            View in Skills
          </button>
        </div>
      )}

      {/* Outdated Report Warning Banner */}
      {hasAnalyzed && report && isReportOutdated && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Resume updated:</strong> Your resume content changed since this match report was generated.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleRunAnalysis()}
            disabled={isAnalyzing}
            className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Re-Analyze Match
          </button>
        </div>
      )}

      {/* Input Section: Supply Job Description (Paste or Upload File) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Method Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSupplyMode('paste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                supplyMode === 'paste'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>Paste Job Description</span>
            </button>
            <button
              type="button"
              onClick={() => setSupplyMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                supplyMode === 'upload'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              <span>Upload JD File</span>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">
                .pdf, .docx, .txt
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>{jobDescription.split(/\s+/).filter(Boolean).length} words</span>
            <span>•</span>
            <span>{jobDescription.length} characters</span>
          </div>
        </div>

        {/* Hidden File Input for .pdf, .docx, .txt */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          className="hidden"
        />

        {/* Option 2: Upload File Drag & Drop Zone */}
        {supplyMode === 'upload' && !uploadedFile && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleProcessFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-teal-500 bg-teal-50/60'
                : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/70'
            }`}
          >
            {isExtractingFile ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
                <span className="text-xs font-bold text-slate-800">
                  Extracting readable text from document...
                </span>
                <span className="text-[11px] text-slate-500">
                  Parsing in-browser without sending your file to any server or AI service
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
                  <FileUp className="w-6 h-6 text-teal-600" />
                </div>
                <div className="text-xs font-bold text-slate-900">
                  Click to select or drag & drop a Job Description file
                </div>
                <div className="text-[11px] text-slate-600 max-w-sm">
                  Accepted file formats: <strong className="text-slate-800">PDF (.pdf)</strong>, <strong className="text-slate-800">Microsoft Word (.docx)</strong>, or <strong className="text-slate-800">Plain text (.txt)</strong>
                </div>
                <div className="text-[10px] text-slate-500 font-medium pt-1">
                  Maximum file size: <strong>10 MB</strong> • Extracted text will appear below for review
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active Uploaded File Card */}
        {uploadedFile && (
          <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0 shadow-2xs">
                {uploadedFile.type}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs truncate max-w-xs sm:max-w-md">
                    {uploadedFile.name}
                  </span>
                  <span className="text-[10px] text-teal-800 bg-white/80 px-1.5 py-0.2 rounded border border-teal-200 font-semibold">
                    {formatFileSize(uploadedFile.size)}
                  </span>
                </div>
                <span className="text-[11px] text-teal-800 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Text extracted into editable area below
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 hover:text-teal-950 bg-white hover:bg-teal-100 rounded border border-teal-300 transition-colors cursor-pointer"
              >
                Replace File
              </button>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Remove file reference"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Extraction Success Notice */}
        {fileExtractionSuccessMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{fileExtractionSuccessMessage}</span>
          </div>
        )}

        {/* Error message with actionable guidance */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold block">{errorMessage}</span>
              <span className="text-[11px] text-red-600 block">
                If your file is scanned or cannot be read, you can switch to <strong>Paste Job Description</strong> above and paste the text manually.
              </span>
            </div>
          </div>
        )}

        {/* Quick Sample JD Loaders */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
          <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
            <BookOpen className="w-3 h-3" /> Quick Samples:
          </span>
          {SAMPLE_JOB_DESCRIPTIONS.map((sample, idx) => (
            <button
              key={sample.title}
              type="button"
              onClick={() => handleLoadSample(idx)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                selectedSampleIndex === idx
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {sample.title}
            </button>
          ))}
        </div>

        {/* Editable Text Area (Always accessible so users can edit extracted or pasted text) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="job-description-input" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              {uploadedFile ? `Extracted Content from "${uploadedFile.name}" (Editable)` : 'Job Description Content (Editable)'}
            </label>
            {uploadedFile && (
              <span className="text-[10px] text-teal-700 font-medium">
                Feel free to edit or add missing details before analyzing
              </span>
            )}
          </div>
          <textarea
            id="job-description-input"
            value={jobDescription}
            onChange={(e) => {
              const val = e.target.value;
              setJobDescription(val);
              setSelectedSampleIndex(null);
              if (errorMessage) setErrorMessage(null);
              // When user edits the job description after analysis, hide previous results
              // so they are not misleadingly displayed for the edited content
              if (hasAnalyzed) {
                setHasAnalyzed(false);
                setReport(null);
                setLastAnalyzedJd('');
              }
            }}
            rows={7}
            placeholder="Paste your job description here, or upload a .pdf, .docx, or .txt file above to populate this editor..."
            className="w-full text-xs text-slate-800 p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono leading-relaxed"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Analysis runs locally in your browser. No data leaves your machine.</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {jobDescription && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRunAnalysis()}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyze Job Match
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* REPORT DISPLAY SECTION */}
      {hasAnalyzed && report && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Match Score Card & ATS Disclaimer */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-5">
                {/* Circular Percentage Dial */}
                <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={
                        report.matchPercentage >= 70
                          ? 'text-teal-500'
                          : report.matchPercentage >= 40
                          ? 'text-indigo-500'
                          : 'text-amber-500'
                      }
                      strokeDasharray={`${report.matchPercentage}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {report.matchPercentage}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                      Match
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Estimated Keyword Match
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluated against {report.totalJobKeywordsCount} identified role requirements and technical terms.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ {report.matchedCount} Matched Terms
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      ✗ {report.missingCount} Missing Terms
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500">
                      Last analyzed at {report.analyzedAt}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status pill */}
              <div className="shrink-0">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    report.matchPercentage >= 70
                      ? 'bg-teal-50 text-teal-800 border-teal-200'
                      : report.matchPercentage >= 40
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {report.matchPercentage >= 70
                    ? 'Strong Alignment'
                    : report.matchPercentage >= 40
                    ? 'Moderate Alignment'
                    : 'Growth Opportunity'}
                </span>
              </div>
            </div>

            {/* MANDATORY DISCLAIMER NOTICE (Clear, prominent, non-misleading) */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-1.5">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <p className="font-semibold text-slate-800">
                    Important Notice: Basic Keyword-Match Estimate
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    This match percentage is a basic keyword-match estimate, <strong>NOT</strong> an official ATS score or a prediction of getting an interview. It measures how many identifiable technical terms, tools, and requirements from this specific job description appear in your resume text.
                  </p>
                  <p className="text-slate-500 mt-1">
                    <em>A missing keyword does not necessarily mean you lack that skill</em>; it may simply be absent from your resume text or described using different terminology.
                  </p>
                </div>
              </div>
            </div>

            {/* Identifiable Experience & Education Requirements in JD */}
            {(report.experienceRequirements.length > 0 || report.educationRequirements.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                {report.experienceRequirements.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-500" /> Experience Mentioned in JD:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {report.experienceRequirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.educationRequirements.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-slate-500" /> Education Mentioned in JD:
                    </span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                      {report.educationRequirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Keyword Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Filter Terms:</span>
            {[
              { id: 'all', label: 'All Keywords' },
              { id: 'technical', label: 'Technical & Frameworks' },
              { id: 'tool', label: 'Tools & DevOps' },
              { id: 'domain', label: 'Concepts & Architecture' },
              { id: 'qualification', label: 'Qualifications' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setKeywordFilter(f.id as any)}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  keywordFilter === f.id
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Two-Column Grid: Matched Keywords vs Missing Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Matched Keywords Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Matched Keywords ({filteredMatched.length})
                </h4>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Present in Resume
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                These terms from the job description are already present in your resume content.
              </p>

              {filteredMatched.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                  No matching keywords in this category.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {filteredMatched.map((k) => (
                    <div
                      key={k.term}
                      className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 text-xs shadow-2xs hover:bg-emerald-100 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">{k.term}</span>
                      <span className="text-[10px] text-emerald-700 bg-white/70 px-1 py-0.2 rounded border border-emerald-200">
                        {k.foundInSections.join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Missing Keywords Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Missing Keywords ({filteredMissing.length})
                </h4>
                <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Not Detected
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Found in the job posting but not detected in your resume text. Add only if you have relevant experience.
              </p>

              {filteredMissing.length === 0 ? (
                <div className="p-4 bg-emerald-50 rounded-lg text-center text-xs text-emerald-800 font-medium">
                  🎉 Outstanding! All identified keywords in this filter are represented in your resume.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 pt-1">
                  {filteredMissing.map((k) => (
                    <div
                      key={k.term}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      <span className="font-medium">{k.term}</span>
                      {k.importance === 'high' && (
                        <span className="text-[9px] font-bold text-amber-700 bg-amber-100/70 px-1 py-0.2 rounded">
                          High Priority
                        </span>
                      )}
                      {k.category === 'technical' && (
                        <button
                          type="button"
                          onClick={() => setSkillToAdd(k.term)}
                          className="ml-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-200 transition-colors cursor-pointer flex items-center gap-0.5"
                          title={`Add "${k.term}" to Technical Skills`}
                        >
                          <Plus className="w-2.5 h-2.5" /> Add
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Relevant Resume Sections Breakdown */}
          {report.relevantSections.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Relevant Resume Sections
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sections in your resume that specifically match requirements in the target job description.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {report.relevantSections.map((sec) => (
                  <div
                    key={sec.sectionId}
                    className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">
                        {sec.sectionTitle}
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigateSection(sec.sectionId)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                      >
                        Edit in Form <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {sec.matchingItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-slate-200/80">
                          <div className="font-semibold text-slate-700 text-[11px] truncate">
                            {item.title}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.matchedKeywords.map((mk) => (
                              <span
                                key={mk}
                                className="text-[10px] font-medium bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded border border-teal-200"
                              >
                                {mk}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Suggestions & Safe Tailoring Guidance */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Actionable Recommendations & Safe Tailoring
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Practical suggestions derived exclusively from your actual resume and the target role. No fake qualifications or arbitrary changes.
              </p>
            </div>

            <div className="space-y-3">
              {report.suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          sug.type === 'emphasize-project'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : sug.type === 'add-skill'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                      >
                        {sug.type === 'emphasize-project'
                          ? 'Highlight Project'
                          : sug.type === 'add-skill'
                          ? 'Skill Consideration'
                          : 'Resume Alignment'}
                      </span>
                      <h5 className="font-bold text-xs text-slate-900">{sug.title}</h5>
                    </div>

                    <div className="flex items-center gap-2">
                      {sug.suggestedAction?.type === 'add-skill' && (
                        <button
                          type="button"
                          onClick={() => setSkillToAdd(sug.suggestedAction!.skillName)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          Add to Skills
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onNavigateSection(sug.targetSection)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        Edit Section <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sug.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Safe Skill Addition */}
      {skillToAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Add Skill to Resume?</h3>
                <p className="text-xs text-slate-500">Explicit confirmation required</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Do you want to add <strong>"{skillToAdd}"</strong> to your Technical Skills section?
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800">
              ⚠️ <strong>Safe tailoring principle:</strong> Only add skills you actually have knowledge of or experience with. Resuvo will never invent or alter qualifications without your explicit consent.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSkillToAdd(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAddSkill(skillToAdd)}
                className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Yes, Add to Skills
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
