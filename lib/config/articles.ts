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
    id: "home-fitness-efficiency",
    slug: "home-fitness-efficiency",
    title: "Домашний фитнес: Как превратить 40 минут в результат, сопоставимый с залом",
    description: "Развенчиваем миф о том, что для крутого тела нужен зал. Научный подход к домашним тренировкам: от механики мышц до гормонального отклика.",
    category: "Методика",
    reading_time: 7,
    access_level: "free",
    image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
  }
];
