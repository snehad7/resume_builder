export interface MatchedKeyword {
  term: string;
  category: 'technical' | 'tool' | 'qualification' | 'domain' | 'soft-skill';
  foundInSections: string[]; // e.g. ['Skills', 'Projects', 'Experience']
  occurrencesInResume: number;
}

export interface MissingKeyword {
  term: string;
  category: 'technical' | 'tool' | 'qualification' | 'domain' | 'soft-skill';
  importance: 'high' | 'medium' | 'low';
  contextSnippet?: string; // where it was mentioned in the JD
}

export interface SectionMatch {
  sectionTitle: string;
  sectionId: string;
  matchingItems: {
    title: string;
    matchedKeywords: string[];
  }[];
}

export interface JobSuggestion {
  id: string;
  type: 'emphasize-project' | 'highlight-skill' | 'clarify-experience' | 'add-skill';
  title: string;
  description: string;
  targetSection: string;
  suggestedAction?: {
    type: 'add-skill';
    skillName: string;
    categoryName?: string;
  };
}

export interface JobMatchReport {
  id: string;
  analyzedAt: string;
  resumeTimestamp: number;
  jobTitle?: string;
  companyName?: string;
  matchPercentage: number;
  totalJobKeywordsCount: number;
  matchedCount: number;
  missingCount: number;
  matchedKeywords: MatchedKeyword[];
  missingKeywords: MissingKeyword[];
  relevantSections: SectionMatch[];
  suggestions: JobSuggestion[];
  experienceRequirements: string[];
  educationRequirements: string[];
}
