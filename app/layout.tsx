import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { StealthAgentsAd } from "@/components/StealthAgentsAd";
import { StealthAgentsRibbon } from "@/components/StealthAgentsRibbon";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://accountspayabledirectory.com"),
  title: {
    default: "Accounts Payable Directory - The US Accounts Payable Company Directory",
    template: "%s | Accounts Payable Directory",
  },
  description:
    "Find accounts payable companies in every US state and city. Compare AP outsourcing, automation, invoice processing and bookkeeping providers by ratings, reviews, phone numbers and websites.",
  keywords: [
    "accounts payable companies",
    "accounts payable services",
    "accounts payable outsourcing",
    "AP automation",
    "invoice processing services",
    "accounts payable directory",
    "outsourced AP",
    "finance and accounting outsourcing",
  ],
  category: "Business Directory",
  openGraph: {
    type: "website",
    siteName: "Accounts Payable Directory",
    title: "Accounts Payable Directory - The US Accounts Payable Company Directory",
    description:
      "Find accounts payable companies in every US state and city: phone numbers, websites, ratings and reviews.",
    url: "https://accountspayabledirectory.com",
  },
  twitter: {
    card: "summary",
    title: "Accounts Payable Directory - The US Accounts Payable Company Directory",
    description:
      "Find accounts payable companies in every US state and city: phone numbers, websites, ratings and reviews.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://accountspayabledirectory.com/#website",
                  url: "https://accountspayabledirectory.com",
                  name: "Accounts Payable Directory",
                  description:
                    "A free directory of accounts payable companies across the United States.",
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: "https://accountspayabledirectory.com/search?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@type": "Organization",
                  "@id": "https://accountspayabledirectory.com/#organization",
                  name: "Accounts Payable Directory",
                  url: "https://accountspayabledirectory.com",
                  logo: "https://accountspayabledirectory.com/icon.png",
                  description:
                    "A free US directory of accounts payable outsourcing, automation, invoice processing, bookkeeping and finance BPO providers.",
                },
              ],
            }),
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <StealthAgentsRibbon />
        <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-paper/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-brand">
              <LogoMark size={36} className="shrink-0" />
              <span className="hidden whitespace-nowrap text-[15px] sm:block">
                Accounts<span className="text-brand-light">Payable</span>Directory.com
              </span>
              <span className="whitespace-nowrap sm:hidden">AP Directory</span>
            </Link>
            <nav aria-label="Main" className="flex items-center gap-1 text-sm text-stone-600 sm:gap-2">
              <Link href="/directory" className="rounded-lg px-3 py-1.5 hover:bg-stone-100 hover:text-brand">
                Directory
              </Link>
              <Link href="/top-rated" className="hidden rounded-lg px-3 py-1.5 hover:bg-stone-100 hover:text-brand sm:block">
                Top rated
              </Link>
              <Link href="/search" className="rounded-lg px-3 py-1.5 hover:bg-stone-100 hover:text-brand">
                Search
              </Link>
              <Link href="/about" className="rounded-lg px-3 py-1.5 hover:bg-stone-100 hover:text-brand">
                About
              </Link>
              <Link href="/contact" className="rounded-lg px-3 py-1.5 hover:bg-stone-100 hover:text-brand">
                Contact
              </Link>
            </nav>
          </div>
        </header>
        <main id="main" className="flex-1">
          {children}
        </main>
        <StealthAgentsAd
          variant="band"
          tone="dark"
          image="team"
          placement="sitewide-footer"
          headline="Add an AP assistant, not overhead."
          body="Stealth Agents matches you with a dedicated accounts payable assistant trained on Bill.com, NetSuite, QuickBooks, Coupa and your existing AP workflow. Clear English, USA hours, 48-hour placement."
          cta="See AP assistants"
        />
        <footer className="border-t border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <LogoMark size={28} className="shrink-0" />
              <p>
                &copy; 2026 AccountsPayableDirectory.com. A free directory of accounts payable
                companies in the United States.
              </p>
            </div>
            <div className="flex gap-5">
              <Link href="/directory" className="hover:text-brand">
                All states
              </Link>
              <Link href="/about" className="hover:text-brand">
                About &amp; data
              </Link>
              <Link href="/contact" className="hover:text-brand">
                Contact
              </Link>
              <Link href="/privacy" className="hover:text-brand">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-brand">
                Terms
              </Link>
              <Link href="/site-map" className="hover:text-brand">
                Site map
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
