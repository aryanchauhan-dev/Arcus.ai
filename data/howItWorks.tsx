import { UserPlus, FileEdit, Users, LineChart } from "lucide-react";

export const howItWorks = [
  {
    title: "Professional Onboarding Form",
    description:
  "Complete a quick onboarding by sharing your industry, experience, skills, and target roles to receive personalized interview questions, and career preparation resources.",
    icon: <UserPlus className="w-8 h-8 text-primary" />,
  },
  {
    title: "Craft ATS-Optimized Documents",
    description:
      "Generate resumes and cover letters optimized for modern Applicant Tracking Systems (ATS), improving keyword matching and increasing shortlisting chances by up to 40%.",
    icon: <FileEdit className="w-8 h-8 text-primary" />,
  },
  {
    title: "AI-Powered Interview Practice",
    description:
      "Simulate realistic technical and behavioral interviews with AI-generated questions tailored to your target role and receive instant feedback on responses.",
    icon: <Users className="w-8 h-8 text-primary" />,
  },
  {
    title: "Performance Analytics & Insights",
    description:
      "Track your preparation progress with detailed analytics including interview scores, response quality, and improvement trends across multiple practice sessions.",
    icon: <LineChart className="w-8 h-8 text-primary" />,
  },
];