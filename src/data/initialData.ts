import { ResumeData, ResumeSettings } from '../types/resume';

export const initialResumeData: ResumeData = {
  personal: {
    fullName: 'Alex Morgan',
    title: 'Senior Software Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'https://linkedin.com/in/alexmorgan',
    github: 'https://github.com/alexmorgan',
    photo: '',
    fatherName: 'Robert Morgan',
    dob: '1996-05-14',
    gender: 'Male',
    maritalStatus: 'Single',
    nationality: 'American',
    languages: 'English (Native), Spanish (Professional), German (Basic)',
    permanentAddress: '1428 Elm Street, Suite 400, San Francisco, CA 94107',
  },
  summary:
    'Results-driven Senior Software Engineer with 6+ years of experience designing scalable distributed systems, microservices, and modern web applications. Proven track record of improving system latency by 35% and mentoring junior engineers in engineering best practices.',
  experience: [
    {
      id: 'exp-1',
      role: 'Senior Software Engineer',
      company: 'TechFlow Systems',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      highlights: [
        'Architected high-throughput REST APIs and microservices handling 25M+ daily requests using FastAPI, Python, and PostgreSQL.',
        'Spearheaded migration to containerized infrastructure, slashing cloud deployment times by 40%.',
        'Collaborated closely with product managers and UX designers to deliver enterprise customer portals with 99.9% uptime.',
      ],
    },
    {
      id: 'exp-2',
      role: 'Software Engineer',
      company: 'Apex Data Labs',
      location: 'San Jose, CA',
      startDate: '2019',
      endDate: '2022',
      current: false,
      highlights: [
        'Engineered responsive single-page web applications with React, TypeScript, and modern state architectures.',
        'Built automated test suites and CI/CD pipelines, reducing post-release production defects by 28%.',
        'Implemented Redis caching layers, cutting database query latency by 50% across key analytical dashboards.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: '2015',
      endDate: '2019',
      current: false,
      gpa: '3.85 / 4.0',
      highlights: ['Dean\'s Honors List', 'Coursework: Data Structures, Distributed Systems, Database Management'],
    },
    {
      id: 'edu-2',
      degree: 'Higher Secondary Certificate (Science)',
      institution: 'Lincoln High School',
      location: 'San Jose, CA',
      startDate: '2013',
      endDate: '2015',
      current: false,
      gpa: '94.5%',
      highlights: ['National Merit Scholar', 'AP Scholar with Distinction in Mathematics and Physics'],
    },
  ],
  skillCategories: [
    {
      id: 'cat-1',
      name: 'Languages & Core',
      skills: ['TypeScript', 'JavaScript (ES6+)', 'Python', 'SQL', 'HTML5/CSS3'],
    },
    {
      id: 'cat-2',
      name: 'Frameworks & Libraries',
      skills: ['React', 'FastAPI', 'Node.js', 'Express', 'Tailwind CSS', 'Next.js'],
    },
    {
      id: 'cat-3',
      name: 'Cloud & DevOps',
      skills: ['Docker', 'AWS (EC2, S3)', 'Git & GitHub', 'PostgreSQL', 'Redis', 'CI/CD Pipelines'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Resume Builder Platform',
      techStack: 'React, TypeScript, FastAPI, Tailwind CSS',
      link: 'https://resume-builder.demo',
      githubUrl: 'https://github.com/alexmorgan/resume-builder',
      description: 'An interactive, responsive resume builder with real-time preview, template selection, and ATS-friendly formatting.',
      highlights: [
        'Developed live split-view editing with instant rendering and high-fidelity print-to-PDF output.',
        'Created extensible schema supporting work experience, education, skills, and custom sections.',
      ],
    },
    {
      id: 'proj-2',
      name: 'Microservice Metrics Monitor',
      techStack: 'Python, FastAPI, Prometheus, React',
      link: 'https://metrics-monitor.demo',
      githubUrl: 'https://github.com/alexmorgan/metrics-monitor',
      description: 'Real-time telemetry and health monitoring dashboard for microservices fleet.',
      highlights: [
        'Implemented WebSockets for live data streaming and event logging.',
        'Visualized system latencies across 15+ microservices with interactive charts.',
      ],
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuer: 'Amazon Web Services',
      date: '2023',
      url: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert-2',
      name: 'Meta Certified Frontend Developer',
      issuer: 'Meta',
      date: '2022',
      url: 'https://coursera.org/verify/meta-frontend',
    },
  ],
  customSections: [
    {
      id: 'sec-1',
      title: 'Honors & Awards',
      items: [
        {
          id: 'item-1',
          title: 'Engineering Excellence Award',
          subtitle: 'TechFlow Systems',
          date: '2023',
          description: 'Recognized for architecting high-throughput distributed messaging pipeline reducing cluster compute costs by 22%.',
        },
        {
          id: 'item-2',
          title: '1st Place Winner – CalHacks Hackathon',
          subtitle: 'UC Berkeley',
          date: '2018',
          description: 'Built an open-source voice-assisted campus navigation tool for visually impaired students.',
        },
      ],
    },
  ],
  declaration: {
    enabled: true,
    text: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
    place: 'San Francisco, CA',
    date: new Date().toISOString().split('T')[0],
    signatureType: 'draw',
    signatureImage: undefined,
    signerName: 'Alex Morgan',
  },
};

export const initialResumeSettings: ResumeSettings = {
  template: 'modern',
  primaryColor: '#2563eb', // royal blue
  fontFamily: 'sans',
  spacing: 'normal',
  visibleSections: {
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true,
    custom: true,
  },
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
};
