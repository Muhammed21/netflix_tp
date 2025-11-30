import { TmdbSearchResult } from "../result/tmdb.result";

export interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}
