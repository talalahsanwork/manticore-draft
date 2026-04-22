import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/maticore/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession, useTenants, useUsers, useWorkOrders, logout } from "@/hooks/useStore";
import { Plus, LogOut, Send } from "lucide-react";
import { useState } from "react";
import { StatusBadge, PriorityBadge } from "@/components/maticore/StatusBadge";
import { Priority } from "@/lib/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { WorkOrderDetail } from "@/components/maticore/WorkOrderDetail";

export default function ClientPortal() {
  const navigate = useNavigate();
  const session = useSession();
  const wos = useWorkOrders(session?.tenantId);
  const tenants = useTenants();
  const { all: users } = useUsers();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<any>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "Plumbing", priority: "medium" as Priority });

  if (!session || session.role !== "client") {
    navigate("/client", { replace: true });
    return null;
  }

  const me = users.find((u) => u.id === session.userId);
  const tenant = tenants.list.find((t) => t.id === session.tenantId);
  const mine = wos.list.filter((w) => w.requesterId === session.userId);

  const submit = () => {
    if (!form.title) { toast.error("Title required"); return; }
    wos.create({
      tenantId: session.tenantId, title: form.title, description: form.description,
      status: "new", priority: form.priority, category: form.category,
      requesterId: session.userId, dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    });
    toast.success("Request submitted");
    setOpen(false); setForm({ title: "", description: "", category: "Plumbing", priority: "medium" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3"><Logo /><span className="text-sm text-muted-foreground hidden md:inline">· {tenant?.name}</span></div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <Avatar className="h-7 w-7"><AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">{me?.name?.split(" ").map(n=>n[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
              <div className="text-xs"><div className="font-medium">{me?.name}</div><div className="text-muted-foreground">Unit {me?.unit}</div></div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <Card className="bg-gradient-surface border-border shadow-elegant">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {me?.name?.split(" ")[0]}</h1>
              <p className="text-sm text-muted-foreground">Submit and track maintenance requests for your unit.</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button className="gap-2 shadow-elegant"><Plus className="h-4 w-4" /> New request</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Submit a maintenance request</DialogTitle></DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-2"><Label>What's the issue?</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Leak under kitchen sink" /></div>
                  <div className="grid gap-2"><Label>Details</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2"><Label>Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["Plumbing","Electrical","HVAC","Appliance","General"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2"><Label>Priority</Label>
                      <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["low","medium","high","urgent"].map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={submit} className="gap-2"><Send className="h-4 w-4" /> Submit</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Stat label="Open" value={mine.filter((w) => w.status !== "completed").length} />
          <Stat label="In progress" value={mine.filter((w) => w.status === "in_progress").length} />
          <Stat label="Completed" value={mine.filter((w) => w.status === "completed").length} />
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">My requests</CardTitle></CardHeader>
          <CardContent>
            {mine.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">You haven't submitted any requests yet.</p>}
            <div className="space-y-2">
              {mine.map((w) => (
                <div key={w.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 cursor-pointer hover:border-primary/40" onClick={() => setActive(w)}>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{w.title}</div>
                    <div className="text-xs text-muted-foreground">Submitted {format(new Date(w.createdAt), "MMM d, yyyy")}</div>
                  </div>
                  <PriorityBadge priority={w.priority} />
                  <StatusBadge status={w.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      <WorkOrderDetail wo={active} onClose={() => setActive(null)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}