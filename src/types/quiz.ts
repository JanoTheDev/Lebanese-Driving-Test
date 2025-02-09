export interface Question {
  id: number;
  category: string;
  question: string;
  answers: string[];
  correctAnswer: string;
  imageUrl?: string; // Optional image URL for Signs category
}

export interface QuizData {
  questions: Question[];
}

export interface UserAnswers {
  [questionId: number]: string;
}

export type Language = 'en' | 'fr' | 'ar';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'ar']; 