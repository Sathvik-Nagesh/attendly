import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { IosInstallPrompt } from "@/components/layout/ios-install-prompt";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Suspense } from "react";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KLE Academy | Attendly",
  description: "Advanced institutional command center for high-performance academic tracking.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KLE Academy",
  },
  icons: {
    apple: "/icons/KLE_logo.jpg",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  }
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased overflow-x-hidden">
      <body className={`${inter.className} min-h-full flex flex-col text-slate-900`}>
        <Providers>
          <Suspense fallback={<LoadingScreen />}>
            {children}
          </Suspense>
        </Providers>
        <Toaster />
        <IosInstallPrompt />

        {/* PWA Elite Infrastructure */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('Elite SW Registered');
                    
                    // Register for Background Sync
                    if ('sync' in registration) {
                      registration.sync.register('sync-attendance');
                    }

                    // Request Push Notification Permission
                    if ('Notification' in window) {
                      Notification.requestPermission().then(permission => {
                        if (permission === 'granted') console.log('Push Permissions Secure');
                      });
                    }
                  });
                });

                // Listen for Sync Requisitions from Service Worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                  if (event.data && event.data.type === 'SYNC_REQUISITION') {
                     // The event will be handled by the ROPE service inside pages
                     window.dispatchEvent(new CustomEvent('rope-sync-force'));
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
