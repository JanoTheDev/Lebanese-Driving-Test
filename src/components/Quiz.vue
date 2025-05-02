<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getQuestions } from '../data';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/toast';

interface Question {
	id: number;
	question: string;
	answers: string[];
	correctAnswer: string;
	category: string;
	imageUrl?: string;
}

interface QuizData {
	questions: Question[];
}

interface Props {
	lang: 'en' | 'fr' | 'ar';
	quizData: QuizData;
}

const props = defineProps<Props>();
const router = useRouter();

const currentQuestion = ref(0);
const userAnswers = ref<Record<number, string>>({});
const questions = ref<Question[]>([]);
const isSubmitted = ref(false);
const score = ref<number | null>(null);
const showReview = ref(false);
const timeRemaining = ref(15 * 60);
const theme = ref<'light' | 'dark'>('light');

const uiText = {
	en: {
		previous: 'Previous',
		next: 'Next',
		submit: 'Submit Quiz',
		score: 'Your Score',
		review: 'Review Answers',
		correct: 'Correct',
		incorrect: 'Incorrect',
		outOf: 'out of',
		backToQuiz: 'Back to Quiz',
		passed: 'Congratulations! You Passed!',
		failed: 'Sorry, You Failed',
		minScore: 'Minimum passing score is 26/30',
		returnHome: 'Return Home',
		timeRemaining: 'Time Remaining',
		timeUp: "Time's Up!",
		toggleDark: 'Switch to dark mode',
		toggleLight: 'Switch to light mode',
		madeBy: 'Made with ❤️ by',
		questionsLeft: 'Questions Left',
		answered: 'Answered',
		unanswered: 'Unanswered',
	},
	fr: {
		previous: 'Précédent',
		next: 'Suivant',
		submit: 'Terminer le Quiz',
		score: 'Votre Score',
		review: 'Revoir les Réponses',
		correct: 'Correct',
		incorrect: 'Incorrect',
		outOf: 'sur',
		backToQuiz: 'Retour au Quiz',
		passed: 'Félicitations! Vous avez réussi!',
		failed: 'Désolé, vous avez échoué',
		minScore: 'Le score minimum pour réussir est de 26/30',
		returnHome: "Retour à l'accueil",
		timeRemaining: 'Temps Restant',
		timeUp: 'Temps Écoulé!',
		toggleDark: 'Passer en mode sombre',
		toggleLight: 'Passer en mode clair',
		madeBy: 'Créé avec ❤️ par',
		questionsLeft: 'Questions Restantes',
		answered: 'Répondu',
		unanswered: 'Non Répondu',
	},
	ar: {
		previous: 'السابق',
		next: 'التالي',
		submit: 'إنهاء الاختبار',
		score: 'نتيجتك',
		review: 'مراجعة الإجابات',
		correct: 'صحيح',
		incorrect: 'خطأ',
		outOf: 'من',
		backToQuiz: 'العودة إلى الاختبار',
		passed: 'مبروك! لقد نجحت!',
		failed: 'عذراً، لقد رسبت',
		minScore: 'درجة النجاح ٢٦/٣٠',
		returnHome: 'العودة للصفحة الرئيسية',
		timeRemaining: 'الوقت المتبقي',
		timeUp: 'انتهى الوقت!',
		toggleDark: 'التبديل إلى الوضع الداكن',
		toggleLight: 'التبديل إلى الوضع الفاتح',
		madeBy: 'تم الإنشاء باستخدام ❤️ بواسطة',
		questionsLeft: 'الأسئلة المتبقية',
		answered: 'تم الإجابة',
		unanswered: 'لم يتم الإجابة',
	},
} as const;

const answeredQuestions = computed(() => {
	return Object.keys(userAnswers.value).length;
});

const unansweredQuestions = computed(() => {
	return questions.value.length - answeredQuestions.value;
});

onMounted(() => {
	try {
		const module = getQuestions(props.lang);
		initializeQuestions(module);
		startTimer();
		loadTheme();
	} catch (error) {
		console.error('Failed to load questions:', error);
		router.push('/');
	}
});

const initializeQuestions = (localizedQuizData: QuizData) => {
	const signsQuestions = localizedQuizData.questions
		.filter((q) => q.id >= 121 && q.id <= 221)
		.map((q) => ({
			...q,
			category: 'Signs',
			imageUrl: `/images/signs/${q.id}.png`,
		}));
	const selectedSigns = shuffleArray(signsQuestions).slice(0, 10);

	const safetyQuestions = localizedQuizData.questions.filter(
		(q) => q.category === 'Safety'
	);
	const selectedSafety = shuffleArray(safetyQuestions).slice(0, 10);

	const lawQuestions = localizedQuizData.questions.filter(
		(q) => q.category === 'Law'
	);
	const selectedLaw = shuffleArray(lawQuestions).slice(0, 10);

	questions.value = shuffleArray([
		...selectedSigns,
		...selectedSafety,
		...selectedLaw,
	]);
};

const startTimer = () => {
	const timer = setInterval(() => {
		if (timeRemaining.value <= 1) {
			clearInterval(timer);
			if (!isSubmitted.value) {
				handleSubmit();
			}
			timeRemaining.value = 0;
		} else {
			timeRemaining.value--;
		}
	}, 1000);
};

const loadTheme = () => {
	const savedTheme = localStorage.getItem('theme');
	if (
		savedTheme === 'dark' ||
		(!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
	) {
		theme.value = 'dark';
		document.body.classList.add('dark');
	}
};

const formatTime = (timeInSeconds: number) => {
	const minutes = Math.floor(timeInSeconds / 60);
	const seconds = timeInSeconds % 60;
	return {
		minutes,
		seconds: seconds.toString().padStart(2, '0'),
	};
};

const goToQuestion = (index: number) => {
	if (!isSubmitted.value) {
		currentQuestion.value = index;
	}
};

const calculateScore = () => {
	let correctAnswers = 0;
	questions.value.forEach((question) => {
		if (userAnswers.value[question.id] === question.correctAnswer) {
			correctAnswers++;
		}
	});
	return correctAnswers;
};

const handleSubmit = () => {
	score.value = calculateScore();
	isSubmitted.value = true;
	timeRemaining.value = 0;

	if (score.value >= 26) {
		toast({
			title: uiText[props.lang].passed,
			description: uiText[props.lang].minScore,
			variant: 'destructive',
		});
	} else {
		toast({
			title: uiText[props.lang].failed,
			description: uiText[props.lang].minScore,
			variant: 'destructive',
		});
	}
};

const getAnswerClass = (question: Question, answer: string) => {
	if (!isSubmitted.value) return '';
	if (answer === question.correctAnswer) return 'correct';
	if (
		userAnswers.value[question.id] === answer &&
		answer !== question.correctAnswer
	)
		return 'incorrect';
	return '';
};

const toggleTheme = () => {
	theme.value = theme.value === 'light' ? 'dark' : 'light';
	document.body.classList.toggle('dark');
	localStorage.setItem('theme', theme.value);
};

const toggleReview = (show: boolean) => {
	showReview.value = show;
};

function shuffleArray<T>(array: T[]): T[] {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}
</script>

<template>
	<div
		:class="[
			'min-h-screen flex flex-col items-center justify-center p-4',
			{ rtl: lang === 'ar' },
		]"
	>
		<Button
			@click="toggleTheme"
			variant="ghost"
			size="icon"
			class="fixed top-4 right-4 z-50"
			:aria-label="
				theme === 'light' ? uiText[lang].toggleDark : uiText[lang].toggleLight
			"
		>
			<Icon :name="theme === 'light' ? 'moon' : 'sun'" class="h-5 w-5" />
		</Button>

		<Card
			class="fixed top-4 left-4 right-4 mx-auto w-[calc(100%-2rem)] max-w-2xl z-40"
		>
			<CardContent class="p-4">
				<Progress
					:model-value="(timeRemaining / (15 * 60)) * 100"
					class="h-2"
				/>
				<div class="mt-2 flex items-center justify-between">
					<Label>{{ uiText[lang].timeRemaining }}:</Label>
					<Label class="font-bold">
						{{ formatTime(timeRemaining).minutes }}:{{
							formatTime(timeRemaining).seconds
						}}
					</Label>
				</div>
			</CardContent>
		</Card>

		<Card
			class="top-32 mt-20 w-full max-w-screen-sm p-4 bg-background border rounded-lg shadow-lg z-30"
		>
			<h3 class="text-lg font-semibold mb-4">
				{{ uiText[lang].questionsLeft }}: {{ unansweredQuestions }}
			</h3>
			<div class="grid grid-cols-12 gap-1">
				<Button
					v-for="(_, index) in questions"
					:key="index"
					@click="goToQuestion(index)"
					:variant="currentQuestion === index ? 'default' : 'outline'"
					:class="[
						'w-8 h-8 p-0 transition-all',
						{
							'bg-green-500 hover:bg-green-600 text-white':
								userAnswers[questions[index]?.id],
							'bg-gray-200 hover:bg-gray-300 text-gray-700':
								!userAnswers[questions[index]?.id],
							'ring-2 ring-primary': currentQuestion === index,
						},
					]"
				>
					{{ index + 1 }}
				</Button>
			</div>
			<div class="mt-4 text-sm">
				<span class="text-green-500">●</span> {{ uiText[lang].answered }}:
				{{ answeredQuestions }}
			</div>
			<div class="text-sm">
				<span class="text-gray-500">●</span> {{ uiText[lang].unanswered }}:
				{{ unansweredQuestions }}
			</div>
		</Card>

		<div v-if="isSubmitted && !showReview" class="quiz-results mt-4">
			<h2 class="text-2xl font-bold mb-4">{{ uiText[lang].score }}</h2>
			<div class="score text-4xl font-bold mb-4">
				{{ score }} {{ uiText[lang].outOf }} {{ questions.length }}
			</div>
			<div class="result-message mb-4">
				<template v-if="(score ?? 0) >= 26">
					<p class="text-green-500 text-xl font-semibold">
						{{ uiText[lang].passed }}
					</p>
				</template>
				<template v-else>
					<p class="text-red-500 text-xl font-semibold">
						{{ uiText[lang].failed }}
					</p>
					<p class="text-gray-600">{{ uiText[lang].minScore }}</p>
				</template>
			</div>
			<div class="result-buttons flex gap-4">
				<Button
					@click="toggleReview(true)"
					class="bg-blue-500 hover:bg-blue-600 text-white"
				>
					{{ uiText[lang].review }}
				</Button>
				<Button
					@click="router.push('/')"
					class="bg-gray-500 hover:bg-gray-600 text-white"
				>
					{{ uiText[lang].returnHome }}
				</Button>
			</div>
		</div>

		<div
			v-else-if="showReview"
			class="review-container w-full max-w-2xl p-4 mt-4"
		>
			<h2 class="text-2xl font-bold mb-4">{{ uiText[lang].review }}</h2>
			<div class="score-display text-xl font-bold mb-4">
				{{ score }} {{ uiText[lang].outOf }} {{ questions.length }}
			</div>
			<div
				v-for="(question, index) in questions"
				:key="question.id"
				class="review-question mb-6"
			>
				<h3 class="text-lg font-semibold mb-2">Question {{ index + 1 }}</h3>
				<div
					v-if="question.category === 'Signs' && question.imageUrl"
					class="question-image-container mb-4"
				>
					<img
						:src="question.imageUrl"
						alt="Traffic Sign"
						class="w-full rounded-lg"
					/>
				</div>
				<p class="text-lg font-semibold mb-2">{{ question.question }}</p>
				<div class="review-answers">
					<div
						v-for="(answer, answerIndex) in question.answers"
						:key="answerIndex"
						:class="[
							'review-answer p-2 rounded-lg mb-2',
							getAnswerClass(question, answer),
						]"
					>
						{{ answer }}
					</div>
				</div>
			</div>
			<Button
				@click="toggleReview(false)"
				class="bg-blue-500 hover:bg-blue-600 text-white"
			>
				{{ uiText[lang].backToQuiz }}
			</Button>
		</div>

		<div v-else class="quiz-container w-full max-w-2xl mt-4">
			<Card>
				<CardHeader>
					<CardTitle class="text-center">
						{{ questions[currentQuestion]?.category }}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div v-if="questions[currentQuestion]?.imageUrl" class="mb-4">
						<img
							:src="questions[currentQuestion]?.imageUrl"
							alt="Question Image"
							class="w-full rounded-lg"
						/>
					</div>

					<p class="text-lg font-semibold mb-4">
						{{ questions[currentQuestion]?.question }}
					</p>

					<RadioGroup v-model="userAnswers[questions[currentQuestion]?.id]">
						<div
							v-for="(answer, index) in questions[currentQuestion]?.answers"
							:key="index"
							class="mb-2"
						>
							<RadioGroupItem :value="answer" :id="`answer-${index}`" />
							<Label :for="`answer-${index}`" class="ml-2">{{ answer }}</Label>
						</div>
					</RadioGroup>
				</CardContent>
				<CardFooter class="flex justify-between">
					<Button
						@click="goToQuestion(currentQuestion - 1)"
						:disabled="currentQuestion === 0"
					>
						{{ uiText[lang].previous }}
					</Button>
					<Button
						v-if="currentQuestion === questions.length - 1"
						@click="handleSubmit"
						:disabled="Object.keys(userAnswers).length !== questions.length"
					>
						{{ uiText[lang].submit }}
					</Button>
					<Button
						v-else
						@click="goToQuestion(currentQuestion + 1)"
						:disabled="currentQuestion === questions.length - 1"
					>
						{{ uiText[lang].next }}
					</Button>
				</CardFooter>
			</Card>
		</div>

		<div class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
			<span>{{ uiText[lang].madeBy }} </span>
			<a
				href="https://github.com/JanoTheDev"
				target="_blank"
				rel="noopener noreferrer"
				class="underline"
			>
				JanoTheDev
			</a>
		</div>
	</div>
</template>

<style scoped>
.quiz-results {
	@apply text-center p-6 bg-white dark:bg-zinc-950/40 rounded-lg shadow-lg;
}

.review-container {
	@apply bg-white dark:bg-zinc-950/40 rounded-lg shadow-lg p-6;
}

.review-question {
	@apply bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg;
}

.review-answer {
	@apply bg-gray-100 dark:bg-zinc-600;
}

.correct {
	@apply bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100;
}

.incorrect {
	@apply bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100;
}
</style>
