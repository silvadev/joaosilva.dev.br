import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";

export type TocHeading = {
  depth: number;
  slug: string;
  text: string;
};

const readingOffset = 112;

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");
  const key = ids.join("\0");

  useEffect(() => {
    const nodes = key
      .split("\0")
      .filter(Boolean)
      .flatMap((id) => {
        const node = document.getElementById(id);
        return node ? [node] : [];
      });
    if (nodes.length === 0) return;

    let frame = 0;
    const update = () => {
      const line = window.scrollY + readingOffset;
      let current = nodes[0]?.id ?? "";
      for (const node of nodes) {
        if (node.getBoundingClientRect().top + window.scrollY <= line) {
          current = node.id;
        }
      }
      setActiveId((previous) => (previous === current ? previous : current));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return activeId;
}

function TocLinks({
  headings,
  activeId,
  onSelect,
}: {
  headings: TocHeading[];
  activeId: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <ol className="m-0 list-none p-0">
      {headings.map((heading) => {
        const active = heading.slug === activeId;
        return (
          <li key={heading.slug}>
            <a
              href={`#${heading.slug}`}
              data-slug={heading.slug}
              aria-current={active ? "location" : undefined}
              onClick={(event) => {
                const target = document.getElementById(heading.slug);
                if (!target) return;
                event.preventDefault();
                onSelect(heading.slug);
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                history.pushState(null, "", `#${heading.slug}`);
              }}
              className={cn(
                "block border-b-0 border-l py-1.5 text-[0.8125rem] leading-5 no-underline hover:text-primary hover:opacity-100",
                heading.depth > 2 ? "pl-6" : "pl-3",
                active
                  ? "border-primary font-medium text-primary"
                  : "border-hover text-secondary",
              )}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

export function TableOfContents({
  headings,
  label,
  placement,
}: {
  headings: TocHeading[];
  label: string;
  placement: "inline" | "sidebar";
}) {
  const activeId = useActiveHeading(headings.map((heading) => heading.slug));

  function reveal(slug: string) {
    const link = document.querySelector<HTMLAnchorElement>(
      `[data-toc="${placement}"] [data-slug="${CSS.escape(slug)}"]`,
    );
    const viewport = link?.closest<HTMLElement>("[data-radix-scroll-area-viewport]");
    if (!link || !viewport) return;
    const linkRect = link.getBoundingClientRect();
    const viewRect = viewport.getBoundingClientRect();
    if (linkRect.top < viewRect.top || linkRect.bottom > viewRect.bottom) {
      viewport.scrollTop += linkRect.top - viewRect.top - viewRect.height / 3;
    }
  }

  function onSelect(slug: string) {
    reveal(slug);
  }

  useEffect(() => {
    reveal(activeId);
  }, [activeId, placement]);

  if (headings.length === 0) return null;

  if (placement === "inline") {
    return (
      <Collapsible className="mb-2 border-b border-hover lg:hidden">
        <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between border-0 bg-transparent py-3 text-left text-sm font-medium text-primary">
          {label}
          <span className="font-mono text-secondary group-data-[state=open]:hidden">+</span>
          <span className="hidden font-mono text-secondary group-data-[state=open]:inline">–</span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <nav aria-label={label} data-toc="inline" className="pb-4">
            <TocLinks headings={headings} activeId={activeId} onSelect={onSelect} />
          </nav>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <nav
      aria-label={label}
      data-toc="sidebar"
      className="sticky top-28 hidden max-h-[calc(100vh-8rem)] lg:block"
    >
      <p className="m-0 mb-3 text-xs font-medium tracking-[0.14em] text-secondary uppercase">
        {label}
      </p>
      <ScrollArea className="max-h-[calc(100vh-11rem)]">
        <TocLinks headings={headings} activeId={activeId} onSelect={onSelect} />
      </ScrollArea>
    </nav>
  );
}
