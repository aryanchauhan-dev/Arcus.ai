import {
  Briefcase,
  LineChart,
  ScrollText,
  FileText
} from "lucide-react";

export const features = [
  {
    icon: <Briefcase className="w-10 h-10 mb-4 text-primary" />,
    title: "Smart Interview Preparation",
    description:
      "Practice role-specific interview questions, get instant feedback, and improve your confidence before real interviews.",
  },
  {
    icon: <LineChart className="w-10 h-10 mb-4 text-primary" />,
    title: "Real-Time Industry Insights",
    description:
      "Stay ahead with trending skills, demand analysis, salary insights, and data-driven career guidance.",
  },
  {
    icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Resume Analyzer",
    description:
      "Upload your resume, compare it directly with job descriptions, and get instant, AI-powered suggestions to optimize it for hiring managers.",
  },
  {
    icon: <FileText className="w-10 h-10 mb-4 text-primary" />,
    title: "Smart Cover Letters",
    description:
      "Generate tailored cover letters for any role, edit the content directly on the platform to match your voice, and download them instantly in PDF format.",
  },
];