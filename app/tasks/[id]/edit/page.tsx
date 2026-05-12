import { MobileShell } from "components/layout/mobile-shell";
import { EditTaskScreen } from "components/tasks/edit-task-screen";

type EditTaskPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;

  return (
    <MobileShell activeTab="Tasks">
      <EditTaskScreen taskId={id} />
    </MobileShell>
  );
}
