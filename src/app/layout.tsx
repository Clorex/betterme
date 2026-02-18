import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthGuard } from "@/components/layout/AuthGuard";
import AuthInit from "@/components/providers/AuthInit";
import AuthDebugReporter from "@/components/debug/AuthDebugReporter";
import { PageTransition } from "@/components/layout/PageTransition";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFDFE" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0015" },
  ],
};

export const metadata: Metadata = {
  title: "BetterME - Your AI Body Transformation Buddy",
  description:
    "Transform your body with AI-powered workouts, nutrition tracking, meal plans, and a 24/7 personal coach.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BetterME",
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="custom-scrollbar">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>

      {/* ✅ FIXED BODY */}
      <body className="font-body antialiased min-h-screen overflow-x-hidden">
        <div className="max-w-[480px] mx-auto min-h-screen relative bg-brand-white dark:bg-brand-dark">
          <AuthInit>
            <AuthDebugReporter />
            <AuthGuard>
              <PageTransition>{children}</PageTransition>
            </AuthGuard>
          </AuthInit>
        </div>

        <Toaster position="top-center" />
      </body>
    </html>
  );
}