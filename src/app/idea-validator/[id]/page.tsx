import { ResultClient } from './result-client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function IdeaValidatorResultPage({ params }: PageProps) {
  const { id } = await params;
  return <ResultClient resultId={id} />;
}
