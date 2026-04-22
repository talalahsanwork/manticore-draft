import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAssets, usePMs, useSession, useWorkOrders } from "@/hooks/useStore";
import { addDays, addMonths, addWeeks, addYears, format, isPast, isSameMonth, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { Plus, Repeat, Zap, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { Recurrence } from "@/lib/types";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const recOptions: Recurrence[] = ["daily", "weekly", "monthly", "quarterly", "annual"];

function nextDate(rec: Recurrence, from = new Date()) {
  switch (rec) {
    case "daily": return addDays(from, 1).toISOString();
    case "weekly": return addWeeks(from, 1).toISOString();
    case "monthly": return addMonths(from, 1).toISOString();
    case "quarterly": return addMonths(from, 3).toISOString();
    case "annual": return addYears(from, 1).toISOString();
  }
}

export default function Maintenance() {
  return (
    <AppShell allowedRoles={["manager"]}>
      <Inner />
    </AppShell>
  );
}

function Inner() {
  const session = useSession()!;
  const pms = usePMs(session.tenantId);
  const wos = useWorkOrders(session.tenantId);
  const { list: assets } = useAssets(session.tenantId);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());

  const [form, setForm] = useState({ title: "", recurrence: "monthly" as Recurrence, assetId: "", category: "HVAC" });

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const overdue = pms.list.filter((p) => isPast(new Date(p.nextRun)));

  const create = () => {
    if (!form.title) { toast.error("Title required"); return; }
    pms.create({ tenantId: session.tenantId, title: form.title, recurrence: form.recurrence, assetId: form.assetId || undefined, category: form.category, nextRun: nextDate(form.recurrence), active: true });
    toast.success("Schedule created");
    setOpen(false); setForm({ title: "", recurrence: "monthly", assetId: "", category: "HVAC" });
  };

  const generateNow = (id: string) => {
    const p = pms.list.find((x) => x.id === id);
    if (!p) return;
    wos.create({
      tenantId: session.tenantId, title: p.title, description: `Auto-generated from PM schedule (${p.recurrence})`,
      status: "new", priority: "medium", category: p.category, assetId: p.assetId, requesterId: session.userId,
      dueDate: p.nextRun, pmId: p.id,
    });
    pms.update(id, { nextRun: nextDate(p.recurrence, new Date(p.nextRun)) });
    toast.success("Work order generated");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Preventative maintenance</h1>
          <p className="text-sm text-muted-foreground">Recurring schedules that auto-generate work orders.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New schedule</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New PM schedule</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Recurrence</Label>
                  <Select value={form.recurrence} onValueChange={(v) => setForm({ ...form, recurrence: v as Recurrence })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{recOptions.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2"><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["HVAC","Plumbing","Electrical","Elevator","Safety","General"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2"><Label>Asset</Label>
                <Select value={form.assetId} onValueChange={(v) => setForm({ ...form, assetId: v })}>
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>{assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {overdue.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="text-sm"><span className="font-semibold">{overdue.length} overdue PM tasks.</span> Generate work orders to catch up.</div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{format(month, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setMonth(addMonths(month, -1))}>‹</Button>
            <Button size="sm" variant="outline" onClick={() => setMonth(new Date())}>Today</Button>
            <Button size="sm" variant="outline" onClick={() => setMonth(addMonths(month, 1))}>›</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const items = pms.list.filter((p) => isSameDay(new Date(p.nextRun), d));
              const dim = !isSameMonth(d, month);
              return (
                <div key={d.toISOString()} className={`min-h-[90px] rounded-md border border-border p-1.5 text-xs ${dim ? "opacity-40" : ""} ${isSameDay(d, new Date()) ? "border-primary/60 bg-primary/5" : "bg-card/40"}`}>
                  <div className="font-medium">{format(d, "d")}</div>
                  <div className="mt-1 space-y-1">
                    {items.slice(0, 2).map((p) => (
                      <div key={p.id} className={`truncate rounded px-1.5 py-0.5 ${isPast(new Date(p.nextRun)) ? "bg-destructive/20 text-destructive" : "bg-primary/15 text-primary"}`}>
                        {p.title}
                      </div>
                    ))}
                    {items.length > 2 && <div className="text-[10px] text-muted-foreground">+{items.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">All schedules</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pms.list.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Repeat className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{p.recurrence} · {p.category} · Next {format(new Date(p.nextRun), "MMM d, yyyy")}</div>
                </div>
                {isPast(new Date(p.nextRun)) && <span className="text-xs font-medium text-destructive">Overdue</span>}
                <Switch checked={p.active} onCheckedChange={(v) => pms.update(p.id, { active: v })} />
                <Button variant="outline" size="sm" onClick={() => generateNow(p.id)}><Zap className="mr-1 h-3.5 w-3.5" /> Generate</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}