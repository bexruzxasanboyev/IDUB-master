type Props = {
  title?: string;
  count?: number;
  showBreadcrumb?: boolean;
};

export default function DramaGridSkeleton({
  title,
  count = 12,
  showBreadcrumb = true,
}: Props) {
  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      {showBreadcrumb && (
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <div className="h-6 w-20 rounded-lg skeleton" />
          <div className="h-3 w-3 rounded skeleton" />
          <div className="h-6 w-28 rounded-lg skeleton" />
        </div>
      )}
      <div className="mb-5 sm:mb-7">
        {title ? (
          <h1 className="font-second font-semibold text-2xl sm:text-3xl md:text-4xl">
            {title}
          </h1>
        ) : (
          <div className="h-8 sm:h-10 w-52 sm:w-72 rounded-xl skeleton" />
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[2/3] rounded-xl sm:rounded-2xl skeleton" />
            <div className="h-3 w-3/4 rounded skeleton" />
            <div className="h-2.5 w-1/2 rounded skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
