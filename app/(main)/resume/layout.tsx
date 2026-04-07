import React, { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 mt-24 mb-20">
        {children}
      </div>
    </main>
  );
}