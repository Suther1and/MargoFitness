import { TrackerSettings } from '../types'

/**
 * Проверяет наличие активных основных виджетов здоровья
 * 
 * Основные виджеты - это метрики здоровья из левой колонки:
 * вода, шаги, вес, кофеин, сон, настроение, питание
 * 
 * @param settings - Настройки трекера
 * @returns true если хотя бы один основной виджет включен
 * 
 * @example
 * ```ts
 * hasActiveMainWidgets(settings) // true если включена хотя бы одна метрика
 * ```
 */
export function hasActiveMainWidgets(settings: TrackerSettings): boolean {
  const mainHealthWidgets = ['water', 'steps', 'weight', 'caffeine', 'sleep', 'mood', 'nutrition']
  return mainHealthWidgets.some(id => settings.widgets[id as keyof typeof settings.widgets]?.enabled)
}

