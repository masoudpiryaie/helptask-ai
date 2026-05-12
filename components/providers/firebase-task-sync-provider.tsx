"use client";

import { useEffect } from "react";
import { useAuthStore } from "lib/stores/auth-store";
import { useTaskStore } from "lib/stores/task-store";
import { subscribeToUserTasks } from "lib/firebase/task-service";

type FirebaseTaskSyncProviderProps = {
  children: React.ReactNode;
};

export function FirebaseTaskSyncProvider({
  children,
}: FirebaseTaskSyncProviderProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);

  const setTasks = useTaskStore((state) => state.setTasks);
  const setIsTaskSyncReady = useTaskStore((state) => state.setIsTaskSyncReady);

  useEffect(() => {
    if (!isAuthReady) return;

    if (!user) {
      setIsTaskSyncReady(true);
      return;
    }

    const unsubscribe = subscribeToUserTasks(user.uid, {
      onTasksChange: (tasks) => {
        setTasks(tasks);
        setIsTaskSyncReady(true);
      },
      onError: (error) => {
        console.error("Task sync error:", error);
        setIsTaskSyncReady(true);
      },
    });

    return () => unsubscribe();
  }, [user, isAuthReady, setTasks, setIsTaskSyncReady]);

  return <>{children}</>;
}
