import { defineComponent, h } from 'vue'

export interface HeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  text: string
}

export default defineComponent({
  name: 'Heading',
  props: {
    level: {
      type: Number,
      default: 1,
      validator: (value: number) => value >= 1 && value <= 6
    },
    text: {
      type: String,
      required: true
    }
  },
  setup(props: HeadingProps) {
    return () => h(`h${props.level}`, props.text)
  }
})