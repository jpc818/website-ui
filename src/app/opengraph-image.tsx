import { ImageResponse } from "next/og";

export const alt = "jargAI · Independent research · A research company studying crowd behavior";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

const dots = Array.from({ length: 70 }, (_, i) => ({
  left: (i * 157) % 1200,
  top: (i * 89) % 630,
  early: i % 11 === 0,
}));

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#090b0f",
          color: "#f4f4f5",
          position: "relative",
        }}
      >
        {dots.map((dot, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.left,
              top: dot.top,
              width: dot.early ? 10 : 4,
              height: dot.early ? 10 : 4,
              borderRadius: 999,
              background: dot.early ? "#f59e0b" : "rgba(139,146,158,0.4)",
              boxShadow: dot.early ? "0 0 24px 8px rgba(245,158,11,0.35)" : "none",
            }}
          />
        ))}
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700 }}>
          jarg<span style={{ color: "#22d3ee" }}>AI</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#f59e0b", marginBottom: 16 }}>
            Independent research · US equities
          </div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05 }}>
            A research company studying
          </div>
          <div
            style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, color: "#f59e0b" }}
          >
            crowd behavior.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
