export type Episode = {
  id: string
  episode: number
  title: string
  preview: string
  duration: number
  releaseDate?: string
  video: string
}

export type Season = {
  season: number
  poster: string
  episodes: Episode[]
}
export type Episodes = {
  id: string
  episode: number
  title: string
  preview: string
  duration: number
  releaseDate: string
  video: string
}

export type Seasons = {
  season: number
  poster: string
  episodes: Episodes[]
}

export type PlayerProps = {
  seasons: Seasons[]
}
export type Similar = {
  id: string
  title: string
  poster: string
  rating?: number
  year?: number
  seasonNumber?: number
  seriesNumber?: number
}

export type Stats = {
  views: number
  likes: number
  bookmarks?: number
}
export type Actor = {
  name:string,
  img: string
}
export type Movie = {
  type: string[]
  category: string[]
  id: string
  title: string
  poster: string
  banner?: string
  backdrop?: string
  logo?: string
  trailer?: string
  seasonNumber?: number
  seriesNumber?: number
  genres?: string[]
  year?: number
  rating?: number
  desc?: string
  actors?: Actor[]
  director?: string
  slug?: string

  duration?: number
  status?: "ongoing" | "completed"

  country?: string
  language?: string
  network?: string

  producer?: string[]
  producers?: string[]
  writers?: string[]

  productionCompany?: string[]

  ageRating?: string
  tags?: string[]

  votes?: number

  screenshots?: string[]

  seasons?: Season[]
  similar?: Similar[]

  stats?: Stats

  isTrending?: boolean
  isTop10?: boolean
  isRecommended?: boolean

  createdAt?: Date
  updatedAt?: Date
}

export type Slide = {
  id: string
  title: string
  desc: string
  banner: string

  genres?: (string | { title?: string; slug?: string })[]
  seasonNumber?: number
  seriesNumber?: number

  poster?: string
  backdrop?: string

  year?: number
  rating?: number
  duration?: number

  country?: string
  language?: string
  network?: string

  actors?: string[]

  director?: string
  producers?: string[]

  screenshots?: string[]

  trailer?: string

  seasons?: Season[]

  similar?: Similar[]

  stats?: Stats
}