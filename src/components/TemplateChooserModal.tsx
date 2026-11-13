import React, { useState, useEffect } from 'react';
import { ResumeData, ResumeTemplateId } from '../types/resume';
import { TEMPLATES } from './DesignStudio';
import { ScaledTemplatePreview } from './ScaledTemplatePreview';
import {
  TEMPLATE_SHOWCASE_CONFIGS,
  getSampleSettingsForTemplate,
} from '../data/templateSamples';
import { EXTRA_CANVA_CATEGORY_MAP, TemplateCategory } from '../data/canvaTemplates';
import {
  X,
  Check,
  Plus,
  Layout,
  Download,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  RotateCcw,
  Search,
} from 'lucide-react';

const TEMPLATE_CATEGORIES: Record<ResumeTemplateId, TemplateCategory[]> = {
  'modern': ['all', 'modern'],
  'modern-minimalist': ['all', 'modern', 'ats'],
  'creative': ['all', 'modern'],
  'two-column': ['all', 'executive', 'modern'],
  'corporate': ['all', 'executive'],
  'classic': ['all', 'executive'],
  'elegant-serif': ['all', 'executive'],
  'minimal-ats': ['all', 'ats'],
  'compact-one-page': ['all', 'ats'],
  'academic': ['all', 'academic'],
  'academic-decl': ['all', 'academic'],
  'academic-photo-decl': ['all', 'academic'],
  'traditional': ['all', 'academic', 'executive'],
  'canva-nordic': ['all', 'canva', 'modern'],
  'canva-editorial-split': ['all', 'canva', 'modern'],
  'canva-monogram': ['all', 'canva', 'modern'],
  'canva-dark-sidebar': ['all', 'canva', 'executive'],
  'canva-ribbon': ['all', 'canva', 'modern'],
  ...EXTRA_CANVA_CATEGORY_MAP,
};

const QUICK_ACCENT_COLORS = [
  { label: 'Royal Blue', value: '#2563eb' },
  { label: 'Slate Navy', value: '#1e293b' },
  { label: 'Deep Teal', value: '#0d9488' },
  { label: 'Emerald', value: '#059669' },
  { label: 'Burgundy', value: '#9f1239' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Obsidian', value: '#18181b' },
];

interface TemplateChooserModalProps {
  isOpen: boolean;
  mode: 'new-resume' | 'switch-template';
  currentTemplate: ResumeTemplateId;
  currentColor: string;
  currentResumeData?: ResumeData;
  hasSavedDraft: boolean;
  currentDraftName?: string;
  onClose: () => void;
  onCreateNew: (selectedTemplate: ResumeTemplateId, selectedColor: string) => void;
  onSelectTemplate: (selectedTemplate: ResumeTemplateId, selectedColor: string) => void;
  onBackupDraftJson: () => void;
}

export const TemplateChooserModal: React.FC<TemplateChooserModalProps> = ({
  isOpen,
  mode,
  currentTemplate,
  currentColor,
  currentResumeData,
  hasSavedDraft,
  currentDraftName,
  onClose,
  onCreateNew,
  onSelectTemplate,
  onBackupDraftJson,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>(currentTemplate);
  const [selectedColor, setSelectedColor] = useState<string>(
    TEMPLATE_SHOWCASE_CONFIGS[currentTemplate]?.defaultColor || currentColor || '#2563eb'
  );
  const [hasCustomColorOverride, setHasCustomColorOverride] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewSource, setPreviewSource] = useState<'sample' | 'draft'>('sample');
  const [backupDownloaded, setBackupDownloaded] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate(currentTemplate);
      setSelectedColor(
        mode === 'switch-template'
          ? currentColor || TEMPLATE_SHOWCASE_CONFIGS[currentTemplate]?.defaultColor || '#2563eb'
          : TEMPLATE_SHOWCASE_CONFIGS[currentTemplate]?.defaultColor || '#2563eb'
      );
      setHasCustomColorOverride(false);
      setPreviewSource('sample');
      setBackupDownloaded(false);
    }
  }, [isOpen, currentTemplate, currentColor, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const canvaCount = TEMPLATES.filter((t) => t.id.startsWith('canva-')).length;
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredTemplates = TEMPLATES.filter((t) => {
    if (activeCategory !== 'all' && !TEMPLATE_CATEGORIES[t.id]?.includes(activeCategory)) {
      return false;
    }
    if (!normalizedQuery) return true;
    const cfg = TEMPLATE_SHOWCASE_CONFIGS[t.id];
    return (
      t.name.toLowerCase().includes(normalizedQuery) ||
      t.shortName.toLowerCase().includes(normalizedQuery) ||
      t.desc.toLowerCase().includes(normalizedQuery) ||
      cfg.styleLabel.toLowerCase().includes(normalizedQuery) ||
      cfg.sampleData.personal.title.toLowerCase().includes(normalizedQuery) ||
      cfg.sampleData.personal.fullName.toLowerCase().includes(normalizedQuery)
    );
  });

  const selectedTemplateObj = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];
  const selectedConfig = TEMPLATE_SHOWCASE_CONFIGS[selectedTemplate] || TEMPLATE_SHOWCASE_CONFIGS.modern;

  const handleCardSelect = (tplId: ResumeTemplateId) => {
    setSelectedTemplate(tplId);
    if (!hasCustomColorOverride) {
      setSelectedColor(TEMPLATE_SHOWCASE_CONFIGS[tplId]?.defaultColor || '#2563eb');
    }
  };

  const handleColorPick = (color: string) => {
    setSelectedColor(color);
    setHasCustomColorOverride(true);
  };

  const handleResetTemplateColor = () => {
    setHasCustomColorOverride(false);
    setSelectedColor(selectedConfig.defaultColor);
  };

  const handleConfirm = () => {
    if (mode === 'new-resume') {
      onCreateNew(selectedTemplate, selectedColor);
    } else {
      onSelectTemplate(selectedTemplate, selectedColor);
    }
  };

  const handleBackupClick = () => {
    onBackupDraftJson();
    setBackupDownloaded(true);
  };

  const inspectorData =
    previewSource === 'draft' && currentResumeData && hasSavedDraft
      ? currentResumeData
      : selectedConfig.sampleData;

  const inspectorSettings = getSampleSettingsForTemplate(selectedTemplate, selectedColor);

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-chooser-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full h-[92vh] max-h-[860px] flex flex-col border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/80 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              {mode === 'new-resume' ? <Plus className="w-4 h-4" /> : <Layout className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="template-chooser-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {mode === 'new-resume' ? 'Create New Resume' : 'Choose Resume Template'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mode === 'new-resume'
                  ? 'Browse interactive templates with live sample previews, then start building from a blank slate.'
                  : 'Click any template to preview it live. Your resume details remain completely unchanged.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Draft preservation banner when creating a brand new resume over existing content */}
        {mode === 'new-resume' && hasSavedDraft && (
          <div className="px-5 py-2 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200 shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Starting a new resume resets the current editor draft
                {currentDraftName ? ` (${currentDraftName})` : ''}.
              </span>
            </div>
            <button
              type="button"
              onClick={handleBackupClick}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-amber-100/60 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 rounded-md font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              {backupDownloaded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Backup Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Backup Current Draft (JSON)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto max-w-full">
            {[
              { id: 'all' as TemplateCategory, label: `All (${TEMPLATES.length})` },
              { id: 'canva' as TemplateCategory, label: `Canva Styles (${canvaCount})` },
              { id: 'modern' as TemplateCategory, label: 'Modern & Creative' },
              { id: 'ats' as TemplateCategory, label: 'ATS & Minimal' },
              { id: 'executive' as TemplateCategory, label: 'Executive & Classic' },
              { id: 'academic' as TemplateCategory, label: 'Academic & Formal' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 ml-auto">
            {/* Search Templates */}
            <div className="relative w-52 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search template or role..."
                className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Accent Swatches */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Accent:</span>
              <div className="flex items-center gap-1.5">
                {QUICK_ACCENT_COLORS.map((swatch) => {
                  const isColorSelected = selectedColor.toLowerCase() === swatch.value.toLowerCase();
                  return (
                    <button
                      key={swatch.value}
                      type="button"
                      onClick={() => handleColorPick(swatch.value)}
                      title={swatch.label}
                      aria-label={`Select accent color ${swatch.label}`}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-transform flex items-center justify-center ${
                        isColorSelected ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: swatch.value }}
                    >
                      {isColorSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </button>
                  );
                })}
                {hasCustomColorOverride && (
                  <button
                    type="button"
                    onClick={handleResetTemplateColor}
                    className="ml-1 text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    title="Restore template's original accent color"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Interactive Split View: Template Cards Grid + Live Sample Preview Inspector */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left: Interactive Template Grid with Real Sample Previews */}
          <div className="lg:col-span-7 overflow-y-auto p-4 sm:p-5 bg-slate-50/60 dark:bg-slate-950/30 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
            {filteredTemplates.length === 0 ? (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center gap-2 text-slate-500 dark:text-slate-400">
                <p className="text-xs font-medium">No templates match &ldquo;{searchQuery}&rdquo; in this category.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 rounded-md hover:bg-indigo-100 cursor-pointer"
                >
                  Show all {TEMPLATES.length} templates
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
              {filteredTemplates.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                const cfg = TEMPLATE_SHOWCASE_CONFIGS[tpl.id];
                const cardColor = isSelected && hasCustomColorOverride ? selectedColor : cfg.defaultColor;
                const cardSettings = getSampleSettingsForTemplate(tpl.id, cardColor);

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleCardSelect(tpl.id)}
                    onDoubleClick={() => {
                      const confirmColor = isSelected ? selectedColor : cfg.defaultColor;
                      if (mode === 'new-resume') {
                        onCreateNew(tpl.id, confirmColor);
                      } else {
                        onSelectTemplate(tpl.id, confirmColor);
                      }
                    }}
                    className={`group text-left rounded-xl border p-2.5 transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/80 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs'
                    }`}
                  >
                    {/* Real Live Sample Preview Thumbnail */}
                    <div className="relative w-full">
                      <ScaledTemplatePreview
                        data={cfg.sampleData}
                        template={tpl.id}
                        settings={cardSettings}
                        aspectClass="aspect-[210/250]"
                        className="group-hover:brightness-[0.99] transition-all"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Template Info */}
                    <div className="space-y-0.5 px-0.5">
                      <div className="flex items-baseline justify-between gap-1.5">
                        <span
                          className={`text-xs font-bold leading-snug truncate ${
                            isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          {tpl.shortName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                          {cfg.styleLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                        {tpl.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            )}
          </div>

          {/* Right: Live Interactive Full Sample Preview */}
          <div className="hidden lg:flex lg:col-span-5 flex-col min-h-0 bg-slate-100/70 dark:bg-slate-950/60 p-4 gap-3">
            <div className="flex items-center justify-between gap-2 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white truncate">
                  <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{selectedTemplateObj.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <span>{selectedConfig.fontFamily}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedConfig.styleLabel}</span>
                </div>
              </div>

              {/* Sample vs My Draft Interactive Preview Toggle */}
              {hasSavedDraft && currentResumeData && (
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-[11px] shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewSource('sample')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      previewSource === 'sample'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Sample Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSource('draft')}
                    className={`px-2 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      previewSource === 'draft'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    My Draft
                  </button>
                </div>
              )}
            </div>

            {/* Scrollable Full A4 Sample Preview */}
            <ScaledTemplatePreview
              data={inspectorData}
              template={selectedTemplate}
              settings={inspectorSettings}
              scrollable
              className="flex-1 min-h-0"
            />
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full inline-block shrink-0 border border-slate-300 dark:border-slate-700"
              style={{ backgroundColor: selectedColor }}
            />
            <span>Selected:</span>
            <strong className="text-slate-900 dark:text-white">{selectedTemplateObj.name}</strong>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
              {selectedConfig.sampleData.personal.fullName} sample shown
            </span>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{mode === 'new-resume' ? 'Build New Resume' : 'Apply Template'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
