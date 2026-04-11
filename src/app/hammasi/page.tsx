import { getDramas } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import Card from "../components/Card";

export default async function HammasiPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; genre?: string; category?: string; sort?: string }>;
}) {
  const { page: pageStr, genre, category, sort } = await searchParams;
  const page = Number(pageStr) || 1;

  let items: { id: string; title: string; poster: string; seriesNumber?: number; seasonNumber?: number; genres?: string[] }[] = [];
  let totalPages = 1;

  try {
    const data = await getDramas({ page, limit: 30, sort: sort || "newest", genre, category });
    items = data.items.map((d) => ({
      id: d.id,
      title: d.title,
      poster: d.posterUrl,
      seriesNumber: d.seriesNumber,
      seasonNumber: d.seasonNumber,
      genres: d.genres,
    }));
    totalPages = data.pagination.totalPages;
  } catch {
    // API error
  }

  const title = genre
    ? `${genre.charAt(0).toUpperCase() + genre.slice(1)} dramalari`
    : category
      ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
      : "Barcha dramalar";

  // Build pagination URL with current filters
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    params.set("page", String(p));
    if (genre) params.set("genre", genre);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    return `/hammasi?${params.toString()}`;
  };

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="font-second font-semibold mb-5 flex flex-wrap items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl">
        {title}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-3">😢</p>
          <p className="text-gray-400">Hech narsa topilmadi</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
            {items.map((item) => (
              <Card
                key={item.id}
                id={item.id}
                title={item.title}
                poster={item.poster}
                seriesNumber={item.seriesNumber}
                seasonNumber={item.seasonNumber}
                genres={item.genres}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <a
                  href={buildPageUrl(page - 1)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                >
                  Oldingi
                </a>
              )}
              <span className="px-4 py-2 text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={buildPageUrl(page + 1)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                >
                  Keyingi
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
