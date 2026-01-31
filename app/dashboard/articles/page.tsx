import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getArticles } from "@/lib/actions/articles";
import { ArticlesList } from "./articles-list";

export default async function ArticlesPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  const articles = await getArticles();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Материалы</h1>
        <p className="text-gray-600">
          Эксклюзивные статьи, гайды и советы от Марго для вашего прогресса.
        </p>
      </div>

      <ArticlesList articles={articles} userTier={profile.subscription_tier} />
    </div>
  );
}
