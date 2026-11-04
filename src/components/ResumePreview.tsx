import React from 'react';
import { ResumeData, ResumeSettings, ResumeTemplateId } from '../types/resume';
import { Mail, Phone, MapPin, Globe, Paperclip, Download, ExternalLink } from 'lucide-react';

const LinkedinIcon = ({ className = 'w-3.5 h-3.5', style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const GithubIcon = ({ className = 'w-3.5 h-3.5', style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Safe URL validator: prevents rendering invalid or unsafe links as clickable
export const validateAndFormatUrl = (
  rawUrl?: string
): { isValid: boolean; href: string; display: string } => {
  if (!rawUrl || typeof rawUrl !== 'string') return { isValid: false, href: '', display: '' };
  const trimmed = rawUrl.trim();
  if (!trimmed) return { isValid: false, href: '', display: '' };

  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProto);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, href: '', display: trimmed };
    }
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return { isValid: false, href: '', display: trimmed };
    }
    return {
      isValid: true,
      href: parsed.href,
      display: trimmed.replace(/^https?:\/\//i, '').replace(/\/$/, ''),
    };
  } catch {
    return { isValid: false, href: '', display: trimmed };
  }
};

interface ResumePreviewProps {
  data: ResumeData;
  template: ResumeTemplateId;
  settings: ResumeSettings;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, template, settings }) => {
  const { personal, summary, experience, education, skillCategories, projects, certifications, customSections, declaration } = data;
  const { primaryColor = '#2563eb', spacing = 'normal', visibleSections } = settings;

  const fontStackMap: Record<string, string> = {
    Inter: 'Inter, system-ui, -apple-system, sans-serif',
    Arial: 'Arial, Helvetica, sans-serif',
    Calibri: 'Calibri, Candara, Segoe, "Segoe UI", sans-serif',
    Roboto: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    Lato: 'Lato, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'Open Sans': '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    Poppins: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    Montserrat: 'Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    'Source Sans 3': '"Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    Georgia: 'Georgia, serif',
    Garamond: 'Garamond, "EB Garamond", serif',
    'Times New Roman': '"Times New Roman", Times, serif',
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, monospace',
    modern: 'Segoe UI, system-ui, sans-serif',
  };

  const selectedFont = settings.typography?.fontFamily || (settings.fontFamily ? fontStackMap[settings.fontFamily] : 'Inter');
  const activeFontStack = fontStackMap[selectedFont] || fontStackMap.Inter;

  const nameSize = settings.typography?.nameSize ?? 26;
  const headingSize = settings.typography?.headingSize ?? 14;
  const bodySize = settings.typography?.bodySize ?? 11;
  const lineHeight = settings.layout?.lineHeight ?? 1.45;
  const pageMargin = settings.layout?.pageMargin ?? 20;
  const sectionGap = settings.layout?.sectionGap ?? 16;

  const formatting = settings.typography?.formatting;
  const nameFormat = formatting?.name || { bold: true, italic: false, underline: false, weight: 'bold' };
  const headingFormat = formatting?.headings || { bold: true, italic: false, underline: false, weight: 'semibold' };
  const subheadingFormat = formatting?.subheadings || { bold: true, italic: false, underline: false, weight: 'medium' };
  const bodyFormat = formatting?.body || { bold: false, italic: false, underline: false, weight: 'regular' };

  const weightToNum: Record<string, number> = {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  };

  const nameWeight = nameFormat.weight ? weightToNum[nameFormat.weight] : (nameFormat.bold ? 700 : 400);
  const headingWeight = headingFormat.weight ? weightToNum[headingFormat.weight] : (headingFormat.bold ? 600 : 400);
  const subheadingWeight = subheadingFormat.weight ? weightToNum[subheadingFormat.weight] : (subheadingFormat.bold ? 600 : 400);
  const bodyWeight = bodyFormat.weight ? weightToNum[bodyFormat.weight] : (bodyFormat.bold ? 600 : 400);

  const spacingClass = {
    compact: 'space-y-3 text-xs leading-relaxed',
    normal: 'space-y-5 text-sm leading-normal',
    relaxed: 'space-y-6 text-sm leading-relaxed',
  }[spacing] || 'space-y-5 text-sm';

  // =========================================================================
  // SHARED DECLARATION & SIGNATURE COMPONENT
  // =========================================================================
  const renderDeclarationSection = (variant: 'academic' | 'traditional') => {
    if (!declaration || declaration.enabled === false) return null;

    const signatureType = declaration.signatureType || 'draw';
    const signer = declaration.signerName || personal.fullName || 'Candidate';
    const hasSignatureImage = Boolean(declaration.signatureImage);

    return (
      <section className={`pt-4 border-t ${variant === 'traditional' ? 'border-slate-400' : 'border-sky-200'} space-y-3`}>
        {/* Section Heading */}
        <div
          className={
            variant === 'traditional'
              ? 'bg-slate-200 border-t border-b border-slate-400 text-slate-900 font-bold px-2 py-0.5 uppercase tracking-wider text-xs'
              : 'bg-sky-100/90 text-sky-950 font-bold px-2.5 py-1 text-xs uppercase tracking-wider border-l-4 border-sky-600 rounded-xs'
          }
        >
          Declaration
        </div>

        {/* Declaration Statement */}
        <p className="text-xs text-slate-700 leading-relaxed italic">
          {declaration.text ||
            'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.'}
        </p>

        {/* Place, Date & Signature row */}
        <div className="flex flex-wrap items-end justify-between gap-4 pt-3 text-xs">
          {/* Place & Date on Left */}
          <div className="space-y-1">
            <div className="font-medium text-slate-800">
              <span className="font-bold">Place:</span> {declaration.place || personal.location || '—'}
            </div>
            <div className="font-medium text-slate-800">
              <span className="font-bold">Date:</span> {declaration.date || new Date().toISOString().split('T')[0]}
            </div>
          </div>

          {/* Signature on Right */}
          <div className="text-right flex flex-col items-end min-w-[160px]">
            {/*
              Display candidate's actual drawn signature or uploaded image if saved.
              If no signature is saved, or if in blank line mode ('none'), display a clean blank signature line (___________).
            */}
            {(signatureType === 'draw' || signatureType === 'upload') && hasSignatureImage ? (
              <div className="flex flex-col items-end mb-1">
                <img
                  src={declaration.signatureImage}
                  alt="Candidate Signature"
                  className="h-10 sm:h-12 max-w-[160px] object-contain block"
                />
                <div className="w-40 border-b border-slate-700 mt-1" />
              </div>
            ) : (
              /* Clean blank signature line for signing by hand */
              <div className="flex flex-col items-end mb-1">
                <div className="w-44 h-8 flex items-end justify-end pb-0.5 border-b-2 border-slate-800">
                  <span className="text-[11px] font-mono tracking-widest text-slate-400 select-none print:hidden">
                    ____________________
                  </span>
                </div>
              </div>
            )}

            <div className="text-xs font-bold text-slate-900 uppercase">
              ({signer})
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              Candidate Signature
            </div>
          </div>
        </div>
      </section>
    );
  };

  // =========================================================================
  // ACADEMIC FORMATS (Layout 1, Layout 2, Layout 3)
  // Academic CV format:
  // - White background
  // - Centered bold RESUME title & centered candidate details
  // - Top-right profile photo in Layout 3 (withPhoto = true)
  // - Light-blue section headers
  // - Career Objective
  // - Education in a structured formal table
  // - Academic Projects with GitHub links
  // - Certifications with download links
  // - Technical Skills
  // - Declaration section in Layout 2 & 3 (withDeclaration = true)
  // =========================================================================
  const renderAcademic = (withDeclaration: boolean, withPhoto: boolean) => {
    const hasPhoto = withPhoto && Boolean(personal.photo);

    return (
      <div
        style={{ fontFamily: activeFontStack }}
        className="text-slate-800 bg-white p-8 sm:p-10 space-y-4"
      >
        {/* Document Header */}
        <header className="border-b-2 border-sky-400 pb-3 mb-2">
          {/* Centered RESUME Heading */}
          <div className="text-center font-extrabold text-base tracking-widest uppercase text-slate-800 mb-1">
            RESUME
          </div>

          <div className={`flex ${hasPhoto ? 'items-start justify-between gap-4' : 'flex-col items-center justify-center text-center'}`}>
            <div className={`flex-1 ${hasPhoto ? 'text-left' : 'text-center'}`}>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-slate-900">
                {personal.fullName || 'Candidate Name'}
              </h1>
              {personal.title && (
                <p className="text-sm font-semibold text-sky-800 mt-0.5">{personal.title}</p>
              )}

              {/* Centered or Left Contact Info */}
              <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600 font-medium ${hasPhoto ? 'justify-start' : 'justify-center'}`}>
                {personal.phone && <span>Tel: {personal.phone}</span>}
                {personal.phone && personal.email && <span>•</span>}
                {personal.email && <span>Email: {personal.email}</span>}
                {personal.location && <span>•</span>}
                {personal.location && <span>{personal.location}</span>}
                {personal.linkedin && <span>•</span>}
                {personal.linkedin && (
                  <span className="flex items-center gap-1 text-sky-800">
                    <LinkedinIcon className="w-3 h-3 text-sky-700" />
                    {personal.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}
                  </span>
                )}
                {personal.github && <span>•</span>}
                {personal.github && (
                  <span className="flex items-center gap-1 text-slate-800">
                    <GithubIcon className="w-3 h-3" />
                    {personal.github.replace(/^https?:\/\/(www\.)?/i, '')}
                  </span>
                )}
              </div>
            </div>

            {/* Top-Right Profile Photo (Layout 3 only) */}
            {hasPhoto && (
              <div className="shrink-0 text-right">
                <img
                  src={personal.photo}
                  alt="Profile photo"
                  className="w-24 h-28 sm:w-28 sm:h-32 object-cover rounded border-2 border-sky-300 shadow-xs"
                />
              </div>
            )}
          </div>
        </header>

        {/* Career Objective */}
        {visibleSections.summary && summary && (
          <section className="space-y-1.5">
            <h2 className="bg-sky-100/90 text-sky-950 font-bold px-2.5 py-1 text-xs uppercase tracking-wider border-l-4 border-sky-600 rounded-xs">
              Career Objective
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify px-1">{summary}</p>
          </section>
        )}

        {/* Education (Structured Table) */}
        {visibleSections.education && education.length > 0 && (
          <section className="space-y-2">
            <h2 className="bg-sky-100/90 text-sky-950 font-bold px-2.5 py-1 text-xs uppercase tracking-wider border-l-4 border-sky-600 rounded-xs">
              Education
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-center border-collapse text-xs border border-sky-300">
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-sky-50 text-sky-950 font-bold border-b border-sky-300">
                    <th className="p-2 border-r border-sky-300 text-center align-middle w-1/4 break-words">Degree</th>
                    <th className="p-2 border-r border-sky-300 text-center align-middle w-1/4 break-words">Institution</th>
                    <th className="p-2 border-r border-sky-300 text-center align-middle w-1/4 break-words">Year</th>
                    <th className="p-2 text-center align-middle w-1/4 break-words">Marks (%) / CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map((edu, idx) => (
                    <tr key={edu.id} className={idx % 2 === 1 ? 'bg-sky-50/30' : 'bg-white'}>
                      <td className="p-2 border-r border-t border-sky-200 font-semibold text-slate-900 text-center align-middle w-1/4 break-words">{edu.degree}</td>
                      <td className="p-2 border-r border-t border-sky-200 text-slate-700 text-center align-middle w-1/4 break-words">{edu.institution}</td>
                      <td className="p-2 border-r border-t border-sky-200 text-center align-middle text-slate-600 font-medium w-1/4 break-words">
                        {edu.endDate || edu.startDate || (edu.current ? 'Present' : '—')}
                      </td>
                      <td className="p-2 border-t border-sky-200 text-center align-middle text-slate-800 font-semibold w-1/4 break-words">
                        {edu.gpa || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Academic & Key Projects */}
        {visibleSections.projects && projects.length > 0 && (
          <section className="space-y-2.5">
            <h2 className="bg-sky-100/90 text-sky-950 font-bold px-2.5 py-1 text-xs uppercase tracking-wider border-l-4 border-sky-600 rounded-xs">
              Academic Projects
            </h2>
            <div className="space-y-3 px-1">
              {projects.map((proj) => {
                const validGh = validateAndFormatUrl(proj.githubUrl);
                const validDemo = validateAndFormatUrl(proj.link);

                return (
                  <div key={proj.id} className="text-xs space-y-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {proj.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {validGh.isValid && (
                          <a
                            href={validGh.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-sky-700"
                            title="Open GitHub repository"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {validDemo.isValid && (
                          <a
                            href={validDemo.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sky-700 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                    {proj.techStack && (
                      <p className="text-[11px] text-slate-600 font-medium">
                        <strong className="text-slate-700">Technology:</strong> {proj.techStack}
                      </p>
                    )}
                    {proj.description && (
                      <p className="text-slate-700 leading-relaxed">{proj.description}</p>
                    )}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700">
                        {proj.highlights.filter(Boolean).map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Experience (if applicable) */}
        {visibleSections.experience && experience.length > 0 && (
          <section className="space-y-2">
            <h2 className="bg-sky-100/90 text-sky-950 font-bold px-2.5 py-1 text-xs uppercase tracking-wider border-l-4 border-sky-600 rounded-xs">
              Work Experience
            </h2>
            <div className="space-y-2.5 px-1">
              {experience.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{exp.role}</span>
                    <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-slate-600 font-medium">{exp.company} {exp.location ? `• ${exp.location}` : ''}</div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700">
                      {exp.highlights.filter(Boolean).map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Skills */}
        {visibleSections.skills && skillCategories.length > 0 && (
          <section className="space-y-2">
            <h2 className="bg-sky-100/90 text-sky-950 font-bold px-2.5 py-1 text-xs uppercase tracking-wider border-l-4 border-sky-600 rounded-xs">
              Technical Skills
            </h2>
            <div className="space-y-1.5 px-1 text-xs">
              {skillCategories.map((cat) => (
                <div key={cat.id} className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-slate-800 min-w-[120px]">{cat.name}:</span>
                  <span className="text-slate-700">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {visibleSections.certifications && certifications.length > 0 && (
          <section className="space-y-2">
            <h2 className="bg-sky-100/90 text-sky-950 font-bold px-2.5 py-1 text-xs uppercase tracking-wider border-l-4 border-sky-600 rounded-xs">
              Certifications & Training
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1 text-xs">
              {certifications.map((cert) => {
                const validUrl = validateAndFormatUrl(cert.url);
                return (
                  <div key={cert.id} className="border border-sky-200 rounded p-2 bg-sky-50/30">
                    <div className="font-bold text-slate-900">{cert.name}</div>
                    <div className="text-[11px] text-slate-600 flex justify-between mt-0.5">
                      <span>{cert.issuer}</span>
                      {cert.date && <span>{cert.date}</span>}
                    </div>
                    {cert.fileData && (
                      <div className="mt-1.5 pt-1 border-t border-sky-200/60 flex items-center justify-between text-[11px]">
                        <a
                          href={cert.fileData}
                          download={cert.fileName || 'certificate'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-print inline-flex items-center gap-1 font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download Certificate</span>
                        </a>
                        <span className="hidden print:inline text-slate-500 italic text-[10px]">
                          [Attached: {cert.fileName || 'Certificate'}]
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Custom Sections / Additional Information */}
        {visibleSections.custom && customSections.length > 0 && (
          <>
            {customSections.map((sec) => (
              <section key={sec.id} className="space-y-1.5">
                <h2 className="bg-sky-100/90 text-sky-950 font-bold px-2.5 py-1 text-xs uppercase tracking-wider border-l-4 border-sky-600 rounded-xs">
                  {sec.title}
                </h2>
                <div className="space-y-1.5 px-1 text-xs">
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div className="font-semibold text-slate-900 flex justify-between">
                        <span>{item.title}</span>
                        {item.date && <span className="text-slate-500 font-normal">{item.date}</span>}
                      </div>
                      {item.subtitle && <p className="text-slate-600">{item.subtitle}</p>}
                      {item.description && <p className="text-slate-700">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}

        {/* Declaration (Only in Layout 2 & Layout 3) */}
        {withDeclaration && renderDeclarationSection('academic')}
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 4: TRADITIONAL FORMAL
  // Recreates SUMITA DAS_CV.pdf format:
  // - Outer thin page border
  // - Centered CURRICULUM VITAE / RESUME heading
  // - Traditional grey section-heading bars
  // - Personal Details section with labels and values (optional photo on right)
  // - Educational Qualifications table with formal black/grey borders
  // - Extra Qualifications & Experience
  // - Declaration section with Place, Date, and Signature
  // =========================================================================
  const renderTraditional = () => {
    // Check which optional personal fields have values
    const details = [
      { label: "Candidate's Name", value: personal.fullName },
      { label: "Father's / Guardian Name", value: personal.fatherName },
      { label: "Date of Birth", value: personal.dob },
      { label: "Gender", value: personal.gender },
      { label: "Marital Status", value: personal.maritalStatus },
      { label: "Nationality", value: personal.nationality },
      { label: "Languages Known", value: personal.languages },
      { label: "Contact Number", value: personal.phone },
      { label: "Email Address", value: personal.email },
      { label: "Present Address", value: personal.location },
      { label: "Permanent Address", value: personal.permanentAddress },
    ].filter((item) => Boolean(item.value && item.value.trim()));

    return (
      <div
        style={{ fontFamily: activeFontStack }}
        className="bg-white text-slate-900 p-3 sm:p-4"
      >
        {/* Outer Page Border */}
        <div className="border-2 border-slate-700 p-6 sm:p-8 space-y-4 min-h-[285mm] flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header: Centered CURRICULUM VITAE */}
            <header className="text-center pb-2 border-b border-slate-300">
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-slate-900">
                CURRICULUM VITAE
              </h1>
              {personal.title && (
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-600 mt-0.5">
                  {personal.title}
                </p>
              )}
            </header>

            {/* Personal Details & Optional Photo */}
            <section className="space-y-2">
              <div className="bg-slate-200 border-t border-b border-slate-400 text-slate-900 font-bold px-2 py-0.5 uppercase tracking-wider text-xs">
                Personal Details
              </div>

              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 text-xs">
                {/* Details Table / Grid */}
                <table className="flex-1 text-xs border-collapse">
                  <tbody>
                    {details.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-none">
                        <td className="py-1 pr-3 font-bold text-slate-800 whitespace-nowrap align-top w-44">
                          {item.label}
                        </td>
                        <td className="py-1 pr-2 font-bold text-slate-800 align-top">:</td>
                        <td className="py-1 text-slate-800 align-top">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Passport Style Photo (Right Side) */}
                {personal.photo && (
                  <div className="shrink-0 text-center sm:text-right">
                    <img
                      src={personal.photo}
                      alt="Passport profile photo"
                      className="w-24 h-28 sm:w-28 sm:h-32 object-cover border-2 border-slate-600 p-0.5 bg-white shadow-xs"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Career Objective / Summary */}
            {visibleSections.summary && summary && (
              <section className="space-y-1.5">
                <div className="bg-slate-200 border-t border-b border-slate-400 text-slate-900 font-bold px-2 py-0.5 uppercase tracking-wider text-xs">
                  Objective
                </div>
                <p className="text-xs text-slate-800 leading-relaxed text-justify px-1">{summary}</p>
              </section>
            )}

            {/* Educational Qualifications Table */}
            {visibleSections.education && education.length > 0 && (
              <section className="space-y-2">
                <div className="bg-slate-200 border-t border-b border-slate-400 text-slate-900 font-bold px-2 py-0.5 uppercase tracking-wider text-xs">
                  Educational Qualifications
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed text-center border-collapse text-xs border border-slate-400">
                    <colgroup>
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                      <col style={{ width: '25%' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                        <th className="p-1.5 border-r border-slate-400 text-center align-middle w-1/4 break-words">Degree</th>
                        <th className="p-1.5 border-r border-slate-400 text-center align-middle w-1/4 break-words">Institution</th>
                        <th className="p-1.5 border-r border-slate-400 text-center align-middle w-1/4 break-words">Year</th>
                        <th className="p-1.5 text-center align-middle w-1/4 break-words">Marks (%) / CGPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {education.map((edu) => (
                        <tr key={edu.id} className="border-t border-slate-300">
                          <td className="p-1.5 border-r border-slate-300 font-semibold text-slate-900 text-center align-middle w-1/4 break-words">{edu.degree}</td>
                          <td className="p-1.5 border-r border-slate-300 text-slate-800 text-center align-middle w-1/4 break-words">{edu.institution}</td>
                          <td className="p-1.5 border-r border-slate-300 text-center align-middle text-slate-700 w-1/4 break-words">
                            {edu.endDate || edu.startDate || (edu.current ? 'Present' : '—')}
                          </td>
                          <td className="p-1.5 text-center align-middle text-slate-900 font-bold w-1/4 break-words">
                            {edu.gpa || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Work Experience */}
            {visibleSections.experience && experience.length > 0 && (
              <section className="space-y-2">
                <div className="bg-slate-200 border-t border-b border-slate-400 text-slate-900 font-bold px-2 py-0.5 uppercase tracking-wider text-xs">
                  Work Experience
                </div>
                <div className="space-y-2.5 px-1 text-xs">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{exp.role}</span>
                        <span className="font-normal text-slate-600">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div className="text-slate-700 italic">{exp.company} {exp.location ? `• ${exp.location}` : ''}</div>
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-800">
                          {exp.highlights.filter(Boolean).map((hl, i) => (
                            <li key={i}>{hl}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Extra Qualifications & Skills */}
            {visibleSections.skills && skillCategories.length > 0 && (
              <section className="space-y-1.5">
                <div className="bg-slate-200 border-t border-b border-slate-400 text-slate-900 font-bold px-2 py-0.5 uppercase tracking-wider text-xs">
                  Technical & Extra Qualifications
                </div>
                <div className="space-y-1 px-1 text-xs">
                  {skillCategories.map((cat) => (
                    <div key={cat.id} className="flex flex-wrap items-baseline gap-1.5">
                      <span className="font-bold text-slate-900 w-36 shrink-0">{cat.name}:</span>
                      <span className="text-slate-800">{cat.skills.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {visibleSections.certifications && certifications.length > 0 && (
              <section className="space-y-1.5">
                <div className="bg-slate-200 border-t border-b border-slate-400 text-slate-900 font-bold px-2 py-0.5 uppercase tracking-wider text-xs">
                  Certifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-1 text-xs">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="border border-slate-300 p-2 bg-slate-50/50">
                      <div className="font-bold text-slate-900">{cert.name}</div>
                      <div className="text-[11px] text-slate-600 flex justify-between">
                        <span>{cert.issuer}</span>
                        {cert.date && <span>{cert.date}</span>}
                      </div>
                      {cert.fileData && (
                        <div className="mt-1 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <a
                            href={cert.fileData}
                            download={cert.fileName || 'certificate'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-print inline-flex items-center gap-1 font-semibold text-slate-800 hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download Document</span>
                          </a>
                          <span className="hidden print:inline text-slate-500 italic text-[10px]">
                            [Attached: {cert.fileName || 'Certificate'}]
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {visibleSections.projects && projects.length > 0 && (
              <section className="space-y-1.5">
                <div className="bg-slate-200 border-t border-b border-slate-400 text-slate-900 font-bold px-2 py-0.5 uppercase tracking-wider text-xs">
                  Projects & Key Initiatives
                </div>
                <div className="space-y-2 px-1 text-xs">
                  {projects.map((proj) => {
                    const validGh = validateAndFormatUrl(proj.githubUrl);

                    return (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{proj.name}</span>
                          {validGh.isValid && (
                            <a
                              href={validGh.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1 text-[11px]"
                            >
                              <GithubIcon className="w-3 h-3" /> GitHub
                            </a>
                          )}
                        </div>
                        {proj.techStack && <div className="text-slate-600 text-[11px] italic">Tech: {proj.techStack}</div>}
                        {proj.description && <p className="text-slate-800 mt-0.5">{proj.description}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Declaration Section (at bottom of border box) */}
          {renderDeclarationSection('traditional')}
        </div>
      </div>
    );
  };

  // =========================================================================
  // TEMPLATE 1: MODERN CLEAN
  // Single-column layout with modern sans-serif typography, colored top bar,
  // badge pills, and contemporary accent underlines.
  // =========================================================================
  const renderModern = () => (
    <div
      style={{ fontFamily: activeFontStack }}
      className="text-slate-800 bg-white"
    >
      {/* Top Accent Stripe */}
      <div className="h-3 w-full" style={{ backgroundColor: primaryColor }} />

      <div className="p-8 sm:p-10">
        {/* Modern Header */}
        <header className="border-b-2 pb-5 mb-5" style={{ borderColor: primaryColor }}>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900" style={{ color: primaryColor }}>
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.title && (
              <p className="text-base font-semibold text-slate-700 mt-1">{personal.title}</p>
            )}
          </div>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3.5 text-xs text-slate-600">
            {personal.email && (
              <span className="flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {personal.email}
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {personal.phone}
              </span>
            )}
            {personal.location && (
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {personal.location}
              </span>
            )}
            {personal.website && (
              <span className="flex items-center gap-1.5 font-medium">
                <Globe className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {personal.website}
              </span>
            )}
            {personal.linkedin && (
              <span className="flex items-center gap-1.5 font-medium">
                <LinkedinIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {personal.linkedin}
              </span>
            )}
            {personal.github && (
              <span className="flex items-center gap-1.5 font-medium">
                <GithubIcon className="w-3.5 h-3.5" style={{ color: primaryColor }} />
                {personal.github}
              </span>
            )}
          </div>
        </header>

        <div className={spacingClass}>
          {/* Professional Summary */}
          {visibleSections.summary && summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200" style={{ color: primaryColor }}>
                Professional Summary
              </h2>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{summary}</p>
            </section>
          )}

          {/* Work Experience */}
          {visibleSections.experience && experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200" style={{ color: primaryColor }}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="font-bold text-slate-900 text-sm">{exp.role}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 mb-1.5 font-semibold">
                      <span>{exp.company}</span>
                      {exp.location && <span className="font-normal text-slate-500">{exp.location}</span>}
                    </div>
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-1 text-slate-700 text-xs">
                        {exp.highlights.filter(Boolean).map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Key Projects */}
          {visibleSections.projects && projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200" style={{ color: primaryColor }}>
                Key Projects
              </h2>
              <div className="space-y-3.5">
                {projects.map((proj) => {
                  const validDemo = validateAndFormatUrl(proj.link);
                  const validGh = validateAndFormatUrl(proj.githubUrl);

                  return (
                    <div key={proj.id}>
                      <div className="flex flex-wrap items-baseline justify-between gap-1">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{proj.name}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {validDemo.isValid && (
                            <a
                              href={validDemo.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                              title="Open demo in new tab"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{validDemo.display}</span>
                            </a>
                          )}
                          {!validDemo.isValid && proj.link && (
                            <span className="text-[11px] text-slate-400">({proj.link})</span>
                          )}

                          {validGh.isValid && (
                            <a
                              href={validGh.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                              title="Open GitHub repository in new tab"
                            >
                              <GithubIcon className="w-3.5 h-3.5" />
                              <span>GitHub</span>
                            </a>
                          )}
                          {!validGh.isValid && proj.githubUrl && (
                            <span className="text-[11px] text-slate-400">({proj.githubUrl})</span>
                          )}
                        </div>
                      </div>
                      {proj.techStack && (
                        <p className="text-xs font-semibold text-slate-600 mb-1">
                          <span className="text-slate-400 font-normal">Tech:</span> {proj.techStack}
                        </p>
                      )}
                      {proj.description && <p className="text-slate-700 text-xs mb-1">{proj.description}</p>}
                      {proj.highlights && proj.highlights.length > 0 && (
                        <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-700 text-xs">
                          {proj.highlights.filter(Boolean).map((hl, i) => (
                            <li key={i}>{hl}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Education */}
          {visibleSections.education && education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200" style={{ color: primaryColor }}>
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{edu.degree}</span>
                      <span className="text-xs text-slate-500 font-medium">
                        {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 font-medium">
                      <span>{edu.institution}</span>
                      {edu.location && <span>{edu.location}</span>}
                    </div>
                    {edu.gpa && <p className="text-xs text-slate-500 mt-0.5">Marks (%) / CGPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills */}
          {visibleSections.skills && skillCategories.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200" style={{ color: primaryColor }}>
                Skills & Expertise
              </h2>
              <div className="space-y-2">
                {skillCategories.map((cat) => (
                  <div key={cat.id} className="text-xs flex flex-wrap items-baseline gap-1.5">
                    <span className="font-bold text-slate-800">{cat.name}:</span>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((skill, i) => (
                        <span key={i} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Certifications */}
          {visibleSections.certifications && certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200" style={{ color: primaryColor }}>
                Certifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {certifications.map((cert) => {
                  const validUrl = validateAndFormatUrl(cert.url);

                  return (
                    <div key={cert.id} className="border border-slate-200 rounded p-2.5 bg-slate-50/50 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-bold text-slate-900 leading-snug">{cert.name}</span>
                          {cert.date && <span className="text-slate-400 text-[11px] shrink-0 font-medium">{cert.date}</span>}
                        </div>
                        <div className="text-slate-600 flex flex-wrap items-center justify-between gap-1 mt-0.5 text-[11px]">
                          <span>{cert.issuer}</span>
                          {validUrl.isValid && (
                            <a
                              href={validUrl.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-indigo-600 hover:underline"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span>Verify</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Downloadable Certificate Attachment */}
                      {cert.fileData && (
                        <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <a
                            href={cert.fileData}
                            download={cert.fileName || `${(cert.name || 'certificate').toLowerCase().replace(/\s+/g, '_')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-print inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                            title={`Download attached certificate: ${cert.fileName || ''}`}
                          >
                            <Download className="w-3 h-3 shrink-0" />
                            <span>Download {cert.fileName || 'Certificate'}</span>
                          </a>
                          <span className="hidden print:inline text-slate-500 italic text-[10px]">
                            [Attached: {cert.fileName || 'Certificate'}]
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Custom Sections */}
          {visibleSections.custom && customSections.length > 0 && (
            <>
              {customSections.map((sec) => (
                <section key={sec.id}>
                  <h2 className="text-xs font-bold uppercase tracking-wider pb-1 mb-2.5 border-b border-slate-200" style={{ color: primaryColor }}>
                    {sec.title}
                  </h2>
                  <div className="space-y-2 text-xs">
                    {sec.items.map((item) => (
                      <div key={item.id}>
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>{item.title}</span>
                          {item.date && <span className="text-slate-500 font-normal">{item.date}</span>}
                        </div>
                        {item.subtitle && <p className="text-slate-600">{item.subtitle}</p>}
                        {item.description && <p className="text-slate-700 mt-0.5">{item.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // TEMPLATE 2: CLASSIC SERIF
  // Traditional publication style: Centered header, formal serif typography,
  // classical double rules, and right-aligned dates.
  // =========================================================================
  const renderClassic = () => (
    <div
      style={{ fontFamily: activeFontStack }}
      className="text-slate-900 bg-white p-8 sm:p-12 leading-relaxed"
    >
      {/* Centered Traditional Header */}
      <header className="text-center pb-3 mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-widest uppercase text-slate-900" style={{ color: primaryColor }}>
          {personal.fullName || 'Your Name'}
        </h1>
        {personal.title && (
          <p className="text-sm italic tracking-widest uppercase text-slate-700 mt-1">
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 mt-2.5 text-xs text-slate-700">
          {personal.location && <span>{personal.location}</span>}
          {personal.email && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personal.email}</span>
            </>
          )}
          {personal.phone && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personal.phone}</span>
            </>
          )}
          {personal.website && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personal.website}</span>
            </>
          )}
          {personal.linkedin && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personal.linkedin}</span>
            </>
          )}
          {personal.github && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personal.github}</span>
            </>
          )}
        </div>

        {/* Traditional Double Horizontal Rule */}
        <div className="mt-3.5 border-t-2 border-b border-slate-800 py-0.5" />
      </header>

      <div className={spacingClass}>
        {/* Professional Summary */}
        {visibleSections.summary && summary && (
          <section>
            <h2 className="text-center uppercase font-bold text-xs tracking-widest border-b border-slate-300 pb-1 mb-2.5 text-slate-900">
              Professional Summary
            </h2>
            <p className="text-slate-800 leading-relaxed text-justify text-xs sm:text-sm">{summary}</p>
          </section>
        )}

        {/* Experience */}
        {visibleSections.experience && experience.length > 0 && (
          <section>
            <h2 className="text-center uppercase font-bold text-xs tracking-widest border-b border-slate-300 pb-1 mb-3 text-slate-900">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{exp.company}</span>
                    <span className="text-xs italic text-slate-600">{exp.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="italic font-medium text-slate-800">{exp.role}</span>
                    <span className="text-slate-600">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 text-xs">
                      {exp.highlights.filter(Boolean).map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {visibleSections.education && education.length > 0 && (
          <section>
            <h2 className="text-center uppercase font-bold text-xs tracking-widest border-b border-slate-300 pb-1 mb-2.5 text-slate-900">
              Education
            </h2>
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">{edu.institution}</span>
                    <span className="text-xs italic text-slate-600">{edu.location}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="italic text-slate-800">{edu.degree}</span>
                    <span className="text-slate-600">
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  {edu.gpa && <p className="text-xs text-slate-600">Marks (%) / CGPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Key Projects */}
        {visibleSections.projects && projects.length > 0 && (
          <section>
            <h2 className="text-center uppercase font-bold text-xs tracking-widest border-b border-slate-300 pb-1 mb-2.5 text-slate-900">
              Key Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => {
                const validDemo = validateAndFormatUrl(proj.link);
                const validGh = validateAndFormatUrl(proj.githubUrl);

                return (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline flex-wrap gap-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{proj.name}</span>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {proj.techStack && <span className="italic text-slate-600">({proj.techStack})</span>}
                        {validDemo.isValid && (
                          <a
                            href={validDemo.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-700 hover:text-slate-900 underline italic"
                          >
                            Demo
                          </a>
                        )}
                        {validGh.isValid && (
                          <a
                            href={validGh.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 underline italic"
                            title="Open GitHub Repository in new tab"
                          >
                            <GithubIcon className="w-3 h-3" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {!validGh.isValid && proj.githubUrl && (
                          <span className="text-slate-400 italic">({proj.githubUrl})</span>
                        )}
                      </div>
                    </div>
                    {proj.description && <p className="text-xs text-slate-800 mt-0.5">{proj.description}</p>}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-slate-800 text-xs mt-1">
                        {proj.highlights.filter(Boolean).map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Skills */}
        {visibleSections.skills && skillCategories.length > 0 && (
          <section>
            <h2 className="text-center uppercase font-bold text-xs tracking-widest border-b border-slate-300 pb-1 mb-2 text-slate-900">
              Skills & Qualifications
            </h2>
            <div className="space-y-1 text-xs">
              {skillCategories.map((cat) => (
                <div key={cat.id}>
                  <span className="font-bold text-slate-900">{cat.name}: </span>
                  <span className="text-slate-800">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {visibleSections.certifications && certifications.length > 0 && (
          <section>
            <h2 className="text-center uppercase font-bold text-xs tracking-widest border-b border-slate-300 pb-1 mb-2 text-slate-900">
              Certifications
            </h2>
            <div className="space-y-2 text-xs">
              {certifications.map((cert) => {
                const validUrl = validateAndFormatUrl(cert.url);

                return (
                  <div key={cert.id} className="flex flex-wrap justify-between items-baseline gap-1">
                    <div>
                      <span className="font-bold text-slate-900">{cert.name}</span>
                      <span className="text-slate-600 italic ml-1">
                        – {cert.issuer} {cert.date ? `(${cert.date})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {validUrl.isValid && (
                        <a
                          href={validUrl.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-600 hover:text-slate-900 underline italic"
                        >
                          Verify
                        </a>
                      )}
                      {cert.fileData && (
                        <>
                          <a
                            href={cert.fileData}
                            download={cert.fileName || `${(cert.name || 'certificate').toLowerCase().replace(/\s+/g, '_')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-print inline-flex items-center gap-1 text-slate-800 hover:text-indigo-900 hover:underline italic font-medium"
                            title={`Download attached certificate: ${cert.fileName || ''}`}
                          >
                            <Download className="w-3 h-3" />
                            <span>[Download Certificate]</span>
                          </a>
                          <span className="hidden print:inline text-slate-500 italic text-[10px]">
                            [Attached: {cert.fileName || 'Certificate'}]
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {visibleSections.custom && customSections.length > 0 && (
          <>
            {customSections.map((sec) => (
              <section key={sec.id}>
                <h2 className="text-center uppercase font-bold text-xs tracking-widest border-b border-slate-300 pb-1 mb-2 text-slate-900">
                  {sec.title}
                </h2>
                <div className="space-y-2 text-xs">
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{item.title}</span>
                        {item.date && <span className="text-slate-600 font-normal italic">{item.date}</span>}
                      </div>
                      {item.subtitle && <p className="text-slate-700 italic">{item.subtitle}</p>}
                      {item.description && <p className="text-slate-800 mt-0.5">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );

  // =========================================================================
  // TEMPLATE 3: TWO-COLUMN EXECUTIVE
  // Genuine Two-Column Layout:
  // - Sidebar (left 35%): Contact Details and Skills & Certifications.
  // - Main Column (right 65%): Summary, Experience, Education, and Projects.
  // =========================================================================
  const renderTwoColumn = () => (
    <div
      style={{ fontFamily: activeFontStack }}
      className="grid grid-cols-12 min-h-[297mm] bg-white text-slate-800"
    >
      {/* Left Sidebar (Col 4): Contact Details and Skills */}
      <aside className="print-sidebar col-span-4 bg-slate-900 text-slate-100 p-6 sm:p-7 space-y-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Optional Profile Photo in Sidebar */}
          {personal.photo && (
            <div className="flex justify-center pt-1 pb-2 border-b border-slate-800">
              <img
                src={personal.photo}
                alt="Profile photo"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-white/60 shadow-md"
              />
            </div>
          )}

          {/* Header in Sidebar */}
          <div className="border-b border-slate-800 pb-4">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
              {personal.fullName || 'Your Name'}
            </h1>
            {personal.title && (
              <p className="text-xs font-semibold mt-1" style={{ color: primaryColor }}>
                {personal.title}
              </p>
            )}
          </div>

          {/* Contact Details (in Sidebar) */}
          <div className="space-y-2.5 text-xs text-slate-300">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              Contact Details
            </h3>
            {personal.email && (
              <div className="flex items-start gap-2 break-all">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                <span>{personal.email}</span>
              </div>
            )}
            {personal.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{personal.phone}</span>
              </div>
            )}
            {personal.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{personal.location}</span>
              </div>
            )}
            {personal.website && (
              <div className="flex items-center gap-2 break-all">
                <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{personal.website}</span>
              </div>
            )}
            {personal.linkedin && (
              <div className="flex items-center gap-2 break-all">
                <LinkedinIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{personal.linkedin}</span>
              </div>
            )}
            {personal.github && (
              <div className="flex items-center gap-2 break-all">
                <GithubIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>{personal.github}</span>
              </div>
            )}
          </div>

          {/* Skills (in Sidebar) */}
          {visibleSections.skills && skillCategories.length > 0 && (
            <div className="space-y-3 text-xs">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                Skills & Stack
              </h3>
              {skillCategories.map((cat) => (
                <div key={cat.id}>
                  <span className="font-semibold text-slate-300 block mb-1 text-[11px]">{cat.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((skill, i) => (
                      <span key={i} className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certifications (in Sidebar) */}
          {visibleSections.certifications && certifications.length > 0 && (
            <div className="space-y-2.5 text-xs text-slate-300">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
                Certifications
              </h3>
              {certifications.map((cert) => {
                const validUrl = validateAndFormatUrl(cert.url);

                return (
                  <div key={cert.id} className="space-y-0.5">
                    <div className="font-bold text-white text-xs">{cert.name}</div>
                    <div className="text-[10px] text-slate-400 flex justify-between">
                      <span>{cert.issuer}</span>
                      {cert.date && <span>{cert.date}</span>}
                    </div>

                    {validUrl.isValid && (
                      <div className="text-[10px]">
                        <a
                          href={validUrl.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-white underline inline-flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Verify</span>
                        </a>
                      </div>
                    )}

                    {cert.fileData && (
                      <div className="pt-0.5">
                        <a
                          href={cert.fileData}
                          download={cert.fileName || `${(cert.name || 'certificate').toLowerCase().replace(/\s+/g, '_')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-print inline-flex items-center gap-1 text-[10px] text-indigo-300 hover:text-white underline font-medium"
                          title={`Download attached certificate: ${cert.fileName || ''}`}
                        >
                          <Download className="w-2.5 h-2.5" />
                          <span>Download Certificate</span>
                        </a>
                        <span className="hidden print:inline text-slate-400 text-[9px] italic">
                          [Attached: {cert.fileName || 'Certificate'}]
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Column (Col 8): Summary, Experience, Education, and Projects */}
      <main className={`col-span-8 p-6 sm:p-8 bg-white ${spacingClass}`}>
        {/* Professional Summary */}
        {visibleSections.summary && summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2" style={{ borderColor: primaryColor, color: primaryColor }}>
              Professional Summary
            </h2>
            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">{summary}</p>
          </section>
        )}

        {/* Work Experience */}
        {visibleSections.experience && experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2.5" style={{ borderColor: primaryColor, color: primaryColor }}>
              Work Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs sm:text-sm">
                    <span>{exp.role}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-600 mb-1">
                    {exp.company} {exp.location ? `• ${exp.location}` : ''}
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700">
                      {exp.highlights.filter(Boolean).map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education (in Main Column) */}
        {visibleSections.education && education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2.5" style={{ borderColor: primaryColor, color: primaryColor }}>
              Education
            </h2>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline font-bold text-slate-900 text-xs sm:text-sm">
                    <span>{edu.degree}</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-600">
                    {edu.institution} {edu.location ? `• ${edu.location}` : ''}
                  </div>
                  {edu.gpa && <div className="text-xs text-slate-500">Marks (%) / CGPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects (in Main Column) */}
        {visibleSections.projects && projects.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2.5" style={{ borderColor: primaryColor, color: primaryColor }}>
              Key Projects
            </h2>
            <div className="space-y-3.5">
              {projects.map((proj) => {
                const validDemo = validateAndFormatUrl(proj.link);
                const validGh = validateAndFormatUrl(proj.githubUrl);

                return (
                  <div key={proj.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{proj.name}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {validDemo.isValid && (
                          <a
                            href={validDemo.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                            title="Open demo in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Demo</span>
                          </a>
                        )}
                        {!validDemo.isValid && proj.link && (
                          <span className="text-[11px] text-slate-400">({proj.link})</span>
                        )}

                        {validGh.isValid && (
                          <a
                            href={validGh.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                            title="Open GitHub Repository in new tab"
                          >
                            <GithubIcon className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {!validGh.isValid && proj.githubUrl && (
                          <span className="text-[11px] text-slate-400">({proj.githubUrl})</span>
                        )}
                      </div>
                    </div>
                    {proj.techStack && <div className="text-[11px] text-slate-500 font-medium mb-0.5">{proj.techStack}</div>}
                    {proj.description && <p className="text-xs text-slate-700 mt-0.5">{proj.description}</p>}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 space-y-0.5 text-xs text-slate-700 mt-1">
                        {proj.highlights.filter(Boolean).map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Custom Sections */}
        {visibleSections.custom && customSections.length > 0 && (
          <>
            {customSections.map((sec) => (
              <section key={sec.id}>
                <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2" style={{ borderColor: primaryColor, color: primaryColor }}>
                  {sec.title}
                </h2>
                <div className="space-y-2 text-xs">
                  {sec.items.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{item.title}</span>
                        {item.date && <span className="text-slate-500 font-normal">{item.date}</span>}
                      </div>
                      {item.subtitle && <p className="text-slate-600">{item.subtitle}</p>}
                      {item.description && <p className="text-slate-700 mt-0.5">{item.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );

  // =========================================================================
  // LAYOUT 8: Minimal ATS-Friendly
  // Single-column, linear hierarchy, standard unicode bullets, high contrast
  // =========================================================================
  const renderMinimalATS = () => (
    <div
      style={{ fontFamily: activeFontStack }}
      className="text-slate-900 bg-white p-8 sm:p-10 space-y-4 leading-normal"
    >
      {/* Header */}
      <header className="border-b border-slate-400 pb-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 uppercase">
          {personal.fullName || 'Candidate Name'}
        </h1>
        {personal.title && (
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{personal.title}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600 font-medium">
          {personal.phone && <span>Tel: {personal.phone}</span>}
          {personal.phone && personal.email && <span>|</span>}
          {personal.email && <span>Email: {personal.email}</span>}
          {personal.location && <span>|</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>|</span>}
          {personal.linkedin && (
            <span className="text-slate-800">
              LinkedIn: {personal.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}
            </span>
          )}
          {personal.github && <span>|</span>}
          {personal.github && (
            <span className="text-slate-800">
              GitHub: {personal.github.replace(/^https?:\/\/(www\.)?/i, '')}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {visibleSections.summary && summary && (
        <section className="space-y-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            Professional Summary
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed text-justify">{summary}</p>
        </section>
      )}

      {/* Education: 4 required columns */}
      {visibleSections.education && education.length > 0 && (
        <section className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            Education
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-center border-collapse text-xs border border-slate-300">
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-1.5 border-r border-slate-300 text-center align-middle w-1/4 break-words">Degree</th>
                  <th className="p-1.5 border-r border-slate-300 text-center align-middle w-1/4 break-words">Institution</th>
                  <th className="p-1.5 border-r border-slate-300 text-center align-middle w-1/4 break-words">Year</th>
                  <th className="p-1.5 text-center align-middle w-1/4 break-words">Marks (%) / CGPA</th>
                </tr>
              </thead>
              <tbody>
                {education.map((edu, idx) => (
                  <tr key={edu.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="p-1.5 border-r border-t border-slate-300 font-semibold text-slate-950 text-center align-middle w-1/4 break-words">{edu.degree}</td>
                    <td className="p-1.5 border-r border-t border-slate-300 text-slate-800 text-center align-middle w-1/4 break-words">{edu.institution}</td>
                    <td className="p-1.5 border-r border-t border-slate-300 text-center align-middle text-slate-700 w-1/4 break-words">
                      {edu.endDate || edu.startDate || (edu.current ? 'Present' : '—')}
                    </td>
                    <td className="p-1.5 border-t border-slate-300 text-center align-middle font-medium text-slate-900 w-1/4 break-words">
                      {edu.gpa || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Experience */}
      {visibleSections.experience && experience.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            Experience
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between font-bold text-slate-950">
                  <span>{exp.role} — {exp.company}</span>
                  <span className="text-slate-600 font-normal">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.location && <div className="text-[11px] text-slate-600 italic">{exp.location}</div>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-800">
                    {exp.highlights.filter(Boolean).map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {visibleSections.projects && projects.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            Projects
          </h2>
          <div className="space-y-2.5">
            {projects.map((proj) => {
              const validGh = validateAndFormatUrl(proj.githubUrl);
              const validDemo = validateAndFormatUrl(proj.link);
              return (
                <div key={proj.id} className="text-xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="font-bold text-slate-950">{proj.name}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      {validGh.isValid && (
                        <a
                          href={validGh.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-800 hover:underline flex items-center gap-1"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {validDemo.isValid && (
                        <a
                          href={validDemo.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-700 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.techStack && (
                    <div className="text-[11px] text-slate-600">Technologies: {proj.techStack}</div>
                  )}
                  {proj.description && <p className="text-slate-800 mt-0.5 leading-relaxed">{proj.description}</p>}
                  {proj.highlights && proj.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-slate-800">
                      {proj.highlights.filter(Boolean).map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {visibleSections.skills && skillCategories.length > 0 && (
        <section className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            Technical Skills
          </h2>
          <div className="space-y-1 text-xs">
            {skillCategories.map((cat) => (
              <div key={cat.id} className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-bold text-slate-900 min-w-[120px]">{cat.name}:</span>
                <span className="text-slate-800">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {visibleSections.certifications && certifications.length > 0 && (
        <section className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
            Certifications
          </h2>
          <div className="space-y-1 text-xs">
            {certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-slate-900">{cert.name}</span>
                  {cert.issuer && <span className="text-slate-700"> — {cert.issuer}</span>}
                  {cert.fileData && (
                    <a
                      href={cert.fileData}
                      download={cert.fileName || 'certificate'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-print ml-2 text-[11px] font-semibold text-slate-800 underline inline-flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> [Attachment]
                    </a>
                  )}
                </div>
                {cert.date && <span className="text-slate-600 font-normal">{cert.date}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Declaration (if enabled) */}
      {declaration && declaration.enabled !== false && renderDeclarationSection('academic')}
    </div>
  );

  // =========================================================================
  // LAYOUT 9: Corporate Professional
  // Bold corporate banner, structured executive hierarchy, formal table
  // =========================================================================
  const renderCorporate = () => (
    <div
      style={{ fontFamily: activeFontStack }}
      className="text-slate-800 bg-white min-h-[297mm] flex flex-col"
    >
      {/* Top Corporate Banner */}
      <header
        className="p-8 sm:p-10 text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide">
              {personal.fullName || 'Candidate Name'}
            </h1>
            {personal.title && (
              <p className="text-sm font-medium text-white/90 mt-1 uppercase tracking-wider">
                {personal.title}
              </p>
            )}
          </div>
          {personal.photo && (
            <img
              src={personal.photo}
              alt="Candidate"
              className="w-20 h-24 object-cover rounded border-2 border-white/50 shadow-md"
            />
          )}
        </div>
      </header>

      {/* Sub-bar with contact info */}
      <div className="bg-slate-100 border-b border-slate-200 px-8 sm:px-10 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 font-medium">
        {personal.phone && <span>Tel: {personal.phone}</span>}
        {personal.email && <span>Email: {personal.email}</span>}
        {personal.location && <span>{personal.location}</span>}
        {personal.linkedin && (
          <span className="flex items-center gap-1">
            <LinkedinIcon className="w-3 h-3 text-slate-600" />
            {personal.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}
          </span>
        )}
        {personal.github && (
          <span className="flex items-center gap-1">
            <GithubIcon className="w-3 h-3 text-slate-600" />
            {personal.github.replace(/^https?:\/\/(www\.)?/i, '')}
          </span>
        )}
      </div>

      {/* Body Content */}
      <main className="p-8 sm:p-10 space-y-5 flex-1">
        {visibleSections.summary && summary && (
          <section className="space-y-1.5">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Executive Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">{summary}</p>
          </section>
        )}

        {/* Education (4 columns) */}
        {visibleSections.education && education.length > 0 && (
          <section className="space-y-2">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Education & Academic Credentials
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-center border-collapse text-xs border border-slate-200">
                <colgroup>
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                  <col style={{ width: '25%' }} />
                </colgroup>
                <thead>
                  <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                    <th className="p-2 border-r border-slate-200 text-center align-middle w-1/4 break-words">Degree</th>
                    <th className="p-2 border-r border-slate-200 text-center align-middle w-1/4 break-words">Institution</th>
                    <th className="p-2 border-r border-slate-200 text-center align-middle w-1/4 break-words">Year</th>
                    <th className="p-2 text-center align-middle w-1/4 break-words">Marks (%) / CGPA</th>
                  </tr>
                </thead>
                <tbody>
                  {education.map((edu, idx) => (
                    <tr key={edu.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                      <td className="p-2 border-r border-t border-slate-200 font-semibold text-slate-900 text-center align-middle w-1/4 break-words">{edu.degree}</td>
                      <td className="p-2 border-r border-t border-slate-200 text-slate-700 text-center align-middle w-1/4 break-words">{edu.institution}</td>
                      <td className="p-2 border-r border-t border-slate-200 text-center align-middle text-slate-600 font-medium w-1/4 break-words">
                        {edu.endDate || edu.startDate || (edu.current ? 'Present' : '—')}
                      </td>
                      <td className="p-2 border-t border-slate-200 text-center align-middle font-semibold text-slate-900 w-1/4 break-words">
                        {edu.gpa || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Experience */}
        {visibleSections.experience && experience.length > 0 && (
          <section className="space-y-2.5">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Professional Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="text-sm font-semibold">{exp.role}</span>
                    <span className="text-slate-500 font-normal">
                      {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <div className="font-medium text-slate-600">
                    {exp.company} {exp.location ? `• ${exp.location}` : ''}
                  </div>
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-700">
                      {exp.highlights.filter(Boolean).map((hl, i) => (
                        <li key={i}>{hl}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {visibleSections.projects && projects.length > 0 && (
          <section className="space-y-2.5">
            <h2
              className="text-xs font-bold uppercase tracking-wider pb-1 border-b-2"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Key Projects & Initiatives
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => {
                const validGh = validateAndFormatUrl(proj.githubUrl);
                const validDemo = validateAndFormatUrl(proj.link);
                return (
                  <div key={proj.id} className="text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-slate-900">{proj.name}</span>
                      <div className="flex items-center gap-2 text-[11px]">
                        {validGh.isValid && (
                          <a
                            href={validGh.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                          >
                            <GithubIcon className="w-3 h-3" />
                            <span>GitHub</span>
                          </a>
                        )}
                        {validDemo.isValid && (
                          <a
                            href={validDemo.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Demo</span>
                          </a>
                        )}
                      </div>
                    </div>
                    {proj.techStack && (
                      <div className="text-[11px] text-slate-500 font-medium">Stack: {proj.techStack}</div>
                    )}
                    {proj.description && <p className="text-slate-700 mt-0.5">{proj.description}</p>}
                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-slate-700">
                        {proj.highlights.filter(Boolean).map((hl, i) => (
                          <li key={i}>{hl}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Skills & Certifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleSections.skills && skillCategories.length > 0 && (
            <section className="space-y-1.5">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Core Competencies
              </h2>
              <div className="space-y-1 text-xs">
                {skillCategories.map((cat) => (
                  <div key={cat.id}>
                    <span className="font-bold text-slate-800">{cat.name}: </span>
                    <span className="text-slate-600">{cat.skills.join(', ')}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.certifications && certifications.length > 0 && (
            <section className="space-y-1.5">
              <h2
                className="text-xs font-bold uppercase tracking-wider pb-1 border-b"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Certifications
              </h2>
              <div className="space-y-1.5 text-xs">
                {certifications.map((cert) => (
                  <div key={cert.id} className="border-b border-slate-100 pb-1">
                    <div className="font-bold text-slate-900">{cert.name}</div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>{cert.issuer}</span>
                      {cert.date && <span>{cert.date}</span>}
                    </div>
                    {cert.fileData && (
                      <a
                        href={cert.fileData}
                        download={cert.fileName || 'certificate'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-print text-[11px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                      >
                        <Download className="w-3 h-3" /> Download Certificate
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Declaration */}
        {declaration && declaration.enabled !== false && renderDeclarationSection('academic')}
      </main>
    </div>
  );

  // =========================================================================
  // LAYOUT 10: Modern Minimalist
  // Generous whitespace, clean typographic hierarchy, quiet vertical kickers
  // =========================================================================
  const renderModernMinimalist = () => (
    <div
      style={{ fontFamily: activeFontStack }}
      className="text-slate-800 bg-white p-8 sm:p-12 space-y-6 leading-relaxed"
    >
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-light tracking-tight text-slate-900">
          <span className="font-bold">{personal.fullName?.split(' ')[0]}</span>{' '}
          {personal.fullName?.split(' ').slice(1).join(' ') || ''}
        </h1>
        {personal.title && (
          <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: primaryColor }}>
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
          {personal.phone && <span>{personal.phone}</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && (
            <span className="text-slate-700">
              {personal.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}
            </span>
          )}
          {personal.github && (
            <span className="text-slate-700">
              {personal.github.replace(/^https?:\/\/(www\.)?/i, '')}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {visibleSections.summary && summary && (
        <section className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            Profile
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">{summary}</p>
        </section>
      )}

      {/* Education (4 columns) */}
      {visibleSections.education && education.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            Education
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-center border-collapse text-xs">
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-300 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-1.5 px-2 text-center align-middle w-1/4 break-words">Degree</th>
                  <th className="py-1.5 px-2 text-center align-middle w-1/4 break-words">Institution</th>
                  <th className="py-1.5 px-2 text-center align-middle w-1/4 break-words">Year</th>
                  <th className="py-1.5 px-2 text-center align-middle w-1/4 break-words">Marks (%) / CGPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {education.map((edu) => (
                  <tr key={edu.id}>
                    <td className="py-2 px-2 font-semibold text-slate-900 text-center align-middle w-1/4 break-words">{edu.degree}</td>
                    <td className="py-2 px-2 text-slate-600 text-center align-middle w-1/4 break-words">{edu.institution}</td>
                    <td className="py-2 px-2 text-center align-middle text-slate-500 w-1/4 break-words">
                      {edu.endDate || edu.startDate || (edu.current ? 'Present' : '—')}
                    </td>
                    <td className="py-2 px-2 text-center align-middle font-medium text-slate-800 w-1/4 break-words">
                      {edu.gpa || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Experience */}
      {visibleSections.experience && experience.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id} className="text-xs space-y-0.5">
                <div className="flex justify-between font-medium text-slate-900">
                  <span className="font-bold">{exp.role}</span>
                  <span className="text-slate-400 text-[11px]">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-slate-600">{exp.company} {exp.location ? `• ${exp.location}` : ''}</div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-600 text-xs">
                    {exp.highlights.filter(Boolean).map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {visibleSections.projects && projects.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => {
              const validGh = validateAndFormatUrl(proj.githubUrl);
              const validDemo = validateAndFormatUrl(proj.link);
              return (
                <div key={proj.id} className="text-xs space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">{proj.name}</span>
                    <div className="flex items-center gap-2 text-[11px]">
                      {validGh.isValid && (
                        <a
                          href={validGh.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>Code</span>
                        </a>
                      )}
                      {validDemo.isValid && (
                        <a
                          href={validDemo.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.techStack && (
                    <div className="text-[11px] text-slate-500">{proj.techStack}</div>
                  )}
                  {proj.description && <p className="text-slate-700 leading-relaxed">{proj.description}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skills & Certifications */}
      {visibleSections.skills && skillCategories.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
            Expertise
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {skillCategories.map((cat) => (
              <div key={cat.id}>
                <span className="font-semibold text-slate-900">{cat.name}: </span>
                <span className="text-slate-600">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Declaration */}
      {declaration && declaration.enabled !== false && renderDeclarationSection('academic')}
    </div>
  );

  // =========================================================================
  // LAYOUT 11: Creative Professional
  // Accent vertical stripe, expressive headers, project cards
  // =========================================================================
  const renderCreative = () => (
    <div
      style={{ fontFamily: activeFontStack, borderLeftColor: primaryColor }}
      className="text-slate-800 bg-white p-8 sm:p-10 border-l-8 space-y-5"
    >
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {personal.fullName || 'Candidate Name'}
          </h1>
          {personal.title && (
            <p className="text-sm font-bold mt-0.5 tracking-wide" style={{ color: primaryColor }}>
              {personal.title}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-600 font-medium">
            {personal.phone && <span>Tel: {personal.phone}</span>}
            {personal.email && <span>Email: {personal.email}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.linkedin && (
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <LinkedinIcon className="w-3 h-3" />
                {personal.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}
              </span>
            )}
            {personal.github && (
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <GithubIcon className="w-3 h-3" />
                {personal.github.replace(/^https?:\/\/(www\.)?/i, '')}
              </span>
            )}
          </div>
        </div>
        {personal.photo && (
          <img
            src={personal.photo}
            alt="Candidate"
            className="w-20 h-24 object-cover rounded-lg border-2 shadow-sm"
            style={{ borderColor: primaryColor }}
          />
        )}
      </header>

      {/* Summary */}
      {visibleSections.summary && summary && (
        <section className="space-y-1.5">
          <h2
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: primaryColor }} />
            About Me
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">{summary}</p>
        </section>
      )}

      {/* Education: 4 required columns */}
      {visibleSections.education && education.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: primaryColor }} />
            Education
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-center border-collapse text-xs border border-slate-200">
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
              </colgroup>
              <thead>
                <tr className="text-slate-900 font-bold border-b border-slate-200 bg-slate-50">
                  <th className="p-2 border-r border-slate-200 text-center align-middle w-1/4 break-words">Degree</th>
                  <th className="p-2 border-r border-slate-200 text-center align-middle w-1/4 break-words">Institution</th>
                  <th className="p-2 border-r border-slate-200 text-center align-middle w-1/4 break-words">Year</th>
                  <th className="p-2 text-center align-middle w-1/4 break-words">Marks (%) / CGPA</th>
                </tr>
              </thead>
              <tbody>
                {education.map((edu, idx) => (
                  <tr key={edu.id} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="p-2 border-r border-t border-slate-200 font-semibold text-slate-900 text-center align-middle w-1/4 break-words">{edu.degree}</td>
                    <td className="p-2 border-r border-t border-slate-200 text-slate-700 text-center align-middle w-1/4 break-words">{edu.institution}</td>
                    <td className="p-2 border-r border-t border-slate-200 text-center align-middle text-slate-600 font-medium w-1/4 break-words">
                      {edu.endDate || edu.startDate || (edu.current ? 'Present' : '—')}
                    </td>
                    <td className="p-2 border-t border-slate-200 text-center align-middle font-bold text-slate-900 w-1/4 break-words">
                      {edu.gpa || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Projects */}
      {visibleSections.projects && projects.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: primaryColor }} />
            Featured Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj) => {
              const validGh = validateAndFormatUrl(proj.githubUrl);
              const validDemo = validateAndFormatUrl(proj.link);
              return (
                <div key={proj.id} className="p-3 bg-slate-50/70 rounded-md border border-slate-200/80 text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{proj.name}</span>
                    <div className="flex items-center gap-2">
                      {validGh.isValid && (
                        <a
                          href={validGh.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-800 hover:text-indigo-600 flex items-center gap-1"
                        >
                          <GithubIcon className="w-3 h-3" />
                          <span>GitHub</span>
                        </a>
                      )}
                      {validDemo.isValid && (
                        <a
                          href={validDemo.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                  {proj.techStack && (
                    <div className="text-[11px] font-medium mt-0.5" style={{ color: primaryColor }}>
                      {proj.techStack}
                    </div>
                  )}
                  {proj.description && <p className="text-slate-700 mt-1 leading-relaxed">{proj.description}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Experience */}
      {visibleSections.experience && experience.length > 0 && (
        <section className="space-y-2">
          <h2
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: primaryColor }} />
            Work History
          </h2>
          <div className="space-y-2.5">
            {experience.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{exp.role} — {exp.company}</span>
                  <span className="text-slate-500 font-normal">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-0.5 space-y-0.5 text-slate-700">
                    {exp.highlights.filter(Boolean).map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {visibleSections.skills && skillCategories.length > 0 && (
        <section className="space-y-1.5">
          <h2
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
            style={{ color: primaryColor }}
          >
            <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: primaryColor }} />
            Skills & Tools
          </h2>
          <div className="space-y-1 text-xs">
            {skillCategories.map((cat) => (
              <div key={cat.id} className="flex flex-wrap items-baseline gap-1.5">
                <span className="font-bold text-slate-900 min-w-[120px]">{cat.name}:</span>
                <span className="text-slate-700">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Declaration */}
      {declaration && declaration.enabled !== false && renderDeclarationSection('academic')}
    </div>
  );

  // =========================================================================
  // LAYOUT 12: Elegant Serif
  // Editorial Georgia/Times typography, centered decorative rules
  // =========================================================================
  const renderElegantSerif = () => (
    <div
      style={{ fontFamily: activeFontStack }}
      className="text-slate-900 bg-white p-8 sm:p-12 space-y-5 leading-relaxed"
    >
      {/* Header */}
      <header className="text-center space-y-1.5 border-b-2 border-double border-slate-300 pb-4">
        <h1 className="text-2xl sm:text-3xl font-normal uppercase tracking-widest text-slate-950 font-serif">
          {personal.fullName || 'Candidate Name'}
        </h1>
        {personal.title && (
          <p className="text-xs uppercase tracking-widest italic text-slate-700 font-serif">
            {personal.title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-600 font-serif pt-1">
          {personal.phone && <span>Tel: {personal.phone}</span>}
          {personal.email && <span>•</span>}
          {personal.email && <span>{personal.email}</span>}
          {personal.location && <span>•</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>•</span>}
          {personal.linkedin && (
            <span>LinkedIn: {personal.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}</span>
          )}
          {personal.github && <span>•</span>}
          {personal.github && (
            <span>GitHub: {personal.github.replace(/^https?:\/\/(www\.)?/i, '')}</span>
          )}
        </div>
      </header>

      {/* Summary */}
      {visibleSections.summary && summary && (
        <section className="space-y-1 text-center">
          <div className="flex items-center justify-center gap-3 my-1">
            <div className="h-px bg-slate-300 flex-1" />
            <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800">
              Career Statement
            </h2>
            <div className="h-px bg-slate-300 flex-1" />
          </div>
          <p className="text-xs text-slate-700 leading-relaxed italic text-justify px-4">{summary}</p>
        </section>
      )}

      {/* Education: 4 required columns */}
      {visibleSections.education && education.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center justify-center gap-3 my-1">
            <div className="h-px bg-slate-300 flex-1" />
            <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800">
              Education
            </h2>
            <div className="h-px bg-slate-300 flex-1" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-center border-collapse text-xs border border-slate-300">
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-50 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300 text-center align-middle w-1/4 break-words">Degree</th>
                  <th className="p-2 border-r border-slate-300 text-center align-middle w-1/4 break-words">Institution</th>
                  <th className="p-2 border-r border-slate-300 text-center align-middle w-1/4 break-words">Year</th>
                  <th className="p-2 text-center align-middle w-1/4 break-words">Marks (%) / CGPA</th>
                </tr>
              </thead>
              <tbody>
                {education.map((edu, idx) => (
                  <tr key={edu.id} className={idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}>
                    <td className="p-2 border-r border-t border-slate-300 font-semibold text-slate-950 text-center align-middle w-1/4 break-words">{edu.degree}</td>
                    <td className="p-2 border-r border-t border-slate-300 text-slate-800 text-center align-middle w-1/4 break-words">{edu.institution}</td>
                    <td className="p-2 border-r border-t border-slate-300 text-center align-middle text-slate-700 w-1/4 break-words italic">
                      {edu.endDate || edu.startDate || (edu.current ? 'Present' : '—')}
                    </td>
                    <td className="p-2 border-t border-slate-300 text-center align-middle font-medium text-slate-900 w-1/4 break-words">
                      {edu.gpa || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Experience */}
      {visibleSections.experience && experience.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-center gap-3 my-1">
            <div className="h-px bg-slate-300 flex-1" />
            <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800">
              Experience
            </h2>
            <div className="h-px bg-slate-300 flex-1" />
          </div>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id} className="text-xs">
                <div className="flex justify-between font-bold text-slate-950">
                  <span className="text-sm font-serif">{exp.role}</span>
                  <span className="text-slate-600 font-normal italic">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="text-slate-700 italic">{exp.company} {exp.location ? `• ${exp.location}` : ''}</div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-slate-800">
                    {exp.highlights.filter(Boolean).map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {visibleSections.projects && projects.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center justify-center gap-3 my-1">
            <div className="h-px bg-slate-300 flex-1" />
            <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800">
              Projects
            </h2>
            <div className="h-px bg-slate-300 flex-1" />
          </div>
          <div className="space-y-2.5">
            {projects.map((proj) => {
              const validGh = validateAndFormatUrl(proj.githubUrl);
              return (
                <div key={proj.id} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-950">
                    <span>{proj.name}</span>
                    {validGh.isValid && (
                      <a
                        href={validGh.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-normal text-slate-700 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <GithubIcon className="w-3 h-3" /> GitHub
                      </a>
                    )}
                  </div>
                  {proj.techStack && (
                    <div className="text-[11px] text-slate-600 italic">Discipline: {proj.techStack}</div>
                  )}
                  {proj.description && <p className="text-slate-800 mt-0.5">{proj.description}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skills */}
      {visibleSections.skills && skillCategories.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center justify-center gap-3 my-1">
            <div className="h-px bg-slate-300 flex-1" />
            <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-slate-800">
              Skills
            </h2>
            <div className="h-px bg-slate-300 flex-1" />
          </div>
          <div className="space-y-1 text-xs text-center">
            {skillCategories.map((cat) => (
              <div key={cat.id}>
                <span className="font-bold text-slate-900">{cat.name}: </span>
                <span className="text-slate-700">{cat.skills.join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Declaration */}
      {declaration && declaration.enabled !== false && renderDeclarationSection('academic')}
    </div>
  );

  // =========================================================================
  // LAYOUT 13: Compact One-Page Resume
  // Space-optimized padding, dense vertical gaps, readable floor (min 10px),
  // with natural multi-page overflow safety (never crops or removes content).
  // =========================================================================
  const renderCompactOnePage = () => (
    <div
      style={{ fontFamily: activeFontStack }}
      className="text-slate-800 bg-white p-6 sm:p-7 space-y-3 leading-tight"
    >
      {/* Compact Header */}
      <header className="border-b-2 pb-2" style={{ borderColor: primaryColor }}>
        <div className="flex justify-between items-baseline">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-900">
            {personal.fullName || 'Candidate Name'}
          </h1>
          {personal.title && (
            <span className="text-xs font-bold" style={{ color: primaryColor }}>
              {personal.title}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-[11px] text-slate-600 font-medium">
          {personal.phone && <span>Tel: {personal.phone}</span>}
          {personal.email && <span>•</span>}
          {personal.email && <span>Email: {personal.email}</span>}
          {personal.location && <span>•</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.linkedin && <span>•</span>}
          {personal.linkedin && (
            <span className="text-slate-800">
              LinkedIn: {personal.linkedin.replace(/^https?:\/\/(www\.)?/i, '')}
            </span>
          )}
          {personal.github && <span>•</span>}
          {personal.github && (
            <span className="text-slate-800">
              GitHub: {personal.github.replace(/^https?:\/\/(www\.)?/i, '')}
            </span>
          )}
        </div>
      </header>

      {/* Summary */}
      {visibleSections.summary && summary && (
        <section className="space-y-0.5">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider pb-0.5 border-b"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Summary
          </h2>
          <p className="text-[11px] text-slate-700 leading-snug text-justify">{summary}</p>
        </section>
      )}

      {/* Education (4 columns in compact table) */}
      {visibleSections.education && education.length > 0 && (
        <section className="space-y-1">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider pb-0.5 border-b"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Education
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-center border-collapse text-[11px] border border-slate-300">
              <colgroup>
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
                <col style={{ width: '25%' }} />
              </colgroup>
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-1 border-r border-slate-300 text-center align-middle w-1/4 break-words">Degree</th>
                  <th className="p-1 border-r border-slate-300 text-center align-middle w-1/4 break-words">Institution</th>
                  <th className="p-1 border-r border-slate-300 text-center align-middle w-1/4 break-words">Year</th>
                  <th className="p-1 text-center align-middle w-1/4 break-words">Marks (%) / CGPA</th>
                </tr>
              </thead>
              <tbody>
                {education.map((edu, idx) => (
                  <tr key={edu.id} className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="p-1 border-r border-t border-slate-300 font-semibold text-slate-900 text-center align-middle w-1/4 break-words">{edu.degree}</td>
                    <td className="p-1 border-r border-t border-slate-300 text-slate-700 text-center align-middle w-1/4 break-words">{edu.institution}</td>
                    <td className="p-1 border-r border-t border-slate-300 text-center align-middle text-slate-600 w-1/4 break-words">
                      {edu.endDate || edu.startDate || (edu.current ? 'Present' : '—')}
                    </td>
                    <td className="p-1 border-t border-slate-300 text-center align-middle font-medium text-slate-900 w-1/4 break-words">
                      {edu.gpa || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Experience */}
      {visibleSections.experience && experience.length > 0 && (
        <section className="space-y-1">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider pb-0.5 border-b"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Experience
          </h2>
          <div className="space-y-1.5">
            {experience.map((exp) => (
              <div key={exp.id} className="text-[11px]">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{exp.role} | {exp.company}</span>
                  <span className="text-slate-500 font-normal">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-slate-700">
                    {exp.highlights.filter(Boolean).map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {visibleSections.projects && projects.length > 0 && (
        <section className="space-y-1">
          <h2
            className="text-[11px] font-bold uppercase tracking-wider pb-0.5 border-b"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Projects
          </h2>
          <div className="space-y-1.5">
            {projects.map((proj) => {
              const validGh = validateAndFormatUrl(proj.githubUrl);
              return (
                <div key={proj.id} className="text-[11px]">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{proj.name} {proj.techStack && <span className="font-normal text-slate-500">[{proj.techStack}]</span>}</span>
                    {validGh.isValid && (
                      <a
                        href={validGh.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-slate-700 hover:text-indigo-600 flex items-center gap-1 text-[10px]"
                      >
                        <GithubIcon className="w-2.5 h-2.5" />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                  {proj.description && <p className="text-slate-700 leading-snug">{proj.description}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skills & Certifications side-by-side to save vertical space */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
        {visibleSections.skills && skillCategories.length > 0 && (
          <section className="space-y-0.5">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider pb-0.5 border-b"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Skills
            </h2>
            <div className="space-y-0.5">
              {skillCategories.map((cat) => (
                <div key={cat.id}>
                  <strong className="text-slate-800">{cat.name}: </strong>
                  <span className="text-slate-600">{cat.skills.join(', ')}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {visibleSections.certifications && certifications.length > 0 && (
          <section className="space-y-0.5">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider pb-0.5 border-b"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Certifications
            </h2>
            <div className="space-y-0.5">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between">
                  <span>
                    <strong>{cert.name}</strong> ({cert.issuer})
                    {cert.fileData && (
                      <a
                        href={cert.fileData}
                        download={cert.fileName || 'cert'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-print ml-1.5 text-indigo-600 underline font-medium"
                      >
                        [Download]
                      </a>
                    )}
                  </span>
                  {cert.date && <span className="text-slate-500">{cert.date}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Declaration (if enabled) */}
      {declaration && declaration.enabled !== false && renderDeclarationSection('academic')}
    </div>
  );

  return (
    <div
      id="resume-document"
      data-template={template}
      className="resume-page bg-white shadow-xl rounded-lg mx-auto w-full max-w-[210mm] min-h-[297mm] transition-all duration-150 overflow-visible"
      style={{
        fontFamily: activeFontStack,
        lineHeight,
        ['--resume-font-family' as any]: activeFontStack,
        ['--resume-primary-color' as any]: primaryColor,
        ['--resume-name-size' as any]: `${nameSize}px`,
        ['--resume-heading-size' as any]: `${headingSize}px`,
        ['--resume-body-size' as any]: `${bodySize}px`,
        ['--resume-section-gap' as any]: `${sectionGap}px`,
        ['--resume-page-margin' as any]: `${pageMargin}mm`,
        ['--resume-name-weight' as any]: nameWeight,
        ['--resume-name-style' as any]: nameFormat.italic ? 'italic' : 'normal',
        ['--resume-name-decoration' as any]: nameFormat.underline ? 'underline' : 'none',
        ['--resume-heading-weight' as any]: headingWeight,
        ['--resume-heading-style' as any]: headingFormat.italic ? 'italic' : 'normal',
        ['--resume-heading-decoration' as any]: headingFormat.underline ? 'underline' : 'none',
        ['--resume-subheading-weight' as any]: subheadingWeight,
        ['--resume-subheading-style' as any]: subheadingFormat.italic ? 'italic' : 'normal',
        ['--resume-subheading-decoration' as any]: subheadingFormat.underline ? 'underline' : 'none',
        ['--resume-body-weight' as any]: bodyWeight,
        ['--resume-body-style' as any]: bodyFormat.italic ? 'italic' : 'normal',
        ['--resume-body-decoration' as any]: bodyFormat.underline ? 'underline' : 'none',
      }}
    >
      {template === 'academic' && renderAcademic(false, false)}
      {template === 'academic-decl' && renderAcademic(true, false)}
      {template === 'academic-photo-decl' && renderAcademic(true, true)}
      {template === 'traditional' && renderTraditional()}
      {template === 'two-column' && renderTwoColumn()}
      {template === 'modern' && renderModern()}
      {template === 'classic' && renderClassic()}
      {template === 'minimal-ats' && renderMinimalATS()}
      {template === 'corporate' && renderCorporate()}
      {template === 'modern-minimalist' && renderModernMinimalist()}
      {template === 'creative' && renderCreative()}
      {template === 'elegant-serif' && renderElegantSerif()}
      {template === 'compact-one-page' && renderCompactOnePage()}
      {![
        'academic',
        'academic-decl',
        'academic-photo-decl',
        'traditional',
        'two-column',
        'modern',
        'classic',
        'minimal-ats',
        'corporate',
        'modern-minimalist',
        'creative',
        'elegant-serif',
        'compact-one-page',
      ].includes(template) && renderAcademic(false, false)}
    </div>
  );
};
