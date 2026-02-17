import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getArticleBySlug } from "@/lib/actions/articles";
import { ArticleRenderer } from "./article-renderer";
import fs from "fs";
import path from "path";
import { ARTICLE_REGISTRY } from "@/lib/config/articles";
import dynamic from "next/dynamic";

// Динамический импорт хардкодных статей
const HardcodedArticles: Record<string, any> = {
  "home-fitness-efficiency": dynamic(() => import("@/components/articles/content/HomeFitnessEfficiency")),
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TIER_WEIGHTS = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  // 1. Сначала ищем в реестре хардкодных статей
  const hardcodedMeta = ARTICLE_REGISTRY.find(a => a.slug === slug);
  const HardcodedComponent = HardcodedArticles[slug];

  // 2. Если нет в реестре, ищем в БД (для старых/других статей)
  const dbArticle = !hardcodedMeta ? await getArticleBySlug(slug) : null;

  const article = hardcodedMeta || dbArticle;

  if (!article) {
    notFound();
  }

  // Проверка доступа
  const userTierWeight = TIER_WEIGHTS[profile.subscription_tier as keyof typeof TIER_WEIGHTS] || 0;
  const articleTierWeight = TIER_WEIGHTS[article.access_level as keyof typeof TIER_WEIGHTS] || 0;
  const hasAccess = userTierWeight >= articleTierWeight;

  // 3. Если это хардкодная статья
  if (HardcodedComponent && hasAccess) {
    return <HardcodedComponent />;
  }

  // 4. Fallback для старых статей (если остались в БД, но нет хардкода)
  return (
    <ArticleRenderer 
      article={article} 
      mdxContent={null} 
      hasAccess={hasAccess} 
      userTier={profile.subscription_tier}
    />
  );
}
