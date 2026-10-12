import type { Metadata } from "next";
import "@fontsource-variable/archivo";
import "@fontsource-variable/syne";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeedStreet | Startup Investment Marketplace",
  description: "Discover founder-led startups and simulate structured early-stage investment conversations.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body>{children}</body></html>;
}
