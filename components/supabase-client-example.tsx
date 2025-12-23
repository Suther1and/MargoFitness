"use client"

import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Database, RefreshCw } from "lucide-react";

export function SupabaseClientExample() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      // Простая проверка подключения
      const { error } = await supabase.auth.getSession();
      setIsConnected(!error);
    } catch {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="size-5" />
          Клиентский компонент
        </CardTitle>
        <CardDescription>
          Данные загружаются на клиенте с помощью createClient()
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm font-medium">Статус подключения:</p>
          <p className="text-sm text-muted-foreground">
            {isConnected === null && "Проверка..."}
            {isConnected === true && "✅ Подключено к Supabase"}
            {isConnected === false && "❌ Ошибка подключения"}
          </p>
        </div>

        <Button
          onClick={checkConnection}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          <RefreshCw className={`mr-2 size-4 ${isLoading ? "animate-spin" : ""}`} />
          Проверить подключение
        </Button>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <p className="text-xs text-muted-foreground">
            💡 Этот компонент использует &quot;use client&quot; и может выполнять
            интерактивные действия, работать с состоянием и эффектами.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

