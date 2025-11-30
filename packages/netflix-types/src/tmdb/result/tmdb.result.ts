export interface TmdbSearchResult {
  id: number;
  adult: boolean;
  name: string;
  original_name: string;
  overview: string;
  media_type: "tv" | "movie" | "person";
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
