import { PrdViewClient } from './prd-view-client';

interface PrdViewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrdViewPage({ params }: PrdViewPageProps) {
  const { id } = await params;
  return <PrdViewClient prdId={id} />;
}
