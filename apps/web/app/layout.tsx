import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "./components/Navbar";
import { PageShell } from "./components/PageShell";

export const metadata: Metadata = {
  title: "Netflix Data Explorer",
  description: "Explore et visualise ton historique Netflix.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <div className="app-root">
          <Navbar />
          <PageShell>{children}</PageShell>
        </div>
      </body>
    </html>
  );
}
