import { MobileShell } from "components/layout/mobile-shell";
import { TaskDetailScreen } from "components/tasks/task-detail-screen";

type TaskDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;

  return (
    <MobileShell activeTab="Tasks">
      <TaskDetailScreen taskId={id} />
    </MobileShell>
  );
}
