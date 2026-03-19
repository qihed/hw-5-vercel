"use client";

import { usePathname } from "next/navigation";
import Header from "components/Header";

const LOGO_ONLY_ROUTES = new Set(["/login", "/registration"]);

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logoOnly = LOGO_ONLY_ROUTES.has(pathname);

  return (
    <>
      <Header logoOnly={logoOnly} />
      {children}
    </>
  );
}

