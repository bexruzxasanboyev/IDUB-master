export default function Loading() {
  return (
    <div className="relative bg-main text-white min-h-screen">
      {/* Hero */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[60vh] overflow-hidden">
        <div className="absolute inset-0 skeleton opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-main via-main/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 md:pb-20">
        <div className="relative -mt-28 sm:-mt-40 md:-mt-48 z-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 md:gap-8 lg:gap-10">
            {/* Avatar */}
            <div className="shrink-0 w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full skeleton border-4 border-main" />

            {/* Info */}
            <div className="flex-1 min-w-0 text-center md:text-left space-y-4 sm:space-y-5 w-full">
              <div className="space-y-2">
                <div className="h-3 w-16 rounded skeleton mx-auto md:mx-0" />
                <div className="h-10 sm:h-12 md:h-14 w-2/3 rounded-xl skeleton mx-auto md:mx-0" />
              </div>
              <div className="space-y-2 max-w-3xl mx-auto md:mx-0">
                <div className="h-3 w-full rounded skeleton" />
                <div className="h-3 w-4/5 rounded skeleton" />
              </div>
              <div className="flex gap-2 sm:gap-3 justify-center md:justify-start">
                <div className="h-10 w-24 rounded-lg skeleton" />
                <div className="h-10 w-28 rounded-lg skeleton" />
                <div className="h-10 w-28 rounded-lg skeleton" />
              </div>
            </div>
          </div>
        </div>

        {/* Dramas grid */}
        <section className="mt-12 sm:mt-16 md:mt-20">
          <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
            <div className="w-1 h-6 sm:h-7 bg-white/10 rounded-full" />
            <div className="h-7 sm:h-8 w-64 rounded-lg skeleton" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-xl sm:rounded-2xl overflow-hidden bg-white/[0.02] border border-white/5">
                <div className="aspect-[2/3] skeleton" />
                <div className="p-2.5 sm:p-3 space-y-1.5">
                  <div className="h-3 w-4/5 rounded skeleton" />
                  <div className="h-2.5 w-1/2 rounded skeleton" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
