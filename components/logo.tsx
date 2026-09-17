import Link from "next/link";

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className={`brand-logo${inverse ? " brand-logo--inverse" : ""}`} aria-label="Hibiscus Group home">
      <span className="brand-placeholder">LOGO</span>
    </Link>
  );
}
