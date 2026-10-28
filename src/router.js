import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { title: 'Будини Кофе · кофейня, которая разбудит' } },
    { path: '/menu', name: 'menu', component: () => import('./views/MenuView.vue'), meta: { title: 'Меню · Будини Кофе' } },
    { path: '/addresses', name: 'addresses', component: () => import('./views/AddressesView.vue'), meta: { title: 'Адреса · Будини Кофе' } },
    { path: '/order', name: 'order', component: () => import('./views/OrderView.vue'), meta: { title: 'Предзаказ · Будини Кофе' } },
    { path: '/bonus', name: 'bonus', component: () => import('./views/BonusView.vue'), meta: { title: 'Бонусы · Будини Кофе' } },
    { path: '/about', name: 'about', component: () => import('./views/AboutView.vue'), meta: { title: 'О нас · Будини Кофе' } },
    { path: '/events', name: 'events', component: () => import('./views/EventsView.vue'), meta: { title: 'События · Будини Кофе' } },
    { path: '/gift', name: 'gift', component: () => import('./views/GiftView.vue'), meta: { title: 'Подарочные сертификаты · Будини Кофе' } },
    { path: '/careers', name: 'careers', component: () => import('./views/CareersView.vue'), meta: { title: 'Вакансии · Будини Кофе' } },
    { path: '/contacts', name: 'contacts', component: () => import('./views/ContactsView.vue'), meta: { title: 'Контакты · Будини Кофе' } },
    { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('./views/NotFoundView.vue'), meta: { title: 'Страница не найдена · Будини Кофе' } },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    // ждём окончания перехода страницы, чтобы якорь уже был в DOM
    if (to.hash) {
      const delay = to.path === from.path ? 0 : 450
      return new Promise((resolve) => setTimeout(() => resolve({ el: to.hash, top: 96, behavior: 'smooth' }), delay))
    }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.meta.title) document.title = to.meta.title
})

export default router
