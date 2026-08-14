export type MockJob = {
  id: string;
  company: string;
  role: string;
  matchScore: number;
  salaryEst: string;
  source: "search" | "url";
  dateFound: string;
};

export const MOCK_JOBS: MockJob[] = [
  {
    id: "1",
    company: "Vercel",
    role: "Senior Frontend Engineer",
    matchScore: 94,
    salaryEst: "$160k - $200k",
    source: "search",
    dateFound: "2 hours ago",
  },
  {
    id: "2",
    company: "Stripe",
    role: "Staff UI Engineer",
    matchScore: 88,
    salaryEst: "$180k - $240k",
    source: "search",
    dateFound: "Yesterday",
  },
  {
    id: "3",
    company: "Linear",
    role: "Product Engineer",
    matchScore: 96,
    salaryEst: "$150k - $190k",
    source: "url",
    dateFound: "Yesterday",
  },
  {
    id: "4",
    company: "Notion",
    role: "Frontend Developer",
    matchScore: 72,
    salaryEst: "$130k - $170k",
    source: "search",
    dateFound: "2 days ago",
  },
  {
    id: "5",
    company: "OpenAI",
    role: "Design Engineer",
    matchScore: 91,
    salaryEst: "$200k - $280k",
    source: "search",
    dateFound: "3 days ago",
  },
  {
    id: "6",
    company: "Figma",
    role: "Software Engineer, Editor",
    matchScore: 85,
    salaryEst: "$170k - $220k",
    source: "url",
    dateFound: "4 days ago",
  },
];
