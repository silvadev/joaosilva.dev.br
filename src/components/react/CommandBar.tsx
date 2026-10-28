import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Command } from "cmdk";
import { useEffect, useRef, useState } from "react";
import { ui } from "../../i18n/ui";
import {
  getLangFromPath,
  localePath,
  otherLang,
  type CommandPost,
} from "../../i18n/utils";
import { getOpen, setOpen, subscribe } from "./command-store";
import { Icon, type IconName } from "./icons";
import { go } from "./navigate";

type CommandBarProps = {
  initialPath: string;
  posts: CommandPost[];
};

type Action = {
  id: string;
  name: string;
  value: string;
  keys: string[];
  icon: IconName;
  run: () => void;
};

type ToastState = {
  title: string;
  description: string;
} | null;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
}

function classify(buffer: string[], sequences: string[]) {
  const joined = buffer.join(" ");
  if (sequences.includes(joined)) return "exact" as const;
  if (sequences.some((sequence) => sequence.startsWith(`${joined} `))) {
    return "prefix" as const;
  }
  return "none" as const;
}

function ShortcutKeys({ keys }: { keys: string[] }) {
  if (keys.length === 0) return null;
  return (
    <span className="grid grid-flow-col gap-1" aria-hidden="true">
      {keys.map((key) => (
        <kbd
          key={key}
          className="bg-white/10 px-2 py-1 text-secondary uppercase"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

function CommandRow({ action }: { action: Action }) {
  return (
    <Command.Item
      value={action.value}
      onSelect={() => action.run()}
      className="m-0 flex items-center justify-between px-4 py-3"
    >
      <span className="flex items-center gap-2">
        <Icon name={action.icon} className="size-5" />
        <span>{action.name}</span>
      </span>
      <ShortcutKeys keys={action.keys} />
    </Command.Item>
  );
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduce(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduce;
}

export function CommandBar({ initialPath, posts }: CommandBarProps) {
  const reduce = usePrefersReducedMotion();
  const [path, setPath] = useState(initialPath);
  const [open, setOpenState] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimer = useRef<number | null>(null);
  const actionsRef = useRef<Action[]>([]);
  const lang = getLangFromPath(path);
  const copy = ui[lang];
  const alternate = otherLang(lang);
  const visiblePosts = posts.filter((post) => post.lang === lang);

  async function copyLink() {
    const labels = ui[getLangFromPath(window.location.pathname)];
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({
        title: labels["command.copied"],
        description: labels["command.copiedDetail"],
      });
    } catch {
      setToast({
        title: labels["command.copyFailed"],
        description: labels["command.copyFailedDetail"],
      });
    }
    setOpen(false);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }

  const general: Action[] = [
    {
      id: "copy",
      name: copy["command.copy"],
      value: `${ui.pt["command.copy"]} ${ui.en["command.copy"]} copy link`,
      keys: ["l"],
      icon: "link",
      run: () => {
        void copyLink();
      },
    },
    {
      id: "search",
      name: copy["command.search"],
      value: `${ui.pt["command.search"]} ${ui.en["command.search"]} search`,
      keys: ["g", "s"],
      icon: "search",
      run: () => {
        void go(`/${lang}/search`);
      },
    },
    {
      id: "language",
      name: copy["command.language"],
      value: `${ui.pt["command.language"]} ${ui.en["command.language"]} language`,
      keys: ["g", "l"],
      icon: "language",
      run: () => {
        void go(localePath(path, alternate, posts));
      },
    },
  ];

  const destinations: Action[] = [
    {
      id: "home",
      name: copy["command.home"],
      value: `${ui.pt["command.home"]} ${ui.en["command.home"]} home`,
      keys: ["g", "h"],
      icon: "home",
      run: () => {
        void go(`/${lang}`);
      },
    },
    {
      id: "about",
      name: copy["command.about"],
      value: `${ui.pt["command.about"]} ${ui.en["command.about"]} about`,
      keys: ["g", "a"],
      icon: "about",
      run: () => {
        void go(`/${lang}/about`);
      },
    },
    {
      id: "articles",
      name: copy["command.articles"],
      value: `${ui.pt["command.articles"]} ${ui.en["command.articles"]} articles ideas ideias blog notes`,
      keys: ["g", "b"],
      icon: "articles",
      run: () => {
        void go(`/${lang}/ideas`);
      },
    },
  ];

  const postActions: Action[] = visiblePosts.map((post) => ({
    id: post.slug,
    name: post.title,
    value: `${post.title} ${post.description} ${post.slug}`,
    keys: [],
    icon: "articles" as const,
    run: () => {
      void go(`/${post.lang}/idea/${post.slug}`);
    },
  }));

  actionsRef.current = [...general, ...destinations];

  useEffect(() => {
    const sync = () => setPath(window.location.pathname);
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

  useEffect(() => {
    let buffer: string[] = [];
    let timer = 0;

    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(!getOpen());
        buffer = [];
        return;
      }

      if (getOpen() || isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (event.key.length !== 1) return;

      buffer = [...buffer, event.key.toLowerCase()];
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        buffer = [];
      }, 700);

      const sequences = actionsRef.current.map((action) => action.keys.join(" "));
      const status = classify(buffer, sequences);
      if (status === "prefix") return;

      if (status === "none") {
        buffer = [buffer[buffer.length - 1] ?? ""].filter(Boolean);
        if (classify(buffer, sequences) !== "exact") return;
      }

      const joined = buffer.join(" ");
      const action = actionsRef.current.find(
        (item) => item.keys.join(" ") === joined,
      );
      buffer = [];
      action?.run();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const motion = reduce
    ? ""
    : "data-[state=open]:animate-overlay-show data-[state=closed]:animate-overlay-hide";
  const contentMotion = reduce
    ? ""
    : "data-[state=open]:animate-content-show data-[state=closed]:animate-content-hide";

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={`fixed inset-0 z-50 bg-black/80 ${motion}`} />
          <Dialog.Content
            id="command-menu"
            className={`command-menu fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-150 -translate-x-1/2 -translate-y-1/2 outline-none ${contentMotion}`}
          >
            <VisuallyHidden asChild>
              <Dialog.Title>{copy["command.title"]}</Dialog.Title>
            </VisuallyHidden>
            <VisuallyHidden asChild>
              <Dialog.Description>{copy["command.placeholder"]}</Dialog.Description>
            </VisuallyHidden>
            <Command
              label={copy["command.title"]}
              loop
              vimBindings={false}
              className="w-full rounded-lg bg-command shadow-lg backdrop-blur-xl"
            >
              <Command.Input
                placeholder={copy["command.placeholder"]}
                className="m-0 w-full rounded-t-lg border-0 bg-transparent px-4 py-3 text-base text-primary outline-none placeholder:text-secondary"
              />
              <Command.List className="max-h-100 overflow-auto rounded-b-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <Command.Empty className="px-4 py-3 text-center text-sm text-secondary">
                  {copy["command.empty"]}
                </Command.Empty>
                <Command.Group heading={copy["command.general"]}>
                  {general.map((action) => (
                    <CommandRow key={action.id} action={action} />
                  ))}
                </Command.Group>
                <Command.Group heading={copy["command.goto"]}>
                  {destinations.map((action) => (
                    <CommandRow key={action.id} action={action} />
                  ))}
                </Command.Group>
                {postActions.length > 0 ? (
                  <Command.Group heading={copy["command.posts"]}>
                    {postActions.map((action) => (
                      <CommandRow key={action.id} action={action} />
                    ))}
                  </Command.Group>
                ) : null}
              </Command.List>
            </Command>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {toast ? (
        <div
          role="status"
          className="animate-toast-in fixed right-5 bottom-5 z-50 rounded border border-white/10 bg-hover px-4 py-3 text-sm shadow-lg"
        >
          <p className="m-0 leading-7 text-primary">{toast.title}</p>
          <p className="m-0 -mt-1 leading-7 text-secondary">{toast.description}</p>
        </div>
      ) : null}
    </>
  );
}
