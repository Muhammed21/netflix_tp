import { TmdbSearchResult } from "../../tmdb/result/tmdb.result";

export interface CleanedDataTable {
  id?: string;

  start_time: string | Date;
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
