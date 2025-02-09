import Quiz from '@/components/Quiz';
import { Language, SUPPORTED_LANGUAGES } from '@/types/quiz';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Define correct params type for Next.js 13+ pages
interface PageProps {
  params: {
    lang: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

async function getQuizData(lang: Language) {
  try {
    // Dynamic import based on language
    const quizData = await import(`@/data/questions_${lang}.json`);
    return quizData.default;
  } catch (error) {
    console.error(`Failed to load quiz data for language: ${lang}`, error);
    return null;
  }
}

export default async function QuizPage({ params }: PageProps) {
  // Type guard for language
  if (!SUPPORTED_LANGUAGES.includes(params.lang as Language)) {
    notFound();
  }

  const lang = params.lang as Language;
  const quizData = await getQuizData(lang);

  if (!quizData) {
    notFound();
  }

  return (
    <div className="container">
      <Quiz quizData={quizData} lang={lang} />
    </div>
  );
}

// Generate static params for supported languages
export function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    lang,
  }));
} 