"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Clock, 
  Edit2, 
  Trash2, 
  Eye, 
  ArrowLeft,
  Globe,
  Loader2,
  ChevronRight,
  EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { upsertArticle, deleteArticle } from "@/lib/actions/articles-admin";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  description: string;
  slug: string;
  image_url: string;
  category: string;
  access_level: "free" | "basic" | "pro" | "elite";
  is_published: boolean;
  reading_time: number;
  created_at: string;
}

interface ArticlesAdminClientProps {
  initialArticles: Article[];
}

const TIER_COLORS = {
  free: "text-emerald-400 border-emerald-400/30 bg-emerald-500/10",
  basic: "text-cyan-400 border-cyan-400/30 bg-cyan-500/10",
  pro: "text-purple-400 border-purple-400/30 bg-purple-500/10",
  elite: "text-amber-400 border-amber-400/30 bg-amber-500/10",
};

export default function ArticlesAdminClient({ initialArticles }: ArticlesAdminClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const filteredArticles = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!editingArticle?.title || !editingArticle?.slug) return;

    setIsLoading(true);
    try {
      const result = await upsertArticle(editingArticle);
      if (result.success) {
        setIsDialogOpen(false);
        setEditingArticle(null);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту статью?")) return;

    try {
      const result = await deleteArticle(id);
      if (result.success) {
        setArticles(articles.filter((a) => a.id !== id));
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (article: Article | null) => {
    setEditingArticle(
      article || {
        title: "",
        slug: "",
        description: "",
        image_url: "",
        category: "Общее",
        access_level: "free",
        is_published: false,
        reading_time: 5,
      }
    );
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-10 py-6">
      {/* Header - EXACTLY like Weeks management */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link 
            href="/admin" 
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            <span>Назад в панель</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white font-oswald uppercase">
            Материалы
          </h1>
          <p className="mt-2 text-white/60">
            Управление экспертными статьями и базой знаний
          </p>
        </div>
        
        <Button 
          onClick={() => openEdit(null)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20"
        >
          <Plus className="size-4" />
          Создать статью
        </Button>
      </div>

      {/* Stats Summary - EXACTLY like Weeks management */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Всего статей', value: articles.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Опубликовано', value: articles.filter(a => a.is_published).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Черновики', value: articles.filter(a => !a.is_published).length, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <div key={i} className="relative overflow-hidden rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${stat.bg} blur-2xl pointer-events-none`} />
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-2">{stat.label}</p>
            <div className="text-3xl font-bold font-oswald text-white">{stat.value}</div>
          </div>
        ))}
        
        {/* Search Box - Fixed focus ring and styling */}
        <div className="relative group rounded-3xl bg-white/[0.04] ring-1 ring-white/10 p-6 flex flex-col justify-center transition-all hover:ring-white/20">
          <Search className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-orange-400 transition-colors" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-2">Быстрый поиск</p>
          <input
            placeholder="Найти статью..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none p-0 text-white placeholder:text-white/20 focus:ring-0 text-sm font-medium outline-none"
          />
        </div>
      </div>

      {/* Articles List */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="size-5 text-orange-400" />
          <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Библиотека материалов</h2>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="grid gap-6">
            {filteredArticles.map((article) => (
              <section 
                key={article.id} 
                className={cn(
                  "group relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 transition-all hover:ring-white/20",
                  !article.is_published && "opacity-80"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br via-transparent to-transparent pointer-events-none",
                  article.is_published ? "from-emerald-500/5" : "from-orange-500/5"
                )} />
                
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                    {/* Content */}
                    <div className="flex-1 space-y-4 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60">
                          <Clock className="size-3" />
                          {article.reading_time} мин
                        </div>
                        {article.is_published ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest ring-1 ring-emerald-500/30">
                            <Globe className="size-3" /> Опубликовано
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest ring-1 ring-orange-500/30">
                            <EyeOff className="size-3" /> Черновик
                          </span>
                        )}
                        <Badge className={cn("text-[10px] font-bold uppercase tracking-widest border-none", TIER_COLORS[article.access_level])}>
                          {article.access_level}
                        </Badge>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                          {article.category}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white font-oswald uppercase tracking-tight mb-2 group-hover:text-orange-300 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-white/50 text-sm leading-relaxed max-w-3xl line-clamp-2">
                          {article.description || 'Описание отсутствует'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-white/30">
                        <span>Создано: {new Date(article.created_at).toLocaleDateString('ru-RU')}</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span>Slug: {article.slug}</span>
                      </div>
                    </div>
                    
                    {/* Actions - EXACTLY like Weeks management */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 min-w-[200px]">
                      <Link href={`/dashboard?tab=workouts&article=${article.slug}`} className="w-full">
                        <Button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20">
                          <Eye className="size-4" />
                          Управление
                          <ChevronRight className="size-4" />
                        </Button>
                      </Link>
                      <div className="flex gap-2 w-full">
                        <Button
                          variant="ghost"
                          onClick={() => openEdit(article)}
                          className="flex-1 bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95 rounded-xl py-2.5"
                        >
                          <Edit2 className="size-4 mr-2" /> Изменить
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(article.id)}
                          className="bg-white/5 border border-white/10 text-white/40 hover:text-rose-400 transition-all active:scale-95 rounded-xl py-2.5"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-[2rem] bg-white/[0.04] ring-1 ring-white/10 p-20 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="p-6 rounded-full bg-white/5 ring-1 ring-white/10">
                <BookOpen className="size-12 text-white/20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white font-oswald uppercase tracking-tight">Статей нет</h3>
                <p className="text-white/40 max-w-sm mx-auto">Создайте первую экспертную статью для базы знаний.</p>
              </div>
              <Button onClick={() => openEdit(null)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8">
                Создать статью
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#0c0c0e] border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-oswald uppercase tracking-tight text-white mb-6">
              {editingArticle?.id ? "Редактировать статью" : "Новая статья"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Название</Label>
                <Input
                  value={editingArticle?.title || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl text-white py-6"
                  placeholder="Как сахар мешает похудению"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Slug (ID в URL)</Label>
                <Input
                  value={editingArticle?.slug || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl text-white py-6"
                  placeholder="sugar-and-weight-loss"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Описание</Label>
              <Textarea
                value={editingArticle?.description || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, description: e.target.value })}
                className="bg-white/5 border-white/10 rounded-xl text-white min-h-[100px] py-4"
                placeholder="Краткое описание для карточки..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Категория</Label>
                <Input
                  value={editingArticle?.category || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                  className="bg-white/5 border-white/10 rounded-xl text-white py-6"
                  placeholder="Питание"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Время чтения (мин)</Label>
                <Input
                  type="number"
                  value={editingArticle?.reading_time || 5}
                  onChange={(e) => setEditingArticle({ ...editingArticle, reading_time: parseInt(e.target.value) })}
                  className="bg-white/5 border-white/10 rounded-xl text-white py-6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">URL изображения</Label>
              <Input
                value={editingArticle?.image_url || ""}
                onChange={(e) => setEditingArticle({ ...editingArticle, image_url: e.target.value })}
                className="bg-white/5 border-white/10 rounded-xl text-white py-6"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-1">
                <Label className="text-white uppercase text-[10px] font-bold tracking-widest">Уровень доступа</Label>
                <p className="text-[10px] text-white/40 uppercase font-bold">Кто сможет прочитать статью полностью</p>
              </div>
              <Select
                value={editingArticle?.access_level || "free"}
                onValueChange={(v: any) => setEditingArticle({ ...editingArticle, access_level: v })}
              >
                <SelectTrigger className="w-[160px] bg-black/40 border-white/10 rounded-xl text-white h-12 relative z-[100]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121214] border-white/10 text-white z-[110]">
                  <SelectItem value="free" className="focus:bg-white/5 focus:text-white">Free</SelectItem>
                  <SelectItem value="basic" className="focus:bg-white/5 focus:text-white">Basic</SelectItem>
                  <SelectItem value="pro" className="focus:bg-white/5 focus:text-white">Pro</SelectItem>
                  <SelectItem value="elite" className="focus:bg-white/5 focus:text-white">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-1">
                <Label className="text-white uppercase text-[10px] font-bold tracking-widest">Опубликовать</Label>
                <p className="text-[10px] text-white/40 uppercase font-bold">Сделать статью видимой для пользователей</p>
              </div>
              <Switch
                checked={editingArticle?.is_published || false}
                onCheckedChange={(v) => setEditingArticle({ ...editingArticle, is_published: v })}
                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-white/10"
              />
            </div>
          </div>

          <DialogFooter className="mt-8 gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-xl text-white/40 hover:text-white hover:bg-white/5 py-6"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-10 min-w-[160px] py-6 shadow-lg shadow-orange-500/20"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
