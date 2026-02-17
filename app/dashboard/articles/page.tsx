import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getArticles } from "@/lib/actions/articles";
import { ArticlesList } from "./articles-list";
import { ARTICLE_REGISTRY } from "@/lib/config/articles";

export default async function ArticlesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  // Получаем статьи из БД
  const dbArticles = await getArticles();
  
  // Объединяем с хардкодными статьями из конфига
  // Используем Map для дедупликации по slug (хардкод имеет приоритет)
  const allArticlesMap = new Map();
  
  // Сначала добавляем из БД
  dbArticles.forEach(article => {
    allArticlesMap.set(article.slug, article);
  });
  
  // Затем перезаписываем/добавляем из хардкодного реестра
  ARTICLE_REGISTRY.forEach(article => {
    allArticlesMap.set(article.slug, {
      ...article,
      // Добавляем id если его нет в метаданных реестра, для совместимости с интерфейсом Article
      id: article.id || article.slug 
    });
  });

  const combinedArticles = Array.from(allArticlesMap.values());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Материалы</h1>
        <p className="text-gray-600">
          Эксклюзивные статьи, гайды и советы от Марго для вашего прогресса.
        </p>
      </div>

      <ArticlesList articles={combinedArticles} userTier={profile.subscription_tier} />
    </div>
  );
}
