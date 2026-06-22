import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";

export const Route = createFileRoute("/home")({
  ssr: false,
  head: () => ({ meta: [{ title: " - SkillNests" }] }),
  component: Home,
});

function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
    </main>
  );
}
