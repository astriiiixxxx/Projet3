import { Link } from "react-router-dom";

function CloudUploadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 0 0 4 11.5 4.5 4.5 0 0 0 6.5 19h11Z" />
      <path d="M12 12v8" />
      <path d="M9 15l3-3 3 3" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="ds-feature">
      <div className="ds-hero">
        <h1 className="ds-hero__title">Tu veux partager un fichier ?</h1>

        <Link
          to="/upload"
          className="ds-hero__cta"
          aria-label="Téléverser un fichier"
        >
          <span className="ds-hero__cta-icon" aria-hidden="true">
            <CloudUploadIcon />
          </span>
        </Link>
      </div>
    </div>
  );
}
