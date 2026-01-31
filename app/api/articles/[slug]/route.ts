import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { serialize } from "next-mdx-remote/serialize";
import { getCurrentProfile } from "@/lib/actions/profile";
import { getArticleBySlug } from "@/lib/actions/articles";

const TIER_WEIGHTS = {
  free: 0,
  basic: 1,
  pro: 2,
  elite: 3,
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const profile = await getCurrentProfile();

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const article = await getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    // Проверка доступа
    const userTierWeight = TIER_WEIGHTS[profile.subscription_tier as keyof typeof TIER_WEIGHTS] || 0;
    const articleTierWeight = TIER_WEIGHTS[article.access_level as keyof typeof TIER_WEIGHTS] || 0;

    if (userTierWeight < articleTierWeight) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const filePath = path.join(process.cwd(), "content/articles", `${slug}.mdx`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Content file not found" }, { status: 404 });
    }

    let source = fs.readFileSync(filePath, "utf8");
    
    // Удаляем заголовок H1, если он есть в начале файла (чтобы не дублировать с шапкой)
    source = source.replace(/^#\s+.+$/m, "");
    
    // Сериализуем MDX на сервере для передачи на клиент
    const mdxSource = await serialize(source, {
      parseFrontmatter: true,
    });
    
    return NextResponse.json({ source: mdxSource });
  } catch (error) {
    console.error("Error in articles API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
