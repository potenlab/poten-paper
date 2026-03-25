'use client';

interface InsightBoxProps {
  type: 'insightBox' | 'quoteBox';
  title: string;
  data: { text: string; source?: string };
}

export function InsightBox({ type, title, data }: InsightBoxProps) {
  if (type === 'quoteBox') {
    return (
      <div className="my-4">
        <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 text-center">
          <p className="text-lg font-bold text-gray-800 leading-relaxed">
            &ldquo;{data.text}&rdquo;
          </p>
          {data.source && (
            <p className="text-xs text-gray-400 mt-3">— {data.source}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <h4 className="text-sm font-semibold text-gray-500 mb-3">{title}</h4>
      <div className="bg-amber-50 border-l-4 border-l-amber-400 border border-amber-200 rounded-r-xl p-4">
        <p className="text-sm text-gray-700 leading-relaxed">{data.text}</p>
        {data.source && (
          <p className="text-xs text-gray-400 mt-2">출처: {data.source}</p>
        )}
      </div>
    </div>
  );
}
