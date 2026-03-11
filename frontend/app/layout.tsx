import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'EstateAI',
  description: 'EstateAI AI copilot dashboard',
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <html lang="en">
      <body>
        <div className="md:flex md:min-h-screen">
          <Sidebar />
          <main className="w-full p-4 md:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
