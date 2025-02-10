import { createApp } from 'vue'
import './style.css'
import router from './router'
import RootApp from './RootApp.vue'

createApp(RootApp).use(router).mount('#app')
