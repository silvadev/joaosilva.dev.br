import { useEffect, useState } from "react";

type ShortcutCopy = {
  href: string;
  mobile: string;
  press: string;
  suffix: string;
};

type ShortcutErrorProps = {
  pt: ShortcutCopy;
  en: ShortcutCopy;
};

const linkClass =
  "inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 bg-transparent px-2.5 py-2 text-base leading-6 font-semibold text-primary no-underline hover:bg-hover hover:opacity-100 [&:hover_kbd]:bg-primary";

function isEnglishPath(pathname: string) {
  return pathname === "/en" || pathname.startsWith("/en/");
}

export function ShortcutError({ pt, en }: ShortcutErrorProps) {
  const [copy, setCopy] = useState<ShortcutCopy | null>(null);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setCopy(isEnglishPath(window.location.pathname) ? en : pt);
    setMobile(/iPhone|iPad|Android/i.test(navigator.userAgent));
  }, [en, pt]);

  if (!copy) return <div className="min-h-10" />;

  if (mobile) {
    return (
      <a href={copy.href} className={linkClass}>
        {copy.mobile}
      </a>
    );
  }

  return (
    <a href={copy.href} className={linkClass}>
      {copy.press} <kbd>G</kbd> <kbd>H</kbd> {copy.suffix}
    </a>
  );
}
