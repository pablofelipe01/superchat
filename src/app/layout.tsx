import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3001'),
  title: "Sirius Regenerative Video Platform",
  description: "Plataforma de videoconferencia para agricultura regenerativa - Conectando ecosistemas digitales con la sabiduría de la naturaleza",
  keywords: ["agricultura regenerativa", "videoconferencia", "Sirius", "sostenibilidad", "permacultura"],
  authors: [{ name: "Sirius Regenerative Solutions" }],
  creator: "Sirius Regenerative Solutions",
  publisher: "Sirius Regenerative Solutions",
  openGraph: {
    title: "Sirius Regenerative Video Platform",
    description: "Donde la tecnología encuentra la agricultura regenerativa",
    type: "website",
    locale: "es_ES",
    alternateLocale: ["en_US"],
    siteName: "Sirius Video",
    images: [
      {
        url: "/logo-sirius.png",
        width: 1200,
        height: 630,
        alt: "Sirius Regenerative Video Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sirius Regenerative Video Platform",
    description: "Donde la tecnología encuentra la agricultura regenerativa",
    images: ["/logo-sirius.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/logo-sirius.png",
  },
  manifest: "/manifest.json",
};

export function generateViewport() {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#66B032" },
      { media: "(prefers-color-scheme: dark)", color: "#0066CC" },
    ],
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen text-foreground bg-background`}
      >
        {/* Living Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Organic particles floating through the ecosystem */}
          <div className="absolute inset-0 opacity-30">
            {/* These would be replaced with actual particle components */}
            <div className="animate-pulse absolute top-1/4 left-1/4 w-2 h-2 bg-sirius-green-vida rounded-full" 
                 style={{ animationDelay: '0s', animationDuration: '4s' }} />
            <div className="animate-pulse absolute top-1/3 right-1/3 w-1 h-1 bg-sirius-blue-light rounded-full" 
                 style={{ animationDelay: '2s', animationDuration: '6s' }} />
            <div className="animate-pulse absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-sirius-green-vida rounded-full" 
                 style={{ animationDelay: '4s', animationDuration: '5s' }} />
          </div>
          
          {/* Subtle light rays filtering through */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-sirius-blue-primary/5 to-transparent transform rotate-12" />
          <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-sirius-green-vida/5 to-transparent transform -rotate-12" />
        </div>
        
        {/* Main Content Container */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Global Announcements (for important agricultural updates) */}
        <div id="global-announcements" className="fixed bottom-0 left-0 right-0 z-50" />
        
        {/* SIRIUS Assistant Portal (will be conditionally rendered) */}
        <div id="sirius-portal" className="fixed bottom-4 right-4 z-40" />
      </body>
    </html>
  );
}
