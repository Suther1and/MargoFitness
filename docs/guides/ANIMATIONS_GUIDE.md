# Руководство по анимациям в Margo Fitness

Данный гайд описывает лучшие практики реализации анимаций, ориентированные на высокую производительность (Mobile-First) и плавность на устройствах любого уровня.

## 1. Главное правило: Не смешивайте CSS и JS анимации

Никогда не используйте Tailwind-классы `transition-all` или `duration-***` на элементах, которые анимируются через `framer-motion` (например, через пропсы `animate`, `whileHover`, `whileTap`).

**Почему?**
Браузер пытается одновременно применить два разных механизма анимации. Это приводит к мерцанию (flicker), дублированию кадров и "телепортации" элемента в конце анимации.

**Плохо:**
```tsx
<motion.button 
  whileTap={{ scale: 0.95 }}
  className="transition-all duration-300" // ОШИБКА: Конфликт!
>
```

**Хорошо:**
```tsx
<motion.button 
  whileTap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }} // Используйте Framer для всех фаз
>
```

## 2. Аппаратное ускорение (GPU)

Для мобильных устройств критически важно выносить анимации на видеокарту. Это освобождает основной поток (Main Thread) для логики React.

- Используйте класс `transform-gpu` на анимируемых элементах.
- Старайтесь анимировать только `transform` (scale, rotate, translate) и `opacity`. Изменение `width`, `height`, `top`, `left` — это "дорогие" операции.

## 3. Анимация высоты (Height: Auto)

Анимация высоты — одна из самых ресурсоемких. Чтобы она работала плавно:
1. Используйте `AnimatePresence`.
2. Обязательно указывайте `overflow-hidden`.
3. Используйте `type: 'spring'` с низким значением `bounce` или `duration`, чтобы избежать "прыжков" контента.

```tsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden transform-gpu"
    >
      {content}
    </motion.div>
  )}
</AnimatePresence>
```

## 4. Списки и Reordering

Для анимации списков всегда используйте связку `AnimatePresence` + `motion.div` с уникальными ключами. Для изменения порядка элементов идеально подходит компонент `Reorder` из `framer-motion`.

## 5. LayoutId (Magic Move)

Если элемент перемещается из одного контейнера в другой (например, индикатор активного таба), используйте `layoutId`. Это позволит Framer Motion автоматически вычислить траекторию и плавно переместить элемент, а не просто пересоздать его в новом месте.

```tsx
{isActive && (
  <motion.div layoutId="underline" className="absolute bottom-0 h-1 bg-white" />
)}
```

## 6. Чек-лист перед пушем:
1. [ ] Удалены все `transition-all` с анимируемых элементов.
2. [ ] Добавлен `transform-gpu`.
3. [ ] Проверено на iPhone (особенно Safari).
4. [ ] Используются стабильные `key` для всех элементов внутри `AnimatePresence`.

