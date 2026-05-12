import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { FirebaseAuthProvider } from "components/providers/firebase-auth-provider";
import { FirebaseTodaySyncProvider } from "components/providers/firebase-today-sync-provider";
import { FirebaseTaskSyncProvider } from "components/providers/firebase-task-sync-provider";
import { FirebaseProgressSyncProvider } from "components/providers/firebase-progress-sync-provider";
import { FirebasePlanSyncProvider } from "components/providers/firebase-plan-sync-provider";
import { SyncGate } from "components/providers/sync-gate";

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
          <FirebaseTodaySyncProvider>
            <FirebaseTaskSyncProvider>
              <FirebaseProgressSyncProvider>
                <FirebasePlanSyncProvider>
                  <SyncGate>{children}</SyncGate>
                </FirebasePlanSyncProvider>
              </FirebaseProgressSyncProvider>
            </FirebaseTaskSyncProvider>
          </FirebaseTodaySyncProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
