import { Tenant, User, WorkOrder, Asset, PMSchedule, Session } from "./types";
import { seedDatabase } from "@/data/seed";

const KEYS = {
  tenants: "maticore_tenants",
  users: "maticore_users",
  workorders: "maticore_workorders",
  assets: "maticore_assets",
  pms: "maticore_pms",
  session: "maticore_session",
  seeded: "maticore_seeded_v1",
};

function read<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T) {
  localStorage.setItem(k, JSON.stringify(v));
  window.dispatchEvent(new CustomEvent("maticore:update", { detail: k }));
}

export function ensureSeed() {
  if (localStorage.getItem(KEYS.seeded)) return;
  const seed = seedDatabase();
  localStorage.setItem(KEYS.tenants, JSON.stringify(seed.tenants));
  localStorage.setItem(KEYS.users, JSON.stringify(seed.users));
  localStorage.setItem(KEYS.workorders, JSON.stringify(seed.workorders));
  localStorage.setItem(KEYS.assets, JSON.stringify(seed.assets));
  localStorage.setItem(KEYS.pms, JSON.stringify(seed.pms));
  localStorage.setItem(KEYS.seeded, "1");
}

export const db = {
  tenants: {
    all: () => read<Tenant[]>(KEYS.tenants, []),
    set: (v: Tenant[]) => write(KEYS.tenants, v),
  },
  users: {
    all: () => read<User[]>(KEYS.users, []),
    set: (v: User[]) => write(KEYS.users, v),
  },
  workorders: {
    all: () => read<WorkOrder[]>(KEYS.workorders, []),
    set: (v: WorkOrder[]) => write(KEYS.workorders, v),
  },
  assets: {
    all: () => read<Asset[]>(KEYS.assets, []),
    set: (v: Asset[]) => write(KEYS.assets, v),
  },
  pms: {
    all: () => read<PMSchedule[]>(KEYS.pms, []),
    set: (v: PMSchedule[]) => write(KEYS.pms, v),
  },
  session: {
    get: () => read<Session | null>(KEYS.session, null),
    set: (s: Session | null) => {
      if (s) localStorage.setItem(KEYS.session, JSON.stringify(s));
      else localStorage.removeItem(KEYS.session);
      window.dispatchEvent(new CustomEvent("maticore:update", { detail: KEYS.session }));
    },
  },
  resetAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

export const uid = () => Math.random().toString(36).slice(2, 10);