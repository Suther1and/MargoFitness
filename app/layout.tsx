import type { Metadata } from "next";
import { Montserrat, Roboto, Inter, Oswald } from "next/font/google";
import "./globals.css";
import NavbarNew from "@/components/navbar-new";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <div className="relative w-full xl:max-w-[96rem] min-h-screen xl:min-h-[calc(100vh-4rem)] xl:rounded-[3rem]" style={{ background: 'linear-gradient(to bottom right, #18181b, #09090b, #18181b)' }}>
          <NavbarNew />
          <main className="relative w-full overflow-x-hidden">
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
              <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] blur-[120px] rounded-full" style={{ background: 'rgba(249, 115, 22, 0.1)' }} />
              <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] blur-[120px] rounded-full" style={{ background: 'rgba(168, 85, 247, 0.1)' }} />
            </div>
            
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
