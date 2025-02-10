import questionsEn from './questions_en.json'
import questionsFr from './questions_fr.json'
import questionsAr from './questions_ar.json'
import type { QuizData } from '../types/quiz'

const questions: Record<string, QuizData> = {
  en: questionsEn,
  fr: questionsFr,
  ar: questionsAr
}

export const getQuestions = (lang: string): QuizData => {
  return questions[lang]
} 