import { onBeforeUnmount, onMounted } from 'vue'

// Плавно показывает элементы с классом .reveal, когда они попадают в экран.
export function useReveal(rootRef) {
  let observer
  onMounted(() => {
    const root = rootRef?.value ?? document
    const items = root.querySelectorAll('.reveal')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'))
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            observer.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    items.forEach((el) => observer.observe(el))
  })
  onBeforeUnmount(() => observer?.disconnect())
}
