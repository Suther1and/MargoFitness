import { createClient } from "@/lib/supabase/server";
import { SupabaseClientExample } from "@/components/supabase-client-example";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ExamplesPage() {
  const supabase = await createClient();

  // Пример запроса к Supabase (когда у вас будут таблицы)
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="container mx-auto space-y-8 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Примеры Supabase</h1>
        <p className="text-muted-foreground">
          Примеры использования Supabase в серверных и клиентских компонентах
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Серверный компонент */}
        <Card>
          <CardHeader>
            <CardTitle>Серверный компонент</CardTitle>
            <CardDescription>
              Данные загружаются на сервере с помощью createClient() из server.ts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Статус пользователя:</p>
              <p className="text-sm text-muted-foreground">
                {user ? `Авторизован: ${user.email}` : "Не авторизован"}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Supabase URL:</p>
              <p className="text-xs text-muted-foreground break-all">
                {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Клиентский компонент */}
        <SupabaseClientExample />
      </div>

      {/* Код примера */}
      <Card>
        <CardHeader>
          <CardTitle>Пример кода</CardTitle>
          <CardDescription>
            Как использовать Supabase в ваших компонентах
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="mb-2 font-semibold">Серверный компонент:</h3>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`import { createClient } from "@/lib/supabase/server";

export default async function MyPage() {
  const supabase = await createClient();
  
  // Получение данных из таблицы
  const { data } = await supabase
    .from('my_table')
    .select('*');
  
  return <div>{/* ... */}</div>;
}`}
            </pre>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Клиентский компонент:</h3>
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
{`"use client"
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function MyComponent() {
  const [data, setData] = useState([]);
  const supabase = createClient();
  
  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('my_table')
        .select('*');
      setData(data || []);
    }
    loadData();
  }, []);
  
  return <div>{/* ... */}</div>;
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

