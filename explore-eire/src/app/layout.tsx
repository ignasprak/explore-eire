import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./lib/authContext";
import Sidebar from "@/components/navbar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Explore Eire",
  description: "Discover the beauty of Ireland with Explore Eire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Include Remix Icon CDN */}
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <div className="relative flex">
            {/* Sidebar + Overlay Wrapper */}
            <div className="group relative z-50">
              <Sidebar />

              {/* Dimmed Overlay */}
              <div
                className="
                  fixed inset-0 bg-black 
                  opacity-0 group-hover:opacity-30 
                  transition-opacity duration-300 
                  pointer-events-none z-40
                "
              ></div>
            </div>

            {/* Main Content */}
            <main className="flex-1 z-10">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
