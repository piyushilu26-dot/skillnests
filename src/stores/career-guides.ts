import { createLocalStore } from "@/lib/local-store";

export type CareerGuide = {
  id: string;
  kind: "career-guide";
  interest: string;
  title: string;
  speaker?: string;
  documentUrl: string;
  isPaid: boolean;
  removed?: boolean;
};

export const careerGuideStore = createLocalStore<CareerGuide[]>(
  "sn-career-guides",
  [
    { id: "career-data-scientist", kind: "career-guide", interest: "Tech & Computing", title: "Data Scientist", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/01-data-scientist.md", isPaid: false },
    { id: "career-software-engineer", kind: "career-guide", interest: "Tech & Computing", title: "Software Engineer", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/02-software-engineer.md", isPaid: false },
    { id: "career-ai-researcher", kind: "career-guide", interest: "Tech & Computing", title: "AI / Machine Learning Researcher", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/03-ai-researcher.md", isPaid: true },
    { id: "career-doctor", kind: "career-guide", interest: "Biology & Healthcare", title: "Doctor / Physician", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/04-doctor.md", isPaid: true },
    { id: "career-biotech-researcher", kind: "career-guide", interest: "Biology & Healthcare", title: "Biotechnology Researcher", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/05-biotech-researcher.md", isPaid: true },
    { id: "career-investment-banker", kind: "career-guide", interest: "Business & Finance", title: "Investment Banker", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/06-investment-banker.md", isPaid: true },
    { id: "career-economist", kind: "career-guide", interest: "Business & Finance", title: "Economist", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/07-economist.md", isPaid: true },
    { id: "career-entrepreneur", kind: "career-guide", interest: "Entrepreneurship", title: "Entrepreneur / Startup Founder", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/08-entrepreneur.md", isPaid: true },
    { id: "career-lawyer", kind: "career-guide", interest: "Law & Policy", title: "Lawyer / Advocate", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/09-lawyer.md", isPaid: true },
    { id: "career-policy-analyst", kind: "career-guide", interest: "Law & Policy", title: "Public Policy Analyst", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/10-policy-analyst.md", isPaid: true },
    { id: "career-ux-designer", kind: "career-guide", interest: "Design & Media", title: "UX / Product Designer", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/11-ux-designer.md", isPaid: true },
    { id: "career-scientist", kind: "career-guide", interest: "Science & Research", title: "Research Scientist", speaker: "SkillNests Career Guide", documentUrl: "/career-guides/12-scientist.md", isPaid: true },
  ],
  undefined,
  "Career Guidance"
);
