import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";

import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchDialog } from "@/components/search/search-dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Reading passages are read under time pressure, so they get a serif
// designed for continuous text rather than the UI face.
const serif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IELTS General Training",
    template: "%s · IELTS General Training",
  },
  description:
    "An interactive IELTS General Training course: the method, marked practice, and an explanation for every answer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${serif.variable} h-full`}
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />

            <div className="flex min-h-svh w-full min-w-0 flex-col">
              <header className="print-hidden sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-rule bg-background px-3 sm:px-4">
                <SidebarTrigger />
                <div className="ml-auto flex items-center gap-2">
                  <SearchDialog />
                  <ThemeToggle />
                </div>
              </header>

              <main id="main" className="min-w-0 flex-1 px-4 py-8 sm:px-8">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
