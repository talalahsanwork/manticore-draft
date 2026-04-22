import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  Boxes,
  BarChart3,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  Building2,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/maticore/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, useTenants, useUsers, logout } from "@/hooks/useStore";
import { db } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/work-orders", icon: ClipboardList, label: "Work Orders" },
  { to: "/app/maintenance", icon: CalendarClock, label: "Maintenance" },
  { to: "/app/assets", icon: Boxes, label: "Assets" },
  { to: "/app/reports", icon: BarChart3, label: "Reports" },
  { to: "/app/settings", icon: Settings, label: "Settings" },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-4 bg-sidebar p-4">
      <Link to="/app/dashboard" onClick={onNav} className="px-2 py-2">
        <Logo />
      </Link>
      <nav className="flex flex-col gap-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            onClick={onNav}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
              )
            }
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-sidebar-border bg-card/40 p-3 text-xs text-muted-foreground">
        <div className="font-semibold text-foreground mb-1">Pro tip</div>
        Set up preventative maintenance schedules to auto-generate work orders.
      </div>
    </div>
  );
}

export function AppShell({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const session = useSession();
  const navigate = useNavigate();
  const { list: tenants } = useTenants();
  const { all: users } = useUsers();
  const [mobile, setMobile] = useState(false);
  const loc = useLocation();

  if (!session) {
    navigate("/app", { replace: true });
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    navigate("/app/dashboard", { replace: true });
    return null;
  }

  const tenant = tenants.find((t) => t.id === session.tenantId);
  const user = users.find((u) => u.id === session.userId);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border md:block">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
          <Sheet open={mobile} onOpenChange={setMobile}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent onNav={() => setMobile(false)} />
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 w-72">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search work orders, assets..." className="h-7 border-0 bg-transparent p-0 focus-visible:ring-0" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  <span className="max-w-[140px] truncate">{tenant?.name ?? "Tenant"}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch organization</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tenants.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => {
                      // Find a user of same role in target tenant, or fall back to any
                      const candidate =
                        users.find((u) => u.tenantId === t.id && u.role === session.role) ||
                        users.find((u) => u.tenantId === t.id);
                      if (candidate) {
                        db.session.set({ userId: candidate.id, tenantId: t.id, role: candidate.role });
                      }
                    }}
                  >
                    {t.name}
                    {t.id === session.tenantId && <span className="ml-auto text-xs text-primary">●</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">
                      {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden text-left md:block">
                    <div className="text-xs font-medium leading-none">{user?.name}</div>
                    <div className="text-[10px] capitalize text-muted-foreground">{session.role}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main key={loc.pathname} className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}