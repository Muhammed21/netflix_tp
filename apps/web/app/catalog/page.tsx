"use client";

import { useState } from "react";
import { fetchMovieWatch, MediaType, CleanedData } from "../lib/api";

interface AggregatedProfile {
  profile_name: string;
  watchCount: number;
  lastWatch: string | null;
}

export default function CatalogPage() {
  const [movieName, setMovieName] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [year, setYear] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CleanedData[]>([]);
  const [totalWatchTime, setTotalWatchTime] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieName.trim()) {
      setError("Merci de saisir un titre.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetchMovieWatch({
        movieName: movieName.trim(),
        mediaType: mediaType === "all" ? undefined : mediaType,
        year: year === "" ? undefined : year,
        page: 1,
        limit: 200,
      });
      setResults(res.data);
      setTotalWatchTime(res.totalWatchTime);
    } catch (err: any) {
      console.error(err);
      setError("Impossible de charger les données pour ce titre.");
      setResults([]);
      setTotalWatchTime(null);
    } finally {
      setLoading(false);
    }
  };

  const aggregatedProfiles: AggregatedProfile[] = (() => {
    const map = new Map<string, AggregatedProfile>();
    for (const item of results) {
      const key = item.profile_name || "Profil inconnu";
      const existing = map.get(key) || {
        profile_name: key,
        watchCount: 0,
        lastWatch: null as string | null,
      };
      existing.watchCount += 1;
      const currentStart = new Date(item.start_time).toISOString();
      if (!existing.lastWatch || currentStart > existing.lastWatch) {
        existing.lastWatch = currentStart;
      }
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.watchCount - a.watchCount);
  })();

  return (
    <div className="surface">
      <div className="surface-header">
        <h1 className="page-title">Recherche de contenu</h1>
        <p className="page-subtitle">
          Utilise l&apos;endpoint <code>/movie</code> pour interroger l&apos;historique
          d&apos;un film ou d&apos;une série : profils qui l&apos;ont regardé,
          nombre de visionnages et temps total.
        </p>
      </div>

      <div className="surface-body">
        <form onSubmit={handleSubmit} className="grid grid-3" style={{ rowGap: "1rem" }}>
          <div>
            <label className="section-title" htmlFor="movieName">
              Titre
            </label>
            <p className="section-subtitle">Doit correspondre au champ title en base.</p>
            <input
              id="movieName"
              className="input"
              placeholder="Ex : Stranger Things"
              value={movieName}
              onChange={(e) => setMovieName(e.target.value)}
            />
          </div>

          <div>
            <div className="section-title">Type</div>
            <p className="section-subtitle">Filtrer selon le media_type TMDB.</p>
            <div style={{ marginTop: "0.35rem" }}>
              <select
                className="select"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as MediaType | "all")}
              >
                <option value="all">Tous</option>
                <option value="movie">Films</option>
                <option value="tv">Séries</option>
              </select>
            </div>
          </div>

          <div>
            <label className="section-title" htmlFor="year">
              Année
            </label>
            <p className="section-subtitle">
              Filtre par année de visionnage (basée sur start_time).
            </p>
            <input
              id="year"
              className="input"
              type="number"
              min={2000}
              max={2100}
              placeholder="Ex : 2023"
              value={year === "" ? "" : String(year)}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) {
                  setYear("");
                } else {
                  const num = Number(v);
                  if (!Number.isNaN(num)) setYear(num);
                }
              }}
            />
          </div>

          <div style={{ gridColumn: "1 / -1", marginTop: "0.4rem" }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Chargement..." : "Lancer la recherche"}
            </button>
            {error && (
              <span style={{ marginLeft: "0.75rem" }} className="text-muted">
                {error}
              </span>
            )}
          </div>
        </form>

        {totalWatchTime && (
          <div className="stat-grid m-t-2">
            <div className="stat-card">
              <div className="stat-label">Résultats</div>
              <div className="stat-value">{results.length}</div>
              <div className="stat-hint">Lignes issues de la table cleaned_data.</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Profils distincts</div>
              <div className="stat-value">{aggregatedProfiles.length}</div>
              <div className="stat-hint">Profils ayant visionné ce contenu.</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Temps total</div>
              <div className="stat-value">{totalWatchTime}</div>
              <div className="stat-hint">Calculé côté API à partir de latest_bookmark.</div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="m-t-3">
              <div className="section-title">Profils ayant regardé ce contenu</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Profil</th>
                    <th>Visionnages</th>
                    <th>Dernier visionnage</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedProfiles.map((p) => (
                    <tr key={p.profile_name}>
                      <td>{p.profile_name}</td>
                      <td>{p.watchCount}</td>
                      <td>{p.lastWatch ? new Date(p.lastWatch).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="m-t-3">
              <div className="section-title">Détail des visionnages (brut)</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Profil</th>
                    <th>Pays</th>
                    <th>Device</th>
                    <th>Durée (latest_bookmark)</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, idx) => (
                    <tr key={row.id ?? idx}>
                      <td>{new Date(row.start_time).toLocaleString()}</td>
                      <td>{row.profile_name ?? "—"}</td>
                      <td>{row.country ?? "—"}</td>
                      <td>{row.device_type ?? "—"}</td>
                      <td>{row.latest_bookmark ?? "—"}</td>
                      <td>{row.metadata?.media_type ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && !error && movieName && results.length === 0 && (
          <p className="page-subtitle m-t-2">
            Aucun résultat pour ce titre avec ces filtres.
          </p>
        )}
      </div>
    </div>
  );
}
