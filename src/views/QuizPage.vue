<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Language, QuizData } from '../types/quiz';
import { SUPPORTED_LANGUAGES } from '../types/quiz';
import Quiz from '../components/Quiz.vue';
import { getQuestions } from '../data';

const route = useRoute();
const router = useRouter();
const quizData = ref<QuizData | null>(null);
const isLoading = ref(true);

onMounted(async () => {
	isLoading.value = true;
	const lang = route.params.lang as Language;

	if (!SUPPORTED_LANGUAGES.includes(lang)) {
		router.push('/');
		return;
	}

	try {
		const questions = await getQuestions(lang);
		if (!questions || !questions.questions) {
			throw new Error('Invalid quiz data format');
		}
		quizData.value = questions;
	} catch (error) {
		console.error(`Failed to load quiz data for language: ${lang}`, error);
		router.push('/');
	} finally {
		isLoading.value = false;
	}
});
</script>

<template>
	<div
		class="min-h-screen h-full flex flex-col justify-between mx-auto w-full dark:bg-zinc-900 bg-zinc-50"
	>
		<div v-if="isLoading" class="animate-pulse py-20 dark:text-white text-black font-light text-center">Loading...</div>
		<Quiz
			v-else-if="quizData"
			:key="`quiz-${$route.params.lang}`"
			:quiz-data="quizData"
			:lang="$route.params.lang as Language"
		/>
	</div>
</template>

