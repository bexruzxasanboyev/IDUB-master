export default function Loading() {
  return (
    <div className="min-h-screen bg-main">
      {/* Hero swiper skeleton */}
      <div className="relative w-full min-h-[65vh] sm:min-h-[70vh] md:min-h-[45vw] overflow-hidden">
        <div className="absolute inset-0 skeleton" />
        <div className="absolute inset-0 bg-gradient-to-t from-main via-main/50 to-main/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 container flex items-end sm:items-center pb-20 sm:pb-0">
          <div className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl space-y-3 sm:space-y-4 md:space-y-5">
            <div className="flex gap-2">
              <div className="h-6 w-16 rounded-lg skeleton" />
              <div className="h-6 w-20 rounded-lg skeleton" />
              <div className="h-6 w-14 rounded-lg skeleton" />
            </div>
            <div className="h-10 sm:h-14 md:h-16 w-3/4 rounded-xl skeleton" />
            <div className="space-y-2">
              <div className="h-3 w-full max-w-lg rounded skeleton" />
              <div className="h-3 w-4/5 max-w-lg rounded skeleton" />
            </div>
            <div className="flex gap-3 pt-2 sm:pt-3">
              <div className="h-12 w-36 sm:w-48 rounded-xl skeleton" />
              <div className="h-12 w-24 rounded-xl skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Sections skeleton */}
      <main className="min-h-screen container px-4 sm:px-6">
        {Array.from({ length: 3 }).map((_, si) => (
          <section key={si} className="w-full py-5 sm:py-8 md:py-10">
            <div className="flex items-center gap-3 mb-5 sm:mb-7">
              <div className="w-1 h-6 sm:h-7 bg-white/10 rounded-full" />
              <div className="h-7 sm:h-8 w-48 sm:w-64 rounded-lg skeleton" />
            </div>
            <div className="flex gap-3 sm:gap-4 md:gap-5 overflow-hidden">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-[45%] sm:w-[30%] md:w-[22%] lg:w-[18%] aspect-[2/3] rounded-xl sm:rounded-2xl skeleton"
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
