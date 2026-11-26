// Read / copy-on-write a value by a dotted path such as "sections.projects"; "" is the object itself.
export function getIn(obj: unknown, path: string): unknown {
  if (!path) return obj;
  return path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);
}

export function setIn<T>(obj: T, path: string, value: unknown): T {
  if (!path) return value as T;
  const [head, ...rest] = path.split(".");
  const src = obj as Record<string, unknown>;
  return { ...src, [head]: setIn(src[head], rest.join("."), value) } as T;
}

export const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
