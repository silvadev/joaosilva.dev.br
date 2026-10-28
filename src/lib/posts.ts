import { getCollection, type CollectionEntry } from "astro:content";
import type { CommandPost, Lang } from "../i18n/utils";

export type PostEntry = CollectionEntry<"posts">;

export function postLang(post: PostEntry): Lang {
  return post.id.startsWith("en/") ? "en" : "pt";
}

export function postSlug(post: PostEntry) {
  return post.id.split("/").slice(1).join("/");
}

export function postHref(post: PostEntry) {
  return `/${postLang(post)}/idea/${postSlug(post)}`;
}

export async function getPosts(lang: Lang) {
  const posts = await getCollection("posts");
  return posts
    .filter((post) => postLang(post) === lang)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getCommandPosts(): Promise<CommandPost[]> {
  const posts = await getCollection("posts");
  return posts.map((post) => ({
    lang: postLang(post),
    slug: postSlug(post),
    title: post.data.title,
    description: post.data.description,
    translation: post.data.translation ?? null,
  }));
}

export function readingLabel(body: string, lang: Lang) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return lang === "pt" ? `${minutes} min de leitura` : `${minutes} min read`;
}

export function formatPostDate(date: Date, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatIdeaDay(date: Date, lang: Lang) {
  const parts = new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", {
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).formatToParts(date);
  const month = parts.find((part) => part.type === "month")?.value.replace(".", "") ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const label = `${month.charAt(0).toUpperCase()}${month.slice(1)} ${day}`;
  return label;
}

export function plainText(body: string) {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~`>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLocalePaths() {
  return [{ params: { lang: "pt" } }, { params: { lang: "en" } }];
}
