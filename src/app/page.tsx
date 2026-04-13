import MovieHeroSwiper from "./components/MovieHeroSwiper";
import Section from "./components/Section";
import EmptyState from "./components/EmptyState";
import { getHome, normalizeImageUrl, type HomeSection, type DramaItem } from "@/lib/api";

function normalizeGenres(genres?: any[]): string[] | undefined {
  return genres?.map((g) => (typeof g === "string" ? g : g.title || g.slug));
}

function toSectionData(items: DramaItem[]) {
  return items.map((d) => ({
    id: d.id,
    title: d.title,
    poster: d.posterUrl,
    seriesNumber: d.seriesNumber,
    seasonNumber: d.seasonNumber,
    genres: normalizeGenres(d.genres as any[]),
    desc: d.description,
  }));
}

function toSlides(items: DramaItem[]) {
  return items.slice(0, 6).map((d) => ({
    id: d.id,
    title: d.title,
    desc: d.description || "",
    banner: normalizeImageUrl(d.bannerUrl || d.posterUrl),
    poster: normalizeImageUrl(d.posterUrl),
    genres: normalizeGenres(d.genres as any[]),
    year: d.year,
    rating: d.rating ?? d.imdbRating,
    seasonNumber: d.seasonNumber,
    seriesNumber: d.seriesNumber,
    duration: d.duration,
    country: d.country,
  }));
}

const SECTION_MAP: Record<string, { title: string; href: string; type?: "trending" }> = {
  TOP_SEARCHED: { title: "Hozirda mashxur", href: "/mashxur", type: "trending" },
  HOT: { title: "Eng qizg'in", href: "/mashxur" },
  NEW: { title: "Yangi kelganlar", href: "/hammasi" },
  BEST: { title: "Eng yaxshilar", href: "/eng-yaxshilar" },
  MOST_SAVED: { title: "Eng ko'p saqlangan", href: "/hammasi" },
  GENRE: { title: "Janr bo'yicha", href: "/hammasi" },
};

export default async function Page() {
  let sections: HomeSection[] = [];

  try {
    const data = await getHome();
    sections = data.sections;
  } catch {
    // API not available — render empty
  }

  // Use first HOT or TOP_SEARCHED section items for hero slides
  const heroSection = sections.find((s) => s.type === "HOT" || s.type === "TOP_SEARCHED");
  const slides = heroSection ? toSlides(heroSection.items) : [];

  return (
    <div>
      {slides.length > 0 && <MovieHeroSwiper slides={slides} />}
      <main className="min-h-screen container px-4 sm:px-6">
        {sections.map((section, i) => {
          const config = SECTION_MAP[section.type];
          if (!config) return null;
          const items = toSectionData(section.items);
          if (items.length === 0) return null;

          return (
            <Section
              key={`${section.type}-${i}`}
              title={section.title || config.title}
              data={items.slice(0, 10)}
              href={config.href}
              type={config.type}
            />
          );
        })}

        {sections.length === 0 && (
          <EmptyState
            variant="explore"
            title="Ma'lumotlar yuklanmadi"
            description="Server bilan bog'lanishda xatolik yuz berdi. Biroz kutib, qayta urinib ko'ring."
          />
        )}
      </main>
    </div>
  );
}
