import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./lib/authContext";
import Sidebar from "@/components/navbar";
import { MapProvider } from '@/context/MapContext';
import { CollectionsProvider } from "@/context/CollectionsContext";
import { TripsProvider } from "@/context/TripsContext";
import { SelectedAttractionProvider } from "@/context/SelectedAttractionContext";
import { ConfirmProvider } from "@/components/confirmProvider";
import 'ol/ol.css';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ConfirmProvider>
          <AuthProvider>
            <SelectedAttractionProvider>
              <MapProvider>
                <CollectionsProvider>
                  <TripsProvider>

                    <div className="relative flex">
                      <div className="group relative z-50">
                        <Sidebar />
                      </div>

                      <main className="flex-1 z-10">{children}</main>
                    </div>

                  </TripsProvider>
                </CollectionsProvider>
              </MapProvider>
            </SelectedAttractionProvider>
          </AuthProvider>
        </ConfirmProvider>
      </body>
    </html>
  );
}
