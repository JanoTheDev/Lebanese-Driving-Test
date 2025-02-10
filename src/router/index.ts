import { createRouter, createWebHistory } from 'vue-router'
import { SUPPORTED_LANGUAGES } from '../types/quiz'
import HomePage from '../App.vue'
import QuizPage from '../views/QuizPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/:lang/quiz',
      name: 'quiz',
      component: QuizPage,
      beforeEnter: (to, _from, next) => {
        const lang = to.params.lang as string
        if (!SUPPORTED_LANGUAGES.includes(lang as any)) {
          next('/')
          return
        }
        next()
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router 