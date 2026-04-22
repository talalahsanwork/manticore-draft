import { AppShell } from "@/components/layout/AppShell";
import { useSession, useUsers, useWorkOrders } from "@/hooks/useStore";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/maticore/StatusBadge";
import { Card } from "@/components/ui/card";
import { format, isPast } from "date-fns";
import { Search } from "lucide-react";
import { WorkOrderForm } from "@/components/maticore/WorkOrderForm";
import { WorkOrderDetail } from "@/components/maticore/WorkOrderDetail";

export default function WorkOrders() {
  return (
    <AppShell>
      <Inner />
    </AppShell>
  );
}

function Inner() {
  const session = useSession()!;
  const { list } = useWorkOrders(session.tenantId);
  const { list: users } = useUsers(session.tenantId);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [open, setOpen] = useState<any>(null);

  const visible = useMemo(() => {
    let l = session.role === "technician" ? list.filter((w) => w.assigneeId === session.userId) : list;
    if (q) l = l.filter((w) => w.title.toLowerCase().includes(q.toLowerCase()));
    if (status !== "all") l = l.filter((w) => w.status === status);
    if (priority !== "all") l = l.filter((w) => w.priority === priority);
    return l;
  }, [list, q, status, priority, session]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Work orders</h1>
          <p className="text-sm text-muted-foreground">Manage the full lifecycle of every job.</p>
        </div>
        {session.role !== "technician" && <WorkOrderForm />}
      </div>

      <Card className="bg-card border-border p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-1 min-w-[200px] items-center gap-2 rounded-md border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title..." className="h-9 border-0 bg-transparent p-0 focus-visible:ring-0" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["new", "assigned", "in_progress", "pending_review", "completed"].map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              {["low","medium","high","urgent"].map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="bg-card border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((w) => {
              const a = users.find((u) => u.id === w.assigneeId);
              return (
                <TableRow key={w.id} className="cursor-pointer" onClick={() => setOpen(w)}>
                  <TableCell className="font-medium">{w.title}</TableCell>
                  <TableCell><StatusBadge status={w.status} /></TableCell>
                  <TableCell><PriorityBadge priority={w.priority} /></TableCell>
                  <TableCell>{w.category}</TableCell>
                  <TableCell className="text-muted-foreground">{a?.name ?? "Unassigned"}</TableCell>
                  <TableCell className={isPast(new Date(w.dueDate)) && w.status !== "completed" ? "text-destructive" : ""}>
                    {format(new Date(w.dueDate), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              );
            })}
            {visible.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No work orders match your filters.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <WorkOrderDetail wo={open} onClose={() => setOpen(null)} />
    </div>
  );
}