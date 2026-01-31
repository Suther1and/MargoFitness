import { getAllArticlesAdmin } from "@/lib/actions/articles-admin";
import ArticlesAdminClient from "./articles-admin-client";
import { getCurrentProfile } from "@/lib/actions/profile";
import { redirect } from "next/navigation";

export default async function ArticlesAdminPage() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  const articles = await getAllArticlesAdmin();

  return (
    <ArticlesAdminClient initialArticles={articles} />
  );
}
