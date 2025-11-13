import "./globals.css";
import Navbar from "@/components/Navbar";
import StageRibbon from "@/components/StageRibbon";
import StageWatermark from "@/components/StageWatermark";
import Footer from "@/components/Footer";
export const metadata = {
  title: "Acquirely | Starting Gate Financial",
  description: "Acquirely by Starting Gate Financial provides the tools and insights you need to make informed decisions and accelerate your acquisition process. Start your journey today.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-brand-slate-900">
        <StageRibbon />
        <StageWatermark />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
