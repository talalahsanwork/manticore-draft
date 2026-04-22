import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WorkOrder, WOStatus } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useUsers, useWorkOrders, useAssets, useSession } from "@/hooks/useStore";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { format } from "date-fns";
import { toast } from "sonner";
import { Paperclip, MessageSquare } from "lucide-react";

const statuses: WOStatus[] = ["new", "assigned", "in_progress", "pending_review", "completed"];

export function WorkOrderDetail({ wo, onClose }: { wo: WorkOrder | null; onClose: () => void }) {
  const session = useSession()!;
  const wos = useWorkOrders(session.tenantId);
  const { list: users } = useUsers(session.tenantId);
  const { list: assets } = useAssets(session.tenantId);
  const [note, setNote] = useState("");

  if (!wo) return null;
  const live = wos.list.find((w) => w.id === wo.id) || wo;
  const assignee = users.find((u) => u.id === live.assigneeId);
  const requester = users.find((u) => u.id === live.requesterId);
  const asset = assets.find((a) => a.id === live.assetId);
  const isClient = session.role === "client";

  return (
    <Dialog open={!!wo} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            <span>{live.title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={live.status} />
            <PriorityBadge priority={live.priority} />
            <span className="text-xs text-muted-foreground">#{live.id.slice(-6).toUpperCase()}</span>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{live.description || "No description provided."}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="Category" value={live.category} />
            <Info label="Due" value={format(new Date(live.dueDate), "MMM d, yyyy")} />
            <Info label="Assignee" value={assignee?.name ?? "Unassigned"} />
            <Info label="Requester" value={requester?.name ?? "—"} />
            <Info label="Asset" value={asset?.name ?? "—"} />
            <Info label="Created" value={format(new Date(live.createdAt), "MMM d, yyyy")} />
          </div>

          {!isClient && (
            <div className="grid gap-2">
              <label className="text-xs font-medium text-muted-foreground">Update status</label>
              <Select
                value={live.status}
                onValueChange={(v) => {
                  wos.update(live.id, { status: v as WOStatus });
                  toast.success("Status updated");
                }}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" /> Activity & notes
            </div>
            <div className="space-y-2">
              {live.notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
              {live.notes.map((n) => {
                const u = users.find((x) => x.id === n.userId);
                return (
                  <div key={n.id} className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      <span className="font-medium text-foreground">{u?.name ?? "User"}</span> · {format(new Date(n.at), "MMM d, h:mm a")}
                    </div>
                    <div className="text-sm">{n.text}</div>
                  </div>
                );
              })}
            </div>
            <Textarea placeholder="Add a note..." value={note} onChange={(e) => setNote(e.target.value)} />
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  wos.update(live.id, { attachments: [...live.attachments, { id: Math.random().toString(36).slice(2), name: `photo_${live.attachments.length + 1}.jpg` }] });
                  toast.success("Attachment added");
                }}
              >
                <Paperclip className="mr-2 h-3.5 w-3.5" /> Attach photo ({live.attachments.length})
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (!note.trim()) return;
                  wos.addNote(live.id, session.userId, note);
                  setNote("");
                  toast.success("Note added");
                }}
              >
                Add note
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}