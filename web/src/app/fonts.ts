import localFont from "next/font/local";

export const metropolis = localFont({
  src: [
    {
      path: "../fonts/metropolis-regular-webfont.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/metropolis-medium-webfont.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/metropolis-bold-webfont.woff",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-metropolis",
  display: "swap",
});

export const egFont = localFont({
  src: "../fonts/egfont.woff",
  variable: "--font-eg",
  display: "swap",
});
