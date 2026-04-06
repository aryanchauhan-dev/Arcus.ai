import { Suspense } from "react";
import { BarLoader } from "react-spinners";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="px-5 py-6 max-w-7xl mx-auto">
      
      {/* 🔥 Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl md:text-6xl font-bold gradient-title">
          Industry Insights
        </h1>
      </div>

      {/* 🔥 Suspense Wrapper */}
      <Suspense
        fallback={
          <div className="mt-6 flex justify-center">
            <BarLoader width={200} color="#6b7280" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}