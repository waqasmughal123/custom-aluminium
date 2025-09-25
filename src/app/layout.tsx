import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// import './globals.css';
import { ConditionalLayout } from '../views/components/layout/ConditionalLayout';
import { CustomThemeProvider } from '../views/components/layout/ThemeProvider';
import { AuthSessionProvider, QueryProvider, I18nProvider, ToastProvider } from '../views/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Custom Aluminium',
  description: 'Premium custom aluminium solutions and fabrication services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CustomThemeProvider>
          <I18nProvider>
            <QueryProvider>
              <AuthSessionProvider>
                <ToastProvider>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                </ToastProvider>
              </AuthSessionProvider>
            </QueryProvider>
          </I18nProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
