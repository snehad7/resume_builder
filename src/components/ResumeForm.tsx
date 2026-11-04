import React, { useState } from 'react';
import {
  ResumeData,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
  ResumeTemplateId,
} from '../types/resume';
import { processImageFile } from '../utils/imageUtils';
import { SignaturePad } from './SignaturePad';
import { WelcomeIllustration } from './WelcomeIllustration';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Paperclip,
  FileText,
  AlertCircle,
  ExternalLink,
  Download,
  Upload,
  Camera,
  PenTool,
  Image as ImageIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const FORM_SECTIONS = [
  { id: 'personal', label: 'Personal & Photo', shortLabel: 'Personal', icon: User },
  { id: 'summary', label: 'Summary', shortLabel: 'Summary', icon: Sparkles },
  { id: 'experience', label: 'Experience', shortLabel: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', shortLabel: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', shortLabel: 'Skills', icon: Wrench },
  { id: 'projects', label: 'Projects', shortLabel: 'Projects', icon: FolderGit2 },
  { id: 'certifications', label: 'Certifications', shortLabel: 'Certifications', icon: Award },
  { id: 'declaration', label: 'Declaration & Sign', shortLabel: 'Declaration', icon: PenTool },
] as const;

const GithubIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  template?: ResumeTemplateId;
  activeSection?: string;
  onActiveSectionChange?: (section: string) => void;
  onBackToHome?: () => void;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({
  data,
  onChange,
  template,
  activeSection: controlledActiveSection,
  onActiveSectionChange,
  onBackToHome,
}) => {
  const [internalActiveSection, setInternalActiveSection] = useState<string>('');
  const activeSection = controlledActiveSection !== undefined ? controlledActiveSection : internalActiveSection;

  const setActiveSection = (section: string) => {
    if (onActiveSectionChange) {
      onActiveSectionChange(section);
    } else {
      setInternalActiveSection(section);
    }
  };
  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [showTraditionalDetails, setShowTraditionalDetails] = useState<boolean>(false);

  // Photo handlers
  const handlePhotoUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setPhotoError(null);
      const result = await processImageFile(file, 600, 600, 0.85);
      handlePersonalChange('photo', result.dataUrl);
    } catch (err: any) {
      setPhotoError(err.message || 'Failed to process photo.');
    }
  };

  const handleRemovePhoto = () => {
    handlePersonalChange('photo', '');
    setPhotoError(null);
  };

  // Declaration & Signature handler
  const handleDeclarationChange = (updates: Partial<NonNullable<ResumeData['declaration']>>) => {
    const currentDecl = data.declaration || {
      enabled: true,
      text: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
      place: data.personal.location || '',
      date: new Date().toISOString().split('T')[0],
      signatureType: 'draw',
      signatureImage: undefined,
      signerName: data.personal.fullName || '',
    };
    onChange({
      ...data,
      declaration: {
        ...currentDecl,
        ...updates,
      },
    });
  };

  const handleSignatureUpload = async (file: File | null) => {
    if (!file) return;
    try {
      setSignatureError(null);
      const result = await processImageFile(file, 500, 200, 0.85);
      handleDeclarationChange({ signatureImage: result.dataUrl });
    } catch (err: any) {
      setSignatureError(err.message || 'Failed to process signature image.');
    }
  };

  const handleRemoveSignature = () => {
    handleDeclarationChange({ signatureImage: undefined });
    setSignatureError(null);
  };

  // Personal Info handlers
  const handlePersonalChange = (field: keyof ResumeData['personal'], value: string) => {
    onChange({
      ...data,
      personal: {
        ...data.personal,
        [field]: value,
      },
    });
  };

  // Summary handler
  const handleSummaryChange = (summary: string) => {
    onChange({ ...data, summary });
  };

  // Experience handlers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      role: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      highlights: [''],
    };
    onChange({ ...data, experience: [...data.experience, newExp] });
  };

  const handleUpdateExperience = (id: string, updates: Partial<ExperienceItem>) => {
    onChange({
      ...data,
      experience: data.experience.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp)),
    });
  };

  const handleDeleteExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter((exp) => exp.id !== id),
    });
  };

  const handleAddExpHighlight = (expId: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    handleUpdateExperience(expId, { highlights: [...exp.highlights, ''] });
  };

  const handleUpdateExpHighlight = (expId: string, index: number, value: string) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    const newHighlights = [...exp.highlights];
    newHighlights[index] = value;
    handleUpdateExperience(expId, { highlights: newHighlights });
  };

  const handleDeleteExpHighlight = (expId: string, index: number) => {
    const exp = data.experience.find((e) => e.id === expId);
    if (!exp) return;
    const newHighlights = exp.highlights.filter((_, i) => i !== index);
    handleUpdateExperience(expId, { highlights: newHighlights });
  };

  // Education handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      highlights: [],
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const handleUpdateEducation = (id: string, updates: Partial<EducationItem>) => {
    onChange({
      ...data,
      education: data.education.map((edu) => (edu.id === id ? { ...edu, ...updates } : edu)),
    });
  };

  const handleDeleteEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter((edu) => edu.id !== id),
    });
  };

  // Skills handlers
  const handleAddSkillCategory = () => {
    const newCat: SkillCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Skills Category',
      skills: [],
    };
    onChange({ ...data, skillCategories: [...data.skillCategories, newCat] });
  };

  const handleUpdateCategoryName = (catId: string, name: string) => {
    onChange({
      ...data,
      skillCategories: data.skillCategories.map((c) => (c.id === catId ? { ...c, name } : c)),
    });
  };

  const handleDeleteCategory = (catId: string) => {
    onChange({
      ...data,
      skillCategories: data.skillCategories.filter((c) => c.id !== catId),
    });
  };

  const handleAddSkillToCategory = (catId: string) => {
    const val = (newSkillInputs[catId] || '').trim();
    if (!val) return;
    const cat = data.skillCategories.find((c) => c.id === catId);
    if (!cat) return;
    onChange({
      ...data,
      skillCategories: data.skillCategories.map((c) =>
        c.id === catId ? { ...c, skills: [...c.skills, val] } : c
      ),
    });
    setNewSkillInputs((prev) => ({ ...prev, [catId]: '' }));
  };

  const handleDeleteSkillFromCategory = (catId: string, skillIdx: number) => {
    const cat = data.skillCategories.find((c) => c.id === catId);
    if (!cat) return;
    onChange({
      ...data,
      skillCategories: data.skillCategories.map((c) =>
        c.id === catId ? { ...c, skills: c.skills.filter((_, i) => i !== skillIdx) } : c
      ),
    });
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      techStack: '',
      link: '',
      description: '',
      highlights: [''],
    };
    onChange({ ...data, projects: [...data.projects, newProj] });
  };

  const handleUpdateProject = (id: string, updates: Partial<ProjectItem>) => {
    onChange({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    });
  };

  const handleDeleteProject = (id: string) => {
    onChange({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
    });
  };

  // Certifications handlers
  const handleAddCert = () => {
    const newCert: CertificationItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      url: '',
    };
    onChange({ ...data, certifications: [...data.certifications, newCert] });
  };

  const handleUpdateCert = (id: string, updates: Partial<CertificationItem>) => {
    onChange({
      ...data,
      certifications: data.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const handleDeleteCert = (id: string) => {
    onChange({
      ...data,
      certifications: data.certifications.filter((c) => c.id !== id),
    });
    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleFileUpload = (certId: string, file: File | null) => {
    if (!file) return;

    // Validate file type (PDF, PNG, JPG/JPEG)
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const validMimes = ['application/pdf', 'image/png', 'image/jpeg', 'image/pjpeg', 'image/jpg'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some((ext) => fileNameLower.endsWith(ext));
    const hasValidMime = !file.type || validMimes.includes(file.type.toLowerCase());

    if (!hasValidExtension || !hasValidMime) {
      setFileErrors((prev) => ({
        ...prev,
        [certId]: 'Unsupported file format. Please upload a PDF, PNG, or JPG certificate document.',
      }));
      return;
    }

    // Validate file size: maximum 2MB to ensure stable browser localStorage saving
    const MAX_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setFileErrors((prev) => ({
        ...prev,
        [certId]: `File is too large (${sizeMB} MB). Maximum allowed certificate size is 2MB.`,
      }));
      return;
    }

    // Clear previous error on valid file
    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[certId];
      return next;
    });

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const detectedType = file.type || (fileNameLower.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      handleUpdateCert(certId, {
        fileName: file.name,
        fileData: base64Data,
        fileType: detectedType,
        fileSize: file.size,
      });
    };
    reader.onerror = () => {
      setFileErrors((prev) => ({
        ...prev,
        [certId]: 'Failed to read certificate file. Please try again.',
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (certId: string) => {
    handleUpdateCert(certId, {
      fileName: undefined,
      fileData: undefined,
      fileType: undefined,
      fileSize: undefined,
    });
    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[certId];
      return next;
    });
  };

  // Check completion status for each section
  const isSectionComplete = (id: string): boolean => {
    switch (id) {
      case 'personal':
        return Boolean(data.personal.fullName?.trim() || data.personal.email?.trim());
      case 'summary':
        return Boolean(data.summary?.trim());
      case 'experience':
        return Boolean(data.experience?.length > 0 && data.experience.some((e) => e.role?.trim() || e.company?.trim()));
      case 'education':
        return Boolean(data.education?.length > 0 && data.education.some((e) => e.degree?.trim() || e.institution?.trim()));
      case 'skills':
        return Boolean(data.skillCategories?.length > 0 && data.skillCategories.some((c) => c.skills?.length > 0));
      case 'projects':
        return Boolean(data.projects?.length > 0 && data.projects.some((p) => p.name?.trim()));
      case 'certifications':
        return Boolean(data.certifications?.length > 0 && data.certifications.some((c) => c.name?.trim()));
      case 'declaration':
        return Boolean(data.declaration?.enabled !== false && (data.declaration?.signerName?.trim() || data.personal.fullName?.trim()));
      default:
        return false;
    }
  };

  const currentSectionConfig = FORM_SECTIONS.find((s) => s.id === activeSection);
  const currentIndex = FORM_SECTIONS.findIndex((s) => s.id === activeSection);
  const prevSection = currentIndex > 0 ? FORM_SECTIONS[currentIndex - 1] : null;
  const nextSection = currentIndex >= 0 && currentIndex < FORM_SECTIONS.length - 1 ? FORM_SECTIONS[currentIndex + 1] : null;

  return (
    <div className="space-y-4">
      {/* Horizontal Primary Navigation Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-medium border-b border-slate-200 dark:border-slate-800">
        {FORM_SECTIONS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          const isComplete = isSectionComplete(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span>{tab.label}</span>
              {isComplete && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-emerald-300' : 'bg-emerald-500'
                  }`}
                  title="Section has content"
                />
              )}
            </button>
          );
        })}
      </div>

      {!activeSection || !currentSectionConfig ? (
        /* Welcome Screen (Rendered when no section is selected) */
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 sm:p-8 flex flex-col items-center text-center">
          <div className="w-52 sm:w-64 max-w-full h-auto mb-4 flex items-center justify-center">
            <WelcomeIllustration className="w-full h-auto max-h-48" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <span>Welcome to Resuvo</span>
            <span className="text-amber-500">✨</span>
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            Build a professional resume that represents your skills, experience and achievements.
          </p>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-2">
            Select a section above to get started.
          </p>
        </div>
      ) : (
        /* Single Active Section Form */
        <div id={`form-section-${activeSection}`} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Active Section Header Bar */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                {React.createElement(currentSectionConfig.icon, { className: 'w-4 h-4' })}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentSectionConfig.label}</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Step {currentIndex + 1} of {FORM_SECTIONS.length} • Updates live preview automatically</p>
              </div>
            </div>
            {isSectionComplete(activeSection) && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" /> Filled
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5">
            {activeSection === 'personal' && (
              <div className="space-y-4 text-xs">
            {/* Profile Photo Upload Control */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-indigo-600" />
                  Profile Photo (Optional)
                </span>
                <span className="text-[11px] text-slate-500">
                  Used in: Layout 3, Layout 4 & Layout 5
                </span>
              </div>

              {photoError && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{photoError}</span>
                </div>
              )}

              {data.personal.photo ? (
                <div className="flex items-center gap-4">
                  <img
                    src={data.personal.photo}
                    alt="Uploaded profile photo preview"
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-md border-2 border-indigo-200 shadow-xs shrink-0"
                  />
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-800">Custom profile photo active</p>
                    <p className="text-[11px] text-slate-500">
                      Renders neatly in supported templates and print/PDF output.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1">
                        <Upload className="w-3 h-3" /> Replace Photo
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,image/*"
                          onChange={(e) => {
                            handlePhotoUpload(e.target.files?.[0] || null);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[11px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-md cursor-pointer transition-colors text-slate-600">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-medium">Click to select photo from your device (JPG, PNG, WEBP)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/*"
                      onChange={(e) => {
                        handlePhotoUpload(e.target.files?.[0] || null);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tip: If no photo is chosen, the resume renders neatly without an empty frame.
                  </p>
                </div>
              )}
            </div>

            {/* Standard Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={data.personal.fullName}
                  onChange={(e) => handlePersonalChange('fullName', e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={data.personal.title}
                  onChange={(e) => handlePersonalChange('title', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={data.personal.email}
                  onChange={(e) => handlePersonalChange('email', e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={data.personal.phone}
                  onChange={(e) => handlePersonalChange('phone', e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Location / Address</label>
                <input
                  type="text"
                  value={data.personal.location}
                  onChange={(e) => handlePersonalChange('location', e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Website / Portfolio</label>
                <input
                  type="text"
                  value={data.personal.website || ''}
                  onChange={(e) => handlePersonalChange('website', e.target.value)}
                  placeholder="e.g. alexmorgan.dev"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">LinkedIn Profile</label>
                <input
                  type="text"
                  value={data.personal.linkedin || ''}
                  onChange={(e) => handlePersonalChange('linkedin', e.target.value)}
                  placeholder="e.g. linkedin.com/in/alexmorgan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">GitHub / Code Repository</label>
                <input
                  type="text"
                  value={data.personal.github || ''}
                  onChange={(e) => handlePersonalChange('github', e.target.value)}
                  placeholder="e.g. github.com/alexmorgan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Collapsible Traditional Details (Optional — For Layout 4 Traditional Formal) */}
            <div className="pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowTraditionalDetails(!showTraditionalDetails)}
                className="flex items-center justify-between w-full p-2 bg-slate-100 hover:bg-slate-200/80 rounded-md font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Additional / Traditional Details (Optional — Used in Layout 4)
                </span>
                <span className="text-[11px] text-slate-500">
                  {showTraditionalDetails ? 'Hide' : 'Show'}
                </span>
              </button>

              {showTraditionalDetails && (
                <div className="p-3 mt-2 bg-slate-50 border border-slate-200 rounded-md space-y-3">
                  <p className="text-[11px] text-slate-500 italic">
                    These fields are strictly optional. Any blank field will not be shown on the resume.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Father's / Guardian's Name</label>
                      <input
                        type="text"
                        value={data.personal.fatherName || ''}
                        onChange={(e) => handlePersonalChange('fatherName', e.target.value)}
                        placeholder="e.g. Robert Morgan"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                      <input
                        type="text"
                        value={data.personal.dob || ''}
                        onChange={(e) => handlePersonalChange('dob', e.target.value)}
                        placeholder="e.g. 15th August 1996"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Gender</label>
                      <input
                        type="text"
                        value={data.personal.gender || ''}
                        onChange={(e) => handlePersonalChange('gender', e.target.value)}
                        placeholder="e.g. Female / Male / Non-binary"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Marital Status</label>
                      <input
                        type="text"
                        value={data.personal.maritalStatus || ''}
                        onChange={(e) => handlePersonalChange('maritalStatus', e.target.value)}
                        placeholder="e.g. Single / Married"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Nationality</label>
                      <input
                        type="text"
                        value={data.personal.nationality || ''}
                        onChange={(e) => handlePersonalChange('nationality', e.target.value)}
                        placeholder="e.g. Indian / American"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Languages Known</label>
                      <input
                        type="text"
                        value={data.personal.languages || ''}
                        onChange={(e) => handlePersonalChange('languages', e.target.value)}
                        placeholder="e.g. English, Bengali, Hindi"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-700 mb-1">Permanent Address</label>
                      <input
                        type="text"
                        value={data.personal.permanentAddress || ''}
                        onChange={(e) => handlePersonalChange('permanentAddress', e.target.value)}
                        placeholder="e.g. Kolkata, West Bengal, India"
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Professional Summary */}
        {activeSection === 'summary' && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">
              Summarize your key strengths, years of experience, and main achievements in 2-4 sentences.
            </p>
            <textarea
              rows={4}
              value={data.summary}
              onChange={(e) => handleSummaryChange(e.target.value)}
              placeholder="e.g. Results-oriented software engineer with 5+ years of experience..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* 3. Work Experience */}
        {activeSection === 'experience' && (
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={exp.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Experience #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-600 mb-1">Job Title *</label>
                    <input
                      type="text"
                      value={exp.role}
                      onChange={(e) => handleUpdateExperience(exp.id, { role: e.target.value })}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Company *</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleUpdateExperience(exp.id, { company: e.target.value })}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleUpdateExperience(exp.id, { location: e.target.value })}
                      placeholder="e.g. Austin, TX (or Remote)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { startDate: e.target.value })}
                        placeholder="e.g. Jan 2021"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">End Date</label>
                      <input
                        type="text"
                        disabled={exp.current}
                        value={exp.current ? 'Present' : exp.endDate}
                        onChange={(e) => handleUpdateExperience(exp.id, { endDate: e.target.value })}
                        placeholder="e.g. Dec 2023"
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) => handleUpdateExperience(exp.id, { current: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <label htmlFor={`current-${exp.id}`} className="text-slate-700">
                    I currently work in this role
                  </label>
                </div>

                {/* Highlights / Bullets */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-slate-700 font-medium">Key Accomplishments & Responsibilities</label>
                  {exp.highlights.map((hl, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={hl}
                        onChange={(e) => handleUpdateExpHighlight(exp.id, hIdx, e.target.value)}
                        placeholder="e.g. Increased system uptime to 99.9% by migrating infrastructure to AWS"
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteExpHighlight(exp.id, hIdx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Delete bullet point"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddExpHighlight(exp.id)}
                    className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold flex items-center gap-1 mt-1"
                  >
                    <Plus className="w-3 h-3" /> Add Achievement Bullet
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddExperience}
              className="w-full py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-md text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Work Experience
            </button>
          </div>
        )}

        {/* 4. Education */}
        {activeSection === 'education' && (
          <div className="space-y-4">
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Education #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleUpdateEducation(edu.id, { degree: e.target.value })}
                      placeholder="e.g. B.Tech in Computer Science"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleUpdateEducation(edu.id, { institution: e.target.value })}
                      placeholder="e.g. Heritage Institute of Technology"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Year</label>
                    <input
                      type="text"
                      value={edu.endDate || edu.startDate || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, { endDate: e.target.value })}
                      placeholder="e.g. 2024"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Marks (%) / CGPA</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, { gpa: e.target.value })}
                      placeholder="e.g. 8.9 CGPA / 85%"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 mb-1">Location (Optional)</label>
                    <input
                      type="text"
                      value={edu.location || ''}
                      onChange={(e) => handleUpdateEducation(edu.id, { location: e.target.value })}
                      placeholder="e.g. Kolkata, West Bengal"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddEducation}
              className="w-full py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-md text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Education
            </button>
          </div>
        )}

        {/* 5. Skills */}
        {activeSection === 'skills' && (
          <div className="space-y-4">
            {data.skillCategories.map((cat) => (
              <div key={cat.id} className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => handleUpdateCategoryName(cat.id, e.target.value)}
                    placeholder="e.g. Programming Languages"
                    className="flex-1 font-semibold px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleDeleteSkillFromCategory(cat.id, sIdx)}
                        className="text-slate-400 hover:text-red-500 font-bold ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill tag */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillInputs[cat.id] || ''}
                    onChange={(e) =>
                      setNewSkillInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkillToCategory(cat.id);
                      }
                    }}
                    placeholder="Type skill & press Enter or Add"
                    className="flex-1 px-2.5 py-1 border border-slate-300 rounded bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkillToCategory(cat.id)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-2.5 py-1 rounded text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddSkillCategory}
              className="w-full py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-md text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Skill Category
            </button>
          </div>
        )}

        {/* 6. Projects */}
        {activeSection === 'projects' && (
          <div className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={proj.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Project #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(proj.id)}
                    className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Project Name *</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleUpdateProject(proj.id, { name: e.target.value })}
                      placeholder="e.g. E-Commerce Platform"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Tech Stack</label>
                    <input
                      type="text"
                      value={proj.techStack}
                      onChange={(e) => handleUpdateProject(proj.id, { techStack: e.target.value })}
                      placeholder="e.g. React, Node.js, PostgreSQL"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Demo / Live Link</label>
                    <input
                      type="text"
                      value={proj.link || ''}
                      onChange={(e) => handleUpdateProject(proj.id, { link: e.target.value })}
                      placeholder="e.g. https://myproject.demo"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium flex items-center gap-1">
                      <GithubIcon className="w-3.5 h-3.5 text-slate-700" />
                      <span>GitHub Repository URL</span>
                    </label>
                    <input
                      type="text"
                      value={proj.githubUrl || ''}
                      onChange={(e) => handleUpdateProject(proj.id, { githubUrl: e.target.value })}
                      placeholder="e.g. https://github.com/username/project"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => handleUpdateProject(proj.id, { description: e.target.value })}
                    placeholder="Key highlights and impact of this project..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddProject}
              className="w-full py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-md text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Project
            </button>
          </div>
        )}

        {/* 7. Certifications */}
        {activeSection === 'certifications' && (
          <div className="space-y-4">
            {data.certifications.map((cert, idx) => (
              <div key={cert.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Certification #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteCert(cert.id)}
                    className="text-red-500 hover:text-red-700 p-1 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Certification Name *</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleUpdateCert(cert.id, { name: e.target.value })}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Issuing Organization *</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleUpdateCert(cert.id, { issuer: e.target.value })}
                      placeholder="e.g. Amazon Web Services"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 mb-1">Issue Date / Year</label>
                    <input
                      type="text"
                      value={cert.date || ''}
                      onChange={(e) => handleUpdateCert(cert.id, { date: e.target.value })}
                      placeholder="e.g. 2023 or Oct 2023"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Credential Verification URL</label>
                    <input
                      type="text"
                      value={cert.url || ''}
                      onChange={(e) => handleUpdateCert(cert.id, { url: e.target.value })}
                      placeholder="e.g. https://aws.amazon.com/verification"
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>

                {/* Certificate File Attachment Section */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-slate-700 font-medium mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                      Attached Certificate Document
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      PDF, PNG, JPG (max 2MB)
                    </span>
                  </label>

                  {/* Validation Error Message */}
                  {fileErrors[cert.id] && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fileErrors[cert.id]}</span>
                    </div>
                  )}

                  {cert.fileData ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-indigo-50/60 border border-indigo-200 rounded-md">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate" title={cert.fileName}>
                            {cert.fileName || 'Attached Certificate'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {cert.fileSize
                              ? `${(cert.fileSize / 1024).toFixed(1)} KB`
                              : cert.fileType || 'Attached'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={cert.fileData}
                          download={cert.fileName || `${(cert.name || 'certificate').toLowerCase().replace(/\s+/g, '_')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-semibold transition-colors"
                          title="Open or download the attached certificate"
                        >
                          <Download className="w-3 h-3" />
                          <span>Test Download</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile(cert.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-[11px] font-medium transition-colors"
                          title="Remove attached certificate file"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 rounded-md cursor-pointer transition-colors text-slate-600">
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-medium">Click to attach certificate (PDF, PNG, JPG)</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
                          onChange={(e) => {
                            handleFileUpload(cert.id, e.target.files?.[0] || null);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddCert}
              className="w-full py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 rounded-md text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Certification
            </button>
          </div>
        )}

        {/* 8. Declaration & Signature */}
        {activeSection === 'declaration' && (
          <div className="space-y-4 text-xs">
            {/* Context Notice */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-md text-[11px] text-indigo-900 leading-relaxed flex items-start gap-2">
              <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Supported Layouts:</strong> The Declaration & Signature section is rendered in{' '}
                <span className="font-semibold text-indigo-700">Layout 2 (Academic with Decl)</span>,{' '}
                <span className="font-semibold text-indigo-700">Layout 3 (Academic with Photo & Decl)</span>, and{' '}
                <span className="font-semibold text-indigo-700">Layout 4 (Traditional Formal)</span>.
              </div>
            </div>

            {/* Toggle Enable/Disable */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div>
                <span className="font-semibold text-slate-800 block">Include Declaration Section</span>
                <span className="text-[11px] text-slate-500">
                  Enable or disable the declaration block for supported layouts
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.declaration?.enabled ?? true}
                  onChange={(e) => handleDeclarationChange({ enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Declaration Text */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Declaration Statement</label>
              <textarea
                rows={2}
                value={
                  data.declaration?.text ??
                  'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.'
                }
                onChange={(e) => handleDeclarationChange({ text: e.target.value })}
                placeholder="Enter declaration statement..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            {/* Place and Date Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Place</label>
                <input
                  type="text"
                  value={data.declaration?.place ?? (data.personal.location || '')}
                  onChange={(e) => handleDeclarationChange({ place: e.target.value })}
                  placeholder="e.g. Kolkata, West Bengal or San Francisco"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  value={data.declaration?.date ?? new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleDeclarationChange({ date: e.target.value })}
                  placeholder="e.g. 29th October 2026 or 2026-10-29"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                />
              </div>
            </div>

            {/* Signature Options */}
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block font-semibold text-slate-800">Signature Option</label>
                <span className="text-[11px] text-indigo-700 font-medium">Draw signature with mouse, touchpad, or touchscreen</span>
              </div>

              {/* 3 Signature Mode Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                {[
                  { id: 'draw', label: 'Draw Signature', subtitle: 'Canvas / Touch' },
                  { id: 'upload', label: 'Upload Image', subtitle: 'PNG / JPG' },
                  { id: 'none', label: 'Blank Line', subtitle: 'Sign by hand' },
                ].map((mode) => {
                  const currentSigType = data.declaration?.signatureType || 'draw';
                  const isSelected = currentSigType === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        handleDeclarationChange({
                          signatureType: mode.id as 'draw' | 'upload' | 'none',
                        })
                      }
                      className={`p-2 rounded-md text-left transition-colors cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 font-semibold'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block text-xs font-semibold">{mode.label}</span>
                      <span className={`block text-[10px] ${isSelected ? 'text-indigo-600 font-medium' : 'text-slate-400'}`}>
                        {mode.subtitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 1. DRAW SIGNATURE OPTION */}
              {(data.declaration?.signatureType === 'draw' || !data.declaration?.signatureType) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <SignaturePad
                    savedSignature={data.declaration?.signatureImage}
                    onSave={(dataUrl) =>
                      handleDeclarationChange({
                        signatureImage: dataUrl,
                        signatureType: 'draw',
                      })
                    }
                    onRemove={() =>
                      handleDeclarationChange({
                        signatureImage: undefined,
                      })
                    }
                    signerName={data.declaration?.signerName || data.personal.fullName}
                  />
                </div>
              )}

              {/* 2. UPLOADED SIGNATURE IMAGE OPTION */}
              {data.declaration?.signatureType === 'upload' && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
                  {signatureError && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{signatureError}</span>
                    </div>
                  )}

                  {data.declaration?.signatureImage ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white border border-slate-200 rounded">
                      <div className="flex items-center gap-3">
                        <img
                          src={data.declaration.signatureImage}
                          alt="Signature preview"
                          className="h-12 max-w-[140px] object-contain border border-slate-200 rounded bg-white p-1"
                        />
                        <div>
                          <span className="text-[11px] font-semibold text-slate-700 block">Uploaded signature active</span>
                          <span className="text-[10px] text-slate-400">Renders above printed name</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="px-2 py-1 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded text-[11px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1">
                          <Upload className="w-3 h-3" /> Replace
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp,image/*"
                            onChange={(e) => {
                              handleSignatureUpload(e.target.files?.[0] || null);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveSignature}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[11px] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-md cursor-pointer transition-colors text-slate-600">
                        <Upload className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-medium">Click to upload signature image (PNG, JPG, WEBP)</span>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.webp,image/*"
                          onChange={(e) => {
                            handleSignatureUpload(e.target.files?.[0] || null);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Tip: Transparent PNG gives the sharpest result.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. BLANK SIGNATURE LINE OPTION */}
              {data.declaration?.signatureType === 'none' && (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                    <PenTool className="w-4 h-4 text-slate-600" />
                    <span>Clean Blank Signature Line Active</span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    A clean signature line (<code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">___________</code>) is displayed above candidate's printed name in all declaration-capable layouts and Print/PDF output, allowing the candidate to sign physically with ink after printing.
                  </p>
                  <div className="p-3 bg-white border border-slate-200 rounded text-right flex flex-col items-end">
                    <div className="w-44 border-b-2 border-slate-800 mb-1 pt-6" />
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      ({data.declaration?.signerName || data.personal.fullName || 'Candidate Name'})
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Candidate Signature</span>
                  </div>
                </div>
              )}

              {/* Printed Signer Name */}
              <div className="mt-3">
                <label className="block font-medium text-slate-700 mb-1">Printed Signer Name (Under Signature)</label>
                <input
                  type="text"
                  value={data.declaration?.signerName ?? (data.personal.fullName || '')}
                  onChange={(e) => handleDeclarationChange({ signerName: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white"
                />
              </div>
            </div>
          </div>
        )}
          </div>

          {/* Section-by-Section Workflow Navigation Footer */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            {prevSection ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(prevSection.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Previous: {prevSection.shortLabel}</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Start of Resume Form
              </div>
            )}

            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
              Step {currentIndex + 1} of {FORM_SECTIONS.length}
            </div>

            {nextSection ? (
              <button
                type="button"
                onClick={() => {
                  setActiveSection(nextSection.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs ml-auto sm:ml-0"
              >
                <span>Next: {nextSection.shortLabel}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 font-semibold rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ml-auto sm:ml-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>All Sections Reviewed</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
