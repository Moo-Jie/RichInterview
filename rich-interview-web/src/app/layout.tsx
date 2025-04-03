"use client";
import MainLayout from "@/layouts/MainLayout";
import AppInitializerComponent from "@/components/AppInitializerComponent";
import store from "@/store";
import {Provider} from "react-redux";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import "./globals.css";
import AccessCheekComponent from "@/components/AccessCheekComponent";

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
            <AppInitializerComponent>
              <MainLayout>
                <AccessCheekComponent>{children}</AccessCheekComponent>
              </MainLayout>
            </AppInitializerComponent>
          </Provider>
        </AntdRegistry>
      </body>
    </html>
  );
}
