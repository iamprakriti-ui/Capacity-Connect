import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { BrandMark, PillButton } from "@/components/Shell";
import { ArrowRight, Mail } from "lucide-react";
import { formatError } from "@/lib/api";

const DEMO = [
  { label: "Learner", email: "learner@capacityconnect.com", password: "Learner@2026" },
  { label: "Trainer", email: "trainer@capacityconnect.com", password: "Trainer@2026" },
  { label: "Admin",   email: "admin@capacityconnect.com",   password: "Admin@2026" },
];

function AuthShell({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#070B14] text-[#F4F7FB] flex">
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-12 border-r border-[#1B2638] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `radial-gradient(circle at 20% 30%, rgba(124,92,255,0.4), transparent 45%), radial-gradient(circle at 80% 70%, rgba(53,214,200,0.25), transparent 45%)` }} />
        <Link to="/" className="relative"><BrandMark /></Link>
        <div className="relative">
          <div className="eyebrow mb-4">Skill Gap Intelligence</div>
          <div className="font-display text-4xl leading-tight tracking-tight">
            "The dashboard doesn't just tell me what to learn — it tells me why, in a sentence I can act on today."
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet/40 to-teal/30 flex items-center justify-center font-display">JR</div>
            <div>
              <div className="text-sm font-medium">Jordan Reyes</div>
              <div className="text-xs text-[#8793A8]">Sr. Program Manager · Global Operations</div>
            </div>
          </div>
        </div>
        <div className="relative text-xs text-[#8793A8]">Enterprise-grade · Role-based · AI-augmented</div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 md:px-16 py-12">
        <div className="lg:hidden mb-10"><BrandMark /></div>
        <div className="max-w-md w-full">
          <div className="eyebrow mb-3">{subtitle}</div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-8">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
}

function GoogleButton() {
  const handleClick = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  return (
    <button
      data-testid="google-signin-btn"
      onClick={handleClick}
      type="button"
      className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-[#1B2638] bg-[#131C2E] hover:border-violet/50 px-4 py-2.5 text-sm font-medium transition-colors"
    >
      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#EA4335" d="M12 10v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3 0-5.5-2.5-5.5-5.6s2.5-5.6 5.5-5.6c1.7 0 2.9.7 3.5 1.3l2.4-2.3C16.4 3.7 14.4 3 12 3 6.9 3 3 6.9 3 12s3.9 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.1-1.3H12z"/></svg>
      Continue with Google
    </button>
  );
}

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === "admin" ? "/app/admin" : user.role === "trainer" ? "/app/trainer" : "/app/dashboard");
    } catch (e) {
      setErr(formatError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in to your workspace" subtitle="Welcome back">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs text-[#8793A8] mb-1.5 block">Work email</label>
          <input
            data-testid="login-email"
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md bg-[#070B14] border border-[#1B2638] px-3 py-2.5 text-sm focus:outline-none focus:border-violet transition-colors"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label className="text-xs text-[#8793A8] mb-1.5 block">Password</label>
          <input
            data-testid="login-password"
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md bg-[#070B14] border border-[#1B2638] px-3 py-2.5 text-sm focus:outline-none focus:border-violet transition-colors"
          />
        </div>
        {err && <div data-testid="login-error" className="text-xs text-red-400">{err}</div>}
        <PillButton data-testid="login-submit" type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"} <ArrowRight size={14} />
        </PillButton>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-[#8793A8]">
        <div className="h-px flex-1 bg-[#1B2638]" /> or <div className="h-px flex-1 bg-[#1B2638]" />
      </div>
      <GoogleButton />
      <div className="mt-6 text-sm text-[#8793A8]">
        New to Capacity Connect? <Link to="/register" className="text-white underline underline-offset-4">Create account</Link>
      </div>
      <div className="mt-8 rounded-lg border border-[#1B2638] bg-[#0D1422] p-4">
        <div className="eyebrow mb-3 flex items-center gap-2"><Mail size={12} /> Demo accounts</div>
        <div className="space-y-1.5 text-xs">
          {DEMO.map((d) => (
            <button
              key={d.email}
              data-testid={`demo-${d.label.toLowerCase()}-btn`}
              onClick={() => { setEmail(d.email); setPassword(d.password); }}
              type="button"
              className="w-full flex items-center justify-between text-left hover:text-white text-[#8793A8]"
            >
              <span className="capitalize text-white">{d.label}</span>
              <span className="tabular-nums">{d.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "learner" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === "trainer" ? "/app/trainer" : "/app/dashboard");
    } catch (e) {
      setErr(formatError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your workspace" subtitle="Get started">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs text-[#8793A8] mb-1.5 block">Full name</label>
          <input data-testid="register-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md bg-[#070B14] border border-[#1B2638] px-3 py-2.5 text-sm focus:outline-none focus:border-violet transition-colors" />
        </div>
        <div>
          <label className="text-xs text-[#8793A8] mb-1.5 block">Work email</label>
          <input data-testid="register-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-md bg-[#070B14] border border-[#1B2638] px-3 py-2.5 text-sm focus:outline-none focus:border-violet transition-colors" />
        </div>
        <div>
          <label className="text-xs text-[#8793A8] mb-1.5 block">Password</label>
          <input data-testid="register-password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-md bg-[#070B14] border border-[#1B2638] px-3 py-2.5 text-sm focus:outline-none focus:border-violet transition-colors" />
        </div>
        <div>
          <label className="text-xs text-[#8793A8] mb-1.5 block">I am joining as a…</label>
          <div className="grid grid-cols-2 gap-2">
            {["learner", "trainer"].map((r) => (
              <button
                key={r}
                type="button"
                data-testid={`role-${r}-btn`}
                onClick={() => setForm({ ...form, role: r })}
                className={`rounded-md border px-3 py-2.5 text-sm capitalize transition-colors ${form.role === r ? "border-violet bg-violet/10 text-white" : "border-[#1B2638] text-[#8793A8] hover:text-white"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {err && <div data-testid="register-error" className="text-xs text-red-400">{err}</div>}
        <PillButton data-testid="register-submit" type="submit" className="w-full justify-center" disabled={loading}>
          {loading ? "Creating…" : "Create account"} <ArrowRight size={14} />
        </PillButton>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-[#8793A8]">
        <div className="h-px flex-1 bg-[#1B2638]" /> or <div className="h-px flex-1 bg-[#1B2638]" />
      </div>
      <GoogleButton />
      <div className="mt-6 text-sm text-[#8793A8]">
        Already have an account? <Link to="/login" className="text-white underline underline-offset-4">Sign in</Link>
      </div>
    </AuthShell>
  );
}
