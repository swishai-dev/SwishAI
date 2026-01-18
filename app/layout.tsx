import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "SwishAi - Basketball Prediction Agent",
  description: "AI-powered basketball prediction markets analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.cdnfonts.com/css/ds-digital"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${orbitron.variable} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
