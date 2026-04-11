import { notFound } from "next/navigation";
import SafeImage from "@/app/components/SafeImage";
import { FaPlay, FaStar, FaShareAlt } from "react-icons/fa";
import { LuClock, LuEye, LuFilm, LuThumbsUp, LuThumbsDown } from "react-icons/lu";
import Player from "@/app/components/Player";
import Card from "@/app/components/Card";
import { getDrama, getSimilarDramas, getDramaEpisodes, getDramaSeasons } from "@/lib/api";
import SaveButton from "./SaveButton";
import ViewTracker from "./ViewTracker";

type MoviePageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;

  let drama;
  try {
    const data = await getDrama(id);
    drama = data.drama;
  } catch {
    notFound();
  }

  if (!drama) notFound();

  // Fetch similar, seasons, episodes in parallel
  const [similarData, seasonsData] = await Promise.all([
    getSimilarDramas(id).catch(() => ({ items: [] })),
    getDramaSeasons(id).catch(() => ({ seasons: [] })),
  ]);

  // Fetch episodes for each season
  const seasonsWithEpisodes = await Promise.all(
    seasonsData.seasons.map(async (s) => {
      const epData = await getDramaEpisodes(id, s.seasonNumber).catch(() => ({ episodes: [] }));
      const episodes = epData.episodes || [];
      return {
        season: s.seasonNumber,
        poster: s.poster || drama.posterUrl,
        episodes: episodes.map((ep) => ({
          id: ep.id,
          episode: ep.episodeNumber,
          title: ep.title,
          preview: ep.preview || "",
          duration: ep.duration || 0,
          releaseDate: ep.releaseDate,
          video: ep.videoUrl || "",
          isFree: ep.isFree,
          isUnlocked: ep.isUnlocked,
        })),
      };
    })
  );

  // If no seasons from API, try drama.episodes directly
  const playerSeasons = seasonsWithEpisodes.length > 0
    ? seasonsWithEpisodes
    : drama.seasons
      ? drama.seasons.map((s) => ({
          season: s.seasonNumber,
          poster: s.poster || drama.posterUrl,
          episodes: (drama.episodes || [])
            .filter((_, i) => i < 50)
            .map((ep) => ({
              id: ep.id,
              episode: ep.episodeNumber,
              title: ep.title,
              preview: ep.preview || "",
              duration: ep.duration || 0,
              releaseDate: ep.releaseDate,
              video: ep.videoUrl || "",
              isFree: ep.isFree,
              isUnlocked: ep.isUnlocked,
            })),
        }))
      : [];

  const similar = similarData.items.map((d) => ({
    id: d.id,
    title: d.title,
    poster: d.posterUrl,
    seasonNumber: d.seasonNumber,
    seriesNumber: d.seriesNumber,
  }));

  return (
    <div className="bg-main text-white min-h-screen">
      <ViewTracker dramaId={id} />

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-[40vh] sm:h-[55vh] md:h-[75vh] overflow-hidden">
        {drama.trailer ? (
          <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover">
            <source src={drama.trailer} type="video/mp4" />
          </video>
        ) : (
          <SafeImage
            src={drama.bannerUrl || drama.posterUrl}
            alt="Banner"
            fill
            priority
            className="object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-main via-main/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-main/70 via-transparent to-transparent" />
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-24 sm:-mt-40 md:-mt-56 z-20">
          <div className="flex flex-col md:flex-row gap-5 md:gap-8 lg:gap-10">

            {/* Poster */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="relative w-36 sm:w-48 md:w-56 lg:w-64 aspect-[2/3]">
                <SafeImage
                  src={drama.posterUrl}
                  alt={drama.title}
                  fill
                  className="object-cover rounded-xl md:rounded-2xl"
                />
                <div className="absolute inset-0 rounded-xl md:rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] ring-1 ring-inset ring-white/10" />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 space-y-4 sm:space-y-5 text-center md:text-left">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-2 sm:mb-3">
                  {drama.title}
                </h1>

            <div className="flex items-center justify-center gap-3">
                  <div className="flex gap-2 text-gray-400 text-xs sm:text-sm justify-center justify-start flex-wrap">
                  {(drama.imdbRating || drama.imdbRating === 0) && (
                    <>
                      <div className="flex items-center gap-1">
                        <FaStar className="text-yellow-500 text-xs" />
                        <span className="text-white font-bold">{drama.imdbRating}</span>
                      </div>
                      <span className="text-gray-600">|</span>
                    </>
                  )}
                  {drama.year && <><span>{drama.year}</span><span className="text-gray-600">|</span></>}
                  {drama.country && <><span>{drama.country}</span><span className="text-gray-600">|</span></>}
                  {drama.duration && <><span>{drama.duration} min</span><span className="text-gray-600">|</span></>}
                  {drama.ageRating && (
                    <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] sm:text-xs font-bold text-white/90">
                      {drama.ageRating}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
                  {drama.genres?.map((g: any, i: number) => (
                    <span key={i} className="px-2.5 py-1 bg-white/8 rounded-md text-[11px] sm:text-xs text-white/70 border border-white/5">
                      {typeof g === "string" ? g : g.title || g.slug}
                    </span>
                  ))}
                </div>
            </div>
              </div>

              {drama.description && (
                <p className="text-sm text-start sm:text-base text-gray-400 leading-relaxed max-w-3xl">
                  {drama.description}
                </p>
              )}

              {/* Additional metadata */}
              {(drama.director || drama.network || drama.language || (drama.tags && drama.tags.length > 0)) && (
                <div className="space-y-1.5 text-sm text-left">
                  {drama.director && (
                    <p className="text-gray-400">
                      <span className="text-gray-500">Rejissyor: </span>
                      <span className="text-white/80">{drama.director}</span>
                    </p>
                  )}
                  {drama.network && (
                    <p className="text-gray-400">
                      <span className="text-gray-500">Tarmoq: </span>
                      <span className="text-white/80">{drama.network}</span>
                    </p>
                  )}
                  {drama.language && (
                    <p className="text-gray-400">
                      <span className="text-gray-500">Til: </span>
                      <span className="text-white/80">{drama.language}</span>
                    </p>
                  )}
                  {drama.tags && drama.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {drama.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[11px] text-gray-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Buttons + Quick Actions */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap  justify-start">
                <a
                  href="#movie"
                  className="px-5 sm:px-7 py-2.5 sm:py-3 bg-second text-white rounded-lg font-bold flex items-center gap-2 hover:bg-second/85 transition-all duration-200 active:scale-95 text-sm sm:text-base"
                >
                  <FaPlay className="text-xs" /> Ko&apos;rish
                </a>
                <SaveButton dramaId={id} />
                <div className="flex items-center gap-1 ml-1">
                  <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-blue-500/15 hover:border-blue-500/30 hover:text-blue-400 transition-all duration-200" aria-label="Yoqdi">
                    <LuThumbsUp className="size-4" />
                  </button>
                  <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all duration-200" aria-label="Yoqmadi">
                    <LuThumbsDown className="size-4" />
                  </button>
                  <button className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-green-500/15 hover:border-green-500/30 hover:text-green-400 transition-all duration-200" aria-label="Ulashish">
                    <FaShareAlt className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Actors */}
              {drama.actors && drama.actors.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-sm sm:text-base font-bold flex items-center gap-2 justify-start text-gray-300">
                    <span className="w-0.5 h-4 bg-second rounded-full" /> Aktyorlar
                  </h3>
                  <div className="flex flex-wrap gap-3 sm:gap-4 justify-start">
                    {drama.actors.map((actor, index) => (
                      <div key={index} className="group text-center">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-1">
                          {actor.actorImg ? (
                            <SafeImage
                              src={actor.actorImg}
                              alt={actor.name}
                              fill
                              fallbackText={actor.name.charAt(0)}
                              className="object-cover rounded-full border-2 border-white/10 group-hover:border-second/50 transition-colors duration-200"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white/50">
                              {actor.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 group-hover:text-white transition-colors duration-200 max-w-[70px] sm:max-w-[80px] truncate">{actor.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- STATS --- */}
        <section className="mt-10 sm:mt-14 md:mt-20 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {[
            { label: "Ko'rildi", val: drama.viewsCount?.toLocaleString() || "—", icon: LuEye },
            { label: "Reyting", val: drama.imdbRating ?? "—", icon: FaStar, color: "text-yellow-500" },
            { label: "Status", val: drama.status === "ongoing" ? "Davom etmoqda" : "Tugagan", icon: LuFilm },
            ...(drama.likesCount !== undefined ? [{ label: "Yoqdi", val: drama.likesCount.toLocaleString(), icon: LuThumbsUp, color: "text-blue-400" }] : []),
            ...(drama.totalEpisodes ? [{ label: "Qismlar", val: `${drama.totalEpisodes}${drama.freeEpisodesCount ? ` (${drama.freeEpisodesCount} bepul)` : ""}`, icon: LuFilm, color: "text-green-400" }] : []),
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl hover:bg-white/[0.06] transition-colors duration-200">
              <div className="flex items-center gap-2 mb-1.5">
                <stat.icon className={`text-base sm:text-lg ${stat.color || "text-gray-500"}`} />
                <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
              <p className="text-sm sm:text-lg md:text-xl font-bold truncate">{stat.val}</p>
            </div>
          ))}
        </section>

        {/* --- PLAYER --- */}
        {playerSeasons.length > 0 && (
          <section id="movie" className="mt-10 sm:mt-14 md:mt-20">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-5 md:mb-6">
              <div className="w-1 h-5 bg-second rounded-full" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Tomosha qilish</h2>
            </div>
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-white/5">
              <Player seasons={playerSeasons} dramaId={id} />
            </div>
          </section>
        )}

        {/* --- SCREENSHOTS --- */}
        {drama.screenshots && drama.screenshots.length > 0 && (
          <section className="mt-10 sm:mt-14 md:mt-20">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-5 md:mb-6">
              <div className="w-1 h-5 bg-second rounded-full" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Kadrlardan namunalar</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              {drama.screenshots.map((img, i) => (
                <div key={i} className="group relative aspect-video overflow-hidden rounded-lg sm:rounded-xl cursor-pointer border border-white/5 hover:border-white/15 transition-colors duration-200">
                  <SafeImage src={img} fill className="object-cover group-hover:scale-105 transition-transform duration-500" alt="Screenshot" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="p-2.5 sm:p-3 bg-white/15 backdrop-blur-sm rounded-full">
                      <LuEye className="size-4 sm:size-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- SIMILAR --- */}
        {similar.length > 0 && (
          <section className="mt-10 sm:mt-14 md:mt-20 pb-10 sm:pb-14 md:pb-20">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-5 md:mb-6">
              <div className="w-1 h-5 bg-second rounded-full" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Sizga yoqishi mumkin</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {similar.map((item) => (
                <Card
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  poster={item.poster}
                  seriesNumber={item.seriesNumber}
                  seasonNumber={item.seasonNumber}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
