import { EditorLoader } from "@/features/gantt/components/EditorLoader";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ docId: string }>;
}) {
  const { docId } = await params;
  return <EditorLoader docId={docId} />;
}
