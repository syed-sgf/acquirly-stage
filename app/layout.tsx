import "./globals.css";
import Navbar from "@/components/Navbar";
import StageRibbon from "@/components/StageRibbon";
import StageWatermark from "@/components/StageWatermark";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

export const metadata = {
  title: "Acqyrly | Starting Gate Financial",
  description: "Acqyrly by Starting Gate Financial provides the tools and insights you need to make informed decisions and accelerate your acquisition process. Start your journey today.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-brand-slate-900" suppressHydrationWarning>
        <Providers>
          <StageRibbon />
          <StageWatermark />
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
