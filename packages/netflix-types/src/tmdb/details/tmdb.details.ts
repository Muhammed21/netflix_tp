export interface TmdbMovieDetails {
  id: number;
  title: string;
  overview: string;
  runtime: number | null;
  release_date: string;
  genres: { id: number; name: string }[];
  poster_path: string | null;
  credits?: {
    cast: { id: number; name: string; character: string }[];
    crew: { id: number; name: string; job: string }[];
  };
}
