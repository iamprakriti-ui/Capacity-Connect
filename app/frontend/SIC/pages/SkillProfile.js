import React, { useEffect, useState } from "react";
import { AppShell, PageHeader, Card, PillButton, Progress } from "@/components/Shell";
import api from "@/lib/api";
import { Save, Plus } from "lucide-react";

export default function SkillProfile() {
  const [mySkills, setMySkills] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");

  useEffect(() => {
    Promise.all([api.get("/skills/me"), api.get("/skills")]).then(([m, c]) => {
      setMySkills(m.data.skills || []);
      setCatalog(c.data);
    });
  }, []);

  const update = (i, key, val) => {
    setMySkills((s) => s.map((x, idx) => (idx === i ? { ...x, [key]: parseInt(val, 10) || 0 } : x)));
  };

  const addSkill = (s) => {
    if (mySkills.some((x) => x.skill_id === s.skill_id)) return;
    setMySkills([...mySkills, { skill_id: s.skill_id, name: s.name, category: s.category, current_level: 30, desired_level: 70 }]);
  };

  const remove = (skill_id) => setMySkills((s) => s.filter((x) => x.skill_id !== skill_id));

  const save = async () => {
    setSaving(true);
    setOk("");
    try {
      await api.put("/skills/me", { skills: mySkills });
      setOk("Saved. Recommendations will refresh on your dashboard.");
    } finally {
      setSaving(false);
    }
  };

  const available = catalog.filter((c) => !mySkills.some((s) => s.skill_id === c.skill_id));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Capacity assessment"
        title="Skill Profile"
        subtitle="Rate your current level (0–100) and target level for each skill. Priority gaps automatically drive your recommendations."
        actions={<PillButton data-testid="save-skills-btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save profile"} <Save size={14} /></PillButton>}
      />
      {ok && <div data-testid="skills-saved-toast" className="mb-4 text-xs text-teal">{ok}</div>}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {mySkills.map((s, i) => {
            const gap = Math.max(0, s.desired_level - s.current_level);
            return (
              <Card key={s.skill_id} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="eyebrow">{s.category}</div>
                    <div className="font-display text-lg mt-1">{s.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#8793A8]">Gap</div>
                    <div className={`font-display text-2xl tabular-nums ${gap > 30 ? "text-violet" : gap > 10 ? "text-teal" : "text-white"}`}>{gap}%</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs text-[#8793A8] mb-1.5"><span>Current</span><span className="tabular-nums text-white">{s.current_level}%</span></div>
                    <input type="range" min={0} max={100} step={5} value={s.current_level} onChange={(e) => update(i, "current_level", e.target.value)}
                      data-testid={`skill-current-${s.skill_id}`}
                      className="w-full accent-violet" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[#8793A8] mb-1.5"><span>Target</span><span className="tabular-nums text-white">{s.desired_level}%</span></div>
                    <input type="range" min={0} max={100} step={5} value={s.desired_level} onChange={(e) => update(i, "desired_level", e.target.value)}
                      data-testid={`skill-target-${s.skill_id}`}
                      className="w-full accent-teal" />
                  </div>
                </div>
                <div className="mt-4 relative h-1.5 rounded-full bg-[#1B2638] overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-violet" style={{ width: `${s.current_level}%` }} />
                  <div className="absolute top-0 h-full w-px bg-teal" style={{ left: `${s.desired_level}%` }} />
                </div>
                <div className="mt-3 flex justify-end">
                  <button data-testid={`remove-skill-${s.skill_id}`} onClick={() => remove(s.skill_id)} className="text-xs text-[#8793A8] hover:text-red-400">Remove</button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <div className="eyebrow mb-3">Add skills</div>
            {available.length === 0 && <div className="text-xs text-[#8793A8]">All skills added.</div>}
            <div className="space-y-2">
              {available.map((s) => (
                <button
                  key={s.skill_id}
                  data-testid={`add-skill-${s.skill_id}`}
                  onClick={() => addSkill(s)}
                  className="w-full text-left px-3 py-2 rounded-md border border-[#1B2638] hover:border-violet/50 text-sm transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-white text-sm">{s.name}</div>
                    <div className="text-xs text-[#8793A8]">{s.category}</div>
                  </div>
                  <Plus size={14} className="text-[#8793A8]" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
