import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background:
            "radial-gradient(circle at 80% 25%, rgba(198,164,106,0.22), transparent 55%), linear-gradient(135deg, #080808 0%, #111111 100%)",
          color: "#FFFFFF",
          border: "1px solid rgba(198, 164, 106, 0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: 20,
            letterSpacing: "0.35em",
            color: "#C6A46A",
            textTransform: "uppercase",
          }}
        >
          <span>MJ PHOTOGRAPHY</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.05,
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            EVERY FRAME TELLS A STORY.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#A0A0A0",
            }}
          >
            Capturing moments. Creating memories. Preserving emotions.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "24px",
            fontSize: 18,
            letterSpacing: "0.2em",
            color: "#A0A0A0",
          }}
        >
          <span>FINE ART · EDITORIAL · PORTRAIT · DESTINATION</span>
          <span style={{ color: "#C6A46A" }}>EST. STUDIO ARCHIVE</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

