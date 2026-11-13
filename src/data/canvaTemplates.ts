import { ExtraCanvaTemplateId, ResumeData, ResumeTemplateId } from '../types/resume';
import { initialResumeData } from './initialData';

export type TemplateCategory = 'all' | 'canva' | 'modern' | 'ats' | 'executive' | 'academic';

export type CanvaLayoutStructure =
  | 'left-sidebar-colored'
  | 'left-sidebar-tinted'
  | 'right-sidebar-colored'
  | 'right-sidebar-tinted'
  | 'left-label-ledger'
  | 'two-col-body'
  | 'bento-cards'
  | 'timeline-spine'
  | 'editorial-broadsheet'
  | 'education-first-clean'
  | 'edge-stripe-single'
  | 'classic-single-clean';

export type CanvaHeaderVariant =
  | 'swiss-index'
  | 'warm-card'
  | 'obsidian-band'
  | 'framed-nameplate'
  | 'split-dual-band'
  | 'minimal-giant'
  | 'overlapping-portrait'
  | 'highlighter-bar'
  | 'editorial-masthead'
  | 'navy-crest'
  | 'sidebar-integrated';

export type CanvaSectionStyle =
  | 'numbered'
  | 'highlighter'
  | 'left-tick'
  | 'pill-tag'
  | 'double-rule'
  | 'code-comment'
  | 'diamond'
  | 'underline-bold';

export type CanvaSkillStyle =
  | 'tinted-chips'
  | 'outlined-tags'
  | 'inline-bars'
  | 'compact-grid';

export interface CanvaLayoutRecipe {
  layoutStructure: CanvaLayoutStructure;
  headerVariant: CanvaHeaderVariant;
  sectionStyle: CanvaSectionStyle;
  skillStyle: CanvaSkillStyle;
  showPhoto?: boolean;
  showMonogram?: boolean;
  darkSurfaceHex?: string;
}

export interface ExtraCanvaTemplateEntry {
  id: ExtraCanvaTemplateId;
  name: string;
  shortName: string;
  desc: string;
  badge: string;
  styleLabel: string;
  defaultColor: string;
  fontFamily: string;
  baseFont: 'sans' | 'serif' | 'modern';
  categories: TemplateCategory[];
  recipe: CanvaLayoutRecipe;
  sampleData: ResumeData;
}

// Hermetic inline SVG portraits & signatures (zero external URLs)
const svgPortrait = (bg: string, coat: string, skin: string, hair: string, hairStyle: 'short' | 'long' | 'bob' = 'short') =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140"><rect width="120" height="140" fill="${bg}"/>${
      hairStyle === 'long'
        ? `<ellipse cx="60" cy="64" rx="29" ry="38" fill="${hair}"/>`
        : hairStyle === 'bob'
        ? `<path d="M32 58c0-20 12-34 28-34s28 14 28 34v22H32V58z" fill="${hair}"/>`
        : ''
    }<path d="M18 140c0-26 19-42 42-42s42 16 42 42H18z" fill="${coat}"/><path d="M48 90h24v18H48z" fill="${skin}"/><circle cx="60" cy="56" r="24" fill="${skin}"/><path d="M36 52c0-17 11-28 24-28s24 11 24 28c-4-10-12-14-24-14s-20 4-24 14z" fill="${hair}"/></svg>`
  )}`;

const svgSig = (ink: string, pathD: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60"><path d="${pathD}" fill="none" stroke="${ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  )}`;

const baseDecl = {
  ...initialResumeData.declaration!,
  enabled: false,
};

const makeSample = (opts: {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  photo?: string;
  summary: string;
  exp: { role: string; company: string; loc: string; start: string; end: string; current?: boolean; bullets: string[] }[];
  edu: { degree: string; inst: string; loc: string; start: string; end: string; gpa?: string }[];
  skills: { name: string; items: string[] }[];
  projects?: { name: string; tech: string; desc: string; hl?: string[] }[];
  certs?: { name: string; issuer: string; date: string }[];
  declEnabled?: boolean;
  declSig?: string;
}): ResumeData => ({
  personal: {
    fullName: opts.fullName,
    title: opts.title,
    email: opts.email,
    phone: opts.phone,
    location: opts.location,
    website: opts.website,
    linkedin: opts.linkedin,
    github: opts.github,
    photo: opts.photo,
  },
  summary: opts.summary,
  experience: opts.exp.map((e, i) => ({
    id: `cx-${i}`,
    role: e.role,
    company: e.company,
    location: e.loc,
    startDate: e.start,
    endDate: e.end,
    current: Boolean(e.current),
    highlights: e.bullets,
  })),
  education: opts.edu.map((ed, i) => ({
    id: `ce-${i}`,
    degree: ed.degree,
    institution: ed.inst,
    location: ed.loc,
    startDate: ed.start,
    endDate: ed.end,
    current: false,
    gpa: ed.gpa,
  })),
  skillCategories: opts.skills.map((s, i) => ({
    id: `cs-${i}`,
    name: s.name,
    skills: s.items,
  })),
  projects: (opts.projects || []).map((p, i) => ({
    id: `cp-${i}`,
    name: p.name,
    techStack: p.tech,
    description: p.desc,
    highlights: p.hl || [],
  })),
  certifications: (opts.certs || []).map((c, i) => ({
    id: `cc-${i}`,
    name: c.name,
    issuer: c.issuer,
    date: c.date,
  })),
  customSections: [],
  declaration: opts.declEnabled
    ? {
        enabled: true,
        text: 'I hereby affirm that all credentials, milestones, and experience documented above are accurate to the best of my knowledge.',
        place: opts.location,
        date: '2026-11-12',
        signatureType: 'draw',
        signatureImage: opts.declSig || svgSig('#1e293b', 'M16 42 C28 14, 40 16, 48 38 C56 26, 70 22, 82 36 C100 28, 128 32, 168 30'),
        signerName: opts.fullName,
      }
    : baseDecl,
});

export const EXTRA_CANVA_TEMPLATES: ExtraCanvaTemplateEntry[] = [
  // =========================================================================
  // GROUP A: ARCHITECTURAL & SPLIT CARDS (1-5)
  // =========================================================================
  {
    id: 'canva-swiss-grid',
    name: 'Canva Swiss Grid',
    shortName: 'Swiss Grid',
    desc: 'Canva architectural grid with indexed section numbers, bold red accents & two-column balance',
    badge: 'Canva Style',
    styleLabel: 'Swiss Grid',
    defaultColor: '#dc2626',
    fontFamily: 'Montserrat',
    baseFont: 'modern',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'two-col-body',
      headerVariant: 'swiss-index',
      sectionStyle: 'numbered',
      skillStyle: 'outlined-tags',
    },
    sampleData: makeSample({
      fullName: 'Jonas Keller',
      title: 'Principal Urban Architect',
      email: 'jonas.keller@atelier-ch.example',
      phone: '+41 44 555 0192',
      location: 'Zurich, Switzerland',
      website: 'https://kellerarch.ch',
      summary: 'Architect with 11 years designing transit-oriented civic spaces, timber high-rises, and net-zero urban masterplans across DACH.',
      exp: [
        {
          role: 'Principal Urban Architect',
          company: 'Helvetia Urban Lab',
          loc: 'Zurich',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Directed 4.2M CHF mixed-use timber district delivering 38% embodied-carbon reduction.',
            'Won 2024 European Civic Architecture Award for Rhine waterfront adaptive reuse.',
          ],
        },
        {
          role: 'Senior Project Architect',
          company: 'Baukunst Partners',
          loc: 'Basel',
          start: '2017',
          end: '2021',
          bullets: ['Managed BIM delivery across 18-person studio for Swiss Federal Rail station hub.'],
        },
      ],
      edu: [{ degree: 'M.Sc. in Architecture', inst: 'ETH Zurich', loc: 'Zurich', start: '2013', end: '2016', gpa: '5.7 / 6.0' }],
      skills: [
        { name: 'Architecture', items: ['Urban Masterplanning', 'Mass Timber', 'BIM / Revit', 'Rhino 3D'] },
        { name: 'Compliance', items: ['SIA Standards', 'LEED Platinum', 'Minergie-P'] },
      ],
      projects: [{ name: 'Limmat Solar Canopy', tech: 'Parametric Rhino, Grasshopper', desc: 'Kinetic photovoltaic civic pavilion powering local tram stops.' }],
    }),
  },
  {
    id: 'canva-terracotta-warm',
    name: 'Canva Warm Terracotta',
    shortName: 'Terracotta',
    desc: 'Canva-inspired warm earth-toned pastel header card with editorial typography & portrait',
    badge: 'Canva Style',
    styleLabel: 'Warm Earth',
    defaultColor: '#c2410c',
    fontFamily: 'Georgia',
    baseFont: 'serif',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'classic-single-clean',
      headerVariant: 'warm-card',
      sectionStyle: 'highlighter',
      skillStyle: 'tinted-chips',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Clara Mendoza',
      title: 'Interior Architecture Lead',
      email: 'clara@terrastudio.example',
      phone: '+1 (512) 555-0134',
      location: 'Austin, TX',
      website: 'https://claramendoza.studio',
      photo: svgPortrait('#ffedd5', '#9a3412', '#d9a47e', '#29170f', 'long'),
      summary: 'Hospitality and residential interior architect blending artisanal regional materials, biophilic daylighting, and tactile acoustic planning.',
      exp: [
        {
          role: 'Lead Interior Architect',
          company: 'Solstice Hospitality Design',
          loc: 'Austin, TX',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Designed 9 boutique hotels across the American Southwest totaling 640+ keys.',
            'Sourced zero-VOC limestone and reclaimed white oak supply chains cutting millwork costs 16%.',
          ],
        },
        {
          role: 'Interior Designer',
          company: 'Barton Creek Atelier',
          loc: 'Austin, TX',
          start: '2018',
          end: '2021',
          bullets: ['Produced custom FF&E specifications and AutoCAD construction sets for 22 luxury residences.'],
        },
      ],
      edu: [{ degree: 'B.Arch in Interior Design', inst: 'UT Austin', loc: 'Austin, TX', start: '2014', end: '2018' }],
      skills: [
        { name: 'Spatial', items: ['AutoCAD', 'SketchUp Pro', 'FF&E Procurement', 'Enscape 3D'] },
        { name: 'Craft', items: ['Acoustic Modeling', 'Lighting Design', 'Millwork Detailing'] },
      ],
    }),
  },
  {
    id: 'canva-midnight-gold',
    name: 'Canva Obsidian Gold',
    shortName: 'Obsidian Gold',
    desc: 'Canva luxury dark obsidian hero banner paired with antique gold accents for senior leaders',
    badge: 'Canva Style',
    styleLabel: 'Luxury Gold',
    defaultColor: '#b45309',
    fontFamily: 'Georgia',
    baseFont: 'serif',
    categories: ['all', 'canva', 'executive'],
    recipe: {
      layoutStructure: 'two-col-body',
      headerVariant: 'obsidian-band',
      sectionStyle: 'underline-bold',
      skillStyle: 'inline-bars',
      darkSurfaceHex: '#0f172a',
    },
    sampleData: makeSample({
      fullName: 'Alastair Finch',
      title: 'Managing Director, Private Wealth',
      email: 'a.finch@mayfaircapital.example',
      phone: '+44 20 7946 0821',
      location: 'London, UK',
      linkedin: 'https://linkedin.com/in/alastairfinch',
      summary: 'Private wealth managing director advising family offices across $2.4B AUM on cross-border tax structuring, ESG fixed income, and succession.',
      exp: [
        {
          role: 'Managing Director, Private Wealth',
          company: 'Mayfair Fiduciary Group',
          loc: 'London',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Expanded ultra-high-net-worth book from £900M to £1.9B with 98% client retention.',
            'Chaired EMEA Investment Committee overseeing multi-asset fiduciary mandates.',
          ],
        },
        {
          role: 'Executive Director',
          company: 'Thames Private Bank',
          loc: 'London',
          start: '2015',
          end: '2020',
          bullets: ['Structured bespoke sovereign & private credit portfolios for 45 European foundations.'],
        },
      ],
      edu: [{ degree: 'M.Sc. in Finance & Economics', inst: 'London School of Economics', loc: 'London', start: '2011', end: '2012' }],
      skills: [
        { name: 'Advisory', items: ['Portfolio Strategy', 'Trust & Estate', 'Private Credit', 'FX Hedging'] },
      ],
      certs: [{ name: 'Chartered Wealth Manager (CISI)', issuer: 'CISI London', date: '2016' }],
    }),
  },
  {
    id: 'canva-coral-creative',
    name: 'Canva Coral Frame',
    shortName: 'Coral Frame',
    desc: 'Canva vibrant coral left-edge frame with circular portrait & modern creative skill matrix',
    badge: 'Canva Style',
    styleLabel: 'Coral Studio',
    defaultColor: '#e11d48',
    fontFamily: 'Poppins',
    baseFont: 'modern',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'edge-stripe-single',
      headerVariant: 'warm-card',
      sectionStyle: 'pill-tag',
      skillStyle: 'tinted-chips',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Zoe Martinez',
      title: 'Social Media & Brand Producer',
      email: 'zoe.martinez@studio.example',
      phone: '+1 (323) 555-0188',
      location: 'Los Angeles, CA',
      website: 'https://zoemartinez.tv',
      photo: svgPortrait('#ffe4e6', '#be123c', '#e6b898', '#1c1411', 'bob'),
      summary: 'Creative producer turning cultural moments into multi-platform short-form video franchises generating 45M+ organic views.',
      exp: [
        {
          role: 'Senior Brand & Social Producer',
          company: 'Sunburst Entertainment',
          loc: 'Los Angeles, CA',
          start: '2022',
          end: 'Present',
          current: true,
          bullets: [
            'Produced 60+ creator-led launch campaigns driving +210% YoY TikTok & Reels engagement.',
            'Directed cross-functional shoot crews, talent contracts, and $1.1M annual production budget.',
          ],
        },
      ],
      edu: [{ degree: 'B.A. in Film & Digital Media', inst: 'USC School of Cinematic Arts', loc: 'Los Angeles, CA', start: '2016', end: '2020' }],
      skills: [
        { name: 'Production', items: ['Creative Direction', 'Premiere Pro', 'Talent Booking', 'Short-Form Video'] },
        { name: 'Growth', items: ['Creator Partnerships', 'Brand Voice', 'Sprout Social'] },
      ],
      projects: [{ name: '24H Street Style Docuseries', tech: 'Directing, 4K Editing, Paid Social', desc: '6-episode branded miniseries trending #3 in US lifestyle category.' }],
    }),
  },
  {
    id: 'canva-botanical-sage',
    name: 'Canva Botanical Sage',
    shortName: 'Botanical',
    desc: 'Canva calm botanical green pastel header & natural airy two-column sustainability aesthetic',
    badge: 'Canva Style',
    styleLabel: 'Botanical',
    defaultColor: '#15803d',
    fontFamily: 'Georgia',
    baseFont: 'serif',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'two-col-body',
      headerVariant: 'editorial-masthead',
      sectionStyle: 'left-tick',
      skillStyle: 'tinted-chips',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Hannah Green',
      title: 'ESG & Sustainability Director',
      email: 'hannah.green@ecoimpact.example',
      phone: '+1 (503) 555-0142',
      location: 'Portland, OR',
      linkedin: 'https://linkedin.com/in/hannahgreenesg',
      photo: svgPortrait('#dcfce7', '#166534', '#f2cbb0', '#713f12', 'long'),
      summary: 'Sustainability strategist guiding Fortune 500 apparel & food supply chains through SBTi decarbonization targets and CSRD audits.',
      exp: [
        {
          role: 'Director of ESG Strategy',
          company: 'Cascadia Timber & Goods',
          loc: 'Portland, OR',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Secured Scope 1-3 SBTi net-zero validation across 140 global supplier mills.',
            'Published audited CSRD sustainability report reducing packaging plastics by 620 tons/year.',
          ],
        },
      ],
      edu: [{ degree: 'M.E.M. Environmental Management', inst: 'Yale School of the Environment', loc: 'New Haven, CT', start: '2016', end: '2018' }],
      skills: [
        { name: 'ESG Core', items: ['Scope 3 Accounting', 'CSRD / GRI', 'Circular Packaging', 'LCA Modeling'] },
      ],
      certs: [{ name: 'GRI Certified Sustainability Professional', issuer: 'Global Reporting Initiative', date: '2022' }],
    }),
  },

  // =========================================================================
  // GROUP B: DUAL-TONE & COLORED SIDEBARS (6-11)
  // =========================================================================
  {
    id: 'canva-cobalt-sidebar',
    name: 'Canva Cobalt Rail',
    shortName: 'Cobalt Rail',
    desc: 'Canva saturated cobalt blue left sidebar with crisp white portrait ring & structured right body',
    badge: 'Canva Style',
    styleLabel: 'Cobalt Rail',
    defaultColor: '#1d4ed8',
    fontFamily: 'Inter',
    baseFont: 'sans',
    categories: ['all', 'canva', 'executive', 'modern'],
    recipe: {
      layoutStructure: 'left-sidebar-colored',
      headerVariant: 'sidebar-integrated',
      sectionStyle: 'underline-bold',
      skillStyle: 'outlined-tags',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Jordan Hayes',
      title: 'Enterprise Account Executive',
      email: 'jordan.hayes@saascloud.example',
      phone: '+1 (312) 555-0163',
      location: 'Chicago, IL',
      linkedin: 'https://linkedin.com/in/jordanhayes',
      photo: svgPortrait('#dbeafe', '#1e3a8a', '#dca884', '#18181b', 'short'),
      summary: 'Top-decile enterprise SaaS closer averaging 142% annual quota attainment selling seven-figure data cloud contracts to healthcare systems.',
      exp: [
        {
          role: 'Senior Enterprise Account Executive',
          company: 'Meridian Data Cloud',
          loc: 'Chicago, IL',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Closed $14.8M new ARR across 11 Fortune 500 health networks (158% of FY24 quota).',
            'Named #1 Enterprise Rep globally (President’s Club 2022, 2023, 2024).',
          ],
        },
        {
          role: 'Mid-Market Account Executive',
          company: 'SignalFlow CRM',
          loc: 'Chicago, IL',
          start: '2018',
          end: '2021',
          bullets: ['Expanded regional pipeline by $4.2M through C-level executive briefings and MEDDPICC discipline.'],
        },
      ],
      edu: [{ degree: 'B.S. in Business Administration', inst: 'University of Illinois', loc: 'Urbana, IL', start: '2014', end: '2018' }],
      skills: [
        { name: 'Sales Craft', items: ['MEDDPICC', 'C-Suite Negotiation', 'Multi-Year MSA', 'Forecasting'] },
        { name: 'Stack', items: ['Salesforce', 'Gong', 'Clari'] },
      ],
    }),
  },
  {
    id: 'canva-plum-sidebar',
    name: 'Canva Plum Studio',
    shortName: 'Plum Studio',
    desc: 'Canva rich plum left column with modern geometric monogram badge & editorial experience layout',
    badge: 'Canva Style',
    styleLabel: 'Plum Studio',
    defaultColor: '#6b21a8',
    fontFamily: 'Poppins',
    baseFont: 'modern',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'left-sidebar-colored',
      headerVariant: 'sidebar-integrated',
      sectionStyle: 'left-tick',
      skillStyle: 'tinted-chips',
      showMonogram: true,
    },
    sampleData: makeSample({
      fullName: 'Amara Okafor',
      title: 'Lead UX Copywriter & Strategist',
      email: 'amara.okafor@wordcraft.example',
      phone: '+1 (416) 555-0185',
      location: 'Toronto, ON',
      website: 'https://amaraokafor.com',
      summary: 'Content designer and UX strategist turning intricate fintech and AI interfaces into effortless human-centered microcopy.',
      exp: [
        {
          role: 'Lead UX Content Strategist',
          company: 'NorthBridge Pay',
          loc: 'Toronto',
          start: '2022',
          end: 'Present',
          current: true,
          bullets: [
            'Authored product terminology standard across 120 screens reducing support tickets by 29%.',
            'Co-led checkout clarity overhaul lifting international merchant completion rates by 14%.',
          ],
        },
      ],
      edu: [{ degree: 'B.A. in Rhetoric & Digital Media', inst: 'University of Toronto', loc: 'Toronto', start: '2015', end: '2019' }],
      skills: [
        { name: 'Content UX', items: ['Microcopy', 'Voice & Tone', 'Localization', 'Information Arch'] },
      ],
      projects: [{ name: 'Fintech Inclusive Writing Guide', tech: 'Notion, Figma Strings', desc: 'Company-wide plain-language handbook adopted by 90+ designers.' }],
    }),
  },
  {
    id: 'canva-slate-rightbar',
    name: 'Canva Right-Rail Indigo',
    shortName: 'Right-Rail Indigo',
    desc: 'Inverted Canva right-hand indigo-tinted sidebar putting work experience front and center on the left',
    badge: 'Canva Style',
    styleLabel: 'Right Sidebar',
    defaultColor: '#4338ca',
    fontFamily: 'Inter',
    baseFont: 'sans',
    categories: ['all', 'canva', 'modern', 'ats'],
    recipe: {
      layoutStructure: 'right-sidebar-tinted',
      headerVariant: 'highlighter-bar',
      sectionStyle: 'left-tick',
      skillStyle: 'outlined-tags',
    },
    sampleData: makeSample({
      fullName: 'Daniel Park',
      title: 'Principal Cybersecurity Analyst',
      email: 'daniel.park@sentinel.example',
      phone: '+1 (202) 555-0147',
      location: 'Washington, D.C.',
      linkedin: 'https://linkedin.com/in/danielparksec',
      summary: 'Incident response and cloud security architect protecting federal & fintech workloads with SOC2, zero-trust IAM, and threat hunting.',
      exp: [
        {
          role: 'Principal Threat Detection Architect',
          company: 'Aegis Cyber Defense',
          loc: 'Washington, D.C.',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Reduced mean-time-to-contain (MTTC) security incidents from 4.5 hours to 19 minutes.',
            'Built automated SIEM/SOAR detection rules covering 45,000 production cloud endpoints.',
          ],
        },
        {
          role: 'Senior SOC Engineer',
          company: 'Potomac Financial Systems',
          loc: 'Arlington, VA',
          start: '2018',
          end: '2021',
          bullets: ['Passed zero-finding FedRAMP & PCI-DSS audits across 3 consecutive years.'],
        },
      ],
      edu: [{ degree: 'M.S. in Information Security', inst: 'Johns Hopkins University', loc: 'Baltimore, MD', start: '2016', end: '2018' }],
      skills: [
        { name: 'Defense', items: ['Threat Hunting', 'Zero Trust IAM', 'SOC2 / FedRAMP', 'Incident Response'] },
        { name: 'Tools', items: ['Splunk', 'CrowdStrike', 'AWS Security Hub', 'Python'] },
      ],
      certs: [{ name: 'CISSP & GIAC GCIH', issuer: 'ISC2 / SANS', date: '2021' }],
    }),
  },
  {
    id: 'canva-forest-rightbar',
    name: 'Canva Pine Right-Column',
    shortName: 'Pine Right-Rail',
    desc: 'Canva dark evergreen right-hand column contrasting bright left career history narrative',
    badge: 'Canva Style',
    styleLabel: 'Dark Right Rail',
    defaultColor: '#065f46',
    fontFamily: 'Lato',
    baseFont: 'sans',
    categories: ['all', 'canva', 'executive'],
    recipe: {
      layoutStructure: 'right-sidebar-colored',
      headerVariant: 'sidebar-integrated',
      sectionStyle: 'underline-bold',
      skillStyle: 'tinted-chips',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Rachel Novak',
      title: 'Director of Supply Chain Ops',
      email: 'rachel.novak@freightgrid.example',
      phone: '+1 (206) 555-0118',
      location: 'Seattle, WA',
      linkedin: 'https://linkedin.com/in/rachelnovak',
      photo: svgPortrait('#d1fae5', '#064e3b', '#f2cbb0', '#451a03', 'bob'),
      summary: 'Operations leader optimizing global cold-chain logistics, port customs velocity, and demand forecasting across $400M annual inventory.',
      exp: [
        {
          role: 'Director of Global Supply Chain',
          company: 'Pacific Goods Co.',
          loc: 'Seattle, WA',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Lowered ocean & air freight spend by $11.4M annually via regional carrier diversification.',
            'Maintained 99.2% on-time-in-full (OTIF) retail fulfillment across 18 North American DCs.',
          ],
        },
      ],
      edu: [{ degree: 'M.S. in Supply Chain Management', inst: 'University of Washington', loc: 'Seattle, WA', start: '2014', end: '2016' }],
      skills: [
        { name: 'Logistics', items: ['S&OP Planning', '3PL Negotiation', 'ERP / SAP IBP', 'Six Sigma Black Belt'] },
      ],
    }),
  },
  {
    id: 'canva-sand-sidebar',
    name: 'Canva Mocha & Sand',
    shortName: 'Mocha & Sand',
    desc: 'Canva warm stone-sand tinted sidebar with espresso ink accents and clean hospitality elegance',
    badge: 'Canva Style',
    styleLabel: 'Mocha Sand',
    defaultColor: '#78350f',
    fontFamily: 'Lato',
    baseFont: 'sans',
    categories: ['all', 'canva', 'executive'],
    recipe: {
      layoutStructure: 'left-sidebar-tinted',
      headerVariant: 'sidebar-integrated',
      sectionStyle: 'double-rule',
      skillStyle: 'inline-bars',
      showMonogram: true,
    },
    sampleData: makeSample({
      fullName: 'Mateo Rossi',
      title: 'Hospitality & Resort GM',
      email: 'mateo.rossi@costahotels.example',
      phone: '+1 (619) 555-0174',
      location: 'San Diego, CA',
      linkedin: 'https://linkedin.com/in/mateorossi',
      summary: 'Five-star resort general manager elevating RevPAR, culinary F&B margins, and Forbes Five-Star guest satisfaction scores.',
      exp: [
        {
          role: 'Hotel General Manager',
          company: 'Solana Coastal Resort',
          loc: 'San Diego, CA',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Increased RevPAR by 28% and F&B profitability by $3.1M over 36 months.',
            'Managed 320-person hospitality workforce while achieving #1 TripAdvisor coastal ranking.',
          ],
        },
      ],
      edu: [{ degree: 'B.S. in Hospitality Management', inst: 'Cornell University', loc: 'Ithaca, NY', start: '2011', end: '2015' }],
      skills: [
        { name: 'Hospitality', items: ['P&L Stewardship', 'Revenue Mgmt', 'Forbes 5-Star', 'F&B Operations'] },
      ],
    }),
  },
  {
    id: 'canva-teal-wave',
    name: 'Canva Aqua Split',
    shortName: 'Aqua Split',
    desc: 'Canva crisp cyan-tinted left rail paired with medical/clinical clarity & clean credentials',
    badge: 'Canva Style',
    styleLabel: 'Aqua Medical',
    defaultColor: '#0891b2',
    fontFamily: 'Open Sans',
    baseFont: 'sans',
    categories: ['all', 'canva', 'academic'],
    recipe: {
      layoutStructure: 'left-sidebar-tinted',
      headerVariant: 'warm-card',
      sectionStyle: 'pill-tag',
      skillStyle: 'outlined-tags',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Dr. Nina Patel',
      title: 'Lead Clinical Nurse Practitioner',
      email: 'nina.patel@beaconcare.example',
      phone: '+1 (617) 555-0129',
      location: 'Boston, MA',
      photo: svgPortrait('#cffafe', '#0e7490', '#d8a27c', '#18181b', 'long'),
      summary: 'Board-certified Family Nurse Practitioner with 9 years leading outpatient cardiology triage, EHR quality protocols, and patient education.',
      exp: [
        {
          role: 'Lead Nurse Practitioner',
          company: 'Harborview Cardiology Associates',
          loc: 'Boston, MA',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Managed panel of 1,400+ chronic cardiac patients lowering 30-day readmissions by 22%.',
            'Mentored 12 NP fellows on Epic EHR telehealth triage protocols.',
          ],
        },
      ],
      edu: [{ degree: 'D.N.P. Doctor of Nursing Practice', inst: 'Johns Hopkins University', loc: 'Baltimore, MD', start: '2016', end: '2019' }],
      skills: [
        { name: 'Clinical', items: ['Cardiology Care', 'Epic EHR', 'Patient Triage', 'HIPAA Compliance'] },
      ],
      certs: [{ name: 'AANP Family Nurse Practitioner (FNP-C)', issuer: 'AANP', date: '2019' }],
    }),
  },

  // =========================================================================
  // GROUP C: BOLD TYPOGRAPHY, NEWSPAPER & EDITORIAL (12-17)
  // =========================================================================
  {
    id: 'canva-broadsheet',
    name: 'Canva Broadsheet Press',
    shortName: 'Broadsheet',
    desc: 'Canva editorial magazine masthead with double rules & two-column newspaper body',
    badge: 'Canva Style',
    styleLabel: 'Broadsheet',
    defaultColor: '#1e293b',
    fontFamily: 'Georgia',
    baseFont: 'serif',
    categories: ['all', 'canva', 'executive'],
    recipe: {
      layoutStructure: 'editorial-broadsheet',
      headerVariant: 'editorial-masthead',
      sectionStyle: 'double-rule',
      skillStyle: 'inline-bars',
    },
    sampleData: makeSample({
      fullName: 'Evelyn Shaw',
      title: 'Senior Investigative Journalist',
      email: 'evelyn.shaw@atlanticpress.example',
      phone: '+1 (212) 555-0154',
      location: 'New York, NY',
      website: 'https://evelynshaw.press',
      summary: 'Pulitzer-finalist business & technology reporter covering semiconductor supply chains, antitrust litigation, and venture finance.',
      exp: [
        {
          role: 'Senior Technology Correspondent',
          company: 'Metropolitan Ledger',
          loc: 'New York, NY',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Published 90+ long-form investigations generating 18M digital reads and 3 Loeb Award nominations.',
            'Co-hosted flagship weekly finance podcast averaging 280k listeners per episode.',
          ],
        },
      ],
      edu: [{ degree: 'M.S. in Journalism', inst: 'Columbia Journalism School', loc: 'New York, NY', start: '2014', end: '2015' }],
      skills: [
        { name: 'Reporting', items: ['FOIA Investigations', 'SEC Filing Analysis', 'Audio Production', 'AP Style'] },
      ],
    }),
  },
  {
    id: 'canva-minimal-type',
    name: 'Canva Typeface Minimal',
    shortName: 'Type Minimal',
    desc: 'Ultra-clean Canva typographic canvas with oversized light display name, generous space & dot separators',
    badge: 'Canva Style',
    styleLabel: 'Pure Type',
    defaultColor: '#18181b',
    fontFamily: 'Inter',
    baseFont: 'sans',
    categories: ['all', 'canva', 'ats'],
    recipe: {
      layoutStructure: 'classic-single-clean',
      headerVariant: 'minimal-giant',
      sectionStyle: 'underline-bold',
      skillStyle: 'inline-bars',
    },
    sampleData: makeSample({
      fullName: 'Kai Nakamura',
      title: 'Principal Industrial Designer',
      email: 'kai@nakamuradesign.example',
      phone: '+1 (415) 555-0190',
      location: 'San Francisco, CA',
      website: 'https://kainakamura.io',
      summary: 'Hardware & industrial designer behind 4 Red Dot award-winning consumer audio and wearable computing devices manufactured at multi-million scale.',
      exp: [
        {
          role: 'Principal Industrial Designer',
          company: 'MonoForm Hardware',
          loc: 'San Francisco, CA',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Led CMF, ergonomics, and DFM tooling for flagship ANC headphones shipping 1.4M units.',
            'Directed Shenzhen prototyping sprints balancing recycled aluminum finishes with drop-test specs.',
          ],
        },
      ],
      edu: [{ degree: 'B.S. in Product Design', inst: 'ArtCenter College of Design', loc: 'Pasadena, CA', start: '2014', end: '2018' }],
      skills: [
        { name: 'Hardware', items: ['SolidWorks', 'KeyShot', 'CMF Engineering', 'CNC / Injection Molding'] },
      ],
    }),
  },
  {
    id: 'canva-vermilion-line',
    name: 'Canva Vermilion Ledger',
    shortName: 'Vermilion Ledger',
    desc: 'Canva architectural left-label ledger aligning section headers in a crisp 22% rail opposite experience',
    badge: 'Canva Style',
    styleLabel: 'Label Rail',
    defaultColor: '#ea580c',
    fontFamily: 'Source Sans 3',
    baseFont: 'sans',
    categories: ['all', 'canva', 'modern', 'ats'],
    recipe: {
      layoutStructure: 'left-label-ledger',
      headerVariant: 'highlighter-bar',
      sectionStyle: 'left-tick',
      skillStyle: 'outlined-tags',
    },
    sampleData: makeSample({
      fullName: 'Owen Gallagher',
      title: 'Venture Capital Associate',
      email: 'owen@sequoia-ridge.example',
      phone: '+1 (650) 555-0143',
      location: 'Menlo Park, CA',
      linkedin: 'https://linkedin.com/in/owengallagher',
      summary: 'Early-stage enterprise software & AI investor leading technical diligence across 14 Series A deals totaling $115M deployed.',
      exp: [
        {
          role: 'Senior Investment Associate',
          company: 'Summit Ridge Ventures',
          loc: 'Menlo Park, CA',
          start: '2022',
          end: 'Present',
          current: true,
          bullets: [
            'Sourced and co-led 4 seed/Series A dev-tools investments achieving 2.9x markup in 24 months.',
            'Built automated developer-community traction scoring across GitHub & PyPI telemetry.',
          ],
        },
      ],
      edu: [{ degree: 'B.S. in Computer Science & Econ', inst: 'UC Berkeley', loc: 'Berkeley, CA', start: '2016', end: '2020' }],
      skills: [
        { name: 'Investing', items: ['Cap Table Modeling', 'SaaS Cohort Unit Econ', 'GTM Diligence', 'SQL'] },
      ],
    }),
  },
  {
    id: 'canva-ivory-classic',
    name: 'Canva Ivory Heritage',
    shortName: 'Ivory Heritage',
    desc: 'Refined Canva centered Garamond gallery aesthetic with fine double hairline rules & monogram crest',
    badge: 'Canva Style',
    styleLabel: 'Heritage Serif',
    defaultColor: '#44403c',
    fontFamily: 'Garamond',
    baseFont: 'serif',
    categories: ['all', 'canva', 'executive', 'academic'],
    recipe: {
      layoutStructure: 'classic-single-clean',
      headerVariant: 'framed-nameplate',
      sectionStyle: 'double-rule',
      skillStyle: 'inline-bars',
      showMonogram: true,
    },
    sampleData: makeSample({
      fullName: 'Genevieve Moreau',
      title: 'Museum Curator & Art Historian',
      email: 'g.moreau@galerielumiere.example',
      phone: '+33 1 55 55 01 94',
      location: 'Paris & New York',
      website: 'https://genevievemoreau.org',
      summary: 'Curator specializing in 20th-century European sculpture, international museum loan treaties, and bilingual exhibition catalogues.',
      exp: [
        {
          role: 'Chief Curator of Modern Works',
          company: 'Fondation Beaumont',
          loc: 'Paris',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Curated 7 blockbuster retrospectives attracting 680,000+ international visitors.',
            'Managed €4.5M acquisitions endowment and conservation partnerships across 12 institutions.',
          ],
        },
      ],
      edu: [{ degree: 'Ph.D. in Art History', inst: 'Sorbonne Université', loc: 'Paris', start: '2012', end: '2016' }],
      skills: [
        { name: 'Curatorial', items: ['Provenance Research', 'Catalogue Authorship', 'French / English / Italian'] },
      ],
    }),
  },
  {
    id: 'canva-headline-box',
    name: 'Canva Framed Nameplate',
    shortName: 'Nameplate Box',
    desc: 'Classic Canva boxed nameplate header sitting cleanly across balanced consulting columns',
    badge: 'Canva Style',
    styleLabel: 'Framed Box',
    defaultColor: '#0f172a',
    fontFamily: 'Montserrat',
    baseFont: 'modern',
    categories: ['all', 'canva', 'executive', 'ats'],
    recipe: {
      layoutStructure: 'two-col-body',
      headerVariant: 'framed-nameplate',
      sectionStyle: 'underline-bold',
      skillStyle: 'compact-grid',
    },
    sampleData: makeSample({
      fullName: 'Nathaniel Cole',
      title: 'Strategy Management Consultant',
      email: 'n.cole@bainbridge-advisory.example',
      phone: '+1 (617) 555-0181',
      location: 'Boston, MA',
      linkedin: 'https://linkedin.com/in/nathanielcole',
      summary: 'Management consultant advising Fortune 100 industrials and healthcare payers on post-merger integration, pricing power, and operating turnarounds.',
      exp: [
        {
          role: 'Engagement Manager',
          company: 'Vanguard Strategy Partners',
          loc: 'Boston, MA',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Delivered $85M annualized EBITDA expansion for North American medtech manufacturer.',
            'Led 6-consultant team building zero-based budgeting playbook across 9 global plants.',
          ],
        },
      ],
      edu: [{ degree: 'MBA, General Management', inst: 'Harvard Business School', loc: 'Boston, MA', start: '2019', end: '2021' }],
      skills: [
        { name: 'Consulting', items: ['M&A Synergy', 'Pricing Strategy', 'Zero-Based Budgeting', 'Board Decks'] },
      ],
    }),
  },
  {
    id: 'canva-pastel-lavender',
    name: 'Canva Soft Lavender',
    shortName: 'Soft Lavender',
    desc: 'Canva friendly pastel lavender rounded bento layout crafted for People Ops, HR & coaching roles',
    badge: 'Canva Style',
    styleLabel: 'Lavender Bento',
    defaultColor: '#7c3aed',
    fontFamily: 'Poppins',
    baseFont: 'modern',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'bento-cards',
      headerVariant: 'warm-card',
      sectionStyle: 'pill-tag',
      skillStyle: 'tinted-chips',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Maya Bennett',
      title: 'Director of People Operations',
      email: 'maya.bennett@peoplefirst.example',
      phone: '+1 (303) 555-0162',
      location: 'Denver, CO',
      linkedin: 'https://linkedin.com/in/mayabennett',
      photo: svgPortrait('#ede9fe', '#5b21b6', '#ecc19c', '#29170f', 'bob'),
      summary: 'Strategic HR & People Ops leader scaling distributed engineering organizations from 90 to 650 employees with high eNPS and equitable comp bands.',
      exp: [
        {
          role: 'Director of People Operations',
          company: 'Elev8 Workforce Tech',
          loc: 'Denver, CO',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Launched global pay-transparency framework raising employee retention to 94% YoY.',
            'Automated Workday & Greenhouse onboarding workflows saving 18 HR hours per hire.',
          ],
        },
      ],
      edu: [{ degree: 'M.A. Industrial-Organizational Psych', inst: 'NYU', loc: 'New York, NY', start: '2016', end: '2018' }],
      skills: [
        { name: 'People Ops', items: ['Comp Benchmarking', 'Workday HRIS', 'DEIB Strategy', 'Org Design'] },
      ],
    }),
  },

  // =========================================================================
  // GROUP D: TIMELINE, BENTO & TECH GRIDS (18-24)
  // =========================================================================
  {
    id: 'canva-timeline-dots',
    name: 'Canva Vertical Timeline',
    shortName: 'Timeline Dots',
    desc: 'Canva signature continuous vertical timeline spine with bold royal blue milestone nodes',
    badge: 'Canva Style',
    styleLabel: 'Timeline Spine',
    defaultColor: '#2563eb',
    fontFamily: 'Inter',
    baseFont: 'sans',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'timeline-spine',
      headerVariant: 'split-dual-band',
      sectionStyle: 'diamond',
      skillStyle: 'tinted-chips',
    },
    sampleData: makeSample({
      fullName: 'Carlos Vega',
      title: 'Principal DevOps & SRE Lead',
      email: 'carlos.vega@infra.example',
      phone: '+1 (512) 555-0198',
      location: 'Austin, TX',
      github: 'https://github.com/carlosvega',
      summary: 'Reliability architect building self-healing Kubernetes control planes, eBPF observability stacks, and multi-region failover automation.',
      exp: [
        {
          role: 'Principal SRE Architect',
          company: 'Streamline Compute',
          loc: 'Austin, TX',
          start: '2022',
          end: 'Present',
          current: true,
          bullets: [
            'Achieved 99.998% uptime across 280 EKS nodes serving 4.5B daily API requests.',
            'Built GitOps ArgoCD deployment pipeline cutting release rollbacks by 76%.',
          ],
        },
        {
          role: 'Senior DevOps Engineer',
          company: 'Redwood FinTech',
          loc: 'Austin, TX',
          start: '2019',
          end: '2022',
          bullets: ['Containerized 45 monolith services reducing cloud compute costs by $920k/yr.'],
        },
      ],
      edu: [{ degree: 'B.S. in Computer Engineering', inst: 'Texas A&M University', loc: 'College Station, TX', start: '2014', end: '2018' }],
      skills: [
        { name: 'Platform', items: ['Kubernetes', 'Terraform', 'ArgoCD', 'Go', 'OpenTelemetry', 'AWS'] },
      ],
    }),
  },
  {
    id: 'canva-timeline-mint',
    name: 'Canva Mint Roadmap',
    shortName: 'Mint Roadmap',
    desc: 'Fresh Canva mint green career roadmap timeline combined with research highlights',
    badge: 'Canva Style',
    styleLabel: 'Mint Roadmap',
    defaultColor: '#059669',
    fontFamily: 'Source Sans 3',
    baseFont: 'sans',
    categories: ['all', 'canva', 'academic', 'modern'],
    recipe: {
      layoutStructure: 'timeline-spine',
      headerVariant: 'warm-card',
      sectionStyle: 'left-tick',
      skillStyle: 'outlined-tags',
    },
    sampleData: makeSample({
      fullName: 'Dr. Ethan Brooks',
      title: 'Biotechnology R&D Scientist',
      email: 'ethan.brooks@helixbio.example',
      phone: '+1 (617) 555-0136',
      location: 'Cambridge, MA',
      linkedin: 'https://linkedin.com/in/ethanbrooksphd',
      summary: 'Computational biologist & wet-lab lead advancing mRNA lipid-nanoparticle stability assays and automated CRISPR screening.',
      exp: [
        {
          role: 'Senior R&D Scientist',
          company: 'Helix Therapeutics',
          loc: 'Cambridge, MA',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Co-invented thermostable LNP formulation extending cold-chain shelf life by 4x (2 patents filed).',
            'Automated 384-well assay pipelines via Python & Hamilton robotics saving 14 hrs/week.',
          ],
        },
      ],
      edu: [{ degree: 'Ph.D. in Bioengineering', inst: 'MIT', loc: 'Cambridge, MA', start: '2016', end: '2021' }],
      skills: [
        { name: 'Biotech & Data', items: ['CRISPR-Cas9', 'LNP Formulation', 'Python / R', 'Flow Cytometry'] },
      ],
    }),
  },
  {
    id: 'canva-bento-blocks',
    name: 'Canva Bento Grid',
    shortName: 'Bento Grid',
    desc: 'Modular Canva Bento UI resume layout organizing Summary, Experience, Skills & Education in clean cards',
    badge: 'Canva Style',
    styleLabel: 'Bento Grid',
    defaultColor: '#0284c7',
    fontFamily: 'Poppins',
    baseFont: 'modern',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'bento-cards',
      headerVariant: 'split-dual-band',
      sectionStyle: 'diamond',
      skillStyle: 'tinted-chips',
    },
    sampleData: makeSample({
      fullName: 'Aria Takahashi',
      title: 'Senior AI Product Manager',
      email: 'aria.t@vectormind.example',
      phone: '+1 (415) 555-0121',
      location: 'San Francisco, CA',
      linkedin: 'https://linkedin.com/in/ariatakahashi',
      summary: 'AI Product Manager shipping multimodal copilot workflows, automated evaluation harnesses, and enterprise RAG governance for 2M+ B2B seats.',
      exp: [
        {
          role: 'Senior Product Manager, Applied AI',
          company: 'VectorMind Software',
          loc: 'San Francisco, CA',
          start: '2022',
          end: 'Present',
          current: true,
          bullets: [
            'Launched enterprise RAG knowledge assistant generating $28M expansion ARR in 12 months.',
            'Built automated LLM accuracy eval suite improving citation precision from 78% to 96%.',
          ],
        },
      ],
      edu: [{ degree: 'B.S. in Symbolic Systems', inst: 'Stanford University', loc: 'Stanford, CA', start: '2015', end: '2019' }],
      skills: [
        { name: 'AI Product', items: ['LLM Evals', 'RAG Systems', 'Prompt Ops', 'Enterprise GTM'] },
      ],
      projects: [{ name: 'OpenEval Prompt Harness', tech: 'Python, TypeScript', desc: 'Open regression benchmarking toolkit for enterprise agent workflows.' }],
    }),
  },
  {
    id: 'canva-tech-mono',
    name: 'Canva Dev Terminal',
    shortName: 'Dev Terminal',
    desc: 'Developer-focused Canva template with code-style // SECTION markers & high-density project cards',
    badge: 'Canva Style',
    styleLabel: 'Tech // Grid',
    defaultColor: '#0f766e',
    fontFamily: 'Source Sans 3',
    baseFont: 'sans',
    categories: ['all', 'canva', 'ats', 'modern'],
    recipe: {
      layoutStructure: 'left-label-ledger',
      headerVariant: 'minimal-giant',
      sectionStyle: 'code-comment',
      skillStyle: 'outlined-tags',
    },
    sampleData: makeSample({
      fullName: 'Samir Koury',
      title: 'Staff Systems Security Engineer',
      email: 'samir@kernelguard.example',
      phone: '+1 (206) 555-0158',
      location: 'Seattle, WA',
      github: 'https://github.com/samirkoury',
      summary: 'Low-level systems & Rust security engineer hardening Linux container runtimes, WebAssembly sandboxes, and hardware-attested keystores.',
      exp: [
        {
          role: 'Staff Systems Security Engineer',
          company: 'KernelGuard Cloud',
          loc: 'Seattle, WA',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Rewrote multi-tenant Wasm runtime isolation layer in Rust eliminating memory-safety CVEs.',
            'Cut syscall sandboxing overhead by 41% using custom seccomp-bpf + eBPF monitors.',
          ],
        },
      ],
      edu: [{ degree: 'M.S. in Computer Science', inst: 'Carnegie Mellon University', loc: 'Pittsburgh, PA', start: '2016', end: '2018' }],
      skills: [
        { name: 'Systems', items: ['Rust', 'C / C++', 'Linux Kernel', 'eBPF', 'WebAssembly'] },
      ],
      projects: [{ name: 'Secbox Wasm Sandbox', tech: 'Rust, WASI', desc: 'Zero-copy capability-based microVM isolation engine.' }],
    }),
  },
  {
    id: 'canva-navy-banner',
    name: 'Canva Deep Navy Crest',
    shortName: 'Navy Crest',
    desc: 'Bold Canva full-bleed deep navy banner header with crisp white contact strip & 2-column engineering body',
    badge: 'Canva Style',
    styleLabel: 'Navy Banner',
    defaultColor: '#1e3a8a',
    fontFamily: 'Roboto',
    baseFont: 'sans',
    categories: ['all', 'canva', 'executive'],
    recipe: {
      layoutStructure: 'two-col-body',
      headerVariant: 'navy-crest',
      sectionStyle: 'underline-bold',
      skillStyle: 'compact-grid',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Lt. Col. David Sterling (Ret.)',
      title: 'Principal Aerospace Propulsion Engineer',
      email: 'd.sterling@orbitdynamics.example',
      phone: '+1 (256) 555-0171',
      location: 'Huntsville, AL',
      photo: svgPortrait('#dbeafe', '#1e3a8a', '#ecc19c', '#334155', 'short'),
      summary: 'Aerospace propulsion systems lead with 15 years directing reusable cryogenic turbomachinery testing, FEA structural analysis, and FAA/NASA flight readiness.',
      exp: [
        {
          role: 'Principal Propulsion Lead',
          company: 'Orbit Dynamics Corp',
          loc: 'Huntsville, AL',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Qualified 3D-printed Inconel regeneratively cooled thrust chamber across 42 hot-fire runs.',
            'Led 24-engineer propulsion integration group achieving milestone flight certification ahead of schedule.',
          ],
        },
      ],
      edu: [{ degree: 'M.S. in Aerospace Engineering', inst: 'Georgia Tech', loc: 'Atlanta, GA', start: '2009', end: '2011' }],
      skills: [
        { name: 'Engineering', items: ['ANSYS FEA', 'Cryogenic Systems', 'NX CAD', 'DO-178C Safety'] },
      ],
    }),
  },
  {
    id: 'canva-crimson-edge',
    name: 'Canva Crimson Stripe',
    shortName: 'Crimson Edge',
    desc: 'High-impact Canva single-column resume with a full-height 10px crimson edge bar & diamond headers',
    badge: 'Canva Style',
    styleLabel: 'Crimson Edge',
    defaultColor: '#be123c',
    fontFamily: 'Montserrat',
    baseFont: 'modern',
    categories: ['all', 'canva', 'executive', 'ats'],
    recipe: {
      layoutStructure: 'edge-stripe-single',
      headerVariant: 'minimal-giant',
      sectionStyle: 'diamond',
      skillStyle: 'inline-bars',
    },
    sampleData: makeSample({
      fullName: 'Victoria Zhang',
      title: 'VP, Investment Banking (TMT)',
      email: 'v.zhang@meridianbank.example',
      phone: '+1 (212) 555-0183',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/victoriazhangib',
      summary: 'Technology, Media & Telecom investment banker structuring $6.8B+ in cross-border sell-side M&A mandates and NASDAQ IPO roadshows.',
      exp: [
        {
          role: 'Vice President, TMT Investment Banking',
          company: 'Meridian Global Capital',
          loc: 'New York, NY',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Executed $2.1B enterprise cybersecurity acquisition by Fortune 50 strategic buyer.',
            'Built complex LBO, DCF, and accretion/dilution models guiding C-suite board fairness opinions.',
          ],
        },
      ],
      edu: [{ degree: 'B.S. Economics (Wharton)', inst: 'University of Pennsylvania', loc: 'Philadelphia, PA', start: '2014', end: '2018' }],
      skills: [
        { name: 'Finance', items: ['DCF / LBO Modeling', 'M&A Execution', 'Capital IQ', 'IPO Roadshows'] },
      ],
    }),
  },
  {
    id: 'canva-ocean-split',
    name: 'Canva Ocean Dual-Header',
    shortName: 'Ocean Split',
    desc: 'Canva asymmetric split-band header separating bold candidate identity from contact block',
    badge: 'Canva Style',
    styleLabel: 'Ocean Split',
    defaultColor: '#0369a1',
    fontFamily: 'Lato',
    baseFont: 'sans',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'two-col-body',
      headerVariant: 'split-dual-band',
      sectionStyle: 'pill-tag',
      skillStyle: 'tinted-chips',
    },
    sampleData: makeSample({
      fullName: 'Noah Lindholm',
      title: 'Lead Marine Data Scientist',
      email: 'noah.lindholm@oceanai.example',
      phone: '+1 (305) 555-0146',
      location: 'Miami, FL',
      github: 'https://github.com/noahlindholm',
      summary: 'Geospatial & oceanographic data scientist forecasting hurricane storm surges, coral bleaching telemetry, and maritime routing efficiency.',
      exp: [
        {
          role: 'Lead Geospatial Data Scientist',
          company: 'BlueWave Telemetry',
          loc: 'Miami, FL',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Trained satellite computer-vision models improving coastal flood forecasting accuracy by 31%.',
            'Deployed PostGIS + Spark ETL pipelines processing 18TB daily NOAA & ESA buoy telemetry.',
          ],
        },
      ],
      edu: [{ degree: 'M.S. in Oceanography & Data Science', inst: 'University of Miami', loc: 'Coral Gables, FL', start: '2017', end: '2019' }],
      skills: [
        { name: 'Data & GIS', items: ['Python', 'PostGIS', 'PyTorch', 'GeoPandas', 'BigQuery'] },
      ],
    }),
  },

  // =========================================================================
  // GROUP E: PORTRAIT, CORPORATE & EXECUTIVE SIGN-OFF (25-30)
  // =========================================================================
  {
    id: 'canva-polaroid-studio',
    name: 'Canva Studio Portrait',
    shortName: 'Studio Portrait',
    desc: 'Canva creative overlapping portrait header cascading over clean modern experience & project rows',
    badge: 'Canva Style',
    styleLabel: 'Portrait Overlap',
    defaultColor: '#2563eb',
    fontFamily: 'Open Sans',
    baseFont: 'sans',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'two-col-body',
      headerVariant: 'overlapping-portrait',
      sectionStyle: 'left-tick',
      skillStyle: 'tinted-chips',
      showPhoto: true,
    },
    sampleData: makeSample({
      fullName: 'Jules Laurent',
      title: 'Senior Documentary Film Editor',
      email: 'jules@cutlinestudio.example',
      phone: '+1 (718) 555-0197',
      location: 'Brooklyn, NY',
      website: 'https://juleslaurent.film',
      photo: svgPortrait('#dbeafe', '#1d4ed8', '#f0c4a0', '#451a03', 'short'),
      summary: 'Sundance-featured documentary editor and post-production supervisor crafting non-fiction features and streaming docuseries.',
      exp: [
        {
          role: 'Lead Documentary Editor',
          company: 'Brooklyn Non-Fiction Co.',
          loc: 'Brooklyn, NY',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Edited 4 feature documentaries acquired by global streaming platforms (94% Rotten Tomatoes avg).',
            'Managed Avid Media Composer & DaVinci Resolve 4K HDR finishing workflows for 6-person post team.',
          ],
        },
      ],
      edu: [{ degree: 'B.F.A. in Film Editing', inst: 'NYU Tisch School of the Arts', loc: 'New York, NY', start: '2014', end: '2018' }],
      skills: [
        { name: 'Post-Production', items: ['Avid Media Composer', 'DaVinci Resolve', 'Story Arch', 'Sound Mixing'] },
      ],
    }),
  },
  {
    id: 'canva-executive-slate',
    name: 'Canva Boardroom Slate',
    shortName: 'Boardroom Slate',
    desc: 'Refined Canva corporate slate full-width banner with razor-sharp executive metric hierarchy',
    badge: 'Canva Style',
    styleLabel: 'Boardroom',
    defaultColor: '#334155',
    fontFamily: 'Calibri',
    baseFont: 'sans',
    categories: ['all', 'canva', 'executive', 'ats'],
    recipe: {
      layoutStructure: 'classic-single-clean',
      headerVariant: 'obsidian-band',
      sectionStyle: 'underline-bold',
      skillStyle: 'compact-grid',
      darkSurfaceHex: '#334155',
    },
    sampleData: makeSample({
      fullName: 'Sandra Caldwell',
      title: 'Chief Operating Officer',
      email: 'sandra.caldwell@apexcorp.example',
      phone: '+1 (214) 555-0165',
      location: 'Dallas, TX',
      linkedin: 'https://linkedin.com/in/sandracaldwell',
      summary: 'Fortune 500 COO transforming multi-site manufacturing & enterprise SaaS service operations across 1,800 staff and $920M revenue.',
      exp: [
        {
          role: 'Chief Operating Officer',
          company: 'LoneStar Precision Systems',
          loc: 'Dallas, TX',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Lifted operating EBITDA margin from 14.2% to 22.8% over 4 years through lean plant automation.',
            'Integrated 3 strategic bolt-on acquisitions achieving 100% ERP harmonization in 9 months.',
          ],
        },
      ],
      edu: [{ degree: 'MBA, Operations & Strategy', inst: 'Northwestern Kellogg', loc: 'Evanston, IL', start: '2008', end: '2010' }],
      skills: [
        { name: 'Executive Core', items: ['P&L Leadership', 'M&A Integration', 'Lean Operations', 'Board Governance'] },
      ],
    }),
  },
  {
    id: 'canva-blush-minimal',
    name: 'Canva Blush Editorial',
    shortName: 'Blush Minimal',
    desc: 'Graceful Canva rose-blush centered serif header & airy aesthetic crafted for fashion, PR & lifestyle leaders',
    badge: 'Canva Style',
    styleLabel: 'Blush Serif',
    defaultColor: '#be185d',
    fontFamily: 'Georgia',
    baseFont: 'serif',
    categories: ['all', 'canva', 'modern'],
    recipe: {
      layoutStructure: 'classic-single-clean',
      headerVariant: 'editorial-masthead',
      sectionStyle: 'double-rule',
      skillStyle: 'tinted-chips',
    },
    sampleData: makeSample({
      fullName: 'Isabella Conti',
      title: 'Senior Luxury Merchandising Buyer',
      email: 'isabella.conti@ateliermoda.example',
      phone: '+1 (212) 555-0115',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/isabellaconti',
      summary: 'Global luxury apparel buyer managing $65M open-to-buy budgets across Milan, Paris, and Fifth Avenue flagship collections.',
      exp: [
        {
          role: 'Senior Ready-to-Wear Buyer',
          company: 'Maison Verre Luxury Group',
          loc: 'New York, NY',
          start: '2021',
          end: 'Present',
          current: true,
          bullets: [
            'Increased full-price sell-through by 19% across 42 European designer capsules.',
            'Negotiated exclusive seasonal drops driving $9.4M flagship launch weekend revenue.',
          ],
        },
      ],
      edu: [{ degree: 'M.A. in Fashion Luxury Management', inst: 'Polimoda Florence', loc: 'Florence, Italy', start: '2016', end: '2017' }],
      skills: [
        { name: 'Merchandising', items: ['Open-to-Buy (OTB)', 'Margin Forecasting', 'Runway Sourcing', 'Italian / English'] },
      ],
    }),
  },
  {
    id: 'canva-amber-highlight',
    name: 'Canva Amber Accent',
    shortName: 'Amber Accent',
    desc: 'Clean Canva high-contrast black ink typography punctuated with bold amber marker underlines',
    badge: 'Canva Style',
    styleLabel: 'Amber Marker',
    defaultColor: '#d97706',
    fontFamily: 'Poppins',
    baseFont: 'modern',
    categories: ['all', 'canva', 'ats', 'modern'],
    recipe: {
      layoutStructure: 'two-col-body',
      headerVariant: 'highlighter-bar',
      sectionStyle: 'highlighter',
      skillStyle: 'outlined-tags',
    },
    sampleData: makeSample({
      fullName: 'Trevor Mills',
      title: 'Principal Technical Recruiter',
      email: 'trevor.mills@talentgrid.example',
      phone: '+1 (415) 555-0132',
      location: 'Remote / San Francisco',
      linkedin: 'https://linkedin.com/in/trevormills',
      summary: 'Technical recruiting lead closing 110+ Staff/Principal engineers and AI research scientists across hyper-growth Series B–D startups.',
      exp: [
        {
          role: 'Lead Technical Recruiter',
          company: 'Frontier Labs AI',
          loc: 'San Francisco, CA',
          start: '2022',
          end: 'Present',
          current: true,
          bullets: [
            'Hired 68 ML Systems & Backend engineers in 18 months with 91% offer acceptance rate.',
            'Structured interviewer calibration rubric cutting time-to-offer from 48 to 23 days.',
          ],
        },
      ],
      edu: [{ degree: 'B.A. in Communications', inst: 'University of Washington', loc: 'Seattle, WA', start: '2013', end: '2017' }],
      skills: [
        { name: 'Talent Ops', items: ['Executive Search', 'Ashby / Greenhouse', 'Boolean Sourcing', 'Comp Closing'] },
      ],
    }),
  },
  {
    id: 'canva-graduate-clean',
    name: 'Canva Campus Fresh',
    shortName: 'Campus Fresh',
    desc: 'Canva entry-level & new-grad layout elevating Education & Technical Projects above experience',
    badge: 'Canva Style',
    styleLabel: 'Grad Priority',
    defaultColor: '#0284c7',
    fontFamily: 'Inter',
    baseFont: 'sans',
    categories: ['all', 'canva', 'academic', 'ats'],
    recipe: {
      layoutStructure: 'education-first-clean',
      headerVariant: 'navy-crest',
      sectionStyle: 'pill-tag',
      skillStyle: 'tinted-chips',
    },
    sampleData: makeSample({
      fullName: 'Kevin Zhang',
      title: 'Software Engineer (New Grad)',
      email: 'kevin.zhang@campus.example',
      phone: '+1 (647) 555-0189',
      location: 'Toronto, ON',
      github: 'https://github.com/kevinzhangdev',
      linkedin: 'https://linkedin.com/in/kevinzhangdev',
      summary: 'Computer Science Honours graduate with 2 SWE internships shipping high-throughput TypeScript microservices and React data visualizations.',
      edu: [
        { degree: 'B.C.S. Honours Computer Science', inst: 'University of Waterloo', loc: 'Waterloo, ON', start: '2022', end: '2026', gpa: '3.91 / 4.0' },
      ],
      exp: [
        {
          role: 'Software Engineering Intern',
          company: 'Shopify',
          loc: 'Toronto, ON',
          start: 'May 2025',
          end: 'Aug 2025',
          bullets: [
            'Built real-time GraphQL storefront inventory caching reducing p95 checkout delay by 34ms.',
          ],
        },
        {
          role: 'Frontend Engineering Intern',
          company: 'Wealthsimple',
          loc: 'Toronto, ON',
          start: 'Jan 2024',
          end: 'Apr 2024',
          bullets: ['Shipped accessible React portfolio chart modules reaching 1.2M retail investors.'],
        },
      ],
      projects: [
        {
          name: 'PulseDB Time-Series Engine',
          tech: 'Rust, TypeScript, WebSockets',
          desc: 'In-memory telemetry aggregator sustaining 150k writes/sec with live browser query inspector.',
        },
        {
          name: 'CourseMate AI Planner',
          tech: 'Next.js, PostgreSQL, Prisma',
          desc: 'University degree prerequisite graph solver used by 4,800+ Waterloo undergrads.',
        },
      ],
      skills: [
        { name: 'Languages', items: ['TypeScript', 'Python', 'Rust', 'SQL', 'Go'] },
        { name: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'Docker', 'PostgreSQL'] },
      ],
    }),
  },
  {
    id: 'canva-executive-signature',
    name: 'Canva Executive Sign-Off',
    shortName: 'Executive Sign-Off',
    desc: 'Formal Canva executive single-column layout featuring structured rule dividers & verified signature block',
    badge: 'Canva Style',
    styleLabel: 'Signed Exec',
    defaultColor: '#1e293b',
    fontFamily: 'Georgia',
    baseFont: 'serif',
    categories: ['all', 'canva', 'executive', 'academic'],
    recipe: {
      layoutStructure: 'classic-single-clean',
      headerVariant: 'framed-nameplate',
      sectionStyle: 'double-rule',
      skillStyle: 'inline-bars',
    },
    sampleData: makeSample({
      fullName: 'Jonathan Vance, Esq.',
      title: 'Global Chief Compliance Officer',
      email: 'j.vance@meridianlegal.example',
      phone: '+44 20 7946 0512',
      location: 'London, UK',
      linkedin: 'https://linkedin.com/in/jonathanvance',
      summary: 'Regulatory compliance executive advising Tier-1 European banks on FCA/SEC cross-border risk governance, AML transformations, and AI Act compliance.',
      exp: [
        {
          role: 'Chief Compliance Officer',
          company: 'Albion Clearing Bank',
          loc: 'London',
          start: '2020',
          end: 'Present',
          current: true,
          bullets: [
            'Directed 95-person global regulatory team securing zero material FCA audit exceptions.',
            'Designed automated AML transaction-monitoring governance saving £4.2M annually.',
          ],
        },
      ],
      edu: [
        { degree: 'LL.M. Financial Regulation', inst: 'University of Oxford', loc: 'Oxford, UK', start: '2010', end: '2011' },
      ],
      skills: [
        { name: 'Governance', items: ['FCA / SEC Rules', 'AML / KYC', 'EU AI Act Risk', 'Board Reporting'] },
      ],
      certs: [{ name: 'Solicitor of the Senior Courts (England & Wales)', issuer: 'SRA', date: '2012' }],
      declEnabled: true,
      declSig: svgSig('#0f172a', 'M14 40 C26 12, 34 46, 52 26 C64 16, 70 42, 84 32 C98 24, 120 34, 158 32'),
    }),
  },
];

export const EXTRA_CANVA_TEMPLATES_LIST = EXTRA_CANVA_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  shortName: t.shortName,
  desc: t.desc,
  badge: t.badge,
}));

export const EXTRA_CANVA_RECIPES: Record<ExtraCanvaTemplateId, CanvaLayoutRecipe> = EXTRA_CANVA_TEMPLATES.reduce(
  (acc, t) => {
    acc[t.id] = t.recipe;
    return acc;
  },
  {} as Record<ExtraCanvaTemplateId, CanvaLayoutRecipe>
);

export const EXTRA_CANVA_CATEGORY_MAP: Record<ExtraCanvaTemplateId, TemplateCategory[]> = EXTRA_CANVA_TEMPLATES.reduce(
  (acc, t) => {
    acc[t.id] = t.categories;
    return acc;
  },
  {} as Record<ExtraCanvaTemplateId, TemplateCategory[]>
);

export const EXTRA_CANVA_SHOWCASE_CONFIGS = EXTRA_CANVA_TEMPLATES.reduce(
  (acc, t) => {
    acc[t.id] = {
      id: t.id,
      styleLabel: t.styleLabel,
      defaultColor: t.defaultColor,
      fontFamily: t.fontFamily,
      baseFont: t.baseFont,
      sampleData: t.sampleData,
    };
    return acc;
  },
  {} as Record<
    ExtraCanvaTemplateId,
    {
      id: ResumeTemplateId;
      styleLabel: string;
      defaultColor: string;
      fontFamily: string;
      baseFont: 'sans' | 'serif' | 'modern';
      sampleData: ResumeData;
    }
  >
);

export function isExtraCanvaTemplate(id: ResumeTemplateId): id is ExtraCanvaTemplateId {
  return id in EXTRA_CANVA_RECIPES;
}
