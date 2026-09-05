import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppShell, PageHeader, Card, PillButton } from "@/components/Shell";
import api, { API_BASE } from "@/lib/api";
import { Download, ArrowLeft, Award } from "lucide-react";

export function CertificatesList() {
  const [certs, setCerts] = useState([]);
  useEffect(() => { api.get("/certificates/me").then((r) => setCerts(r.data)); }, []);
  return (
    <AppShell>
      <PageHeader eyebrow="Verified achievements" title="Your Certificates" subtitle="Every certificate is uniquely IDed and available as a shareable page or a signed PDF." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certs.length === 0 && <Card className="col-span-full text-sm text-[#8793A8]">No certificates yet. Pass a course assessment to earn your first.</Card>}
        {certs.map((c) => (
          <Link key={c.certificate_id} to={`/app/certificates/${c.certificate_id}`} data-testid={`cert-item-${c.certificate_id}`}>
            <Card className="relative overflow-hidden">
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br from-violet/20 to-teal/10 blur-2xl" />
              <div className="eyebrow">Certificate · {c.certificate_id.slice(-6).toUpperCase()}</div>
              <div className="mt-3 font-display text-xl font-medium">{c.course_title}</div>
              <div className="mt-1 text-xs text-[#8793A8]">Issued {c.issued_at?.slice(0, 10)} · Score {c.quiz_score}%</div>
              <div className="mt-5 flex items-center gap-2 text-xs text-teal">
                <Award size={12} /> Verified achievement
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

export function CertificateView() {
  const { certificateId } = useParams();
  const [cert, setCert] = useState(null);
  useEffect(() => { api.get(`/certificates/${certificateId}`).then((r) => setCert(r.data)); }, [certificateId]);
  if (!cert) return <AppShell><div className="text-[#8793A8]">Loading…</div></AppShell>;

  return (
    <AppShell>
      <Link to="/app/certificates" className="inline-flex items-center gap-2 text-xs text-[#8793A8] hover:text-white transition-colors mb-6">
        <ArrowLeft size={12} /> All certificates
      </Link>
      <div className="max-w-4xl">
        <div className="relative rounded-2xl border-2 border-violet/40 bg-[#0A0F1B] p-10 md:p-16 gradient-border overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 20% 20%, rgba(124,92,255,0.6), transparent 50%), radial-gradient(circle at 80% 80%, rgba(53,214,200,0.5), transparent 50%)` }} />
          <div className="relative text-center">
            <div className="eyebrow text-teal">CAPACITY · CONNECT</div>
            <div className="mt-2 text-xs text-[#8793A8]">Enterprise Learning Platform</div>
            <h1 className="mt-10 font-display text-3xl md:text-4xl font-semibold tracking-tight">CERTIFICATE OF COMPLETION</h1>
            <div className="mt-3 text-sm text-[#8793A8]">This is proudly presented to</div>
            <div className="mt-8 font-display text-5xl md:text-6xl font-semibold text-white">{cert.user_name}</div>
            <div className="mx-auto mt-3 h-px w-40 bg-violet/60" />
            <div className="mt-8 text-sm text-[#8793A8]">for successfully completing the course</div>
            <div className="mt-3 font-display text-2xl md:text-3xl text-teal">{cert.course_title}</div>
            <div className="mt-3 text-sm text-[#8793A8]">with an assessment score of <span className="text-white font-display text-lg tabular-nums">{cert.quiz_score}%</span></div>
            <div className="mt-14 flex justify-between text-xs text-[#8793A8]">
              <div>Issued {cert.issued_at?.slice(0, 10)}</div>
              <div>Certificate ID: {cert.certificate_id}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <a href={`${API_BASE}/certificates/${cert.certificate_id}/pdf`} target="_blank" rel="noreferrer" data-testid="download-cert-pdf">
            <PillButton>Download PDF <Download size={14} /></PillButton>
          </a>
        </div>
      </div>
    </AppShell>
  );
}
