import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Toaster } from '../components/Toaster';

export const metadata: Metadata = {
  title: 'Organic Varam — Pure Wood Pressed Oils',
  description: 'Experience the authentic taste and unmatched health benefits of traditional Mara Chekku extraction. 100% natural, zero chemicals.',
  keywords: 'wood pressed oil, cold pressed oil, organic oil, sesame oil, groundnut oil, natural cooking oil',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AppProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <Toaster />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
