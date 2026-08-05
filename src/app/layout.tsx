import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LanguageProvider } from "@/components/providers/language-provider";

const figtree = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
	),
	title: {
		default: "Woops | Build your AI workforce",
		template: "%s | Woops",
	},
	description:
		"Build, deploy, and manage AI employees that work for your business.",
	applicationName: "Woops",
	keywords: [
		"AI employees",
		"AI workforce",
		"business automation",
		"digital employees",
	],
	authors: [{ name: "Woops" }],
	creator: "Woops",
	publisher: "Woops",
	alternates: {
		canonical: "/",
	},
	icons: {
		icon: [
			{ url: "/logo/logo.png", sizes: "2000x2000", type: "image/png" },
			{ url: "/logo/logo.svg", type: "image/svg+xml" },
		],
		shortcut: ["/logo/logo.png"],
		apple: [
			{ url: "/logo/logo.png", sizes: "2000x2000", type: "image/png" },
		],
	},
	openGraph: {
		title: "Woops | Build your AI workforce",
		description:
			"Build, deploy, and manage AI employees that work for your business.",
		url: "/",
		siteName: "Woops",
		images: [
			{
				url: "/logo/logo.png",
				width: 2000,
				height: 2000,
				alt: "Woops AI workforce platform",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary",
		title: "Woops | Build your AI workforce",
		description:
			"Build, deploy, and manage AI employees that work for your business.",
		images: ["/logo/logo.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
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
      className={`${figtree.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <TooltipProvider>
            <AuthProvider>{children}</AuthProvider>
          </TooltipProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

