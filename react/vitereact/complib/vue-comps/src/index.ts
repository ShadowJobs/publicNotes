import { App } from 'vue'
import Button from './Button.vue'
import Heading from './Heading'

export { Button, Heading }

export default {
  install: (app: App): void => {
    app.component('Button', Button)
    app.component('Heading', Heading)
  }
}