import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell, Card, PillButton } from "@/components/Shell";
import api from "@/lib/api";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    (async () => {
      const [c, es] = await Promise.all([api.get(`/courses/${courseId}`), api.get("/enrollments/me")]);
      setCourse(c.data);
      setEnrollment(es.data.find((e) => e.course_id === courseId) || null);
    })();
  }, [courseId]);

  if (!course) return <AppShell><div className="text-[#8793A8]">Loading…</div></AppShell>;
  const lesson = course.lessons.find((l) => l.lesson_id === lessonId);
  if (!lesson) return <AppShell><div className="text-[#8793A8]">Lesson not found.</div></AppShell>;

  const idx = course.lessons.findIndex((l) => l.lesson_id === lessonId);
  const next = course.lessons[idx + 1];
  const prev = course.lessons[idx - 1];
  const completedSet = new Set(enrollment?.completed_lessons || []);
  const done = completedSet.has(lessonId);
  const allDone = course.lessons.every((l) => completedSet.has(l.lesson_id) || l.lesson_id === lessonId);

  const markComplete = async () => {
    const { data } = await api.post(`/enrollments/${courseId}/lessons/${lessonId}/complete`);
    setEnrollment((e) => ({ ...e, progress: data.progress, completed_lessons: data.completed_lessons }));
  };

  return (
    <AppShell>
      <Link to={`/app/courses/${courseId}`} className="inline-flex items-center gap-2 text-xs text-[#8793A8] hover:text-white transition-colors mb-6">
        <ArrowLeft size={12} /> Back to course
      </Link>
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="eyebrow mb-2">Lesson {idx + 1} of {course.lessons.length} · {lesson.duration_min} min</div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{lesson.title}</h1>
          <Card className="mt-6">
            <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-[#F4F7FB]/90">
              {lesson.content}
            </div>
            <div className="mt-8 flex items-center justify-between border-t border-[#1B2638] pt-5">
              <div className="flex gap-2">
                {prev && <Link to={`/app/courses/${courseId}/lessons/${prev.lesson_id}`}><PillButton variant="secondary" data-testid="prev-lesson-btn"><ArrowLeft size={12} /> Previous</PillButton></Link>}
                {next && <Link to={`/app/courses/${courseId}/lessons/${next.lesson_id}`}><PillButton variant="secondary" data-testid="next-lesson-btn">Next <ArrowRight size={12} /></PillButton></Link>}
              </div>
              {!done ? (
                <PillButton data-testid="mark-complete-btn" onClick={markComplete}>Mark complete <CheckCircle2 size={14} /></PillButton>
              ) : (
                <div className="flex items-center gap-2 text-teal text-sm"><CheckCircle2 size={14} /> Completed</div>
              )}
              {done && allDone && course.quiz && (
                <Link to={`/app/courses/${courseId}/quiz`}>
                  <PillButton data-testid="goto-quiz-btn">Take assessment <ArrowRight size={14} /></PillButton>
                </Link>
              )}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <div className="eyebrow mb-3">Course outline</div>
            <ul className="space-y-2 text-sm">
              {course.lessons.map((l, i) => (
                <li key={l.lesson_id}>
                  <Link
                    to={`/app/courses/${courseId}/lessons/${l.lesson_id}`}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded ${l.lesson_id === lessonId ? "bg-[#131C2E] text-white" : "text-[#8793A8] hover:text-white"}`}
                  >
                    <span className={`h-5 w-5 rounded-md text-[10px] flex items-center justify-center border tabular-nums ${completedSet.has(l.lesson_id) ? "border-teal text-teal" : "border-[#1B2638]"}`}>
                      {completedSet.has(l.lesson_id) ? "✓" : i + 1}
                    </span>
                    <span className="truncate">{l.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
