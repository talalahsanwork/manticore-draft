import { Wrench } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
        <Wrench className="h-4 w-4 text-primary-foreground" />
      </div>
      <span className="text-lg font-bold tracking-tight">Maticore</span>
    </div>
  );
}