<script setup lang="ts">
import { cn } from '@/lib/utils'
import {
  ProgressIndicator,
  ProgressRoot,
  type ProgressRootProps,
} from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = withDefaults(
  defineProps<ProgressRootProps & { class?: HTMLAttributes['class'] }>(),
  {
    modelValue: 0,
  },
)

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <ProgressRoot
    v-bind="delegatedProps"
    :class="
      cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800',
        props.class,
      )
    "
  >
    <ProgressIndicator
      class="h-full w-full flex-1 bg-zinc-900 transition-all dark:bg-zinc-50"
      :style="`transform: translateX(-${100 - (props.modelValue ?? 0)}%);`"
    />
  </ProgressRoot>
</template>
