import { useEffect, useMemo, useState } from "react";
import { ui, type Lang } from "../../i18n/ui";

export type IdeaKind = "essay" | "note";

export type Idea = {
  href: string;
  title: string;
  description: string;
  kind: IdeaKind;
  tags: string[];
  text: string;
  dateLabel: string;
  dateTime: string;
  year: number;
  featured: boolean;
  kicker: string;
};

type KindFilter = "all" | IdeaKind;

type Filters = {
  query: string;
  kind: KindFilter;
  tag: string | null;
};

const accents = [
  "border-yellow",
  "border-cyan",
  "border-pink",
  "border-purple",
  "border-orange",
  "border-green",
] as const;

function readFilters(): Filters {
  const params = new URLSearchParams(window.location.search);
  const kind = params.get("kind");
  return {
    query: params.get("q") ?? "",
    kind: kind === "essay" || kind === "note" ? kind : "all",
    tag: params.get("tag"),
  };
}

function writeFilters(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.kind !== "all") params.set("kind", filters.kind);
  if (filters.tag) params.set("tag", filters.tag);
  const search = params.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
  window.history.replaceState(null, "", url);
}

function fill(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, value),
    template,
  );
}

function matches(idea: Idea, filters: Filters) {
  if (filters.kind !== "all" && idea.kind !== filters.kind) return false;
  if (filters.tag) {
    const topic = filters.tag.toLowerCase();
    if (!idea.tags.some((tag) => tag.toLowerCase() === topic)) return false;
  }
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = `${idea.title} ${idea.description} ${idea.tags.join(" ")} ${idea.text}`.toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

export function IdeasBrowser({ lang, ideas }: { lang: Lang; ideas: Idea[] }) {
  const copy = ui[lang];
  const [filters, setFilters] = useState<Filters>({ query: "", kind: "all", tag: null });

  useEffect(() => {
    setFilters(readFilters());
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (document.querySelector("[role='dialog']")) return;
      event.preventDefault();
      document.getElementById("ideas-search")?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function apply(next: Filters) {
    setFilters(next);
    writeFilters(next);
  }

  const visible = useMemo(
    () => ideas.filter((idea) => matches(idea, filters)),
    [filters, ideas],
  );

  const featured = useMemo(
    () => ideas.filter((idea) => idea.featured),
    [ideas],
  );

  const showFeatured =
    featured.length > 0 &&
    filters.kind !== "note" &&
    filters.query.trim() === "" &&
    !filters.tag;

  const groups = useMemo(() => {
    const buckets: { year: number; items: Idea[] }[] = [];
    for (const idea of visible) {
      const last = buckets[buckets.length - 1];
      if (!last || last.year !== idea.year) buckets.push({ year: idea.year, items: [idea] });
      else last.items.push(idea);
    }
    return buckets;
  }, [visible]);

  const filtersOptions: { id: KindFilter; label: string }[] = [
    { id: "all", label: copy["articles.filter.all"] },
    { id: "essay", label: copy["articles.filter.essay"] },
    { id: "note", label: copy["articles.filter.note"] },
  ];

  const range = fill(copy["articles.range"], {
    shown: String(visible.length),
    total: String(ideas.length),
  });

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor="ideas-search" className="text-sm text-secondary">
          {copy["articles.search"]}
        </label>
        <span className="hidden text-sm text-secondary sm:inline">
          {copy["articles.searchPress"]} <kbd>/</kbd> {copy["articles.searchAfter"]}
        </span>
      </div>
      <input
        id="ideas-search"
        type="search"
        value={filters.query}
        placeholder={copy["articles.searchPlaceholder"]}
        autoComplete="off"
        onChange={(event) => apply({ ...filters, query: event.target.value })}
        className="w-full rounded-md border border-hover bg-transparent px-3 py-3 text-base text-primary outline-none placeholder:text-secondary focus:border-secondary"
      />

      <div
        role="radiogroup"
        aria-label={copy["articles.filters"]}
        className="mt-4 flex gap-5 border-b border-hover"
      >
        {filtersOptions.map((option) => {
          const active = filters.kind === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => apply({ ...filters, kind: option.id })}
              className={`relative cursor-pointer border-0 bg-transparent px-0 py-2 text-sm hover:text-primary hover:opacity-100 ${active ? "text-primary" : "text-secondary"}`}
            >
              {option.label}
              {active ? (
                <span className="absolute right-0 -bottom-px left-0 h-px bg-primary" />
              ) : null}
            </button>
          );
        })}
      </div>

      {filters.tag ? (
        <p className="mt-4 mb-0 text-sm">
          {copy["articles.topic"]}:{" "}
          <button
            type="button"
            onClick={() => apply({ ...filters, tag: null })}
            className="cursor-pointer border-0 bg-transparent p-0 text-primary"
          >
            #{filters.tag}
            <span className="sr-only"> {copy["articles.clearTopic"]}</span>
            <span aria-hidden="true"> ×</span>
          </button>
        </p>
      ) : null}

      {showFeatured ? (
        <section className="mt-12" aria-labelledby="featured-ideas">
          <p className="m-0 text-xs font-medium tracking-[0.14em] text-yellow uppercase">
            {copy["articles.start"]}
          </p>
          <div className="mt-1 flex items-baseline justify-between gap-4">
            <h2 id="featured-ideas" className="m-0">
              {copy["articles.featured"]}
            </h2>
            <button
              type="button"
              onClick={() => apply({ query: "", kind: "essay", tag: null })}
              className="cursor-pointer border-0 bg-transparent p-0 text-sm text-primary"
            >
              {copy["articles.allEssays"]} →
            </button>
          </div>
          <div className="mt-6 flex snap-x gap-8 overflow-x-auto pb-2">
            {featured.map((idea, index) => (
              <a
                key={idea.href}
                href={idea.href}
                className={`flex min-h-56 w-[min(100%,20rem)] shrink-0 snap-start flex-col border-0 border-t-2 p-5 no-underline hover:bg-hover hover:opacity-100 ${accents[index % accents.length]}`}
              >
                <span className="flex items-baseline justify-between gap-4 text-xs text-secondary">
                  <span>{idea.kicker}</span>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </span>
                <h3 className="mt-4 mb-0 text-xl">{idea.title}</h3>
                <p className="m-0 mt-3 line-clamp-3 flex-1 text-sm leading-6">
                  {idea.description}
                </p>
                <p className="m-0 mt-6 text-sm font-medium text-primary">
                  {copy["articles.readEssay"]} →
                </p>
              </a>
            ))}
          </div>
          {featured.length > 2 ? (
            <p className="m-0 text-right text-sm">{copy["articles.scroll"]} →</p>
          ) : null}
        </section>
      ) : null}

      <section className="mt-12" aria-labelledby="all-ideas">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="all-ideas" className="m-0">
            {copy["articles.all"]}
          </h2>
          <p className="m-0 text-sm" role="status">
            {range}
          </p>
        </div>
        {ideas.length === 0 ? <p>{copy["articles.empty"]}</p> : null}
        {ideas.length > 0 && visible.length === 0 ? <p>{copy["articles.noMatch"]}</p> : null}
        {groups.map((group) => (
          <div key={group.year}>
            <h3 className="mt-8 mb-0 border-b border-hover pb-2 text-sm font-medium text-secondary">
              {group.year}
            </h3>
            <ul className="m-0 list-none p-0">
              {group.items.map((idea) => (
                <li key={idea.href} className="border-b border-hover">
                  <a
                    href={idea.href}
                    className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-baseline gap-x-4 border-0 py-3 no-underline hover:opacity-100"
                  >
                    <time dateTime={idea.dateTime} className="text-sm text-secondary">
                      {idea.dateLabel}
                    </time>
                    <span className="font-medium text-primary">{idea.title}</span>
                    <span className="text-right text-sm text-secondary">
                      {idea.kind === "essay"
                        ? copy["articles.kind.essay"]
                        : copy["articles.kind.note"]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
