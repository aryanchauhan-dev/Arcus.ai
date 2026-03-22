import { 
  BrainCircuit, 
  Briefcase, 
  LineChart, 
  ScrollText, 
  FileText, 
  Target, 
  Map, 
  Lightbulb 
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
      "Practice role-specific interview questions, get instant feedback, and improve your confidence before the real interview.",
  },
  {
    icon: <LineChart className="w-10 h-10 mb-4 text-primary" />,
    title: "Real-Time Industry Insights",
    description:
      "Stay ahead of the market with trending skills, industry demand analysis, and data-driven career insights.",
  },
  {
    icon: <ScrollText className="w-10 h-10 mb-4 text-primary" />,
    title: "AI Resume Builder",
    description:
      "Create professional, ATS-optimized resumes in minutes with intelligent suggestions and formatting.",
  },
];