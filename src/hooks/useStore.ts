import { useEffect, useState, useCallback } from "react";
import { db, ensureSeed, uid } from "@/lib/storage";
import { Asset, PMSchedule, Session, Tenant, User, WorkOrder } from "@/lib/types";

function useReactiveKey<T>(read: () => T): [T, () => void] {
  const [val, setVal] = useState<T>(read);
  const refresh = useCallback(() => setVal(read()), [read]);
  useEffect(() => {
    ensureSeed();
    refresh();
    const handler = () => refresh();
    window.addEventListener("maticore:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("maticore:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);
  return [val, refresh];
}

export function useSession() {
  const [s] = useReactiveKey(() => db.session.get());
  return s;
}

export function useTenants() {
  const [list] = useReactiveKey(() => db.tenants.all());
  return {
    list,
    create: (name: string, plan: Tenant["plan"] = "Starter") => {
      const t: Tenant = { id: "t_" + uid(), name, plan, createdAt: new Date().toISOString(), seats: 1, status: "trial" };
      db.tenants.set([...db.tenants.all(), t]);
      return t;
    },
    update: (id: string, patch: Partial<Tenant>) => {
      db.tenants.set(db.tenants.all().map((t) => (t.id === id ? { ...t, ...patch } : t)));
    },
    remove: (id: string) => {
      db.tenants.set(db.tenants.all().filter((t) => t.id !== id));
    },
  };
}

export function useUsers(tenantId?: string) {
  const [all] = useReactiveKey(() => db.users.all());
  const list = tenantId ? all.filter((u) => u.tenantId === tenantId || u.tenantId === "*") : all;
  return {
    list,
    all,
    create: (u: Omit<User, "id">) => {
      const nu: User = { ...u, id: "u_" + uid() };
      db.users.set([...db.users.all(), nu]);
      return nu;
    },
    update: (id: string, patch: Partial<User>) =>
      db.users.set(db.users.all().map((u) => (u.id === id ? { ...u, ...patch } : u))),
    remove: (id: string) => db.users.set(db.users.all().filter((u) => u.id !== id)),
  };
}

export function useWorkOrders(tenantId?: string) {
  const [all] = useReactiveKey(() => db.workorders.all());
  const list = tenantId ? all.filter((w) => w.tenantId === tenantId) : all;
  return {
    list,
    all,
    create: (w: Omit<WorkOrder, "id" | "createdAt" | "updatedAt" | "notes" | "attachments">) => {
      const now = new Date().toISOString();
      const wo: WorkOrder = { ...w, id: "wo_" + uid(), createdAt: now, updatedAt: now, notes: [], attachments: [] };
      db.workorders.set([wo, ...db.workorders.all()]);
      return wo;
    },
    update: (id: string, patch: Partial<WorkOrder>) =>
      db.workorders.set(
        db.workorders.all().map((w) => (w.id === id ? { ...w, ...patch, updatedAt: new Date().toISOString() } : w))
      ),
    addNote: (id: string, userId: string, text: string) =>
      db.workorders.set(
        db.workorders.all().map((w) =>
          w.id === id
            ? { ...w, notes: [...w.notes, { id: uid(), userId, text, at: new Date().toISOString() }], updatedAt: new Date().toISOString() }
            : w
        )
      ),
    remove: (id: string) => db.workorders.set(db.workorders.all().filter((w) => w.id !== id)),
  };
}

export function useAssets(tenantId?: string) {
  const [all] = useReactiveKey(() => db.assets.all());
  const list = tenantId ? all.filter((a) => a.tenantId === tenantId) : all;
  return {
    list,
    create: (a: Omit<Asset, "id">) => {
      const na: Asset = { ...a, id: "a_" + uid() };
      db.assets.set([...db.assets.all(), na]);
      return na;
    },
    update: (id: string, patch: Partial<Asset>) =>
      db.assets.set(db.assets.all().map((a) => (a.id === id ? { ...a, ...patch } : a))),
    remove: (id: string) => db.assets.set(db.assets.all().filter((a) => a.id !== id)),
  };
}

export function usePMs(tenantId?: string) {
  const [all] = useReactiveKey(() => db.pms.all());
  const list = tenantId ? all.filter((p) => p.tenantId === tenantId) : all;
  return {
    list,
    create: (p: Omit<PMSchedule, "id">) => {
      const np: PMSchedule = { ...p, id: "pm_" + uid() };
      db.pms.set([...db.pms.all(), np]);
      return np;
    },
    update: (id: string, patch: Partial<PMSchedule>) =>
      db.pms.set(db.pms.all().map((p) => (p.id === id ? { ...p, ...patch } : p))),
    remove: (id: string) => db.pms.set(db.pms.all().filter((p) => p.id !== id)),
  };
}

export function login(session: Session) {
  db.session.set(session);
}
export function logout() {
  db.session.set(null);
}