<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Language } from './types/quiz'

const theme = ref<'light' | 'dark'>('light')
const router = useRouter()

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.value = savedTheme as 'light' | 'dark'
    if (savedTheme === 'dark') {
      document.body.classList.add('dark')
    }
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'dark'
    document.body.classList.add('dark')
  }
})

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.body.classList.toggle('dark')
  localStorage.setItem('theme', theme.value)
}

const handleLanguageSelect = (lang: Language) => {
  router.push(`/${lang}/quiz`)
}
</script>

<template>
  <div class="container">
    <button 
      @click="toggleTheme" 
      class="theme-toggle"
      :aria-label="theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
    >
      <svg
        v-if="theme === 'light'"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
      </svg>
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>
    </button>

    <main class="main-container">
      <h1>Official Lebanese Driving Questions Test</h1>

      <div class="language-section">
        <p class="language-prompt">Choose a language</p>

        <div class="language-buttons">
          <button
            class="language-button"
            @click="handleLanguageSelect('en')"
          >
            English
          </button>
          <button
            class="language-button"
            @click="handleLanguageSelect('fr')"
          >
            Français
          </button>
          <button
            class="language-button"
            @click="handleLanguageSelect('ar')"
          >
            العربية
          </button>
        </div>
      </div>
    </main>

    <footer>
      <div class="attribution">
        <span>Made with ❤️ by </span>
        <a
          href="https://github.com/JanoTheDev"
          target="_blank"
          rel="noopener noreferrer"
        >
          JanoTheDev
        </a>
      </div>
      <div class="attribution">
        <span>Report issues on </span>
        <a
          href="https://github.com/JanoTheDev/Lebanese-Driving-Test"
          target="_blank"
          rel="noopener noreferrer"
        >
          Github
        </a>
      </div>
    </footer>
  </div>
</template>
