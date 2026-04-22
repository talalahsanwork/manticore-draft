import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession, useTenants, useUsers } from "@/hooks/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Role } from "@/lib/types";
import { toast } from "sonner";
import { db } from "@/lib/storage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Settings() {
  return (
    <AppShell allowedRoles={["manager"]}>
      <Inner />
    </AppShell>
  );
}

function Inner() {
  const session = useSession()!;
  const tenants = useTenants();
  const users = useUsers(session.tenantId);
  const tenant = tenants.list.find((t) => t.id === session.tenantId)!;
  const [name, setName] = useState(tenant?.name ?? "");
  const [open, setOpen] = useState(false);
  const [u, setU] = useState({ name: "", email: "", role: "technician" as Role });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your organization, team, and billing.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Organization</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Plan</Label>
            <Select value={tenant?.plan} onValueChange={(v) => tenants.update(tenant.id, { plan: v as any })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["Starter","Pro","Business"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2"><Button onClick={() => { tenants.update(tenant.id, { name }); toast.success("Saved"); }}>Save changes</Button></div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Team members</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-3.5 w-3.5" /> Invite</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite teammate</DialogTitle></DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-2"><Label>Name</Label><Input value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Email</Label><Input value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Role</Label>
                  <Select value={u.role} onValueChange={(v) => setU({ ...u, role: v as Role })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="client">Tenant/Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  if (!u.name || !u.email) { toast.error("Name & email required"); return; }
                  users.create({ ...u, tenantId: session.tenantId });
                  toast.success("Invitation sent");
                  setOpen(false); setU({ name: "", email: "", role: "technician" });
                }}>Send invite</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.list.filter((x) => x.role !== "super_admin").map((x) => (
              <div key={x.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/15 text-primary text-xs">{x.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{x.name}</div>
                  <div className="text-xs text-muted-foreground">{x.email} · <span className="capitalize">{x.role}</span></div>
                </div>
                {x.id !== session.userId && (
                  <Button variant="ghost" size="icon" onClick={() => { users.remove(x.id); toast.success("Removed"); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-base">Danger zone</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => { db.resetAll(); toast.success("Demo data reset. Reloading..."); setTimeout(() => location.assign("/"), 800); }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Reset demo data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}