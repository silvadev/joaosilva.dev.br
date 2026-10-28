import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { postHref, postLang } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = (await getCollection("posts")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: "João Silva",
    description: "Learning and building cool things out there.",
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: postHref(post),
      customData: `<language>${postLang(post) === "pt" ? "pt-br" : "en"}</language>`,
    })),
  });
}
