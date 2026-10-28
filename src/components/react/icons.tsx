import type { ReactNode } from "react";

type GlyphProps = {
  className?: string;
  children: ReactNode;
};

function Glyph({ className = "size-6", children }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export type IconName =
  | "command"
  | "home"
  | "about"
  | "articles"
  | "search"
  | "link"
  | "language"
  | "x"
  | "rss";

function CommandIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </Glyph>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </Glyph>
  );
}

function AboutIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 19.5c.8-3 3.2-4.5 6.5-4.5s5.7 1.5 6.5 4.5" />
    </Glyph>
  );
}

function ArticlesIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M7 3.5h7l4 4V20.5H7z" />
      <path d="M14 3.5V8h4.5" />
      <path d="M9.5 12.5h5" />
      <path d="M9.5 16h5" />
    </Glyph>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 3.5 3.5" />
    </Glyph>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M10 13.5a4 4 0 0 0 6 0l2.2-2.2a4 4 0 0 0-5.6-5.6L11.2 7" />
      <path d="M14 10.5a4 4 0 0 0-6 0L5.8 12.7a4 4 0 0 0 5.6 5.6l1.4-1.3" />
    </Glyph>
  );
}

function LanguageIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.2 2.4 3.3 5.1 3.3 8S14.2 17.6 12 20c-2.2-2.4-3.3-5.1-3.3-8S9.8 6.4 12 4z" />
    </Glyph>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </Glyph>
  );
}

function RssIcon({ className }: { className?: string }) {
  return (
    <Glyph className={className}>
      <path d="M5 5.5a13.5 13.5 0 0 1 13.5 13.5" />
      <path d="M5 11.5a7.5 7.5 0 0 1 7.5 7.5" />
      <circle cx="6" cy="18" r="1.2" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

const ICONS = {
  command: CommandIcon,
  home: HomeIcon,
  about: AboutIcon,
  articles: ArticlesIcon,
  search: SearchIcon,
  link: LinkIcon,
  language: LanguageIcon,
  x: XIcon,
  rss: RssIcon,
} as const;

export function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const Component = ICONS[name];
  return <Component className={className} />;
}
