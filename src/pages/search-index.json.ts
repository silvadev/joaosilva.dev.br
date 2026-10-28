import { getCollection } from "astro:content";
import { postHref, postLang, postSlug } from "../lib/posts";

export async function GET() {
  const posts = (await getCollection("posts")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  const index = posts.map((post) => ({
    lang: postLang(post),
    slug: postSlug(post),
    href: postHref(post),
    title: post.data.title,
    description: post.data.description,
    date: post.data.date.toISOString(),
    body: (post.body ?? "")
      .replace(/---[\s\S]*?---/, "")
      .replace(/[#*`[\]()>_~|\\]/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  }));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
}
