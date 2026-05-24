import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Industry Insights",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="px-5 py-6 max-w-7xl mx-auto">

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl md:text-6xl font-bold gradient-title">
                    Industry Insights
                </h1>
            </div>

            {children}

        </div>
    );
}