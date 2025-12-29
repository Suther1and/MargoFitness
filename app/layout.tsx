import type { Metadata } from "next";
import { Montserrat, Roboto, Inter, Oswald } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { getCurrentProfile } from "@/lib/actions/profile";
import { headers } from "next/headers";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "MargoFitness - Персональный фитнес-тренер онлайн",
  description: "Современная платформа для онлайн-тренировок с персонализированными программами и отслеживанием прогресса",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${oswald.variable} ${montserrat.variable} ${roboto.variable} ${inter.variable} font-inter antialiased min-h-screen flex flex-col items-center justify-center p-0 xl:pt-2 xl:pr-4 xl:pb-8 xl:pl-4 relative overflow-x-hidden`}
        suppressHydrationWarning
        style={{
          background: 'linear-gradient(to bottom right, #1f1f23, #0f0f13, #1f1f23)',
          color: '#FFFFFF'
        }}
      >
        <div 
          className="relative w-full xl:max-w-[96rem] min-h-screen xl:min-h-[calc(100vh-4rem)] xl:rounded-[3rem]" 
          style={{ 
            background: pathname.startsWith('/dashboard') 
              ? 'linear-gradient(to bottom right, #18181b, #09090b, #18181b)'
              : '#0C0C11'
          }}
        >
          <Navbar profile={profile} pathname={pathname} />
          <main className="relative w-full overflow-hidden rounded-b-[3rem]">
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
