import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "She Loves It | Premium Beauty & Cosmetics",
  description: "Discover premium beauty products at She Loves It. Shop makeup, skincare, fragrances and accessories. Free shipping on orders over Rs. 3,000.",
  keywords: "beauty, cosmetics, makeup, skincare, lipstick, foundation, Pakistan, She Loves It",
  openGraph: {
    title: "She Loves It",
    description: "Your destination for premium beauty products.",
    type: "website",
  },
};

import AuthSync from "@/lib/AuthSync";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${poppins.variable} ${inter.variable} antialiased`}>
        <AuthSync />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "50px",
              padding: "12px 20px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
