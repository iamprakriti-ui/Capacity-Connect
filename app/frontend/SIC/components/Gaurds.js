import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { BrandMark } from "@/components/Shell";

export function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070B14] text-[#8793A8]">
        <div className="animate-pulse">Loading Capacity Connect…</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to={user.role === "admin" ? "/app/admin" : user.role === "trainer" ? "/app/trainer" : "/app/dashboard"} replace />;
  return children;
}

export function AuthCallback() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [error, setError] = useState(null);
  const processedRef = React.useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;
    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/login");
      return;
    }
    const sessionId = match[1];
    (async () => {
      try {
        await api.post("/auth/google/session", { session_id: sessionId });
        // clear hash
        window.history.replaceState(null, "", window.location.pathname);
        const u = await refresh();
        if (!u) throw new Error("Session not established");
        navigate(u.role === "admin" ? "/app/admin" : u.role === "trainer" ? "/app/trainer" : "/app/dashboard", { replace: true });
      } catch (e) {
        setError("Sign-in failed. Please try again.");
        setTimeout(() => navigate("/login"), 1500);
      }
    })();
  }, [navigate, refresh]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#070B14] gap-6">
      <BrandMark />
      <div className="text-[#8793A8] text-sm">{error || "Completing sign-in…"}</div>
    </div>
  );
}
