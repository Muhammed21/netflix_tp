// apps/web/app/lib/api.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type MediaType = "movie" | "tv";

export interface TmdbSearchResult {
  id: number;
  adult: boolean;
  name: string;
  original_name: string;
  overview: string;
  media_type: MediaType | "person";
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string | null;
  genre_ids: number[];
  popularity: number;
  vote_count: number;
  vote_average: number;
  first_air_date: string | null;
  origin_country: string[];
}

export interface CleanedData {
  id?: string;
  start_time: string;
  profile_name: string | null;
  country: string | null;
  bookmark: string | null;
  latest_bookmark: string | null;
  supplemental_video_type: string | null;
  attributes: string | null;
  device_type: string | null;
  title: string;
  metadata: TmdbSearchResult | null;
  created_at?: string;
}

export interface PagedResult<T> {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  totalWatchTime: string;
  data: T[];
}

async function apiFetch<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<T> {
  const url = new URL(path, API_BASE_URL);

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const finalUrl = url.toString();
  console.log("[API] calling", finalUrl);

  const res = await fetch(finalUrl, {
    method: "GET",
    mode: "cors",
  });

  if (!res.ok) {
    throw new Error(`API error (${res.status}) for ${url.pathname}${url.search}`);
  }

  return res.json();
}

/**
 * GET /user/watched
 */
export function fetchProfileWatched(params: {
  profileName: string;
  page?: number;
  limit?: number;
  mediaType?: MediaType;
  year?: number;
}): Promise<PagedResult<CleanedData>> {
  return apiFetch<PagedResult<CleanedData>>("/user/watched", {
    profileName: params.profileName,
    page: params.page ?? 1,
    limit: params.limit ?? 50,
    mediaType: params.mediaType,
    year: params.year,
  });
}

/**
 * GET /movie
 */
export function fetchMovieWatch(params: {
  movieName: string;
  page?: number;
  limit?: number;
  mediaType?: MediaType;
  year?: number;
}): Promise<PagedResult<CleanedData>> {
  return apiFetch<PagedResult<CleanedData>>("/movie", {
    movieName: params.movieName,
    page: params.page ?? 1,
    limit: params.limit ?? 200,
    mediaType: params.mediaType,
    year: params.year,
  });
}
