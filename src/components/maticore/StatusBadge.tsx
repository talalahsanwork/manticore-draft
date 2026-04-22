import { Badge } from "@/components/ui/badge";
import { WOStatus, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusMap: Record<WOStatus, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-info/15 text-info border-info/30" },
  assigned: { label: "Assigned", cls: "bg-primary/15 text-primary border-primary/30" },
  in_progress: { label: "In Progress", cls: "bg-warning/15 text-warning border-warning/30" },
  pending_review: { label: "Pending Review", cls: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  completed: { label: "Completed", cls: "bg-success/15 text-success border-success/30" },
};

const priorityMap: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-info/15 text-info border-info/30",
  high: "bg-warning/15 text-warning border-warning/30",
  urgent: "bg-destructive/15 text-destructive border-destructive/40",
};

export function StatusBadge({ status }: { status: WOStatus }) {
  const s = statusMap[status];
  return <Badge variant="outline" className={cn("font-medium", s.cls)}>{s.label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <Badge variant="outline" className={cn("font-medium capitalize", priorityMap[priority])}>
      {priority}
    </Badge>
  );
}