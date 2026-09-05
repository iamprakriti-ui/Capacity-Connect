import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, LayoutDashboard, BookOpen, Award, Radar, GraduationCap, Users, ShieldCheck, User } from "lucide-react";

export function BrandMark({ className = "" }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative h-8 w-8 rounded-md bg-gradient-to-br from-violet to-teal flex items-center justify-center shadow-[0_0_18px_-2px_rgba(124,92,255,0.6)]">
        <div className="h-3 w-3 rounded-sm bg-[#070B14]" />
      </div>
      <div className="font-display text-[15px] tracking-[0.14em] font-semibold text-[#F4F7FB]">
        CAPACITY<span className="text-teal">·</span>CONNECT
      </div>
    </div>
  );
}

const LEARNER_NAV = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/catalog", label: "Course Catalog", icon: BookOpen },
  { to: "/app/skills", label: "Skill Profile", icon: Radar },
  { to: "/app/certificates", label: "Certificates", icon: Award },
];
const TRAINER_NAV = [
  { to: "/app/trainer", label: "Trainer Studio", icon: GraduationCap },
  { to: "/app/trainer/learners", label: "Learners", icon: Users },
  { to: "/app/catalog", label: "Catalog", icon: BookOpen },
];
const ADMIN_NAV = [
  { to: "/app/admin", label: "Platform Analytics", icon: ShieldCheck },
  { to: "/app/admin/users", label: "Users", icon: Users },
  { to: "/app/catalog", label: "Catalog", icon: BookOpen },
];

export function AppShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const nav = user?.role === "admin" ? ADMIN_NAV : user?.role === "trainer" ? TRAINER_NAV : LEARNER_NAV;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F4F7FB] flex">
      <aside className="w-[240px] shrink-0 border-r border-[#1B2638] bg-[#0A101C] hidden md:flex md:flex-col">
        <div className="px-5 py-5 border-b border-[#1B2638]">
          <Link to="/app/dashboard" data-testid="sidebar-brand-link">
            <BrandMark />
          </Link>
        </div>
        <nav className="flex-1 py-4 px-3 flex flex-col gap-0.5">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to}
                data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-[#131C2E] text-white border-l-2 border-violet pl-[10px]"
                    : "text-[#8793A8] hover:text-white hover:bg-[#131C2E]/60"
                }`}
              >
                <Icon size={16} strokeWidth={1.6} />
                <span className="font-body">{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-[#1B2638]">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet/30 to-teal/20 border border-[#1B2638] flex items-center justify-center text-xs font-display uppercase">
              {user?.name?.charAt(0) || <User size={14} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium truncate">{user?.name}</div>
              <div className="text-[11px] text-[#8793A8] truncate capitalize">{user?.role}</div>
            </div>
          </div>
          <button
            data-testid="logout-btn"
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] text-[#8793A8] hover:text-white hover:bg-[#131C2E] transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-30 backdrop-blur-xl bg-[#070B14]/80 border-b border-[#1B2638] px-4 py-3 flex items-center justify-between">
          <BrandMark />
          <button data-testid="mobile-logout" onClick={handleLogout} className="text-[#8793A8]">
            <LogOut size={16} />
          </button>
        </div>
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 py-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-fade-in-up">
      <div>
        {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-[#8793A8] max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "", ...rest }) {
  return (
    <div className={`rounded-xl border border-[#1B2638] bg-[#0D1422] p-6 hover-lift ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, accent = "violet", testId }) {
  const color = accent === "teal" ? "text-teal" : "text-violet";
  return (
    <Card className="relative overflow-hidden" data-testid={testId}>
      <div className="flex items-start justify-between">
        <div>
          <div className="eyebrow">{label}</div>
          <div className={`mt-3 font-display text-3xl font-semibold tabular-nums ${color}`}>{value}</div>
        </div>
        {Icon && (
          <div className="h-10 w-10 rounded-md bg-[#131C2E] border border-[#1B2638] flex items-center justify-center">
            <Icon size={18} strokeWidth={1.5} className="text-[#8793A8]" />
          </div>
        )}
      </div>
    </Card>
  );
}

export function PillButton({ children, variant = "primary", className = "", ...rest }) {
  const styles = {
    primary: "bg-violet text-white hover:bg-violet-hover glow-primary",
    secondary: "bg-[#131C2E] text-white border border-[#1B2638] hover:border-violet/50",
    ghost: "text-[#8793A8] hover:text-white",
  }[variant];
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Progress({ value, className = "" }) {
  return (
    <div className={`h-1.5 rounded-full bg-[#1B2638] overflow-hidden ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-violet to-teal transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
