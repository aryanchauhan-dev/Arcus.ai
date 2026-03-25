import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #09090b 0%, #18082e 40%, #09090b 70%, #0d0d10 100%)",
      }}
    >

      {/* Diagonal purple overlay — the main slash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, transparent 0%, rgba(139,92,246,0.1) 30%, rgba(109,40,217,0.2) 50%, rgba(139,92,246,0.08) 65%, transparent 100%)",
        }}
      />

      {/* Soft purple glow at the diagonal center point */}
      <div
        className="pointer-events-none absolute h-90 w-90 rounded-full"
        style={{
          top: "28%",
          left: "32%",
          background:
            "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 65%)",
          filter: "blur(50px)",
        }}
      />

      {/* Top-left dark anchor so the corner doesn't feel washed out */}
      <div
        className="pointer-events-none absolute -left-10 -top-10 h-65 w-65 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(9,9,11,0.8) 0%, transparent 70%)",
        }}
      />

      {/* Bottom-right dark anchor */}
      <div
        className="pointer-events-none absolute -bottom-10 -right-10 h-65 w-65 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(9,9,11,0.8) 0%, transparent 70%)",
        }}
      />

      {/* Diagonal highlight line — thin bright edge along the slash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, transparent 42%, rgba(139,92,246,0.15) 48%, rgba(167,139,250,0.08) 50%, transparent 56%)",
        }}
      />

      {/* Top hairline accent */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.35) 50%, transparent 100%)",
        }}
      />

      {/* Page content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}