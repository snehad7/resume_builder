export interface PersonalDetails {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photo?: string; // Base64 data URL
  // Traditional / optional personal details:
  fatherName?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  languages?: string;
  permanentAddress?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  highlights?: string[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  techStack: string;
  link?: string;
  githubUrl?: string;
  description: string;
  highlights: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
  fileName?: string;
  fileData?: string; // Base64 data URL
  fileType?: string;
  fileSize?: number;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface DeclarationData {
  enabled: boolean;
  text: string;
  place: string;
  date: string;
  signatureType: 'draw' | 'upload' | 'none';
  signatureImage?: string; // Base64 data URL for drawn or uploaded signature
  signerName?: string;
}

export interface ResumeData {
  personal: PersonalDetails;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skillCategories: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  customSections: CustomSection[];
  declaration?: DeclarationData;
}

export type ResumeTemplateId =
  | 'academic'
  | 'academic-decl'
  | 'academic-photo-decl'
  | 'traditional'
  | 'two-column'
  | 'modern'
  | 'classic'
  | 'minimal-ats'
  | 'corporate'
  | 'modern-minimalist'
  | 'creative'
  | 'elegant-serif'
  | 'compact-one-page';

export type ResumeFont = 'sans' | 'serif' | 'mono' | 'modern';

export type ResumeSpacing = 'compact' | 'normal' | 'relaxed';

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextFormatting {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  weight?: FontWeight;
}

export interface ResumeFormattingOptions {
  name?: TextFormatting;
  headings?: TextFormatting;
  subheadings?: TextFormatting;
  body?: TextFormatting;
}

export interface ResumeTypographySettings {
  fontFamily: string; // 'Inter' | 'Arial' | 'Calibri' | 'Roboto' | 'Lato' | 'Open Sans' | 'Poppins' | 'Montserrat' | 'Source Sans 3' | 'Georgia' | 'Garamond' | 'Times New Roman'
  nameSize: number; // 20–36px, default 26
  headingSize: number; // 12–20px, default 14
  bodySize: number; // 10–14px, default 11
  formatting?: ResumeFormattingOptions;
}

export interface CustomDesignPreset {
  id: string;
  name: string;
  template: ResumeTemplateId;
  primaryColor: string;
  typography: ResumeTypographySettings;
  layout: ResumeLayoutSettings;
  createdAt: number;
}

export interface ResumeLayoutSettings {
  pageMargin: number; // in mm (10–30mm, default 20)
  sectionGap: number; // in px (8–28px, default 16)
  lineHeight: number; // unitless (1.2–1.8, default 1.45)
  contentDensity: 'compact' | 'normal' | 'relaxed';
}

export interface ResumeSettings {
  template: ResumeTemplateId;
  primaryColor: string;
  fontFamily: ResumeFont;
  spacing: ResumeSpacing;
  visibleSections: {
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
    custom: boolean;
  };
  typography?: ResumeTypographySettings;
  layout?: ResumeLayoutSettings;
}
