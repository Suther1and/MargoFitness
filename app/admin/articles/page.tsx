import { getAllArticlesAdmin } from "@/lib/actions/articles-admin";
import { ArticlesAdminClient } from "./articles-admin-client";

export default async function ArticlesAdminPage() {
  const articles = await getAllArticlesAdmin();

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление статьями</h1>
          <p className="text-gray-600">Создание, редактирование и публикация материалов.</p>
        </div>
      </div>

      <ArticlesAdminClient initialArticles={articles} />
    </div>
  );
}
