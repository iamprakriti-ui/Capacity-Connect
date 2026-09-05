import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell, PageHeader, Card, PillButton, Progress } from "@/components/Shell";
import api from "@/lib/api";
import { Clock, PlayCircle, CheckCircle2, Award, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  const refresh = async () => {
    const [c, es] = await Promise.all([
      api.get(`/courses/${courseId}`),
      api.get("/enrollments/me"),
    ]);
    setCourse(c.data);
    setEnrollment(es.data.find((e) => e.course_id === courseId) || null);
  };

  useEffect(() => { refresh(); }, [courseId]);

  const enroll = async () => {
    const { data } = await api.post(`/enrollments/${courseId}`);
    setEnrollment(data);
  };

  const completeLesson = async (lessonId) => {
    const { data } = await api.post(`/enrollments/${courseId}/lessons/${lessonId}/complete`);
    setEnrollment((e) => ({ ...e, progress: data.progress, completed_lessons: data.completed_lessons }));
  };

  if (!course) return <AppShell><div className="text-[#8793A8]">Loading course…</div></AppShell>;

  const completedSet = new Set(enrollment?.completed_lessons || []);
  const isLearner = user?.role === "learner";
  const allLessonsDone = course.lessons.every((l) => completedSet.has(l.lesson_id));

  return (
    <AppShell>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="eyebrow mb-3">{course.category} · {course.level}</div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">{course.title}</h1>
          <p className="mt-3 text-[#8793A8] max-w-3xl">{course.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#8793A8]">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {course.duration_hours}h</span>
            <span>{course.lessons.length} lessons</span>
            <span>By {course.trainer_name}</span>
            <span>{course.enrolled_count} enrolled</span>
          </div>

          <Card className="mt-6">
            <h2 className="font-display text-xl font-semibold mb-3">About this course</h2>
            <p className="text-sm leading-relaxed text-[#F4F7FB]/90">{course.description}</p>
          </Card>

          <Card className="mt-4">
            <h2 className="font-display text-xl font-semibold mb-4">Curriculum</h2>
            <div className="divide-y divide-[#1B2638]">
              {course.lessons.map((l, i) => {
                const done = completedSet.has(l.lesson_id);
                return (
                  <div key={l.lesson_id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-8 w-8 rounded-md flex items-center justify-center text-xs tabular-nums border ${done ? "border-teal text-teal" : "border-[#1B2638] text-[#8793A8]"}`}>
                        {done ? <CheckCircle2 size={14} /> : String(i + 1).padStart(2, "0")}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{l.title}</div>
                        <div className="text-xs text-[#8793A8]">{l.duration_min} min</div>
                      </div>
                    </div>
                    {enrollment && isLearner && (
                      <Link to={`/app/courses/${courseId}/lessons/${l.lesson_id}`} data-testid={`lesson-open-${l.lesson_id}`}>
                        <PillButton variant="secondary" className="text-xs px-3 py-1.5">
                          {done ? "Review" : "Start"} <PlayCircle size={12} />
                        </PillButton>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6 p-0 overflow-hidden">
            <div className="aspect-[16/9] relative">
              <img src={course.thumbnail} alt={course.title} className="absolute inset-0 h-full w-full object-cover opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0D1422]" />
            </div>
            <div className="p-6">
              {!enrollment && isLearner && (
                <PillButton data-testid="enroll-btn" onClick={enroll} className="w-full justify-center">
                  Enroll in this course <ArrowRight size={14} />
                </PillButton>
              )}
              {enrollment && (
                <>
                  <div className="eyebrow">Your progress</div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-display text-3xl tabular-nums">{enrollment.progress}%</span>
                    <span className="text-xs text-[#8793A8]">{enrollment.completed_lessons?.length || 0}/{course.lessons.length} lessons</span>
                  </div>
                  <Progress value={enrollment.progress} className="mt-3" />
                  {course.quiz && allLessonsDone && !enrollment.completed && (
                    <Link to={`/app/courses/${courseId}/quiz`} className="block mt-5">
                      <PillButton data-testid="take-quiz-btn" className="w-full justify-center">
                        Take final assessment <Award size={14} />
                      </PillButton>
                    </Link>
                  )}
                  {enrollment.completed && (
                    <div className="mt-5 rounded-lg border border-teal/40 bg-teal/5 p-4">
                      <div className="eyebrow text-teal">Completed</div>
                      <div className="mt-1 text-sm">Score: <span className="tabular-nums">{enrollment.quiz_score}%</span></div>
                      <Link to="/app/certificates" className="mt-3 inline-flex items-center gap-1.5 text-xs text-white underline underline-offset-4">
                        View certificate <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}
                </>
              )}
              <div className="mt-5 border-t border-[#1B2638] pt-4">
                <div className="eyebrow mb-2">Skills you'll build</div>
                <div className="flex flex-wrap gap-1.5">
                  {course.skills.map((s) => <span key={s} className="text-[10px] px-2 py-1 rounded-md bg-[#131C2E] border border-[#1B2638] text-[#8793A8] uppercase tracking-wider">{s.replace("skill_", "").replace(/[0-9]/g, "")}</span>)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
