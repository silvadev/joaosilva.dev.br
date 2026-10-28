import { defaultLang, ui, type Lang, type UIKey } from "./ui";

export type { Lang };

export type CommandPost = {
  lang: Lang;
  slug: string;
  title: string;
  description: string;
  translation: string | null;
};

export function getLangFromPath(pathname: string): Lang {
  const [, lang] = pathname.split("/");
  if (lang in ui) return lang as Lang;
  return defaultLang;
}

export function getLangFromUrl(url: URL): Lang {
  return getLangFromPath(url.pathname);
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function otherLang(lang: Lang): Lang {
  return lang === "pt" ? "en" : "pt";
}

export function localePath(
  pathname: string,
  target: Lang,
  posts: CommandPost[] = [],
) {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const match = normalized.match(/^\/(pt|en)(\/.*)?$/);
  const current = (match?.[1] as Lang | undefined) ?? defaultLang;
  const rest = match?.[2] ?? "";
  const postMatch = rest.match(/^\/idea\/(.+)$/);

  if (postMatch) {
    if (target === current) return normalized;
    const slug = decodeURIComponent(postMatch[1]);
    const entry = posts.find(
      (post) => post.lang === current && post.slug === slug,
    );
    if (entry?.translation) return `/${target}/idea/${entry.translation}`;
    return `/${target}/ideas`;
  }

  if (!rest) return `/${target}`;
  return `/${target}${rest}`;
}
