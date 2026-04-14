import type { Metadata, Viewport } from "next";
import "./globals.css";
import { egFont, metropolis } from "./fonts";

function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "https://www.health-optix.com";
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
  icons: {
    icon: "/images/healthoptix--home-favicon.ico",
    shortcut: "/images/healthoptix--home-favicon.ico",
    apple: "/images/healthoptix--home-favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HealthOptix",
    title: "HealthOptix — When Health Meets Technology",
    description:
      "Health system and solution provider for integrated systems, technology-enabled solutions, and knowledge & training.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "HealthOptix — When Health Meets Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HealthOptix",
    description:
      "When Health Meets Technology — health systems, tech-enabled solutions, and knowledge programmes.",
    images: ["/opengraph-image.png"],
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
