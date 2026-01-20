import { createApp } from 'vue'
import App from './App.vue'
import enrutador from './enrutador/indice'

const app = createApp(App)
app.use(enrutador)
app.mount('#app')
