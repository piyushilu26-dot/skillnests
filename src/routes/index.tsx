import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SplashUI } from "@/components/Splash";
import { isAuthenticatedClient } from "@/lib/auth";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "SkillNests - Education that completes, not competes" },
      { name: "description", content: "A holistic learning nest for Gen Z." },
    ],
  }),
  component: SplashIndex,
});

function SplashIndex() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      setReady(true);
      const dest = isAuthenticatedClient() ? "/dashboard" : "/home";
      setTimeout(() => navigate({ to: dest, replace: true }), 350);
    }, 2600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [navigate]);

  return <SplashUI readyText={ready ? "redirecting…" : "education that completes, not competes"} />;
}
