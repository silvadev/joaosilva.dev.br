import { useEffect, useState } from "react";
import { ui, type Lang } from "../../i18n/ui";
import {
  getLangFromPath,
  localePath,
  otherLang,
  type CommandPost,
} from "../../i18n/utils";
import { getOpen, subscribe, toggleOpen } from "./command-store";
import { HoverAnimation } from "./HoverAnimation";
import { Icon } from "./icons";

const PAGES = [
  { href: "/about", key: "nav.about" },
  { href: "/ideas", key: "nav.articles" },
] as const;

type NavbarProps = {
  initialPath: string;
  posts: CommandPost[];
};

function isActive(pathname: string, href: string) {
  const rest = pathname.replace(/^\/(pt|en)/, "") || "/";
  if (href === "/ideas") {
    return rest === "/ideas" || rest.startsWith("/idea/");
  }
  return rest === href || rest.startsWith(`${href}/`);
}

export function Navbar({ initialPath, posts }: NavbarProps) {
  const [path, setPath] = useState(initialPath);
  const [open, setOpenState] = useState(false);
  const lang = getLangFromPath(path);
  const copy = ui[lang];
  const next = otherLang(lang);

  useEffect(() => {
    const sync = () => {
      const nextPath = window.location.pathname;
      setPath(nextPath);
      const nextLang: Lang = getLangFromPath(nextPath);
      document.documentElement.lang = nextLang === "en" ? "en" : "pt";
    };
    document.addEventListener("astro:after-swap", sync);
    document.addEventListener("astro:page-load", sync);
    return () => {
      document.removeEventListener("astro:after-swap", sync);
      document.removeEventListener("astro:page-load", sync);
    };
  }, []);

  useEffect(() => {
    setOpenState(getOpen());
    return subscribe(setOpenState);
  }, []);

  return (
    <header className="absolute top-0 z-30 mt-3.25 flex min-h-14.75 w-full flex-wrap items-center text-xs text-primary lg:mt-0">
      <a
        href={`/${lang}`}
        aria-label={copy["nav.home"]}
        className="ml-3 flex h-8.5 cursor-pointer appearance-none items-center rounded-lg border-0 bg-transparent px-2.5 font-display text-[2rem] leading-none font-extrabold text-primary no-underline transition-all duration-300 ease-in-out hover:bg-hover hover:opacity-100"
      >
        <span className="translate-y-0.25">JS</span>
      </a>
      <nav className="order-2 basis-full overflow-x-auto text-center [scrollbar-width:none] lg:order-0 lg:basis-auto lg:flex-1 [&::-webkit-scrollbar]:hidden">
        <ul className="relative m-0 inline-flex list-none p-0 lg:top-1.25">
          {PAGES.map((page) => {
            const active = isActive(path, page.href);
            return (
              <li key={page.href} className="relative">
                <HoverAnimation
                  id={page.href}
                  layoutId="nav"
                  backgroundClassName="top-1/2 right-0 left-0 -translate-y-1/2 p-5"
                >
                  <a
                    href={`/${lang}${page.href}`}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-block cursor-pointer border-0 px-5 py-3 text-xs font-medium tracking-[.075rem] uppercase no-underline transition-all duration-300 ease-in-out after:absolute after:bottom-1.5 after:left-1/2 after:block after:h-px after:w-5 after:-translate-x-1/2 after:bg-primary after:transition-all after:duration-300 after:content-[''] hover:text-primary hover:opacity-100 focus:opacity-100 ${active ? "text-primary after:opacity-100" : "text-secondary after:opacity-0"}`}
                  >
                    {copy[page.key]}
                  </a>
                </HoverAnimation>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mr-3 ml-auto flex items-center">
        <div
          role="group"
          aria-label={copy["nav.language"]}
          className="mr-1 flex items-center gap-1"
        >
          {lang === "pt" ? (
            <span className="px-1.5 text-xs font-medium tracking-[.075rem] text-primary uppercase">
              pt
            </span>
          ) : (
            <a
              href={localePath(path, "pt", posts)}
              hrefLang="pt"
              lang="pt"
              className="border-0 px-1.5 text-xs font-medium tracking-[.075rem] text-secondary uppercase no-underline hover:text-primary hover:opacity-100"
            >
              pt
            </a>
          )}
          {lang === "en" ? (
            <span className="px-1.5 text-xs font-medium tracking-[.075rem] text-primary uppercase">
              en
            </span>
          ) : (
            <a
              href={localePath(path, next, posts)}
              hrefLang="en"
              lang="en"
              className="border-0 px-1.5 text-xs font-medium tracking-[.075rem] text-secondary uppercase no-underline hover:text-primary hover:opacity-100"
            >
              en
            </a>
          )}
        </div>
        <button
          type="button"
          aria-label={copy["nav.command"]}
          aria-expanded={open}
          aria-controls="command-menu"
          onClick={() => toggleOpen()}
          className="h-8.5 cursor-pointer appearance-none rounded-lg border-0 bg-transparent px-2 text-primary transition-all duration-300 ease-in-out hover:bg-hover"
        >
          <Icon name="command" className="size-6" />
        </button>
      </div>
    </header>
  );
}
