import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell, PageHeader, Card, StatCard, PillButton, Progress } from "@/components/Shell";
import api from "@/lib/api";
import { BookOpen, Award, Radar as RadarIcon, TrendingUp, Sparkles, ArrowUpRight, Clock } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RRadar, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "@/context/AuthContext";

export default function LearnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [gap, setGap] = useState(null);
  const [enrolls, setEnrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, g, e] = await Promise.all([
          api.get("/learner/dashboard"),
          api.get("/skills/gap-analysis"),
          api.get("/enrollments/me"),
        ]);
        setStats(s.data);
        setGap(g.data);
        setEnrolls(e.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const radarData = (gap?.skills || []).map((s) => ({
    skill: s.name.length > 14 ? s.name.split(" ")[0] : s.name,
    current: s.current_level,
    target: s.desired_level,
  }));

  return (
    <AppShell>
      <PageHeader
        eyebrow={`Welcome back · ${user?.department || "Global"}`}
        title={`Good to see you, ${user?.name?.split(" ")[0]}`}
        subtitle="Your personalized capacity map, curated learning path, and this quarter's development priorities."
        actions={<Link to="/app/catalog"><PillButton data-testid="cta-browse-catalog">Browse catalog <ArrowUpRight size={14} /></PillButton></Link>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard testId="stat-active" label="Active courses" value={stats?.active_courses_count ?? "—"} icon={BookOpen} />
        <StatCard testId="stat-completed" label="Completed" value={stats?.completed_courses_count ?? "—"} icon={TrendingUp} accent="teal" />
        <StatCard testId="stat-certs" label="Certificates" value={stats?.certificates_count ?? "—"} icon={Award} />
        <StatCard testId="stat-progress" label="Avg. progress" value={`${stats?.avg_progress ?? 0}%`} icon={RadarIcon} accent="teal" />
      </div>

      {/* Skill Gap Intelligence */}
      <div className="mt-8 grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow">Skill Gap Intelligence</div>
              <h3 className="mt-2 font-display text-2xl font-semibold">Your live proficiency map</h3>
            </div>
            <Link to="/app/skills" className="text-xs text-[#8793A8] hover:text-white transition-colors">Update skills →</Link>
          </div>
          <div className="h-[320px]">
            {radarData.length > 0 ? (
              <ResponsiveContainer>
                <RadarChart data={radarData} outerRadius="72%">
                  <PolarGrid stroke="#1B2638" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "#8793A8", fontSize: 11 }} />
                  <PolarRadiusAxis stroke="#1B2638" tick={{ fill: "#8793A8", fontSize: 10 }} angle={90} domain={[0, 100]} />
                  <RRadar name="Target" dataKey="target" stroke="#35D6C8" fill="#35D6C8" fillOpacity={0.08} />
                  <RRadar name="Current" dataKey="current" stroke="#7C5CFF" fill="#7C5CFF" fillOpacity={0.25} />
                  <Tooltip contentStyle={{ background: "#0D1422", border: "1px solid #1B2638", borderRadius: 8, color: "#F4F7FB" }} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-[#8793A8]">Complete your skill assessment to see the radar.</div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-[#8793A8]">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet inline-block" /> Current</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal inline-block" /> Target</div>
          </div>
        </Card>

        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="eyebrow flex items-center gap-2 text-violet"><Sparkles size={12} /> AI Advisor · Claude Sonnet 5</div>
          <h3 className="mt-2 font-display text-xl font-semibold">Priority development narrative</h3>
          <div className="mt-4 text-sm leading-relaxed text-[#F4F7FB]/90 whitespace-pre-line" data-testid="ai-narrative">
            {loading ? "Generating your personalized narrative…" : gap?.narrative}
          </div>
          <div className="mt-5 border-t border-[#1B2638] pt-4">
            <div className="eyebrow mb-2">Top priority gaps</div>
            <ul className="space-y-2">
              {(gap?.top_gaps || []).slice(0, 4).map((g) => (
                <li key={g.skill_id} className="flex items-center justify-between text-sm">
                  <span>{g.name}</span>
                  <span className="tabular-nums text-violet font-medium">{g.gap}% gap</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Continue learning */}
      <div className="mt-8">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="eyebrow">Continue learning</div>
            <h3 className="mt-1 font-display text-2xl font-semibold">Active courses</h3>
          </div>
          <Link to="/app/catalog" className="text-xs text-[#8793A8] hover:text-white transition-colors">See all →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolls.filter((e) => !e.completed).slice(0, 3).map((e) => (
            <Link to={`/app/courses/${e.course_id}`} key={e.enrollment_id} data-testid={`active-course-${e.course_id}`}>
              <Card>
                <div className="eyebrow">{e.course_category}</div>
                <div className="mt-2 font-display text-lg font-medium">{e.course_title}</div>
                <div className="text-xs text-[#8793A8] mt-1">{e.course_subtitle}</div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-[#8793A8] mb-1.5">
                    <span>Progress</span>
                    <span className="tabular-nums">{e.progress}%</span>
                  </div>
                  <Progress value={e.progress} />
                </div>
                <div className="mt-4 text-xs text-[#8793A8] flex items-center gap-3">
                  <Clock size={12} /> {e.course_duration_hours}h · {e.completed_lessons?.length || 0}/{e.total_lessons} lessons
                </div>
              </Card>
            </Link>
          ))}
          {enrolls.filter((e) => !e.completed).length === 0 && (
            <Card className="col-span-full text-sm text-[#8793A8]">No active courses. Browse the catalog to enroll.</Card>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="eyebrow">Personalized for you</div>
            <h3 className="mt-1 font-display text-2xl font-semibold">Recommended to close your gaps</h3>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(gap?.recommendations || []).slice(0, 6).map((c) => (
            <Link to={`/app/courses/${c.course_id}`} key={c.course_id} data-testid={`rec-course-${c.course_id}`}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="eyebrow">{c.category} · {c.level}</div>
                    <div className="mt-2 font-display text-lg font-medium">{c.title}</div>
                  </div>
                  <div className="shrink-0 text-xs text-teal border border-teal/40 rounded-md px-2 py-1 tabular-nums">
                    +{c.match_score}
                  </div>
                </div>
                <p className="mt-2 text-xs text-[#8793A8] line-clamp-2">{c.subtitle}</p>
                <div className="mt-4 text-xs text-[#8793A8] flex items-center gap-3">
                  <Clock size={12} /> {c.duration_hours}h · {c.lessons.length} lessons
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
