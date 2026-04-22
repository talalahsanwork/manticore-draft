import { useSession, useWorkOrders } from "@/hooks/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/maticore/StatusBadge";
import { format, isToday, isPast } from "date-fns";
import { ChevronRight, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { WorkOrderDetail } from "@/components/maticore/WorkOrderDetail";
import { toast } from "sonner";

export default function TechnicianDashboard() {
  const session = useSession()!;
  const wos = useWorkOrders(session.tenantId);
  const [open, setOpen] = useState<any>(null);
  const mine = wos.list.filter((w) => w.assigneeId === session.userId);
  const today = mine.filter((w) => isToday(new Date(w.dueDate)) && w.status !== "completed");
  const overdue = mine.filter((w) => isPast(new Date(w.dueDate)) && !isToday(new Date(w.dueDate)) && w.status !== "completed");
  const upcoming = mine.filter((w) => !isPast(new Date(w.dueDate)) && !isToday(new Date(w.dueDate)) && w.status !== "completed");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">My tasks</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMM d")}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MiniStat icon={Clock} label="Today" value={today.length} />
        <MiniStat icon={AlertTriangle} label="Overdue" value={overdue.length} accent="destructive" />
        <MiniStat icon={CheckCircle2} label="Total" value={mine.length} accent="primary" />
      </div>

      <Section title="Today" items={today} onOpen={setOpen} onComplete={(id) => { wos.update(id, { status: "completed" }); toast.success("Marked completed"); }} />
      {overdue.length > 0 && <Section title="Overdue" items={overdue} onOpen={setOpen} onComplete={(id) => { wos.update(id, { status: "completed" }); toast.success("Marked completed"); }} />}
      <Section title="Upcoming" items={upcoming} onOpen={setOpen} />

      <WorkOrderDetail wo={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: string }) {
  const cls = accent === "destructive" ? "text-destructive" : accent === "primary" ? "text-primary" : "text-foreground";
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <Icon className={`h-4 w-4 ${cls}`} />
        <div className={`mt-2 text-2xl font-bold ${cls}`}>{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function Section({ title, items, onOpen, onComplete }: { title: string; items: any[]; onOpen: (w: any) => void; onComplete?: (id: string) => void }) {
  if (items.length === 0)
    return (
      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h2>
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">All clear ✨</div>
      </div>
    );
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{title} ({items.length})</h2>
      <div className="space-y-2">
        {items.map((w) => (
          <Card key={w.id} className="bg-card border-border transition-colors hover:border-primary/40">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1" onClick={() => onOpen(w)}>
                <div className="font-medium truncate">{w.title}</div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={w.status} />
                  <PriorityBadge priority={w.priority} />
                  <span className="text-xs text-muted-foreground">Due {format(new Date(w.dueDate), "MMM d")}</span>
                </div>
              </div>
              {onComplete && (
                <Button size="sm" variant="outline" onClick={() => onComplete(w.id)}>
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Done
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => onOpen(w)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}