import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsers, login } from "@/hooks/useStore";
import { useState } from "react";
import { AuthLayout } from "../app/Login";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { all: users } = useUsers();
  const [email, setEmail] = useState("admin@maticore.io");

  const handleLogin = () => {
    const root = users.find((u) => u.role === "super_admin");
    if (!root) return;
    login({ userId: root.id, tenantId: "*", role: "super_admin" });
    toast.success("Welcome, Platform Admin");
    navigate("/admin/dashboard");
  };

  return (
    <AuthLayout
      title="Platform Admin"
      subtitle="Super Admin portal"
      footer={<><Link to="/app" className="hover:text-foreground">Team portal →</Link><Link to="/client" className="hover:text-foreground">Tenant portal →</Link></>}
    >
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
        <ShieldCheck className="h-4 w-4" /> Restricted area · platform owner only
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Password</Label>
          <Input type="password" defaultValue="••••••••" />
        </div>
        <Button onClick={handleLogin}>Access platform</Button>
        <p className="text-center text-xs text-muted-foreground">Demo mode — credentials accepted.</p>
      </div>
    </AuthLayout>
  );
}