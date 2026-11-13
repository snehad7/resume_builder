import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ImageRun,
  convertInchesToTwip,
  ShadingType,
  VerticalAlign,
} from 'docx';
import { ResumeData, ResumeSettings } from '../types/resume';
import { EXTRA_CANVA_RECIPES, isExtraCanvaTemplate } from '../data/canvaTemplates';

/**
 * Converts a base64 data URL (e.g. "data:image/png;base64,iVBOR...") to a Uint8Array
 * for use in docx ImageRun. Returns null on failure.
 */
function dataUrlToUint8Array(dataUrl?: string): Uint8Array | null {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  try {
    const commaIndex = dataUrl.indexOf(',');
    const base64String = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : dataUrl;
    const cleanBase64 = base64String.trim().replace(/\s/g, '');
    const binary = atob(cleanBase64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch (err) {
    console.warn('Failed to parse base64 image for docx export:', err);
    return null;
  }
}

type AlignmentValue = (typeof AlignmentType)[keyof typeof AlignmentType];

function getImageType(dataUrl?: string): 'png' | 'jpg' {
  if (dataUrl && (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg'))) {
    return 'jpg';
  }
  return 'png';
}

/**
 * Normalizes hex colors without '#' for docx XML properties
 */
function toDocxHex(hex?: string, fallback = '1E3A8A'): string {
  if (!hex) return fallback;
  const cleaned = hex.replace('#', '').trim();
  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return cleaned.toUpperCase();
  }
  return fallback;
}

/**
 * Helper to generate light tint for section header background shading
 */
function getLightTintHex(hex: string): string {
  const clean = toDocxHex(hex);
  // Mix 85% white with 15% color for soft background band
  try {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    const mix = (c: number) => Math.round(c * 0.12 + 255 * 0.88).toString(16).padStart(2, '0');
    return `${mix(r)}${mix(g)}${mix(b)}`.toUpperCase();
  } catch {
    return 'F0F4F8';
  }
}

/**
 * Builds a genuine Microsoft Word (.docx) document from ResumeData and ResumeSettings
 */
export async function generateDocxBlob(
  data: ResumeData,
  settings: ResumeSettings
  ): Promise<{ blob: Blob; fileName: string }> {
  const { personal, summary, experience, education, skillCategories, projects, certifications, customSections, declaration } = data;
  const template = settings.template || 'academic';
  const extraRecipe = isExtraCanvaTemplate(template) ? EXTRA_CANVA_RECIPES[template] : null;
  const isTraditional = template === 'traditional';
  const isAcademic = template.startsWith('academic');
  const isMinimalATS = template === 'minimal-ats' || template === 'canva-minimal-type';
  const isCorporate =
    template === 'corporate' ||
    template === 'canva-dark-sidebar' ||
    template === 'canva-monogram' ||
    template === 'canva-executive-slate' ||
    template === 'canva-midnight-gold' ||
    template === 'canva-navy-banner' ||
    template === 'canva-headline-box';
  const isModernMinimalist =
    template === 'modern-minimalist' ||
    template === 'canva-nordic' ||
    template === 'canva-vermilion-line' ||
    template === 'canva-slate-rightbar' ||
    template === 'canva-tech-mono';
  const isCreative =
    template === 'creative' ||
    template === 'canva-editorial-split' ||
    template === 'canva-ribbon' ||
    Boolean(
      extraRecipe &&
        !isCorporate &&
        !isModernMinimalist &&
        !isMinimalATS &&
        extraRecipe.sectionStyle !== 'double-rule'
    );
  const isElegantSerif =
    template === 'elegant-serif' ||
    template === 'canva-broadsheet' ||
    template === 'canva-ivory-classic' ||
    template === 'canva-blush-minimal' ||
    template === 'canva-executive-signature';
  const isCompact = template === 'compact-one-page';
  const isPhotoLayout =
    template === 'academic-photo-decl' ||
    Boolean(extraRecipe?.showPhoto && personal.photo) ||
    ((isCreative || isCorporate || isModernMinimalist) && Boolean(personal.photo));

  const typographyFont = settings.typography?.fontFamily;
  const fontName =
    typographyFont === 'Times New Roman'
      ? 'Times New Roman'
      : typographyFont === 'Georgia'
      ? 'Georgia'
      : typographyFont === 'Garamond'
      ? 'Garamond'
      : typographyFont === 'Arial'
      ? 'Arial'
      : typographyFont === 'Calibri'
      ? 'Calibri'
      : typographyFont === 'Roboto'
      ? 'Arial'
      : typographyFont === 'Lato' ||
        typographyFont === 'Open Sans' ||
        typographyFont === 'Poppins' ||
        typographyFont === 'Montserrat' ||
        typographyFont === 'Source Sans 3'
      ? 'Calibri'
      : typographyFont === 'Inter'
      ? 'Arial'
      : settings.fontFamily === 'serif' || isElegantSerif || template === 'classic' || isTraditional
      ? 'Times New Roman'
      : settings.fontFamily === 'mono'
      ? 'Consolas'
      : settings.fontFamily === 'modern' || isCorporate || isCreative
      ? 'Segoe UI'
      : 'Calibri';

  const formatting = settings.typography?.formatting;
  const nameFormat = formatting?.name || { bold: true, italic: false, underline: false, weight: 'bold' };
  const headingFormat = formatting?.headings || { bold: true, italic: false, underline: false, weight: 'semibold' };
  const subheadingFormat = formatting?.subheadings || { bold: true, italic: false, underline: false, weight: 'medium' };
  const bodyFormat = formatting?.body || { bold: false, italic: false, underline: false, weight: 'regular' };

  const nameSize = settings.typography?.nameSize ?? 26;
  const headingSize = settings.typography?.headingSize ?? 14;
  const bodySize = settings.typography?.bodySize ?? 11;

  const primaryHex = toDocxHex(
    settings.primaryColor,
    isAcademic ? '0284C7' : isMinimalATS ? '0F172A' : isCorporate ? '1E3A8A' : '1E3A8A'
  );
  const lightTintHex = getLightTintHex(primaryHex);
  const borderHex = isTraditional || isMinimalATS ? '94A3B8' : primaryHex;

  const children: (Paragraph | Table)[] = [];

  // ==========================================
  // 1. SECTION HEADING FACTORY
  // ==========================================
  const createSectionHeading = (title: string): Paragraph => {
    if (isMinimalATS) {
      // Clean, unboxed linear ATS heading
      return new Paragraph({
        spacing: { before: 180, after: 60 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 10,
            color: '334155',
            space: 3,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 21,
            color: '0F172A',
            font: fontName,
          }),
        ],
      });
    } else if (isCorporate) {
      // Shaded corporate header band
      return new Paragraph({
        spacing: { before: 200, after: 80 },
        shading: {
          type: ShadingType.CLEAR,
          fill: lightTintHex,
        },
        border: {
          left: {
            style: BorderStyle.SINGLE,
            size: 24,
            color: primaryHex,
            space: 6,
          },
        },
        children: [
          new TextRun({
            text: `  ${title.toUpperCase()}`,
            bold: true,
            size: 21,
            color: primaryHex,
            font: fontName,
          }),
        ],
      });
    } else if (isModernMinimalist) {
      // Minimalist hairline divider
      return new Paragraph({
        spacing: { before: 220, after: 80 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: 'CBD5E1',
            space: 4,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 20,
            color: primaryHex,
            font: fontName,
          }),
        ],
      });
    } else if (isCreative) {
      // Creative accent border
      return new Paragraph({
        spacing: { before: 200, after: 80 },
        border: {
          left: {
            style: BorderStyle.SINGLE,
            size: 24,
            color: primaryHex,
            space: 6,
          },
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: primaryHex,
            space: 2,
          },
        },
        children: [
          new TextRun({
            text: `  ${title.toUpperCase()}`,
            bold: true,
            size: 22,
            color: primaryHex,
            font: fontName,
          }),
        ],
      });
    } else if (isElegantSerif) {
      // Elegant serif centered heading
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 80 },
        border: {
          bottom: {
            style: BorderStyle.DOUBLE,
            size: 10,
            color: '64748B',
            space: 4,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 21,
            color: '0F172A',
            font: fontName,
          }),
        ],
      });
    } else if (isCompact) {
      // Space-optimized compact heading
      return new Paragraph({
        spacing: { before: 120, after: 40 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 8,
            color: primaryHex,
            space: 2,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 19,
            color: primaryHex,
            font: fontName,
          }),
        ],
      });
    } else if (isAcademic) {
      // Academic light-blue tinted banner
      return new Paragraph({
        spacing: { before: 200, after: 100 },
        shading: {
          type: ShadingType.CLEAR,
          fill: lightTintHex,
        },
        border: {
          left: {
            style: BorderStyle.SINGLE,
            size: 18,
            color: primaryHex,
            space: 6,
          },
        },
        children: [
          new TextRun({
            text: `  ${title.toUpperCase()}`,
            bold: true,
            size: 21,
            color: primaryHex,
            font: fontName,
          }),
        ],
      });
    } else if (isTraditional) {
      // Traditional formal underline / top-bottom borders
      return new Paragraph({
        spacing: { before: 200, after: 80 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 10,
            color: '64748B',
            space: 3,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            color: '0F172A',
            font: fontName,
          }),
        ],
      });
    } else {
      // Modern / Executive / Classic with colored bottom rule
      return new Paragraph({
        spacing: { before: 220, after: 100 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 12,
            color: primaryHex,
            space: 4,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            color: primaryHex,
            font: fontName,
          }),
        ],
      });
    }
  };

  // ==========================================
  // 2. HEADER / PERSONAL DETAILS
  // ==========================================
  const photoBytes = personal.photo ? dataUrlToUint8Array(personal.photo) : null;
  const shouldShowPhoto = isPhotoLayout && photoBytes;

  if (isAcademic) {
    // "RESUME" Centered Banner
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: 'RESUME',
            bold: true,
            size: 22,
            color: '334155',
            font: fontName,
          }),
        ],
      })
    );
  } else if (isTraditional) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [
          new TextRun({
            text: 'CURRICULUM VITAE',
            bold: true,
            size: 24,
            color: '0F172A',
            font: fontName,
          }),
        ],
      })
    );
  }

  // Header content layout
  if (shouldShowPhoto && photoBytes) {
    // 2-column header table with info on left and photo on right
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.SINGLE, size: 12, color: primaryHex },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 75, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    spacing: { before: 0, after: 40 },
                    children: [
                      new TextRun({
                        text: (personal.fullName || 'Candidate Name').toUpperCase(),
                        bold: true,
                        size: 32, // 16pt
                        color: '0F172A',
                        font: fontName,
                      }),
                    ],
                  }),
                  ...(personal.title
                    ? [
                        new Paragraph({
                          spacing: { before: 0, after: 60 },
                          children: [
                            new TextRun({
                              text: personal.title,
                              bold: true,
                              size: 22,
                              color: primaryHex,
                              font: fontName,
                            }),
                          ],
                        }),
                      ]
                    : []),
                  new Paragraph({
                    spacing: { before: 0, after: 60 },
                    children: buildContactRuns(personal, fontName),
                  }),
                ],
              }),
              new TableCell({
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new ImageRun({
                        data: photoBytes,
                        transformation: {
                          width: 105,
                          height: 125,
                        },
                        type: getImageType(personal.photo),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  } else {
    // Centered or left-aligned standard header
    const align = isAcademic || isTraditional ? AlignmentType.CENTER : AlignmentType.LEFT;

    children.push(
      new Paragraph({
        alignment: align,
        spacing: { before: 0, after: 40 },
        children: [
          new TextRun({
            text: (personal.fullName || 'Candidate Name').toUpperCase(),
            bold: true,
            size: 32,
            color: '0F172A',
            font: fontName,
          }),
        ],
      })
    );

    if (personal.title) {
      children.push(
        new Paragraph({
          alignment: align,
          spacing: { before: 0, after: 40 },
          children: [
            new TextRun({
              text: personal.title,
              bold: true,
              size: 22,
              color: primaryHex,
              font: fontName,
            }),
          ],
        })
      );
    }

    children.push(
      new Paragraph({
        alignment: align,
        spacing: { before: 0, after: 120 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 10,
            color: primaryHex,
            space: 6,
          },
        },
        children: buildContactRuns(personal, fontName),
      })
    );
  }

  // ==========================================
  // 3. CAREER OBJECTIVE / SUMMARY
  // ==========================================
  if (settings.visibleSections.summary && summary?.trim()) {
    children.push(createSectionHeading(isAcademic || isTraditional ? 'Career Objective' : 'Professional Summary'));
    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 40, after: 120 },
        children: [
          new TextRun({
            text: summary.trim(),
            size: 20, // 10pt
            color: '334155',
            font: fontName,
          }),
        ],
      })
    );
  }

  // ==========================================
  // 4. EDUCATION (Structured Table: 4 required columns)
  // Columns: Degree, Institution, Year, Marks (%) / CGPA
  // ==========================================
  if (settings.visibleSections.education && education?.length > 0) {
    children.push(createSectionHeading('Education'));

    const tableHeaderCell = (text: string, widthPercent: number, align: AlignmentValue = AlignmentType.CENTER) =>
      new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        shading: {
          type: ShadingType.CLEAR,
          fill: lightTintHex,
        },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: align,
            children: [
              new TextRun({
                text,
                bold: true,
                size: 19,
                color: '0F172A',
                font: fontName,
              }),
            ],
          }),
        ],
      });

    const tableDataCell = (
      text: string,
      widthPercent: number,
      align: AlignmentValue = AlignmentType.CENTER,
      isBold = false
    ) =>
      new TableCell({
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        children: [
          new Paragraph({
            alignment: align,
            children: [
              new TextRun({
                text: text || '—',
                bold: isBold,
                size: 19,
                color: '334155',
                font: fontName,
              }),
            ],
          }),
        ],
      });

    const eduRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        children: [
          tableHeaderCell('Degree', 25, AlignmentType.CENTER),
          tableHeaderCell('Institution', 25, AlignmentType.CENTER),
          tableHeaderCell('Year', 25, AlignmentType.CENTER),
          tableHeaderCell('Marks (%) / CGPA', 25, AlignmentType.CENTER),
        ],
      }),
    ];

    education.forEach((edu) => {
      const yearText = edu.endDate || edu.startDate || (edu.current ? 'Present' : '—');
      const marksText = edu.gpa || '—';

      eduRows.push(
        new TableRow({
          children: [
            tableDataCell(edu.degree, 25, AlignmentType.CENTER, true),
            tableDataCell(edu.institution, 25, AlignmentType.CENTER, false),
            tableDataCell(yearText, 25, AlignmentType.CENTER, false),
            tableDataCell(marksText, 25, AlignmentType.CENTER, false),
          ],
        })
      );
    });

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 8, color: borderHex },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: borderHex },
          left: { style: BorderStyle.SINGLE, size: 8, color: borderHex },
          right: { style: BorderStyle.SINGLE, size: 8, color: borderHex },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: borderHex },
          insideVertical: { style: BorderStyle.SINGLE, size: 4, color: borderHex },
        },
        rows: eduRows,
      })
    );
  }

  // ==========================================
  // 5. EXPERIENCE
  // ==========================================
  if (settings.visibleSections.experience && experience?.length > 0) {
    children.push(createSectionHeading(isAcademic ? 'Experience / Internships' : 'Work Experience'));

    experience.forEach((exp) => {
      const dateText = `${exp.startDate || ''}${exp.startDate && (exp.endDate || exp.current) ? ' – ' : ''}${
        exp.current ? 'Present' : exp.endDate || ''
      }`;

      children.push(
        new Paragraph({
          spacing: { before: 90, after: 30 },
          children: [
            new TextRun({
              text: exp.role || 'Role',
              bold: true,
              size: 21,
              color: '0F172A',
              font: fontName,
            }),
            new TextRun({
              text: exp.company ? `  |  ${exp.company}` : '',
              bold: true,
              size: 21,
              color: primaryHex,
              font: fontName,
            }),
            new TextRun({
              text: exp.location ? `  (${exp.location})` : '',
              size: 19,
              color: '64748B',
              font: fontName,
            }),
            new TextRun({
              text: dateText ? `     [${dateText}]` : '',
              size: 19,
              color: '475569',
              font: fontName,
            }),
          ],
        })
      );

      if (exp.highlights && exp.highlights.length > 0) {
        exp.highlights.forEach((h) => {
          if (h.trim()) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({
                    text: h.trim(),
                    size: 19,
                    color: '334155',
                    font: fontName,
                  }),
                ],
              })
            );
          }
        });
      }
    });
  }

  // ==========================================
  // 6. PROJECTS
  // ==========================================
  if (settings.visibleSections.projects && projects?.length > 0) {
    children.push(createSectionHeading(isAcademic ? 'Academic Projects' : 'Projects'));

    projects.forEach((proj) => {
      const titleRuns: TextRun[] = [
        new TextRun({
          text: proj.name || 'Project Name',
          bold: true,
          size: 21,
          color: '0F172A',
          font: fontName,
        }),
      ];

      if (proj.techStack) {
        titleRuns.push(
          new TextRun({
            text: `  [${proj.techStack}]`,
            bold: false,
            size: 19,
            color: primaryHex,
            font: fontName,
          })
        );
      }

      if (proj.githubUrl) {
        titleRuns.push(
          new TextRun({
            text: `  (GitHub: ${proj.githubUrl})`,
            size: 18,
            color: '2563EB',
            font: fontName,
          })
        );
      } else if (proj.link) {
        titleRuns.push(
          new TextRun({
            text: `  (${proj.link})`,
            size: 18,
            color: '2563EB',
            font: fontName,
          })
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 90, after: 30 },
          children: titleRuns,
        })
      );

      if (proj.description?.trim()) {
        children.push(
          new Paragraph({
            spacing: { before: 20, after: 30 },
            children: [
              new TextRun({
                text: proj.description.trim(),
                size: 19,
                color: '334155',
                font: fontName,
              }),
            ],
          })
        );
      }

      if (proj.highlights && proj.highlights.length > 0) {
        proj.highlights.forEach((h) => {
          if (h.trim()) {
            children.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({
                    text: h.trim(),
                    size: 19,
                    color: '334155',
                    font: fontName,
                  }),
                ],
              })
            );
          }
        });
      }
    });
  }

  // ==========================================
  // 7. TECHNICAL SKILLS
  // ==========================================
  if (settings.visibleSections.skills && skillCategories?.length > 0) {
    children.push(createSectionHeading('Technical Skills'));

    skillCategories.forEach((cat) => {
      const skillsStr = cat.skills && cat.skills.length > 0 ? cat.skills.join(', ') : '';
      if (skillsStr || cat.name) {
        children.push(
          new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [
              new TextRun({
                text: `• ${cat.name || 'Skills'}: `,
                bold: true,
                size: 20,
                color: '0F172A',
                font: fontName,
              }),
              new TextRun({
                text: skillsStr,
                size: 20,
                color: '334155',
                font: fontName,
              }),
            ],
          })
        );
      }
    });
  }

  // ==========================================
  // 8. CERTIFICATIONS
  // ==========================================
  if (settings.visibleSections.certifications && certifications?.length > 0) {
    children.push(createSectionHeading('Certifications'));

    certifications.forEach((cert) => {
      const runs: TextRun[] = [
        new TextRun({
          text: `• ${cert.name || 'Certificate'}`,
          bold: true,
          size: 20,
          color: '0F172A',
          font: fontName,
        }),
      ];

      if (cert.issuer) {
        runs.push(
          new TextRun({
            text: ` — ${cert.issuer}`,
            size: 20,
            color: '334155',
            font: fontName,
          })
        );
      }

      if (cert.date) {
        runs.push(
          new TextRun({
            text: ` (${cert.date})`,
            size: 19,
            color: '64748B',
            font: fontName,
          })
        );
      }

      if (cert.fileName) {
        runs.push(
          new TextRun({
            text: ` [Attached: ${cert.fileName}]`,
            size: 18,
            color: '0284C7',
            font: fontName,
          })
        );
      } else if (cert.url) {
        runs.push(
          new TextRun({
            text: ` [${cert.url}]`,
            size: 18,
            color: '2563EB',
            font: fontName,
          })
        );
      }

      children.push(
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: runs,
        })
      );
    });
  }

  // ==========================================
  // 9. TRADITIONAL PERSONAL DETAILS
  // ==========================================
  const hasTraditionalDetails =
    personal.fatherName ||
    personal.dob ||
    personal.gender ||
    personal.maritalStatus ||
    personal.nationality ||
    personal.languages ||
    personal.permanentAddress;

  if (isTraditional && hasTraditionalDetails) {
    children.push(createSectionHeading('Personal Details'));

    const addDetailRow = (label: string, value?: string) => {
      if (!value?.trim()) return;
      children.push(
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({
              text: `${label}: `,
              bold: true,
              size: 20,
              color: '0F172A',
              font: fontName,
            }),
            new TextRun({
              text: value.trim(),
              size: 20,
              color: '334155',
              font: fontName,
            }),
          ],
        })
      );
    };

    addDetailRow("Father's Name", personal.fatherName);
    addDetailRow('Date of Birth', personal.dob);
    addDetailRow('Gender', personal.gender);
    addDetailRow('Marital Status', personal.maritalStatus);
    addDetailRow('Nationality', personal.nationality);
    addDetailRow('Languages Known', personal.languages);
    addDetailRow('Permanent Address', personal.permanentAddress);
  }

  // ==========================================
  // 10. CUSTOM SECTIONS
  // ==========================================
  if (settings.visibleSections.custom && customSections?.length > 0) {
    customSections.forEach((cs) => {
      if (cs.items && cs.items.length > 0) {
        children.push(createSectionHeading(cs.title || 'Additional Information'));

        cs.items.forEach((item) => {
          const runs: TextRun[] = [
            new TextRun({
              text: item.title || '',
              bold: true,
              size: 20,
              color: '0F172A',
              font: fontName,
            }),
          ];
          if (item.subtitle) {
            runs.push(
              new TextRun({
                text: `  |  ${item.subtitle}`,
                size: 19,
                color: primaryHex,
                font: fontName,
              })
            );
          }
          if (item.date) {
            runs.push(
              new TextRun({
                text: `  (${item.date})`,
                size: 19,
                color: '64748B',
                font: fontName,
              })
            );
          }

          children.push(
            new Paragraph({
              spacing: { before: 60, after: 20 },
              children: runs,
            })
          );

          if (item.description?.trim()) {
            children.push(
              new Paragraph({
                spacing: { before: 10, after: 30 },
                children: [
                  new TextRun({
                    text: item.description.trim(),
                    size: 19,
                    color: '334155',
                    font: fontName,
                  }),
                ],
              })
            );
          }
        });
      }
    });
  }

  // ==========================================
  // 11. DECLARATION & SIGNATURE
  // ==========================================
  const shouldRenderDeclaration =
    declaration?.enabled ||
    template === 'academic-decl' ||
    template === 'academic-photo-decl' ||
    template === 'traditional';

  if (shouldRenderDeclaration && declaration) {
    children.push(createSectionHeading('Declaration'));

    const declStatement =
      declaration.text?.trim() ||
      'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.';

    children.push(
      new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 40, after: 120 },
        children: [
          new TextRun({
            text: declStatement,
            italics: true,
            size: 19,
            color: '334155',
            font: fontName,
          }),
        ],
      })
    );

    const placeText = declaration.place || personal.location || '—';
    const dateText = declaration.date || new Date().toISOString().split('T')[0];
    const signerName = declaration.signerName || personal.fullName || 'Candidate';

    // Signature data
    const sigType = declaration.signatureType || 'draw';
    const sigBytes =
      sigType !== 'none' && declaration.signatureImage ? dataUrlToUint8Array(declaration.signatureImage) : null;

    const signatureParagraphs: Paragraph[] = [];

    if (sigBytes) {
      // Candidate's actual drawn or uploaded signature image!
      signatureParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: 30 },
          children: [
            new ImageRun({
              data: sigBytes,
              transformation: {
                width: 140,
                height: 44,
              },
              type: getImageType(declaration.signatureImage),
            }),
          ],
        })
      );
      // Signature line under the image
      signatureParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 0, after: 30 },
          children: [
            new TextRun({
              text: '____________________________',
              size: 16,
              color: '475569',
              font: fontName,
            }),
          ],
        })
      );
    } else {
      // Blank signature line
      signatureParagraphs.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 20, after: 40 },
          children: [
            new TextRun({
              text: '____________________________',
              bold: true,
              size: 18,
              color: '1E293B',
              font: fontName,
            }),
          ],
        })
      );
    }

    signatureParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 10 },
        children: [
          new TextRun({
            text: `(${signerName.toUpperCase()})`,
            bold: true,
            size: 20,
            color: '0F172A',
            font: fontName,
          }),
        ],
      })
    );

    signatureParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 0 },
        children: [
          new TextRun({
            text: 'Candidate Signature',
            size: 17,
            color: '64748B',
            font: fontName,
          }),
        ],
      })
    );

    // Place & Date on left, Signature on right in 2-column table
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: [
                  new Paragraph({
                    spacing: { before: 30, after: 20 },
                    children: [
                      new TextRun({
                        text: 'Place: ',
                        bold: true,
                        size: 20,
                        color: '0F172A',
                        font: fontName,
                      }),
                      new TextRun({
                        text: placeText,
                        size: 20,
                        color: '334155',
                        font: fontName,
                      }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { before: 10, after: 20 },
                    children: [
                      new TextRun({
                        text: 'Date: ',
                        bold: true,
                        size: 20,
                        color: '0F172A',
                        font: fontName,
                      }),
                      new TextRun({
                        text: dateText,
                        size: 20,
                        color: '334155',
                        font: fontName,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                children: signatureParagraphs,
              }),
            ],
          }),
        ],
      })
    );
  }

  // ==========================================
  // CONSTRUCT WORD DOCUMENT
  // ==========================================
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: fontName,
            size: Math.round(bodySize * 1.8), // docx half-points
            bold: bodyFormat.bold || bodyFormat.weight === 'bold',
            italics: bodyFormat.italic,
            underline: bodyFormat.underline ? { type: 'single' } : undefined,
            color: '334155',
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip((settings.layout?.pageMargin ?? (isCompact ? 12 : 18)) * 0.03937),
              right: convertInchesToTwip((settings.layout?.pageMargin ?? (isCompact ? 12 : 18)) * 0.03937),
              bottom: convertInchesToTwip((settings.layout?.pageMargin ?? (isCompact ? 12 : 18)) * 0.03937),
              left: convertInchesToTwip((settings.layout?.pageMargin ?? (isCompact ? 12 : 18)) * 0.03937),
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanName = (personal.fullName || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = cleanName ? `${cleanName}_Resume.docx` : 'Resume.docx';

  return { blob, fileName };
}

/**
 * Helper to build contact information TextRuns
 */
function buildContactRuns(personal: ResumeData['personal'], fontName: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts: { label?: string; val: string }[] = [];

  if (personal.phone) parts.push({ label: 'Tel: ', val: personal.phone });
  if (personal.email) parts.push({ label: 'Email: ', val: personal.email });
  if (personal.location) parts.push({ val: personal.location });
  if (personal.linkedin) parts.push({ label: 'LinkedIn: ', val: personal.linkedin.replace(/^https?:\/\/(www\.)?/i, '') });
  if (personal.github) parts.push({ label: 'GitHub: ', val: personal.github.replace(/^https?:\/\/(www\.)?/i, '') });
  if (personal.website) parts.push({ label: 'Web: ', val: personal.website.replace(/^https?:\/\/(www\.)?/i, '') });

  parts.forEach((p, idx) => {
    if (idx > 0) {
      runs.push(
        new TextRun({
          text: '   •   ',
          size: 18,
          color: '94A3B8',
          font: fontName,
        })
      );
    }
    if (p.label) {
      runs.push(
        new TextRun({
          text: p.label,
          bold: true,
          size: 18,
          color: '475569',
          font: fontName,
        })
      );
    }
    runs.push(
      new TextRun({
        text: p.val,
        size: 18,
        color: '334155',
        font: fontName,
      })
    );
  });

  return runs;
}

/**
 * Triggers direct browser download of the generated .docx file
 */
export async function downloadResumeDocx(data: ResumeData, settings: ResumeSettings): Promise<string> {
  const { blob, fileName } = await generateDocxBlob(data, settings);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return fileName;
}
