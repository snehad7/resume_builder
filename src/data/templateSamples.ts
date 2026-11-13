import { ResumeData, ResumeSettings, ResumeTemplateId } from '../types/resume';
import { initialResumeData, initialResumeSettings } from './initialData';
import { EXTRA_CANVA_SHOWCASE_CONFIGS } from './canvaTemplates';

// Crisp hermetic SVG portrait avatars (inline data URIs, zero external requests)
const createPortraitSvg = (bg: string, coat: string, skin: string, hair: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140"><rect width="120" height="140" fill="${bg}"/><path d="M20 140c0-26 18-42 40-42s40 16 40 42H20z" fill="${coat}"/><path d="M48 92h24v16H48z" fill="${skin}"/><circle cx="60" cy="56" r="24" fill="${skin}"/><path d="M36 52c0-17 11-28 24-28s24 11 24 28c-4-10-12-14-24-14s-20 4-24 14z" fill="${hair}"/></svg>`
  )}`;

const createSignatureSvg = (ink: string, pathD: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60"><path d="${pathD}" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  )}`;

const AVATAR_EXEC = createPortraitSvg('#e2e8f0', '#1e293b', '#f1c29d', '#332218');
const AVATAR_ACADEMIC = createPortraitSvg('#ccfbf1', '#0f766e', '#e5b28a', '#1f1b24');
const AVATAR_TRADITIONAL = createPortraitSvg('#e0e7ff', '#1e3a8a', '#deb089', '#1c1917');
const AVATAR_NORDIC = createPortraitSvg('#d1fae5', '#065f46', '#f4cdb0', '#92400e');
const AVATAR_CHARCOAL = createPortraitSvg('#334155', '#0f172a', '#e8be9e', '#27272a');
const AVATAR_RIBBON = createPortraitSvg('#e0f2fe', '#0369a1', '#ecc19c', '#3b2416');

const SIGN_BLUE = createSignatureSvg('#1e3a8a', 'M18 42 C28 16, 38 14, 42 40 C46 28, 58 24, 64 38 C72 22, 86 30, 96 36 C112 34, 134 30, 168 35');
const SIGN_SLATE = createSignatureSvg('#0f172a', 'M14 40 C26 12, 34 46, 52 26 C64 16, 70 42, 84 32 C98 24, 120 34, 158 32');

export interface TemplateShowcaseConfig {
  id: ResumeTemplateId;
  styleLabel: string;
  defaultColor: string;
  fontFamily: string;
  baseFont: 'sans' | 'serif' | 'modern';
  sampleData: ResumeData;
}

export const TEMPLATE_SHOWCASE_CONFIGS: Record<ResumeTemplateId, TemplateShowcaseConfig> = {
  modern: {
    id: 'modern',
    styleLabel: 'Clean Modern',
    defaultColor: '#2563eb',
    fontFamily: 'Inter',
    baseFont: 'sans',
    sampleData: initialResumeData,
  },
  'two-column': {
    id: 'two-column',
    styleLabel: 'Sidebar Layout',
    defaultColor: '#1e40af',
    fontFamily: 'Poppins',
    baseFont: 'modern',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Elena Vance',
        title: 'VP of Product Strategy',
        email: 'elena.vance@example.com',
        phone: '+1 (415) 890-3412',
        location: 'New York, NY',
        website: 'https://elenavance.io',
        linkedin: 'https://linkedin.com/in/elenavance',
        photo: AVATAR_EXEC,
      },
      summary:
        'Product executive with 10+ years scaling B2B SaaS platforms from $12M to $140M ARR. Expert in multi-product roadmap governance, pricing architecture, and global GTM alignment.',
      experience: [
        {
          id: 'tc-1',
          role: 'VP of Product Strategy',
          company: 'Northstar Cloud',
          location: 'New York, NY',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          highlights: [
            'Grew enterprise ARR by 145% over 3 years by launching workflow automation suite.',
            'Led a 28-person PM, UX Research, and Product Ops organization across 4 time zones.',
          ],
        },
        {
          id: 'tc-2',
          role: 'Director of Product Management',
          company: 'LatticeWorks',
          location: 'Boston, MA',
          startDate: '2017',
          endDate: '2021',
          current: false,
          highlights: [
            'Spearheaded self-serve PLG funnel increasing qualified enterprise trials by 62%.',
          ],
        },
      ],
      education: [
        {
          id: 'tc-edu-1',
          degree: 'MBA, Strategy & Innovation',
          institution: 'MIT Sloan School of Management',
          location: 'Cambridge, MA',
          startDate: '2015',
          endDate: '2017',
          current: false,
          gpa: '3.9 / 4.0',
        },
      ],
      skillCategories: [
        { id: 'tc-s1', name: 'Strategy', skills: ['Product Vision', 'PLG Growth', 'M&A Integration', 'Pricing'] },
        { id: 'tc-s2', name: 'Leadership', skills: ['Executive Comms', 'OKR Governance', 'Cross-Functional'] },
      ],
      projects: [],
      certifications: [
        { id: 'tc-c1', name: 'Pragmatic Institute Certified Leader', issuer: 'Pragmatic Institute', date: '2022' },
      ],
      customSections: [],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'minimal-ats': {
    id: 'minimal-ats',
    styleLabel: 'ATS Optimized',
    defaultColor: '#18181b',
    fontFamily: 'Arial',
    baseFont: 'sans',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Marcus Chen',
        title: 'Staff Backend & Infrastructure Engineer',
        email: 'marcus.chen@example.com',
        phone: '+1 (206) 555-0194',
        location: 'Seattle, WA',
        linkedin: 'https://linkedin.com/in/marcuschen',
        github: 'https://github.com/marcuschen',
      },
      summary:
        'Distributed systems engineer specializing in Go, Kubernetes, and event-driven Kafka architectures supporting 99.995% SLA payment pipelines.',
      experience: [
        {
          id: 'ats-1',
          role: 'Staff Infrastructure Engineer',
          company: 'Cascade Payments',
          location: 'Seattle, WA',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          highlights: [
            'Reduced p99 transaction settlement latency from 240ms to 38ms across multi-region clusters.',
            'Automated zero-downtime PostgreSQL sharding migrations handling 80k TPS.',
          ],
        },
        {
          id: 'ats-2',
          role: 'Senior Backend Engineer',
          company: 'CloudScale Corp',
          location: 'Seattle, WA',
          startDate: '2018',
          endDate: '2021',
          current: false,
          highlights: [
            'Designed idempotent billing reconciliation engine eliminating $1.2M annual leakage.',
          ],
        },
      ],
      skillCategories: [
        { id: 'ats-s1', name: 'Languages', skills: ['Go', 'Rust', 'Python', 'SQL', 'Protobuf'] },
        { id: 'ats-s2', name: 'Infrastructure', skills: ['Kubernetes', 'Kafka', 'Terraform', 'AWS', 'PostgreSQL'] },
      ],
      projects: [
        {
          id: 'ats-p1',
          name: 'OpenRaft Consensus Engine',
          techStack: 'Go, gRPC, Prometheus',
          description: 'Lightweight leader-election library with deterministic chaos test harness.',
          highlights: ['1,900+ GitHub stars and zero consistency regressions across 10k fault-injection runs.'],
        },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  corporate: {
    id: 'corporate',
    styleLabel: 'Header Band',
    defaultColor: '#1e293b',
    fontFamily: 'Montserrat',
    baseFont: 'modern',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Victoria Sterling',
        title: 'Director of Corporate Finance & FP&A',
        email: 'v.sterling@example.com',
        phone: '+1 (312) 555-0148',
        location: 'Chicago, IL',
        linkedin: 'https://linkedin.com/in/victoriasterling',
      },
      summary:
        'Chartered Financial Analyst and finance director steering $650M P&L planning, capital allocation, and board-level investor reporting for Fortune 500 manufacturing.',
      experience: [
        {
          id: 'corp-1',
          role: 'Director of Corporate Finance',
          company: 'Midwest Industrial Group',
          location: 'Chicago, IL',
          startDate: '2020',
          endDate: 'Present',
          current: true,
          highlights: [
            'Directed $180M acquisition due diligence and post-merger synergy realization (+18% EBITDA).',
            'Overhauled rolling 12-quarter cash flow forecasting reducing variance from 6.4% to 1.8%.',
          ],
        },
        {
          id: 'corp-2',
          role: 'Senior FP&A Manager',
          company: 'Harbor Logistics Inc.',
          location: 'Chicago, IL',
          startDate: '2016',
          endDate: '2020',
          current: false,
          highlights: [
            'Built automated unit-economics margin models adopted across 14 North American business units.',
          ],
        },
      ],
      education: [
        {
          id: 'corp-e1',
          degree: 'M.S. in Finance',
          institution: 'University of Chicago Booth',
          location: 'Chicago, IL',
          startDate: '2014',
          endDate: '2016',
          current: false,
          gpa: '3.92 / 4.0',
        },
      ],
      skillCategories: [
        { id: 'corp-s1', name: 'Financial Core', skills: ['FP&A', 'M&A Valuation', 'EBITDA Modeling', 'Board Reporting'] },
        { id: 'corp-s2', name: 'Platforms', skills: ['Anaplan', 'SAP S/4HANA', 'Tableau', 'SQL'] },
      ],
      projects: [],
      certifications: [
        { id: 'corp-c1', name: 'Chartered Financial Analyst (CFA)', issuer: 'CFA Institute', date: '2018' },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'modern-minimalist': {
    id: 'modern-minimalist',
    styleLabel: 'Timeline Flow',
    defaultColor: '#0d9488',
    fontFamily: 'Open Sans',
    baseFont: 'sans',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Julian Brooks',
        title: 'Staff Product Designer',
        email: 'julian@brooks.design',
        phone: '+1 (512) 555-0182',
        location: 'Austin, TX',
        website: 'https://brooks.design',
        linkedin: 'https://linkedin.com/in/julianbrooks',
      },
      summary:
        'Design systems architect focused on high-clarity enterprise workflows, accessible component libraries, and measurable conversion ergonomics.',
      experience: [
        {
          id: 'mm-1',
          role: 'Staff Product Designer',
          company: 'Linearity Studio',
          location: 'Austin, TX',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          highlights: [
            'Unified 4 legacy product suites into a single WCAG AA token system used by 60+ engineers.',
            'Redesigned onboarding workflow lifting 14-day activation from 44% to 71%.',
          ],
        },
        {
          id: 'mm-2',
          role: 'Senior UX Designer',
          company: 'Forma Interactive',
          location: 'Remote',
          startDate: '2019',
          endDate: '2022',
          current: false,
          highlights: [
            'Led qualitative usability research across 90+ enterprise buyers to streamline checkout flows.',
          ],
        },
      ],
      skillCategories: [
        { id: 'mm-s1', name: 'Design Craft', skills: ['Design Systems', 'Figma', 'Prototyping', 'WCAG Accessibility'] },
        { id: 'mm-s2', name: 'Frontend', skills: ['React', 'CSS Architecture', 'Motion Design'] },
      ],
      projects: [
        {
          id: 'mm-p1',
          name: 'Prism UI Token Kit',
          techStack: 'Figma Variables, Style Dictionary, React',
          description: 'Open-source multi-brand design token compiler for web and native teams.',
          highlights: ['Adopted by 40+ studio partners with automated contrast verification.'],
        },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  creative: {
    id: 'creative',
    styleLabel: 'Accent Stripe',
    defaultColor: '#7c3aed',
    fontFamily: 'Poppins',
    baseFont: 'modern',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Maya Lin',
        title: 'Creative Technologist & UI Lead',
        email: 'maya.lin@studio.io',
        phone: '+1 (310) 555-0167',
        location: 'Los Angeles, CA',
        website: 'https://mayalin.studio',
        github: 'https://github.com/mayalin',
      },
      summary:
        'Bridging interactive WebGL storytelling and production React engineering to deliver award-winning brand flagships and creator tools.',
      experience: [
        {
          id: 'cr-1',
          role: 'Lead Creative Technologist',
          company: 'Kinetix Digital',
          location: 'Los Angeles, CA',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          highlights: [
            'Architected real-time 3D product configurator driving 3.2x session engagement.',
            'Mentored 8 frontend engineers on shader optimization and 60fps micro-interactions.',
          ],
        },
      ],
      projects: [
        {
          id: 'cr-p1',
          name: 'SonicCanvas Audio Lab',
          techStack: 'TypeScript, WebAudio API, Three.js',
          description: 'Browser-based spatial audio visualizer with real-time MIDI reactivity.',
          highlights: ['Featured in Webby Awards Honoree showcase and 120k monthly creators.'],
        },
        {
          id: 'cr-p2',
          name: 'Chroma Typography Engine',
          techStack: 'React, Canvas 2D, GLSL',
          description: 'Kinetic variable font playground for editorial motion teams.',
          highlights: ['Export pipeline supporting 4K lossless video and SVG paths.'],
        },
      ],
      skillCategories: [
        { id: 'cr-s1', name: 'Interactive', skills: ['Three.js', 'WebGL', 'React', 'TypeScript', 'GLSL'] },
        { id: 'cr-s2', name: 'Creative Tools', skills: ['Figma', 'Blender', 'After Effects'] },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  classic: {
    id: 'classic',
    styleLabel: 'Centered Serif',
    defaultColor: '#334155',
    fontFamily: 'Georgia',
    baseFont: 'serif',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Arthur Pendelton',
        title: 'Senior Corporate Counsel',
        email: 'a.pendelton@example.com',
        phone: '+1 (617) 555-0133',
        location: 'Boston, MA',
        linkedin: 'https://linkedin.com/in/arthurpendelton',
      },
      summary:
        'Seasoned corporate and technology transactions attorney with 11 years advising public SaaS enterprises on commercial contracting, IP licensing, and global privacy compliance.',
      experience: [
        {
          id: 'cl-1',
          role: 'Senior Corporate Counsel',
          company: 'Beacon Software Holdings',
          location: 'Boston, MA',
          startDate: '2019',
          endDate: 'Present',
          current: true,
          highlights: [
            'Negotiated $220M+ in enterprise SaaS master service agreements and strategic alliances.',
            'Led GDPR & CCPA compliance transformation across 12 international subsidiaries.',
          ],
        },
        {
          id: 'cl-2',
          role: 'Associate Attorney',
          company: 'Hale & Winslow LLP',
          location: 'Boston, MA',
          startDate: '2015',
          endDate: '2019',
          current: false,
          highlights: [
            'Advised Series A–C founders on venture financings, IP assignments, and M&A exits.',
          ],
        },
      ],
      education: [
        {
          id: 'cl-e1',
          degree: 'Juris Doctor (J.D.), Cum Laude',
          institution: 'Boston University School of Law',
          location: 'Boston, MA',
          startDate: '2012',
          endDate: '2015',
          current: false,
        },
      ],
      skillCategories: [
        { id: 'cl-s1', name: 'Practice Areas', skills: ['SaaS Licensing', 'M&A Due Diligence', 'Privacy & GDPR', 'Governance'] },
      ],
      projects: [],
      certifications: [
        { id: 'cl-c1', name: 'Massachusetts Bar Admission', issuer: 'Board of Bar Overseers', date: '2015' },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'elegant-serif': {
    id: 'elegant-serif',
    styleLabel: 'Editorial Rules',
    defaultColor: '#9f1239',
    fontFamily: 'Garamond',
    baseFont: 'serif',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Camille Laurent',
        title: 'Editorial & Brand Communications Director',
        email: 'camille@laurenteditorial.com',
        phone: '+1 (212) 555-0175',
        location: 'New York, NY',
        website: 'https://camillelaurent.com',
      },
      summary:
        'Luxury and culture editorial director crafting flagship print publications, brand manifestos, and global campaign narratives for international hospitality and art houses.',
      experience: [
        {
          id: 'es-1',
          role: 'Editorial & Brand Director',
          company: 'Maison Lumière Press',
          location: 'New York, NY',
          startDate: '2020',
          endDate: 'Present',
          current: true,
          highlights: [
            'Directed quarterly print & digital magazine reaching 420,000 international subscribers.',
            'Orchestrated rebranding launch across Paris, Tokyo, and New York flagship galleries.',
          ],
        },
        {
          id: 'es-2',
          role: 'Managing Editor',
          company: 'Atelier Cultural Review',
          location: 'New York, NY',
          startDate: '2016',
          endDate: '2020',
          current: false,
          highlights: [
            'Commissioned essays and monographs from 45+ award-winning international journalists.',
          ],
        },
      ],
      education: [
        {
          id: 'es-e1',
          degree: 'M.A. in Comparative Literature',
          institution: 'Columbia University',
          location: 'New York, NY',
          startDate: '2014',
          endDate: '2016',
          current: false,
        },
      ],
      skillCategories: [
        { id: 'es-s1', name: 'Editorial', skills: ['Brand Narrative', 'Print Direction', 'Copywriting', 'Curation'] },
      ],
      projects: [],
      certifications: [],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'compact-one-page': {
    id: 'compact-one-page',
    styleLabel: 'High-Density 1P',
    defaultColor: '#059669',
    fontFamily: 'Lato',
    baseFont: 'sans',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Devon Patel',
        title: 'Full-Stack & DevOps Team Lead',
        email: 'devon.patel@example.com',
        phone: '+1 (408) 555-0126',
        location: 'San Jose, CA',
        github: 'https://github.com/devonpatel',
        linkedin: 'https://linkedin.com/in/devonpatel',
      },
      summary:
        'Full-stack lead uniting TypeScript frontend velocity with automated AWS cloud delivery for high-throughput developer platforms.',
      experience: [
        {
          id: 'cp-1',
          role: 'Engineering Team Lead',
          company: 'CloudPulse Labs',
          location: 'San Jose, CA',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          highlights: [
            'Scaled React + Node.js telemetry portal to 140k active engineers with 45ms median response.',
            'Cut AWS compute spend by 34% via container rightsizing and spot fleet orchestration.',
          ],
        },
        {
          id: 'cp-2',
          role: 'Full-Stack Developer',
          company: 'Veridian Apps',
          location: 'Palo Alto, CA',
          startDate: '2019',
          endDate: '2022',
          current: false,
          highlights: [
            'Shipped real-time collaboration canvas with WebSockets and optimistic CRDT state.',
          ],
        },
      ],
      skillCategories: [
        { id: 'cp-s1', name: 'Stack', skills: ['TypeScript', 'React', 'Node.js', 'Next.js', 'GraphQL'] },
        { id: 'cp-s2', name: 'Cloud', skills: ['AWS', 'Docker', 'Terraform', 'GitHub Actions', 'Redis'] },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  academic: {
    id: 'academic',
    styleLabel: 'Academic Table',
    defaultColor: '#0369a1',
    fontFamily: 'Source Sans 3',
    baseFont: 'sans',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Dr. Priya Nair',
        title: 'Machine Learning Research Scientist',
        email: 'priya.nair@research.edu',
        phone: '+1 (650) 555-0199',
        location: 'Palo Alto, CA',
        website: 'https://priyanair.ai',
        github: 'https://github.com/priyanair',
      },
      summary:
        'AI Research Scientist publishing in NeurIPS and ICML on efficient multimodal transformers, sparse attention kernels, and verifiable medical imaging diagnostics.',
      experience: [
        {
          id: 'ac-1',
          role: 'Research Scientist',
          company: 'Stanford AI Research Lab',
          location: 'Palo Alto, CA',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          highlights: [
            'Published 6 first-author papers in NeurIPS, ICML, and ICLR with 1,400+ citations.',
            'Developed quantized vision-language architecture reducing inference memory by 58%.',
          ],
        },
      ],
      education: [
        {
          id: 'ac-e1',
          degree: 'Ph.D. in Machine Learning',
          institution: 'Stanford University',
          location: 'Stanford, CA',
          startDate: '2018',
          endDate: '2022',
          current: false,
          gpa: '3.98 / 4.0',
        },
        {
          id: 'ac-e2',
          degree: 'B.Tech in Computer Science',
          institution: 'IIT Madras',
          location: 'Chennai, India',
          startDate: '2014',
          endDate: '2018',
          current: false,
          gpa: '9.4 / 10.0',
        },
      ],
      skillCategories: [
        { id: 'ac-s1', name: 'Research & ML', skills: ['PyTorch', 'JAX', 'CUDA', 'Transformers', 'RLHF'] },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'academic-decl': {
    id: 'academic-decl',
    styleLabel: 'Signed Declaration',
    defaultColor: '#1e40af',
    fontFamily: 'Inter',
    baseFont: 'sans',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Rohan Kulkarni',
        title: 'Software Development Engineer',
        email: 'rohan.kulkarni@example.com',
        phone: '+91 98200 12345',
        location: 'Bengaluru, India',
        linkedin: 'https://linkedin.com/in/rohankulkarni',
        github: 'https://github.com/rohankulkarni',
      },
      summary:
        'Computer Science graduate specializing in cloud-native backend systems, Java Spring Boot microservices, and high-reliability React web interfaces.',
      declaration: {
        enabled: true,
        text: 'I hereby declare that all the details furnished above are true and correct to the best of my knowledge and belief.',
        place: 'Bengaluru, India',
        date: '2026-11-12',
        signatureType: 'draw',
        signatureImage: SIGN_BLUE,
        signerName: 'Rohan Kulkarni',
      },
    },
  },
  'academic-photo-decl': {
    id: 'academic-photo-decl',
    styleLabel: 'Photo + Signature',
    defaultColor: '#0f766e',
    fontFamily: 'Inter',
    baseFont: 'sans',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Ananya Sharma',
        title: 'Data Science & Analytics Fellow',
        email: 'ananya.sharma@example.com',
        phone: '+91 98111 67890',
        location: 'Hyderabad, India',
        linkedin: 'https://linkedin.com/in/ananyasharma',
        photo: AVATAR_ACADEMIC,
      },
      summary:
        'Quantitative analyst and data scientist skilled in predictive risk modeling, SQL data warehousing, and interactive executive BI dashboards.',
      declaration: {
        enabled: true,
        text: 'I hereby declare that all information stated in this curriculum vitae is accurate and complete to the best of my knowledge.',
        place: 'Hyderabad, India',
        date: '2026-11-12',
        signatureType: 'draw',
        signatureImage: SIGN_BLUE,
        signerName: 'Ananya Sharma',
      },
    },
  },
  traditional: {
    id: 'traditional',
    styleLabel: 'Framed Biodata',
    defaultColor: '#1e293b',
    fontFamily: 'Times New Roman',
    baseFont: 'serif',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Siddharth Verma',
        title: 'Senior Enterprise Systems Analyst',
        email: 'siddharth.verma@example.com',
        phone: '+91 99001 44556',
        location: 'Pune, India',
        photo: AVATAR_TRADITIONAL,
        fatherName: 'Rajesh Verma',
        dob: '1995-08-22',
        gender: 'Male',
        maritalStatus: 'Single',
        nationality: 'Indian',
        languages: 'English, Hindi, Marathi',
        permanentAddress: '42 Koregaon Park, Lane 4, Pune 411001',
      },
      summary:
        'Enterprise systems analyst with 7 years leading ERP rollouts, business process automation, and compliance documentation for banking and manufacturing clients.',
      declaration: {
        enabled: true,
        text: 'I solemnly declare that the particulars given above are true and correct to the best of my knowledge and belief.',
        place: 'Pune, India',
        date: '2026-11-12',
        signatureType: 'draw',
        signatureImage: SIGN_SLATE,
        signerName: 'Siddharth Verma',
      },
    },
  },
  'canva-nordic': {
    id: 'canva-nordic',
    styleLabel: 'Canva Nordic',
    defaultColor: '#0f766e',
    fontFamily: 'Lato',
    baseFont: 'modern',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Nora Lindqvist',
        title: 'Brand & Visual Designer',
        email: 'nora.lindqvist@studio.se',
        phone: '+46 70 123 4567',
        location: 'Stockholm, Sweden',
        website: 'https://noralindqvist.se',
        linkedin: 'https://linkedin.com/in/noralindqvist',
        photo: AVATAR_NORDIC,
      },
      summary:
        'Multidisciplinary brand designer crafting calm Nordic digital identities, packaging systems, and clean editorial experiences for modern consumer startups.',
      experience: [
        {
          id: 'cn-1',
          role: 'Senior Brand Designer',
          company: 'Fjord & Form Studio',
          location: 'Stockholm',
          startDate: '2022',
          endDate: 'Present',
          current: true,
          highlights: [
            'Led visual rebrand for 14 direct-to-consumer sustainability brands across Europe.',
            'Built modular Figma brand guidelines cutting campaign turnaround time by 45%.',
          ],
        },
        {
          id: 'cn-2',
          role: 'Visual Designer',
          company: 'Nordic Digital Press',
          location: 'Stockholm',
          startDate: '2019',
          endDate: '2022',
          current: false,
          highlights: [
            'Designed editorial layouts, art direction, and typography for quarterly print issues.',
          ],
        },
      ],
      education: [
        {
          id: 'cn-e1',
          degree: 'B.F.A. in Visual Communication',
          institution: 'Beckmans College of Design',
          location: 'Stockholm',
          startDate: '2016',
          endDate: '2019',
          current: false,
        },
      ],
      skillCategories: [
        { id: 'cn-s1', name: 'Design', skills: ['Brand Identity', 'Typography', 'Art Direction', 'Packaging'] },
        { id: 'cn-s2', name: 'Tools', skills: ['Figma', 'Illustrator', 'InDesign', 'Webflow'] },
      ],
      projects: [],
      certifications: [],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'canva-editorial-split': {
    id: 'canva-editorial-split',
    styleLabel: 'Canva Bold',
    defaultColor: '#e11d48',
    fontFamily: 'Montserrat',
    baseFont: 'modern',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Lucas Rivera',
        title: 'Growth Marketing Director',
        email: 'lucas.rivera@example.com',
        phone: '+1 (646) 555-0192',
        location: 'New York, NY',
        website: 'https://lucasrivera.co',
        linkedin: 'https://linkedin.com/in/lucasrivera',
      },
      summary:
        'Performance-driven growth marketer scaling B2C and SaaS acquisition engines through full-funnel experimentation, lifecycle CRM, and creative campaign attribution.',
      experience: [
        {
          id: 'ces-1',
          role: 'Growth Marketing Director',
          company: 'Pulse Commerce',
          location: 'New York, NY',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          highlights: [
            'Scaled paid & organic user acquisition from 80k to 540k monthly active shoppers.',
            'Lowered blended CAC by 31% through multi-touch attribution and landing page CRO.',
          ],
        },
        {
          id: 'ces-2',
          role: 'Lifecycle Marketing Manager',
          company: 'BrightPath Media',
          location: 'New York, NY',
          startDate: '2018',
          endDate: '2021',
          current: false,
          highlights: [
            'Built automated retention journeys driving +24% 90-day customer LTV.',
          ],
        },
      ],
      education: [
        {
          id: 'ces-e1',
          degree: 'B.S. in Marketing & Analytics',
          institution: 'NYU Stern School of Business',
          location: 'New York, NY',
          startDate: '2014',
          endDate: '2018',
          current: false,
        },
      ],
      skillCategories: [
        { id: 'ces-s1', name: 'Growth', skills: ['Paid Acquisition', 'CRO', 'Lifecycle CRM', 'SEO'] },
        { id: 'ces-s2', name: 'Analytics', skills: ['SQL', 'Amplitude', 'HubSpot', 'Looker'] },
      ],
      projects: [
        {
          id: 'ces-p1',
          name: 'Creator Referral Launch',
          techStack: 'HubSpot, Segment, Custom Attribution',
          description: 'Viral creator ambassador funnel generating 42k new signups in Q1.',
          highlights: ['Achieved 4.8x ROAS within 60 days of global launch.'],
        },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'canva-monogram': {
    id: 'canva-monogram',
    styleLabel: 'Canva Monogram',
    defaultColor: '#4f46e5',
    fontFamily: 'Poppins',
    baseFont: 'modern',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Chloe Bennett',
        title: 'Product Marketing Manager',
        email: 'chloe.bennett@example.com',
        phone: '+1 (415) 555-0144',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/chloebennett',
        website: 'https://chloebennett.io',
      },
      summary:
        'Strategic product marketer translating complex developer capabilities into crisp positioning, enterprise sales enablement, and category-defining product launches.',
      experience: [
        {
          id: 'cm-1',
          role: 'Senior Product Marketing Manager',
          company: 'Strata Cloud',
          location: 'San Francisco, CA',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          highlights: [
            'Orchestrated flagship AI workflow launch reaching 18,000 waitlist enterprises in 10 days.',
            'Built competitive battlecards improving enterprise win rates from 28% to 41%.',
          ],
        },
        {
          id: 'cm-2',
          role: 'Product Marketing Specialist',
          company: 'BeaconHQ',
          location: 'San Francisco, CA',
          startDate: '2018',
          endDate: '2021',
          current: false,
          highlights: [
            'Authored customer case studies and ROI calculators supporting $14M pipeline.',
          ],
        },
      ],
      education: [
        {
          id: 'cm-e1',
          degree: 'B.A. in Economics & Media',
          institution: 'UCLA',
          location: 'Los Angeles, CA',
          startDate: '2014',
          endDate: '2018',
          current: false,
        },
      ],
      skillCategories: [
        { id: 'cm-s1', name: 'Positioning', skills: ['GTM Strategy', 'Messaging', 'Sales Enablement', 'Pricing'] },
        { id: 'cm-s2', name: 'Research', skills: ['Win/Loss Interviews', 'Competitive Intel', 'Storytelling'] },
      ],
      projects: [],
      certifications: [
        { id: 'cm-c1', name: 'Product Marketing Core Certified', issuer: 'PMA', date: '2022' },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'canva-dark-sidebar': {
    id: 'canva-dark-sidebar',
    styleLabel: 'Canva Dark Sidebar',
    defaultColor: '#0f172a',
    fontFamily: 'Inter',
    baseFont: 'modern',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Liam O\'Connor',
        title: 'Cloud Solutions Architect',
        email: 'liam.oconnor@example.com',
        phone: '+1 (512) 555-0177',
        location: 'Austin, TX',
        linkedin: 'https://linkedin.com/in/liamoconnor',
        github: 'https://github.com/liamoconnor',
        photo: AVATAR_CHARCOAL,
      },
      summary:
        'Enterprise cloud architect designing zero-trust multi-cloud landing zones, high-availability Kubernetes platforms, and cost-governed infrastructure.',
      experience: [
        {
          id: 'cds-1',
          role: 'Principal Solutions Architect',
          company: 'Apex Cloud Partners',
          location: 'Austin, TX',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          highlights: [
            'Architected AWS & GCP hybrid platform migrating 120+ legacy workloads with zero downtime.',
            'Established FinOps governance cutting annual cloud infrastructure bill by $1.8M.',
          ],
        },
        {
          id: 'cds-2',
          role: 'Senior Cloud Engineer',
          company: 'Vanguard Systems',
          location: 'Dallas, TX',
          startDate: '2018',
          endDate: '2021',
          current: false,
          highlights: [
            'Built Terraform IaC modules standardized across 35 global engineering squads.',
          ],
        },
      ],
      education: [
        {
          id: 'cds-e1',
          degree: 'M.S. in Computer Engineering',
          institution: 'UT Austin',
          location: 'Austin, TX',
          startDate: '2016',
          endDate: '2018',
          current: false,
        },
      ],
      skillCategories: [
        { id: 'cds-s1', name: 'Cloud & Security', skills: ['AWS', 'GCP', 'Kubernetes', 'Terraform', 'Zero Trust'] },
        { id: 'cds-s2', name: 'Architecture', skills: ['Microservices', 'FinOps', 'Disaster Recovery', 'IAM'] },
      ],
      projects: [],
      certifications: [
        { id: 'cds-c1', name: 'AWS Solutions Architect – Professional', issuer: 'Amazon Web Services', date: '2023' },
      ],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  'canva-ribbon': {
    id: 'canva-ribbon',
    styleLabel: 'Canva Ribbon',
    defaultColor: '#0284c7',
    fontFamily: 'Open Sans',
    baseFont: 'sans',
    sampleData: {
      ...initialResumeData,
      personal: {
        fullName: 'Sofia Morales',
        title: 'Senior UX Researcher',
        email: 'sofia.morales@example.com',
        phone: '+1 (303) 555-0155',
        location: 'Denver, CO',
        website: 'https://sofiamorales.ux',
        linkedin: 'https://linkedin.com/in/sofiamorales',
        photo: AVATAR_RIBBON,
      },
      summary:
        'Human-centered UX researcher turning mixed-methods user insights, diary studies, and usability benchmarks into confident product strategy.',
      experience: [
        {
          id: 'crb-1',
          role: 'Senior UX Researcher',
          company: 'Harbor Health Tech',
          location: 'Denver, CO',
          startDate: '2021',
          endDate: 'Present',
          current: true,
          highlights: [
            'Conducted 180+ patient & clinician contextual inquiries guiding telehealth 2.0 redesign.',
            'Increased patient portal task completion rate from 64% to 93% post-launch.',
          ],
        },
        {
          id: 'crb-2',
          role: 'UX Research Associate',
          company: 'Summit Digital Labs',
          location: 'Boulder, CO',
          startDate: '2018',
          endDate: '2021',
          current: false,
          highlights: [
            'Built centralized Dovetail research repository indexed by 40+ product & design stakeholders.',
          ],
        },
      ],
      education: [
        {
          id: 'crb-e1',
          degree: 'M.S. in Human-Computer Interaction',
          institution: 'University of Colorado Boulder',
          location: 'Boulder, CO',
          startDate: '2016',
          endDate: '2018',
          current: false,
        },
      ],
      skillCategories: [
        { id: 'crb-s1', name: 'Research Methods', skills: ['User Interviews', 'Usability Testing', 'Survey Design', 'Diary Studies'] },
        { id: 'crb-s2', name: 'Tooling', skills: ['Dovetail', 'Maze', 'Figma', 'Qualtrics'] },
      ],
      projects: [],
      certifications: [],
      declaration: { ...initialResumeData.declaration!, enabled: false },
    },
  },
  ...EXTRA_CANVA_SHOWCASE_CONFIGS,
};

export function getSampleSettingsForTemplate(
  templateId: ResumeTemplateId,
  overrideColor?: string
): ResumeSettings {
  const cfg = TEMPLATE_SHOWCASE_CONFIGS[templateId] || TEMPLATE_SHOWCASE_CONFIGS.modern;
  return {
    ...initialResumeSettings,
    template: templateId,
    primaryColor: overrideColor || cfg.defaultColor,
    fontFamily: cfg.baseFont,
    spacing: templateId === 'compact-one-page' ? 'compact' : 'normal',
    typography: {
      ...initialResumeSettings.typography!,
      fontFamily: cfg.fontFamily,
      nameSize: templateId === 'compact-one-page' ? 22 : 25,
      headingSize: templateId === 'compact-one-page' ? 12.5 : 14,
      bodySize: templateId === 'compact-one-page' ? 10 : 11,
    },
    layout: {
      ...initialResumeSettings.layout!,
      pageMargin: templateId === 'compact-one-page' ? 14 : 18,
      sectionGap: templateId === 'compact-one-page' ? 10 : 14,
      lineHeight: templateId === 'compact-one-page' ? 1.32 : 1.42,
      contentDensity: templateId === 'compact-one-page' ? 'compact' : 'normal',
    },
  };
}
