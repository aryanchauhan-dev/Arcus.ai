import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Resume Analyzer",
    description: "Get AI-powered ATS analysis and feedback on your resume",
};

export default function ResumeLayout({ children }: { children: ReactNode }) {
    return (
        <div className="px-5 py-6 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl md:text-6xl font-bold gradient-title">
                    Resume Analyzer
                </h1>
                <p className="text-muted-foreground mt-2">
                    Upload your resume and get instant AI-powered ATS feedback
                </p>
            </div>
            {children}
        </div>
    );
}