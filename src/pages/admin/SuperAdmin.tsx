import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/maticore/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession, useTenants, useUsers, useWorkOrders, login, logout } from "@/hooks/useStore";
import { Building2, LogOut, Plus, ArrowRightLeft, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SuperAdmin() {
  const navigate = useNavigate();
  const session = useSession();
  const tenants = useTenants();
  const { all: users } = useUsers();
  const { all: wos } = useWorkOrders();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", plan: "Starter" as const });

  if (!session || session.role !== "super_admin") {
    navigate("/admin", { replace: true });
    return null;
  }

  const create = () => {
    if (!form.name) { toast.error("Name required"); return; }
    tenants.create(form.name, form.plan);
    toast.success("Tenant created");
    setOpen(false); setForm({ name: "", plan: "Starter" });
  };

  const switchInto = (tId: string) => {
    const target = users.find((u) => u.tenantId === tId && u.role === "manager");
    if (!target) { toast.error("No manager exists in that tenant"); return; }
    login({ userId: target.id, tenantId: tId, role: "manager" });
    navigate("/app/dashboard");
  };

  const totalUsers = users.filter((u) => u.role !== "super_admin").length;
  const totalWOs = wos.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">Super Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Platform overview</h1>
            <p className="text-sm text-muted-foreground">Manage tenants, plans, and platform usage.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New tenant</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create organization</DialogTitle></DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Plan</Label>
                  <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["Starter","Pro","Business"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Stat label="Tenants" value={tenants.list.length} />
          <Stat label="Users" value={totalUsers} />
          <Stat label="Work orders" value={totalWOs} />
          <Stat label="MRR" value={`$${tenants.list.reduce((s, t) => s + ({ Starter: 29, Pro: 89, Business: 249 } as any)[t.plan], 0)}`} />
        </div>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Organizations</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Work orders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.list.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium"><Building2 className="h-4 w-4 text-muted-foreground" />{t.name}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{t.plan}</Badge></TableCell>
                    <TableCell>{users.filter((u) => u.tenantId === t.id).length}</TableCell>
                    <TableCell>{wos.filter((w) => w.tenantId === t.id).length}</TableCell>
                    <TableCell><Badge variant="outline" className={t.status === "active" ? "bg-success/15 text-success border-success/30" : t.status === "trial" ? "bg-info/15 text-info border-info/30" : "bg-destructive/15 text-destructive border-destructive/30"}>{t.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(t.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => switchInto(t.id)}><ArrowRightLeft className="mr-1 h-3.5 w-3.5" /> Enter</Button>
                      <Button size="sm" variant="ghost" onClick={() => { tenants.remove(t.id); toast.success("Tenant removed"); }}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-2 text-3xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}