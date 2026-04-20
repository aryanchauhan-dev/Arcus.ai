import { UserPlus, Brain, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Personalized Onboarding",
    description:
      "Start by sharing your industry, experience, skills, and target roles. This helps the platform tailor insights and recommendations specifically to your career goals.",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "AI Career Insights",
    description:
      "Get data-driven insights including salary trends, in-demand skills, and market outlook to understand where you stand and what to focus on next.",
    icon: <Brain className="w-8 h-8 text-primary" />,
  },
  {
    title: "Smart Interview Preparation",
    description:
      "Practice role-specific interview questions with AI-generated scenarios and receive feedback to improve your performance and confidence.",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Track Progress & Improve",
    description:
      "Monitor your progress with detailed analytics, identify weak areas, and continuously improve your preparation over time.",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];