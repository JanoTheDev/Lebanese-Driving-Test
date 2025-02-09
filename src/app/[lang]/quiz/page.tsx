import Quiz from '@/components/Quiz';
import { Language, SUPPORTED_LANGUAGES, QuizData } from '@/types/quiz';
import { notFound } from 'next/navigation';

async function getQuizData(lang: Language): Promise<any> {
  try {
    const { questions } = await import(`@/data/questions_${lang}`);
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
    
    return (
      <div className="container">
        <Quiz quizData={quizData} lang={lang} />
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

export const dynamic = 'force-static';
export const revalidate = false; 