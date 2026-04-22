import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTenants, useUsers, login } from "@/hooks/useStore";
import { AuthLayout } from "../app/Login";
import { toast } from "sonner";

export default function ClientLogin() {
  const navigate = useNavigate();
  const { list: tenants } = useTenants();
  const { all: users } = useUsers();
  const [tenantId, setTenantId] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (!tenantId && tenants[0]) setTenantId(tenants[0].id);
  }, [tenants, tenantId]);

  const clientUsers = users.filter((u) => u.tenantId === tenantId && u.role === "client");
  useEffect(() => {
    if (clientUsers[0]) setUserId(clientUsers[0].id);
    else setUserId("");
  }, [tenantId, clientUsers.length]);

  const handleLogin = () => {
    const u = users.find((x) => x.id === userId);
    if (!u) { toast.error("Select a tenant account"); return; }
    login({ userId: u.id, tenantId, role: "client" });
    toast.success(`Welcome, ${u.name}`);
    navigate("/client/dashboard");
  };

  return (
    <AuthLayout
      title="Tenant Portal"
      subtitle="Submit & track requests"
      footer={<><Link to="/admin" className="hover:text-foreground">Admin →</Link><Link to="/app" className="hover:text-foreground">Team portal →</Link></>}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Property</Label>
          <Select value={tenantId} onValueChange={setTenantId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{tenants.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Sign in as</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger><SelectValue placeholder="Pick demo tenant" /></SelectTrigger>
            <SelectContent>{clientUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} — Unit {u.unit}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Password</Label>
          <Input type="password" defaultValue="demo1234" />
        </div>
        <Button onClick={handleLogin}>Enter portal</Button>
      </div>
    </AuthLayout>
  );
}