import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import ParentLayout from "@/components/Layouts/ParentLayout";
import ProviderComponents from "@/components/Layouts/ProviderComponents";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Ma'a Impact Award by GlobalSadaqah";
const siteDescription =
  "Ma'a Impact Award by GlobalSadaqah – empowering ethical startups and non-profits with $5,000 impact grants across three impact tracks.";
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://maaimpact.com";

export const metadata = {
  title: siteTitle,
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={<>Loading...</>}>
          <ProviderComponents>
            <ParentLayout>
              {children}
            </ParentLayout>
          </ProviderComponents>
        </Suspense>
      </body>
    </html>
  );
}
