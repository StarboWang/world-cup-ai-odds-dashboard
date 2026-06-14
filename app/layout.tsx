import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "世界杯 AI 预测台",
  description: "面向中文用户的世界杯赛程、预测、赔率和模拟收益看板"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
