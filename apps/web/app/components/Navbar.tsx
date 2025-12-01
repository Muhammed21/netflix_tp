"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/catalog", label: "Catalogue" },
  { href: "/profiles", label: "Profils" },
];

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <div className="logo-pill">
            <span>N</span>
          </div>
          <div className="nav-title">
            <span className="nav-title-main">Netflix Data Explorer</span>
            <span className="nav-title-sub">Projet chaîne de traitement de la donnée</span>
          </div>
        </div>

        <nav className="nav-links" aria-label="Navigation principale">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "nav-link--active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
