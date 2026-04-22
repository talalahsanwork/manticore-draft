import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/maticore/Logo";
import { useTenants, useUsers, login } from "@/hooks/useStore";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function AppLogin() {
  const navigate = useNavigate();
  const { list: tenants } = useTenants();
  const { all: users } = useUsers();
  const [tenantId, setTenantId] = useState("");
  const [role, setRole] = useState<"manager" | "technician">("manager");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!tenantId && tenants[0]) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);

  const handleLogin = () => {
    const user = users.find((u) => u.tenantId === tenantId && u.role === role);
    if (!user) {
      toast.error("No user found for that role/tenant");
      return;
    }
    login({ userId: user.id, tenantId, role });
    toast.success(`Welcome, ${user.name}`);
    navigate("/app/dashboard");
  };

  return (
    <AuthLayout
      title="Sign in to Maticore"
      subtitle="Manager & Technician portal"
      footer={
        <>
          <Link to="/admin" className="hover:text-foreground">Super Admin →</Link>
          <Link to="/client" className="hover:text-foreground">Tenant portal →</Link>
        </>
      }
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Organization</Label>
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger><SelectValue placeholder="Select organization" /></SelectTrigger>
            <SelectContent>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="technician">Technician</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="any@email.com (demo)" />
        </div>
        <Button className="mt-2 gap-2" onClick={handleLogin}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-xs text-muted-foreground">Demo mode — any details work.</p>
      </div>
    </AuthLayout>
  );
}

export function AuthLayout({
  title, subtitle, children, footer, accent = "primary",
}: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode; accent?: "primary" | "info" | "success" }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-hero">
        <div className="m-auto max-w-md p-10">
          <Logo />
          <h2 className="mt-10 text-3xl font-bold">Maintenance, made effortless.</h2>
          <p className="mt-4 text-muted-foreground">
            One platform for managers, technicians, and tenants. Track work orders end-to-end, schedule preventative maintenance, and keep every property running smoothly.
          </p>
          <div className="mt-10 grid gap-3">
            {["Multi-tenant from day one", "Mobile-first technician view", "Recurring PM templates", "Tenant request portal"].map((x) => (
              <div key={x} className="flex items-center gap-2 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {x}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col p-8">
        <div className="lg:hidden mb-8"><Logo /></div>
        <div className="m-auto w-full max-w-sm">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-wider text-primary">{subtitle}</div>
            <h1 className="mt-2 text-2xl font-bold">{title}</h1>
          </div>
          {children}
        </div>
        <div className="mt-8 flex justify-between text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back home</Link>
          <div className="flex gap-3">{footer}</div>
        </div>
      </div>
    </div>
  );
}