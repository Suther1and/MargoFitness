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
  },
  {
    id: "social-life-balance",
    slug: "social-life-balance",
    title: "Социальная жизнь и режим: рестораны, гости и отпуск без вреда",
    description: "Как совмещать тренировки, питание и нормальную социальную жизнь. Рестораны, алкоголь, праздники и отпуск — без жертв и чувства вины.",
    category: "Питание",
    reading_time: 9,
    access_level: "basic",
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "movement-basics",
    slug: "movement-basics",
    title: "Азбука движений: разбор главных упражнений MargoFitness",
    description: "6 базовых паттернов движения, вариации и точки контроля. Вводный гайд, после которого ты будешь понимать каждую тренировку.",
    category: "Тренировки",
    reading_time: 8,
    access_level: "basic",
    image_url: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "welcome-guide",
    slug: "welcome-guide",
    title: "Добро пожаловать в MargoFitness: твой личный план трансформации",
    description: "Полный гид по платформе — тренировки, трекер здоровья, тарифы, достижения, бонусы, интенсивы и марафоны. Всё, что нужно знать новому пользователю.",
    category: "Основы",
    reading_time: 15,
    access_level: "free",
    image_url: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "ration-constructor",
    slug: "ration-constructor",
    title: "Конструктор рациона: как считать КБЖУ и не сойти с ума",
    description: "Практический гайд по подсчёту макронутриентов — формулы, инструменты (FatSecret, CalAI), типичные ошибки и правило 80/20, которое спасёт от фанатизма.",
    category: "Питание",
    reading_time: 8,
    access_level: "basic",
    image_url: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=2080&auto=format&fit=crop"
  },
  {
    id: "supplements-guide",
    slug: "supplements-guide",
    title: "Гид по добавкам: что реально работает и стоит ли тратить деньги",
    description: "Научный разбор БАДов и спортпита без маркетинга. Витамин D, Омега-3, креатин, протеин, коллаген — конкретные дозировки, бренды и ссылки.",
    category: "Биохакинг",
    reading_time: 12,
    access_level: "pro",
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "lab-control",
    slug: "lab-control",
    title: "Лабораторный контроль: какие анализы важны для женщины в фитнесе",
    description: "Какие анализы сдавать, как читать результаты и почему лабораторные нормы — не то же самое, что оптимум. Приборная панель твоего тела.",
    category: "Биохакинг",
    reading_time: 10,
    access_level: "pro",
    image_url: "https://images.unsplash.com/photo-1579165466741-7f35e4755660?q=80&w=2070&auto=format&fit=crop"
  }
];
