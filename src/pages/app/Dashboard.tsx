import { AppShell } from "@/components/layout/AppShell";
import { useSession, useWorkOrders, useUsers, usePMs } from "@/hooks/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, AlertTriangle, Users, CheckCircle2 } from "lucide-react";
import { StatusBadge, PriorityBadge } from "@/components/maticore/StatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { format, isToday, isPast, addDays, startOfWeek } from "date-fns";
import { WorkOrderForm } from "@/components/maticore/WorkOrderForm";
import { WorkOrderDetail } from "@/components/maticore/WorkOrderDetail";
import TechnicianDashboard from "./TechnicianDashboard";

export default function Dashboard() {
  const session = useSession();
  if (!session) return null;
  if (session.role === "technician") {
    return (
      <AppShell allowedRoles={["technician", "manager"]}>
        <TechnicianDashboard />
      </AppShell>
    );
  }
  return (
    <AppShell allowedRoles={["manager"]}>
      <ManagerDashboard />
    </AppShell>
  );
}

function ManagerDashboard() {
  const session = useSession()!;
  const { list: wos } = useWorkOrders(session.tenantId);
  const { list: users } = useUsers(session.tenantId);
  const { list: pms } = usePMs(session.tenantId);
  const [open, setOpen] = useState<any>(null);

  const open_ = wos.filter((w) => w.status !== "completed");
  const overdue = wos.filter((w) => w.status !== "completed" && isPast(new Date(w.dueDate)));
  const techs = users.filter((u) => u.role === "technician");
  const completedThisWeek = wos.filter((w) => w.status === "completed" && new Date(w.updatedAt) > startOfWeek(new Date()));

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your maintenance operations.</p>
        </div>
        <WorkOrderForm />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric icon={ClipboardList} label="Open work orders" value={open_.length} accent="primary" />
        <Metric icon={AlertTriangle} label="Overdue" value={overdue.length} accent="destructive" />
        <Metric icon={Users} label="Active technicians" value={techs.length} accent="info" />
        <Metric icon={CheckCircle2} label="Completed this week" value={completedThisWeek.length} accent="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-card border-border shadow-card">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Recent work orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wos.slice(0, 8).map((w) => {
                    const a = users.find((u) => u.id === w.assigneeId);
                    return (
                      <TableRow key={w.id} className="cursor-pointer" onClick={() => setOpen(w)}>
                        <TableCell className="font-medium">{w.title}</TableCell>
                        <TableCell><StatusBadge status={w.status} /></TableCell>
                        <TableCell><PriorityBadge priority={w.priority} /></TableCell>
                        <TableCell className="text-muted-foreground">{a?.name ?? "Unassigned"}</TableCell>
                        <TableCell className={isPast(new Date(w.dueDate)) && w.status !== "completed" ? "text-destructive" : "text-muted-foreground"}>
                          {format(new Date(w.dueDate), "MMM d")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-card">
          <CardHeader><CardTitle className="text-base">Activity feed</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wos.slice(0, 6).map((w) => (
                <div key={w.id} className="flex gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <div className="truncate"><span className="font-medium">{w.title}</span></div>
                    <div className="text-xs text-muted-foreground">{format(new Date(w.updatedAt), "MMM d, h:mm a")} · <span className="capitalize">{w.status.replace("_"," ")}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border shadow-card">
        <CardHeader><CardTitle className="text-base">PM schedule — next 7 days</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {week.map((d) => {
              const due = pms.filter((p) => isSameDay(new Date(p.nextRun), d));
              return (
                <div key={d.toISOString()} className={`rounded-lg border border-border p-3 min-h-[110px] ${isToday(d) ? "bg-primary/5 border-primary/40" : "bg-card/40"}`}>
                  <div className="text-xs text-muted-foreground">{format(d, "EEE")}</div>
                  <div className="text-lg font-semibold">{format(d, "d")}</div>
                  <div className="mt-2 space-y-1">
                    {due.map((p) => (
                      <div key={p.id} className="rounded bg-primary/15 px-2 py-1 text-[11px] text-primary truncate">{p.title}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <WorkOrderDetail wo={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Metric({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent: string }) {
  const accentMap: Record<string, string> = {
    primary: "text-primary bg-primary/10",
    destructive: "text-destructive bg-destructive/10",
    info: "text-info bg-info/10",
    success: "text-success bg-success/10",
  };
  return (
    <Card className="bg-card border-border shadow-card">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accentMap[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}