import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Priority, WOStatus } from "@/lib/types";
import { useAssets, useUsers, useWorkOrders } from "@/hooks/useStore";
import { useSession } from "@/hooks/useStore";
import { toast } from "sonner";

export function WorkOrderForm({ trigger }: { trigger?: React.ReactNode }) {
  const session = useSession()!;
  const wos = useWorkOrders(session.tenantId);
  const { list: techs } = useUsers(session.tenantId);
  const { list: assets } = useAssets(session.tenantId);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    category: "General",
    assetId: "",
    assigneeId: "",
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
  });

  const submit = () => {
    if (!form.title) {
      toast.error("Title is required");
      return;
    }
    wos.create({
      tenantId: session.tenantId,
      title: form.title,
      description: form.description,
      status: form.assigneeId ? ("assigned" as WOStatus) : ("new" as WOStatus),
      priority: form.priority,
      category: form.category,
      assetId: form.assetId || undefined,
      assigneeId: form.assigneeId || undefined,
      requesterId: session.userId,
      dueDate: new Date(form.dueDate).toISOString(),
    });
    toast.success("Work order created");
    setOpen(false);
    setForm({ ...form, title: "", description: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> New Work Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Work Order</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AC not cooling in unit 204" />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["General", "HVAC", "Plumbing", "Electrical", "Elevator", "Safety", "Appliance"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Assignee</Label>
              <Select value={form.assigneeId} onValueChange={(v) => setForm({ ...form, assigneeId: v })}>
                <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                <SelectContent>
                  {techs.filter((t) => t.role === "technician" || t.role === "manager").map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} <span className="text-xs text-muted-foreground">({t.role})</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Asset</Label>
              <Select value={form.assetId} onValueChange={(v) => setForm({ ...form, assetId: v })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {assets.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Due date</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}