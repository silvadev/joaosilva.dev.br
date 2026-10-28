import { useEffect, useMemo, useRef, useState } from "react";
import type { Lang } from "../../i18n/ui";
import { ArticleList } from "./ArticleList";

type SearchEntry = {
  lang: Lang;
  slug: string;
  href: string;
  title: string;
  description: string;
  date: string;
  body: string;
};

type SearchPanelProps = {
  lang: Lang;
  initialQuery: string;
  placeholder: string;
  emptyLabel: string;
  loadingLabel: string;
  errorLabel: string;
};

function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function matchQuery(entry: SearchEntry, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return false;
  const haystack = `${entry.title} ${entry.description} ${entry.body}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function SearchPanel({
  lang,
  initialQuery,
  placeholder,
  emptyLabel,
  loadingLabel,
  errorLabel,
}: SearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("q");
    if (!fromUrl) return;
    setQuery(fromUrl);
    setActiveQuery(fromUrl);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/search-index.json")
      .then((response) => {
        if (!response.ok) throw new Error("search index");
        return response.json() as Promise<SearchEntry[]>;
      })
      .then((data) => {
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const results = useMemo(() => {
    if (!index || activeQuery.trim() === "") return [];
    return index.filter(
      (entry) => entry.lang === lang && matchQuery(entry, activeQuery),
    );
  }, [activeQuery, index, lang]);

  function onChange(value: string) {
    setQuery(value);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActiveQuery(value), 200);
  }

  const showEmpty =
    !failed && index !== null && activeQuery.trim() !== "" && results.length === 0;
  const showLoading = !failed && index === null && activeQuery.trim() !== "";

  return (
    <div>
      <label className="sr-only" htmlFor="search-input">
        {placeholder}
      </label>
      <input
        id="search-input"
        type="text"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus
        onChange={(event) => onChange(event.target.value)}
        className="w-full border-0 border-b border-secondary/40 bg-transparent py-3 font-sans text-2xl text-primary outline-none placeholder:text-secondary focus:border-primary"
      />
      {failed ? <p>{errorLabel}</p> : null}
      {showLoading ? <p>{loadingLabel}</p> : null}
      {showEmpty ? <p>{emptyLabel}</p> : null}
      {results.length > 0 ? (
        <ArticleList
          layoutId="search-results"
          entries={results.map((entry) => ({
            href: entry.href,
            title: entry.title,
            description: entry.description,
            dateTime: entry.date,
            dateLabel: formatDate(entry.date, lang),
          }))}
        />
      ) : null}
    </div>
  );
}
