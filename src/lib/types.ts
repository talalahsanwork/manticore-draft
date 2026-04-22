export type Role = "super_admin" | "manager" | "technician" | "client";

export type Priority = "low" | "medium" | "high" | "urgent";
export type WOStatus = "new" | "assigned" | "in_progress" | "pending_review" | "completed";
export type Recurrence = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

export interface Tenant {
  id: string;
  name: string;
  plan: "Starter" | "Pro" | "Business";
  createdAt: string;
  seats: number;
  status: "active" | "trial" | "suspended";
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  property?: string;
  unit?: string;
}

export interface Asset {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  location: string;
  serial: string;
  installedAt: string;
  status: "operational" | "maintenance" | "retired";
}

export interface WorkOrder {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  status: WOStatus;
  priority: Priority;
  category: string;
  assetId?: string;
  assigneeId?: string;
  requesterId: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  notes: { id: string; userId: string; text: string; at: string }[];
  attachments: { id: string; name: string }[];
  pmId?: string;
}

export interface PMSchedule {
  id: string;
  tenantId: string;
  title: string;
  recurrence: Recurrence;
  assetId?: string;
  category: string;
  nextRun: string;
  active: boolean;
}

export interface Session {
  userId: string;
  tenantId: string;
  role: Role;
}