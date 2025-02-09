"use client";
import { useState, useEffect, useRef } from "react";
import { Question, QuizData, UserAnswers, Language } from "@/types/quiz";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface QuizProps {
  quizData: QuizData;
  lang: Language;
}

const uiText = {
  en: {
    previous: "Previous",
    next: "Next",
    submit: "Submit Quiz",
    score: "Your Score",
    review: "Review Answers",
    correct: "Correct",
    incorrect: "Incorrect",
    outOf: "out of",
    yourAnswer: "Your answer",
    correctAnswer: "Correct answer",
    backToQuiz: "Back to Quiz",
    passed: "Congratulations! You Passed!",
    failed: "Sorry, You Failed",
    minScore: "Minimum passing score is 26/30",
    returnHome: "Return Home",
    timeRemaining: "Time Remaining",
    timeUp: "Time's Up!",
    minutes: "minutes",
    seconds: "seconds",
    toggleDark: "Switch to dark mode",
    toggleLight: "Switch to light mode",
    madeBy: "Made with ❤️  by",
  },
  fr: {
    previous: "Précédent",
    next: "Suivant",
    submit: "Terminer le Quiz",
    score: "Votre Score",
    review: "Revoir les Réponses",
    correct: "Correct",
    incorrect: "Incorrect",
    outOf: "sur",
    yourAnswer: "Votre réponse",
    correctAnswer: "Bonne réponse",
    backToQuiz: "Retour au Quiz",
    passed: "Félicitations! Vous avez réussi!",
    failed: "Désolé, vous avez échoué",
    minScore: "Le score minimum pour réussir est de 26/30",
    returnHome: "Retour à l'accueil",
    timeRemaining: "Temps Restant",
    timeUp: "Temps Écoulé!",
    minutes: "minutes",
    seconds: "secondes",
    toggleDark: "Passer en mode sombre",
    toggleLight: "Passer en mode clair",
    madeBy: "Créé avec ❤️ par",
  },
  ar: {
    previous: "السابق",
    next: "التالي",
    submit: "إنهاء الاختبار",
    score: "نتيجتك",
    review: "مراجعة الإجابات",
    correct: "صحيح",
    incorrect: "خطأ",
    outOf: "من",
    yourAnswer: "إجابتك",
    correctAnswer: "الإجابة الصحيحة",
    backToQuiz: "العودة إلى الاختبار",
    passed: "مبروك! لقد نجحت!",
    failed: "عذراً، لقد رسبت",
    minScore: "درجة النجاح ٢٦/٣٠",
    returnHome: "العودة للصفحة الرئيسية",
    timeRemaining: "الوقت المتبقي",
    timeUp: "انتهى الوقت!",
    minutes: "دقيقة",
    seconds: "ثانية",
    toggleDark: "التبديل إلى الوضع الداكن",
    toggleLight: "التبديل إلى الوضع الفاتح",
    madeBy: "تم الإنشاء باستخدام ❤️ بواسطة", 
  },
} as const;

export default function Quiz({ quizData, lang }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const questionsRef = useRef<Question[]>([]);
  const userAnswersRef = useRef<UserAnswers>({});

  useEffect(() => {
    if (questionsRef.current.length === 0) {
      // Get signs questions (121-221)
      const signsQuestions = quizData.questions.filter(
        (q) => q.id >= 121 && q.id <= 221
      );
      const signQuestionsWithCategory = signsQuestions.map((q) => ({
        ...q,
        category: "Signs",
        imageUrl: `/images/signs/${q.id}.png`,
      }));
      const selectedSigns = shuffleArray(signQuestionsWithCategory).slice(0, 10);

      // Get Safety questions
      const safetyQuestions = quizData.questions.filter(
        (q) => q.category === "Safety"
      );
      const selectedSafety = shuffleArray(safetyQuestions).slice(0, 10);

      // Get Law questions
      const lawQuestions = quizData.questions.filter(
        (q) => q.category === "Law"
      );
      const selectedLaw = shuffleArray(lawQuestions).slice(0, 10);

      // Combine all selected questions
      const allSelectedQuestions = [...selectedSigns, ...selectedSafety, ...selectedLaw];
      
      // Shuffle the combined questions
      questionsRef.current = shuffleArray(allSelectedQuestions);
      
      setQuestions(questionsRef.current);
    }
  }, [quizData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!isSubmitted) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setTheme("dark");
      document.body.classList.add("dark");
    }
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return {
      minutes,
      seconds: seconds.toString().padStart(2, "0"),
    };
  };

  const handleAnswer = (answer: string) => {
    setUserAnswers((prev) => {
      const newAnswers = { ...prev };
      if (newAnswers[questions[currentQuestion].id] === answer) {
        delete newAnswers[questions[currentQuestion].id];
      } else {
        newAnswers[questions[currentQuestion].id] = answer;
      }
      userAnswersRef.current = newAnswers;
      return newAnswers;
    });
  };

  const goToQuestion = (index: number) => {
    if (!isSubmitted) {
      setCurrentQuestion(index);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questionsRef.current.forEach((question) => {
      if (userAnswersRef.current[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    console.log('Calculated score:', correctAnswers);
    return correctAnswers;
  };

  const handleSubmit = () => {
    if (calculatedScore === null) {
      const finalScore = calculateScore();
      console.log('Setting final score:', finalScore);
      setCalculatedScore(finalScore);
      setScore(finalScore);
    }
    setIsSubmitted(true);
    setTimeRemaining(0);
  };

  const getAnswerClass = (question: Question, answer: string) => {
    if (!isSubmitted) return "";

    if (answer === question.correctAnswer) {
      return "correct";
    }
    if (
      userAnswers[question.id] === answer &&
      answer !== question.correctAnswer
    ) {
      return "incorrect";
    }
    return "";
  };

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      setTheme("light");
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleReview = (show: boolean) => {
    setShowReview(show);
  };

  if (isSubmitted && !showReview) {
    console.log('Rendering results with score:', calculatedScore);
    return (
      <div className="quiz-results">
        <h2>{uiText[lang].score}</h2>
        <div className="score">
          {calculatedScore ?? 0} {uiText[lang].outOf} {questions.length}
        </div>
        <div className="result-message">
          {(calculatedScore ?? 0) >= 26 ? (
            <p className="passed">{uiText[lang].passed}</p>
          ) : (
            <>
              <p className="failed">{uiText[lang].failed}</p>
              <p className="min-score">{uiText[lang].minScore}</p>
            </>
          )}
        </div>
        <div className="result-buttons">
          <button className="review-button" onClick={() => toggleReview(true)}>
            {uiText[lang].review}
          </button>
          <button
            className="home-button"
            onClick={() => (window.location.href = "/")}
          >
            {uiText[lang].returnHome}
          </button>
        </div>
      </div>
    );
  }

  if (showReview) {
    return (
      <div className="review-container">
        <h2>{uiText[lang].review}</h2>
        <div className="score-display">
          {calculatedScore ?? 0} {uiText[lang].outOf} {questions.length}
        </div>
        {questions.map((question, index) => (
          <div key={question.id} className="review-question">
            <h3>Question {index + 1}</h3>

            {question.category === "Signs" && question.imageUrl && (
              <div className="question-image-container">
                <Image
                  src={question.imageUrl}
                  alt="Traffic Sign"
                  width={200}
                  height={200}
                  className="question-image"
                  priority
                />
              </div>
            )}

            <p>{question.question}</p>
            <div className="review-answers">
              {question.answers.map((answer, answerIndex) => (
                <div
                  key={answerIndex}
                  className={`review-answer ${getAnswerClass(question, answer)}`}
                >
                  {answer}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="back-button" onClick={() => toggleReview(false)}>
          {uiText[lang].backToQuiz}
        </button>
      </div>
    );
  }

  return (
    <div className={`quiz-container ${lang === "ar" ? "rtl" : ""}`}>
      <button
        onClick={toggleTheme}
        className="theme-toggle quiz-theme-toggle"
        aria-label={
          theme === "light" ? uiText[lang].toggleDark : uiText[lang].toggleLight
        }
      >
        {theme === "light" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
        )}
      </button>

      <div className={`timer ${timeRemaining <= 60 ? "warning" : ""}`}>
        <div
          className="timer-progress"
          style={{
            width: `${(timeRemaining / (15 * 60)) * 100}%`,
          }}
        />
        <div className="timer-content">
          <h3>{uiText[lang].timeRemaining}:</h3>
          <div className="time">
            {formatTime(timeRemaining).minutes}:
            {formatTime(timeRemaining).seconds}
          </div>
        </div>
      </div>

      <div className="question-navigation">
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => goToQuestion(index)}
            className={`nav-button ${currentQuestion === index ? "active" : ""} 
                      ${userAnswers[questions[index]?.id] ? "answered" : ""}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {questions[currentQuestion] && (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="question-container"
          >
            <div className="question-header">
              <div className="question-category">
                {questions[currentQuestion].category}
              </div>
              
              {questions[currentQuestion].category === "Signs" &&
                questions[currentQuestion].imageUrl && (
                  <div className="question-image-container">
                    <Image
                      src={questions[currentQuestion].imageUrl}
                      alt="Traffic Sign"
                      width={200}
                      height={200}
                      className="question-image"
                      priority
                    />
                  </div>
              )}

              <h2 className="question-text">
                {questions[currentQuestion].question}
              </h2>
            </div>

            <div className="answers-container">
              {questions[currentQuestion].answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(answer)}
                  className={`answer-button ${
                    userAnswers[questions[currentQuestion].id] === answer
                      ? "selected"
                      : ""
                  }`}
                >
                  {answer}
                </button>
              ))}
            </div>

            <div className="navigation-buttons">
              <button
                onClick={() => goToQuestion(currentQuestion - 1)}
                disabled={currentQuestion === 0}
                className="nav-button"
              >
                {uiText[lang].previous}
              </button>
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="submit-button"
                  disabled={
                    Object.keys(userAnswers).length !== questions.length
                  }
                >
                  {uiText[lang].submit}
                </button>
              ) : (
                <button
                  onClick={() => goToQuestion(currentQuestion + 1)}
                  disabled={currentQuestion === questions.length - 1}
                  className="nav-button"
                >
                  {uiText[lang].next}
                </button>
              )}
            </div>

            <div className="attribution">
              <span>{uiText[lang].madeBy} </span>
              <a
                href="https://github.com/JanoTheDev"
                target="_blank"
                rel="noopener noreferrer"
              >
                JanoTheDev
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
