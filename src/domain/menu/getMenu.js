// Use case «получить меню»: маппинг DTO, отбор доступных категорий и порядок вывода.
// Сезонная категория, пока она активна, идёт первой; вне своего периода скрыта.
import { isCategoryAvailable, mapCategory } from './models'

export function getMenu(source, { now = new Date() } = {}) {
  return (source?.categories ?? [])
    .map(mapCategory)
    .filter((c) => c.items.length && isCategoryAvailable(c, now))
    .sort((a, b) => Number(b.isSeasonal) - Number(a.isSeasonal) || a.sort - b.sort)
}

// Фильтр по тегам: позиция должна иметь все выбранные теги. Пустые категории убираются.
export function filterMenuByTags(categories, tagIds = []) {
  if (!tagIds.length) return categories
  return categories
    .map((c) => ({ ...c, items: c.items.filter((i) => tagIds.every((t) => i.tagIds.includes(t))) }))
    .filter((c) => c.items.length)
}

export const allItems = (categories) => categories.flatMap((c) => c.items)

export const findItem = (categories, id) => allItems(categories).find((i) => i.id === id) ?? null
