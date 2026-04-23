import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digital Heroes | Win Big. Give Back.",
  description:
    "The world's most exciting subscription-based prize draw platform. Log your scores, win monthly cash prizes, and contribute to life-changing charities.",
  keywords: ["prize draw", "charity", "gaming", "scores", "win prizes", "digital heroes"],
  authors: [{ name: "Digital Heroes" }],
  openGraph: {
    title: "Digital Heroes | Win Big. Give Back.",
    description:
      "Log scores. Win prizes. Support charities. Join thousands of digital heroes today.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} dark antialiased`}
    >
      <body className="min-h-dvh bg-slate-950 text-slate-50 font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
