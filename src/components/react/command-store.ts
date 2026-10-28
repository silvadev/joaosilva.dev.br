const STORE_KEY = "__jsCommandStore";

type Listener = (open: boolean) => void;

type Store = {
  open: boolean;
  listeners: Set<Listener>;
};

function store(): Store {
  const host = globalThis as typeof globalThis & { [STORE_KEY]?: Store };
  if (!host[STORE_KEY]) {
    host[STORE_KEY] = { open: false, listeners: new Set() };
  }
  return host[STORE_KEY];
}

export function getOpen() {
  return store().open;
}

export function setOpen(next: boolean) {
  const current = store();
  current.open = next;
  current.listeners.forEach((listener) => listener(next));
}

export function toggleOpen() {
  setOpen(!store().open);
}

export function subscribe(listener: Listener) {
  const current = store();
  current.listeners.add(listener);
  return () => {
    current.listeners.delete(listener);
  };
}
