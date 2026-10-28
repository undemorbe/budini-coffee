// Меню для интерфейса: сырые данные → use case getMenu (сезонность и порядок категорий).
// Когда появится бэкенд, сюда придёт ответ API вместо menuSource.
import { getMenu } from '../domain/menu/getMenu'
import { menuSource } from './menuSource'

export const menu = getMenu(menuSource)
