import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppShell, PageHeader, Card, Progress } from "@/components/Shell";
import api from "@/lib/api";
import { Search, Clock, Star } from "lucide-react";

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [cats, setCats] = useState([]);
  const [cat, setCat] = useState("All");
  const [level, setLevel] = useState("All");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses/categories").then((r) => setCats(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/courses", { params: { category: cat, level, q } }).then((r) => setCourses(r.data)).finally(() => setLoading(false));
  }, [cat, level, q]);

  return (
    <AppShell>
      <PageHeader eyebrow="Learning Library" title="Course Catalog" subtitle="Every course is tagged to skills and aligned with our capacity framework." />

      <Card className="p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8793A8]" />
          <input
            data-testid="catalog-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles or descriptions…"
            className="w-full pl-9 rounded-md bg-[#070B14] border border-[#1B2638] px-3 py-2 text-sm focus:outline-none focus:border-violet"
          />
        </div>
        <select data-testid="catalog-category" value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md bg-[#070B14] border border-[#1B2638] px-3 py-2 text-sm">
          <option>All</option>
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select data-testid="catalog-level" value={level} onChange={(e) => setLevel(e.target.value)} className="rounded-md bg-[#070B14] border border-[#1B2638] px-3 py-2 text-sm">
          <option>All</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && <div className="col-span-full text-sm text-[#8793A8]">Loading…</div>}
        {courses.map((c) => (
          <Link to={`/app/courses/${c.course_id}`} key={c.course_id} data-testid={`catalog-course-${c.course_id}`}>
            <Card className="p-0 overflow-hidden">
              <div className="aspect-[16/9] relative bg-[#131C2E]">
                <img src={c.thumbnail} alt={c.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D1422] to-transparent" />
                <div className="absolute top-3 left-3 eyebrow bg-[#070B14]/70 border border-[#1B2638] rounded px-2 py-1">{c.category}</div>
                <div className="absolute top-3 right-3 text-xs text-white bg-[#070B14]/70 border border-[#1B2638] rounded px-2 py-1">{c.level}</div>
              </div>
              <div className="p-5">
                <div className="font-display text-lg font-medium leading-snug">{c.title}</div>
                <p className="mt-1.5 text-xs text-[#8793A8] line-clamp-2">{c.subtitle}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-[#8793A8]">
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {c.duration_hours}h</span>
                  <span className="flex items-center gap-1.5"><Star size={12} className="text-teal" /> {c.rating}</span>
                  <span>{c.enrolled_count} enrolled</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
