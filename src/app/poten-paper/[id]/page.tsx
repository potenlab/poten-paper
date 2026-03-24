import { PaperViewClient } from './paper-view-client';

interface PaperViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaperViewPage({ params }: PaperViewPageProps) {
  const { id } = await params;
  return <PaperViewClient planId={id} />;
}
