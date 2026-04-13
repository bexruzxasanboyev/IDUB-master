export default function Loading() {
  return (
    <div className="bg-main text-white min-h-screen">
      {/* Hero banner */}
      <div className="relative w-full h-[40vh] sm:h-[55vh] md:h-[75vh] overflow-hidden">
        <div className="absolute inset-0 skeleton opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-main via-main/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-main/70 via-transparent to-transparent" />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-40 md:-mt-56 z-20">
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 lg:gap-10">
            {/* Poster */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="relative w-36 sm:w-48 md:w-56 lg:w-64 aspect-[2/3] rounded-xl md:rounded-2xl skeleton" />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 sm:space-y-5 w-full">
              <div className="space-y-3">
                <div className="h-8 sm:h-10 md:h-14 w-3/4 rounded-xl skeleton mx-auto md:mx-0" />
                <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                  <div className="h-5 w-14 rounded skeleton" />
                  <div className="h-5 w-14 rounded skeleton" />
                  <div className="h-5 w-16 rounded skeleton" />
                  <div className="h-5 w-14 rounded skeleton" />
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center md:justify-start">
                  <div className="h-6 w-16 rounded-md skeleton" />
                  <div className="h-6 w-20 rounded-md skeleton" />
                  <div className="h-6 w-18 rounded-md skeleton" />
                </div>
              </div>

              {/* Description lines */}
              <div className="space-y-2 max-w-3xl">
                <div className="h-3 w-full rounded skeleton" />
                <div className="h-3 w-11/12 rounded skeleton" />
                <div className="h-3 w-4/5 rounded skeleton" />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center md:justify-start">
                <div className="h-11 sm:h-12 w-32 rounded-lg skeleton" />
                <div className="h-11 sm:h-12 w-32 rounded-lg skeleton" />
                <div className="h-10 w-10 rounded-full skeleton" />
                <div className="h-10 w-10 rounded-full skeleton" />
                <div className="h-10 w-10 rounded-full skeleton" />
              </div>

              {/* Actors row */}
              <div className="space-y-2.5">
                <div className="h-4 w-24 rounded skeleton" />
                <div className="flex gap-3 sm:gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-1 text-center">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full skeleton" />
                      <div className="h-2 w-14 rounded skeleton mx-auto" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <section className="mt-10 sm:mt-14 md:mt-20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 sm:h-24 rounded-lg sm:rounded-xl skeleton" />
          ))}
        </section>

        {/* Player */}
        <section className="mt-10 sm:mt-14 md:mt-20">
          <div className="flex items-center gap-2.5 mb-3 sm:mb-5 md:mb-6">
            <div className="w-1 h-5 bg-white/10 rounded-full" />
            <div className="h-6 w-36 rounded-lg skeleton" />
          </div>
          <div className="aspect-video rounded-xl sm:rounded-2xl skeleton" />
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-16 rounded-full skeleton" />
            ))}
          </div>
        </section>

        {/* Similar */}
        <section className="mt-10 sm:mt-14 md:mt-20 pb-10 sm:pb-14 md:pb-20">
          <div className="flex items-center gap-2.5 mb-3 sm:mb-5 md:mb-6">
            <div className="w-1 h-5 bg-white/10 rounded-full" />
            <div className="h-6 w-40 rounded-lg skeleton" />
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
      </div>
    </div>
  );
}
