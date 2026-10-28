import { setOpen } from "./command-store";

export async function go(href: string) {
  setOpen(false);
  const { navigate } = await import("astro:transitions/client");
  await navigate(href);
}
