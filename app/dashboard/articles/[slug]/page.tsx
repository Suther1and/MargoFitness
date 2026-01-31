import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getArticleBySlug } from "@/lib/actions/articles";
import { ArticleRenderer } from "./article-renderer";
import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { Callout, ExpertTip, Checklist } from "@/components/articles/mdx-components";
import { InteractiveChart } from "@/components/articles/interactive-chart";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const TIER_WEIGHTS = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
};

const components = {
  Callout,
  ExpertTip,
  Checklist,
  InteractiveChart,
};

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Проверка доступа
  const userTierWeight = TIER_WEIGHTS[profile.subscription_tier as keyof typeof TIER_WEIGHTS] || 0;
  const articleTierWeight = TIER_WEIGHTS[article.access_level as keyof typeof TIER_WEIGHTS] || 0;

  const hasAccess = userTierWeight >= articleTierWeight;

  // Чтение и компиляция MDX
  let mdxContent = null;
  if (hasAccess) {
    try {
      const filePath = path.join(process.cwd(), "content/articles", `${slug}.mdx`);
      if (fs.existsSync(filePath)) {
        const source = fs.readFileSync(filePath, "utf8");
        const { content } = await compileMDX({
          source,
          components,
          options: { parseFrontmatter: true },
        });
        mdxContent = content;
      }
    } catch (error) {
      console.error("Error processing MDX:", error);
    }
  }

  return (
    <ArticleRenderer 
      article={article} 
      mdxContent={mdxContent} 
      hasAccess={hasAccess} 
      userTier={profile.subscription_tier}
    />
  );
}
