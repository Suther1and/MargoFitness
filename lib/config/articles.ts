import { SubscriptionTier } from "@/types/database";

export interface ArticleMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  reading_time: number;
  access_level: SubscriptionTier;
  image_url?: string;
}

export const ARTICLE_REGISTRY: ArticleMetadata[] = [
  {
    id: "home-vs-gym",
    slug: "home-vs-gym",
    title: "Домашние тренировки VS Зал: почему это работает",
    description: "Разбираемся, почему домашние тренировки дают реальный результат и в чём их честное преимущество перед залом. Наука, практика, ноль мифов.",
    category: "Методика",
    reading_time: 6,
    access_level: "free",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "nutrition-basics",
    slug: "nutrition-basics",
    title: "Основы питания: 3 правила, чтобы начать меняться",
    description: "Без подсчёта калорий и сложных формул. Три фундаментальных принципа питания, которые реально работают и которые ты сможешь применить уже сегодня.",
    category: "Питание",
    reading_time: 7,
    access_level: "free",
    image_url: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2070&auto=format&fit=crop"
  }
];
