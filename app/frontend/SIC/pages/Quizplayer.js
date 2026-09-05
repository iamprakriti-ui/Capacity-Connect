import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AppShell, Card, PillButton } from "@/components/Shell";
import api from "@/lib/api";
import { Award, ArrowRight, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function QuizPlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { api.get(`/courses/${courseId}`).then((r) => setCourse(r.data)); }, [courseId]);
  if (!course) return <AppShell><div className="text-[#8793A8]">Loading…</div></AppShell>;
  if (!course.quiz) return <AppShell><div className="text-[#8793A8]">No assessment for this course.</div></AppShell>;

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = { answers: Object.entries(answers).map(([qid, oid]) => ({ question_id: qid, option_id: oid })) };
      const { data } = await api.post(`/enrollments/${courseId}/quiz/submit`, payload);
      setResult(data);
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className={`inline-flex h-20 w-20 rounded-full items-center justify-center border ${result.passed ? "border-teal text-teal" : "border-destructive text-destructive"}`}>
            {result.passed ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold">{result.passed ? "You passed!" : "Not quite — try again"}</h1>
          <div className="mt-3 text-[#8793A8]">Score: <span className="font-display text-3xl text-white tabular-nums">{result.score}%</span> · {result.correct}/{result.total} correct</div>
          <div className="mt-8 flex justify-center gap-3">
            <Link to={`/app/courses/${courseId}`}><PillButton variant="secondary">Back to course</PillButton></Link>
            {result.passed && result.certificate_id && (
              <Link to={`/app/certificates/${result.certificate_id}`}>
                <PillButton data-testid="view-cert-btn">View certificate <Award size={14} /></PillButton>
              </Link>
            )}
            {!result.passed && (
              <PillButton onClick={() => { setResult(null); setAnswers({}); }}>Retry assessment <ArrowRight size={14} /></PillButton>
            )}
          </div>
        </div>
      </AppShell>
    );
  }

  const total = course.quiz.questions.length;
  const answered = Object.keys(answers).length;

  return (
    <AppShell>
      <Link to={`/app/courses/${courseId}`} className="inline-flex items-center gap-2 text-xs text-[#8793A8] hover:text-white transition-colors mb-6">
        <ArrowLeft size={12} /> Back
      </Link>
      <div className="max-w-3xl">
        <div className="eyebrow mb-2">Final Assessment</div>
        <h1 className="font-display text-3xl md:text-4xl font-semibold">{course.quiz.title}</h1>
        <p className="mt-2 text-[#8793A8]">Answer all {total} questions. Pass at {course.quiz.pass_score}% to earn your certificate.</p>

        <div className="mt-8 space-y-4">
          {course.quiz.questions.map((q, i) => (
            <Card key={q.question_id}>
              <div className="eyebrow mb-2">Question {i + 1} / {total}</div>
              <div className="font-display text-lg mb-4">{q.prompt}</div>
              <div className="grid gap-2">
                {q.options.map((o) => {
                  const selected = answers[q.question_id] === o.option_id;
                  return (
                    <button
                      key={o.option_id}
                      data-testid={`quiz-opt-${q.question_id}-${o.option_id}`}
                      onClick={() => setAnswers({ ...answers, [q.question_id]: o.option_id })}
                      className={`text-left px-4 py-3 rounded-md border text-sm transition-colors ${selected ? "border-violet bg-violet/10 text-white" : "border-[#1B2638] text-[#8793A8] hover:text-white hover:border-violet/50"}`}
                    >
                      <span className="font-display mr-2 text-white/60">{o.option_id.toUpperCase()}.</span> {o.text}
                    </button>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-xs text-[#8793A8]">{answered}/{total} answered</div>
          <PillButton data-testid="submit-quiz-btn" onClick={submit} disabled={answered !== total || submitting}>
            {submitting ? "Submitting…" : "Submit assessment"} <Award size={14} />
          </PillButton>
        </div>
      </div>
    </AppShell>
  );
}
