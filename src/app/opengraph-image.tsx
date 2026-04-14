import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const alt = "HealthOptix";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [bold, medium] = await Promise.all([
    readFile(
      path.join(process.cwd(), "src/fonts/metropolis-bold-webfont.woff"),
    ),
    readFile(
      path.join(process.cwd(), "src/fonts/metropolis-medium-webfont.woff"),
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#003F73",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            fontFamily: "Metropolis",
          }}
        >
          HealthOptix
        </div>
        <div
          style={{
            marginTop: 20,
            display: "flex",
            fontSize: 30,
            fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
            fontFamily: "Metropolis",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          When Health Meets Technology
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Metropolis",
          data: bold,
          style: "normal",
          weight: 700,
        },
        {
          name: "Metropolis",
          data: medium,
          style: "normal",
          weight: 500,
        },
      ],
    },
  );
}
