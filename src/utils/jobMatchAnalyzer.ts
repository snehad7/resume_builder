import { ResumeData } from '../types/resume';
import {
  JobMatchReport,
  MatchedKeyword,
  MissingKeyword,
  SectionMatch,
  JobSuggestion,
} from '../types/jobMatch';

// Common technical skills, frameworks, tools, libraries, and concepts dictionary
// Maps lowercase term -> canonical display name and category
interface SkillDefinition {
  canonical: string;
  category: 'technical' | 'tool' | 'qualification' | 'domain' | 'soft-skill';
  aliases: string[];
}

const KNOWN_KEYWORDS: SkillDefinition[] = [
  // Programming Languages
  { canonical: 'JavaScript', category: 'technical', aliases: ['javascript', 'js', 'es6', 'ecmascript'] },
  { canonical: 'TypeScript', category: 'technical', aliases: ['typescript', 'ts'] },
  { canonical: 'Python', category: 'technical', aliases: ['python', 'py'] },
  { canonical: 'Java', category: 'technical', aliases: ['java', 'core java'] },
  { canonical: 'C++', category: 'technical', aliases: ['c++', 'cpp'] },
  { canonical: 'C#', category: 'technical', aliases: ['c#', 'csharp'] },
  { canonical: 'Go', category: 'technical', aliases: ['go', 'golang'] },
  { canonical: 'Rust', category: 'technical', aliases: ['rust'] },
  { canonical: 'PHP', category: 'technical', aliases: ['php'] },
  { canonical: 'Ruby', category: 'technical', aliases: ['ruby'] },
  { canonical: 'SQL', category: 'technical', aliases: ['sql'] },
  { canonical: 'HTML5', category: 'technical', aliases: ['html', 'html5'] },
  { canonical: 'CSS3', category: 'technical', aliases: ['css', 'css3'] },
  { canonical: 'Kotlin', category: 'technical', aliases: ['kotlin'] },
  { canonical: 'Swift', category: 'technical', aliases: ['swift'] },
  { canonical: 'Dart', category: 'technical', aliases: ['dart'] },
  { canonical: 'Bash / Shell', category: 'technical', aliases: ['bash', 'shell script', 'shell scripting', 'powershell'] },

  // Frontend Frameworks & Libraries
  { canonical: 'React', category: 'technical', aliases: ['react', 'reactjs', 'react.js'] },
  { canonical: 'Next.js', category: 'technical', aliases: ['next.js', 'nextjs', 'next'] },
  { canonical: 'Vue.js', category: 'technical', aliases: ['vue', 'vuejs', 'vue.js'] },
  { canonical: 'Angular', category: 'technical', aliases: ['angular', 'angularjs'] },
  { canonical: 'Svelte', category: 'technical', aliases: ['svelte', 'sveltekit'] },
  { canonical: 'Tailwind CSS', category: 'technical', aliases: ['tailwind', 'tailwindcss'] },
  { canonical: 'Bootstrap', category: 'technical', aliases: ['bootstrap'] },
  { canonical: 'Redux', category: 'technical', aliases: ['redux', 'redux toolkit', 'rtk'] },
  { canonical: 'Zustand', category: 'technical', aliases: ['zustand'] },
  { canonical: 'React Native', category: 'technical', aliases: ['react native'] },
  { canonical: 'Flutter', category: 'technical', aliases: ['flutter'] },

  // Backend & APIs
  { canonical: 'Node.js', category: 'technical', aliases: ['node', 'nodejs', 'node.js'] },
  { canonical: 'Express.js', category: 'technical', aliases: ['express', 'expressjs', 'express.js'] },
  { canonical: 'FastAPI', category: 'technical', aliases: ['fastapi', 'fast api'] },
  { canonical: 'Django', category: 'technical', aliases: ['django'] },
  { canonical: 'Flask', category: 'technical', aliases: ['flask'] },
  { canonical: 'Spring Boot', category: 'technical', aliases: ['spring', 'spring boot'] },
  { canonical: 'ASP.NET', category: 'technical', aliases: ['asp.net', '.net core', '.net'] },
  { canonical: 'GraphQL', category: 'technical', aliases: ['graphql'] },
  { canonical: 'REST APIs', category: 'technical', aliases: ['rest', 'rest api', 'restful', 'restful apis', 'rest apis'] },
  { canonical: 'gRPC', category: 'technical', aliases: ['grpc'] },
  { canonical: 'WebSockets', category: 'technical', aliases: ['websocket', 'websockets', 'socket.io'] },
  { canonical: 'Microservices', category: 'technical', aliases: ['microservices', 'microservice'] },

  // Databases & Caching
  { canonical: 'PostgreSQL', category: 'technical', aliases: ['postgresql', 'postgres'] },
  { canonical: 'MongoDB', category: 'technical', aliases: ['mongodb', 'mongo'] },
  { canonical: 'MySQL', category: 'technical', aliases: ['mysql'] },
  { canonical: 'Redis', category: 'technical', aliases: ['redis'] },
  { canonical: 'SQLite', category: 'technical', aliases: ['sqlite'] },
  { canonical: 'Oracle Database', category: 'technical', aliases: ['oracle db', 'oracle database'] },
  { canonical: 'DynamoDB', category: 'technical', aliases: ['dynamodb'] },
  { canonical: 'Firebase', category: 'technical', aliases: ['firebase', 'firestore'] },
  { canonical: 'Prisma', category: 'technical', aliases: ['prisma', 'prisma orm'] },

  // Cloud & DevOps
  { canonical: 'AWS', category: 'technical', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
  { canonical: 'Docker', category: 'tool', aliases: ['docker', 'containerization', 'containers'] },
  { canonical: 'Kubernetes', category: 'tool', aliases: ['kubernetes', 'k8s'] },
  { canonical: 'CI/CD', category: 'tool', aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'] },
  { canonical: 'GitHub Actions', category: 'tool', aliases: ['github actions'] },
  { canonical: 'Google Cloud Platform (GCP)', category: 'technical', aliases: ['gcp', 'google cloud', 'google cloud platform'] },
  { canonical: 'Microsoft Azure', category: 'technical', aliases: ['azure', 'microsoft azure'] },
  { canonical: 'Linux', category: 'tool', aliases: ['linux', 'unix', 'ubuntu'] },
  { canonical: 'Git', category: 'tool', aliases: ['git', 'github', 'gitlab', 'version control'] },
  { canonical: 'Terraform', category: 'tool', aliases: ['terraform'] },
  { canonical: 'Nginx', category: 'tool', aliases: ['nginx'] },

  // Testing & Quality
  { canonical: 'Unit Testing', category: 'technical', aliases: ['unit testing', 'unit test', 'unit tests'] },
  { canonical: 'Jest', category: 'tool', aliases: ['jest'] },
  { canonical: 'Cypress', category: 'tool', aliases: ['cypress'] },
  { canonical: 'Playwright', category: 'tool', aliases: ['playwright'] },
  { canonical: 'Selenium', category: 'tool', aliases: ['selenium'] },
  { canonical: 'PyTest', category: 'tool', aliases: ['pytest'] },
  { canonical: 'Debugging', category: 'technical', aliases: ['debugging', 'troubleshooting'] },

  // Architecture & Engineering Concepts
  { canonical: 'Data Structures & Algorithms', category: 'domain', aliases: ['data structures', 'algorithms', 'dsa'] },
  { canonical: 'Object-Oriented Programming (OOP)', category: 'domain', aliases: ['oop', 'object oriented programming', 'object-oriented'] },
  { canonical: 'System Design', category: 'domain', aliases: ['system design', 'distributed systems'] },
  { canonical: 'Responsive Design', category: 'domain', aliases: ['responsive design', 'mobile responsive', 'mobile-first'] },
  { canonical: 'Web Accessibility (a11y)', category: 'domain', aliases: ['accessibility', 'a11y', 'wcag'] },
  { canonical: 'Performance Optimization', category: 'domain', aliases: ['performance optimization', 'web performance', 'optimization'] },
  { canonical: 'Security & Auth', category: 'domain', aliases: ['authentication', 'authorization', 'oauth', 'jwt', 'web security'] },

  // AI & Data Science
  { canonical: 'Machine Learning', category: 'technical', aliases: ['machine learning', 'ml', 'deep learning'] },
  { canonical: 'Artificial Intelligence (AI)', category: 'technical', aliases: ['artificial intelligence', 'ai', 'genai', 'generative ai'] },
  { canonical: 'Pandas', category: 'technical', aliases: ['pandas'] },
  { canonical: 'NumPy', category: 'technical', aliases: ['numpy'] },
  { canonical: 'TensorFlow', category: 'technical', aliases: ['tensorflow'] },
  { canonical: 'PyTorch', category: 'technical', aliases: ['pytorch'] },
  { canonical: 'Data Analysis', category: 'domain', aliases: ['data analysis', 'data visualization'] },

  // Methodologies & Soft Skills
  { canonical: 'Agile / Scrum', category: 'domain', aliases: ['agile', 'scrum', 'sprints', 'kanban'] },
  { canonical: 'Code Review', category: 'domain', aliases: ['code review', 'code reviews', 'pr review'] },
  { canonical: 'Collaboration', category: 'soft-skill', aliases: ['cross-functional collaboration', 'team collaboration', 'collaborative'] },
  { canonical: 'Problem Solving', category: 'soft-skill', aliases: ['problem solving', 'analytical skills', 'critical thinking'] },
  { canonical: 'Communication', category: 'soft-skill', aliases: ['communication skills', 'technical communication', 'written communication'] },

  // Qualifications & Roles
  { canonical: 'Computer Science Degree', category: 'qualification', aliases: ['computer science', 'b.tech', 'b.e.', 'bs in cs', 'bachelor of technology', 'bachelor of engineering', 'm.tech', 'mca', 'bca'] },
  { canonical: 'Software Engineering', category: 'qualification', aliases: ['software engineering', 'software development', 'information technology'] },
];

// Common stop words to ignore when scanning arbitrary job descriptions
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'are', 'you', 'your', 'will', 'our', 'all', 'can', 'has', 'work', 'working', 'team', 'teams', 'company', 'looking', 'role', 'join', 'about', 'help', 'build', 'building', 'years', 'experience', 'ability', 'responsible', 'requirements', 'qualifications', 'preferred', 'plus', 'must', 'should', 'strong', 'good', 'great', 'ideal', 'candidate', 'apply', 'opportunity', 'responsibilities', 'duties', 'environment', 'culture', 'benefits', 'salary', 'equal', 'employment', 'status', 'gender', 'race', 'religion', 'national', 'origin', 'protected', 'veteran', 'disability', 'full-time', 'remote', 'hybrid', 'onsite', 'located', 'office', 'flexible', 'days', 'per', 'week', 'month', 'year', 'compensation', 'package', 'including', 'health', 'dental', 'vision', '401k', 'pto', 'vacation', 'leave', 'paid', 'please', 'submit', 'resume', 'cover', 'letter', 'interview', 'process', 'hiring', 'manager', 'questions', 'contact', 'us', 'today'
]);

/**
 * Extracts key requirements and keywords from raw job description text
 */
export function extractJobKeywords(jobDescription: string): {
  identifiedKeywords: { canonical: string; category: SkillDefinition['category']; frequency: number; snippet: string }[];
  experienceRequirements: string[];
  educationRequirements: string[];
} {
  const jdLower = jobDescription.toLowerCase();
  const identifiedMap = new Map<string, { canonical: string; category: SkillDefinition['category']; frequency: number; snippet: string }>();

  // 1. Match against known skill definitions and aliases
  for (const def of KNOWN_KEYWORDS) {
    let matchCount = 0;
    let snippet = '';

    for (const alias of def.aliases) {
      // Escape for regex
      const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match word boundaries (or start/end of string, or punctuation boundary)
      const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:[^a-zA-Z0-9_#+]|$)`, 'gi');
      const matches = jdLower.match(regex);
      if (matches && matches.length > 0) {
        matchCount += matches.length;
        if (!snippet) {
          const idx = jdLower.indexOf(alias);
          if (idx !== -1) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(jobDescription.length, idx + alias.length + 40);
            snippet = jobDescription.substring(start, end).replace(/\s+/g, ' ').trim();
          }
        }
      }
    }

    if (matchCount > 0) {
      identifiedMap.set(def.canonical.toLowerCase(), {
        canonical: def.canonical,
        category: def.category,
        frequency: matchCount,
        snippet: snippet ? `…${snippet}…` : '',
      });
    }
  }

  // 2. Extract Experience Requirements (e.g. "2+ years", "3-5 years of experience", "entry level", "fresher")
  const expRegex = /(\d+\s*(?:to|-|\+)\s*\d*\s*years?(?:\s+of)?(?:\s+experience)?|fresher|entry[\s-]level|internship)/gi;
  const experienceRequirements: string[] = [];
  let expMatch;
  while ((expMatch = expRegex.exec(jobDescription)) !== null) {
    const text = expMatch[0].trim();
    if (!experienceRequirements.some((e) => e.toLowerCase() === text.toLowerCase())) {
      experienceRequirements.push(text);
    }
  }

  // 3. Extract Education Requirements (e.g. "Bachelor's degree", "B.Tech", "Master's")
  const eduRegex = /(bachelor'?s(?:\s+degree)?(?:\s+in\s+[a-zA-Z\s]+)?|master'?s(?:\s+degree)?|b\.?tech|b\.?e\.?|mca|bca|diploma\s+in\s+[a-zA-Z\s]+)/gi;
  const educationRequirements: string[] = [];
  let eduMatch;
  while ((eduMatch = eduRegex.exec(jobDescription)) !== null) {
    const text = eduMatch[0].trim();
    if (!educationRequirements.some((e) => e.toLowerCase() === text.toLowerCase())) {
      educationRequirements.push(text);
    }
  }

  // 4. Also scan for capitalized technical terms or acronyms in the JD that aren't stop words
  const words = jobDescription.match(/\b[A-Za-z0-9+#.-]{3,}\b/g) || [];
  for (const w of words) {
    const lower = w.toLowerCase();
    if (!STOP_WORDS.has(lower) && !identifiedMap.has(lower)) {
      // Check if it's an acronym or capitalized term (like AWS, SDK, API, CLI, ETL, etc.)
      if (/^[A-Z]{2,5}$/.test(w) && !['AND', 'FOR', 'THE', 'YOU', 'OUR', 'ARE'].includes(w)) {
        identifiedMap.set(lower, {
          canonical: w,
          category: 'technical',
          frequency: 1,
          snippet: '',
        });
      }
    }
  }

  return {
    identifiedKeywords: Array.from(identifiedMap.values()),
    experienceRequirements: experienceRequirements.slice(0, 3),
    educationRequirements: educationRequirements.slice(0, 3),
  };
}

/**
 * Normalizes text to easily find keywords with fuzzy/substring matching
 */
function normalizeForSearch(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9+#.-]/g, ' ');
}

/**
 * Searches for a keyword or its aliases inside a given text
 */
function isTermInText(term: string, text: string): boolean {
  const normText = ` ${normalizeForSearch(text)} `;
  const normTerm = normalizeForSearch(term).trim();
  if (!normTerm) return false;

  // Exact word boundary check
  const regex = new RegExp(`(?:^|\\s)${normTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`, 'i');
  if (regex.test(normText)) return true;

  // Check alias list if available
  const matchDef = KNOWN_KEYWORDS.find((k) => k.canonical.toLowerCase() === term.toLowerCase());
  if (matchDef) {
    for (const alias of matchDef.aliases) {
      const aliasNorm = normalizeForSearch(alias).trim();
      const aliasRegex = new RegExp(`(?:^|\\s)${aliasNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:\\s|$)`, 'i');
      if (aliasRegex.test(normText)) return true;
    }
  }

  return false;
}

/**
 * Analyzes the user's current ResumeData against a Job Description
 */
export function analyzeJobMatch(
  jobDescription: string,
  resume: ResumeData
): {
  report: JobMatchReport | null;
  error?: string;
} {
  const trimmed = jobDescription.trim();

  // Validate minimum content
  if (!trimmed) {
    return { report: null, error: 'Please paste a job description to analyze.' };
  }

  if (trimmed.length < 50 || trimmed.split(/\s+/).length < 10) {
    return {
      report: null,
      error: 'The job description is too short. Please paste a full job description (at least 2-3 sentences or job requirements).',
    };
  }

  const { identifiedKeywords, experienceRequirements, educationRequirements } = extractJobKeywords(jobDescription);

  if (identifiedKeywords.length === 0) {
    return {
      report: null,
      error: 'Could not detect distinct technical skills, tools, or requirements in the provided text. Please ensure the job description contains responsibilities and skills.',
    };
  }

  // Build searchable section index from current ResumeData
  const sectionTextMap: {
    sectionTitle: string;
    sectionId: string;
    items: { title: string; content: string }[];
  }[] = [
    {
      sectionTitle: 'Summary / Title',
      sectionId: 'summary',
      items: [
        { title: 'Job Title', content: resume.personal.title || '' },
        { title: 'Summary', content: resume.summary || '' },
      ],
    },
    {
      sectionTitle: 'Technical Skills',
      sectionId: 'skills',
      items: (resume.skillCategories || []).map((cat) => ({
        title: cat.name,
        content: (cat.skills || []).join(' '),
      })),
    },
    {
      sectionTitle: 'Projects',
      sectionId: 'projects',
      items: (resume.projects || []).map((p) => ({
        title: p.name,
        content: `${p.name} ${p.techStack} ${p.description} ${(p.highlights || []).join(' ')}`,
      })),
    },
    {
      sectionTitle: 'Experience',
      sectionId: 'experience',
      items: (resume.experience || []).map((exp) => ({
        title: `${exp.role} at ${exp.company}`,
        content: `${exp.role} ${exp.company} ${(exp.highlights || []).join(' ')}`,
      })),
    },
    {
      sectionTitle: 'Education',
      sectionId: 'education',
      items: (resume.education || []).map((edu) => ({
        title: `${edu.degree} - ${edu.institution}`,
        content: `${edu.degree} ${edu.institution} ${(edu.highlights || []).join(' ')}`,
      })),
    },
    {
      sectionTitle: 'Certifications',
      sectionId: 'certifications',
      items: (resume.certifications || []).map((cert) => ({
        title: cert.name,
        content: `${cert.name} ${cert.issuer}`,
      })),
    },
  ];

  const matchedKeywords: MatchedKeyword[] = [];
  const missingKeywords: MissingKeyword[] = [];
  const relevantSectionsMap = new Map<string, SectionMatch>();

  for (const item of identifiedKeywords) {
    const foundInSections: string[] = [];
    let occurrencesInResume = 0;

    for (const sec of sectionTextMap) {
      for (const itm of sec.items) {
        if (isTermInText(item.canonical, itm.content)) {
          occurrencesInResume++;
          if (!foundInSections.includes(sec.sectionTitle)) {
            foundInSections.push(sec.sectionTitle);
          }

          // Register section match
          if (!relevantSectionsMap.has(sec.sectionId)) {
            relevantSectionsMap.set(sec.sectionId, {
              sectionTitle: sec.sectionTitle,
              sectionId: sec.sectionId,
              matchingItems: [],
            });
          }
          const secMatch = relevantSectionsMap.get(sec.sectionId)!;
          let existingItem = secMatch.matchingItems.find((mi) => mi.title === itm.title);
          if (!existingItem) {
            existingItem = { title: itm.title, matchedKeywords: [] };
            secMatch.matchingItems.push(existingItem);
          }
          if (!existingItem.matchedKeywords.includes(item.canonical)) {
            existingItem.matchedKeywords.push(item.canonical);
          }
        }
      }
    }

    if (foundInSections.length > 0) {
      matchedKeywords.push({
        term: item.canonical,
        category: item.category,
        foundInSections,
        occurrencesInResume,
      });
    } else {
      missingKeywords.push({
        term: item.canonical,
        category: item.category,
        importance: item.frequency >= 2 ? 'high' : item.category === 'technical' ? 'medium' : 'low',
        contextSnippet: item.snippet,
      });
    }
  }

  // Calculate estimated match percentage
  const totalKeywords = identifiedKeywords.length;
  const matchPercentage = totalKeywords > 0 ? Math.round((matchedKeywords.length / totalKeywords) * 100) : 0;

  // Generate safe, practical recommendations
  const suggestions: JobSuggestion[] = [];

  // 1. Highlight Projects that match multiple keywords
  for (const proj of resume.projects || []) {
    const projKeywords = matchedKeywords.filter((mk) =>
      mk.foundInSections.includes('Projects') &&
      isTermInText(mk.term, `${proj.name} ${proj.techStack} ${proj.description} ${(proj.highlights || []).join(' ')}`)
    );
    if (projKeywords.length >= 2) {
      suggestions.push({
        id: `sug-proj-${proj.id}`,
        type: 'emphasize-project',
        title: `Emphasize Project: "${proj.name}"`,
        description: `This project already demonstrates ${projKeywords.map((k) => k.term).join(', ')}, which are specifically requested in the job description. Move this project higher up or highlight its achievements.`,
        targetSection: 'projects',
      });
    }
  }

  // 2. Recommend highlighting existing skills that are in the JD
  const matchedSkillTerms = matchedKeywords.filter((k) => k.category === 'technical' || k.category === 'tool');
  if (matchedSkillTerms.length > 0) {
    const topSkills = matchedSkillTerms.slice(0, 4).map((k) => k.term).join(', ');
    suggestions.push({
      id: 'sug-skills-order',
      type: 'highlight-skill',
      title: `Feature Key Matches at the Top of Technical Skills`,
      description: `Your resume already includes ${topSkills}. Position these key matches prominently in your Technical Skills section so recruiters spot them immediately.`,
      targetSection: 'skills',
    });
  }

  // 3. Safe missing skill opportunities
  const highPriorityMissing = missingKeywords.filter((k) => k.importance === 'high' || k.category === 'technical');
  for (const missing of highPriorityMissing.slice(0, 3)) {
    suggestions.push({
      id: `sug-missing-${missing.term}`,
      type: 'add-skill',
      title: `Consider Adding "${missing.term}" (If Experienced)`,
      description: `The job description mentions "${missing.term}"${missing.contextSnippet ? ` (${missing.contextSnippet})` : ''}. If you possess this skill or used it in coursework, you can add it to your Technical Skills.`,
      targetSection: 'skills',
      suggestedAction: {
        type: 'add-skill',
        skillName: missing.term,
      },
    });
  }

  // 4. Summary alignment suggestion
  if (!resume.summary || resume.summary.length < 30) {
    suggestions.push({
      id: 'sug-summary',
      type: 'clarify-experience',
      title: 'Target Your Professional Summary',
      description: `Tailor your career objective or summary to reference the role and 1-2 core strengths matching the job requirements (e.g., ${matchedKeywords.slice(0, 2).map((k) => k.term).join(' and ')}).`,
      targetSection: 'summary',
    });
  }

  const report: JobMatchReport = {
    id: `report-${Date.now()}`,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    resumeTimestamp: Date.now(),
    matchPercentage,
    totalJobKeywordsCount: totalKeywords,
    matchedCount: matchedKeywords.length,
    missingCount: missingKeywords.length,
    matchedKeywords,
    missingKeywords,
    relevantSections: Array.from(relevantSectionsMap.values()),
    suggestions,
    experienceRequirements,
    educationRequirements,
  };

  return { report };
}

// Sample job descriptions for quick testing
export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    title: 'Frontend React Developer',
    company: 'TechCorp Solutions',
    text: `Job Title: Junior / Associate Frontend Developer
Location: Remote / Hybrid
Role Overview:
We are looking for an enthusiastic Frontend Developer to join our core product team. You will build modern, accessible, and responsive user interfaces for our SaaS platform.

Responsibilities:
- Develop responsive web applications using React, TypeScript, and modern JavaScript (ES6+).
- Style user interfaces with Tailwind CSS and ensure high web accessibility (a11y) standards.
- Integrate REST APIs and WebSockets for real-time collaboration features.
- Write clean, maintainable code with unit testing using Jest or React Testing Library.
- Participate in Agile / Scrum sprints, code reviews, and Git workflow.

Requirements:
- Bachelor's degree in Computer Science, Information Technology, or equivalent experience.
- 0-2 years of experience with React, HTML5, CSS3, and JavaScript.
- Familiarity with version control using Git / GitHub.
- Experience with Next.js, Redux, or Node.js is a plus.
- Strong problem solving and communication skills.`,
  },
  {
    title: 'Full Stack Software Engineer',
    company: 'Innovate Labs',
    text: `Position: Full Stack Engineer
Department: Engineering

Key Responsibilities:
- Design and implement end-to-end web applications using Node.js, Express, React, and TypeScript.
- Build and maintain PostgreSQL and MongoDB databases, designing efficient schemas and queries.
- Implement secure authentication and authorization with OAuth and JWT.
- Deploy scalable services using Docker containers, CI/CD pipelines, and AWS (EC2, S3).
- Troubleshoot performance issues, write unit tests, and maintain system documentation.

Qualifications:
- Bachelor's in Computer Science, Software Engineering, or related discipline.
- 1+ years of experience in full-stack web development.
- Strong proficiency in JavaScript, TypeScript, Python, and SQL.
- Hands-on experience with REST APIs and microservices architecture.
- Demonstrated projects or code contributions on GitHub.`,
  },
  {
    title: 'Python / Data Engineer Fresher',
    company: 'DataMetrics AI',
    text: `Role: Junior Data & Software Engineer
Location: On-site / Hybrid

About the Role:
We are seeking a motivated entry-level engineer with a strong foundation in Python and Data Analysis.

Requirements:
- B.Tech or Master's in Computer Science, Data Science, or related field.
- Proficiency in Python, SQL, and data structures & algorithms.
- Experience with libraries such as Pandas, NumPy, or Data Visualization tools.
- Familiarity with FastAPI or Flask for serving backend machine learning models.
- Understanding of Git version control, Linux command line, and Docker basics.
- Strong analytical and problem solving mindset with eagerness to learn.`,
  },
];
