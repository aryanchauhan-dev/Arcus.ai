import { 
  BrainCircuit, 
  Briefcase, 
  LineChart, 
  ScrollText 
} from "lucide-react";

export const features = [
  {
    icon: <BrainCircuit className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Career Guidance",
    description:
      "Receive personalized career insights, skill recommendations, and growth strategies powered by advanced AI.",
  },
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
    title: "AI Resume Analyzer (Coming Soon)",
    description:
      "Upload your resume, compare it with job descriptions, and get AI-powered suggestions to improve it. This feature is currently under development.",
  },
];