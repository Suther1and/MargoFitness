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
  },
  {
    id: "safety-basics",
    slug: "safety-basics",
    title: "Техника безопасности: как тренироваться дома без травм",
    description: "Разминка, обувь, дыхание, красные флаги. Простые привычки, которые защитят от 95% домашних травм и сделают каждую тренировку эффективнее.",
    category: "Тренировки",
    reading_time: 6,
    access_level: "free",
    image_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "habit-magic",
    slug: "habit-magic",
    title: "Магия привычек: как не бросить тренировки через неделю",
    description: "Почему сила воли не работает, как устроена петля привычки и 5 стратегий, которые помогут превратить тренировки из «надо» в часть жизни.",
    category: "Основы",
    reading_time: 8,
    access_level: "free",
    image_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "equipment-guide",
    slug: "equipment-guide",
    title: "Гид по оборудованию: как собрать домашний зал",
    description: "Полный список инвентаря MargoFitness — что купить обязательно, чем заменить, как выбрать вес гантелей и не переплатить.",
    category: "Основы",
    reading_time: 9,
    access_level: "basic",
    image_url: "https://images.unsplash.com/photo-1637666062717-1c6bcfa4a4df?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "womens-body-myths",
    slug: "womens-body-myths",
    title: "Мифы о женском теле: Почему ты не «перекачаешься»",
    description: "Разбираем главные страхи перед силовыми тренировками. Почему женская физиология не позволит стать похожей на мужчину и почему именно гантели делают тело упругим.",
    category: "Тренировки",
    reading_time: 7,
    access_level: "basic",
    image_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2070&auto=format&fit=crop"
  }
];
