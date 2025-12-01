"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="surface">
      <div className="surface-header">
        <h1 className="page-title">Netflix Data Explorer</h1>
        <p className="page-subtitle">
          Interface de visualisation de ton historique Netflix : recherche de contenus,
          statistiques par profil et analyse de ton activité de visionnage.
        </p>
      </div>

      <div className="surface-body">
        <section className="hero">
          <div>
            <div className="hero-kpi-row">
              <div className="hero-kpi">PostgreSQL / Supabase</div>
              <div className="hero-kpi">API NestJS</div>
              <div className="hero-kpi">Next.js Front</div>
            </div>

            <div className="hero-cta">
              <Link href="/catalog" className="btn btn-primary">
                Chercher un film / série
              </Link>
              <Link href="/profiles" className="btn btn-secondary">
                Explorer un profil
              </Link>
            </div>

            <div className="stat-grid m-t-2">
              <div className="stat-card">
                <div className="stat-label">Catalogue</div>
                <div className="stat-value">/movie</div>
                <div className="stat-hint">
                  Endpoint qui renvoie tous les visionnages pour un contenu donné.
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Profil</div>
                <div className="stat-value">/user/watched</div>
                <div className="stat-hint">
                  Endpoint qui renvoie tous les visionnages pour un profil donné.
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Filtres</div>
                <div className="stat-value">type / année</div>
                <div className="stat-hint">
                  Filtrage possible par media_type TMDB et année de visionnage.
                </div>
              </div>
            </div>
          </div>

          <div className="hero-visual surface-soft">
            <div className="hero-badge">Aperçu</div>
            <p className="page-subtitle" style={{ marginTop: "1.4rem" }}>
              Exemple de répartition de ton catalogue par type de contenu.
            </p>
            <div className="chart">
              <div className="chart-row">
                <div className="chart-label">Films</div>
                <div className="chart-track">
                  <div className="chart-fill" style={{ width: "70%" }} />
                </div>
              </div>
              <div className="chart-row">
                <div className="chart-label">Séries</div>
                <div className="chart-track">
                  <div className="chart-fill" style={{ width: "55%" }} />
                </div>
              </div>
              <div className="chart-row">
                <div className="chart-label">Docs</div>
                <div className="chart-track">
                  <div className="chart-fill" style={{ width: "30%" }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
