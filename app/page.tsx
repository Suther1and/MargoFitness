import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Calendar, Trophy, Star, Crown, Heart, TrendingUp, Users, Shield } from "lucide-react";

export default async function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Star className="size-4" />
            Онлайн-тренировки нового поколения
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            MargoFitness
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Достигайте своих фитнес-целей с персональными тренировками от профессионального тренера. 
            Новые программы каждую неделю!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                <Trophy className="size-5 mr-2" />
                Начать бесплатно
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Посмотреть тарифы
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-8 justify-center text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-primary" />
              <span>500+ участников</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-5 text-primary" />
              <span>Новый контент каждый понедельник</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <span>Без долгосрочных обязательств</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Почему выбирают нас</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Профессиональный подход к онлайн-тренировкам
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Dumbbell className="size-12 text-primary mb-4" />
                <CardTitle>Персональный подход</CardTitle>
                <CardDescription>
                  Каждая тренировка разработана с учетом различных уровней подготовки
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Calendar className="size-12 text-primary mb-4" />
                <CardTitle>Еженедельные обновления</CardTitle>
                <CardDescription>
                  Новые тренировки каждый понедельник. Всегда свежий и актуальный контент
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <TrendingUp className="size-12 text-primary mb-4" />
                <CardTitle>Отслеживание прогресса</CardTitle>
                <CardDescription>
                  Оценивайте каждую тренировку и следите за своими достижениями
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Heart className="size-12 text-primary mb-4" />
                <CardTitle>Забота о здоровье</CardTitle>
                <CardDescription>
                  Безопасные и эффективные программы от сертифицированного тренера
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Users className="size-12 text-primary mb-4" />
                <CardTitle>Сообщество</CardTitle>
                <CardDescription>
                  Присоединяйтесь к активному сообществу единомышленников
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Crown className="size-12 text-primary mb-4" />
                <CardTitle>Премиум качество</CardTitle>
                <CardDescription>
                  Профессиональные видео и детальные инструкции для каждого упражнения
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Выберите свой план</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Гибкие тарифы для любого уровня подготовки
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <Dumbbell className="size-10 text-primary mb-3" />
                <CardTitle className="text-2xl">Basic</CardTitle>
                <CardDescription className="text-lg font-semibold">2 тренировки в неделю</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ 4-6 упражнений в тренировке</li>
                  <li>✓ Еженедельное обновление</li>
                  <li>✓ Видео-инструкции</li>
                  <li>✓ Отслеживание прогресса</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative hover:shadow-lg transition-shadow border-2 border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                ПОПУЛЯРНЫЙ
              </div>
              <CardHeader>
                <Star className="size-10 text-primary mb-3" />
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription className="text-lg font-semibold">3 тренировки в неделю</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Всё из Basic</li>
                  <li>✓ Дополнительная тренировка</li>
                  <li>✓ Расширенные программы</li>
                  <li>✓ Приоритетная поддержка</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <Crown className="size-10 text-primary mb-3" />
                <CardTitle className="text-2xl">Elite</CardTitle>
                <CardDescription className="text-lg font-semibold">Всё включено</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Всё из Premium</li>
                  <li>✓ Эксклюзивные бонусы</li>
                  <li>✓ Персональные рекомендации</li>
                  <li>✓ VIP-поддержка</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                Подробнее о тарифах
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Готовы начать свой фитнес-путь?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Присоединяйтесь сегодня и получите доступ к бесплатным материалам
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Зарегистрироваться бесплатно
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
