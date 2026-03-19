import { Suspense } from "react";
import { Roboto } from "next/font/google";
import "./globals.scss";
import "styles/index.scss";
import { Providers, QueryParamsSync } from "./providers";
import AppToaster from "components/Toaster";
import AppFrame from "./AppFrame";

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin", "cyrillic"],
});

export const metadata = {
  title: "Lalasia",
  description: "Интернет-магазин мебели и товаров для дома",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <Suspense fallback={null}>
            <QueryParamsSync />
          </Suspense>
          <AppToaster />
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
