import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reef Relay — The Living City",
  description: "An oceanarium-grade WebGPU expedition where young explorers swim, identify real coral scans, and witness how heat and recovery reshape a reef.",
  openGraph: {
    title: "Reef Relay — The Living City",
    description: "Enter the water. Read a living reef. Protect what connects us.",
    images: [{ url: "/reef-default-background.png", width: 3827, height: 2042 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reef Relay — The Living City",
    description: "Enter the water. Read a living reef. Protect what connects us.",
    images: ["/reef-default-background.png"],
  },
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/reef-mark.svg",
    shortcut: "/reef-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
