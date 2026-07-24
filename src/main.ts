import App from '@/App.vue'
import pinia from '@/plugins/pinia'
import router from '@/plugins/router'
import vuetify from '@/plugins/vuetify'
import { createApp } from 'vue'

const app = createApp(App)

app.use(vuetify)
app.use(pinia)
app.use(router)

app.mount('#app')
