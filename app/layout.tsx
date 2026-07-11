import type { Metadata } from "next";
import { Noto_Sans_JP, Nunito } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "お弁当注文アプリ",
  description: "社員向けお弁当オンライン注文システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
