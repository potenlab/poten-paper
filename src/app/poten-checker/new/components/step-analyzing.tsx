'use client';

export function StepAnalyzing() {
  return (
    <section className="max-w-[720px] mx-auto px-4 sm:px-8 py-16 sm:py-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#8B5CF6]/10 mb-6">
          <div className="w-8 h-8 border-3 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          AI가 사업계획서를 분석 중입니다...
        </h2>
        <p className="text-muted mt-2">약 30초~1분 정도 소요됩니다</p>
      </div>

      {/* Skeleton UI */}
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-xl bg-card-secondary animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="w-full h-[280px] bg-card-secondary rounded-xl animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-card-secondary animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-card-secondary rounded-full animate-pulse mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-card-secondary rounded animate-pulse" />
                <div className="h-3 w-4/5 bg-card-secondary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
