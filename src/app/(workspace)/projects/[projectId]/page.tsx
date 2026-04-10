import { ProjectKanban } from "@/features/projects/project-kanban";

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return <ProjectKanban projectId={projectId} />;
}
