import "./globals.css";
import MainLayout from "@/layouts/MainLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
