import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { FirebaseAuthProvider } from "components/providers/firebase-auth-provider";
import { FirebaseTaskSyncProvider } from "components/providers/firebase-task-sync-provider";

export const metadata: Metadata = {
  title: "MindTask AI",
  description: "Plan smarter. Start smaller.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FirebaseAuthProvider>
          <FirebaseTaskSyncProvider>{children}</FirebaseTaskSyncProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
