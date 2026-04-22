import { Asset, PMSchedule, Tenant, User, WorkOrder } from "@/lib/types";

const uid = (p: string, i: number) => `${p}_${i}_${Math.random().toString(36).slice(2, 6)}`;
const daysFromNow = (d: number) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString();
};

export function seedDatabase() {
  const tenants: Tenant[] = [
    { id: "t_acme", name: "Acme Property Group", plan: "Pro", createdAt: daysFromNow(-90), seats: 12, status: "active" },
    { id: "t_north", name: "Northwind Facilities", plan: "Business", createdAt: daysFromNow(-180), seats: 28, status: "active" },
    { id: "t_sun", name: "Sunset Realty", plan: "Starter", createdAt: daysFromNow(-20), seats: 4, status: "trial" },
  ];

  const users: User[] = [
    // Acme
    { id: "u_acme_m1", tenantId: "t_acme", name: "Sarah Chen", email: "sarah@acme.com", role: "manager" },
    { id: "u_acme_t1", tenantId: "t_acme", name: "Marcus Lee", email: "marcus@acme.com", role: "technician" },
    { id: "u_acme_t2", tenantId: "t_acme", name: "Diego Rivera", email: "diego@acme.com", role: "technician" },
    { id: "u_acme_c1", tenantId: "t_acme", name: "Olivia Park", email: "olivia@tenant.com", role: "client", property: "Maple Heights", unit: "204" },
    { id: "u_acme_c2", tenantId: "t_acme", name: "James Wright", email: "james@tenant.com", role: "client", property: "Maple Heights", unit: "311" },
    // Northwind
    { id: "u_north_m1", tenantId: "t_north", name: "Priya Patel", email: "priya@northwind.com", role: "manager" },
    { id: "u_north_t1", tenantId: "t_north", name: "Ben Cole", email: "ben@northwind.com", role: "technician" },
    { id: "u_north_c1", tenantId: "t_north", name: "Emma Stone", email: "emma@tenant.com", role: "client", property: "Harbor Lofts", unit: "12B" },
    // Sunset
    { id: "u_sun_m1", tenantId: "t_sun", name: "Liam Brooks", email: "liam@sunset.com", role: "manager" },
    { id: "u_sun_t1", tenantId: "t_sun", name: "Aisha Khan", email: "aisha@sunset.com", role: "technician" },
    // super admin
    { id: "u_root", tenantId: "*", name: "Platform Admin", email: "admin@maticore.io", role: "super_admin" },
  ];

  const assets: Asset[] = [
    { id: "a1", tenantId: "t_acme", name: "Rooftop HVAC Unit A", category: "HVAC", location: "Maple Heights — Roof", serial: "HV-44821", installedAt: daysFromNow(-1100), status: "operational" },
    { id: "a2", tenantId: "t_acme", name: "Boiler #2", category: "Plumbing", location: "Basement", serial: "BL-22193", installedAt: daysFromNow(-700), status: "maintenance" },
    { id: "a3", tenantId: "t_acme", name: "Elevator East", category: "Elevator", location: "Lobby", serial: "EL-9912", installedAt: daysFromNow(-2200), status: "operational" },
    { id: "a4", tenantId: "t_acme", name: "Backup Generator", category: "Electrical", location: "Garage", serial: "GN-7781", installedAt: daysFromNow(-500), status: "operational" },
    { id: "a5", tenantId: "t_north", name: "Cooling Tower 1", category: "HVAC", location: "Harbor Lofts", serial: "CT-1009", installedAt: daysFromNow(-900), status: "operational" },
    { id: "a6", tenantId: "t_north", name: "Fire Pump", category: "Safety", location: "Mech Room", serial: "FP-5523", installedAt: daysFromNow(-1500), status: "operational" },
    { id: "a7", tenantId: "t_sun", name: "Pool Pump", category: "Plumbing", location: "Pool Deck", serial: "PP-301", installedAt: daysFromNow(-300), status: "operational" },
  ];

  const workorders: WorkOrder[] = [
    { id: "wo1", tenantId: "t_acme", title: "AC not cooling in unit 204", description: "Tenant reports AC blowing warm air since this morning.", status: "assigned", priority: "high", category: "HVAC", assetId: "a1", assigneeId: "u_acme_t1", requesterId: "u_acme_c1", dueDate: daysFromNow(1), createdAt: daysFromNow(-1), updatedAt: daysFromNow(0), notes: [], attachments: [] },
    { id: "wo2", tenantId: "t_acme", title: "Leaking faucet in kitchen", description: "Slow drip from cold tap.", status: "new", priority: "low", category: "Plumbing", requesterId: "u_acme_c2", dueDate: daysFromNow(5), createdAt: daysFromNow(-2), updatedAt: daysFromNow(-2), notes: [], attachments: [] },
    { id: "wo3", tenantId: "t_acme", title: "Quarterly elevator inspection", description: "Auto-generated PM task.", status: "in_progress", priority: "medium", category: "Elevator", assetId: "a3", assigneeId: "u_acme_t2", requesterId: "u_acme_m1", dueDate: daysFromNow(2), createdAt: daysFromNow(-3), updatedAt: daysFromNow(-1), notes: [{ id: "n1", userId: "u_acme_t2", text: "Started inspection, cab lighting OK.", at: daysFromNow(-1) }], attachments: [] },
    { id: "wo4", tenantId: "t_acme", title: "Replace lobby lightbulbs", description: "5 bulbs out near reception.", status: "completed", priority: "low", category: "Electrical", assigneeId: "u_acme_t1", requesterId: "u_acme_m1", dueDate: daysFromNow(-2), createdAt: daysFromNow(-7), updatedAt: daysFromNow(-1), notes: [], attachments: [] },
    { id: "wo5", tenantId: "t_acme", title: "Generator load test overdue", description: "Annual maintenance.", status: "new", priority: "urgent", category: "Electrical", assetId: "a4", requesterId: "u_acme_m1", dueDate: daysFromNow(-3), createdAt: daysFromNow(-10), updatedAt: daysFromNow(-10), notes: [], attachments: [] },
    { id: "wo6", tenantId: "t_acme", title: "Paint touch-up hallway 3F", description: "", status: "pending_review", priority: "low", category: "General", assigneeId: "u_acme_t2", requesterId: "u_acme_m1", dueDate: daysFromNow(0), createdAt: daysFromNow(-5), updatedAt: daysFromNow(-1), notes: [], attachments: [] },
    { id: "wo7", tenantId: "t_north", title: "Cooling tower water treatment", description: "Monthly chemical balance.", status: "assigned", priority: "medium", category: "HVAC", assetId: "a5", assigneeId: "u_north_t1", requesterId: "u_north_m1", dueDate: daysFromNow(3), createdAt: daysFromNow(-1), updatedAt: daysFromNow(0), notes: [], attachments: [] },
    { id: "wo8", tenantId: "t_north", title: "Fire pump test", description: "Weekly test.", status: "in_progress", priority: "high", category: "Safety", assetId: "a6", assigneeId: "u_north_t1", requesterId: "u_north_m1", dueDate: daysFromNow(0), createdAt: daysFromNow(-1), updatedAt: daysFromNow(0), notes: [], attachments: [] },
    { id: "wo9", tenantId: "t_sun", title: "Pool pump priming issue", description: "Pump losing prime overnight.", status: "new", priority: "medium", category: "Plumbing", assetId: "a7", requesterId: "u_sun_m1", dueDate: daysFromNow(2), createdAt: daysFromNow(0), updatedAt: daysFromNow(0), notes: [], attachments: [] },
  ];

  const pms: PMSchedule[] = [
    { id: "pm1", tenantId: "t_acme", title: "HVAC filter replacement", recurrence: "monthly", assetId: "a1", category: "HVAC", nextRun: daysFromNow(7), active: true },
    { id: "pm2", tenantId: "t_acme", title: "Boiler annual service", recurrence: "annual", assetId: "a2", category: "Plumbing", nextRun: daysFromNow(45), active: true },
    { id: "pm3", tenantId: "t_acme", title: "Elevator inspection", recurrence: "quarterly", assetId: "a3", category: "Elevator", nextRun: daysFromNow(15), active: true },
    { id: "pm4", tenantId: "t_acme", title: "Generator load test", recurrence: "annual", assetId: "a4", category: "Electrical", nextRun: daysFromNow(-3), active: true },
    { id: "pm5", tenantId: "t_north", title: "Cooling tower treatment", recurrence: "monthly", assetId: "a5", category: "HVAC", nextRun: daysFromNow(10), active: true },
    { id: "pm6", tenantId: "t_north", title: "Fire pump weekly test", recurrence: "weekly", assetId: "a6", category: "Safety", nextRun: daysFromNow(2), active: true },
    { id: "pm7", tenantId: "t_sun", title: "Pool chemical check", recurrence: "weekly", assetId: "a7", category: "Plumbing", nextRun: daysFromNow(1), active: true },
  ];

  return { tenants, users, workorders, assets, pms };
}