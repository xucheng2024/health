import type { Metadata, Viewport } from "next";
import "./globals.css";
import { egFont, metropolis } from "./fonts";

function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "https://health-optix.com";
}

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003f73",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HealthOptix",
    template: "%s | HealthOptix",
  },
  description:
    "Health system and solution provider — integrated systems, tech-enabled health solutions, and knowledge programmes for providers, workplaces, and communities in Singapore and the region.",
  applicationName: "HealthOptix",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HealthOptix",
    title: "HealthOptix — When Health Meets Technology",
    description:
      "Health system and solution provider for integrated systems, technology-enabled solutions, and knowledge & training.",
  },
  twitter: {
    card: "summary",
    title: "HealthOptix",
    description:
      "When Health Meets Technology — health systems, tech-enabled solutions, and knowledge programmes.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-US"
      className={`${metropolis.variable} ${egFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-foreground">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
