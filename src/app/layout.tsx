import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Control de Asistencia",
  description: "Sistema de control de asistencia laboral"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={GeistSans.className}>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
