import { ResultClient } from './result-client';

interface ResultPageProps {
  params: Promise<{ resultId: string }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { resultId } = await params;
  return <ResultClient resultId={resultId} />;
}
