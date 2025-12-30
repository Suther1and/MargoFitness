import type { Metadata } from "next";
import { Montserrat, Roboto, Inter, Oswald } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { getCurrentProfile } from "@/lib/actions/profile";
import { headers } from "next/headers";
import { ReferralCodeCapture } from "@/components/referral-code-capture";

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
    <html lang="ru" suppressHydrationWarning style={{ background: '#0C0C11' }}>
      <body
        className={`${oswald.variable} ${montserrat.variable} ${roboto.variable} ${inter.variable} font-inter antialiased min-h-screen overflow-x-hidden`}
        suppressHydrationWarning
        style={{
          background: 'linear-gradient(to bottom right, #1f1f23, #0f0f13, #1f1f23)',
          color: '#FFFFFF',
          padding: '0',
          margin: '0'
        }}
      >
        <ReferralCodeCapture />
        <div className="flex flex-col items-center w-full p-0 xl:pt-2 xl:pr-4 xl:pb-8 xl:pl-4">
          <div 
            className="relative w-full xl:max-w-[96rem] xl:rounded-[3rem] rounded-b-[3rem] overflow-hidden" 
            style={{ 
              background: pathname.startsWith('/dashboard') 
                ? 'linear-gradient(to bottom right, #18181b, #09090b, #18181b)'
                : '#0C0C11',
              minHeight: '100vh'
            }}
          >
            <Navbar profile={profile} pathname={pathname} />
            {/* Spacer for fixed navbar */}
            <div className="hidden lg:block h-20"></div>
            <main className="relative w-full">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
