import React, { useState, useEffect, useRef } from 'react';
import {
  ResumeSettings,
  ResumeTemplateId,
  ResumeTypographySettings,
  ResumeLayoutSettings,
  TextFormatting,
  FontWeight,
  CustomDesignPreset,
} from '../types/resume';
import { ScaledTemplatePreview } from './ScaledTemplatePreview';
import {
  TEMPLATE_SHOWCASE_CONFIGS,
  getSampleSettingsForTemplate,
} from '../data/templateSamples';
import { EXTRA_CANVA_TEMPLATES_LIST } from '../data/canvaTemplates';
import {
  Layout,
  Palette,
  Type,
  Maximize2,
  ExternalLink,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  Sliders,
  Columns,
  Sparkles,
  X,
  Undo2,
  Bookmark,
  Plus,
  Trash2,
  Info,
  SlidersHorizontal,
  Search,
} from 'lucide-react';

export const TEMPLATES: {
  id: ResumeTemplateId;
  name: string;
  shortName: string;
  desc: string;
  badge?: string;
}[] = [
  {
    id: 'academic',
    name: 'Academic (Original)',
    shortName: 'Academic',
    desc: 'Structured academic layout with education table, research projects & credentials',
  },
  {
    id: 'academic-decl',
    name: 'Academic + Declaration',
    shortName: 'Academic + Decl',
    desc: 'Academic layout with formal candidate declaration, date, place & signature section',
  },
  {
    id: 'academic-photo-decl',
    name: 'Academic + Photo & Declaration',
    shortName: 'Academic + Photo',
    desc: 'Academic layout with passport-style candidate photo, declaration & verified signature',
  },
  {
    id: 'traditional',
    name: 'Traditional Formal',
    shortName: 'Traditional',
    desc: 'Formal page border, structured section bars, personal details, education table & declaration',
  },
  {
    id: 'two-column',
    name: 'Two-Column Executive',
    shortName: 'Two-Column',
    desc: 'Executive layout with sidebar for profile photo, contact & skills, and main column for experience',
  },
  {
    id: 'modern',
    name: 'Modern Clean',
    shortName: 'Modern',
    desc: 'Single-column modern sans-serif layout with accent stripes and clean spacing',
    badge: 'Popular',
  },
  {
    id: 'classic',
    name: 'Classic Serif',
    shortName: 'Classic',
    desc: 'Traditional Georgia serif typography with formal centered headings and classic rules',
  },
  {
    id: 'minimal-ats',
    name: 'Minimal ATS-Friendly',
    shortName: 'Minimal ATS',
    desc: 'Clean single-column layout optimized for applicant tracking systems and automated parsing',
    badge: 'ATS Best',
  },
  {
    id: 'corporate',
    name: 'Corporate Professional',
    shortName: 'Corporate',
    desc: 'Structured executive hierarchy with corporate header band, clear divider rules & metrics',
  },
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    shortName: 'Minimalist',
    desc: 'Contemporary layout with refined whitespace, quiet section kickers & vertical timeline flow',
  },
  {
    id: 'creative',
    name: 'Creative Professional',
    shortName: 'Creative',
    desc: 'Dynamic design with vibrant left accent stripe, styled project showcase & modern skill tags',
  },
  {
    id: 'elegant-serif',
    name: 'Elegant Serif',
    shortName: 'Elegant Serif',
    desc: 'Sophisticated editorial typography, delicate double rules, centered headers & classic balance',
  },
  {
    id: 'compact-one-page',
    name: 'Compact One-Page Resume',
    shortName: 'Compact One-Page',
    desc: 'Dense, space-optimized layout designed to fit on a single page while preserving full content',
    badge: '1-Page',
  },
  {
    id: 'canva-nordic',
    name: 'Canva Nordic Sage',
    shortName: 'Nordic Sage',
    desc: 'Canva-inspired soft tinted sidebar with circular portrait, tracked headers & clean timeline',
    badge: 'Canva Style',
  },
  {
    id: 'canva-editorial-split',
    name: 'Canva Editorial Bold',
    shortName: 'Editorial Bold',
    desc: 'Canva-inspired bold typographic nameplate with asymmetric callout sidebar & clean columns',
    badge: 'Canva Style',
  },
  {
    id: 'canva-monogram',
    name: 'Canva Monogram Studio',
    shortName: 'Monogram Studio',
    desc: 'Canva-inspired centered initials monogram card above balanced two-column career layout',
    badge: 'Canva Style',
  },
  {
    id: 'canva-dark-sidebar',
    name: 'Canva Charcoal Executive',
    shortName: 'Charcoal Exec',
    desc: 'Canva-inspired high-contrast dark sidebar with circular photo & bright structured main pane',
    badge: 'Canva Style',
  },
  {
    id: 'canva-ribbon',
    name: 'Canva Pastel Ribbon',
    shortName: 'Pastel Ribbon',
    desc: 'Canva-inspired soft tinted top banner ribbon with square section markers & skill chips',
    badge: 'Canva Style',
  },
  ...EXTRA_CANVA_TEMPLATES_LIST,
];

export interface ColorSwatch {
  label: string;
  value: string;
}

export interface ColorPaletteGroup {
  id: string;
  name: string;
  colors: ColorSwatch[];
}

export const COLOR_PALETTES: ColorPaletteGroup[] = [
  {
    id: 'pro-blue',
    name: 'Professional Blue',
    colors: [
      { label: 'Royal Blue', value: '#2563eb' },
      { label: 'Deep Navy', value: '#1e40af' },
      { label: 'Sky Slate', value: '#0284c7' },
      { label: 'Steel Blue', value: '#0369a1' },
    ],
  },
  {
    id: 'corporate',
    name: 'Corporate',
    colors: [
      { label: 'Slate Navy', value: '#1e293b' },
      { label: 'Corporate Slate', value: '#334155' },
      { label: 'Charcoal', value: '#475569' },
      { label: 'Midnight', value: '#0f172a' },
    ],
  },
  {
    id: 'neutral',
    name: 'Elegant Neutral',
    colors: [
      { label: 'Zinc Neutral', value: '#52525b' },
      { label: 'Graphite', value: '#71717a' },
      { label: 'Warm Stone', value: '#57534e' },
      { label: 'Taupe', value: '#44403c' },
    ],
  },
  {
    id: 'emerald',
    name: 'Emerald',
    colors: [
      { label: 'Emerald Green', value: '#059669' },
      { label: 'Forest Green', value: '#047857' },
      { label: 'Teal Pine', value: '#0d9488' },
      { label: 'Mint Jade', value: '#10b981' },
    ],
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    colors: [
      { label: 'Burgundy Wine', value: '#881337' },
      { label: 'Crimson Deep', value: '#9f1239' },
      { label: 'Ruby Rose', value: '#be123c' },
      { label: 'Rose Berry', value: '#e11d48' },
    ],
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    colors: [
      { label: 'Pure Pitch', value: '#09090b' },
      { label: 'Obsidian Ink', value: '#18181b' },
      { label: 'Onyx Slate', value: '#27272a' },
      { label: 'Carbon Gray', value: '#3f3f46' },
    ],
  },
  {
    id: 'purple',
    name: 'Modern Purple',
    colors: [
      { label: 'Electric Purple', value: '#7c3aed' },
      { label: 'Violet Indigo', value: '#6d28d9' },
      { label: 'Deep Royal', value: '#581c87' },
      { label: 'Vibrant Indigo', value: '#4f46e5' },
    ],
  },
  {
    id: 'teal',
    name: 'Teal',
    colors: [
      { label: 'Deep Teal', value: '#0d9488' },
      { label: 'Ocean Teal', value: '#0f766e' },
      { label: 'Modern Teal', value: '#14b8a6' },
      { label: 'Cerulean', value: '#0891b2' },
    ],
  },
];

export const FONT_FAMILIES = [
  { id: 'Inter', name: 'Inter', category: 'Sans-Serif', stack: 'Inter, system-ui, -apple-system, sans-serif' },
  { id: 'Arial', name: 'Arial', category: 'Neutral Sans', stack: 'Arial, Helvetica, sans-serif' },
  { id: 'Calibri', name: 'Calibri', category: 'Warm Sans', stack: 'Calibri, Candara, Segoe, "Segoe UI", sans-serif' },
  { id: 'Roboto', name: 'Roboto', category: 'Geometric Sans', stack: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'Lato', name: 'Lato', category: 'Friendly Sans', stack: 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'Open Sans', name: 'Open Sans', category: 'Neutral Sans', stack: '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'Poppins', name: 'Poppins', category: 'Modern Geometric', stack: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'Montserrat', name: 'Montserrat', category: 'Editorial Sans', stack: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'Source Sans 3', name: 'Source Sans 3', category: 'Technical Sans', stack: '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'Georgia', name: 'Georgia', category: 'Editorial Serif', stack: 'Georgia, serif' },
  { id: 'Garamond', name: 'Garamond', category: 'Literary Serif', stack: 'Garamond, "EB Garamond", serif' },
  { id: 'Times New Roman', name: 'Times New Roman', category: 'Academic Serif', stack: '"Times New Roman", Times, serif' },
];

export interface BuiltinPreset {
  id: string;
  name: string;
  desc: string;
  template: ResumeTemplateId;
  primaryColor: string;
  font: string;
  density: 'compact' | 'normal' | 'relaxed';
  pageMargin: number;
  sectionGap: number;
  lineHeight: number;
}

export const BUILTIN_DESIGN_PRESETS: BuiltinPreset[] = [
  {
    id: 'modern-prof',
    name: 'Modern Professional',
    desc: 'Clean Inter typography with Royal Blue accents and balanced density',
    template: 'modern',
    primaryColor: '#2563eb',
    font: 'Inter',
    density: 'normal',
    pageMargin: 20,
    sectionGap: 16,
    lineHeight: 1.45,
  },
  {
    id: 'classic-formal',
    name: 'Classic Formal',
    desc: 'Times New Roman academic precision with Corporate Slate tones',
    template: 'classic',
    primaryColor: '#1e293b',
    font: 'Times New Roman',
    density: 'normal',
    pageMargin: 20,
    sectionGap: 16,
    lineHeight: 1.45,
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    desc: 'High-density ATS layout with Obsidian Ink contrast and compact spacing',
    template: 'minimal-ats',
    primaryColor: '#18181b',
    font: 'Inter',
    density: 'compact',
    pageMargin: 14,
    sectionGap: 12,
    lineHeight: 1.35,
  },
  {
    id: 'elegant',
    name: 'Elegant',
    desc: 'Editorial Georgia serif styling with rich Burgundy Wine accents',
    template: 'elegant-serif',
    primaryColor: '#9f1239',
    font: 'Georgia',
    density: 'relaxed',
    pageMargin: 24,
    sectionGap: 18,
    lineHeight: 1.55,
  },
];

type CategoryId = 'template' | 'color' | 'typography' | 'spacing' | 'canva';
type FormattingTarget = 'name' | 'headings' | 'subheadings' | 'body';

interface DesignStudioProps {
  template: ResumeTemplateId;
  onSelectTemplate: (templateId: ResumeTemplateId) => void;
  settings: ResumeSettings;
  onUpdateSettings: (settings: ResumeSettings) => void;
  className?: string;
  variant?: 'toolbar' | 'nav';
}

const STORAGE_CUSTOM_PRESETS_KEY = 'resuvo_custom_design_presets';
const STORAGE_RECENT_COLORS_KEY = 'resuvo_recent_colors';
const STORAGE_SAVED_COLORS_KEY = 'resuvo_custom_saved_colors';

export const DesignStudio: React.FC<DesignStudioProps> = ({
  template,
  onSelectTemplate,
  settings,
  onUpdateSettings,
  className = '',
  variant = 'nav',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPresetsExpanded, setIsPresetsExpanded] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<CategoryId | null>('template');
  const [templateFilterTab, setTemplateFilterTab] = useState<'all' | 'canva' | 'core'>('all');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [selectedPaletteTab, setSelectedPaletteTab] = useState<string>('pro-blue');
  const [formattingTarget, setFormattingTarget] = useState<FormattingTarget>('name');
  const [customPresetName, setCustomPresetName] = useState('');
  const [showPresetSaveInput, setShowPresetSaveInput] = useState(false);
  const [savedPresets, setSavedPresets] = useState<CustomDesignPreset[]>([]);
  const [recentColors, setRecentColors] = useState<string[]>(['#2563eb', '#1e293b', '#059669', '#9f1239']);
  const [savedCustomColors, setSavedCustomColors] = useState<string[]>([]);
  
  // Design History for Undo
  const [history, setHistory] = useState<{ template: ResumeTemplateId; settings: ResumeSettings }[]>([]);
  const isUndoingRef = useRef(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keep presets collapsed whenever Design Studio opens or closes
  useEffect(() => {
    if (!isOpen) {
      setIsPresetsExpanded(false);
      setShowPresetSaveInput(false);
    }
  }, [isOpen]);

  // Load saved custom presets and colors from localStorage on mount
  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem(STORAGE_CUSTOM_PRESETS_KEY);
      if (storedPresets) {
        setSavedPresets(JSON.parse(storedPresets));
      }
      const storedRecent = localStorage.getItem(STORAGE_RECENT_COLORS_KEY);
      if (storedRecent) {
        setRecentColors(JSON.parse(storedRecent));
      }
      const storedCustom = localStorage.getItem(STORAGE_SAVED_COLORS_KEY);
      if (storedCustom) {
        setSavedCustomColors(JSON.parse(storedCustom));
      }
    } catch (e) {
      console.warn('Failed to load design studio local state:', e);
    }
  }, []);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Safe defaults
  const typography: ResumeTypographySettings = settings.typography || {
    fontFamily: 'Inter',
    nameSize: 26,
    headingSize: 14,
    bodySize: 11,
    formatting: {
      name: { bold: true, italic: false, underline: false, weight: 'bold' },
      headings: { bold: true, italic: false, underline: false, weight: 'semibold' },
      subheadings: { bold: true, italic: false, underline: false, weight: 'medium' },
      body: { bold: false, italic: false, underline: false, weight: 'regular' },
    },
  };

  const formatting = typography.formatting || {
    name: { bold: true, italic: false, underline: false, weight: 'bold' },
    headings: { bold: true, italic: false, underline: false, weight: 'semibold' },
    subheadings: { bold: true, italic: false, underline: false, weight: 'medium' },
    body: { bold: false, italic: false, underline: false, weight: 'regular' },
  };

  const layout: ResumeLayoutSettings = settings.layout || {
    pageMargin: 20,
    sectionGap: 16,
    lineHeight: 1.45,
    contentDensity: 'normal',
  };

  // Push current state to undo history before making updates
  const pushHistory = () => {
    if (isUndoingRef.current) return;
    setHistory((prev) => [
      { template, settings: JSON.parse(JSON.stringify(settings)) },
      ...prev.slice(0, 14), // keep last 15 states
    ]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const [previousState, ...remaining] = history;
    isUndoingRef.current = true;
    onSelectTemplate(previousState.template);
    onUpdateSettings(previousState.settings);
    setHistory(remaining);
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 50);
  };

  const updateTypography = (updates: Partial<ResumeTypographySettings>) => {
    pushHistory();
    onUpdateSettings({
      ...settings,
      typography: {
        ...typography,
        ...updates,
      },
    });
  };

  const updateFormatting = (target: FormattingTarget, updates: Partial<TextFormatting>) => {
    pushHistory();
    const currentTargetFormat = formatting[target] || {
      bold: target !== 'body',
      italic: false,
      underline: false,
      weight: target === 'name' ? 'bold' : target === 'headings' ? 'semibold' : target === 'subheadings' ? 'medium' : 'regular',
    };

    const newTargetFormat: TextFormatting = {
      ...currentTargetFormat,
      ...updates,
    };

    onUpdateSettings({
      ...settings,
      typography: {
        ...typography,
        formatting: {
          ...formatting,
          [target]: newTargetFormat,
        },
      },
    });
  };

  const updateLayout = (updates: Partial<ResumeLayoutSettings>) => {
    pushHistory();
    onUpdateSettings({
      ...settings,
      layout: {
        ...layout,
        ...updates,
      },
      spacing: updates.contentDensity ? updates.contentDensity : settings.spacing,
    });
  };

  const recordRecentColor = (color: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return;
    const lower = color.toLowerCase();
    const updated = [lower, ...recentColors.filter((c) => c.toLowerCase() !== lower)].slice(0, 6);
    setRecentColors(updated);
    try {
      localStorage.setItem(STORAGE_RECENT_COLORS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent colors:', e);
    }
  };

  const handleSelectColor = (color: string) => {
    pushHistory();
    recordRecentColor(color);
    onUpdateSettings({
      ...settings,
      primaryColor: color,
    });
  };

  const handleSaveCustomColor = (color: string) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return;
    const lower = color.toLowerCase();
    if (!savedCustomColors.includes(lower)) {
      const updated = [lower, ...savedCustomColors].slice(0, 8);
      setSavedCustomColors(updated);
      try {
        localStorage.setItem(STORAGE_SAVED_COLORS_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save custom colors:', e);
      }
    }
  };

  const handleDensityChange = (density: 'compact' | 'normal' | 'relaxed') => {
    pushHistory();
    if (density === 'compact') {
      updateLayout({
        contentDensity: 'compact',
        pageMargin: 14,
        sectionGap: 10,
        lineHeight: 1.3,
      });
      updateTypography({
        nameSize: 22,
        headingSize: 13,
        bodySize: 10.5,
      });
    } else if (density === 'relaxed') {
      updateLayout({
        contentDensity: 'relaxed',
        pageMargin: 24,
        sectionGap: 20,
        lineHeight: 1.6,
      });
      updateTypography({
        nameSize: 28,
        headingSize: 15,
        bodySize: 11.5,
      });
    } else {
      updateLayout({
        contentDensity: 'normal',
        pageMargin: 20,
        sectionGap: 16,
        lineHeight: 1.45,
      });
      updateTypography({
        nameSize: 26,
        headingSize: 14,
        bodySize: 11,
      });
    }
  };

  // Reset category handlers
  const handleResetTypography = () => {
    pushHistory();
    updateTypography({
      fontFamily: 'Inter',
      nameSize: 26,
      headingSize: 14,
      bodySize: 11,
      formatting: {
        name: { bold: true, italic: false, underline: false, weight: 'bold' },
        headings: { bold: true, italic: false, underline: false, weight: 'semibold' },
        subheadings: { bold: true, italic: false, underline: false, weight: 'medium' },
        body: { bold: false, italic: false, underline: false, weight: 'regular' },
      },
    });
  };

  const handleResetColors = () => {
    pushHistory();
    handleSelectColor('#2563eb');
  };

  const handleResetLayout = () => {
    pushHistory();
    updateLayout({
      contentDensity: 'normal',
      pageMargin: 20,
      sectionGap: 16,
      lineHeight: 1.45,
    });
  };

  const handleResetAllDesign = () => {
    if (
      typeof window !== 'undefined' &&
      !window.confirm('Reset all design styling to default? Your resume text and content will not be modified.')
    ) {
      return;
    }
    pushHistory();
    onSelectTemplate('academic');
    onUpdateSettings({
      ...settings,
      template: 'academic',
      primaryColor: '#2563eb',
      fontFamily: 'sans',
      spacing: 'normal',
      typography: {
        fontFamily: 'Inter',
        nameSize: 26,
        headingSize: 14,
        bodySize: 11,
        formatting: {
          name: { bold: true, italic: false, underline: false, weight: 'bold' },
          headings: { bold: true, italic: false, underline: false, weight: 'semibold' },
          subheadings: { bold: true, italic: false, underline: false, weight: 'medium' },
          body: { bold: false, italic: false, underline: false, weight: 'regular' },
        },
      },
      layout: {
        pageMargin: 20,
        sectionGap: 16,
        lineHeight: 1.45,
        contentDensity: 'normal',
      },
    });
    setIsPresetsExpanded(false);
  };

  // Apply Built-in Preset and auto-collapse dropdown
  const handleApplyBuiltinPreset = (preset: BuiltinPreset) => {
    pushHistory();
    onSelectTemplate(preset.template);
    onUpdateSettings({
      ...settings,
      template: preset.template,
      primaryColor: preset.primaryColor,
      typography: {
        ...typography,
        fontFamily: preset.font,
      },
      layout: {
        ...layout,
        contentDensity: preset.density,
        pageMargin: preset.pageMargin,
        sectionGap: preset.sectionGap,
        lineHeight: preset.lineHeight,
      },
      spacing: preset.density,
    });
    // Automatically collapse Design Presets accordion
    setIsPresetsExpanded(false);
  };

  // Custom Presets
  const handleSaveCurrentAsPreset = () => {
    const trimmed = customPresetName.trim();
    if (!trimmed) return;
    const newPreset: CustomDesignPreset = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      template,
      primaryColor: settings.primaryColor,
      typography,
      layout,
      createdAt: Date.now(),
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOM_PRESETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save preset:', e);
    }
    setCustomPresetName('');
    setShowPresetSaveInput(false);
  };

  const handleApplyCustomPreset = (preset: CustomDesignPreset) => {
    pushHistory();
    onSelectTemplate(preset.template);
    onUpdateSettings({
      ...settings,
      template: preset.template,
      primaryColor: preset.primaryColor,
      typography: preset.typography,
      layout: preset.layout,
      spacing: preset.layout.contentDensity,
    });
    // Automatically collapse Design Presets accordion
    setIsPresetsExpanded(false);
  };

  const handleDeleteCustomPreset = (presetId: string, presetName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      typeof window !== 'undefined' &&
      !window.confirm(`Delete saved design preset "${presetName}"?`)
    ) {
      return;
    }
    const updated = savedPresets.filter((p) => p.id !== presetId);
    setSavedPresets(updated);
    try {
      localStorage.setItem(STORAGE_CUSTOM_PRESETS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to delete preset:', err);
    }
  };

  const activeColor = settings.primaryColor || '#2563eb';

  const toggleCategory = (cat: CategoryId) => {
    setExpandedCategory(expandedCategory === cat ? null : cat);
  };

  const currentTemplateObj = TEMPLATES.find((t) => t.id === template) || TEMPLATES[0];

  const currentTargetFormat = formatting[formattingTarget] || {
    bold: formattingTarget !== 'body',
    italic: false,
    underline: false,
    weight: formattingTarget === 'name' ? 'bold' : formattingTarget === 'headings' ? 'semibold' : formattingTarget === 'subheadings' ? 'medium' : 'regular',
  };

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={dropdownRef}>
      {/* 1. Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={
          variant === 'nav'
            ? `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isOpen
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            : `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer border shadow-2xs ${
                isOpen
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-400'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`
        }
        title="Design Studio: Customise template style, accent colours, typography & spacing"
      >
        <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span>Design Studio</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
          }`}
        />
      </button>

      {/* 2. Compact Nested Dropdown Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Design Studio Options"
          className="absolute right-0 mt-2 w-[min(460px,calc(100vw-2rem))] max-h-[min(650px,calc(100vh-5rem))] overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs text-slate-800 dark:text-slate-200 divide-y divide-slate-100 dark:divide-slate-800/80"
        >
          {/* Header with Undo and Reset All */}
          <div className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-950/60 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 backdrop-blur-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-2xs">
                <Sparkles className="w-3 h-3" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Design Studio
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">
                  • Instant Sync
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Undo button */}
              <button
                type="button"
                onClick={handleUndo}
                disabled={history.length === 0}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  history.length > 0
                    ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50'
                }`}
                title={history.length > 0 ? 'Undo last design change' : 'No recent design change to undo'}
              >
                <Undo2 className="w-3 h-3" />
                <span>Undo</span>
              </button>

              {/* Reset All Design Settings */}
              <button
                type="button"
                onClick={handleResetAllDesign}
                className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Reset all design settings to default without modifying resume content"
              >
                Reset All
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                aria-label="Close Design Studio"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Design Presets Accordion (Collapsed by default) */}
          <div className="border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPresetsExpanded(!isPresetsExpanded)}
              aria-expanded={isPresetsExpanded}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-950/30"
            >
              <div className="flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  Design Presets
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  • 4 Curated Looks & Custom Styles
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                  isPresetsExpanded ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>

            {isPresetsExpanded && (
              <div className="p-3 bg-slate-50/70 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Select a Preset Look
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPresetSaveInput(!showPresetSaveInput)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Save Current Look
                  </button>
                </div>

                {/* Save current design preset mini-form */}
                {showPresetSaveInput && (
                  <div className="p-2 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 animate-in fade-in duration-100">
                    <input
                      type="text"
                      placeholder="e.g. My Tech Lead Resume"
                      value={customPresetName}
                      onChange={(e) => setCustomPresetName(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveCurrentAsPreset();
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveCurrentAsPreset}
                      disabled={!customPresetName.trim()}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-40 cursor-pointer shrink-0 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPresetSaveInput(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Builtin Presets Cards */}
                <div className="grid grid-cols-2 gap-1.5">
                  {BUILTIN_DESIGN_PRESETS.map((p) => {
                    const isCurrent =
                      template === p.template &&
                      activeColor.toLowerCase() === p.primaryColor.toLowerCase() &&
                      typography.fontFamily === p.font;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleApplyBuiltinPreset(p)}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          isCurrent
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-2xs ring-1 ring-indigo-400'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] flex items-center gap-1">
                            {p.name}
                            {isCurrent && (
                              <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                          </span>
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs border border-white"
                            style={{ backgroundColor: p.primaryColor }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {p.font} • {p.desc.split(' with ')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Saved Presets (if any) */}
                {savedPresets.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Your Custom Presets
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {savedPresets.map((sp) => (
                        <div
                          key={sp.id}
                          className="group flex items-center gap-1.5 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                        >
                          <button
                            type="button"
                            onClick={() => handleApplyCustomPreset(sp)}
                            className="cursor-pointer font-medium hover:text-indigo-600 truncate max-w-[130px] flex items-center gap-1"
                            title={`Apply ${sp.name}`}
                          >
                            <span>{sp.name}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomPreset(sp.id, sp.name, e)}
                            className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5"
                            title={`Delete custom preset "${sp.name}"`}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* =========================================================================
              CATEGORY 1: TEMPLATE STYLE
             ========================================================================= */}
          <div>
            <button
              type="button"
              onClick={() => toggleCategory('template')}
              aria-expanded={expandedCategory === 'template'}
              className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                  <Layout className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <span>1. Template Style</span>
                    <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                      ({TEMPLATES.length} Styles)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Active: <strong className="text-slate-700 dark:text-slate-300 font-medium">{currentTemplateObj.name}</strong>
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${
                  expandedCategory === 'template' ? 'rotate-90 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>

            {expandedCategory === 'template' && (
              <div className="px-3.5 pb-3.5 pt-2 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 space-y-2">
                {/* Filter + Search controls for 48 templates */}
                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={templateSearchQuery}
                      onChange={(e) => setTemplateSearchQuery(e.target.value)}
                      placeholder="Filter 48 templates (e.g. Canva, Sidebar, Serif)..."
                      className="w-full pl-7 pr-7 py-1 text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    />
                    {templateSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTemplateSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        aria-label="Clear template search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10.5px]">
                    {[
                      { id: 'all' as const, label: `All (${TEMPLATES.length})` },
                      { id: 'canva' as const, label: `Canva Styles (${TEMPLATES.filter((t) => t.id.startsWith('canva-')).length})` },
                      { id: 'core' as const, label: `Core & ATS (${TEMPLATES.filter((t) => !t.id.startsWith('canva-')).length})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setTemplateFilterTab(tab.id)}
                        className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors whitespace-nowrap ${
                          templateFilterTab === tab.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
                  {TEMPLATES.filter((t) => {
                    if (templateFilterTab === 'canva' && !t.id.startsWith('canva-')) return false;
                    if (templateFilterTab === 'core' && t.id.startsWith('canva-')) return false;
                    const q = templateSearchQuery.trim().toLowerCase();
                    if (!q) return true;
                    const cfg = TEMPLATE_SHOWCASE_CONFIGS[t.id];
                    return (
                      t.name.toLowerCase().includes(q) ||
                      t.shortName.toLowerCase().includes(q) ||
                      t.desc.toLowerCase().includes(q) ||
                      cfg.styleLabel.toLowerCase().includes(q) ||
                      cfg.sampleData.personal.title.toLowerCase().includes(q)
                    );
                  }).map((t) => {
                    const isSelected = template === t.id;
                    const cfg = TEMPLATE_SHOWCASE_CONFIGS[t.id];
                    const thumbSettings = getSampleSettingsForTemplate(t.id, cfg.defaultColor);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          pushHistory();
                          onSelectTemplate(t.id);
                        }}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 ring-1 ring-indigo-400 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <div className="relative w-full">
                          <ScaledTemplatePreview
                            data={cfg.sampleData}
                            template={t.id}
                            settings={thumbSettings}
                            aspectClass="aspect-[210/210]"
                          />
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={`font-semibold text-[11px] line-clamp-1 ${
                              isSelected
                                ? 'text-indigo-900 dark:text-indigo-200'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {t.shortName}
                          </span>
                          <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                            {cfg.styleLabel}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CATEGORY 2: ACCENT COLOURS
             ========================================================================= */}
          <div>
            <button
              type="button"
              onClick={() => toggleCategory('color')}
              aria-expanded={expandedCategory === 'color'}
              className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                  <Palette className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <span>2. Accent Colours</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300 dark:border-slate-700 shadow-2xs"
                      style={{ backgroundColor: activeColor }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Active: <code className="font-mono text-[10px] text-slate-700 dark:text-slate-300 font-semibold">{activeColor}</code>
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${
                  expandedCategory === 'color' ? 'rotate-90 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>

            {expandedCategory === 'color' && (
              <div className="px-3.5 pb-3.5 pt-2 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {/* Header row with Reset */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Curated Palettes ({COLOR_PALETTES.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleResetColors}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Default
                  </button>
                </div>

                {/* Palette Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                  {COLOR_PALETTES.map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setSelectedPaletteTab(pal.id)}
                      className={`px-2 py-1 rounded text-[10.5px] font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                        selectedPaletteTab === pal.id
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {pal.name}
                    </button>
                  ))}
                </div>

                {/* Active Palette Swatches */}
                {(() => {
                  const currentPal = COLOR_PALETTES.find((p) => p.id === selectedPaletteTab) || COLOR_PALETTES[0];
                  return (
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        {currentPal.name} Swatches
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {currentPal.colors.map((swatch) => {
                          const isSelected = activeColor.toLowerCase() === swatch.value.toLowerCase();
                          return (
                            <button
                              key={swatch.value}
                              type="button"
                              onClick={() => handleSelectColor(swatch.value)}
                              className={`flex items-center gap-2 p-1.5 rounded-md border text-left cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-400'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-2xs"
                                style={{ backgroundColor: swatch.value }}
                              />
                              <div className="min-w-0">
                                <div className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                                  {swatch.label}
                                </div>
                                <div className="text-[9.5px] font-mono text-slate-400">
                                  {swatch.value}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Custom Color Input & Hex Code */}
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Custom Accent Colour
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSaveCustomColor(activeColor)}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      Save to My Colours
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative shrink-0">
                      <input
                        type="color"
                        value={activeColor.startsWith('#') ? activeColor : '#2563eb'}
                        onChange={(e) => handleSelectColor(e.target.value)}
                        className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0 overflow-hidden"
                        title="Pick custom color"
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-1.5">
                      <span className="text-slate-400 font-mono text-xs font-bold">#</span>
                      <input
                        type="text"
                        value={activeColor.replace(/^#/, '')}
                        maxLength={6}
                        onChange={(e) => {
                          const hex = `#${e.target.value.replace(/[^0-9A-Fa-f]/g, '')}`;
                          if (hex.length === 7) {
                            handleSelectColor(hex);
                          }
                        }}
                        placeholder="2563eb"
                        className="flex-1 px-2 py-1 text-xs font-mono uppercase bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Recently Used & Saved Colours */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Recent */}
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Recent Colours
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentColors.map((rc, i) => (
                        <button
                          key={`${rc}-${i}`}
                          type="button"
                          onClick={() => handleSelectColor(rc)}
                          style={{ backgroundColor: rc }}
                          className={`w-5 h-5 rounded-md border shadow-2xs cursor-pointer transition-transform hover:scale-110 ${
                            activeColor.toLowerCase() === rc.toLowerCase()
                              ? 'ring-2 ring-indigo-500 border-white'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                          title={rc}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Saved Custom Palette */}
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Saved Palette
                    </div>
                    {savedCustomColors.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {savedCustomColors.map((sc, i) => (
                          <button
                            key={`${sc}-${i}`}
                            type="button"
                            onClick={() => handleSelectColor(sc)}
                            style={{ backgroundColor: sc }}
                            className={`w-5 h-5 rounded-md border shadow-2xs cursor-pointer transition-transform hover:scale-110 ${
                              activeColor.toLowerCase() === sc.toLowerCase()
                                ? 'ring-2 ring-indigo-500 border-white'
                                : 'border-slate-200 dark:border-slate-700'
                            }`}
                            title={sc}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400 italic">
                        Click "Save to My Colours" to build your palette
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CATEGORY 3: TYPOGRAPHY
             ========================================================================= */}
          <div>
            <button
              type="button"
              onClick={() => toggleCategory('typography')}
              aria-expanded={expandedCategory === 'typography'}
              className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40">
                  <Type className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <span>3. Typography</span>
                    <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                      ({FONT_FAMILIES.length} Fonts)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Font: <strong className="text-slate-700 dark:text-slate-300 font-medium">{typography.fontFamily || 'Inter'}</strong> • {typography.bodySize}px body
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${
                  expandedCategory === 'typography' ? 'rotate-90 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>

            {expandedCategory === 'typography' && (
              <div className="px-3.5 pb-3.5 pt-2 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {/* Header with Reset */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Font Family Selection
                  </span>
                  <button
                    type="button"
                    onClick={handleResetTypography}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Default
                  </button>
                </div>

                {/* 12 Professional Fonts with Visual Font Preview */}
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {FONT_FAMILIES.map((f) => {
                    const isSelected = (typography.fontFamily || 'Inter') === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => updateTypography({ fontFamily: f.id })}
                        className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-400 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-semibold text-slate-800 dark:text-slate-200"
                            style={{ fontFamily: f.stack }}
                          >
                            {f.name}
                          </span>
                          {isSelected && (
                            <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </div>
                        <div
                          className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5"
                          style={{ fontFamily: f.stack }}
                        >
                          The quick brown fox
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Text Formatting by Target (Candidate Name, Headings, Subheadings, Body) */}
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Formatting & Font Weight
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Configure per element
                    </span>
                  </div>

                  {/* Target Selector Tabs */}
                  <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {[
                      { id: 'name' as FormattingTarget, label: 'Name' },
                      { id: 'headings' as FormattingTarget, label: 'Headings' },
                      { id: 'subheadings' as FormattingTarget, label: 'Subhead' },
                      { id: 'body' as FormattingTarget, label: 'Body' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFormattingTarget(tab.id)}
                        className={`py-1 text-[10.5px] font-semibold rounded cursor-pointer transition-colors ${
                          formattingTarget === tab.id
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Formatting Controls for Active Target */}
                  <div className="pt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                    {/* B / I / U Toggles */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateFormatting(formattingTarget, { bold: !currentTargetFormat.bold })}
                        className={`w-7 h-7 rounded text-xs font-bold cursor-pointer transition-colors ${
                          currentTargetFormat.bold
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title="Toggle Bold"
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormatting(formattingTarget, { italic: !currentTargetFormat.italic })}
                        className={`w-7 h-7 rounded text-xs font-serif italic cursor-pointer transition-colors ${
                          currentTargetFormat.italic
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title="Toggle Italic"
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => updateFormatting(formattingTarget, { underline: !currentTargetFormat.underline })}
                        className={`w-7 h-7 rounded text-xs underline cursor-pointer transition-colors ${
                          currentTargetFormat.underline
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                        title="Toggle Underline"
                      >
                        U
                      </button>
                    </div>

                    {/* Font Weight Options */}
                    <div className="flex items-center gap-1">
                      {(['regular', 'medium', 'semibold', 'bold'] as FontWeight[]).map((wt) => {
                        const isSelected = (currentTargetFormat.weight || 'regular') === wt;
                        return (
                          <button
                            key={wt}
                            type="button"
                            onClick={() => updateFormatting(formattingTarget, { weight: wt })}
                            className={`px-1.5 py-1 rounded text-[10px] font-medium capitalize cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {wt === 'regular' ? 'Reg' : wt === 'medium' ? 'Med' : wt === 'semibold' ? 'Semi' : 'Bold'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Font Sizes Sliders */}
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Proportional Font Sizing
                  </div>

                  {/* Candidate Name Size */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Candidate Name</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {typography.nameSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={36}
                      step={1}
                      value={typography.nameSize}
                      onChange={(e) => updateTypography({ nameSize: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  {/* Section Headings Size */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Section Headings</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {typography.headingSize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={20}
                      step={0.5}
                      value={typography.headingSize}
                      onChange={(e) => updateTypography({ headingSize: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  {/* Body Text Size */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Body & Details Text</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {typography.bodySize}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={14}
                      step={0.5}
                      value={typography.bodySize}
                      onChange={(e) => updateTypography({ bodySize: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CATEGORY 4: SPACING & LAYOUT
             ========================================================================= */}
          <div>
            <button
              type="button"
              onClick={() => toggleCategory('spacing')}
              aria-expanded={expandedCategory === 'spacing'}
              className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    4. Spacing & Layout
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Density: <strong className="text-slate-700 dark:text-slate-300 font-medium capitalize">{layout.contentDensity || 'normal'}</strong> • {layout.pageMargin}mm margins
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${
                  expandedCategory === 'spacing' ? 'rotate-90 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>

            {expandedCategory === 'spacing' && (
              <div className="px-3.5 pb-3.5 pt-2 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {/* Header with Reset */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-600 dark:text-slate-400">
                    Content Density Presets
                  </span>
                  <button
                    type="button"
                    onClick={handleResetLayout}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Default
                  </button>
                </div>

                {/* Density Buttons */}
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'compact', label: 'Compact', desc: '14mm • Dense' },
                    { id: 'normal', label: 'Balanced', desc: '20mm • Standard' },
                    { id: 'relaxed', label: 'Spacious', desc: '24mm • Airy' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleDensityChange(d.id as any)}
                      className={`p-2 rounded-lg border text-center cursor-pointer transition-colors ${
                        layout.contentDensity === d.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-400 font-semibold shadow-xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{d.label}</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">{d.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Granular Sliders */}
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Granular Dimension Tuning
                  </div>

                  {/* Page Margins */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Page Margins</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {layout.pageMargin}mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={30}
                      step={1}
                      value={layout.pageMargin}
                      onChange={(e) => updateLayout({ pageMargin: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  {/* Section Gap */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Section Spacing</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {layout.sectionGap}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={28}
                      step={1}
                      value={layout.sectionGap}
                      onChange={(e) => updateLayout({ sectionGap: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>

                  {/* Line Height */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Line Height</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        {layout.lineHeight}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1.2}
                      max={1.8}
                      step={0.05}
                      value={layout.lineHeight}
                      onChange={(e) => updateLayout({ lineHeight: Number(e.target.value) })}
                      className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              CATEGORY 5: EXPLORE CANVA TEMPLATES
             ========================================================================= */}
          <div>
            <button
              type="button"
              onClick={() => toggleCategory('canva')}
              aria-expanded={expandedCategory === 'canva'}
              className="w-full px-3.5 py-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/40">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                    <span>5. Explore Canva Templates</span>
                    <span className="text-[9px] font-bold px-1 py-0.2 bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 rounded uppercase">
                      External
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Inspiration & graphics gallery
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform duration-150 shrink-0 ${
                  expandedCategory === 'canva' ? 'rotate-90 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              />
            </button>

            {expandedCategory === 'canva' && (
              <div className="px-3.5 pb-3.5 pt-1 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Need additional creative layouts or graphical elements? Explore Canva's extensive resume library in a new tab:
                  </p>
                  <a
                    href="https://www.canva.com/resumes/templates/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <span>Browse Canva Templates</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
