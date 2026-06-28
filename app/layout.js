import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'PlanU - AI Study Planner',
  description: 'AI-powered study planner for students from School to Master\'s level. Plan smarter, study better.',
  keywords: ['study planner', 'AI', 'student', 'exam preparation', 'study schedule'],
  applicationName: 'PlanU',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PlanU',
  },
  manifest: '/manifest.json',
};

// Next.js 16: themeColor and viewport must be in a separate export
export const viewport = {
  themeColor: '#0EA5E9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PlanU" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
