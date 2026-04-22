import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssets, usePMs, useSession, useWorkOrders } from "@/hooks/useStore";
import { Boxes, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Assets() {
  return (
    <AppShell>
      <Inner />
    </AppShell>
  );
}

function Inner() {
  const session = useSession()!;
  const assets = useAssets(session.tenantId);
  const pms = usePMs(session.tenantId);
  const wos = useWorkOrders(session.tenantId);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "HVAC", location: "", serial: "" });

  const create = () => {
    if (!form.name) { toast.error("Name required"); return; }
    assets.create({ tenantId: session.tenantId, ...form, installedAt: new Date().toISOString(), status: "operational" });
    toast.success("Asset created");
    setOpen(false); setForm({ name: "", category: "HVAC", location: "", serial: "" });
  };

  const detail = active ? assets.list.find((a) => a.id === active) : null;
  const detailHistory = detail ? wos.list.filter((w) => w.assetId === detail.id) : [];
  const detailPMs = detail ? pms.list.filter((p) => p.assetId === detail.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Assets</h1>
          <p className="text-sm text-muted-foreground">Equipment and infrastructure under your care.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New asset</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add asset</DialogTitle></DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["HVAC","Plumbing","Electrical","Elevator","Safety","Appliance","General"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2"><Label>Serial</Label><Input value={form.serial} onChange={(e) => setForm({ ...form, serial: e.target.value })} /></div>
              </div>
              <div className="grid gap-2"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={create}>Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {assets.list.map((a) => (
          <Card key={a.id} className="bg-card border-border cursor-pointer transition-colors hover:border-primary/40" onClick={() => setActive(a.id)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Boxes className="h-5 w-5" /></div>
                <Badge variant="outline" className="capitalize">{a.status}</Badge>
              </div>
              <div className="mt-4 font-semibold">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.category} · {a.location}</div>
              <div className="mt-3 text-xs text-muted-foreground">SN {a.serial}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-xl">
          {detail && (
            <>
              <DialogHeader><DialogTitle>{detail.name}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Info label="Category" value={detail.category} />
                <Info label="Status" value={detail.status} />
                <Info label="Location" value={detail.location} />
                <Info label="Serial" value={detail.serial} />
                <Info label="Installed" value={format(new Date(detail.installedAt), "MMM d, yyyy")} />
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Linked PM schedules</div>
                {detailPMs.length === 0 && <p className="text-xs text-muted-foreground">None.</p>}
                {detailPMs.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded border border-border p-2 text-sm">
                    <span>{p.title}</span><span className="text-xs text-muted-foreground capitalize">{p.recurrence}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Maintenance history</div>
                {detailHistory.length === 0 && <p className="text-xs text-muted-foreground">No work orders yet.</p>}
                <div className="space-y-1">
                  {detailHistory.map((w) => (
                    <div key={w.id} className="flex items-center justify-between rounded border border-border p-2 text-sm">
                      <span>{w.title}</span>
                      <span className="text-xs text-muted-foreground capitalize">{w.status.replace("_"," ")} · {format(new Date(w.updatedAt), "MMM d")}</span>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="destructive" onClick={() => { assets.remove(detail.id); setActive(null); toast.success("Asset removed"); }}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium capitalize">{value}</div>
    </div>
  );
}