import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandMark, PillButton } from "@/components/Shell";
import { ArrowUpRight, Radar, Brain, Award, LineChart, Sparkles, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  { icon: Radar, title: "Skill Gap Intelligence", desc: "Radar-visualized proficiency gaps mapped against role-based targets, refreshed as learners grow." },
  { icon: Brain, title: "AI-narrated recommendations", desc: "Claude Sonnet 5 synthesizes each learner's profile into an executive-quality development plan." },
  { icon: LineChart, title: "Program-level analytics", desc: "Enrollment, completion, and cohort velocity across every course, department, and skill." },
  { icon: Award, title: "Verified certificates", desc: "Automatic issuance on quiz pass, downloadable as a signed PDF and a shareable in-app page." },
  { icon: Sparkles, title: "Adaptive learning paths", desc: "Every recommendation is scored against the learner's live skill deltas and career direction." },
  { icon: ShieldCheck, title: "Role-based access", desc: "Learners, trainers, and administrators have purpose-built dashboards and permissions." },
];

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const goApp = () => {
    if (!user) navigate("/login");
    else navigate(user.role === "admin" ? "/app/admin" : user.role === "trainer" ? "/app/trainer" : "/app/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F4F7FB]">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#070B14]/70 border-b border-[#1B2638]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-3">
            <Link to="/login" data-testid="landing-signin-btn" className="text-sm text-[#8793A8] hover:text-white transition-colors">Sign in</Link>
            <PillButton data-testid="landing-get-started-btn" onClick={() => navigate("/register")}>
              Get started <ArrowUpRight size={14} />
            </PillButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden grain">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 20%, rgba(124,92,255,0.35), transparent 40%), radial-gradient(circle at 85% 30%, rgba(53,214,200,0.18), transparent 45%)`,
          }}
        />
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32 grid md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7 animate-fade-in-up">
            <div className="eyebrow mb-5" data-testid="landing-eyebrow">Enterprise Capacity Building · v1.0</div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-tighter">
              Close the gap between <span className="text-teal">who your team is</span> and <span className="text-violet">who they need to become</span>.
            </h1>
            <p className="mt-6 text-[#8793A8] text-base md:text-lg max-w-2xl leading-relaxed">
              Capacity Connect maps live skills against role targets, generates personalized learning paths, and issues verified certificates —
              all inside one calm, premium enterprise workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PillButton data-testid="hero-launch-btn" onClick={goApp}>
                Launch the platform <ArrowUpRight size={14} />
              </PillButton>
              <PillButton variant="secondary" data-testid="hero-signin-btn" onClick={() => navigate("/login")}>
                Try demo accounts
              </PillButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-xs text-[#8793A8]">
              <div><span className="text-white font-display text-2xl block tabular-nums">6</span>curated courses</div>
              <div><span className="text-white font-display text-2xl block tabular-nums">12</span>tracked skills</div>
              <div><span className="text-white font-display text-2xl block tabular-nums">3</span>role-based dashboards</div>
              <div><span className="text-white font-display text-2xl block tabular-nums">AI</span>gap narrative</div>
            </div>
          </div>
          <div className="md:col-span-5 relative">
            <div className="relative rounded-2xl border border-[#1B2638] bg-[#0D1422] p-6 gradient-border overflow-hidden">
              <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjBkYXRhJTIwdmlzdWFsaXphdGlvbiUyMG5lb24lMjBub2Rlc3xlbnwwfHx8fDE3ODg1OTE2MTV8MA&ixlib=rb-4.1.0&q=85')`, backgroundSize: "cover", backgroundPosition: "center", mixBlendMode: "screen" }} />
              <div className="relative">
                <div className="eyebrow">Live skill map</div>
                <div className="mt-3 font-display text-xl">Jordan Reyes · Sr. Program Manager</div>
                <div className="mt-6 space-y-3">
                  {[
                    { name: "Executive Communication", cur: 45, target: 85, color: "violet" },
                    { name: "AI & Automation", cur: 35, target: 80, color: "teal" },
                    { name: "Strategic Leadership", cur: 55, target: 85, color: "violet" },
                    { name: "Data Storytelling", cur: 40, target: 80, color: "teal" },
                  ].map((s) => (
                    <div key={s.name}>
                      <div className="flex justify-between text-xs text-[#8793A8] mb-1">
                        <span>{s.name}</span>
                        <span className="tabular-nums">{s.cur}% → {s.target}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#1B2638] overflow-hidden relative">
                        <div className={`absolute top-0 left-0 h-full ${s.color === "violet" ? "bg-violet" : "bg-teal"}`} style={{ width: `${s.cur}%` }} />
                        <div className="absolute top-0 h-full w-px bg-white/40" style={{ left: `${s.target}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-lg border border-violet/30 bg-violet/5 p-3">
                  <div className="eyebrow text-violet">AI Insight</div>
                  <div className="mt-1 text-sm text-[#F4F7FB]/90">Your priority is Executive Communication (40% gap). Pair with Data Storytelling for 2× stakeholder impact.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 md:py-24">
        <div className="mb-14">
          <div className="eyebrow">Why teams choose Capacity Connect</div>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">A learning platform designed for the way modern organizations actually grow.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <div key={f.title} className="rounded-xl border border-[#1B2638] bg-[#0D1422] p-6 hover-lift" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="h-10 w-10 rounded-md bg-[#131C2E] border border-[#1B2638] flex items-center justify-center mb-4">
                <f.icon size={18} className="text-teal" strokeWidth={1.5} />
              </div>
              <div className="font-display text-lg font-medium">{f.title}</div>
              <p className="mt-2 text-sm text-[#8793A8] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24">
        <div className="relative rounded-2xl border border-[#1B2638] bg-[#0D1422] p-10 md:p-14 overflow-hidden gradient-border">
          <div className="relative grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <div className="eyebrow">Ready when you are</div>
              <h3 className="mt-3 font-display text-3xl md:text-4xl font-semibold tracking-tight">Sign in with a demo account and explore the full platform in under 60 seconds.</h3>
              <p className="mt-3 text-[#8793A8]">Learner, Trainer, and Admin dashboards are pre-populated with realistic sample data.</p>
            </div>
            <div className="flex md:justify-end">
              <PillButton data-testid="cta-launch-btn" onClick={goApp}>Launch platform <ArrowUpRight size={14} /></PillButton>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1B2638] py-8">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#8793A8]">
          <BrandMark />
          <div>© {new Date().getFullYear()} Capacity Connect. A demonstration platform.</div>
        </div>
      </footer>
    </div>
  );
}
