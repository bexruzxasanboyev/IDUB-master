const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || "https://idubbackend.asosit.uz";
const isServer = typeof window === "undefined";
const BASE_URL = isServer ? SERVER_URL : "/api-proxy";

type ApiResponse<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: { code: string; message: string };
};

async function request<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...init } = options || {};
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.ok) {
    const err = json.error;
    throw new ApiError(err.code, err.message, res.status);
  }

  return json.data;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── HOME ───────────────────────────────────────────
export async function getHome() {
  return request<{ sections: HomeSection[] }>("/home");
}

export async function getBestDramas(page = 1, limit = 20) {
  return request<{ items: DramaItem[] }>(`/bestdramas?page=${page}&limit=${limit}`);
}

export async function getNewDramas() {
  return request<{ items: DramaItem[] }>("/dramas/new");
}

export async function getTrendingDramas(window = "7d") {
  return request<{ items: DramaItem[] }>(`/dramas/trending?window=${window}`);
}

// ─── DRAMAS ─────────────────────────────────────────
export type DramaListParams = {
  page?: number;
  limit?: number;
  genre?: string;
  category?: string;
  accessType?: string;
  source?: string;
  planId?: string;
  sort?: string;
};

export async function getDramas(params: DramaListParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") query.set(k, String(v));
  });
  const qs = query.toString();
  return request<{ items: DramaItem[]; pagination: Pagination }>(`/dramas${qs ? `?${qs}` : ""}`);
}

export async function getDrama(id: string) {
  return request<{ drama: DramaDetail }>(`/dramas/${id}`);
}

export async function getSimilarDramas(id: string) {
  return request<{ items: DramaItem[] }>(`/dramas/${id}/similar`);
}

export async function getDramaSeasons(id: string) {
  return request<{ seasons: ApiSeason[] }>(`/dramas/${id}/seasons`);
}

export async function getDramaEpisodes(id: string, seasonNumber?: number) {
  const qs = seasonNumber !== undefined ? `?seasonNumber=${seasonNumber}` : "";
  return request<{ episodes: ApiEpisode[] }>(`/dramas/${id}/episodes${qs}`);
}

export async function markDramaViewed(id: string, token: string) {
  return request<object>(`/dramas/${id}/view`, { method: "POST", token });
}

// ─── SEARCH ─────────────────────────────────────────
export async function searchDramas(query: string) {
  return request<{ items: DramaItem[] }>(`/search?query=${encodeURIComponent(query)}`);
}

export async function getTopSearches(window = "7d") {
  return request<{ items: TopSearch[] }>(`/search/top?window=${window}`);
}

export async function getTopSearchedDramas(window = "7d") {
  return request<{ items: DramaItem[] }>(`/search/top-dramas?window=${window}`);
}

export async function trackSearchClick(queryNormalized: string, dramaId: string) {
  return request<object>("/search/click", {
    method: "POST",
    body: JSON.stringify({ queryNormalized, dramaId }),
  });
}

// ─── AUTH ────────────────────────────────────────────
export async function createDeviceCode() {
  return request<{ deviceCode: string }>("/auth/device-code", { method: "POST" });
}

export async function checkDeviceCode(code: string) {
  return request<{ linked: boolean; expiresAt: string }>(`/auth/device-code/${code}/status`);
}

export async function authStart(phone: string) {
  return request<{ otpSent: boolean; expiresInSec: number }>("/auth/start", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function authVerify(phone: string, code: string) {
  return request<AuthResult>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  });
}

export async function authRefresh(refreshToken: string) {
  return request<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

// ─── PROFILE ────────────────────────────────────────
export async function getMe(token: string) {
  return request<UserProfile>("/me", { token });
}

export async function checkToken(token: string) {
  return request<object>("/me/token-check", { token });
}

export async function updateProfile(token: string, data: { name?: string; birthDate?: string }) {
  return request<{ updated: boolean }>("/me/profile", {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export async function updateAvatar(token: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/me/avatar`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await res.json();
  if (!json.ok) throw new ApiError(json.error.code, json.error.message, res.status);
  return json.data as { avatarUrl: string };
}

export async function updateGenres(token: string, genreSlugs: string[]) {
  return request<{ updated: boolean }>("/me/genres", {
    method: "PUT",
    token,
    body: JSON.stringify({ genreSlugs }),
  });
}

// ─── FAVORITE ACTORS ────────────────────────────────
export async function getFavoriteActors(token: string) {
  return request<{ actors: FavoriteActor[] }>("/me/favorite-actors", { token });
}

export async function addFavoriteActor(token: string, actorId: string) {
  return request<{ added: boolean }>(`/me/favorite-actors/${actorId}`, { method: "POST", token });
}

export async function removeFavoriteActor(token: string, actorId: string) {
  return request<{ removed: boolean }>(`/me/favorite-actors/${actorId}`, { method: "DELETE", token });
}

// ─── PLANS & SUBSCRIPTION ───────────────────────────
export async function getPlans() {
  return request<{ plans: Plan[] }>("/plans");
}

export async function getPremiumFeatures() {
  return request<{ features: PremiumFeature[] }>("/premium-features");
}

export async function getSubscription(token: string) {
  return request<SubscriptionInfo>("/me/subscription", { token });
}

// ─── SAVED ──────────────────────────────────────────
export async function addSaved(token: string, dramaId: string, source?: string) {
  return request<object>("/saved/add", {
    method: "POST",
    token,
    body: JSON.stringify({ dramaId, source }),
  });
}

export async function removeSaved(token: string, dramaId: string) {
  return request<object>("/saved/remove", {
    method: "POST",
    token,
    body: JSON.stringify({ dramaId }),
  });
}

export async function getSaved(token: string) {
  return request<{ items: DramaItem[] }>("/saved", { token });
}

export async function bulkRemoveSaved(token: string, dramaIds: string[]) {
  return request<object>("/saved/bulk-remove", {
    method: "POST",
    token,
    body: JSON.stringify({ dramaIds }),
  });
}

// ─── HISTORY ────────────────────────────────────────
export async function saveWatchProgress(
  token: string,
  data: { dramaId: string; episodeNumber: number; positionSec: number; completed?: boolean; watchedSec?: number; source?: string }
) {
  return request<object>("/history/watch", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function getHistory(token: string) {
  return request<{ items: HistoryItem[] }>("/history", { token });
}

export async function bulkRemoveHistory(token: string, dramaIds: string[]) {
  return request<object>("/history/bulk-remove", {
    method: "POST",
    token,
    body: JSON.stringify({ dramaIds }),
  });
}

// ─── COINS ──────────────────────────────────────────
export async function getCoins(token: string) {
  return request<CoinInfo>("/me/coins", { token });
}

export async function getCoinTransactions(token: string, page = 1, limit = 20) {
  return request<{ items: CoinTransaction[]; pagination: Pagination }>(`/me/coins/transactions?page=${page}&limit=${limit}`, { token });
}

export async function claimAdReward(token: string) {
  return request<{ amount: number; newBalance: number }>("/me/coins/claim-ad", { method: "POST", token });
}

export async function claimShareReward(token: string) {
  return request<{ amount: number; newBalance: number }>("/me/coins/claim-share", { method: "POST", token });
}

export async function claimSocialReward(token: string, platform: string) {
  return request<{ amount: number; newBalance: number }>("/me/coins/claim-social", {
    method: "POST",
    token,
    body: JSON.stringify({ platform }),
  });
}

export async function claimWelcomeBonus(token: string) {
  return request<{ amount: number; newBalance: number; day: number }>("/me/coins/claim-welcome", { method: "POST", token });
}

export async function claimVipDaily(token: string) {
  return request<{ amount: number; newBalance: number }>("/me/coins/claim-vip-daily", { method: "POST", token });
}

export async function claimNotificationReward(token: string) {
  return request<{ amount: number; newBalance: number }>("/me/coins/claim-notification", {
    method: "POST",
    token,
    body: JSON.stringify({ enabled: true }),
  });
}

export async function getCoinPackages(token: string) {
  return request<{ packages: CoinPackage[] }>("/me/coins/packages", { token });
}

export async function purchaseCoinPackage(token: string, packageId: string) {
  return request<{ amount: number; newBalance: number }>("/me/coins/purchase", {
    method: "POST",
    token,
    body: JSON.stringify({ packageId }),
  });
}

// ─── EPISODES & PLAYBACK ────────────────────────────
export async function unlockEpisodes(token: string, dramaId: string, episodeNumbers: number[]) {
  return request<{ unlocked: number[]; newBalance: number }>("/episodes/unlock", {
    method: "POST",
    token,
    body: JSON.stringify({ dramaId, episodeNumbers }),
  });
}

export async function getPlaybackUrl(token: string, episodeId: string) {
  return request<{ url: string; expiresAt: string }>(`/playback/${episodeId}`, { token });
}

// ─── SCHEDULE ───────────────────────────────────────
export async function getSchedule(category?: string) {
  const qs = category ? `?category=${category}` : "";
  return request<{ items: ScheduleItem[] }>(`/schedule${qs}`);
}

export async function addReminder(token: string, scheduleId: string) {
  return request<object>(`/schedule/${scheduleId}/remind`, { method: "POST", token });
}

export async function removeReminder(token: string, scheduleId: string) {
  return request<object>(`/schedule/${scheduleId}/remind`, { method: "DELETE", token });
}

// ─── NOTIFICATIONS ──────────────────────────────────
export async function registerPushToken(token: string, pushToken: string, platform: string) {
  return request<object>("/me/push-token", {
    method: "POST",
    token,
    body: JSON.stringify({ token: pushToken, platform }),
  });
}

export async function getNotifications(token: string, page = 1, limit = 20) {
  return request<{ items: NotificationItem[]; pagination: Pagination; unreadCount: number }>(`/me/notifications?page=${page}&limit=${limit}`, { token });
}

export async function getUnreadCount(token: string) {
  return request<{ count: number }>("/me/notifications/unread-count", { token });
}

export async function markNotificationRead(token: string, id: string) {
  return request<object>(`/me/notifications/${id}/read`, { method: "PATCH", token });
}

export async function markAllNotificationsRead(token: string) {
  return request<object>("/me/notifications/read-all", { method: "PATCH", token });
}

// ─── PERSONALIZED ───────────────────────────────────
export async function getRandomDramas(token: string, page = 1, limit = 20, seed?: number) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (seed !== undefined) qs.set("seed", String(seed));
  return request<{ items: DramaItem[]; pagination: Pagination; seed: number }>(`/me/random?${qs}`, { token });
}

export async function getRecommendation(token: string) {
  return request<{ drama: DramaItem }>("/me/recommendation", { token });
}

// ─── ACTORS ─────────────────────────────────────────
export async function getActors(page = 1, limit = 20) {
  return request<{ items: ActorItem[]; pagination: Pagination }>(`/actors?page=${page}&limit=${limit}`);
}

export async function searchActors(q: string, page = 1, limit = 20) {
  return request<{ items: ActorItem[] }>(`/actors/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
}

export async function getActor(id: string) {
  return request<{ actor: ActorDetail }>(`/actors/${id}`);
}

export async function getActorDramas(id: string, page = 1, limit = 20) {
  return request<{ items: DramaItem[]; pagination: Pagination }>(`/actors/${id}/dramas?page=${page}&limit=${limit}`);
}

// ─── GENRES & CATEGORIES ────────────────────────────
export async function getGenres() {
  return request<{ genres: Genre[] }>("/genres");
}

export async function getCategories() {
  return request<{ groups: CategoryGroup[] }>("/categories");
}

// ─── PROMO ──────────────────────────────────────────
export async function redeemPromo(token: string, code: string) {
  return request<{ type: string; value: string; message: string }>("/me/promo/redeem", {
    method: "POST",
    token,
    body: JSON.stringify({ code }),
  });
}

// ─── APP CONTENT ────────────────────────────────────
export async function getTips() {
  return request<{ items: Tip[] }>("/app/tips");
}

export async function getLegalLinks() {
  return request<{ termsUrl: string; privacyUrl: string }>("/app/legal_links");
}

// ─── DOWNLOADS ──────────────────────────────────────
export async function getDownloads(token: string) {
  return request<{ items: DownloadItem[] }>("/downloads", { token });
}

export async function grantDownload(token: string, data: { episodeId: string; quality: string; deviceId: string; source?: string }) {
  return request<{ downloadUrl: string; license: string }>("/downloads/grant", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteDownload(token: string, downloadItemId: string) {
  return request<object>("/downloads/delete", {
    method: "POST",
    token,
    body: JSON.stringify({ downloadItemId }),
  });
}

// ─── ANALYTICS ─────────────────────────────────────
export async function sendAnalyticsEvent(
  token: string,
  data: { event: string; screen?: string; target?: string; meta?: Record<string, unknown> }
) {
  return request<object>("/me/analytics/event", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function sendAnalyticsEvents(
  token: string,
  events: { event: string; screen?: string; target?: string; meta?: Record<string, unknown>; timestamp?: string }[]
) {
  return request<object>("/me/analytics/events", {
    method: "POST",
    token,
    body: JSON.stringify({ events }),
  });
}

export async function startWatchSession(
  token: string,
  data: { dramaId: string; episodeNumber: number; startPosSec: number; source?: string }
) {
  return request<{ sessionId: string }>("/me/analytics/watch-session/start", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function updateWatchSession(
  token: string,
  data: { sessionId: string; endPosSec: number; durationSec: number; completed?: boolean }
) {
  return request<object>("/me/analytics/watch-session/update", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function endWatchSession(
  token: string,
  data: { sessionId: string; endPosSec: number; durationSec: number; completed?: boolean }
) {
  return request<object>("/me/analytics/watch-session/end", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

// ─── TELEGRAM LINK ─────────────────────────────────
export async function authStartDevice(deviceCode: string) {
  return request<{ otpSent: boolean; expiresInSec: number }>("/auth/start-device", {
    method: "POST",
    body: JSON.stringify({ deviceCode }),
  });
}

export async function authVerifyDevice(deviceCode: string, code: string) {
  return request<AuthResult>("/auth/verify-device", {
    method: "POST",
    body: JSON.stringify({ deviceCode, code }),
  });
}

export async function removePushToken(token: string, pushToken: string) {
  return request<object>("/me/push-token", {
    method: "DELETE",
    token,
    body: JSON.stringify({ token: pushToken }),
  });
}

// ─── TYPES ──────────────────────────────────────────

export type HomeSection = {
  type: "TOP_SEARCHED" | "HOT" | "GENRE" | "MOST_SAVED" | "NEW" | "BEST";
  title?: string;
  items: DramaItem[];
};

export type DramaItem = {
  id: string;
  title: string;
  posterUrl: string;
  bannerUrl?: string;
  description?: string;
  genres?: string[];
  year?: number;
  rating?: number;
  imdbRating?: number;
  country?: string;
  duration?: number;
  totalEpisodes?: number;
  freeEpisodesCount?: number;
  accessType?: string;
  status?: string;
  seasonNumber?: number;
  seriesNumber?: number;
  rank?: number;
  score?: number;
  badge?: string;
  viewsCount?: number;
  searchCount?: number;
};

export type DramaDetail = {
  id: string;
  title: string;
  description?: string;
  posterUrl: string;
  bannerUrl?: string;
  genres?: string[];
  actors?: ActorItem[];
  episodes?: ApiEpisode[];
  seasons?: ApiSeason[];
  imdbRating?: number;
  year?: number;
  country?: string;
  duration?: number;
  status?: string;
  ageRating?: string;
  director?: string;
  network?: string;
  language?: string;
  totalEpisodes?: number;
  freeEpisodesCount?: number;
  accessType?: string;
  viewsCount?: number;
  likesCount?: number;
  bookmarksCount?: number;
  tags?: string[];
  screenshots?: string[];
  trailer?: string;
};

export type ApiSeason = {
  seasonNumber: number;
  poster?: string;
  episodeCount?: number;
};

export type ApiEpisode = {
  id: string;
  episodeNumber: number;
  title: string;
  preview?: string;
  duration?: number;
  releaseDate?: string;
  videoUrl?: string;
  isFree?: boolean;
  isUnlocked?: boolean;
};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  needsOnboarding: boolean;
};

export type UserProfile = {
  id: string;
  publicId?: string;
  name?: string;
  phone?: string;
  birthDate?: string;
  avatarUrl?: string;
  tgChatId?: string;
  plan?: { id: string; code: string; title: string };
  coin?: number;
  genres?: string[];
  favoriteActors?: string[];
};

export type Plan = {
  id: string;
  code: string;
  title: string;
  price: number;
  durationDays: number;
  benefits?: string[];
  capabilities?: string[];
};

export type PremiumFeature = {
  title: string;
  description: string;
  icon?: string;
};

export type SubscriptionInfo = {
  plan?: { id: string; code: string; title: string };
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
};

export type CoinInfo = {
  balance: number;
  dailyReward?: { claimed: boolean; nextClaimAt?: string };
};

export type CoinTransaction = {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
};

export type CoinPackage = {
  id: string;
  amount: number;
  price: number;
  bonus?: number;
  label?: string;
};

export type ScheduleItem = {
  id: string;
  category: "drama" | "discount" | "announcement";
  title: string;
  description?: string;
  scheduledAt: string;
  drama?: DramaItem;
  isReminded?: boolean;
  remindersCount?: number;
};

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
};

export type HistoryItem = {
  dramaId: string;
  drama?: DramaItem;
  episodeNumber: number;
  positionSec: number;
  completed: boolean;
  updatedAt: string;
};

export type FavoriteActor = {
  id: string;
  name: string;
  actorImg: string;
  savedAt: string;
};

export type ActorItem = {
  id: string;
  name: string;
  actorImg?: string;
  dramaCount?: number;
};

export type ActorDetail = {
  id: string;
  name: string;
  bio?: string;
  actorImg?: string;
  dramas?: DramaItem[];
};

export type Genre = {
  id: string;
  slug: string;
  title: string;
};

export type CategoryGroup = {
  id: string;
  title: string;
  items?: { id: string; title: string; slug: string }[];
};

export type TopSearch = {
  rank: number;
  queryNormalized: string;
  searchCount: number;
};

export type Tip = {
  id: string;
  title: string;
  content: string;
};

export type DownloadItem = {
  id: string;
  episodeId: string;
  drama?: DramaItem;
  quality: string;
  downloadedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
