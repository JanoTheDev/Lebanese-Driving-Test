<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getQuestions } from '../data'

interface Question {
  id: number
  question: string
  answers: string[]
  correctAnswer: string
  category: string
  imageUrl?: string
}

interface QuizData {
  questions: Question[]
}

interface Props {
  lang: 'en' | 'fr' | 'ar'
  quizData: QuizData
}

const props = defineProps<Props>()
const router = useRouter()

const currentQuestion = ref(0)
const userAnswers = ref<Record<number, string>>({})
const questions = ref<Question[]>([])
const isSubmitted = ref(false)
const score = ref<number | null>(null)
const showReview = ref(false)
const timeRemaining = ref(15 * 60)
const theme = ref<'light' | 'dark'>('light')

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
    backToQuiz: "Back to Quiz",
    passed: "Congratulations! You Passed!",
    failed: "Sorry, You Failed",
    minScore: "Minimum passing score is 26/30",
    returnHome: "Return Home",
    timeRemaining: "Time Remaining",
    timeUp: "Time's Up!",
    toggleDark: "Switch to dark mode",
    toggleLight: "Switch to light mode",
    madeBy: "Made with ❤️ by"
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
    backToQuiz: "Retour au Quiz",
    passed: "Félicitations! Vous avez réussi!",
    failed: "Désolé, vous avez échoué",
    minScore: "Le score minimum pour réussir est de 26/30",
    returnHome: "Retour à l'accueil",
    timeRemaining: "Temps Restant",
    timeUp: "Temps Écoulé!",
    toggleDark: "Passer en mode sombre",
    toggleLight: "Passer en mode clair",
    madeBy: "Créé avec ❤️ par"
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
    backToQuiz: "العودة إلى الاختبار",
    passed: "مبروك! لقد نجحت!",
    failed: "عذراً، لقد رسبت",
    minScore: "درجة النجاح ٢٦/٣٠",
    returnHome: "العودة للصفحة الرئيسية",
    timeRemaining: "الوقت المتبقي",
    timeUp: "انتهى الوقت!",
    toggleDark: "التبديل إلى الوضع الداكن",
    toggleLight: "التبديل إلى الوضع الفاتح",
    madeBy: "تم الإنشاء باستخدام ❤️ بواسطة"
  }
} as const

onMounted(() => {
  try {
    const module = getQuestions(props.lang)
    initializeQuestions(module)
    startTimer()
    loadTheme()
  } catch (error) {
    console.error('Failed to load questions:', error)
    router.push('/')
  }
})

const initializeQuestions = (localizedQuizData: QuizData) => {
  const signsQuestions = localizedQuizData.questions
    .filter(q => q.id >= 121 && q.id <= 221)
    .map(q => ({
      ...q,
      category: "Signs",
      imageUrl: `/images/signs/${q.id}.png`
    }))
  const selectedSigns = shuffleArray(signsQuestions).slice(0, 10)

  const safetyQuestions = localizedQuizData.questions.filter(q => q.category === "Safety")
  const selectedSafety = shuffleArray(safetyQuestions).slice(0, 10)

  const lawQuestions = localizedQuizData.questions.filter(q => q.category === "Law")
  const selectedLaw = shuffleArray(lawQuestions).slice(0, 10)

  questions.value = shuffleArray([...selectedSigns, ...selectedSafety, ...selectedLaw])
}

const startTimer = () => {
  const timer = setInterval(() => {
    if (timeRemaining.value <= 1) {
      clearInterval(timer)
      if (!isSubmitted.value) {
        handleSubmit()
      }
      timeRemaining.value = 0
    } else {
      timeRemaining.value--
    }
  }, 1000)
}

const loadTheme = () => {
  const savedTheme = localStorage.getItem("theme")
  if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    theme.value = "dark"
    document.body.classList.add("dark")
  }
}

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  return {
    minutes,
    seconds: seconds.toString().padStart(2, "0")
  }
}

const handleAnswer = (answer: string) => {
  const questionId = questions.value[currentQuestion.value].id
  if (userAnswers.value[questionId] === answer) {
    delete userAnswers.value[questionId]
  } else {
    userAnswers.value[questionId] = answer
  }
}

const goToQuestion = (index: number) => {
  if (!isSubmitted.value) {
    currentQuestion.value = index
  }
}

const calculateScore = () => {
  let correctAnswers = 0
  questions.value.forEach(question => {
    if (userAnswers.value[question.id] === question.correctAnswer) {
      correctAnswers++
    }
  })
  return correctAnswers
}

const handleSubmit = () => {
  score.value = calculateScore()
  isSubmitted.value = true
  timeRemaining.value = 0
}

const getAnswerClass = (question: Question, answer: string) => {
  if (!isSubmitted.value) return ""
  if (answer === question.correctAnswer) return "correct"
  if (userAnswers.value[question.id] === answer && answer !== question.correctAnswer) return "incorrect"
  return ""
}

const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light"
  document.body.classList.toggle("dark")
  localStorage.setItem("theme", theme.value)
}

const toggleReview = (show: boolean) => {
  showReview.value = show
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}
</script>

<template>
  <div v-if="isSubmitted && !showReview" class="quiz-results">
    <h2>{{ uiText[lang].score }}</h2>
    <div class="score">
      {{ score }} {{ uiText[lang].outOf }} {{ questions.length }}
    </div>
    <div class="result-message">
      <template v-if="(score ?? 0) >= 26">
        <p class="passed">{{ uiText[lang].passed }}</p>
      </template>
      <template v-else>
        <p class="failed">{{ uiText[lang].failed }}</p>
        <p class="min-score">{{ uiText[lang].minScore }}</p>
      </template>
    </div>
    <div class="result-buttons">
      <button class="review-button" @click="toggleReview(true)">
        {{ uiText[lang].review }}
      </button>
      <button class="home-button" @click="router.push('/')">
        {{ uiText[lang].returnHome }}
      </button>
    </div>
  </div>

  <div v-else-if="showReview" class="review-container">
    <h2>{{ uiText[lang].review }}</h2>
    <div class="score-display">
      {{ score }} {{ uiText[lang].outOf }} {{ questions.length }}
    </div>
    <div v-for="(question, index) in questions" :key="question.id" class="review-question">
      <h3>Question {{ index + 1 }}</h3>
      <div v-if="question.category === 'Signs' && question.imageUrl" class="question-image-container">
        <img :src="question.imageUrl" alt="Traffic Sign" class="question-image" />
      </div>
      <p>{{ question.question }}</p>
      <div class="review-answers">
        <div v-for="(answer, answerIndex) in question.answers" 
             :key="answerIndex"
             :class="['review-answer', getAnswerClass(question, answer)]">
          {{ answer }}
        </div>
      </div>
    </div>
    <button class="back-button" @click="toggleReview(false)">
      {{ uiText[lang].backToQuiz }}
    </button>
  </div>

  <div v-else :class="['quiz-container', { rtl: lang === 'ar' }]">
    <button @click="toggleTheme" 
            class="theme-toggle quiz-theme-toggle"
            :aria-label="theme === 'light' ? uiText[lang].toggleDark : uiText[lang].toggleLight">
      <svg v-if="theme === 'light'"
           xmlns="http://www.w3.org/2000/svg"
           fill="none"
           viewBox="0 0 24 24"
           stroke-width="1.5"
           stroke="currentColor"
           class="icon">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
      </svg>
      <svg v-else
           xmlns="http://www.w3.org/2000/svg"
           fill="none"
           viewBox="0 0 24 24"
           stroke-width="1.5"
           stroke="currentColor"
           class="icon">
        <path stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    </button>

    <div :class="['timer', { warning: timeRemaining <= 60 }]">
      <div class="timer-progress" :style="{ width: `${(timeRemaining / (15 * 60)) * 100}%` }" />
      <div class="timer-content">
        <h3>{{ uiText[lang].timeRemaining }}:</h3>
        <div class="time">
          {{ formatTime(timeRemaining).minutes }}:{{ formatTime(timeRemaining).seconds }}
        </div>
      </div>
    </div>

    <div class="question-navigation">
      <button v-for="(_, index) in questions"
              :key="index"
              @click="goToQuestion(index)"
              :class="['nav-button', 
                      { active: currentQuestion === index },
                      { answered: userAnswers[questions[index]?.id] }]">
        {{ index + 1 }}
      </button>
    </div>

    <div v-if="questions[currentQuestion]" class="question-container">
      <div class="question-header">
        <div class="question-category">
          {{ questions[currentQuestion].category }}
        </div>
        
        <div v-if="questions[currentQuestion].category === 'Signs' && questions[currentQuestion].imageUrl"
             class="question-image-container">
          <img :src="questions[currentQuestion].imageUrl"
               alt="Traffic Sign"
               class="question-image" />
        </div>

        <h2 class="question-text">
          {{ questions[currentQuestion].question }}
        </h2>
      </div>

      <div class="answers-container">
        <button v-for="(answer, index) in questions[currentQuestion].answers"
                :key="index"
                @click="handleAnswer(answer)"
                :class="['answer-button', 
                        { selected: userAnswers[questions[currentQuestion].id] === answer }]">
          {{ answer }}
        </button>
      </div>

      <div class="navigation-buttons">
        <button @click="goToQuestion(currentQuestion - 1)"
                :disabled="currentQuestion === 0"
                class="nav-button">
          {{ uiText[lang].previous }}
        </button>
        <button v-if="currentQuestion === questions.length - 1"
                @click="handleSubmit"
                class="submit-button"
                :disabled="Object.keys(userAnswers).length !== questions.length">
          {{ uiText[lang].submit }}
        </button>
        <button v-else
                @click="goToQuestion(currentQuestion + 1)"
                :disabled="currentQuestion === questions.length - 1"
                class="nav-button">
          {{ uiText[lang].next }}
        </button>
      </div>

      <div class="attribution">
        <span>{{ uiText[lang].madeBy }} </span>
        <a href="https://github.com/JanoTheDev"
           target="_blank"
           rel="noopener noreferrer">
          JanoTheDev
        </a>
      </div>
    </div>
  </div>
</template> 