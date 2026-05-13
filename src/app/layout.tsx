import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orlando 2027",
  description: "Planejamento da viagem em família",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="pt-BR">
      <body>
        {user && <Nav userName={user.name} />}
        <div className="max-w-4xl mx-auto px-4 pb-16 pt-4 md:pt-6">{children}</div>
      </body>
    </html>
  );
}
