import { ResumeData } from './resume';

export type ATSDimensionStatus = 'good' | 'average' | 'needs-attention';

export interface ATSDimension {
  name: string;
  score: number; // 0 - 100
  status: ATSDimensionStatus;
  feedback: string;
}

export interface ATSReadinessResult {
  overallScore: number; // 0 - 100
  dimensions: ATSDimension[];
  keyStrengths: string[];
  weaknesses: string[];
  prioritizedRecommendations: string[];
  timestamp: number;
  isAIGenerated: boolean;
  configHelp?: string;
}

export interface ResumeSuggestion {
  id: string;
  section: 'summary' | 'experience' | 'projects';
  itemId?: string; // id of experience or project item
  field: 'summary' | 'description' | 'bullet';
  bulletIndex?: number;
  originalText: string;
  suggestedText: string;
  reason: string;
  applied?: boolean;
  dismissed?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'buddy' | 'user';
  text: string;
  timestamp: number;
  suggestions?: ResumeSuggestion[];
  atsResult?: ATSReadinessResult;
  isStale?: boolean;
  error?: string;
}

export type BuddyTab = 'chat' | 'ats' | 'improve';
