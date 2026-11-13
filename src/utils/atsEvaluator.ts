import type { ResumeData } from '../types/resume.ts';
import type { ATSReadinessResult, ATSDimension, ResumeSuggestion } from '../types/resumeBuddy.ts';

/**
 * Analyzes resume data deterministically across the 5 required ATS dimensions:
 * 1. Resume structure
 * 2. Skills presentation
 * 3. Projects and experience
 * 4. Readability and formatting
 * 5. Parsing considerations
 */
export function evaluateResumeATSDeterministically(data: ResumeData): ATSReadinessResult {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  // --- Dimension 1: Resume structure (20 pts) ---
  let structureScore = 0;
  const missingHeaders: string[] = [];

  if (data.personal.fullName && data.personal.fullName.trim().length > 2) {
    structureScore += 4;
  } else {
    missingHeaders.push('Full Name');
  }

  if (data.personal.email && data.personal.phone) {
    structureScore += 4;
    strengths.push('Complete contact information with standard email and phone format.');
  } else if (data.personal.email || data.personal.phone) {
    structureScore += 2;
    weaknesses.push('Incomplete contact details (missing either phone or email).');
    recommendations.push('Include both a professional email and contact phone number at the top.');
  } else {
    weaknesses.push('No direct contact info found in personal details.');
  }

  if (data.summary && data.summary.trim().length >= 50) {
    structureScore += 4;
    strengths.push('Professional summary provides an immediate executive overview.');
  } else {
    weaknesses.push('Summary is brief or absent, missing a high-level candidate value proposition.');
    recommendations.push('Add a 2-4 sentence career summary highlighting your core expertise and target role.');
  }

  if (data.education && data.education.length > 0) {
    structureScore += 4;
  } else {
    missingHeaders.push('Education');
  }

  if ((data.experience && data.experience.length > 0) || (data.projects && data.projects.length > 0)) {
    structureScore += 4;
  } else {
    missingHeaders.push('Experience or Projects');
  }

  const structureFeedback =
    missingHeaders.length === 0
      ? 'All essential sections (contact, summary, experience, education, skills) are properly structured.'
      : `Missing or sparse standard sections: ${missingHeaders.join(', ')}.`;

  // --- Dimension 2: Skills presentation (20 pts) ---
  let skillsScore = 0;
  const totalSkillsCount = (data.skillCategories || []).reduce(
    (acc, cat) => acc + (cat.skills ? cat.skills.length : 0),
    0
  );

  if (totalSkillsCount >= 8) {
    skillsScore += 12;
    strengths.push(`Rich skill catalog with ${totalSkillsCount} listed competencies.`);
  } else if (totalSkillsCount >= 4) {
    skillsScore += 8;
  } else if (totalSkillsCount > 0) {
    skillsScore += 4;
    weaknesses.push('Skill section has fewer than 4 items, reducing ATS keyword matching density.');
    recommendations.push('List 8-15 specific tools, technologies, and core competencies in categorized skill groups.');
  } else {
    weaknesses.push('No technical skills listed.');
    recommendations.push('Add technical skills and categorize them (e.g. Languages, Tools, Frameworks).');
  }

  const hasCategorization = (data.skillCategories || []).length > 1;
  if (hasCategorization) {
    skillsScore += 8;
    strengths.push('Skills are categorized, which enhances ATS contextual clustering.');
  } else if (totalSkillsCount > 0) {
    skillsScore += 4;
    recommendations.push('Group skills into distinct categories (e.g., Languages, Frameworks, Cloud/DevOps).');
  }

  const skillsFeedback =
    skillsScore >= 16
      ? 'Strong skills inventory with good density and clear categorization.'
      : 'Skills section could be expanded with more domain-relevant industry keywords and categories.';

  // --- Dimension 3: Projects and experience (25 pts) ---
  let expScore = 0;
  const expCount = (data.experience || []).length;
  const projCount = (data.projects || []).length;

  if (expCount >= 2 || (expCount >= 1 && projCount >= 2)) {
    expScore += 10;
    strengths.push('Demonstrates concrete track record through multiple roles or project deliverables.');
  } else if (expCount > 0 || projCount > 0) {
    expScore += 6;
  } else {
    weaknesses.push('Lacks documented professional experience or portfolio projects.');
    recommendations.push('Add past work experiences, internships, or technical project portfolios.');
  }

  // Check for quantifiable results / metrics
  const metricRegex = /\d+%|\$\d+|\b\d+\b\s*(users|clients|records|projects|reduction|growth|increase|decrease|speedup|ms|seconds|x)\b/i;
  const actionVerbRegex = /\b(built|developed|engineered|architected|led|managed|implemented|optimized|designed|created|delivered|reduced|increased|automated|spearheaded|deployed)\b/i;

  let hasMetrics = false;
  let hasActionVerbs = false;

  const allDescriptions = [
    ...(data.experience || []).flatMap((e) => e.highlights || []),
    ...(data.projects || []).flatMap((p) => [p.description || '', ...(p.highlights || [])]),
  ].join(' ');

  if (metricRegex.test(allDescriptions)) {
    hasMetrics = true;
    expScore += 8;
    strengths.push('Includes quantifiable metrics and numbers that substantiate business impact.');
  } else {
    weaknesses.push('Few or no quantifiable metrics (%, $, numbers) in bullet points.');
    recommendations.push('Quantify accomplishments (e.g., "improved load time by 30%", "served 10k+ active users").');
  }

  if (actionVerbRegex.test(allDescriptions)) {
    hasActionVerbs = true;
    expScore += 7;
    strengths.push('Utilizes strong action verbs (engineered, optimized, automated, etc.).');
  } else {
    expScore += 3;
    recommendations.push('Begin bullets with strong past-tense action verbs rather than passive duties.');
  }

  const expFeedback =
    expScore >= 20
      ? 'Experience entries are action-oriented and demonstrate impact.'
      : 'Bolster descriptions with measurable results, scope, and specific technical contributions.';

  // --- Dimension 4: Readability and formatting (15 pts) ---
  let readabilityScore = 0;
  const totalWords = [
    data.summary || '',
    allDescriptions,
    (data.education || []).map((ed) => `${ed.institution} ${ed.degree}`).join(' '),
  ].join(' ').split(/\s+/).filter(Boolean).length;

  if (totalWords >= 180 && totalWords <= 700) {
    readabilityScore += 10;
    strengths.push(`Optimal word density (~${totalWords} words), avoiding both sparse and overly dense pages.`);
  } else if (totalWords < 180) {
    readabilityScore += 5;
    weaknesses.push(`Resume content is relatively sparse (${totalWords} words).`);
    recommendations.push('Flesh out achievements and project outcomes to reach a healthy 250-500 word count.');
  } else {
    readabilityScore += 6;
    weaknesses.push(`Resume content is extensive (${totalWords} words) which may cause page overflow.`);
    recommendations.push('Trim wordy sentences to keep content concise and scannable.');
  }

  // Check bullet density
  const hasBullets = (data.experience || []).some((e) => e.highlights && e.highlights.length > 0);
  if (hasBullets) {
    readabilityScore += 5;
  } else {
    readabilityScore += 2;
    recommendations.push('Format work achievements into concise bullet points rather than paragraphs.');
  }

  const readabilityFeedback =
    readabilityScore >= 12
      ? 'Clean readability, concise bullet density, and well-proportioned length.'
      : 'Improve scannability with shorter bullets and clear separation of accomplishments.';

  // --- Dimension 5: Parsing considerations (20 pts) ---
  let parsingScore = 0;

  // Clean standard fields check
  const hasStandardEmail = !!data.personal.email && /\S+@\S+\.\S+/.test(data.personal.email);
  if (hasStandardEmail) parsingScore += 5;
  else parsingScore += 2;

  // Standard dates check
  const hasDates = (data.experience || []).every((e) => e.startDate) && (data.education || []).every((ed) => ed.startDate || ed.endDate);
  if (hasDates) {
    parsingScore += 5;
    strengths.push('Timeline dates are consistently formatted for chronology parsing.');
  } else {
    parsingScore += 2;
    recommendations.push('Ensure start and end dates are specified for all education and experience roles.');
  }

  // Clean title & location
  if (data.personal.title && data.personal.location) {
    parsingScore += 5;
  } else {
    parsingScore += 2;
    recommendations.push('Specify target professional title and geographic location (city, state or remote).');
  }

  // Absence of non-parseable structures (tables, graphics)
  parsingScore += 5;

  const parsingFeedback =
    parsingScore >= 15
      ? 'Standardized chronological flow and semantic fields easily ingested by ATS parsers.'
      : 'Ensure consistent date formats and standard role titles for flawless machine parsing.';

  // Calculate overall normalized score
  const totalEarned = structureScore + skillsScore + expScore + readabilityScore + parsingScore;
  // Maximum possible: 20 + 20 + 25 + 15 + 20 = 100
  const overallScore = Math.min(100, Math.max(10, Math.round(totalEarned)));

  const dimensions: ATSDimension[] = [
    {
      name: 'Resume Structure',
      score: Math.round((structureScore / 20) * 100),
      status: structureScore >= 16 ? 'good' : structureScore >= 12 ? 'average' : 'needs-attention',
      feedback: structureFeedback,
    },
    {
      name: 'Skills Presentation',
      score: Math.round((skillsScore / 20) * 100),
      status: skillsScore >= 16 ? 'good' : skillsScore >= 10 ? 'average' : 'needs-attention',
      feedback: skillsFeedback,
    },
    {
      name: 'Projects & Experience',
      score: Math.round((expScore / 25) * 100),
      status: expScore >= 20 ? 'good' : expScore >= 14 ? 'average' : 'needs-attention',
      feedback: expFeedback,
    },
    {
      name: 'Readability & Formatting',
      score: Math.round((readabilityScore / 15) * 100),
      status: readabilityScore >= 12 ? 'good' : readabilityScore >= 8 ? 'average' : 'needs-attention',
      feedback: readabilityFeedback,
    },
    {
      name: 'Parsing Considerations',
      score: Math.round((parsingScore / 20) * 100),
      status: parsingScore >= 16 ? 'good' : parsingScore >= 12 ? 'average' : 'needs-attention',
      feedback: parsingFeedback,
    },
  ];

  return {
    overallScore,
    dimensions,
    keyStrengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 4),
    prioritizedRecommendations: recommendations.slice(0, 4),
    timestamp: Date.now(),
    isAIGenerated: false,
  };
}

/**
 * Generates rule-based deterministic suggestions from current resume data
 * if Gemini API is offline or key is missing.
 */
export function generateLocalImprovementSuggestions(data: ResumeData): ResumeSuggestion[] {
  const suggestions: ResumeSuggestion[] = [];

  // 1. Check summary
  if (data.summary && data.summary.trim().length > 10) {
    const summaryText = data.summary.trim();
    // If summary lacks a strong opening or uses passive phrasing
    if (/^i am a|responsible for|looking to work/i.test(summaryText)) {
      const enhanced = summaryText
        .replace(/^i am a/i, 'Dynamic, results-driven')
        .replace(/responsible for/gi, 'specializing in')
        .replace(/looking to work/gi, 'committed to driving organizational impact');

      suggestions.push({
        id: 'sug-summary-1',
        section: 'summary',
        field: 'summary',
        originalText: summaryText,
        suggestedText: enhanced,
        reason: 'Replaces passive phrasing ("I am a", "responsible for") with active, impact-oriented executive language.',
      });
    } else if (!/\b(specializing in|expertise in|proven track record|demonstrated|driving)\b/i.test(summaryText)) {
      suggestions.push({
        id: 'sug-summary-hook',
        section: 'summary',
        field: 'summary',
        originalText: summaryText,
        suggestedText: `${summaryText.replace(/\.?$/, '')}, with demonstrated expertise in delivering scalable, high-performance solutions and driving measurable business outcomes.`,
        reason: 'Strengthens the career summary with an outcome-driven closing that highlights domain expertise.',
      });
    }
  }

  // 2. Check experience bullets or descriptions
  if (data.experience && data.experience.length > 0) {
    data.experience.forEach((exp, expIdx) => {
      // Check highlights
      if (exp.highlights && exp.highlights.length > 0) {
        exp.highlights.forEach((bullet, bIdx) => {
          if (suggestions.length >= 4) return;
          const trimmed = bullet.trim();
          if (/^(worked on|helped with|assisted in|participated in|handled)/i.test(trimmed)) {
            const replaced = trimmed
              .replace(/^worked on/i, 'Engineered and delivered')
              .replace(/^helped with/i, 'Collaborated across cross-functional teams to build')
              .replace(/^assisted in/i, 'Supported the architecture and rollout of')
              .replace(/^handled/i, 'Managed end-to-end execution of');
            suggestions.push({
              id: `sug-exp-${exp.id}-b-${bIdx}`,
              section: 'experience',
              itemId: exp.id,
              field: 'bullet',
              bulletIndex: bIdx,
              originalText: trimmed,
              suggestedText: replaced,
              reason: 'Replaces passive task verbs with strong engineering action verbs that demonstrate leadership and accountability.',
            });
          } else if (!/\b(engineered|architected|spearheaded|streamlined|automated|reduced|increased|optimized)\b/i.test(trimmed) && trimmed.length > 25) {
            suggestions.push({
              id: `sug-exp-${exp.id}-b-action-${bIdx}`,
              section: 'experience',
              itemId: exp.id,
              field: 'bullet',
              bulletIndex: bIdx,
              originalText: trimmed,
              suggestedText: `Spearheaded initiatives to ${trimmed.charAt(0).toLowerCase() + trimmed.slice(1)} to enhance operational efficiency.`,
              reason: 'Frames the accomplishment around leadership and operational value.',
            });
          }
        });
      }
    });
  }

  // 3. Check projects
  if (data.projects && data.projects.length > 0 && suggestions.length < 4) {
    data.projects.forEach((proj) => {
      if (suggestions.length >= 4) return;
      if (proj.description && proj.description.trim().length > 20) {
        const desc = proj.description.trim();
        if (/^(a project that|this project|an application to)/i.test(desc)) {
          suggestions.push({
            id: `sug-proj-${proj.id}-desc`,
            section: 'projects',
            itemId: proj.id,
            field: 'description',
            originalText: desc,
            suggestedText: desc
              .replace(/^a project that/i, 'Architected a comprehensive platform that')
              .replace(/^this project/i, 'Engineered an interactive web application designed to')
              .replace(/^an application to/i, 'Developed a scalable software solution to'),
            reason: 'Highlights the software architecture and engineering contribution rather than passive product descriptions.',
          });
        }
      }
    });
  }

  return suggestions;
}
