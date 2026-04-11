import { notFound } from "next/navigation";
import Image from "next/image";
import { getActor, getActorDramas } from "@/lib/api";
import Card from "@/app/components/Card";
import Breadcrumb from "@/app/components/BreadCrumb";
import FavoriteButton from "./FavoriteButton";

export default async function ActorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let actor;
  try {
    const data = await getActor(id);
    actor = data.actor;
  } catch {
    notFound();
  }
  if (!actor) notFound();

  let dramas: { id: string; title: string; poster: string; seriesNumber?: number; seasonNumber?: number; genres?: string[] }[] = [];
  try {
    const data = await getActorDramas(id, 1, 30);
    dramas = data.items.map((d) => ({
      id: d.id,
      title: d.title,
      poster: d.posterUrl,
      seriesNumber: d.seriesNumber,
      seasonNumber: d.seasonNumber,
      genres: d.genres,
    }));
  } catch {
    // Use dramas from actor detail as fallback
    dramas = (actor.dramas || []).map((d) => ({
      id: d.id,
      title: d.title,
      poster: d.posterUrl,
      seriesNumber: d.seriesNumber,
      seasonNumber: d.seasonNumber,
      genres: d.genres,
    }));
  }

  return (
    <div className="container pt-24 sm:pt-28 md:pt-30 pb-10 text-white">
      <Breadcrumb />

      {/* Actor info */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-8">
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-full overflow-hidden border-2 border-white/10">
          {actor.actorImg ? (
            <Image src={actor.actorImg} alt={actor.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center text-4xl font-bold text-white/30">
              {actor.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{actor.name}</h1>
          {actor.bio && <p className="text-gray-400 text-sm sm:text-base max-w-2xl">{actor.bio}</p>}
          <FavoriteButton actorId={id} />
        </div>
      </div>

      {/* Dramas */}
      {dramas.length > 0 && (
        <>
          <h2 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-second rounded-full" />
            Dramalari
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {dramas.map((item) => (
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
        </>
      )}
    </div>
  );
}
