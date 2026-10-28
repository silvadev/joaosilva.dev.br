import { useEffect, useState } from "react";
import { toggleOpen } from "./command-store";

type Platform = "mac" | "other" | "mobile";

type ShortcutHomeProps = {
  press: string;
  suffix: string;
  mobile: string;
  mac1: string;
  mac2: string;
  other1: string;
  other2: string;
};

function detectPlatform(): Platform {
  const agent = navigator.userAgent;
  if (/iPhone|iPad|Android/i.test(agent)) return "mobile";
  if (/Mac/i.test(agent)) return "mac";
  return "other";
}

export function ShortcutHome(props: ShortcutHomeProps) {
  const [platform, setPlatform] = useState<Platform | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  if (!platform) return <div className="min-h-10" />;

  if (platform === "mobile") {
    return (
      <button
        type="button"
        onClick={() => toggleOpen()}
        className="-ml-2.5 inline-flex cursor-pointer items-center rounded-lg border-0 bg-transparent px-2.5 py-2 text-base leading-6 font-semibold text-primary hover:bg-hover hover:opacity-100"
      >
        {props.mobile}
      </button>
    );
  }

  const key1 = platform === "mac" ? props.mac1 : props.other1;
  const key2 = platform === "mac" ? props.mac2 : props.other2;

  return (
    <button
      type="button"
      onClick={() => toggleOpen()}
      className="-ml-2.5 inline-flex cursor-pointer items-center gap-1 rounded-lg border-0 bg-transparent px-2.5 py-2 text-base leading-6 font-semibold text-primary hover:bg-hover hover:opacity-100 [&:hover_kbd]:bg-primary"
    >
      {props.press} <kbd>{key1}</kbd> <kbd>{key2}</kbd> {props.suffix}
    </button>
  );
}
