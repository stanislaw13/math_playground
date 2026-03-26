import type { ReactNode } from "react";

export const metadata = {
  title: "Math Playground",
  description: "Interactive math lessons for primary and high school students",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
