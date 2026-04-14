import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const alt = "HealthOptix";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoPng = await readFile(
    path.join(process.cwd(), "public/images/share-logo.png"),
  );
  const logoDataUrl = `data:image/png;base64,${logoPng.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#003F73",
        }}
      >
        <img
          src={logoDataUrl}
          width={540}
          height={200}
          alt="HealthOptix logo"
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    size,
  );
}
