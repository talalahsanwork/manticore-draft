import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession, useWorkOrders } from "@/hooks/useStore";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useMemo } from "react";

const COLORS = ["hsl(217 91% 60%)", "hsl(38 92% 50%)", "hsl(199 89% 48%)", "hsl(280 70% 60%)", "hsl(142 71% 45%)"];

export default function Reports() {
  return (
    <AppShell allowedRoles={["manager"]}>
      <Inner />
    </AppShell>
  );
}

function Inner() {
  const session = useSession()!;
  const { list } = useWorkOrders(session.tenantId);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    list.forEach((w) => (map[w.status] = (map[w.status] ?? 0) + 1));
    return Object.entries(map).map(([k, v]) => ({ name: k.replace("_", " "), value: v }));
  }, [list]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    list.forEach((w) => (map[w.category] = (map[w.category] ?? 0) + 1));
    return Object.entries(map).map(([k, v]) => ({ name: k, count: v }));
  }, [list]);

  const completed = list.filter((w) => w.status === "completed").length;
  const pending = list.length - completed;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Operational insights from your work order data.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total work orders" value={list.length} />
        <Stat label="Completed" value={completed} accent="success" />
        <Stat label="Pending" value={pending} accent="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Status distribution</CardTitle></CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(240 4% 10%)", border: "1px solid hsl(240 4% 18%)", borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Work orders by category</CardTitle></CardHeader>
          <CardContent style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={byCategory}>
                <XAxis dataKey="name" stroke="hsl(240 5% 65%)" fontSize={12} />
                <YAxis stroke="hsl(240 5% 65%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(240 4% 10%)", border: "1px solid hsl(240 4% 18%)", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  const cls = accent === "success" ? "text-success" : accent === "warning" ? "text-warning" : "text-foreground";
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`mt-2 text-3xl font-bold ${cls}`}>{value}</div>
      </CardContent>
    </Card>
  );
}