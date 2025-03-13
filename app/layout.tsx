import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { MantineProvider } from "@mantine/core";
import { LayoutProps } from "antd";
import "@mantine/charts/styles.css";
import '@mantine/core/styles.css';

export const metadata: Metadata = {
  title: "Calico",
  description: "A cute cat-themed fiscal tracker",
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <MantineProvider defaultColorScheme="light">
        <UserProvider>
          <body>
            {children}
            <script
              defer
              src="https://cloud.umami.is/script.js"
              data-website-id="e1c2962b-cf6a-4027-8640-4844c735afa2"
            ></script>
          </body>
        </UserProvider>
      </MantineProvider>
    </html>
  );
}
