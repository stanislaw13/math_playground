import type { ReactNode } from "react";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { getMessages } from "next-intl/server";
import { AuthProvider } from "@/lib/auth/context";
import Navbar from "@/components/ui/Navbar";
import "../globals.css";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "pl" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className="min-h-screen bg-[var(--color-bg-primary)]">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
