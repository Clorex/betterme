// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthGuard } from "@/components/layout/AuthGuard";
import AuthInit from "@/components/providers/AuthInit";
import AuthDebugReporter from "@/components/debug/AuthDebugReporter";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

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
    <html lang="en" className={`${montserrat.variable} ${inter.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
      </head>

      <body className="font-body">
        <div className="max-w-[480px] mx-auto min-h-screen min-h-[100dvh] relative bg-brand-white dark:bg-brand-dark">
          <AuthInit>
            {/* Debug reporter posts client auth/ui state to /api/_debug/log which prints in terminal */}
            <AuthDebugReporter />

            <AuthGuard>{children}</AuthGuard>
          </AuthInit>
        </div>

        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--color-surface)",
              color: "var(--color-text)",
              borderRadius: "16px",
              padding: "12px 20px",
              fontSize: "14px",
              fontFamily: "var(--font-inter)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
            success: {
              iconTheme: { primary: "#22C55E", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#fff" },
            },
          }}
        />
      </body>
    </html>
  );
}