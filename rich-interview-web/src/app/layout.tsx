"use client";
import MainLayout from "@/layouts/MainLayout";
import AppInitializerComponent from "@/components/AppInitializerComponent";
import store from "@/store";
import {Provider} from "react-redux";
import {AntdRegistry} from "@ant-design/nextjs-registry";
import {App as AntdApp, ConfigProvider} from "antd";
import AccessCheekComponent from "@/components/AccessCheekComponent";
import {Suspense} from "react";
import Loading from "@/components/LoadingComponent";
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
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#1677ff",
              },
              cssVar: true,
              hashed: false,
            }}
          >
            <AntdApp>
              <Provider store={store}>
                <AppInitializerComponent>
                  <Suspense fallback={<Loading />}>
                    <MainLayout>
                      <AccessCheekComponent>{children}</AccessCheekComponent>
                    </MainLayout>
                  </Suspense>
                </AppInitializerComponent>
              </Provider>
            </AntdApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
