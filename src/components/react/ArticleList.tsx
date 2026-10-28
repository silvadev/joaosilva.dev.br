import { HoverAnimation } from "./HoverAnimation";

export type ArticleEntry = {
  href: string;
  title: string;
  dateLabel: string;
  dateTime: string;
  description?: string;
};

export function ArticleList({
  entries,
  layoutId = "article-list",
}: {
  entries: ArticleEntry[];
  layoutId?: string;
}) {
  return (
    <ul className="my-2.5 list-none p-0">
      {entries.map((entry) => (
        <li key={entry.href} className="relative border-b border-hover last:border-0">
          <a href={entry.href} className="border-0 hover:opacity-100">
            <HoverAnimation
              id={entry.href}
              layoutId={layoutId}
              className="flex w-full cursor-pointer flex-col justify-between py-5 no-underline md:flex-row md:items-baseline"
              backgroundClassName="-top-0.25 -right-5 -bottom-0.25 -left-5"
            >
              <span className="block max-w-125 text-left">
                <span className="block text-lg leading-10 font-bold text-secondary">
                  {entry.title}
                </span>
                {entry.description ? (
                  <span className="mt-1 block text-sm leading-6 font-normal text-secondary">
                    {entry.description}
                  </span>
                ) : null}
              </span>
              <time
                dateTime={entry.dateTime}
                className="block shrink-0 text-left text-sm font-medium text-secondary md:text-right"
              >
                {entry.dateLabel}
              </time>
            </HoverAnimation>
          </a>
        </li>
      ))}
    </ul>
  );
}
