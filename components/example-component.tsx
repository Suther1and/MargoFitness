import { Heart, Star, Users } from "lucide-react";

export const ExampleComponent = () => {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
      <Heart className="size-6 text-destructive" />
      <Star className="size-6 text-primary" />
      <Users className="size-6 text-muted-foreground" />
    </div>
  );
};

