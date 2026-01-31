"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, ExternalLink, Eye } from "lucide-react";
import { upsertArticle, deleteArticle } from "@/lib/actions/articles-admin";
import { useRouter } from "next/navigation";

interface Article {
  id?: string;
  title: string;
  description: string;
  slug: string;
  image_url: string;
  category: string;
  access_level: string;
  is_published: boolean;
  reading_time: number;
}

export const ArticlesAdminClient = ({ initialArticles }: { initialArticles: any[] }) => {
  const [articles, setArticles] = useState(initialArticles);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const articleData: Article = {
      id: currentArticle?.id,
      title: formData.get("title") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      image_url: formData.get("image_url") as string,
      category: formData.get("category") as string,
      access_level: formData.get("access_level") as string,
      reading_time: parseInt(formData.get("reading_time") as string),
      is_published: formData.get("is_published") === "on",
    };

    const result = await upsertArticle(articleData);
    if (result.success) {
      setIsDialogOpen(false);
      router.refresh();
      // В реальном приложении лучше обновить стейт или перезагрузить данные
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Вы уверены, что хотите удалить эту статью?")) {
      const result = await deleteArticle(id);
      if (result.success) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => {
          setCurrentArticle(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Добавить статью
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Card key={article.id} className="overflow-hidden">
            <div className="h-32 w-full bg-gray-100">
              {article.image_url && (
                <img src={article.image_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <CardHeader className="p-4">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{article.title}</CardTitle>
                <Badge variant={article.is_published ? "default" : "secondary"}>
                  {article.is_published ? "Публично" : "Черновик"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="mb-4 line-clamp-2 text-sm text-gray-600">{article.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{article.category}</Badge>
                <Badge variant="outline">{article.access_level.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/dashboard/articles/${article.slug}`} target="_blank">
                    <Eye className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setCurrentArticle(article);
                  setIsDialogOpen(true);
                }}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(article.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentArticle ? "Редактировать статью" : "Создать новую статью"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Заголовок</label>
                <Input name="title" defaultValue={currentArticle?.title} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug (путь)</label>
                <Input name="slug" defaultValue={currentArticle?.slug} required placeholder="sugar-and-weight-loss" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Описание (превью)</label>
              <Textarea name="description" defaultValue={currentArticle?.description} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL обложки</label>
              <Input name="image_url" defaultValue={currentArticle?.image_url} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Категория</label>
                <Input name="category" defaultValue={currentArticle?.category || "Питание"} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Уровень доступа</label>
                <select 
                  name="access_level" 
                  className="w-full rounded-md border p-2 text-sm"
                  defaultValue={currentArticle?.access_level || "free"}
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Время чтения (мин)</label>
                <Input name="reading_time" type="number" defaultValue={currentArticle?.reading_time || 5} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="is_published" 
                id="is_published"
                defaultChecked={currentArticle?.is_published} 
              />
              <label htmlFor="is_published" className="text-sm font-medium">Опубликовать</label>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
