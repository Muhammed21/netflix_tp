import { TmdbSearchResult } from "../../tmdb/result/tmdb.result";

export interface CleanAndProcessDataInterface {
  startTime: Date;
  profileName: string;
  country: string | null;
  bookmark: string | null;
  latestBookmark: string | null;
  supplementalVideoType: string | null;
  attributes: string | null;
  deviceType: string | null;
  title: string;
  metadata: TmdbSearchResult | null;
}
