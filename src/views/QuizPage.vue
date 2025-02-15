<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Language, QuizData } from '../types/quiz'
import { SUPPORTED_LANGUAGES } from '../types/quiz'
import Quiz from '../components/Quiz.vue'
import { getQuestions } from '../data'

const route = useRoute()
const router = useRouter()
const quizData = ref<QuizData | null>(null)
const isLoading = ref(true)

onMounted(() => {
  isLoading.value = true
  const lang = route.params.lang as Language
  
  if (!SUPPORTED_LANGUAGES.includes(lang)) {
    router.push('/')
    return
  }

  try {
    const questions = getQuestions(lang)
    if (!questions || !questions.questions) {
      throw new Error('Invalid quiz data format')
    }
    quizData.value = questions
  } catch (error) {
    console.error(`Failed to load quiz data for language: ${lang}`, error)
    router.push('/')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="container">
    <div v-if="isLoading" class="loading">
      Loading...
    </div>
    <Quiz 
      v-else-if="quizData"
      :key="`quiz-${$route.params.lang}`"
      :quiz-data="quizData"
      :lang="$route.params.lang as Language"
    />
  </div>
</template> 