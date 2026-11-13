import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, ResumeSettings, ResumeTemplateId, ResumeFont, ResumeSpacing } from './types/resume';
import { initialResumeData, initialResumeSettings } from './data/initialData';
import { ResumeForm } from './components/ResumeForm';
import { ResumePreview } from './components/ResumePreview';
import { SaveAsDropdown } from './components/SaveAsDropdown';
import { JobMatchMode } from './components/JobMatchMode';
import { ResuvoLogo } from './components/ResuvoLogo';
import { ResumeBuddy } from './components/ResumeBuddy';
import { DesignStudio, TEMPLATES } from './components/DesignStudio';
import { TemplateChooserModal } from './components/TemplateChooserModal';
import { TEMPLATE_SHOWCASE_CONFIGS } from './data/templateSamples';
import { WelcomeIllustration } from './components/WelcomeIllustration';
import { downloadResumeDocx } from './utils/docxExport';
import {
  FileText,
  Printer,
  Download,
  Upload,
  RotateCcw,
  Palette,
  Eye,
  Edit3,
  Server,
  ExternalLink,
  X,
  AlertCircle,
  Layout,
  CheckCircle2,
  Trash2,
  FileCheck,
  ChevronDown,
  Check,
  Target,
  Briefcase,
  Sun,
  Moon,
  Monitor,
  ArrowLeft,
  ArrowRight,
  Plus,
} from 'lucide-react';

const STORAGE_RESUME_KEY = 'resume_builder_draft_data';
const STORAGE_TEMPLATE_KEY = 'resume_builder_draft_template';
const STORAGE_SETTINGS_KEY = 'resume_builder_draft_settings';
const STORAGE_THEME_KEY = 'resuvo_app_theme';
const STORAGE_USER_DRAFT_KEY = 'resuvo_user_saved_draft';
const STORAGE_IS_SAMPLE_KEY = 'resuvo_is_sample_active';

const loadInitialUserDraft = (): ResumeData | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_USER_DRAFT_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.personal) {
        return parsed as ResumeData;
      }
    }
  } catch (e) {
    console.warn('Unable to load user draft backup from localStorage:', e);
  }
  return null;
};

export type AppTheme = 'system' | 'light' | 'dark';

// Safe localStorage loader for application theme
const loadInitialAppTheme = (): AppTheme => {
  if (typeof window === 'undefined') return 'system';
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'system' || saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.warn('Unable to load app theme from localStorage:', e);
  }
  return 'system';
};

// Safe localStorage loader for resume draft
const loadInitialResumeData = (): ResumeData => {
  if (typeof window === 'undefined') return initialResumeData;
  try {
    const saved = localStorage.getItem(STORAGE_RESUME_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.personal && Array.isArray(parsed.experience)) {
        if (parsed.declaration) {
          if (parsed.declaration.signatureType === 'typed') {
            parsed.declaration.signatureType = 'draw';
          }
        }
        return parsed as ResumeData;
      }
    }
  } catch (e) {
    console.warn('Unable to load resume draft from localStorage:', e);
  }
  return initialResumeData;
};

const VALID_TEMPLATES = Object.keys(TEMPLATE_SHOWCASE_CONFIGS) as ResumeTemplateId[];

// Safe localStorage loader for template
const loadInitialTemplate = (): ResumeTemplateId => {
  if (typeof window === 'undefined') return 'academic';
  try {
    const saved = localStorage.getItem(STORAGE_TEMPLATE_KEY) as ResumeTemplateId;
    if (saved && VALID_TEMPLATES.includes(saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('Unable to load template from localStorage:', e);
  }
  return 'academic';
};

// Safe localStorage loader for settings
const loadInitialSettings = (): ResumeSettings => {
  if (typeof window === 'undefined') return initialResumeSettings;
  try {
    const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return {
          ...initialResumeSettings,
          ...parsed,
          typography: {
            ...initialResumeSettings.typography,
            ...(parsed.typography || {}),
            formatting: {
              ...initialResumeSettings.typography?.formatting,
              ...((parsed.typography && parsed.typography.formatting) || {}),
            },
          },
          layout: {
            ...initialResumeSettings.layout,
            ...(parsed.layout || {}),
          },
        };
      }
    }
  } catch (e) {
    console.warn('Unable to load settings from localStorage:', e);
  }
  return initialResumeSettings;
};

// JSON Schema Validator and Normalizer for imported files
const validateAndNormalizeResumeJSON = (
  raw: any
): { valid: boolean; data?: ResumeData; template?: ResumeTemplateId; error?: string } => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { valid: false, error: 'The selected file is not a valid JSON object.' };
  }

  // Handle both direct ResumeData export and nested { data: ResumeData } export
  const candidate = raw.personal ? raw : raw.data && raw.data.personal ? raw.data : null;

  if (!candidate || typeof candidate !== 'object') {
    return {
      valid: false,
      error: 'Incompatible resume format. Required "personal" details section was not found.',
    };
  }

  const { personal, summary, experience, education, skillCategories, projects, certifications, customSections, declaration } =
    candidate;

  if (!personal || typeof personal !== 'object') {
    return { valid: false, error: 'Invalid "personal" information block in JSON file.' };
  }

  // Construct normalized ResumeData ensuring no undefined fields cause rendering bugs
  const normalizedData: ResumeData = {
    personal: {
      fullName: String(personal.fullName || ''),
      title: String(personal.title || ''),
      email: String(personal.email || ''),
      phone: String(personal.phone || ''),
      location: String(personal.location || ''),
      website: personal.website ? String(personal.website) : '',
      linkedin: personal.linkedin ? String(personal.linkedin) : '',
      github: personal.github ? String(personal.github) : '',
      photo: personal.photo ? String(personal.photo) : undefined,
      fatherName: personal.fatherName ? String(personal.fatherName) : '',
      dob: personal.dob ? String(personal.dob) : '',
      gender: personal.gender ? String(personal.gender) : '',
      maritalStatus: personal.maritalStatus ? String(personal.maritalStatus) : '',
      nationality: personal.nationality ? String(personal.nationality) : '',
      languages: personal.languages ? String(personal.languages) : '',
      permanentAddress: personal.permanentAddress ? String(personal.permanentAddress) : '',
    },
    summary: typeof summary === 'string' ? summary : '',
    experience: Array.isArray(experience)
      ? experience.map((exp: any, i: number) => ({
          id: exp.id || `exp-${Date.now()}-${i}`,
          role: String(exp.role || ''),
          company: String(exp.company || ''),
          location: String(exp.location || ''),
          startDate: String(exp.startDate || ''),
          endDate: String(exp.endDate || ''),
          current: Boolean(exp.current),
          highlights: Array.isArray(exp.highlights) ? exp.highlights.map(String) : [],
        }))
      : [],
    education: Array.isArray(education)
      ? education.map((edu: any, i: number) => ({
          id: edu.id || `edu-${Date.now()}-${i}`,
          degree: String(edu.degree || ''),
          institution: String(edu.institution || ''),
          location: String(edu.location || ''),
          startDate: String(edu.startDate || ''),
          endDate: String(edu.endDate || ''),
          current: Boolean(edu.current),
          gpa: edu.gpa ? String(edu.gpa) : '',
          highlights: Array.isArray(edu.highlights) ? edu.highlights.map(String) : [],
        }))
      : [],
    skillCategories: Array.isArray(skillCategories)
      ? skillCategories.map((cat: any, i: number) => ({
          id: cat.id || `cat-${Date.now()}-${i}`,
          name: String(cat.name || 'Skills'),
          skills: Array.isArray(cat.skills) ? cat.skills.map(String) : [],
        }))
      : [],
    projects: Array.isArray(projects)
      ? projects.map((p: any, i: number) => ({
          id: p.id || `proj-${Date.now()}-${i}`,
          name: String(p.name || ''),
          techStack: String(p.techStack || ''),
          link: p.link ? String(p.link) : '',
          githubUrl: p.githubUrl ? String(p.githubUrl) : '',
          description: String(p.description || ''),
          highlights: Array.isArray(p.highlights) ? p.highlights.map(String) : [],
        }))
      : [],
    certifications: Array.isArray(certifications)
      ? certifications.map((c: any, i: number) => ({
          id: c.id || `cert-${Date.now()}-${i}`,
          name: String(c.name || ''),
          issuer: String(c.issuer || ''),
          date: String(c.date || ''),
          url: c.url ? String(c.url) : '',
          fileName: c.fileName ? String(c.fileName) : undefined,
          fileData: c.fileData ? String(c.fileData) : undefined,
          fileType: c.fileType ? String(c.fileType) : undefined,
          fileSize: typeof c.fileSize === 'number' ? c.fileSize : undefined,
        }))
      : [],
    customSections: Array.isArray(customSections)
      ? customSections.map((sec: any, i: number) => ({
          id: sec.id || `sec-${Date.now()}-${i}`,
          title: String(sec.title || ''),
          items: Array.isArray(sec.items)
            ? sec.items.map((item: any, j: number) => ({
                id: item.id || `item-${Date.now()}-${j}`,
                title: String(item.title || ''),
                subtitle: item.subtitle ? String(item.subtitle) : '',
                date: item.date ? String(item.date) : '',
                description: item.description ? String(item.description) : '',
              }))
            : [],
        }))
      : [],
    declaration: declaration && typeof declaration === 'object'
      ? {
          enabled: Boolean(declaration.enabled ?? true),
          text: typeof declaration.text === 'string' ? declaration.text : 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
          place: String(declaration.place || ''),
          date: String(declaration.date || ''),
          signatureType:
            declaration.signatureType === 'upload'
              ? 'upload'
              : declaration.signatureType === 'none'
              ? 'none'
              : 'draw',
          signatureImage: declaration.signatureImage ? String(declaration.signatureImage) : undefined,
          signerName: declaration.signerName ? String(declaration.signerName) : '',
        }
      : {
          enabled: true,
          text: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
          place: String(personal.location || ''),
          date: new Date().toISOString().split('T')[0],
          signatureType: 'draw',
          signatureImage: undefined,
          signerName: String(personal.fullName || ''),
        },
  };

  // Inspect if the file explicitly specifies a compatible template
  let detectedTemplate: ResumeTemplateId | undefined;
  const rawTemplate = (raw.template || (raw.settings && raw.settings.template)) as ResumeTemplateId;
  if (VALID_TEMPLATES.includes(rawTemplate)) {
    detectedTemplate = rawTemplate;
  }

  return { valid: true, data: normalizedData, template: detectedTemplate };
};

export type WorkspaceTab = 'home' | 'edit' | 'job-match' | 'preview' | 'draft';

export const App: React.FC = () => {
  const [data, setData] = useState<ResumeData>(loadInitialResumeData);
  const [template, setTemplate] = useState<ResumeTemplateId>(loadInitialTemplate);
  const [settings, setSettings] = useState<ResumeSettings>(loadInitialSettings);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [showLoadSampleModal, setShowLoadSampleModal] = useState<boolean>(false);
  const [userSavedDraft, setUserSavedDraft] = useState<ResumeData | null>(loadInitialUserDraft);
  const [isSampleActive, setIsSampleActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('resuvo_is_sample_active') === 'true';
  });
  const [storageQuotaWarning, setStorageQuotaWarning] = useState<string | null>(null);

  // App Appearance Theme State: 'system' | 'light' | 'dark'
  const [appTheme, setAppTheme] = useState<AppTheme>(loadInitialAppTheme);
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState<boolean>(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  // JSON Import States
  const [pendingImport, setPendingImport] = useState<{
    data: ResumeData;
    template?: ResumeTemplateId;
    fileName: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Word Document (.docx) Export States
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);
  const [docxSuccessMsg, setDocxSuccessMsg] = useState<string | null>(null);
  const [docxErrorMsg, setDocxErrorMsg] = useState<string | null>(null);

  // Active form section for programmatic navigation (empty string shows the initial Welcome screen)
  const [activeFormSection, setActiveFormSection] = useState<string>('');

  // Primary navigation: exactly five options in order: 'edit' | 'job-match' | 'preview' | 'draft' | 'design-studio'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>('edit');
  const [templateModalMode, setTemplateModalMode] = useState<'new-resume' | 'switch-template' | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('resuvo_last_saved_time') || 'Just now';
    }
    return 'Just now';
  });

  // Check whether user currently has any saved draft content
  const hasSavedDraft = Boolean(
    (data.personal.fullName && data.personal.fullName.trim()) ||
    (data.personal.title && data.personal.title.trim()) ||
    data.experience.length > 0 ||
    data.education.length > 0 ||
    data.skillCategories.length > 0 ||
    (data.summary && data.summary.trim())
  );

  // Navigate back to the Home screen with automatic draft persistence
  const handleBackToHome = () => {
    try {
      localStorage.setItem(STORAGE_RESUME_KEY, JSON.stringify(data));
      localStorage.setItem(STORAGE_TEMPLATE_KEY, template);
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Autosave before Home navigation failed:', e);
    }
    setActiveWorkspaceTab('home');
  };

  const handleNavigateSection = (sectionId: string) => {
    setActiveWorkspaceTab('edit');
    setActiveFormSection(sectionId);
    // Scroll editor into view smoothly
    setTimeout(() => {
      const el = document.getElementById(`form-section-${sectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 50);
  };

  // Close theme dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to OS appearance preference changes when in 'system' mode
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemPreference = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemIsDark(e.matches);
    };
    updateSystemPreference(mediaQuery);

    try {
      mediaQuery.addEventListener('change', updateSystemPreference);
      return () => mediaQuery.removeEventListener('change', updateSystemPreference);
    } catch {
      mediaQuery.addListener(updateSystemPreference);
      return () => mediaQuery.removeListener(updateSystemPreference);
    }
  }, []);

  // Compute effective dark mode: if system, follow OS preference; otherwise follow explicit choice
  const effectiveIsDark = appTheme === 'system' ? systemIsDark : appTheme === 'dark';

  // Apply dark mode class to html documentElement and persist choice in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, appTheme);
    } catch (e) {
      console.warn('Failed to save theme preference to localStorage:', e);
    }

    if (effectiveIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appTheme, effectiveIsDark]);

  // Detect whether app is running inside an iframe
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  // Persist resume data automatically whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RESUME_KEY, JSON.stringify(data));
      // Only update userSavedDraft if sample is NOT active, preserving user's original draft
      if (!isSampleActive) {
        localStorage.setItem(STORAGE_USER_DRAFT_KEY, JSON.stringify(data));
        setUserSavedDraft(data);
      }
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('resuvo_last_saved_time', nowStr);
      setLastSavedTime(nowStr);
      setStorageQuotaWarning(null);
    } catch (e: any) {
      console.warn('LocalStorage quota limit reached or write failed:', e);
      setStorageQuotaWarning(
        'Browser storage quota reached (typically 5MB limit) due to attached certificate files. Your current resume in memory is intact, but to ensure attached certificates are never lost on reload, please click "Export JSON" to save a full backup.'
      );
    }
  }, [data, isSampleActive]);

  // Persist template choice
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEMPLATE_KEY, template);
    } catch (e) {
      console.warn('Failed to persist template to localStorage:', e);
    }
  }, [template]);

  // Persist styling settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to persist settings to localStorage:', e);
    }
  }, [settings]);

  // Auto-trigger print if ?print=true parameter is present in a standalone tab
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('print') === 'true') {
      const timer = setTimeout(() => {
        window.focus();
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Explicit template selection handler
  const handleSelectTemplate = (selectedId: ResumeTemplateId, overrideColor?: string) => {
    const templateCfg = TEMPLATE_SHOWCASE_CONFIGS[selectedId];
    setTemplate(selectedId);
    setSettings((prev) => ({
      ...prev,
      template: selectedId,
      primaryColor: overrideColor || prev.primaryColor,
      fontFamily: templateCfg?.baseFont || 'sans',
      typography: prev.typography
        ? {
            ...prev.typography,
            fontFamily: templateCfg?.fontFamily || prev.typography.fontFamily,
          }
        : undefined,
    }));
  };

  // Browser Print / Save to PDF
  const handlePrint = () => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.warn('Direct window.print() call failed or blocked by iframe environment:', err);
    }

    if (isInIframe) {
      setShowPrintModal(true);
    }
  };

  // Word Document (.docx) Export
  const handleSaveDocx = async () => {
    try {
      setIsGeneratingDocx(true);
      setDocxErrorMsg(null);
      const fileName = await downloadResumeDocx(data, settings);
      setDocxSuccessMsg(`Successfully generated "${fileName}"`);
      setTimeout(() => setDocxSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Failed to generate Word document:', err);
      setDocxErrorMsg('Failed to generate Word document. Please try again.');
      setTimeout(() => setDocxErrorMsg(null), 5000);
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // Functional JSON export
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.personal.fullName || 'resume').toLowerCase().replace(/\s+/g, '_')}_resume.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Trigger file selection for JSON import
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process chosen JSON file
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        const validation = validateAndNormalizeResumeJSON(parsed);
        if (!validation.valid || !validation.data) {
          setImportError(validation.error || 'The file could not be parsed as a valid resume.');
          return;
        }

        // Check whether current resume has existing user data
        const hasCurrentData = Boolean(
          data.personal.fullName.trim() ||
            data.experience.length > 0 ||
            data.education.length > 0 ||
            data.projects.length > 0
        );

        if (hasCurrentData) {
          // Ask for confirmation before replacing current data
          setPendingImport({
            data: validation.data,
            template: validation.template,
            fileName: file.name,
          });
        } else {
          // Empty resume: apply directly without prompting
          applyImportedData(validation.data, validation.template);
        }
      } catch (err) {
        setImportError('The selected file contains invalid JSON syntax and cannot be imported.');
      }
    };

    reader.onerror = () => {
      setImportError('An error occurred while reading the file from your computer.');
    };

    reader.readAsText(file);
  };

  // Apply validated imported data
  const applyImportedData = (importedData: ResumeData, importedTemplate?: ResumeTemplateId) => {
    setData(importedData);
    if (importedTemplate) {
      setTemplate(importedTemplate);
      try {
        localStorage.setItem(STORAGE_TEMPLATE_KEY, importedTemplate);
      } catch (e) {
        console.warn('Failed to update template storage:', e);
      }
    }
    try {
      localStorage.setItem(STORAGE_RESUME_KEY, JSON.stringify(importedData));
    } catch (e) {
      console.warn('Failed to update resume storage:', e);
    }
    setPendingImport(null);
  };

  // Confirm replacement modal action
  const handleConfirmImport = () => {
    if (pendingImport) {
      applyImportedData(pendingImport.data, pendingImport.template);
    }
  };

  // Load Sample Click: ask for confirmation if editor already has data
  const handleLoadSampleClick = () => {
    // If the editor already contains information and it's not already in sample mode, prompt for confirmation
    if (hasSavedDraft && !isSampleActive) {
      setShowLoadSampleModal(true);
    } else {
      handleConfirmLoadSample();
    }
  };

  const handleConfirmLoadSample = () => {
    // 1. If user had a real draft and sample wasn't already active, safely preserve user's draft
    if (!isSampleActive && hasSavedDraft) {
      setUserSavedDraft(data);
      try {
        localStorage.setItem(STORAGE_USER_DRAFT_KEY, JSON.stringify(data));
        localStorage.setItem('resuvo_user_saved_template', template);
        localStorage.setItem('resuvo_user_saved_settings', JSON.stringify(settings));
      } catch (e) {
        console.warn('Failed to preserve user draft before loading sample:', e);
      }
    }

    // 2. Populate complete sample information across all sections
    setData(initialResumeData);
    setTemplate('modern');
    setSettings(initialResumeSettings);
    setIsSampleActive(true);
    try {
      localStorage.setItem(STORAGE_IS_SAMPLE_KEY, 'true');
      localStorage.setItem(STORAGE_RESUME_KEY, JSON.stringify(initialResumeData));
      localStorage.setItem(STORAGE_TEMPLATE_KEY, 'modern');
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(initialResumeSettings));
    } catch (e) {
      console.warn('Failed to store sample in localStorage:', e);
    }

    // 3. Immediately switch to edit view and display the populated sample in editor and preview
    setActiveWorkspaceTab('edit');
    setActiveFormSection('');
    setShowLoadSampleModal(false);
  };

  // Restore user's original saved draft from backup
  const handleRestoreUserDraft = () => {
    if (userSavedDraft) {
      setData(userSavedDraft);
      setIsSampleActive(false);
      try {
        localStorage.removeItem(STORAGE_IS_SAMPLE_KEY);
        localStorage.setItem(STORAGE_RESUME_KEY, JSON.stringify(userSavedDraft));
        const savedTpl = localStorage.getItem('resuvo_user_saved_template') as ResumeTemplateId;
        if (savedTpl && VALID_TEMPLATES.includes(savedTpl)) {
          setTemplate(savedTpl);
          localStorage.setItem(STORAGE_TEMPLATE_KEY, savedTpl);
        }
      } catch (e) {
        console.warn('Failed to restore user draft:', e);
      }
      setActiveWorkspaceTab('edit');
    }
  };

  // Clear data after user confirmation
  const handleConfirmClear = () => {
    const emptyData: ResumeData = {
      personal: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        photo: '',
        fatherName: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        nationality: '',
        languages: '',
        permanentAddress: '',
      },
      summary: '',
      experience: [],
      education: [],
      skillCategories: [],
      projects: [],
      certifications: [],
      customSections: [],
      declaration: {
        enabled: true,
        text: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
        place: '',
        date: new Date().toISOString().split('T')[0],
        signatureType: 'draw',
        signatureImage: undefined,
        signerName: '',
      },
    };
    setData(emptyData);
    setIsSampleActive(false);
    try {
      localStorage.removeItem(STORAGE_IS_SAMPLE_KEY);
      localStorage.setItem(STORAGE_RESUME_KEY, JSON.stringify(emptyData));
    } catch (e) {
      console.warn('Failed to update localStorage after clearing draft:', e);
    }
    setShowClearModal(false);
  };

  // Create New Resume handlers: always opens multi-template chooser modal
  const handleCreateNewResumeClick = () => {
    setTemplateModalMode('new-resume');
  };

  const handleConfirmCreateNew = (chosenTemplate?: ResumeTemplateId, chosenColor?: string) => {
    const emptyData: ResumeData = {
      personal: {
        fullName: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        website: '',
        linkedin: '',
        github: '',
        photo: '',
        fatherName: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        nationality: '',
        languages: '',
        permanentAddress: '',
      },
      summary: '',
      experience: [],
      education: [],
      skillCategories: [],
      projects: [],
      certifications: [],
      customSections: [],
      declaration: {
        enabled: true,
        text: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
        place: '',
        date: new Date().toISOString().split('T')[0],
        signatureType: 'draw',
        signatureImage: undefined,
        signerName: '',
      },
    };
    setData(emptyData);
    setIsSampleActive(false);
    if (chosenTemplate) {
      handleSelectTemplate(chosenTemplate, chosenColor);
    } else if (chosenColor) {
      setSettings((prev) => ({ ...prev, primaryColor: chosenColor }));
    }
    setActiveFormSection('personal');
    setActiveWorkspaceTab('edit');
    setTemplateModalMode(null);
    try {
      localStorage.removeItem(STORAGE_IS_SAMPLE_KEY);
      localStorage.setItem(STORAGE_RESUME_KEY, JSON.stringify(emptyData));
    } catch (e) {
      console.warn('Failed to update localStorage with new draft:', e);
    }
  };

  const handleApplyChosenTemplate = (chosenTemplate: ResumeTemplateId, chosenColor: string) => {
    handleSelectTemplate(chosenTemplate, chosenColor);
    setTemplateModalMode(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 transition-colors">
      {/* Hidden file input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json,application/json"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Top Application Navigation (Hidden during print) */}
      <header className="no-print bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Project Title: Clicking returns to Resuvo Home with autosave */}
          <button
            type="button"
            onClick={handleBackToHome}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Resuvo Home"
          >
            <ResuvoLogo size={38} className="shrink-0 transition-transform group-hover:scale-105" />
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                  Resuvo
                </h1>
                <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Build a better resume. Move closer to your next opportunity.
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Auto-saved draft
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium border border-emerald-200 dark:border-emerald-800">
                  <Server className="w-3 h-3" /> backend/main.py preserved
                </span>
              </div>
            </div>
          </button>

          {/* Top Toolbar Action buttons: Themes, Import, Export, Save As (Design Studio moved to navigation row) */}
          <div className="flex items-center gap-2">
            {/* Top Toolbar Theme Control (System Default, Light, Dark) */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                title="Themes: Application Appearance (System Default, Light, Dark)"
                aria-haspopup="listbox"
                aria-expanded={isThemeDropdownOpen}
              >
                {appTheme === 'dark' ? (
                  <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                ) : appTheme === 'light' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                ) : (
                  <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                )}
                <span>Themes</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isThemeDropdownOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                    Application Appearance
                  </div>
                  {[
                    { id: 'system' as AppTheme, label: 'System Default', icon: Monitor, hint: 'Follows OS preference' },
                    { id: 'light' as AppTheme, label: 'Light', icon: Sun, hint: 'Crisp light background' },
                    { id: 'dark' as AppTheme, label: 'Dark', icon: Moon, hint: 'Comfortable dark theme' },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = appTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setAppTheme(t.id);
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                          <div>
                            <div>{t.label}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{t.hint}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Import JSON button */}
            <button
              type="button"
              onClick={handleImportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
              title="Import a previously exported JSON resume file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </button>

            {/* Export JSON button */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md text-xs font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
              title="Download your resume data as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Save As Dropdown (replaces standalone Print / PDF button) */}
            <SaveAsDropdown
              onSavePdf={handlePrint}
              onSaveDocx={handleSaveDocx}
              isGeneratingDocx={isGeneratingDocx}
            />
          </div>
        </div>

        {/* Storage Quota Warning Banner */}
        {storageQuotaWarning && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-t border-b border-amber-200 dark:border-amber-800 px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{storageQuotaWarning}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Export JSON Now
                </button>
                <button
                  type="button"
                  onClick={() => setStorageQuotaWarning(null)}
                  className="text-amber-700 hover:text-amber-900 font-bold p-1 cursor-pointer"
                  title="Dismiss notice"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Navigation & Quick Actions Bar */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 px-4 py-2 relative z-30">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Exactly Five Primary Navigation Options: 1. Edit -> 2. Job Match -> 3. Preview -> 4. My Draft -> 5. Design Studio */}
            <nav
              aria-label="Primary Navigation"
              className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl text-xs font-semibold gap-1 overflow-visible"
            >
              {/* 1. Edit */}
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('edit')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeWorkspaceTab === 'edit'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Edit Resume"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Edit</span>
              </button>

              {/* 2. Job Match */}
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('job-match')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeWorkspaceTab === 'job-match'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Job Match & ATS Optimization"
              >
                <Target className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Job Match</span>
              </button>

              {/* 3. Preview */}
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('preview')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeWorkspaceTab === 'preview'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Document Preview"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Preview</span>
              </button>

              {/* 4. My Draft */}
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('draft')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeWorkspaceTab === 'draft'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="My Saved Draft"
              >
                <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>My Draft</span>
              </button>

              {/* 5. Design Studio */}
              <DesignStudio
                template={template}
                onSelectTemplate={handleSelectTemplate}
                settings={settings}
                onUpdateSettings={setSettings}
                variant="nav"
              />
            </nav>

            {/* Sample & Reset Controls */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleLoadSampleClick}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded border border-slate-200 dark:border-slate-700 cursor-pointer shadow-2xs"
                title="Load complete sample resume profile"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Load Sample</span>
              </button>
              <button
                type="button"
                onClick={() => setShowClearModal(true)}
                className="text-[11px] font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400 px-2 py-1 cursor-pointer transition-colors"
                title="Clear current resume data"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace (Single focused view replacing side-by-side split screen) */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {/* 0. HOME VIEW */}
        {activeWorkspaceTab === 'home' && (
          <div className="no-print space-y-6 max-w-2xl mx-auto py-6 sm:py-10 animate-in fade-in duration-150">
            {/* Clean Welcome Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 text-center relative overflow-hidden">
              <div className="w-48 sm:w-56 max-w-full h-auto mx-auto mb-4 flex items-center justify-center">
                <WelcomeIllustration className="w-full h-auto max-h-48" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
                <span>Welcome to Resuvo</span>
                <span className="text-amber-500">✨</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
                Build a professional resume that represents your skills, experience and achievements.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {/* Continue Editing Option (when saved draft exists) */}
                {hasSavedDraft ? (
                  <button
                    type="button"
                    onClick={() => setActiveWorkspaceTab('edit')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer text-sm"
                  >
                    <span>Continue Editing Draft</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLoadSampleClick}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer text-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Load Sample Profile</span>
                  </button>
                )}

                {/* Create New Resume Option */}
                <button
                  type="button"
                  onClick={handleCreateNewResumeClick}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Resume</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. MY DRAFT VIEW */}
        {activeWorkspaceTab === 'draft' && (() => {
          const isViewingPreservedDraft = isSampleActive && Boolean(userSavedDraft);
          const displayedDraft = isViewingPreservedDraft ? userSavedDraft! : data;

          return (
            <div className="no-print space-y-4 max-w-2xl mx-auto py-4 sm:py-6 animate-in fade-in duration-150">
              {isViewingPreservedDraft && (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs text-indigo-950 dark:text-indigo-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <strong className="block text-indigo-900 dark:text-indigo-100">Sample active in editor & preview</strong>
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300">
                        Your original draft is safely preserved below and was not overwritten.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRestoreUserDraft}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore My Original Draft</span>
                  </button>
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          {isViewingPreservedDraft ? 'Your Preserved Draft' : 'Saved Resume Draft'}
                        </span>
                        <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Auto-Saved
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                        {displayedDraft.personal.fullName || 'Untitled Candidate'}
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={isViewingPreservedDraft ? handleRestoreUserDraft : () => setActiveWorkspaceTab('edit')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isViewingPreservedDraft ? 'Restore & Continue Editing' : 'Continue Editing'}</span>
                  </button>
                </div>

                {/* Draft Meta Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Candidate & Target Role</span>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{displayedDraft.personal.fullName || 'Not specified yet'}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{displayedDraft.personal.title || 'No role title specified'}</div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Storage & Last Edited</span>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Saved in browser localStorage</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Last updated: {lastSavedTime}</div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Active Template</span>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{TEMPLATES.find((t) => t.id === template)?.name || 'Academic'}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Font: {settings.typography?.fontFamily || 'Inter'}</div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Section Contents</span>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {displayedDraft.experience.length} experiences • {displayedDraft.education.length} education
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {displayedDraft.skillCategories.reduce((sum, c) => sum + (c.skills?.length || 0), 0)} skills • {displayedDraft.projects.length} projects
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveWorkspaceTab('preview')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportJSON}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export JSON Backup</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateNewResumeClick}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Resume</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={isViewingPreservedDraft ? handleRestoreUserDraft : () => setActiveWorkspaceTab('edit')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                  >
                    <span>{isViewingPreservedDraft ? 'Restore This Draft' : 'Edit This Draft'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 1. EDIT VIEW */}
        {activeWorkspaceTab === 'edit' && (
          <div className="no-print space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 sm:px-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                  title="Return to Resuvo Home"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Home</span>
                </button>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">Resume Content</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Auto-saved to your browser. Updates preview instantly.</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTemplateModalMode('switch-template')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Choose from 13 resume templates"
                >
                  <Layout className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Template: {TEMPLATES.find((t) => t.id === template)?.shortName || 'Academic'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewResumeClick}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-950 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Create a brand new blank resume"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Resume</span>
                </button>
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1 whitespace-nowrap shrink-0 px-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Saved
                </span>
              </div>
            </div>

            <ResumeForm
              data={data}
              onChange={setData}
              template={template}
              activeSection={activeFormSection}
              onActiveSectionChange={setActiveFormSection}
              onBackToHome={handleBackToHome}
            />
          </div>
        )}

        {/* 2. JOB MATCH VIEW */}
        {activeWorkspaceTab === 'job-match' && (
          <div className="no-print space-y-4">
            <JobMatchMode
              resumeData={data}
              onResumeChange={setData}
              onNavigateSection={handleNavigateSection}
            />
          </div>
        )}

        {/* 3. PREVIEW VIEW */}
        {activeWorkspaceTab === 'preview' && (
          <div className="space-y-4">
            {/* Preview Action Bar with clear "Edit Resume" button to return to editing */}
            <div className="no-print bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveWorkspaceTab('edit')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Edit Resume</span>
                </button>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
                  <span>Document Preview</span>
                  <span className="text-slate-400 dark:text-slate-500">·</span>
                  <button
                    type="button"
                    onClick={() => setTemplateModalMode('switch-template')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    title="Browse and switch resume template"
                  >
                    <Layout className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{TEMPLATES.find((t) => t.id === template)?.name || 'Academic'}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                A4 Paper · Print-Ready
              </span>
            </div>

            {/* Complete Resume Preview */}
            <div className="resume-paper-container flex justify-center">
              <ResumePreview data={data} template={template} settings={settings} />
            </div>
          </div>
        )}

        {/* PRINT CONTAINER: Always rendered for print so PDF export works independently of the Preview button */}
        {activeWorkspaceTab !== 'preview' && (
          <div className="hidden print:block resume-paper-container">
            <ResumePreview data={data} template={template} settings={settings} />
          </div>
        )}
      </main>

      {/* Import Confirmation Modal (when current resume has existing data) */}
      {pendingImport && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Replace Current Resume?</span>
              </div>
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Importing <strong className="text-slate-800 dark:text-slate-200">"{pendingImport.fileName}"</strong> will replace your currently loaded resume data.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800 mb-5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div><strong className="text-slate-700 dark:text-slate-300">Importing profile:</strong> {pendingImport.data.personal.fullName || 'Untitled'}</div>
              <div><strong className="text-slate-700 dark:text-slate-300">Experience entries:</strong> {pendingImport.data.experience.length}</div>
              <div><strong className="text-slate-700 dark:text-slate-300">Education entries:</strong> {pendingImport.data.education.length}</div>
              {pendingImport.template && (
                <div><strong className="text-slate-700 dark:text-slate-300">Template specified:</strong> {pendingImport.template}</div>
              )}
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Yes, Replace and Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Error Modal */}
      {importError && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>JSON Import Failed</span>
              </div>
              <button
                type="button"
                onClick={() => setImportError(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              {importError}
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] p-2.5 rounded-md mb-5">
              Your current resume data was <strong>not modified</strong>. Please select a JSON file previously exported from this application.
            </div>

            <div className="flex justify-end text-xs">
              <button
                type="button"
                onClick={() => setImportError(null)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-md transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-base">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                <span>Clear Resume Draft?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to clear your current resume content? This will erase the fields in your browser draft. You can reload the sample profile anytime by clicking "Load Sample".
            </p>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Yes, Clear Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Sample Confirmation Modal */}
      {showLoadSampleModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                <RotateCcw className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Load Sample Resume?</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLoadSampleModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Loading sample information will populate the editor with a complete fictional resume profile. Your previously saved draft will be safely preserved in <strong className="text-slate-800 dark:text-slate-200">My Draft</strong> so you can return to it anytime.
            </p>

            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 mb-5 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
              <div><strong className="text-indigo-950 dark:text-indigo-100">Sample profile:</strong> Alex Morgan (Senior Software Engineer)</div>
              <div><strong className="text-indigo-950 dark:text-indigo-100">Sections populated:</strong> Personal, Summary, Experience, Education, Skills, Projects, Certifications, Awards, Declaration</div>
            </div>

            <div className="flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowLoadSampleModal(false)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLoadSample}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                Yes, Load Sample
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Resume & Multiple Template Chooser Modal */}
      <TemplateChooserModal
        isOpen={templateModalMode !== null}
        mode={templateModalMode || 'new-resume'}
        currentTemplate={template}
        currentColor={settings.primaryColor || '#2563eb'}
        currentResumeData={data}
        hasSavedDraft={hasSavedDraft}
        currentDraftName={data.personal.fullName?.trim() || undefined}
        onClose={() => setTemplateModalMode(null)}
        onCreateNew={handleConfirmCreateNew}
        onSelectTemplate={handleApplyChosenTemplate}
        onBackupDraftJson={handleExportJSON}
      />

      {/* Embedded Iframe Print Helper Modal */}
      {showPrintModal && (
        <div className="no-print fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-base">
                <AlertCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Print / Save as PDF</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2.5 mb-5 leading-relaxed">
              <p>
                The browser's native print dialog was requested. Because this app is running inside an{' '}
                <strong className="text-slate-800 dark:text-slate-200">embedded sandbox iframe</strong>, web browsers frequently restrict or block dialog popups.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">To print or save as PDF reliably:</span>
                <p>Open the resume in a standalone browser tab without iframe restrictions:</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={`${window.location.origin}${window.location.pathname}?print=true`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold text-center flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Standalone Tab to Print</span>
              </a>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification for Word Document Export */}
      {docxSuccessMsg && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium flex items-center gap-2.5 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{docxSuccessMsg}</span>
        </div>
      )}
      {docxErrorMsg && (
        <div className="no-print fixed bottom-6 right-6 z-50 bg-red-900 text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs font-medium flex items-center gap-2.5 border border-red-700 animate-in fade-in slide-in-from-bottom-3 duration-150">
          <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
          <span>{docxErrorMsg}</span>
        </div>
      )}

      {/* Floating AI Resume Coach & ATS Evaluator */}
      <ResumeBuddy
        resumeData={data}
        onResumeChange={setData}
        activeTemplate={template}
      />
    </div>
  );
};

export default App;
