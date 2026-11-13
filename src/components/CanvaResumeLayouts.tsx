import React from 'react';
import { ExtraCanvaTemplateId, ResumeData, ResumeSettings } from '../types/resume';
import {
  CanvaLayoutRecipe,
  CanvaSectionStyle,
  CanvaSkillStyle,
  EXTRA_CANVA_RECIPES,
} from '../data/canvaTemplates';

interface CanvaResumeRendererProps {
  templateId: ExtraCanvaTemplateId;
  data: ResumeData;
  settings: ResumeSettings;
  primaryColor: string;
  lineHeight: number;
  pageMargin: number;
  sectionGap: number;
  validateAndFormatUrl: (url?: string) => { isValid: boolean; href: string; display: string };
  renderDeclaration: (variant: 'academic' | 'traditional') => React.ReactNode;
}

const getInitials = (fullName?: string) => {
  const initials = (fullName || 'AB')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('');
  return initials || 'CV';
};

export const CanvaResumeRenderer: React.FC<CanvaResumeRendererProps> = ({
  templateId,
  data,
  settings,
  primaryColor,
  lineHeight,
  pageMargin,
  sectionGap,
  validateAndFormatUrl,
  renderDeclaration,
}) => {
  const recipe: CanvaLayoutRecipe = EXTRA_CANVA_RECIPES[templateId];
  const {
    personal,
    summary,
    experience,
    education,
    skillCategories,
    projects,
    certifications,
    customSections,
    declaration,
  } = data;
  const { visibleSections } = settings;

  const isSidebarColored =
    recipe.layoutStructure === 'left-sidebar-colored' ||
    recipe.layoutStructure === 'right-sidebar-colored';
  const isSidebarTinted =
    recipe.layoutStructure === 'left-sidebar-tinted' ||
    recipe.layoutStructure === 'right-sidebar-tinted';
  const isRightSidebar =
    recipe.layoutStructure === 'right-sidebar-colored' ||
    recipe.layoutStructure === 'right-sidebar-tinted';

  const contactItems: string[] = [];
  if (personal.email) contactItems.push(personal.email);
  if (personal.phone) contactItems.push(personal.phone);
  if (personal.location) contactItems.push(personal.location);
  const ln = validateAndFormatUrl(personal.linkedin);
  if (ln.isValid) contactItems.push(ln.display);
  const gh = validateAndFormatUrl(personal.github);
  if (gh.isValid) contactItems.push(gh.display);
  const wb = validateAndFormatUrl(personal.website);
  if (wb.isValid) contactItems.push(wb.display);

  // =========================================================================
  // SECTION HEADING VARIANTS
  // =========================================================================
  const renderHeading = (
    title: string,
    indexNum: number,
    styleOverride?: CanvaSectionStyle,
    inverted = false
  ) => {
    const sStyle = styleOverride || recipe.sectionStyle;
    const textColor = inverted ? '#ffffff' : '#0f172a';
    const accent = inverted ? '#ffffff' : primaryColor;

    if (sStyle === 'numbered') {
      return (
        <div className="flex items-center gap-2 mb-2.5 pb-1 border-b" style={{ borderColor: `${primaryColor}35` }}>
          <span
            className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs text-white tabular-nums"
            style={{ backgroundColor: primaryColor }}
          >
            {String(indexNum).padStart(2, '0')}
          </span>
          <h2 className="text-xs font-extrabold uppercase tracking-wider" style={{ color: textColor }}>
            {title}
          </h2>
        </div>
      );
    }

    if (sStyle === 'highlighter') {
      return (
        <h2 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-900 inline-block">
          <span
            className="px-1.5 py-0.5 border-b-[3px]"
            style={{ backgroundColor: `${primaryColor}14`, borderColor: primaryColor }}
          >
            {title}
          </span>
        </h2>
      );
    }

    if (sStyle === 'left-tick') {
      return (
        <h2
          className="text-xs font-extrabold uppercase tracking-wider mb-2.5 pl-2.5 border-l-[3px]"
          style={{ borderColor: accent, color: textColor }}
        >
          {title}
        </h2>
      );
    }

    if (sStyle === 'pill-tag') {
      return (
        <div className="mb-2.5">
          <h2
            className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-xs"
            style={{
              backgroundColor: inverted ? 'rgba(255,255,255,0.18)' : `${primaryColor}15`,
              color: inverted ? '#ffffff' : primaryColor,
            }}
          >
            {title}
          </h2>
        </div>
      );
    }

    if (sStyle === 'double-rule') {
      return (
        <h2
          className="text-xs font-bold uppercase tracking-[0.18em] pb-1 mb-2.5 border-b-2 border-double"
          style={{ borderColor: inverted ? 'rgba(255,255,255,0.4)' : `${primaryColor}70`, color: inverted ? '#ffffff' : primaryColor }}
        >
          {title}
        </h2>
      );
    }

    if (sStyle === 'code-comment') {
      return (
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2 font-mono" style={{ color: primaryColor }}>
          // {title}
        </h2>
      );
    }

    if (sStyle === 'diamond') {
      return (
        <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2.5">
          <span
            className="w-2.5 h-2.5 rotate-45 inline-block shrink-0"
            style={{ backgroundColor: accent }}
          />
          <span style={{ color: textColor }}>{title}</span>
        </h2>
      );
    }

    return (
      <h2
        className="text-xs font-extrabold uppercase tracking-wider border-b-2 pb-1 mb-2.5"
        style={{ borderColor: inverted ? 'rgba(255,255,255,0.35)' : primaryColor, color: textColor }}
      >
        {title}
      </h2>
    );
  };

  // =========================================================================
  // SKILL LIST RENDERER
  // =========================================================================
  const renderSkills = (styleOverride?: CanvaSkillStyle, inverted = false) => {
    const skStyle = styleOverride || recipe.skillStyle;
    if (!visibleSections.skills || skillCategories.length === 0) return null;

    if (skStyle === 'inline-bars') {
      return (
        <div className="space-y-1.5 text-[11px]">
          {skillCategories.map((cat) => (
            <div key={cat.id} className="leading-snug">
              {cat.name && (
                <span className={`font-bold ${inverted ? 'text-white' : 'text-slate-900'}`}>
                  {cat.name}:{' '}
                </span>
              )}
              <span className={inverted ? 'text-white/85' : 'text-slate-700'}>
                {cat.skills.join(' · ')}
              </span>
            </div>
          ))}
        </div>
      );
    }

    if (skStyle === 'compact-grid') {
      return (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          {skillCategories.flatMap((cat) => cat.skills).map((skill, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: inverted ? '#ffffff' : primaryColor }}
              />
              <span className={inverted ? 'text-white/90' : 'text-slate-700'}>{skill}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {skillCategories.map((cat) => (
          <div key={cat.id}>
            {cat.name && (
              <div className={`text-[10.5px] font-bold mb-1 ${inverted ? 'text-white/90' : 'text-slate-800'}`}>
                {cat.name}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {cat.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded-xs font-medium border"
                  style={
                    inverted
                      ? {
                          backgroundColor: 'rgba(255,255,255,0.14)',
                          borderColor: 'rgba(255,255,255,0.28)',
                          color: '#ffffff',
                        }
                      : skStyle === 'outlined-tags'
                      ? {
                          backgroundColor: '#ffffff',
                          borderColor: `${primaryColor}55`,
                          color: '#1e293b',
                        }
                      : {
                          backgroundColor: `${primaryColor}12`,
                          borderColor: `${primaryColor}30`,
                          color: '#0f172a',
                        }
                  }
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // =========================================================================
  // EXPERIENCE ENTRIES
  // =========================================================================
  const renderExperienceList = (timelineSpine = false) => {
    if (!visibleSections.experience || experience.length === 0) return null;

    if (timelineSpine) {
      return (
        <div className="relative pl-5 space-y-4 border-l-2 ml-1.5" style={{ borderColor: `${primaryColor}40` }}>
          {experience.map((exp) => (
            <div key={exp.id} className="relative">
              <span
                className="w-3 h-3 rounded-full border-2 border-white shadow-2xs absolute -left-[27px] top-0.5"
                style={{ backgroundColor: primaryColor }}
              />
              <div className="flex flex-wrap justify-between items-baseline gap-1">
                <h3 className="text-xs font-bold text-slate-900">{exp.role}</h3>
                <span className="text-[10.5px] font-semibold" style={{ color: primaryColor }}>
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              <div className="text-[11px] font-medium text-slate-600 mb-1">
                {exp.company} {exp.location ? `· ${exp.location}` : ''}
              </div>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="list-disc list-outside ml-4 space-y-1 text-[11px] text-slate-700">
                  {exp.highlights.filter(Boolean).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-3.5">
        {experience.map((exp) => (
          <div key={exp.id}>
            <div className="flex flex-wrap justify-between items-baseline gap-1">
              <h3 className="text-xs font-bold text-slate-900">{exp.role}</h3>
              <span className="text-[10.5px] font-medium text-slate-500">
                {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            <div className="text-[11px] font-semibold mb-1" style={{ color: primaryColor }}>
              {exp.company} {exp.location ? `· ${exp.location}` : ''}
            </div>
            {exp.highlights && exp.highlights.length > 0 && (
              <ul className="list-disc list-outside ml-4 space-y-1 text-[11px] text-slate-700">
                {exp.highlights.filter(Boolean).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  // =========================================================================
  // EDUCATION / PROJECTS / CERTS HELPERS
  // =========================================================================
  const renderEducationList = (inverted = false) => {
    if (!visibleSections.education || education.length === 0) return null;
    return (
      <div className="space-y-2.5">
        {education.map((edu) => (
          <div key={edu.id} className="text-[11px]">
            <div className={`font-bold ${inverted ? 'text-white' : 'text-slate-900'}`}>{edu.degree}</div>
            <div className={inverted ? 'text-white/80' : 'text-slate-700'}>
              {edu.institution} {edu.location ? `· ${edu.location}` : ''}
            </div>
            <div className={`text-[10px] flex justify-between ${inverted ? 'text-white/65' : 'text-slate-500'}`}>
              <span>
                {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
              </span>
              {edu.gpa && <span className="font-semibold">GPA: {edu.gpa}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjectsList = () => {
    if (!visibleSections.projects || projects.length === 0) return null;
    return (
      <div className="space-y-2.5">
        {projects.map((p) => (
          <div key={p.id} className="text-[11px]">
            <div className="font-bold text-slate-900">
              {p.name}{' '}
              {p.techStack && (
                <span className="font-medium text-[10px]" style={{ color: primaryColor }}>
                  ({p.techStack})
                </span>
              )}
            </div>
            {p.description && <p className="text-slate-700 leading-snug mt-0.5">{p.description}</p>}
            {p.highlights && p.highlights.length > 0 && (
              <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-slate-700">
                {p.highlights.filter(Boolean).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCertsList = (inverted = false) => {
    if (!visibleSections.certifications || certifications.length === 0) return null;
    return (
      <div className="space-y-1.5 text-[11px]">
        {certifications.map((c) => (
          <div key={c.id} className="flex justify-between gap-2">
            <span className={inverted ? 'text-white/90' : 'text-slate-800'}>
              <strong>{c.name}</strong> {c.issuer ? `· ${c.issuer}` : ''}
            </span>
            {c.date && <span className={inverted ? 'text-white/65' : 'text-slate-500'}>{c.date}</span>}
          </div>
        ))}
      </div>
    );
  };

  // =========================================================================
  // TOP HEADER RENDERER FOR NON-SIDEBAR-INTEGRATED TEMPLATES
  // =========================================================================
  const renderTopHeader = () => {
    const hv = recipe.headerVariant;

    if (hv === 'obsidian-band' || hv === 'navy-crest') {
      const bgHex = recipe.darkSurfaceHex || primaryColor;
      return (
        <header
          className="px-8 py-6 text-white flex items-center justify-between gap-6"
          style={{ backgroundColor: bgHex }}
        >
          {hv === 'navy-crest' && personal.photo && (
            <div className="w-20 h-24 rounded-md overflow-hidden border-2 border-white/40 shrink-0 shadow-sm bg-white/10">
              <img src={personal.photo} alt={personal.fullName} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.title && (
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em] mt-1"
                style={{ color: recipe.darkSurfaceHex ? '#fbbf24' : 'rgba(255,255,255,0.85)' }}
              >
                {personal.title}
              </p>
            )}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[11px] text-white/85">
              {contactItems.map((item, idx) => (
                <span key={idx}>
                  {idx > 0 ? '· ' : ''}
                  {item}
                </span>
              ))}
            </div>
          </div>
        </header>
      );
    }

    if (hv === 'split-dual-band') {
      return (
        <header className="grid grid-cols-12 border-b" style={{ borderColor: `${primaryColor}30` }}>
          <div className="col-span-8 p-6 text-white" style={{ backgroundColor: primaryColor }}>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.title && (
              <p className="text-xs font-semibold uppercase tracking-widest text-white/85 mt-1">
                {personal.title}
              </p>
            )}
          </div>
          <div
            className="col-span-4 p-5 flex flex-col justify-center gap-1 text-[10.5px] text-slate-700"
            style={{ backgroundColor: `${primaryColor}12` }}
          >
            {contactItems.map((item, idx) => (
              <div key={idx} className="truncate font-medium">
                {item}
              </div>
            ))}
          </div>
        </header>
      );
    }

    if (hv === 'framed-nameplate') {
      return (
        <header className="pt-6 pb-4 px-8 text-center">
          <div className="relative flex flex-col items-center">
            {recipe.showMonogram && (
              <div
                className="w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold tracking-widest mb-2.5"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                {getInitials(personal.fullName)}
              </div>
            )}
            <div
              className="border-2 px-8 py-3.5 bg-white inline-block"
              style={{ borderColor: primaryColor }}
            >
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.title && (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] mt-1" style={{ color: primaryColor }}>
                  {personal.title}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-600">
              {contactItems.map((c, idx) => (
                <span key={idx}>
                  {idx > 0 ? '· ' : ''}
                  {c}
                </span>
              ))}
            </div>
          </div>
        </header>
      );
    }

    if (hv === 'editorial-masthead') {
      return (
        <header
          className="px-8 pt-6 pb-4 border-t-4 border-b-2 text-center"
          style={{ borderTopColor: primaryColor, borderBottomColor: `${primaryColor}35`, backgroundColor: `${primaryColor}06` }}
        >
          <div className="flex items-center justify-center gap-4">
            {recipe.showPhoto && personal.photo && (
              <img
                src={personal.photo}
                alt={personal.fullName}
                className="w-16 h-16 rounded-full object-cover border-2 shrink-0"
                style={{ borderColor: primaryColor }}
              />
            )}
            <div className={recipe.showPhoto && personal.photo ? 'text-left' : 'text-center'}>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.title && (
                <p className="text-xs italic font-semibold mt-0.5" style={{ color: primaryColor }}>
                  {personal.title}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-600 border-t border-slate-200 pt-2">
            {contactItems.map((c, idx) => (
              <span key={idx}>
                {idx > 0 ? ' | ' : ''}
                {c}
              </span>
            ))}
          </div>
        </header>
      );
    }

    if (hv === 'overlapping-portrait') {
      return (
        <header className="mb-3">
          <div className="h-14 w-full" style={{ backgroundColor: `${primaryColor}20` }} />
          <div className="px-8 -mt-9 flex items-end gap-5 pb-4 border-b border-slate-200">
            {personal.photo && (
              <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-white shadow-md bg-white shrink-0">
                <img src={personal.photo} alt={personal.fullName} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 pt-2">
              <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.title && (
                <p className="text-xs font-bold uppercase tracking-wider mt-0.5" style={{ color: primaryColor }}>
                  {personal.title}
                </p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-600">
                {contactItems.map((c, idx) => (
                  <span key={idx}>
                    {idx > 0 ? '· ' : ''}
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </header>
      );
    }

    if (hv === 'warm-card') {
      return (
        <header className="px-8 pt-6 pb-2">
          <div
            className="rounded-xl p-5 flex items-center justify-between gap-4 border"
            style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}28` }}
          >
            <div className="flex-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.title && (
                <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: primaryColor }}>
                  {personal.title}
                </p>
              )}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[11px] text-slate-600">
                {contactItems.map((c, idx) => (
                  <span key={idx}>
                    {idx > 0 ? '· ' : ''}
                    {c}
                  </span>
                ))}
              </div>
            </div>
            {recipe.showPhoto && personal.photo && (
              <div
                className="w-20 h-20 rounded-xl overflow-hidden border-2 bg-white shadow-xs shrink-0"
                style={{ borderColor: primaryColor }}
              >
                <img src={personal.photo} alt={personal.fullName} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </header>
      );
    }

    if (hv === 'swiss-index') {
      return (
        <header className="px-8 pt-7 pb-4 border-b-2" style={{ borderColor: '#0f172a' }}>
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                {personal.fullName || 'Your Name'}
              </h1>
              {personal.title && (
                <p className="text-sm font-bold mt-1.5" style={{ color: primaryColor }}>
                  {personal.title}
                </p>
              )}
            </div>
            <div className="text-right text-[10.5px] text-slate-600 space-y-0.5 shrink-0">
              {contactItems.slice(0, 4).map((c, idx) => (
                <div key={idx}>{c}</div>
              ))}
            </div>
          </div>
        </header>
      );
    }

    if (hv === 'highlighter-bar') {
      return (
        <header className="px-8 pt-7 pb-4 border-b-4" style={{ borderColor: primaryColor }}>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {personal.fullName || 'Your Name'}
          </h1>
          {personal.title && (
            <p className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: primaryColor }}>
              {personal.title}
            </p>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 text-[11px] text-slate-600">
            {contactItems.map((c, idx) => (
              <span key={idx}>
                {idx > 0 ? '· ' : ''}
                {c}
              </span>
            ))}
          </div>
        </header>
      );
    }

    // minimal-giant fallback
    return (
      <header className="px-8 pt-8 pb-4 border-b border-slate-200">
        <h1 className="text-3xl font-light tracking-tight text-slate-900">
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mt-1.5" style={{ color: primaryColor }}>
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-500">
          {contactItems.map((c, idx) => (
            <span key={idx}>
              {idx > 0 ? ' · ' : ''}
              {c}
            </span>
          ))}
        </div>
      </header>
    );
  };

  // =========================================================================
  // STRUCTURE 1: SIDEBAR LAYOUTS (LEFT OR RIGHT, COLORED OR TINTED)
  // =========================================================================
  if (isSidebarColored || isSidebarTinted) {
    const inverted = isSidebarColored;
    const sidebarBg = inverted ? primaryColor : `${primaryColor}14`;

    const sidebarNode = (
      <aside
        className={`w-[34%] p-6 flex flex-col gap-5 print-sidebar ${
          inverted ? 'text-white' : 'text-slate-800 border-slate-200'
        } ${!inverted ? (isRightSidebar ? 'border-l' : 'border-r') : ''}`}
        style={{ backgroundColor: sidebarBg }}
      >
        {/* Identity block inside sidebar when sidebar-integrated */}
        {recipe.headerVariant === 'sidebar-integrated' && (
          <div className={`pb-4 border-b ${inverted ? 'border-white/20' : 'border-slate-300/70'} flex flex-col items-center text-center`}>
            {recipe.showPhoto && personal.photo && (
              <div
                className={`w-22 h-22 rounded-full overflow-hidden mb-3 border-3 shadow-sm ${
                  inverted ? 'border-white/40' : 'border-white'
                }`}
              >
                <img src={personal.photo} alt={personal.fullName} className="w-full h-full object-cover" />
              </div>
            )}
            {recipe.showMonogram && !personal.photo && (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold tracking-widest mb-3 border"
                style={
                  inverted
                    ? { borderColor: 'rgba(255,255,255,0.45)', backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff' }
                    : { borderColor: primaryColor, backgroundColor: '#fff', color: primaryColor }
                }
              >
                {getInitials(personal.fullName)}
              </div>
            )}
            <h1 className={`text-lg font-extrabold leading-snug ${inverted ? 'text-white' : 'text-slate-900'}`}>
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.title && (
              <p className={`text-[11px] font-medium mt-1 ${inverted ? 'text-white/80' : 'text-slate-600'}`}>
                {personal.title}
              </p>
            )}
          </div>
        )}

        {/* Contact Block */}
        <div className="space-y-1.5 text-[11px]">
          <h2
            className={`text-[10px] font-extrabold uppercase tracking-[0.2em] mb-1.5 ${
              inverted ? 'text-white/70' : ''
            }`}
            style={!inverted ? { color: primaryColor } : undefined}
          >
            Contact
          </h2>
          {contactItems.map((c, idx) => (
            <div key={idx} className={`break-all ${inverted ? 'text-white/90' : 'text-slate-700'}`}>
              {c}
            </div>
          ))}
        </div>

        {/* Skills */}
        {visibleSections.skills && skillCategories.length > 0 && (
          <div className="space-y-2">
            {renderHeading('Skills', 3, undefined, inverted)}
            {renderSkills(undefined, inverted)}
          </div>
        )}

        {/* Education */}
        {visibleSections.education && education.length > 0 && (
          <div className="space-y-2">
            {renderHeading('Education', 4, undefined, inverted)}
            {renderEducationList(inverted)}
          </div>
        )}

        {/* Certifications */}
        {visibleSections.certifications && certifications.length > 0 && (
          <div className="space-y-2">
            {renderHeading('Credentials', 5, undefined, inverted)}
            {renderCertsList(inverted)}
          </div>
        )}
      </aside>
    );

    const mainNode = (
      <div className="flex-1 p-7 bg-white flex flex-col" style={{ gap: `${sectionGap}px` }}>
        {recipe.headerVariant !== 'sidebar-integrated' && (
          <div className="pb-3 border-b-2" style={{ borderColor: primaryColor }}>
            <h1 className="text-2xl font-extrabold text-slate-900">{personal.fullName || 'Your Name'}</h1>
            {personal.title && (
              <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: primaryColor }}>
                {personal.title}
              </p>
            )}
          </div>
        )}

        {visibleSections.summary && summary && (
          <section>
            {renderHeading('Profile', 1)}
            <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
          </section>
        )}

        {visibleSections.experience && experience.length > 0 && (
          <section>
            {renderHeading('Experience', 2)}
            {renderExperienceList(false)}
          </section>
        )}

        {visibleSections.projects && projects.length > 0 && (
          <section>
            {renderHeading('Selected Projects', 3)}
            {renderProjectsList()}
          </section>
        )}

        {declaration && declaration.enabled !== false && renderDeclaration('academic')}
      </div>
    );

    return (
      <div className="flex min-h-[297mm] text-slate-800 bg-white" style={{ lineHeight }}>
        {isRightSidebar ? (
          <>
            {mainNode}
            {sidebarNode}
          </>
        ) : (
          <>
            {sidebarNode}
            {mainNode}
          </>
        )}
      </div>
    );
  }

  // =========================================================================
  // STRUCTURE 2: LEFT LABEL LEDGER (ARCHITECTURAL RAIL)
  // =========================================================================
  if (recipe.layoutStructure === 'left-label-ledger') {
    const LedgerRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
      <div className="grid grid-cols-12 gap-5 pt-3.5 border-t border-slate-200">
        <div className="col-span-3">
          {renderHeading(label, 0)}
        </div>
        <div className="col-span-9">{children}</div>
      </div>
    );

    return (
      <div className="text-slate-800 bg-white" style={{ lineHeight }}>
        {renderTopHeader()}
        <div style={{ padding: `16px ${pageMargin}mm ${pageMargin}mm` }} className="space-y-4">
          {visibleSections.summary && summary && (
            <LedgerRow label="Profile">
              <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
            </LedgerRow>
          )}
          {visibleSections.experience && experience.length > 0 && (
            <LedgerRow label="Experience">{renderExperienceList(false)}</LedgerRow>
          )}
          {visibleSections.projects && projects.length > 0 && (
            <LedgerRow label="Projects">{renderProjectsList()}</LedgerRow>
          )}
          {visibleSections.education && education.length > 0 && (
            <LedgerRow label="Education">{renderEducationList(false)}</LedgerRow>
          )}
          {visibleSections.skills && skillCategories.length > 0 && (
            <LedgerRow label="Skills">{renderSkills()}</LedgerRow>
          )}
          {visibleSections.certifications && certifications.length > 0 && (
            <LedgerRow label="Certifications">{renderCertsList(false)}</LedgerRow>
          )}
          {declaration && declaration.enabled !== false && renderDeclaration('academic')}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STRUCTURE 3: BENTO CARDS GRID
  // =========================================================================
  if (recipe.layoutStructure === 'bento-cards') {
    return (
      <div className="text-slate-800 bg-white" style={{ lineHeight }}>
        {renderTopHeader()}
        <div style={{ padding: `14px ${pageMargin}mm ${pageMargin}mm` }} className="space-y-3.5">
          {visibleSections.summary && summary && (
            <section
              className="rounded-xl p-4 border"
              style={{ backgroundColor: `${primaryColor}08`, borderColor: `${primaryColor}25` }}
            >
              {renderHeading('Overview', 1)}
              <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
            </section>
          )}

          <div className="grid grid-cols-12 gap-3.5">
            <div className="col-span-7 space-y-3.5">
              {visibleSections.experience && experience.length > 0 && (
                <section className="rounded-xl p-4 border border-slate-200 bg-white">
                  {renderHeading('Experience', 2)}
                  {renderExperienceList(false)}
                </section>
              )}
              {visibleSections.projects && projects.length > 0 && (
                <section className="rounded-xl p-4 border border-slate-200 bg-white">
                  {renderHeading('Key Projects', 3)}
                  {renderProjectsList()}
                </section>
              )}
            </div>

            <div className="col-span-5 space-y-3.5">
              {visibleSections.skills && skillCategories.length > 0 && (
                <section className="rounded-xl p-4 border border-slate-200 bg-slate-50/70">
                  {renderHeading('Core Skills', 4)}
                  {renderSkills()}
                </section>
              )}
              {visibleSections.education && education.length > 0 && (
                <section className="rounded-xl p-4 border border-slate-200 bg-slate-50/70">
                  {renderHeading('Education', 5)}
                  {renderEducationList(false)}
                </section>
              )}
              {visibleSections.certifications && certifications.length > 0 && (
                <section className="rounded-xl p-4 border border-slate-200 bg-slate-50/70">
                  {renderHeading('Certifications', 6)}
                  {renderCertsList(false)}
                </section>
              )}
            </div>
          </div>

          {declaration && declaration.enabled !== false && renderDeclaration('academic')}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STRUCTURE 4: VERTICAL TIMELINE SPINE
  // =========================================================================
  if (recipe.layoutStructure === 'timeline-spine') {
    return (
      <div className="text-slate-800 bg-white" style={{ lineHeight }}>
        {renderTopHeader()}
        <div style={{ padding: `16px ${pageMargin}mm ${pageMargin}mm`, gap: `${sectionGap}px` }} className="flex flex-col">
          {visibleSections.summary && summary && (
            <section>
              {renderHeading('Executive Summary', 1)}
              <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
            </section>
          )}

          {visibleSections.experience && experience.length > 0 && (
            <section>
              {renderHeading('Career Roadmap', 2)}
              {renderExperienceList(true)}
            </section>
          )}

          <div className="grid grid-cols-12 gap-6 pt-2 border-t border-slate-200">
            <div className="col-span-6">
              {visibleSections.education && education.length > 0 && (
                <section>
                  {renderHeading('Education', 3)}
                  {renderEducationList(false)}
                </section>
              )}
            </div>
            <div className="col-span-6">
              {visibleSections.skills && skillCategories.length > 0 && (
                <section>
                  {renderHeading('Capabilities', 4)}
                  {renderSkills()}
                </section>
              )}
            </div>
          </div>

          {visibleSections.projects && projects.length > 0 && (
            <section>
              {renderHeading('Projects & Patents', 5)}
              {renderProjectsList()}
            </section>
          )}

          {declaration && declaration.enabled !== false && renderDeclaration('academic')}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STRUCTURE 5: TWO-COLUMN BODY & EDITORIAL BROADSHEET
  // =========================================================================
  if (
    recipe.layoutStructure === 'two-col-body' ||
    recipe.layoutStructure === 'editorial-broadsheet'
  ) {
    const isBroadsheet = recipe.layoutStructure === 'editorial-broadsheet';
    return (
      <div className="text-slate-800 bg-white" style={{ lineHeight }}>
        {renderTopHeader()}
        <div style={{ padding: `16px ${pageMargin}mm ${pageMargin}mm`, gap: `${sectionGap}px` }} className="flex flex-col">
          {visibleSections.summary && summary && (
            <section className={isBroadsheet ? 'border-b border-slate-200 pb-3' : ''}>
              {renderHeading('Profile Summary', 1)}
              <p className={`text-xs text-slate-700 leading-relaxed ${isBroadsheet ? 'italic' : ''}`}>{summary}</p>
            </section>
          )}

          <div className="grid grid-cols-12 gap-6">
            <div className={`${isBroadsheet ? 'col-span-7' : 'col-span-8'} space-y-4`}>
              {visibleSections.experience && experience.length > 0 && (
                <section>
                  {renderHeading('Experience', 2)}
                  {renderExperienceList(false)}
                </section>
              )}
              {visibleSections.projects && projects.length > 0 && (
                <section>
                  {renderHeading('Selected Work', 3)}
                  {renderProjectsList()}
                </section>
              )}
            </div>

            <div className={`${isBroadsheet ? 'col-span-5 border-l border-slate-200 pl-5' : 'col-span-4'} space-y-4`}>
              {visibleSections.education && education.length > 0 && (
                <section>
                  {renderHeading('Education', 4)}
                  {renderEducationList(false)}
                </section>
              )}
              {visibleSections.skills && skillCategories.length > 0 && (
                <section>
                  {renderHeading('Expertise', 5)}
                  {renderSkills()}
                </section>
              )}
              {visibleSections.certifications && certifications.length > 0 && (
                <section>
                  {renderHeading('Credentials', 6)}
                  {renderCertsList(false)}
                </section>
              )}
            </div>
          </div>

          {declaration && declaration.enabled !== false && renderDeclaration('academic')}
        </div>
      </div>
    );
  }

  // =========================================================================
  // STRUCTURE 6: EDGE STRIPE / GRADUATE EDUCATION-FIRST / CLASSIC SINGLE
  // =========================================================================
  const hasEdgeStripe = recipe.layoutStructure === 'edge-stripe-single';
  const isEduFirst = recipe.layoutStructure === 'education-first-clean';

  return (
    <div className="flex min-h-[297mm] text-slate-800 bg-white" style={{ lineHeight }}>
      {hasEdgeStripe && <div className="w-3 shrink-0" style={{ backgroundColor: primaryColor }} />}
      <div className="flex-1">
        {renderTopHeader()}
        <div style={{ padding: `16px ${pageMargin}mm ${pageMargin}mm`, gap: `${sectionGap}px` }} className="flex flex-col">
          {visibleSections.summary && summary && (
            <section>
              {renderHeading('Summary', 1)}
              <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
            </section>
          )}

          {isEduFirst ? (
            <>
              {visibleSections.education && education.length > 0 && (
                <section>
                  {renderHeading('Education', 2)}
                  {renderEducationList(false)}
                </section>
              )}
              {visibleSections.projects && projects.length > 0 && (
                <section>
                  {renderHeading('Technical Projects', 3)}
                  {renderProjectsList()}
                </section>
              )}
              {visibleSections.experience && experience.length > 0 && (
                <section>
                  {renderHeading('Internships & Experience', 4)}
                  {renderExperienceList(false)}
                </section>
              )}
            </>
          ) : (
            <>
              {visibleSections.experience && experience.length > 0 && (
                <section>
                  {renderHeading('Professional Experience', 2)}
                  {renderExperienceList(false)}
                </section>
              )}
              {visibleSections.projects && projects.length > 0 && (
                <section>
                  {renderHeading('Key Projects', 3)}
                  {renderProjectsList()}
                </section>
              )}
              {visibleSections.education && education.length > 0 && (
                <section>
                  {renderHeading('Education', 4)}
                  {renderEducationList(false)}
                </section>
              )}
            </>
          )}

          {visibleSections.skills && skillCategories.length > 0 && (
            <section>
              {renderHeading('Skills & Competencies', 5)}
              {renderSkills()}
            </section>
          )}

          {visibleSections.certifications && certifications.length > 0 && (
            <section>
              {renderHeading('Certifications & Licenses', 6)}
              {renderCertsList(false)}
            </section>
          )}

          {visibleSections.custom && customSections.length > 0 && (
            <>
              {customSections.map((cs) => (
                <section key={cs.id}>
                  {renderHeading(cs.title || 'Additional Details', 7)}
                  <div className="space-y-1.5 text-[11px]">
                    {cs.items.map((item) => (
                      <div key={item.id}>
                        <div className="font-bold text-slate-900 flex justify-between">
                          <span>{item.title}</span>
                          {item.date && <span className="text-slate-500 font-normal">{item.date}</span>}
                        </div>
                        {item.subtitle && <div className="text-slate-600">{item.subtitle}</div>}
                        {item.description && <p className="text-slate-700">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}

          {declaration && declaration.enabled !== false && renderDeclaration('academic')}
        </div>
      </div>
    </div>
  );
};
