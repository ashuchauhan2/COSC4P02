import { Geist } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { PageTransition } from "@/components/PageTransition";
import NavigationProgress from "@/components/NavigationProgress";
import ScrollManager from "@/components/ScrollManager";
import LinkPreloader from "@/components/LinkPreloader";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://www.coursemix.ca";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CourseMix",
  description: "Your Personal Academic Advisor at Brock University",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col">
        <NavigationProgress />
        <ScrollManager />
        <LinkPreloader />
        <Navbar />
        <PageTransition>
          {children}
        </PageTransition>
        <Footer />
      </body>
    </html>
  );
}
