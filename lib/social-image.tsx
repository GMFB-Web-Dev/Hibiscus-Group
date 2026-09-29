import { ImageResponse } from "next/og";

export const SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "70px 76px 60px",
          background: "#050505",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: 12,
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            background: "#e52169",
          }}
        />
        <div
          style={{
            width: 360,
            height: 360,
            position: "absolute",
            right: -90,
            bottom: -110,
            display: "flex",
            border: "44px solid #e52169",
            borderRadius: "50%",
            opacity: 0.9,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#e52169",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 5,
            }}
          >
            HIBISCUS GROUP
          </div>
          <div
            style={{
              maxWidth: 900,
              marginTop: 42,
              display: "flex",
              flexDirection: "column",
              fontSize: 78,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            <span>LOCAL SERVICES,</span>
            <span style={{ color: "#e52169" }}>DELIVERED 2 U.</span>
          </div>
        </div>
        <div
          style={{
            maxWidth: 830,
            display: "flex",
            color: "#d0d5dd",
            fontSize: 25,
            lineHeight: 1.35,
          }}
        >
          Skips, water, washing, arborist services, and digger and truck hire across North Auckland.
        </div>
      </div>
    ),
    SOCIAL_IMAGE_SIZE,
  );
}
