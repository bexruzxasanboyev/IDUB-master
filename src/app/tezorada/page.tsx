import { getNewDramas } from "@/lib/api";
import Breadcrumb from "../components/BreadCrumb";
import Card from "../components/Card";
import EmptyState from "../components/EmptyState";

export default async function TezOradaPage() {
  let items: { id: string; title: string; poster: string; seriesNumber?: number; seasonNumber?: number; genres?: string[] }[] = [];

  try {
    const data = await getNewDramas();
    items = data.items.map((d) => ({
      id: d.id,
      title: d.title,
      poster: d.posterUrl,
      seriesNumber: d.seriesNumber,
      seasonNumber: d.seasonNumber,
      genres: d.genres,
    }));
  } catch {
    // API error
  }

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />
      <h1 className="font-second font-semibold mb-5 flex flex-wrap items-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl">
        Tez orada
      </h1>

      {items.length === 0 ? (
        <EmptyState
          variant="schedule"
          title="Tez orada chiqadigan dramalar yo'q"
          description="Yaqinda yangi dramalar bu yerda paydo bo'ladi. Kuzatib turing!"
        />
      ) : (
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
      )}
    </div>
  );
}
