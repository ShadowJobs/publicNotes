import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import MyVue from "vue-comps"

const app = createApp(App)

app.use(router)
app.use(MyVue)

app.mount('#app')
