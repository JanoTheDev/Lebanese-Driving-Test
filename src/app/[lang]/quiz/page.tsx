import Quiz from '@/components/Quiz';
import { Language, SUPPORTED_LANGUAGES, QuizData } from '@/types/quiz';
import { notFound } from 'next/navigation';

async function getQuizData(lang: Language): Promise<any> {
  try {
    const module = await import(`@/data/questions_${lang}`);
    // Ensure we're returning a stable reference
    const questions = module.default;
    if (!questions || !questions.questions) {
      throw new Error('Invalid quiz data format');
    }
    return questions;
  } catch (error) {
    console.error(`Failed to load quiz data for language: ${lang}`, error);
    throw error;
  }
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  
  if (!SUPPORTED_LANGUAGES.includes(resolvedParams.lang as Language)) {
    notFound();
  }

  const lang = resolvedParams.lang as Language;
  
  try {
    const quizData = await getQuizData(lang);
    
    // Use key prop to maintain component instance
    return (
      <div className="container">
        <Quiz 
          key={`quiz-${lang}`} 
          quizData={quizData} 
          lang={lang} 
        />
      </div>
    );
  } catch {
    notFound();
  }
}

export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    lang,
  }));
}

// Ensure static rendering
export const dynamic = 'force-static';
export const revalidate = false; 