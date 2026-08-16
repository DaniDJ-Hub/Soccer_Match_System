import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mb-4 flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}
