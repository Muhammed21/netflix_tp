"use client";

import { useState, useMemo } from "react";
import { fetchProfileWatched, MediaType, CleanedData } from "../lib/api";

interface ActivityPoint {
  label: string;
  value: number;
}

interface TopTitle {
  title: string;
  count: number;
  media_type: MediaType | "unknown";
}

function buildActivityByMonth(data: CleanedData[]): ActivityPoint[] {
  const map = new Map<string, number>();
  for (const row of data) {
    const d = new Date(row.start_time);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildActivityByHour(data: CleanedData[]): ActivityPoint[] {
  const counts = new Array(24).fill(0);
  for (const row of data) {
    const d = new Date(row.start_time);
    const h = d.getHours();
    counts[h] += 1;
  }
  return counts.map((value, hour) => ({
    label: `${String(hour).padStart(2, "0")}h`,
    value,
  }));
}

function buildTopTitles(data: CleanedData[]): TopTitle[] {
  const map = new Map<string, TopTitle>();
  for (const row of data) {
    const title = row.title;
    const media_type = row.metadata?.media_type ?? "unknown";
    const existing = map.get(title) ?? { title, count: 0, media_type };
    existing.count += 1;
    map.set(title, existing);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export default function ProfilesPage() {
  const [profileName, setProfileName] = useState("");
  const [mediaType, setMediaType] = useState<MediaType | "all">("all");
  const [year, setYear] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<CleanedData[]>([]);
  const [totalWatchTime, setTotalWatchTime] = useState<string | null>(null);

  const hasData = rows.length > 0;

  const topTitles = useMemo(() => buildTopTitles(rows), [rows]);
  const topMovies = topTitles.filter((t) => t.media_type === "movie").slice(0, 5);
  const topSeries = topTitles.filter((t) => t.media_type === "tv").slice(0, 5);

  const activityByMonth = useMemo(() => buildActivityByMonth(rows), [rows]);
  const activityByHour = useMemo(() => buildActivityByHour(rows), [rows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setError("Merci de saisir le nom du profil Netflix.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetchProfileWatched({
        profileName: profileName.trim(),
        mediaType: mediaType === "all" ? undefined : mediaType,
        year: year === "" ? undefined : year,
        page: 1,
        limit: 500,
      });
      setRows(res.data);
      setTotalWatchTime(res.totalWatchTime);
    } catch (err: any) {
      console.error(err);
      setError("Impossible de charger les données pour ce profil.");
      setRows([]);
      setTotalWatchTime(null);
    } finally {
      setLoading(false);
    }
  };

  const maxMonth = activityByMonth.reduce((m, p) => (p.value > m ? p.value : m), 0) || 1;
  const maxHour = activityByHour.reduce((m, p) => (p.value > m ? p.value : m), 0) || 1;

  return (
    <div className="surface">
      <div className="surface-header">
        <h1 className="page-title">Statistiques par profil</h1>
        <p className="page-subtitle">
          Utilise l&apos;endpoint <code>/user/watched</code> pour analyser l&apos;activité
          d&apos;un profil : temps total de visionnage, top contenus, activité par mois et
          heures de la journée.
        </p>
      </div>

      <div className="surface-body">
        <form onSubmit={handleSubmit} className="grid grid-3" style={{ rowGap: "1rem" }}>
          <div>
            <label className="section-title" htmlFor="profileName">
              Nom du profil
            </label>
            <p className="section-subtitle">
              Doit correspondre à la valeur de <code>profile_name</code>.
            </p>
            <input
              id="profileName"
              className="input"
              placeholder="Ex : Nathan"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          <div>
            <div className="section-title">Type</div>
            <p className="section-subtitle">Filtrer par media_type TMDB.</p>
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
              {loading ? "Chargement..." : "Charger les stats"}
            </button>
            {error && (
              <span style={{ marginLeft: "0.75rem" }} className="text-muted">
                {error}
              </span>
            )}
          </div>
        </form>

        {hasData && totalWatchTime && (
          <section className="stat-grid m-t-2">
            <div className="stat-card">
              <div className="stat-label">Visionnages</div>
              <div className="stat-value">{rows.length}</div>
              <div className="stat-hint">
                Nombre total de lignes cleaned_data pour ce profil.
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Contenus distincts</div>
              <div className="stat-value">
                {new Set(rows.map((r) => r.title)).size}
              </div>
              <div className="stat-hint">Basé sur le champ title.</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Temps total</div>
              <div className="stat-value">{totalWatchTime}</div>
              <div className="stat-hint">
                Calculé côté API à partir de latest_bookmark, puis formaté.
              </div>
            </div>
          </section>
        )}

        {hasData && (
          <>
            <section className="grid grid-2 m-t-3">
              <div className="surface-soft">
                <div className="surface-header">
                  <div className="section-title">Top 5 films</div>
                  <p className="section-subtitle">
                    Classement basé sur le nombre de visionnages (lignes cleaned_data).
                  </p>
                </div>
                <div className="surface-body">
                  <ul>
                    {topMovies.slice(0, 5).map((movie) => (
                      <li key={movie.title} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "0.25rem 0" }}>
                        <span>{movie.title}</span>
                        <span className="text-muted">{movie.count}×</span>
                      </li>
                    ))}
                    {topMovies.length === 0 && (
                      <li className="text-muted">
                        Aucun film ne ressort pour ces filtres.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="surface-soft">
                <div className="surface-header">
                  <div className="section-title">Top 5 séries</div>
                  <p className="section-subtitle">
                    Série = media_type &quot;tv&quot; dans les métadonnées TMDB.
                  </p>
                </div>
                <div className="surface-body">
                  <ul>
                    {topSeries.slice(0, 5).map((serie) => (
                      <li key={serie.title} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "0.25rem 0" }}>
                        <span>{serie.title}</span>
                        <span className="text-muted">{serie.count}×</span>
                      </li>
                    ))}
                    {topSeries.length === 0 && (
                      <li className="text-muted">
                        Aucune série ne ressort pour ces filtres.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </section>

            <section className="grid grid-2 m-t-3">
              <div className="surface-soft">
                <div className="surface-header">
                  <div className="section-title">Activité par mois</div>
                  <p className="section-subtitle">Nombre de visionnages par mois.</p>
                </div>
                <div className="surface-body">
                  <div className="chart">
                    {activityByMonth.map((point) => (
                      <div className="chart-row" key={point.label}>
                        <div className="chart-label">{point.label}</div>
                        <div className="chart-track">
                          <div
                            className="chart-fill"
                            style={{
                              width: `${(point.value / maxMonth) * 100 || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="surface-soft">
                <div className="surface-header">
                  <div className="section-title">Heures de visionnage</div>
                  <p className="section-subtitle">Répartition des visionnages sur 24h.</p>
                </div>
                <div className="surface-body">
                  <div className="chart">
                    {activityByHour.map((point) => (
                      <div className="chart-row" key={point.label}>
                        <div className="chart-label">{point.label}</div>
                        <div className="chart-track">
                          <div
                            className="chart-fill"
                            style={{
                              width: `${(point.value / maxHour) * 100 || 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="m-t-3">
              <div className="section-title">Données brutes</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Titre</th>
                    <th>Pays</th>
                    <th>Device</th>
                    <th>Durée (latest_bookmark)</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id ?? idx}>
                      <td>{new Date(row.start_time).toLocaleString()}</td>
                      <td>{row.title}</td>
                      <td>{row.country ?? "—"}</td>
                      <td>{row.device_type ?? "—"}</td>
                      <td>{row.latest_bookmark ?? "—"}</td>
                      <td>{row.metadata?.media_type ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {!loading && !error && profileName && !hasData && (
          <p className="page-subtitle m-t-2">
            Aucun résultat pour ce profil avec ces filtres.
          </p>
        )}
      </div>
    </div>
  );
}
