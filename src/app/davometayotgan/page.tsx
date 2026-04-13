import { getDramas } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";

export default async function DavomEtayotganPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Number(pageStr) || 1;

  let items: { id: string; title: string; poster: string; seriesNumber?: number; seasonNumber?: number; genres?: string[] }[] = [];
  let totalPages = 1;

  try {
    const data = await getDramas({ page, limit: 30, sort: "newest", accessType: "ongoing" });
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

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="font-second font-semibold mb-5 flex flex-wrap items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl">
        Davom etayotgan
      </h1>

      {items.length === 0 ? (
        <EmptyState
          variant="dramas"
          title="Davom etayotgan dramalar yo'q"
          description="Hozircha yangi epizod chiqarayotgan dramalar topilmadi"
        />
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
                <a href={`/davometayotgan?page=${page - 1}`} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition">Oldingi</a>
              )}
              <span className="px-4 py-2 text-sm text-gray-400">{page} / {totalPages}</span>
              {page < totalPages && (
                <a href={`/davometayotgan?page=${page + 1}`} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition">Keyingi</a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
