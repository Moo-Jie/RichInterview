"use client";
import MainLayout from "@/layouts/MainLayout";
import AppInitializer from "@/components/AppInitializer";
import store from "@/store";
import { Provider } from "react-redux";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";

/**
 * 根布局组件
 * @param children 子组件
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body>
        <AntdRegistry>
          <Provider store={store}>
            <AppInitializer>
              <MainLayout>{children}</MainLayout>
            </AppInitializer>
          </Provider>
        </AntdRegistry>
      </body>
    </html>
  );
}
