// Кофейни для интерфейса: сырые данные → модели.
import { mapCafe } from '../domain/cafes/models'
import { cafesSource } from './cafesSource'

export { hoursText, openState } from '../domain/cafes/models'

export const cafes = cafesSource.map(mapCafe)
